/*
  # Création de la table des prescriptions

  1. Nouvelles Tables
    - `prescriptions`
      - `id` (uuid, primary key)
      - `consultation_id` (uuid, foreign key vers consultations)
      - `patient_id` (uuid, foreign key vers patients)
      - `doctor_id` (uuid, foreign key vers profiles)
      - `items` (jsonb, éléments de la prescription)
      - `instructions` (text, instructions générales)
      - `status` (enum, statut de la prescription)
      - `created_at` (timestamptz)
      - `valid_until` (date, date de validité)
      - `billed_at` (timestamptz, date de facturation)
      - `updated_at` (timestamptz)

  2. Sécurité
    - Enable RLS sur `prescriptions`
    - Politiques selon les rôles
*/

-- Type enum pour le statut des prescriptions
CREATE TYPE prescription_status AS ENUM ('active', 'completed', 'cancelled', 'billed');

-- Créer la table prescriptions
CREATE TABLE IF NOT EXISTS prescriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id uuid NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  items jsonb NOT NULL DEFAULT '[]',
  instructions text NOT NULL DEFAULT '',
  status prescription_status NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  valid_until date NOT NULL,
  billed_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

-- Activer RLS
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;

-- Politique pour lire toutes les prescriptions (utilisateurs authentifiés)
CREATE POLICY "Authenticated users can read prescriptions"
  ON prescriptions FOR SELECT TO authenticated USING (true);

-- Politique pour que les médecins puissent gérer leurs prescriptions
CREATE POLICY "Doctors can manage their prescriptions"
  ON prescriptions FOR ALL TO authenticated
  USING (
    doctor_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'cashier'))
  );

-- Politique pour l'insertion (médecins seulement)
CREATE POLICY "Doctors can insert prescriptions"
  ON prescriptions FOR INSERT TO authenticated
  WITH CHECK (
    doctor_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Trigger pour updated_at
CREATE TRIGGER update_prescriptions_updated_at
  BEFORE UPDATE ON prescriptions FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_prescriptions_consultation_id ON prescriptions(consultation_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor_id ON prescriptions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_status ON prescriptions(status);
CREATE INDEX IF NOT EXISTS idx_prescriptions_valid_until ON prescriptions(valid_until);

-- Contrainte pour s'assurer que valid_until est dans le futur lors de la création
ALTER TABLE prescriptions 
ADD CONSTRAINT check_valid_until_future 
CHECK (valid_until > CURRENT_DATE);