/*
  # Create invoices table

  1. New Tables
    - `invoices`
      - `id` (uuid, primary key)
      - `patient_id` (uuid, foreign key) - Reference to patients table
      - `consultation_id` (uuid, foreign key) - Reference to consultations table
      - `prescription_id` (uuid, foreign key, optional) - Reference to prescriptions table
      - `items` (jsonb) - Array of invoice items
      - `subtotal` (decimal) - Subtotal amount
      - `tax` (decimal) - Tax amount
      - `total` (decimal) - Total amount
      - `status` (enum) - Status: pending, paid, overdue
      - `created_at` (timestamptz) - Creation timestamp
      - `due_date` (date) - Due date
      - `paid_at` (timestamptz, optional) - Payment timestamp
      - `payment_method` (enum, optional) - Payment method
      - `payment_reference` (text, optional) - Payment reference
      - `cashier_id` (uuid, foreign key, optional) - Reference to profiles table

  2. Security
    - Enable RLS on `invoices` table
    - Add policies for authenticated users to read
    - Add policies for admins and cashiers to manage
*/

-- Create enums for invoice status and payment methods
CREATE TYPE invoice_status AS ENUM ('pending', 'paid', 'overdue');
CREATE TYPE payment_method AS ENUM ('cash', 'mobile_money', 'bank_transfer', 'card');

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  consultation_id uuid NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
  prescription_id uuid REFERENCES prescriptions(id) ON DELETE SET NULL,
  items jsonb NOT NULL DEFAULT '[]',
  subtotal decimal(10,2) NOT NULL DEFAULT 0,
  tax decimal(10,2) NOT NULL DEFAULT 0,
  total decimal(10,2) NOT NULL DEFAULT 0,
  status invoice_status NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  due_date date NOT NULL,
  paid_at timestamptz,
  payment_method payment_method,
  payment_reference text,
  cashier_id uuid REFERENCES profiles(id) ON DELETE SET NULL
);

-- Enable Row Level Security
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can read invoices"
  ON invoices
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and cashiers can insert invoices"
  ON invoices
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'cashier')
    )
  );

CREATE POLICY "Admins and cashiers can update invoices"
  ON invoices
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'cashier')
    )
  );

CREATE POLICY "Admins can delete invoices"
  ON invoices
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_invoices_patient_id ON invoices(patient_id);
CREATE INDEX IF NOT EXISTS idx_invoices_consultation_id ON invoices(consultation_id);
CREATE INDEX IF NOT EXISTS idx_invoices_prescription_id ON invoices(prescription_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_cashier_id ON invoices(cashier_id);