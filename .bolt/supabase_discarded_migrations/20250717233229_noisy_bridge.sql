/*
  # Create system settings table

  1. New Tables
    - `system_settings`
      - `id` (text, primary key) - Settings identifier (always 'default')
      - `settings` (jsonb) - JSON object containing all system settings
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `system_settings` table
    - Add policies for authenticated users to read
    - Add policies for admins to manage
*/

-- Create system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id text PRIMARY KEY DEFAULT 'default',
  settings jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can read system settings"
  ON system_settings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert system settings"
  ON system_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update system settings"
  ON system_settings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create trigger for system_settings table
CREATE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON system_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default system settings
INSERT INTO system_settings (id, settings) VALUES (
  'default',
  '{
    "clinic": {
      "name": "ClinicPro",
      "address": "123 Rue de la Santé, 75000 Paris, France",
      "phone": "+33 1 23 45 67 89",
      "email": "contact@clinicpro.fr",
      "website": "www.clinicpro.fr",
      "description": "Clinique médicale moderne",
      "ifu": "IFU123456789"
    },
    "system": {
      "timezone": "Europe/Paris",
      "language": "fr",
      "dateFormat": "DD/MM/YYYY",
      "currency": "FCFA",
      "taxRate": 8,
      "sessionTimeout": 30,
      "backupFrequency": "daily",
      "maintenanceMode": false
    },
    "notifications": {
      "emailNotifications": true,
      "smsNotifications": false,
      "appointmentReminders": true,
      "paymentReminders": true,
      "stockAlerts": true,
      "systemAlerts": true
    },
    "billing": {
      "invoicePrefix": "INV",
      "invoiceNumbering": "auto",
      "baseConsultationPrice": 100,
      "paymentTerms": 30,
      "lateFee": 5,
      "defaultTaxRate": 8,
      "acceptedPaymentMethods": ["cash", "card", "mobile_money", "bank_transfer"]
    }
  }'
) ON CONFLICT (id) DO NOTHING;