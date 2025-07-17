/*
  # Création des tables de relations pour les consultations

  1. Nouvelles Tables
    - `consultation_cares` (soins réalisés pendant les consultations)
    - `consultation_supplies` (fournitures utilisées pendant les consultations)

  2. Sécurité
    - Enable RLS sur toutes les tables
    - Politiques appropriées selon les rôles
*/

-- Table consultation_cares
CREATE TABLE IF NOT EXISTS consultation_cares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id uuid NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
  care_id uuid NOT NULL REFERENCES medical_cares(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  unit_price decimal(10,2) NOT NULL,
  total_price decimal(10,2) NOT NULL,
  notes text,
  performed_by uuid NOT NULL REFERENCES profiles(id),
  performed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Table consultation_supplies
CREATE TABLE IF NOT EXISTS consultation_supplies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id uuid NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
  supply_id uuid NOT NULL REFERENCES medical_supplies(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  unit_price decimal(10,2) NOT NULL,
  total_price decimal(10,2) NOT NULL,
  notes text,
  used_by uuid NOT NULL REFERENCES profiles(id),
  used_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Activer RLS
ALTER TABLE consultation_cares ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_supplies ENABLE ROW LEVEL SECURITY;

-- Politiques pour consultation_cares
CREATE POLICY "Authenticated users can read consultation_cares"
  ON consultation_cares FOR SELECT TO authenticated USING (true);

CREATE POLICY "Medical staff can manage consultation_cares"
  ON consultation_cares FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'doctor'))
  );

-- Politiques pour consultation_supplies
CREATE POLICY "Authenticated users can read consultation_supplies"
  ON consultation_supplies FOR SELECT TO authenticated USING (true);

CREATE POLICY "Medical staff can manage consultation_supplies"
  ON consultation_supplies FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'doctor'))
  );

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_consultation_cares_consultation_id ON consultation_cares(consultation_id);
CREATE INDEX IF NOT EXISTS idx_consultation_cares_care_id ON consultation_cares(care_id);
CREATE INDEX IF NOT EXISTS idx_consultation_supplies_consultation_id ON consultation_supplies(consultation_id);
CREATE INDEX IF NOT EXISTS idx_consultation_supplies_supply_id ON consultation_supplies(supply_id);

-- Contraintes pour s'assurer que les prix sont cohérents
ALTER TABLE consultation_cares 
ADD CONSTRAINT check_consultation_cares_total_price 
CHECK (total_price = quantity * unit_price);

ALTER TABLE consultation_supplies 
ADD CONSTRAINT check_consultation_supplies_total_price 
CHECK (total_price = quantity * unit_price);