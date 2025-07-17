/*
  # Create prescriptions table

  1. New Tables
    - `prescriptions`
      - `id` (uuid, primary key)
      - `consultation_id` (uuid, foreign key) - Reference to consultations table
      - `patient_id` (uuid, foreign key) - Reference to patients table
      - `doctor_id` (uuid, foreign key) - Reference to profiles table
      - `items` (jsonb) - Array of prescription items
      - `instructions` (text) - General instructions
      - `status` (enum) - Status: active, completed, cancelled, billed
      - `created_at` (timestamptz) - Creation timestamp
      - `valid_until` (date) - Validity date
      - `billed_at` (timestamptz, optional) - Billing timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `prescriptions` table
    - Add policies for doctors to manage their prescriptions
    - Add policies for authenticated users to read
*/

-- Create enum for prescription status
CREATE TYPE prescription_status AS ENUM ('active', 'completed', 'cancelled', 'billed');

-- Create prescriptions table
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

-- Enable Row Level Security
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can read prescriptions"
  ON prescriptions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Doctors can insert their prescriptions"
  ON prescriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    doctor_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Doctors can update their prescriptions"
  ON prescriptions
  FOR UPDATE
  TO authenticated
  USING (
    doctor_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete prescriptions"
  ON prescriptions
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_prescriptions_consultation_id ON prescriptions(consultation_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor_id ON prescriptions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_status ON prescriptions(status);
CREATE INDEX IF NOT EXISTS idx_prescriptions_valid_until ON prescriptions(valid_until);

-- Create trigger for prescriptions table
CREATE TRIGGER update_prescriptions_updated_at
  BEFORE UPDATE ON prescriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();