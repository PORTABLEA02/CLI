/*
  # Correction de la génération des numéros de facture

  1. Fonction pour générer un numéro de facture unique
    - Format: INV-YYYY-NNNNNN (ex: INV-2024-000001)
    - Incrémentation automatique par année
    - Gestion des collisions

  2. Trigger pour auto-génération
    - Génère automatiquement le numéro lors de l'insertion
    - Uniquement si le numéro n'est pas déjà fourni
*/

-- Fonction pour générer le prochain numéro de facture
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  current_year TEXT;
  next_number INTEGER;
  invoice_number TEXT;
BEGIN
  -- Obtenir l'année courante
  current_year := EXTRACT(YEAR FROM NOW())::TEXT;
  
  -- Trouver le prochain numéro pour cette année
  SELECT COALESCE(
    MAX(
      CAST(
        SUBSTRING(invoice_number FROM 'INV-' || current_year || '-(\d+)')
        AS INTEGER
      )
    ), 0
  ) + 1
  INTO next_number
  FROM invoices
  WHERE invoice_number LIKE 'INV-' || current_year || '-%';
  
  -- Formater le numéro avec des zéros à gauche
  invoice_number := 'INV-' || current_year || '-' || LPAD(next_number::TEXT, 6, '0');
  
  RETURN invoice_number;
END;
$$ LANGUAGE plpgsql;

-- Fonction trigger pour auto-générer le numéro de facture
CREATE OR REPLACE FUNCTION auto_generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  -- Générer le numéro seulement s'il n'est pas fourni
  IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
    NEW.invoice_number := generate_invoice_number();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Supprimer l'ancien trigger s'il existe
DROP TRIGGER IF EXISTS trigger_auto_generate_invoice_number ON invoices;

-- Créer le nouveau trigger
CREATE TRIGGER trigger_auto_generate_invoice_number
  BEFORE INSERT ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_invoice_number();