/*
  # Create consultations table

  1. New Tables
    - `consultations`
      - `id` (uuid, primary key)
      - `patient_id` (uuid, foreign key) - Reference to patients table
      - `doctor_id` (uuid, foreign key) - Reference to profiles table
      - `date` (date) - Consultation date
      - `time` (time) - Consultation time
      - `type` (enum) - Consultation type: general, specialist, emergency, followup
      - `status` (enum) - Status: scheduled, in-progress, completed, cancelled
      - `symptoms` (text) - Patient symptoms
      - `diagnosis` (text, optional) - Medical diagnosis
      - `notes` (text, optional) - Additional notes
      - `duration` (integer) - Duration in minutes
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `consultations` table
    - Add policies for doctors to manage their consultations
    - Add policies for admins to manage all consultations
*/

-- Create enums for consultation types and status
CREATE TYPE consultation_type AS ENUM ('general', 'specialist', 'emergency', 'followup');
CREATE TYPE consultation_status AS ENUM ('scheduled', 'in-progress', 'completed', 'cancelled');

-- Create consultations table
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

-- Enable Row Level Security
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can read consultations"
  ON consultations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Doctors can insert their consultations"
  ON consultations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    doctor_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Doctors can update their consultations"
  ON consultations
  FOR UPDATE
  TO authenticated
  USING (
    doctor_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete consultations"
  ON consultations
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_consultations_patient_id ON consultations(patient_id);
CREATE INDEX IF NOT EXISTS idx_consultations_doctor_id ON consultations(doctor_id);
CREATE INDEX IF NOT EXISTS idx_consultations_date ON consultations(date);
CREATE INDEX IF NOT EXISTS idx_consultations_status ON consultations(status);
CREATE INDEX IF NOT EXISTS idx_consultations_type ON consultations(type);

-- Create trigger for consultations table
CREATE TRIGGER update_consultations_updated_at
  BEFORE UPDATE ON consultations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();