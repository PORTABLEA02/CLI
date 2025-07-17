/*
  # Création de la table des patients

  1. Nouvelles Tables
    - `patients`
      - `id` (uuid, primary key)
      - `first_name` (text, prénom)
      - `last_name` (text, nom)
      - `date_of_birth` (date, date de naissance)
      - `gender` (enum, genre)
      - `phone` (text, téléphone)
      - `email` (text, email)
      - `address` (text, adresse)
      - `emergency_contact` (text, contact d'urgence)
      - `blood_type` (text, groupe sanguin)
      - `allergies` (text, allergies)
      - `medical_history` (text, historique médical)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Sécurité
    - Enable RLS sur `patients`
    - Politique pour que les utilisateurs authentifiés puissent lire tous les patients
    - Politique pour que les admins et médecins puissent modifier les patients
*/

-- Créer le type enum pour le genre
CREATE TYPE gender_type AS ENUM ('male', 'female', 'other');

-- Créer la table patients
CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  date_of_birth date NOT NULL,
  gender gender_type NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  address text NOT NULL,
  emergency_contact text NOT NULL,
  blood_type text,
  allergies text,
  medical_history text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Activer RLS
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Politique pour lire tous les patients (utilisateurs authentifiés)
CREATE POLICY "Authenticated users can read patients"
  ON patients
  FOR SELECT
  TO authenticated
  USING (true);

-- Politique pour que les admins et médecins puissent modifier les patients
CREATE POLICY "Admins and doctors can manage patients"
  ON patients
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'doctor')
    )
  );

-- Trigger pour updated_at
CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insérer des patients de démonstration
INSERT INTO patients (first_name, last_name, date_of_birth, gender, phone, email, address, emergency_contact, blood_type, allergies)
VALUES 
  ('Jean', 'Dupont', '1980-05-15', 'male', '+33 6 12 34 56 78', 'jean.dupont@email.com', '123 Rue de la Paix, 75001 Paris', 'Marie Dupont - 06 87 65 43 21', 'A+', 'Pénicilline'),
  ('Marie', 'Martin', '1975-09-22', 'female', '+33 6 23 45 67 89', 'marie.martin@email.com', '456 Avenue des Champs, 75008 Paris', 'Pierre Martin - 06 98 76 54 32', 'O-', NULL),
  ('Pierre', 'Durand', '1990-12-03', 'male', '+33 6 34 56 78 90', 'pierre.durand@email.com', '789 Boulevard Saint-Germain, 75006 Paris', 'Sophie Durand - 06 11 22 33 44', 'B+', 'Aspirine'),
  ('Sophie', 'Leroy', '1985-07-18', 'female', '+33 6 45 67 89 01', 'sophie.leroy@email.com', '321 Rue de Rivoli, 75004 Paris', 'Paul Leroy - 06 55 66 77 88', 'AB+', NULL),
  ('Paul', 'Moreau', '1970-03-10', 'male', '+33 6 56 78 90 12', 'paul.moreau@email.com', '654 Place Vendôme, 75001 Paris', 'Claire Moreau - 06 99 88 77 66', 'A-', 'Iode')
ON CONFLICT DO NOTHING;