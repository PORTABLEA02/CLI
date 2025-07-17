/*
  # Création des vues et fonctions utilitaires

  1. Vues
    - Vue pour les statistiques du dashboard
    - Vue pour les consultations avec détails patient/médecin
    - Vue pour les factures avec détails

  2. Fonctions
    - Fonction pour calculer l'âge des patients
    - Fonction pour les statistiques
    - Fonction pour vérifier les stocks faibles
*/

-- Fonction pour calculer l'âge
CREATE OR REPLACE FUNCTION calculate_age(birth_date date)
RETURNS integer AS $$
BEGIN
  RETURN EXTRACT(YEAR FROM age(birth_date));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Vue pour les consultations avec détails
CREATE OR REPLACE VIEW consultation_details AS
SELECT 
  c.*,
  p.first_name || ' ' || p.last_name as patient_name,
  p.phone as patient_phone,
  p.email as patient_email,
  pr.name as doctor_name,
  pr.specialization as doctor_specialization
FROM consultations c
JOIN patients p ON c.patient_id = p.id
JOIN profiles pr ON c.doctor_id = pr.id;

-- Vue pour les factures avec détails
CREATE OR REPLACE VIEW invoice_details AS
SELECT 
  i.*,
  p.first_name || ' ' || p.last_name as patient_name,
  p.phone as patient_phone,
  p.email as patient_email,
  c.date as consultation_date,
  c.time as consultation_time,
  pr.name as cashier_name
FROM invoices i
JOIN patients p ON i.patient_id = p.id
JOIN consultations c ON i.consultation_id = c.id
LEFT JOIN profiles pr ON i.cashier_id = pr.id;

-- Fonction pour obtenir les statistiques du dashboard
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS jsonb AS $$
DECLARE
  stats jsonb;
BEGIN
  SELECT jsonb_build_object(
    'totalPatients', (SELECT COUNT(*) FROM patients),
    'todayConsultations', (SELECT COUNT(*) FROM consultations WHERE date = CURRENT_DATE),
    'pendingInvoices', (SELECT COUNT(*) FROM invoices WHERE status = 'pending'),
    'monthlyRevenue', (
      SELECT COALESCE(SUM(total), 0) 
      FROM invoices 
      WHERE status = 'paid' 
      AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE)
      AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
    ),
    'completedConsultations', (SELECT COUNT(*) FROM consultations WHERE status = 'completed'),
    'cancelledConsultations', (SELECT COUNT(*) FROM consultations WHERE status = 'cancelled'),
    'lowStockSupplies', (SELECT COUNT(*) FROM medical_supplies WHERE stock_quantity <= min_stock_level)
  ) INTO stats;
  
  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier les stocks faibles
CREATE OR REPLACE FUNCTION get_low_stock_supplies()
RETURNS TABLE (
  id uuid,
  name text,
  current_stock integer,
  min_level integer,
  category supply_category
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ms.id,
    ms.name,
    ms.stock_quantity,
    ms.min_stock_level,
    ms.category
  FROM medical_supplies ms
  WHERE ms.stock_quantity <= ms.min_stock_level
  AND ms.is_active = true
  ORDER BY (ms.stock_quantity::float / ms.min_stock_level::float) ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir les consultations d'un médecin
CREATE OR REPLACE FUNCTION get_doctor_consultations(doctor_uuid uuid, start_date date DEFAULT NULL, end_date date DEFAULT NULL)
RETURNS TABLE (
  id uuid,
  patient_name text,
  date date,
  time time,
  type consultation_type,
  status consultation_status,
  symptoms text,
  diagnosis text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    p.first_name || ' ' || p.last_name,
    c.date,
    c.time,
    c.type,
    c.status,
    c.symptoms,
    c.diagnosis
  FROM consultations c
  JOIN patients p ON c.patient_id = p.id
  WHERE c.doctor_id = doctor_uuid
  AND (start_date IS NULL OR c.date >= start_date)
  AND (end_date IS NULL OR c.date <= end_date)
  ORDER BY c.date DESC, c.time DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour mettre à jour le stock après utilisation
CREATE OR REPLACE FUNCTION update_supply_stock()
RETURNS TRIGGER AS $$
BEGIN
  -- Diminuer le stock lors de l'ajout d'une fourniture à une consultation
  IF TG_OP = 'INSERT' THEN
    UPDATE medical_supplies 
    SET stock_quantity = stock_quantity - NEW.quantity
    WHERE id = NEW.supply_id;
    
    -- Vérifier si le stock devient négatif
    IF (SELECT stock_quantity FROM medical_supplies WHERE id = NEW.supply_id) < 0 THEN
      RAISE EXCEPTION 'Stock insuffisant pour la fourniture %', NEW.supply_id;
    END IF;
    
    RETURN NEW;
  END IF;
  
  -- Restaurer le stock lors de la suppression
  IF TG_OP = 'DELETE' THEN
    UPDATE medical_supplies 
    SET stock_quantity = stock_quantity + OLD.quantity
    WHERE id = OLD.supply_id;
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour automatiquement le stock
CREATE TRIGGER update_stock_on_supply_usage
  AFTER INSERT OR DELETE ON consultation_supplies
  FOR EACH ROW
  EXECUTE FUNCTION update_supply_stock();

-- Politique RLS pour les vues (héritent des politiques des tables sous-jacentes)
ALTER VIEW consultation_details OWNER TO postgres;
ALTER VIEW invoice_details OWNER TO postgres;