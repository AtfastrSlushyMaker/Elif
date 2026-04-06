-- Elif pet-profile demo seed data
-- Import after backend/user_demo_seed.sql.

START
TRANSACTION;

SET FOREIGN_KEY_CHECKS
= 0;

DELETE FROM pet WHERE id BETWEEN 5001 AND 5020;

SET FOREIGN_KEY_CHECKS
= 1;

INSERT INTO pet
    (
    id, user_id, name, species, breed, weight, date_of_birth, gender, photo_url, created_at, updated_at
    )
VALUES
    (5001, 1005, 'Max', 'DOG', 'Golden Retriever', 32.50, '2025-07-15', 'MALE', 'https://i.pinimg.com/736x/c9/6b/cd/c96bcd9d4e2e871deba0f76d47ca0ea8.jpg', '2026-01-10 10:00:00', '2026-03-18 08:00:00'),
    (5002, 1005, 'Luna', 'CAT', 'British Shorthair', 4.50, '2023-02-28', 'FEMALE', 'https://i.pinimg.com/1200x/3a/37/87/3a37879b6c88faeaac9098a6806abd18.jpg', '2026-01-15 14:30:00', '2026-03-17 09:15:00'),
    (5003, 1006, 'Whiskers', 'CAT', 'Persian', 3.80, '2022-05-10', 'MALE', 'https://i.pinimg.com/736x/5c/1f/8e/5c1f8e0c23050f0966b9d22fdfa539b4.jpg', '2026-02-01 11:00:00', '2026-03-16 15:45:00'),
    (5004, 1006, 'Buddy', 'DOG', 'Labrador Retriever', 28.00, '2024-11-03', 'MALE', 'https://hips.hearstapps.com/hmg-prod/images/labrador-puppy-royalty-free-image-1626252338.jpg?crop=0.88847xw:1xh;center,top&resize=1200:*', '2026-02-05 09:30:00', '2026-03-18 07:20:00'),
    (5006, 1007, 'Sadie', 'DOG', 'German Shepherd', 35.50, '2023-04-18', 'FEMALE', 'https://i.pinimg.com/736x/1b/1a/7b/1b1a7b7a8f0246b8cfa9c9bca66b1858.jpg', '2026-02-15 16:00:00', '2026-03-17 11:10:00'),
    (5007, 1008, 'Simba', 'CAT', 'Bengal', 4.80, '2023-09-05', 'MALE', 'https://i.pinimg.com/736x/ef/b3/cd/efb3cd5248f920a6e992e2c606a540e4.jpg', '2026-02-20 10:15:00', '2026-03-18 08:45:00'),
    (5008, 1008, 'Rocky', 'DOG', 'Rottweiler', 45.00, '2022-01-12', 'MALE', 'https://i.pinimg.com/736x/65/e4/ac/65e4ac10cf531833b7a729de9e6912c0.jpg', '2026-02-25 14:40:00', '2026-03-16 10:20:00'),
    (5009, 1009, 'Whisky', 'DOG', 'Corgi', 12.50, '2025-03-20', 'MALE', 'https://i.pinimg.com/736x/c7/1e/1a/c71e1a3ff950e78e85d96d72747bddb7.jpg', '2026-03-01 09:00:00', '2026-03-18 07:50:00'),
    (5011, 1010, 'Zeus', 'DOG', 'Husky', 28.50, '2024-08-30', 'MALE', 'https://i.pinimg.com/736x/a0/58/87/a058874e2b6f90384a40be3b39b27078.jpg', '2026-03-08 11:20:00', '2026-03-18 08:30:00'),
    (5012, 1010, 'Bella', 'DOG', 'Poodle', 18.00, '2023-12-25', 'FEMALE', 'https://i.pinimg.com/736x/d6/3e/3a/d63e3aa8bd335088d62a451c21e0a49f.jpg', '2026-03-10 13:45:00', '2026-03-17 14:55:00'),
    (5013, 1011, 'Bruno', 'CAT', 'Tabby', 4.50, '2025-03-28', 'MALE', 'https://scontent-pmo1-1.xx.fbcdn.net/v/t1.15752-9/656985466_1500634271594362_8796994098896792831_n.jpg?stp=dst-jpg_s960x960_tt6&_nc_cat=104&ccb=1-7&_nc_sid=9f807c&_nc_ohc=JLVOOdFxmk0Q7kNvwEbovaO&_nc_oc=AdpXR_bpJsdd69iO2835i-ix4T5R1I3n-cQeL-ggM6dbQtZtS5nE1ZMYQL8RUNwGjq4&_nc_zt=23&_nc_ht=scontent-pmo1-1.xx&_nc_ss=7a32e&oh=03_Q7cD4wGNH9WqGYvqFUBT6XJnxbPB2gY1rl0EqLziCSf-idHfPA&oe=69F0A248', '2026-03-15 10:00:00', '2026-03-18 09:00:00'),
    (5014, 1011, 'Perla', 'CAT', 'Russian Blue', 3.80, '2019-01-01', 'FEMALE', 'https://i.ibb.co/d49J2jhd/image.png', '2026-03-18 09:15:00', '2026-03-18 09:15:00');

COMMIT;

SET FOREIGN_KEY_CHECKS
= 1;
