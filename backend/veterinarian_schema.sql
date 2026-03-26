-- Script SQL pour créer la table Veterinarian
-- Exécuter cela dans votre base de données

CREATE TABLE IF NOT EXISTS veterinarian (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    speciality VARCHAR(255) NOT NULL,
    experience_years INT NOT NULL,
    clinic_address VARCHAR(255) NOT NULL,
    available BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT UC_email UNIQUE (email),
    INDEX idx_available (available),
    INDEX idx_speciality (speciality)
);

-- Données de test (optionnel)
INSERT INTO veterinarian (name, email, phone, speciality, experience_years, clinic_address, available) VALUES
('Dr. Jean Dubois', 'jean.dubois@clinic.com', '06 12 34 56 78', 'Chirurgie', 10, '123 Rue de la Paix, 75000 Paris', true),
('Dr. Marie Martin', 'marie.martin@dental.com', '06 98 76 54 32', 'Dentiste', 8, '456 Avenue des Dents, 69000 Lyon', true),
('Dr. Pierre Laurent', 'pierre.laurent@clinic.com', '06 11 22 33 44', 'Chirurgie générale', 15, '789 Boulevard de la Santé, 13000 Marseille', true),
('Dr. Sophie Bernard', 'sophie.bernard@urgent.com', '06 55 44 33 22', 'Urgences', 12, '321 Rue de l''Urgence, 75001 Paris', false);
