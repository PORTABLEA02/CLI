/*
  # Création de la table des paramètres système

  1. Nouvelles Tables
    - `system_settings`
      - `id` (text, primary key, toujours 'default')
      - `settings` (jsonb, paramètres du système)
      - `updated_at` (timestamptz)

  2. Sécurité
    - Enable RLS sur `system_settings`
    - Seuls les admins peuvent modifier les paramètres
*/

-- Table system_settings
CREATE TABLE IF NOT EXISTS system_settings (
  id text PRIMARY KEY DEFAULT 'default',
  settings jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);

-- Activer RLS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Politique pour lire les paramètres (utilisateurs authentifiés)
CREATE POLICY "Authenticated users can read system_settings"
  ON system_settings FOR SELECT TO authenticated USING (true);

-- Politique pour que seuls les admins puissent modifier les paramètres
CREATE POLICY "Admins can manage system_settings"
  ON system_settings FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Trigger pour updated_at
CREATE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON system_settings FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insérer les paramètres par défaut
INSERT INTO system_settings (id, settings)
VALUES ('default', '{
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
    "paymentTerms": 30,
    "lateFee": 5,
    "defaultTaxRate": 8,
    "acceptedPaymentMethods": ["cash", "card", "mobile_money", "bank_transfer"]
  }
}')
ON CONFLICT (id) DO UPDATE SET
  settings = EXCLUDED.settings,
  updated_at = now();