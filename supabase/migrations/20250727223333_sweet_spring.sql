/*
  # Table des produits utilisés dans les consultations

  1. Nouvelle table
    - `consultation_products`
      - `id` (uuid, primary key)
      - `consultation_id` (uuid, foreign key vers consultations)
      - `product_id` (uuid, foreign key vers products)
      - `quantity` (integer) - Quantité utilisée
      - `unit_price` (numeric) - Prix unitaire au moment de la consultation
      - `created_at` (timestamp)

  2. Sécurité
    - Enable RLS sur `consultation_products`
    - Seuls les docteurs et admins peuvent gérer les produits de consultation
    - Tous les utilisateurs authentifiés peuvent lire

  3. Index
    - Index sur consultation_id pour les requêtes rapides
    - Index sur product_id pour les statistiques
*/

CREATE TABLE IF NOT EXISTS consultation_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id uuid NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric(10,2) NOT NULL CHECK (unit_price >= 0),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE consultation_products ENABLE ROW LEVEL SECURITY;

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_consultation_products_consultation_id ON consultation_products(consultation_id);
CREATE INDEX IF NOT EXISTS idx_consultation_products_product_id ON consultation_products(product_id);

-- Politique pour la lecture (tous les utilisateurs authentifiés)
CREATE POLICY "All authenticated users can read consultation products"
  ON consultation_products
  FOR SELECT
  TO authenticated
  USING (true);

-- Politique pour la gestion (docteurs et admins)
CREATE POLICY "Doctors and admins can manage consultation products"
  ON consultation_products
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role IN ('admin', 'doctor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role IN ('admin', 'doctor')
    )
  );