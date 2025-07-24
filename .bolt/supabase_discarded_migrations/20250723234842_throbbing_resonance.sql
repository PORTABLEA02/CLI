/*
  # Données d'exemple pour la clinique médicale

  1. Utilisateurs et profils d'exemple
  2. Patients d'exemple
  3. Produits médicaux et médicaments
  4. Consultations et factures d'exemple
*/

-- Insérer des produits médicaux d'exemple
INSERT INTO products (name, description, type, unit_price, current_stock, min_stock_level, unit) VALUES
('Seringue 5ml', 'Seringue jetable 5ml', 'medical', 0.5, 100, 20, 'pièce'),
('Pansement adhésif', 'Pansement adhésif stérile', 'medical', 1.2, 50, 10, 'pièce'),
('Gants latex', 'Gants d''examen en latex', 'medical', 0.3, 200, 50, 'paire'),
('Désinfectant', 'Solution désinfectante 500ml', 'medical', 8.5, 25, 5, 'flacon'),
('Thermomètre', 'Thermomètre électronique', 'medical', 15.0, 10, 2, 'pièce'),
('Paracétamol 500mg', 'Comprimés antalgique', 'medication', 5.5, 80, 15, 'boîte'),
('Amoxicilline 500mg', 'Antibiotique capsules', 'medication', 12.0, 30, 5, 'boîte'),
('Ibuprofène 400mg', 'Anti-inflammatoire comprimés', 'medication', 7.8, 45, 10, 'boîte'),
('Sirop pour la toux', 'Sirop antitussif 100ml', 'medication', 9.2, 20, 5, 'flacon'),
('Vitamine C', 'Comprimés vitamine C 1000mg', 'medication', 6.5, 35, 8, 'boîte');

-- Insérer des patients d'exemple
INSERT INTO patients (first_name, last_name, gender, birth_date, phone, email, address) VALUES
('Marie', 'Dupont', 'F', '1985-03-15', '0123456789', 'marie.dupont@email.com', '123 Rue de la Santé, Paris'),
('Jean', 'Martin', 'M', '1978-07-22', '0987654321', 'jean.martin@email.com', '456 Avenue Médicale, Lyon'),
('Sophie', 'Bernard', 'F', '1992-11-08', '0145678923', 'sophie.bernard@email.com', '789 Boulevard des Soins, Marseille'),
('Pierre', 'Dubois', 'M', '1965-05-30', '0167890345', 'pierre.dubois@email.com', '321 Place de la Clinique, Toulouse'),
('Catherine', 'Moreau', 'F', '1980-09-12', '0198765432', 'catherine.moreau@email.com', '654 Rue de la Guérison, Nice');