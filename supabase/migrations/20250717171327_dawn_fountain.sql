/*
  # Insertion de données de démonstration complètes

  1. Données supplémentaires
    - Plus de consultations
    - Prescriptions d'exemple
    - Factures d'exemple
    - Soins et fournitures utilisés

  2. Données cohérentes
    - Relations correctes entre les entités
    - Dates réalistes
    - Montants cohérents
*/

-- Insérer des consultations supplémentaires
INSERT INTO consultations (patient_id, doctor_id, date, time, type, status, symptoms, diagnosis, notes, duration)
SELECT 
  p.id,
  '550e8400-e29b-41d4-a716-446655440002', -- Dr. Michael Chen
  CURRENT_DATE,
  '10:30',
  'general',
  'scheduled',
  'Contrôle de routine',
  NULL,
  'Consultation de suivi',
  30
FROM patients p
WHERE p.first_name = 'Marie' AND p.last_name = 'Martin'
ON CONFLICT DO NOTHING;

INSERT INTO consultations (patient_id, doctor_id, date, time, type, status, symptoms, diagnosis, notes, duration)
SELECT 
  p.id,
  '550e8400-e29b-41d4-a716-446655440002', -- Dr. Michael Chen
  CURRENT_DATE - INTERVAL '2 days',
  '14:00',
  'emergency',
  'completed',
  'Douleur abdominale aiguë',
  'Gastro-entérite aiguë',
  'Traitement symptomatique prescrit',
  45
FROM patients p
WHERE p.first_name = 'Pierre' AND p.last_name = 'Durand'
ON CONFLICT DO NOTHING;

-- Insérer des soins réalisés pendant les consultations
INSERT INTO consultation_cares (consultation_id, care_id, quantity, unit_price, total_price, performed_by, performed_at)
SELECT 
  c.id,
  mc.id,
  1,
  mc.unit_price,
  mc.unit_price,
  c.doctor_id,
  c.created_at
FROM consultations c
JOIN medical_cares mc ON mc.name = 'Prise de tension'
WHERE c.status = 'completed'
LIMIT 2
ON CONFLICT DO NOTHING;

-- Insérer des fournitures utilisées
INSERT INTO consultation_supplies (consultation_id, supply_id, quantity, unit_price, total_price, used_by, used_at)
SELECT 
  c.id,
  ms.id,
  2,
  ms.unit_price,
  ms.unit_price * 2,
  c.doctor_id,
  c.created_at
FROM consultations c
JOIN medical_supplies ms ON ms.name = 'Gants latex M'
WHERE c.status = 'completed'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Insérer des prescriptions
INSERT INTO prescriptions (consultation_id, patient_id, doctor_id, items, instructions, status, valid_until)
SELECT 
  c.id,
  c.patient_id,
  c.doctor_id,
  '[
    {
      "id": "1",
      "type": "medication",
      "itemId": "' || m.id || '",
      "quantity": 1,
      "dosage": "1 comprimé",
      "frequency": "3 fois par jour",
      "duration": "7 jours",
      "unitPrice": ' || m.unit_price || ',
      "totalPrice": ' || m.unit_price || '
    }
  ]'::jsonb,
  'Prendre avec un grand verre d''eau, de préférence pendant les repas.',
  'active',
  CURRENT_DATE + INTERVAL '30 days'
FROM consultations c
JOIN medications m ON m.name = 'Doliprane'
WHERE c.status = 'completed' AND c.diagnosis IS NOT NULL
LIMIT 1
ON CONFLICT DO NOTHING;

-- Insérer des factures
INSERT INTO invoices (patient_id, consultation_id, items, subtotal, tax, total, status, due_date)
SELECT 
  c.patient_id,
  c.id,
  '[
    {
      "id": "1",
      "name": "Consultation",
      "description": "Consultation générale",
      "quantity": 1,
      "unitPrice": 100,
      "total": 100
    },
    {
      "id": "2",
      "name": "Prise de tension",
      "description": "Mesure de la tension artérielle",
      "quantity": 1,
      "unitPrice": 10,
      "total": 10
    }
  ]'::jsonb,
  110.00,
  8.80, -- 8% de TVA
  118.80,
  'pending',
  CURRENT_DATE + INTERVAL '30 days'
FROM consultations c
WHERE c.status = 'completed'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Insérer un paiement pour une facture
INSERT INTO payments (invoice_id, amount, method, reference, cashier_id)
SELECT 
  i.id,
  i.total,
  'cash',
  'CASH-' || EXTRACT(EPOCH FROM now())::text,
  '550e8400-e29b-41d4-a716-446655440003' -- Emma Wilson (cashier)
FROM invoices i
WHERE i.status = 'pending'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Mettre à jour le stock des fournitures après utilisation
UPDATE medical_supplies 
SET stock_quantity = stock_quantity - 2 
WHERE name = 'Gants latex M';

-- Ajouter quelques consultations futures pour les tests
INSERT INTO consultations (patient_id, doctor_id, date, time, type, status, symptoms, duration)
SELECT 
  p.id,
  '550e8400-e29b-41d4-a716-446655440002',
  CURRENT_DATE + INTERVAL '1 day',
  '09:00',
  'followup',
  'scheduled',
  'Suivi post-traitement',
  30
FROM patients p
WHERE p.first_name = 'Sophie' AND p.last_name = 'Leroy'
ON CONFLICT DO NOTHING;

INSERT INTO consultations (patient_id, doctor_id, date, time, type, status, symptoms, duration)
SELECT 
  p.id,
  '550e8400-e29b-41d4-a716-446655440002',
  CURRENT_DATE + INTERVAL '2 days',
  '11:00',
  'general',
  'scheduled',
  'Consultation de contrôle',
  30
FROM patients p
WHERE p.first_name = 'Paul' AND p.last_name = 'Moreau'
ON CONFLICT DO NOTHING;