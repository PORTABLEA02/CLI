/*
  # Create medical supplies table

  1. New Tables
    - `medical_supplies`
      - `id` (uuid, primary key)
      - `name` (text) - Name of the supply
      - `description` (text) - Description of the supply
      - `category` (enum) - Category: disposable, equipment, consumable, instrument, protective, other
      - `sub_category` (text, optional) - Sub-category
      - `unit_price` (decimal) - Price per unit
      - `stock_quantity` (integer) - Current stock quantity
      - `min_stock_level` (integer) - Minimum stock level for alerts
      - `supplier` (text, optional) - Supplier name
      - `reference` (text, optional) - Product reference/SKU
      - `expiration_date` (date, optional) - Expiration date
      - `is_active` (boolean) - Whether the supply is active
      - `requires_doctor` (boolean) - Whether doctor presence is required
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `medical_supplies` table
    - Add policies for authenticated users to read
    - Add policies for admins to manage
*/

-- Create enum for medical supply categories
CREATE TYPE medical_supply_category AS ENUM ('disposable', 'equipment', 'consumable', 'instrument', 'protective', 'other');

-- Create medical_supplies table
CREATE TABLE IF NOT EXISTS medical_supplies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  category medical_supply_category NOT NULL DEFAULT 'other',
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

-- Enable Row Level Security
ALTER TABLE medical_supplies ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can read medical supplies"
  ON medical_supplies
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert medical supplies"
  ON medical_supplies
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update medical supplies"
  ON medical_supplies
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete medical supplies"
  ON medical_supplies
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_medical_supplies_name ON medical_supplies(name);
CREATE INDEX IF NOT EXISTS idx_medical_supplies_category ON medical_supplies(category);
CREATE INDEX IF NOT EXISTS idx_medical_supplies_is_active ON medical_supplies(is_active);
CREATE INDEX IF NOT EXISTS idx_medical_supplies_stock_level ON medical_supplies(stock_quantity, min_stock_level);

-- Create trigger for medical_supplies table
CREATE TRIGGER update_medical_supplies_updated_at
  BEFORE UPDATE ON medical_supplies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();