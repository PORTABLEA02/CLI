/*
  # Création de la table des profils utilisateurs

  1. Nouvelles Tables
    - `profiles`
      - `id` (uuid, primary key, référence vers auth.users)
      - `name` (text, nom complet)
      - `email` (text, unique, email de connexion)
      - `role` (enum, rôle dans le système)
      - `avatar` (text, URL de l'avatar)
      - `specialization` (text, spécialisation pour les médecins)
      - `phone` (text, numéro de téléphone)
      - `is_active` (boolean, compte actif)
      - `last_login_at` (timestamptz, dernière connexion)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Sécurité
    - Enable RLS sur `profiles`
    - Politique pour que les utilisateurs authentifiés puissent lire tous les profils
    - Politique pour que les admins puissent tout modifier
    - Politique pour que les utilisateurs puissent modifier leur propre profil

  3. Fonctions
    - Trigger pour créer automatiquement un profil lors de l'inscription
    - Fonction pour mettre à jour updated_at automatiquement
*/

-- Créer le type enum pour les rôles
CREATE TYPE user_role AS ENUM ('admin', 'doctor', 'cashier');

-- Créer la table profiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'doctor',
  avatar text,
  specialization text,
  phone text,
  is_active boolean DEFAULT true,
  last_login_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Activer RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Politique pour lire tous les profils (utilisateurs authentifiés)
CREATE POLICY "Users can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Politique pour que les utilisateurs puissent modifier leur propre profil
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Politique pour que les admins puissent tout faire
CREATE POLICY "Admins can manage all profiles"
  ON profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Politique pour l'insertion (admins seulement)
CREATE POLICY "Admins can insert profiles"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour créer un profil automatiquement lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', new.email),
    new.email,
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'doctor')
  );
  RETURN new;
END;
$$ language plpgsql security definer;

-- Trigger pour créer un profil automatiquement
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insérer des profils de démonstration
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'sarah.johnson@clinic.com', crypt('password', gen_salt('bf')), now(), now(), now(), '{"name": "Sarah Johnson", "role": "admin"}'),
  ('550e8400-e29b-41d4-a716-446655440002', 'michael.chen@clinic.com', crypt('password', gen_salt('bf')), now(), now(), now(), '{"name": "Dr. Michael Chen", "role": "doctor"}'),
  ('550e8400-e29b-41d4-a716-446655440003', 'emma.wilson@clinic.com', crypt('password', gen_salt('bf')), now(), now(), now(), '{"name": "Emma Wilson", "role": "cashier"}')
ON CONFLICT (email) DO NOTHING;

-- Insérer les profils correspondants
INSERT INTO profiles (id, name, email, role, specialization, phone, is_active)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'Sarah Johnson', 'sarah.johnson@clinic.com', 'admin', NULL, '+33 1 23 45 67 89', true),
  ('550e8400-e29b-41d4-a716-446655440002', 'Dr. Michael Chen', 'michael.chen@clinic.com', 'doctor', 'Médecine Générale', '+33 1 23 45 67 90', true),
  ('550e8400-e29b-41d4-a716-446655440003', 'Emma Wilson', 'emma.wilson@clinic.com', 'cashier', NULL, '+33 1 23 45 67 91', true)
ON CONFLICT (id) DO NOTHING;