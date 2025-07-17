/*
  # Create medical exams table

  1. New Tables
    - `medical_exams`
      - `id` (uuid, primary key)
      - `name` (text) - Name of the exam
      - `description` (text) - Description of the exam
      - `category` (enum) - Category: radiology, laboratory, cardiology, ultrasound, endoscopy, other
      - `unit_price` (decimal) - Price per exam
      - `duration` (integer, optional) - Duration in minutes
      - `preparation_instructions` (text, optional) - Preparation instructions
      - `is_active` (boolean) - Whether the exam is active
      - `requires_appointment` (boolean) - Whether appointment is required
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `medical_exams` table
    - Add policies for authenticated users to read
    - Add policies for admins to manage
*/

-- Create enum for medical exam categories
CREATE TYPE medical_exam_category AS ENUM ('radiology', 'laboratory', 'cardiology', 'ultrasound', 'endoscopy', 'other');

-- Create medical_exams table
CREATE TABLE IF NOT EXISTS medical_exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  category medical_exam_category NOT NULL DEFAULT 'other',
  unit_price decimal(10,2) NOT NULL DEFAULT 0,
  duration integer,
  preparation_instructions text,
  is_active boolean DEFAULT true,
  requires_appointment boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE medical_exams ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can read medical exams"
  ON medical_exams
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert medical exams"
  ON medical_exams
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update medical exams"
  ON medical_exams
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete medical exams"
  ON medical_exams
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_medical_exams_name ON medical_exams(name);
CREATE INDEX IF NOT EXISTS idx_medical_exams_category ON medical_exams(category);
CREATE INDEX IF NOT EXISTS idx_medical_exams_is_active ON medical_exams(is_active);

-- Create trigger for medical_exams table
CREATE TRIGGER update_medical_exams_updated_at
  BEFORE UPDATE ON medical_exams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();