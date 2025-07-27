/*
  # Configuration système de la clinique

  1. Nouvelle table
    - `system_settings`
      - `id` (uuid, primary key)
      - `clinic_name` (text) - Nom de la clinique
      - `clinic_address` (text) - Adresse de la clinique
      - `clinic_phone` (text) - Téléphone de la clinique
      - `clinic_email` (text) - Email de la clinique
      - `currency` (text) - Devise utilisée (FCFA par défaut)
      - `currency_symbol` (text) - Symbole de la devise
      - `tax_rate` (numeric) - Taux de taxe par défaut
      - `invoice_footer` (text) - Pied de page des factures
      - `logo_url` (text) - URL du logo de la clinique
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Sécurité
    - Enable RLS sur `system_settings`
    - Seuls les admins peuvent modifier les paramètres
    - Tous les utilisateurs authentifiés peuvent lire les paramètres

  3. Données par défaut
    - Insérer une configuration par défaut avec FCFA comme devise
*/

CREATE TABLE IF NOT EXISTS system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_name text NOT NULL DEFAULT 'CliniqueManager',
  clinic_address text,
  clinic_phone text,
  clinic_email text,
  currency text NOT NULL DEFAULT 'FCFA',
  currency_symbol text NOT NULL DEFAULT 'FCFA',
  tax_rate numeric(5,2) DEFAULT 0.00,
  invoice_footer text DEFAULT 'Merci de votre confiance',
  logo_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Politique pour la lecture (tous les utilisateurs authentifiés)
CREATE POLICY "All authenticated users can read system settings"
  ON system_settings
  FOR SELECT
  TO authenticated
  USING (true);

-- Politique pour la modification (admins seulement)
CREATE POLICY "Only admins can modify system settings"
  ON system_settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON system_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insérer les paramètres par défaut
INSERT INTO system_settings (
  clinic_name,
  currency,
  currency_symbol,
  invoice_footer
) VALUES (
  'CliniqueManager',
  'FCFA',
  'FCFA',
  'Merci de votre confiance - Système de gestion de clinique médicale'
) ON CONFLICT DO NOTHING;