/*
  # Create medical cares table

  1. New Tables
    - `medical_cares`
      - `id` (uuid, primary key)
      - `name` (text) - Name of the medical care
      - `description` (text) - Description of the care
      - `category` (enum) - Category: nursing, injection, examination, procedure, therapy, other
      - `unit_price` (decimal) - Price per unit
      - `duration` (integer, optional) - Duration in minutes
      - `requires_doctor` (boolean) - Whether a doctor is required
      - `is_active` (boolean) - Whether the care is active
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `medical_cares` table
    - Add policies for authenticated users to read
    - Add policies for admins to manage
*/

-- Create enum for medical care categories
CREATE TYPE medical_care_category AS ENUM ('nursing', 'injection', 'examination', 'procedure', 'therapy', 'other');

-- Create medical_cares table
CREATE TABLE IF NOT EXISTS medical_cares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  category medical_care_category NOT NULL DEFAULT 'other',
  unit_price decimal(10,2) NOT NULL DEFAULT 0,
  duration integer,
  requires_doctor boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE medical_cares ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can read medical cares"
  ON medical_cares
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert medical cares"
  ON medical_cares
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update medical cares"
  ON medical_cares
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete medical cares"
  ON medical_cares
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_medical_cares_name ON medical_cares(name);
CREATE INDEX IF NOT EXISTS idx_medical_cares_category ON medical_cares(category);
CREATE INDEX IF NOT EXISTS idx_medical_cares_is_active ON medical_cares(is_active);

-- Create trigger for medical_cares table
CREATE TRIGGER update_medical_cares_updated_at
  BEFORE UPDATE ON medical_cares
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();