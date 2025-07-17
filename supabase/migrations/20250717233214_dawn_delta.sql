/*
  # Create consultation supplies table

  1. New Tables
    - `consultation_supplies`
      - `id` (uuid, primary key)
      - `consultation_id` (uuid, foreign key) - Reference to consultations table
      - `supply_id` (uuid, foreign key) - Reference to medical_supplies table
      - `quantity` (integer) - Quantity of supply used
      - `unit_price` (decimal) - Price per unit at time of use
      - `total_price` (decimal) - Total price for this supply
      - `notes` (text, optional) - Additional notes
      - `used_by` (uuid, foreign key) - Reference to profiles table
      - `used_at` (timestamptz) - When the supply was used
      - `created_at` (timestamptz) - Creation timestamp

  2. Security
    - Enable RLS on `consultation_supplies` table
    - Add policies for authenticated users to read
    - Add policies for doctors to manage
*/

-- Create consultation_supplies table
CREATE TABLE IF NOT EXISTS consultation_supplies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id uuid NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
  supply_id uuid NOT NULL REFERENCES medical_supplies(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  unit_price decimal(10,2) NOT NULL DEFAULT 0,
  total_price decimal(10,2) NOT NULL DEFAULT 0,
  notes text,
  used_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  used_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE consultation_supplies ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can read consultation supplies"
  ON consultation_supplies
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Doctors can insert consultation supplies"
  ON consultation_supplies
  FOR INSERT
  TO authenticated
  WITH CHECK (
    used_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Doctors can update their consultation supplies"
  ON consultation_supplies
  FOR UPDATE
  TO authenticated
  USING (
    used_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Doctors can delete their consultation supplies"
  ON consultation_supplies
  FOR DELETE
  TO authenticated
  USING (
    used_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_consultation_supplies_consultation_id ON consultation_supplies(consultation_id);
CREATE INDEX IF NOT EXISTS idx_consultation_supplies_supply_id ON consultation_supplies(supply_id);
CREATE INDEX IF NOT EXISTS idx_consultation_supplies_used_by ON consultation_supplies(used_by);
CREATE INDEX IF NOT EXISTS idx_consultation_supplies_used_at ON consultation_supplies(used_at);