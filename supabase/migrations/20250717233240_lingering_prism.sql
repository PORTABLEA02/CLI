/*
  # Insert demo data for testing

  1. Demo Data
    - Demo profiles (admin, doctor, cashier)
    - Sample patients
    - Sample medical cares, medications, exams, and supplies
    - Sample consultations and prescriptions

  Note: This migration should only be run in development/demo environments
*/

-- Insert demo profiles (these will be created when users sign up via Supabase Auth)
-- The profiles will be linked to auth.users automatically

-- Insert sample medical cares
INSERT INTO medical_cares (name, description, category, unit_price, duration, requires_doctor, is_active) VALUES
('Pansement simple', 'Application d''un pansement sur une plaie mineure', 'nursing', 15.00, 10, false, true),
('Injection intramusculaire', 'Administration d''un médicament par voie intramusculaire', 'injection', 25.00, 5, true, true),
('Prise de tension artérielle', 'Mesure de la tension artérielle du patient', 'examination', 10.00, 5, false, true),
('Suture simple', 'Suture d''une plaie nécessitant quelques points', 'procedure', 75.00, 30, true, true),
('Séance de kinésithérapie', 'Séance de rééducation fonctionnelle', 'therapy', 45.00, 45, false, true),
('Perfusion intraveineuse', 'Mise en place et surveillance d''une perfusion', 'nursing', 35.00, 20, true, true);

-- Insert sample medications
INSERT INTO medications (name, generic_name, form, strength, manufacturer, unit_price, stock_quantity, category, requires_prescription, is_active) VALUES
('Doliprane', 'Paracétamol', 'tablet', '500mg', 'Sanofi', 3.50, 100, 'analgesic', false, true),
('Amoxicilline', 'Amoxicilline', 'capsule', '500mg', 'Mylan', 8.75, 50, 'antibiotic', true, true),
('Ventoline', 'Salbutamol', 'inhaler', '100mcg', 'GSK', 12.30, 25, 'respiratory', true, true),
('Aspégic', 'Aspirine', 'tablet', '100mg', 'Sanofi', 4.20, 75, 'cardiovascular', true, true),
('Smecta', 'Diosmectite', 'syrup', '3g', 'Ipsen', 6.80, 40, 'digestive', false, true),
('Lexomil', 'Bromazépam', 'tablet', '6mg', 'Roche', 15.60, 30, 'neurological', true, true);

-- Insert sample medical exams
INSERT INTO medical_exams (name, description, category, unit_price, duration, preparation_instructions, requires_appointment, is_active) VALUES
('Radiographie thoracique', 'Examen radiologique du thorax', 'radiology', 45.00, 15, 'Retirer tous les objets métalliques', true, true),
('Échographie abdominale', 'Examen échographique de l''abdomen', 'ultrasound', 65.00, 30, 'Être à jeun depuis 8 heures', true, true),
('Électrocardiogramme', 'Enregistrement de l''activité électrique du cœur', 'cardiology', 35.00, 15, 'Aucune préparation particulière', false, true),
('Prise de sang complète', 'Analyse sanguine complète', 'laboratory', 25.00, 10, 'Être à jeun depuis 12 heures', false, true),
('IRM cérébrale', 'Imagerie par résonance magnétique du cerveau', 'radiology', 180.00, 45, 'Retirer tous les objets métalliques, signaler les implants', true, true),
('Endoscopie digestive', 'Examen endoscopique du tube digestif', 'endoscopy', 120.00, 30, 'Être à jeun depuis 12 heures', true, true);

-- Insert sample medical supplies
INSERT INTO medical_supplies (name, description, category, sub_category, unit_price, stock_quantity, min_stock_level, supplier, reference, is_active, requires_doctor) VALUES
('Seringue 10ml', 'Seringue jetable stérile de 10ml', 'disposable', 'syringe', 0.85, 500, 50, 'MedSupply Co.', 'SYR-10ML', true, false),
('Gants latex taille M', 'Gants d''examen en latex, taille moyenne', 'protective', 'gloves', 0.12, 1000, 100, 'SafetyFirst', 'GLV-LAT-M', true, false),
('Compresses stériles 10x10', 'Compresses de gaze stériles', 'consumable', 'gauze', 0.25, 200, 20, 'MedCare', 'CMP-10X10', true, false),
('Cathéter urinaire CH16', 'Cathéter urinaire stérile calibre 16', 'disposable', 'catheter', 8.50, 25, 5, 'UroMed', 'CAT-CH16', true, true),
('Sparadrap hypoallergénique', 'Sparadrap médical hypoallergénique', 'consumable', 'tape', 2.30, 50, 10, 'TapeMed', 'TAP-HYPO', true, false),
('Masque chirurgical', 'Masque de protection chirurgical', 'protective', 'mask', 0.35, 800, 100, 'ProtectPro', 'MSK-CHIR', true, false);

-- Insert sample patients
INSERT INTO patients (first_name, last_name, date_of_birth, gender, phone, email, address, emergency_contact, blood_type, allergies) VALUES
('Marie', 'Dubois', '1985-03-15', 'female', '+33 6 12 34 56 78', 'marie.dubois@email.com', '15 Rue de la Paix, 75001 Paris', 'Pierre Dubois - +33 6 87 65 43 21', 'A+', 'Pénicilline'),
('Jean', 'Martin', '1978-11-22', 'male', '+33 6 23 45 67 89', 'jean.martin@email.com', '42 Avenue des Champs, 75008 Paris', 'Sophie Martin - +33 6 98 76 54 32', 'O+', NULL),
('Sophie', 'Bernard', '1992-07-08', 'female', '+33 6 34 56 78 90', 'sophie.bernard@email.com', '8 Boulevard Saint-Germain, 75005 Paris', 'Paul Bernard - +33 6 09 87 65 43', 'B+', 'Aspirine, Iode'),
('Pierre', 'Leroy', '1965-12-03', 'male', '+33 6 45 67 89 01', 'pierre.leroy@email.com', '23 Rue du Faubourg, 75011 Paris', 'Martine Leroy - +33 6 10 98 76 54', 'AB-', NULL),
('Camille', 'Moreau', '2000-05-18', 'other', '+33 6 56 78 90 12', 'camille.moreau@email.com', '67 Rue de Rivoli, 75004 Paris', 'Alex Moreau - +33 6 21 09 87 65', 'A-', 'Latex');

-- Note: Consultations, prescriptions, and invoices will be created through the application
-- as they require authenticated users and proper relationships