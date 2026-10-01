-- Données initiales : questions du quiz, paramètres et compte administrateur
-- À exécuter après schema.sql
USE quiz;

-- Quiz actif par défaut
INSERT IGNORE INTO settings (setting_key, setting_value) VALUES ('quiz_active', '1');

-- Compte admin : admin@gmail.com / admin123 (mot de passe hashé avec bcrypt)
INSERT INTO admins (username, password_hash)
VALUES ('admin@gmail.com', '$2b$10$3w6edZbvrFSokBweTNXFNuWHJlNt7K2w0hUkUQ2JvAP70MDlHXFri')
ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash);

-- 20 questions de la Journée Talents (correct_index commence à 0 : A = 0, B = 1, C = 2, D = 3)
INSERT INTO questions (question, type, options, correct_index, time_limit, position) VALUES
  ('Quelle édition du Marrakech Airshow se tient en 2026 ?', 'mcq', '["8e édition","7e édition","6e édition","10e édition"]', 0, 20, 1),
  ('Quelles sont les dates du Marrakech Airshow 2026 ?', 'mcq', '["Du 7 au 10 octobre 2026","Du 1er au 4 octobre 2026","Du 9 au 12 octobre 2026","Du 14 au 17 octobre 2026"]', 0, 20, 2),
  ('Où se déroule le Marrakech Airshow 2026 ?', 'mcq', '["À l’aéroport Marrakech-Menara","À Midparc, Casablanca","À la base aérienne des Forces Royales Air","Au Palais des congrès de Marrakech"]', 2, 20, 3),
  ('Le Marrakech Airshow se tient sous le Haut Patronage de Sa Majesté le Roi Mohammed VI.', 'true_false', '["Vrai","Faux"]', 0, 20, 4),
  ('Quelle association organise le Marrakech Airshow ?', 'mcq', '["GIMAS","ONDA","AMICA","ASSAD"]', 3, 20, 5),
  ('Que signifie le sigle ASSAD ?', 'mcq', '["Association des Sociétés Aéronautiques de la Défense","Alliance du Secteur Spatial Africain et de la Défense","Association des Salons du Spatial, de l’Aéronautique et de la Défense","Agence Spatiale et Aéronautique pour le Développement"]', 2, 30, 6),
  ('Quel ministère est partenaire de l’organisation du salon ?', 'mcq', '["Ministère de l’Enseignement supérieur","Ministère du Tourisme","Ministère du Transport et de la Logistique","Ministère de l’Industrie et du Commerce"]', 3, 20, 7),
  ('Quel jour se tient la Journée « Talents » ?', 'mcq', '["Le 8 octobre 2026","Le 10 octobre 2026","Le 7 octobre 2026","Le 9 octobre 2026"]', 3, 20, 8),
  ('Quel groupement fédère les industriels aéronautiques et spatiaux au Maroc ?', 'mcq', '["GIMAS","AMITH","AMICA","FENELEC"]', 0, 20, 9),
  ('Quelle zone industrielle dédiée à l’aéronautique se trouve près de l’aéroport Mohammed V ?', 'mcq', '["Technopolis","Tanger Med","Atlantic Free Zone","Midparc"]', 3, 20, 10),
  ('Des usines au Maroc fabriquent des pièces pour Airbus et Boeing.', 'true_false', '["Vrai","Faux"]', 0, 20, 11),
  ('Où se trouvent généralement les réacteurs d’un avion de ligne moderne ?', 'mcq', '["Sous le cockpit","Dans le nez de l’avion","Sous les ailes","Sur la dérive"]', 2, 20, 12),
  ('Quelle force permet à un avion de se maintenir en l’air ?', 'mcq', '["La traînée","La gravité","Le poids","La portance"]', 3, 20, 13),
  ('Comment appelle-t-on la partie verticale à l’arrière de l’avion ?', 'mcq', '["L’aileron","Le volet","Le train d’atterrissage","La dérive"]', 3, 20, 14),
  ('Les ailerons contrôlent quel mouvement de l’avion ?', 'mcq', '["Le roulis","Le tangage","La poussée","Le lacet"]', 0, 20, 15),
  ('Quel instrument de bord indique l’altitude de l’avion ?', 'mcq', '["L’altimètre","Le compas","L’anémomètre","Le variomètre"]', 0, 20, 16),
  ('Quel matériau est très utilisé pour alléger les avions modernes ?', 'mcq', '["La fonte","Le verre trempé","Le composite en fibre de carbone","Le plomb"]', 2, 20, 17),
  ('De quelle couleur est réellement la « boîte noire » d’un avion ?', 'mcq', '["Rouge","Orange","Grise","Noire"]', 1, 20, 18),
  ('En quelle année les frères Wright ont-ils réalisé le premier vol motorisé ?', 'mcq', '["1889","1914","1927","1903"]', 3, 20, 19),
  ('Quel est le plus grand avion de ligne de passagers en service ?', 'mcq', '["Boeing 787","Airbus A320","Boeing 737","Airbus A380"]', 3, 20, 20);
