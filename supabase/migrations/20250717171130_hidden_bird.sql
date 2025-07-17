/*
  # Création des tables médicales (soins, médicaments, examens, fournitures)

  1. Nouvelles Tables
    - `medical_cares` (soins et actes médicaux)
    - `medications` (médicaments)
    - `medical_exams` (examens médicaux)
    - `medical_supplies` (fournitures médicales)

  2. Sécurité
    - Enable RLS sur toutes les tables
    - Politiques appropriées selon les rôles
*/

-- Types enum pour les catégories
CREATE TYPE care_category AS ENUM ('nursing', 'injection', 'examination', 'procedure', 'therapy', 'other');
CREATE TYPE medication_form AS ENUM ('tablet', 'syrup', 'injection', 'capsule', 'cream', 'drops', 'inhaler', 'patch');
CREATE TYPE medication_category AS ENUM ('antibiotic', 'analgesic', 'antiviral', 'cardiovascular', 'respiratory', 'digestive', 'neurological', 'other');
CREATE TYPE exam_category AS ENUM ('radiology', 'laboratory', 'cardiology', 'ultrasound', 'endoscopy', 'other');
CREATE TYPE supply_category AS ENUM ('disposable', 'equipment', 'consumable', 'instrument', 'protective', 'other');

-- Table medical_cares
CREATE TABLE IF NOT EXISTS medical_cares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  category care_category NOT NULL DEFAULT 'other',
  unit_price decimal(10,2) NOT NULL DEFAULT 0,
  duration integer, -- en minutes
  requires_doctor boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table medications
CREATE TABLE IF NOT EXISTS medications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  generic_name text,
  form medication_form NOT NULL DEFAULT 'tablet',
  strength text NOT NULL,
  manufacturer text,
  unit_price decimal(10,2) NOT NULL DEFAULT 0,
  stock_quantity integer DEFAULT 0,
  is_active boolean DEFAULT true,
  category medication_category NOT NULL DEFAULT 'other',
  requires_prescription boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table medical_exams
CREATE TABLE IF NOT EXISTS medical_exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  category exam_category NOT NULL DEFAULT 'other',
  unit_price decimal(10,2) NOT NULL DEFAULT 0,
  duration integer, -- en minutes
  preparation_instructions text,
  is_active boolean DEFAULT true,
  requires_appointment boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table medical_supplies
CREATE TABLE IF NOT EXISTS medical_supplies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  category supply_category NOT NULL DEFAULT 'other',
  sub_category text,
  unit_price decimal(10,2) NOT NULL DEFAULT 0,
  stock_quantity integer NOT NULL DEFAULT 0,
  min_stock_level integer NOT NULL DEFAULT 0,
  supplier text,
  reference text,
  expiration_date date,
  is_active boolean DEFAULT true,
  requires_doctor boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Activer RLS sur toutes les tables
ALTER TABLE medical_cares ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_supplies ENABLE ROW LEVEL SECURITY;

-- Politiques pour medical_cares
CREATE POLICY "Authenticated users can read medical_cares"
  ON medical_cares FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage medical_cares"
  ON medical_cares FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Politiques pour medications
CREATE POLICY "Authenticated users can read medications"
  ON medications FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage medications"
  ON medications FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Politiques pour medical_exams
CREATE POLICY "Authenticated users can read medical_exams"
  ON medical_exams FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage medical_exams"
  ON medical_exams FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Politiques pour medical_supplies
CREATE POLICY "Authenticated users can read medical_supplies"
  ON medical_supplies FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage medical_supplies"
  ON medical_supplies FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Triggers pour updated_at
CREATE TRIGGER update_medical_cares_updated_at
  BEFORE UPDATE ON medical_cares FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medications_updated_at
  BEFORE UPDATE ON medications FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medical_exams_updated_at
  BEFORE UPDATE ON medical_exams FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medical_supplies_updated_at
  BEFORE UPDATE ON medical_supplies FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Données de démonstration pour medical_cares
INSERT INTO medical_cares (name, description, category, unit_price, duration, requires_doctor) VALUES
  ('Pansement simple', 'Application d''un pansement sur une plaie mineure', 'nursing', 15.00, 10, false),
  ('Injection intramusculaire', 'Administration d''un médicament par voie intramusculaire', 'injection', 25.00, 5, true),
  ('Prise de tension', 'Mesure de la tension artérielle', 'examination', 10.00, 5, false),
  ('Perfusion intraveineuse', 'Mise en place et surveillance d''une perfusion', 'procedure', 45.00, 30, true),
  ('Séance de kinésithérapie', 'Séance de rééducation fonctionnelle', 'therapy', 60.00, 45, false)
ON CONFLICT DO NOTHING;

-- Données de démonstration pour medications
INSERT INTO medications (name, generic_name, form, strength, manufacturer, unit_price, category, requires_prescription) VALUES
  ('Doliprane', 'Paracétamol', 'tablet', '500mg', 'Sanofi', 3.50, 'analgesic', false),
  ('Amoxicilline', 'Amoxicilline', 'capsule', '500mg', 'Mylan', 8.90, 'antibiotic', true),
  ('Ventoline', 'Salbutamol', 'inhaler', '100µg', 'GSK', 12.50, 'respiratory', true),
  ('Aspégic', 'Aspirine', 'tablet', '100mg', 'Sanofi', 4.20, 'cardiovascular', true),
  ('Smecta', 'Diosmectite', 'syrup', '3g', 'Ipsen', 6.80, 'digestive', false)
ON CONFLICT DO NOTHING;

-- Données de démonstration pour medical_exams
INSERT INTO medical_exams (name, description, category, unit_price, duration, requires_appointment) VALUES
  ('Radiographie thoracique', 'Examen radiologique du thorax', 'radiology', 45.00, 15, true),
  ('Échographie abdominale', 'Examen échographique de l''abdomen', 'ultrasound', 80.00, 30, true),
  ('Électrocardiogramme', 'Enregistrement de l''activité électrique du cœur', 'cardiology', 35.00, 15, false),
  ('Prise de sang', 'Prélèvement sanguin pour analyses', 'laboratory', 25.00, 10, false),
  ('Endoscopie digestive', 'Examen endoscopique du tube digestif', 'endoscopy', 150.00, 45, true)
ON CONFLICT DO NOTHING;

-- Données de démonstration pour medical_supplies
INSERT INTO medical_supplies (name, description, category, sub_category, unit_price, stock_quantity, min_stock_level, supplier) VALUES
  ('Seringue 10ml', 'Seringue jetable stérile 10ml', 'disposable', 'syringe', 0.50, 500, 50, 'MedSupply'),
  ('Gants latex M', 'Gants d''examen en latex taille M', 'protective', 'gloves', 0.15, 1000, 100, 'SafetyFirst'),
  ('Compresses stériles', 'Compresses de gaze stériles 10x10cm', 'consumable', 'gauze', 0.25, 200, 20, 'MedCare'),
  ('Cathéter urinaire', 'Cathéter urinaire stérile CH16', 'disposable', 'catheter', 8.50, 50, 10, 'UroMed'),
  ('Tensiomètre', 'Tensiomètre électronique automatique', 'equipment', 'monitor', 120.00, 5, 2, 'MedTech')
ON CONFLICT DO NOTHING;