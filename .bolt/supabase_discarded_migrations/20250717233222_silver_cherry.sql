/*
  # Create payments table

  1. New Tables
    - `payments`
      - `id` (uuid, primary key)
      - `invoice_id` (uuid, foreign key) - Reference to invoices table
      - `amount` (decimal) - Payment amount
      - `method` (enum) - Payment method: cash, mobile_money, bank_transfer, card
      - `reference` (text, optional) - Payment reference
      - `notes` (text, optional) - Additional notes
      - `cashier_id` (uuid, foreign key) - Reference to profiles table
      - `created_at` (timestamptz) - Creation timestamp

  2. Security
    - Enable RLS on `payments` table
    - Add policies for authenticated users to read
    - Add policies for admins and cashiers to manage
*/

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  amount decimal(10,2) NOT NULL DEFAULT 0,
  method payment_method NOT NULL DEFAULT 'cash',
  reference text,
  notes text,
  cashier_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can read payments"
  ON payments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and cashiers can insert payments"
  ON payments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    cashier_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'cashier')
    )
  );

CREATE POLICY "Admins and cashiers can update payments"
  ON payments
  FOR UPDATE
  TO authenticated
  USING (
    cashier_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'cashier')
    )
  );

CREATE POLICY "Admins can delete payments"
  ON payments
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_cashier_id ON payments(cashier_id);
CREATE INDEX IF NOT EXISTS idx_payments_method ON payments(method);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);