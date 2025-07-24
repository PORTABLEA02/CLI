/*
  # Schéma de base pour la gestion de clinique médicale

  1. Nouvelles tables
    - `profiles` - Profils utilisateurs avec rôles
    - `patients` - Informations des patients
    - `products` - Produits médicaux et médicaments
    - `consultations` - Consultations médicales
    - `consultation_products` - Produits utilisés dans les consultations
    - `stock_movements` - Mouvements de stock
    - `invoices` - Factures
    - `invoice_items` - Éléments de facture

  2. Sécurité
    - Activation de RLS sur toutes les tables
    - Politiques d'accès basées sur les rôles
*/

-- Extension pour générer des UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Énumération des rôles
CREATE TYPE user_role AS ENUM ('admin', 'doctor', 'cashier');

-- Énumération des sexes
CREATE TYPE gender_type AS ENUM ('M', 'F');

-- Énumération des types de produits
CREATE TYPE product_type AS ENUM ('medical', 'medication');

-- Énumération des statuts de facture
CREATE TYPE invoice_status AS ENUM ('draft', 'paid', 'cancelled');

-- Table des profils utilisateurs
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role user_role NOT NULL DEFAULT 'cashier',
  phone text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des patients
CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  gender gender_type NOT NULL,
  birth_date date NOT NULL,
  phone text,
  email text,
  address text,
  emergency_contact text,
  medical_history text,
  allergies text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des produits (médicaux et médicaments)
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  type product_type NOT NULL,
  unit_price decimal(10,2) NOT NULL DEFAULT 0,
  current_stock integer NOT NULL DEFAULT 0,
  min_stock_level integer NOT NULL DEFAULT 0,
  unit text NOT NULL DEFAULT 'pièce',
  barcode text,
  expiry_date date,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des consultations
CREATE TABLE IF NOT EXISTS consultations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id uuid REFERENCES profiles(id),
  consultation_date timestamptz DEFAULT now(),
  diagnosis text NOT NULL,
  treatment text,
  notes text,
  consultation_fee decimal(10,2) DEFAULT 0,
  is_invoiced boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des produits utilisés dans les consultations
CREATE TABLE IF NOT EXISTS consultation_products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  consultation_id uuid REFERENCES consultations(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id),
  quantity integer NOT NULL DEFAULT 1,
  unit_price decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Table des mouvements de stock
CREATE TABLE IF NOT EXISTS stock_movements (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id uuid REFERENCES products(id),
  movement_type text NOT NULL CHECK (movement_type IN ('in', 'out')),
  quantity integer NOT NULL,
  reason text,
  reference_id uuid, -- peut référencer une consultation ou facture
  user_id uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- Table des factures
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number text UNIQUE NOT NULL,
  patient_id uuid REFERENCES patients(id),
  consultation_id uuid REFERENCES consultations(id),
  cashier_id uuid REFERENCES profiles(id),
  total_amount decimal(10,2) NOT NULL DEFAULT 0,
  status invoice_status DEFAULT 'draft',
  issue_date timestamptz DEFAULT now(),
  due_date timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des éléments de facture
CREATE TABLE IF NOT EXISTS invoice_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id uuid REFERENCES invoices(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id),
  description text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price decimal(10,2) NOT NULL,
  total_price decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Fonction pour générer les numéros de facture
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS text AS $$
DECLARE
  next_number integer;
  formatted_number text;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM '\d+') AS integer)), 0) + 1
  INTO next_number
  FROM invoices
  WHERE invoice_number ~ '^FAC\d+$';
  
  formatted_number := 'FAC' || LPAD(next_number::text, 6, '0');
  RETURN formatted_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour générer automatiquement le numéro de facture
CREATE OR REPLACE FUNCTION set_invoice_number()
RETURNS trigger AS $$
BEGIN
  IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
    NEW.invoice_number := generate_invoice_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_set_invoice_number
  BEFORE INSERT ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION set_invoice_number();

-- Trigger pour mettre à jour les timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_consultations_updated_at
  BEFORE UPDATE ON consultations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Activation de RLS sur toutes les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour les profils
CREATE POLICY "Users can read all profiles" ON profiles
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all profiles" ON profiles
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Politiques RLS pour les patients
CREATE POLICY "All authenticated users can read patients" ON patients
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "All authenticated users can insert patients" ON patients
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "All authenticated users can update patients" ON patients
  FOR UPDATE TO authenticated
  USING (true);

-- Politiques RLS pour les produits
CREATE POLICY "All authenticated users can read products" ON products
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins and cashiers can manage products" ON products
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role IN ('admin', 'cashier')
    )
  );

-- Politiques RLS pour les consultations
CREATE POLICY "All authenticated users can read consultations" ON consultations
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Doctors can manage consultations" ON consultations
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role IN ('admin', 'doctor')
    )
  );

-- Politiques RLS pour les autres tables
CREATE POLICY "All authenticated users can read consultation_products" ON consultation_products
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Doctors can manage consultation_products" ON consultation_products
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role IN ('admin', 'doctor')
    )
  );

CREATE POLICY "All authenticated users can read stock_movements" ON stock_movements
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins and cashiers can manage stock_movements" ON stock_movements
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role IN ('admin', 'cashier')
    )
  );

CREATE POLICY "All authenticated users can read invoices" ON invoices
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Cashiers and admins can manage invoices" ON invoices
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role IN ('admin', 'cashier')
    )
  );

CREATE POLICY "All authenticated users can read invoice_items" ON invoice_items
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Cashiers and admins can manage invoice_items" ON invoice_items
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role IN ('admin', 'cashier')
    )
  );

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_consultations_patient_id ON consultations(patient_id);
CREATE INDEX IF NOT EXISTS idx_consultations_doctor_id ON consultations(doctor_id);
CREATE INDEX IF NOT EXISTS idx_invoices_patient_id ON invoices(patient_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_products_type ON products(type);