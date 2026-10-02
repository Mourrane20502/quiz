-- Remplace la colonne email par school (école) dans participants.
-- Le téléphone devient l'identifiant unique d'un participant (une seule tentative par numéro).
-- Inutile de l'exécuter à la main : le serveur applique cette migration au démarrage.
USE quiz;

ALTER TABLE participants ADD COLUMN school VARCHAR(190) NOT NULL DEFAULT '' AFTER full_name;
ALTER TABLE participants DROP COLUMN email;

-- Échoue si plusieurs participants ont le même numéro : supprimez les doublons puis relancez.
ALTER TABLE participants ADD UNIQUE KEY uq_participants_phone (phone);
