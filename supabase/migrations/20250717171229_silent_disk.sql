/*
  # Création des tables de facturation et paiements

  1. Nouvelles Tables
    - `invoices` (factures)
    - `payments` (paiements)

  2. Sécurité
    - Enable RLS sur toutes les tables
    - Politiques selon les rôles
*/

-- Types enum pour les factures et paiements
CREATE TYPE invoice_status AS ENUM ('pending', 'paid', 'overdue');
CREATE TYPE payment_method AS ENUM ('cash', 'mobile_money', 'bank_transfer', 'card');

-- Table invoices
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  consultation_id uuid NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
  prescription_id uuid REFERENCES prescriptions(id) ON DELETE SET NULL,
  items jsonb NOT NULL DEFAULT '[]',
  subtotal decimal(10,2) NOT NULL DEFAULT 0,
  tax decimal(10,2) NOT NULL DEFAULT 0,
  total decimal(10,2) NOT NULL DEFAULT 0,
  status invoice_status NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  due_date date NOT NULL,
  paid_at timestamptz,
  payment_method payment_method,
  payment_reference text,
  cashier_id uuid REFERENCES profiles(id)
);

-- Table payments
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  amount decimal(10,2) NOT NULL,
  method payment_method NOT NULL,
  reference text,
  notes text,
  cashier_id uuid NOT NULL REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- Activer RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Politiques pour invoices
CREATE POLICY "Authenticated users can read invoices"
  ON invoices FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and cashiers can manage invoices"
  ON invoices FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'cashier'))
  );

-- Politiques pour payments
CREATE POLICY "Authenticated users can read payments"
  ON payments FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and cashiers can manage payments"
  ON payments FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'cashier'))
  );

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_invoices_patient_id ON invoices(patient_id);
CREATE INDEX IF NOT EXISTS idx_invoices_consultation_id ON invoices(consultation_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at);
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_cashier_id ON payments(cashier_id);

-- Contraintes pour s'assurer de la cohérence des montants
ALTER TABLE invoices 
ADD CONSTRAINT check_invoice_total 
CHECK (total = subtotal + tax);

ALTER TABLE invoices 
ADD CONSTRAINT check_invoice_amounts_positive 
CHECK (subtotal >= 0 AND tax >= 0 AND total >= 0);

ALTER TABLE payments 
ADD CONSTRAINT check_payment_amount_positive 
CHECK (amount > 0);

-- Fonction pour mettre à jour automatiquement le statut des factures
CREATE OR REPLACE FUNCTION update_invoice_status_on_payment()
RETURNS TRIGGER AS $$
BEGIN
  -- Marquer la facture comme payée
  UPDATE invoices 
  SET 
    status = 'paid',
    paid_at = NEW.created_at,
    payment_method = NEW.method,
    payment_reference = NEW.reference,
    cashier_id = NEW.cashier_id
  WHERE id = NEW.invoice_id;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour mettre à jour le statut des factures lors d'un paiement
CREATE TRIGGER update_invoice_on_payment
  AFTER INSERT ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_invoice_status_on_payment();