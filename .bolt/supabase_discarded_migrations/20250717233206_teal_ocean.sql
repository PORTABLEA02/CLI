/*
  # Create consultation cares table

  1. New Tables
    - `consultation_cares`
      - `id` (uuid, primary key)
      - `consultation_id` (uuid, foreign key) - Reference to consultations table
      - `care_id` (uuid, foreign key) - Reference to medical_cares table
      - `quantity` (integer) - Quantity of care provided
      - `unit_price` (decimal) - Price per unit at time of service
      - `total_price` (decimal) - Total price for this care
      - `notes` (text, optional) - Additional notes
      - `performed_by` (uuid, foreign key) - Reference to profiles table
      - `performed_at` (timestamptz) - When the care was performed
      - `created_at` (timestamptz) - Creation timestamp

  2. Security
    - Enable RLS on `consultation_cares` table
    - Add policies for authenticated users to read
    - Add policies for doctors to manage
*/

-- Create consultation_cares table
CREATE TABLE IF NOT EXISTS consultation_cares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id uuid NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
  care_id uuid NOT NULL REFERENCES medical_cares(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  unit_price decimal(10,2) NOT NULL DEFAULT 0,
  total_price decimal(10,2) NOT NULL DEFAULT 0,
  notes text,
  performed_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  performed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE consultation_cares ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can read consultation cares"
  ON consultation_cares
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Doctors can insert consultation cares"
  ON consultation_cares
  FOR INSERT
  TO authenticated
  WITH CHECK (
    performed_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Doctors can update their consultation cares"
  ON consultation_cares
  FOR UPDATE
  TO authenticated
  USING (
    performed_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Doctors can delete their consultation cares"
  ON consultation_cares
  FOR DELETE
  TO authenticated
  USING (
    performed_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_consultation_cares_consultation_id ON consultation_cares(consultation_id);
CREATE INDEX IF NOT EXISTS idx_consultation_cares_care_id ON consultation_cares(care_id);
CREATE INDEX IF NOT EXISTS idx_consultation_cares_performed_by ON consultation_cares(performed_by);
CREATE INDEX IF NOT EXISTS idx_consultation_cares_performed_at ON consultation_cares(performed_at);