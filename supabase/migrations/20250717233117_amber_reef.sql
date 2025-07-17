/*
  # Create medications table

  1. New Tables
    - `medications`
      - `id` (uuid, primary key)
      - `name` (text) - Commercial name
      - `generic_name` (text, optional) - Generic name
      - `form` (enum) - Form: tablet, syrup, injection, capsule, cream, drops, inhaler, patch
      - `strength` (text) - Dosage strength
      - `manufacturer` (text, optional) - Manufacturer name
      - `unit_price` (decimal) - Price per unit
      - `stock_quantity` (integer, optional) - Current stock quantity
      - `is_active` (boolean) - Whether the medication is active
      - `category` (enum) - Category: antibiotic, analgesic, antiviral, cardiovascular, respiratory, digestive, neurological, other
      - `requires_prescription` (boolean) - Whether prescription is required
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `medications` table
    - Add policies for authenticated users to read
    - Add policies for admins to manage
*/

-- Create enums for medication forms and categories
CREATE TYPE medication_form AS ENUM ('tablet', 'syrup', 'injection', 'capsule', 'cream', 'drops', 'inhaler', 'patch');
CREATE TYPE medication_category AS ENUM ('antibiotic', 'analgesic', 'antiviral', 'cardiovascular', 'respiratory', 'digestive', 'neurological', 'other');

-- Create medications table
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

-- Enable Row Level Security
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can read medications"
  ON medications
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert medications"
  ON medications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update medications"
  ON medications
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete medications"
  ON medications
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_medications_name ON medications(name);
CREATE INDEX IF NOT EXISTS idx_medications_generic_name ON medications(generic_name);
CREATE INDEX IF NOT EXISTS idx_medications_category ON medications(category);
CREATE INDEX IF NOT EXISTS idx_medications_form ON medications(form);
CREATE INDEX IF NOT EXISTS idx_medications_is_active ON medications(is_active);

-- Create trigger for medications table
CREATE TRIGGER update_medications_updated_at
  BEFORE UPDATE ON medications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();