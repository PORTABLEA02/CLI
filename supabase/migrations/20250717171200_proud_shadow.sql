/*
  # Création de la table des consultations

  1. Nouvelles Tables
    - `consultations`
      - `id` (uuid, primary key)
      - `patient_id` (uuid, foreign key vers patients)
      - `doctor_id` (uuid, foreign key vers profiles)
      - `date` (date, date de la consultation)
      - `time` (time, heure de la consultation)
      - `type` (enum, type de consultation)
      - `status` (enum, statut de la consultation)
      - `symptoms` (text, symptômes)
      - `diagnosis` (text, diagnostic)
      - `notes` (text, notes)
      - `duration` (integer, durée en minutes)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Sécurité
    - Enable RLS sur `consultations`
    - Politiques selon les rôles
*/

-- Types enum pour les consultations
CREATE TYPE consultation_type AS ENUM ('general', 'specialist', 'emergency', 'followup');
CREATE TYPE consultation_status AS ENUM ('scheduled', 'in-progress', 'completed', 'cancelled');

-- Créer la table consultations
CREATE TABLE IF NOT EXISTS consultations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date date NOT NULL,
  time time NOT NULL,
  type consultation_type NOT NULL DEFAULT 'general',
  status consultation_status NOT NULL DEFAULT 'scheduled',
  symptoms text NOT NULL,
  diagnosis text,
  notes text,
  duration integer NOT NULL DEFAULT 30,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Activer RLS
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

-- Politique pour lire toutes les consultations (utilisateurs authentifiés)
CREATE POLICY "Authenticated users can read consultations"
  ON consultations FOR SELECT TO authenticated USING (true);

-- Politique pour que les médecins puissent gérer leurs consultations
CREATE POLICY "Doctors can manage their consultations"
  ON consultations FOR ALL TO authenticated
  USING (
    doctor_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Politique pour l'insertion (médecins et admins)
CREATE POLICY "Doctors and admins can insert consultations"
  ON consultations FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('doctor', 'admin'))
  );

-- Trigger pour updated_at
CREATE TRIGGER update_consultations_updated_at
  BEFORE UPDATE ON consultations FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_consultations_patient_id ON consultations(patient_id);
CREATE INDEX IF NOT EXISTS idx_consultations_doctor_id ON consultations(doctor_id);
CREATE INDEX IF NOT EXISTS idx_consultations_date ON consultations(date);
CREATE INDEX IF NOT EXISTS idx_consultations_status ON consultations(status);

-- Données de démonstration
INSERT INTO consultations (patient_id, doctor_id, date, time, type, status, symptoms, diagnosis, duration)
SELECT 
  p.id,
  '550e8400-e29b-41d4-a716-446655440002', -- Dr. Michael Chen
  CURRENT_DATE - INTERVAL '1 day',
  '09:00',
  'general',
  'completed',
  'Maux de tête persistants depuis 3 jours',
  'Céphalées de tension',
  30
FROM patients p
LIMIT 1
ON CONFLICT DO NOTHING;