-- Textes des pages publiques modifiables depuis l'admin (Gestion B2C).
-- Inutile de l'exécuter à la main : le serveur crée cette table au démarrage.
-- Une clé absente de la table utilise sa valeur par défaut (server/data/content.js).
USE quiz;

CREATE TABLE IF NOT EXISTS site_content (
  content_key VARCHAR(50) PRIMARY KEY,
  content_value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
