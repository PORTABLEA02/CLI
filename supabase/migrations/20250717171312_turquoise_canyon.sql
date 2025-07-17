/*
  # Création des index et contraintes supplémentaires pour l'optimisation

  1. Index supplémentaires
    - Index composites pour les requêtes fréquentes
    - Index sur les champs de recherche

  2. Contraintes
    - Contraintes de validation métier
    - Contraintes d'unicité
*/

-- Index composites pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_consultations_doctor_date ON consultations(doctor_id, date);
CREATE INDEX IF NOT EXISTS idx_consultations_patient_status ON consultations(patient_id, status);
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor_status ON prescriptions(doctor_id, status);
CREATE INDEX IF NOT EXISTS idx_invoices_patient_status ON invoices(patient_id, status);

-- Index pour la recherche textuelle
CREATE INDEX IF NOT EXISTS idx_patients_search ON patients USING gin(
  to_tsvector('french', first_name || ' ' || last_name || ' ' || email)
);
CREATE INDEX IF NOT EXISTS idx_medications_search ON medications USING gin(
  to_tsvector('french', name || ' ' || COALESCE(generic_name, ''))
);
CREATE INDEX IF NOT EXISTS idx_medical_cares_search ON medical_cares USING gin(
  to_tsvector('french', name || ' ' || description)
);

-- Contraintes métier supplémentaires
ALTER TABLE consultations 
ADD CONSTRAINT check_consultation_duration 
CHECK (duration >= 15 AND duration <= 480); -- Entre 15 minutes et 8 heures

ALTER TABLE consultations 
ADD CONSTRAINT check_consultation_date_not_too_old 
CHECK (date >= CURRENT_DATE - INTERVAL '1 year'); -- Pas plus d'un an dans le passé

ALTER TABLE prescriptions 
ADD CONSTRAINT check_prescription_valid_until 
CHECK (valid_until >= created_at::date); -- Date de validité cohérente

ALTER TABLE medical_supplies 
ADD CONSTRAINT check_stock_levels 
CHECK (stock_quantity >= 0 AND min_stock_level >= 0);

ALTER TABLE medical_supplies 
ADD CONSTRAINT check_min_stock_reasonable 
CHECK (min_stock_level <= stock_quantity * 2); -- Seuil minimum raisonnable

-- Contrainte d'unicité pour éviter les doublons
ALTER TABLE consultation_cares 
ADD CONSTRAINT unique_consultation_care 
UNIQUE (consultation_id, care_id, performed_at);

-- Contrainte pour s'assurer qu'un patient ne peut pas avoir deux consultations en même temps
CREATE UNIQUE INDEX IF NOT EXISTS idx_patient_consultation_datetime 
ON consultations(patient_id, date, time) 
WHERE status NOT IN ('cancelled');

-- Contrainte pour s'assurer qu'un médecin ne peut pas avoir deux consultations en même temps
CREATE UNIQUE INDEX IF NOT EXISTS idx_doctor_consultation_datetime 
ON consultations(doctor_id, date, time) 
WHERE status NOT IN ('cancelled');

-- Fonction pour valider les emails
CREATE OR REPLACE FUNCTION is_valid_email(email text)
RETURNS boolean AS $$
BEGIN
  RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Contraintes de validation des emails
ALTER TABLE patients 
ADD CONSTRAINT check_patient_email_valid 
CHECK (is_valid_email(email));

ALTER TABLE profiles 
ADD CONSTRAINT check_profile_email_valid 
CHECK (is_valid_email(email));

-- Fonction pour valider les numéros de téléphone français
CREATE OR REPLACE FUNCTION is_valid_french_phone(phone text)
RETURNS boolean AS $$
BEGIN
  -- Accepte les formats: +33 X XX XX XX XX, 0X XX XX XX XX, etc.
  RETURN phone ~* '^(\+33|0)[1-9]([0-9]{8}|(\s[0-9]{2}){4})$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Contraintes de validation des téléphones (optionnelle, peut être désactivée si trop restrictive)
-- ALTER TABLE patients ADD CONSTRAINT check_patient_phone_valid CHECK (is_valid_french_phone(phone));
-- ALTER TABLE profiles ADD CONSTRAINT check_profile_phone_valid CHECK (phone IS NULL OR is_valid_french_phone(phone));