-- Elif pet health-record demo seed data
-- Import after backend/pet_profile_demo_seed.sql.

START
TRANSACTION;

SET FOREIGN_KEY_CHECKS
= 0;

DELETE FROM pet_health_record WHERE id BETWEEN 13001 AND 13100;

SET FOREIGN_KEY_CHECKS
= 1;

INSERT INTO pet_health_record
    (
    id, pet_id, record_date, visit_type, veterinarian, clinic_name, blood_type, spayed_neutered,
    allergies, chronic_conditions, previous_operations, vaccination_history, special_diet,
    parasite_prevention, emergency_instructions, diagnosis, treatment, medications, notes,
    next_visit_date, created_at, updated_at
    )
VALUES
    (13001, 5001, '2026-03-22', 'ANNUAL_CHECKUP', 'Dr. Nadia Ben Ali', 'Happy Paws Clinic', 'A+', 'YES',
     'None', 'None', 'None', 'Rabies 2025-03-20; DHPP 2025-03-20', 'High-protein kibble',
     'Monthly spot-on treatment', 'Call owner immediately if persistent vomiting', 'Healthy',
     'Routine wellness guidance', 'None', 'Weight stable, active and alert.', '2026-09-22',
     '2026-03-22 10:00:00', '2026-03-22 10:00:00'),

    (13002, 5002, '2026-03-25', 'VACCINATION', 'Dr. Sami Khlifi', 'City Vet Center', 'B+', 'NO',
     'Chicken allergy', 'Sensitive digestion', 'Dental cleaning 2025', 'FVRCP 2025-09-01',
     'Hypoallergenic wet food', 'Quarterly deworming', 'Avoid chicken-based medication flavoring',
     'Mild skin irritation', 'Topical treatment for 7 days', 'Omega-3 supplement',
     'Monitor scratching frequency.', '2026-04-25', '2026-03-25 16:30:00', '2026-03-25 16:30:00'),

    (13003, 5003, '2026-03-19', 'DENTAL_CHECK', 'Dr. Meriem Trabelsi', 'North Vet House', 'AB+', 'YES',
     'None', 'None', 'Tooth extraction 2024', 'Rabies 2025-05-11; FVRCP 2025-05-11',
     'Soft kibble for 7 days', 'Monthly deworming', 'No hard treats for one week',
     'Mild tartar buildup', 'Professional cleaning performed', 'Post-cleaning rinse',
     'Recovered well within 24h.', '2026-06-19', '2026-03-19 11:20:00', '2026-03-19 11:20:00'),

    (13004, 5004, '2026-03-24', 'INJURY_VISIT', 'Dr. Oussama Gharsalli', 'Westside Animal Care', 'O+', 'NO',
     'None', 'Hip sensitivity', 'None', 'Rabies 2025-11-03; DHPP 2025-11-03',
     'Joint-support formula', 'Tick collar every 8 months',
     'Reduce running and stairs for 10 days', 'Front paw sprain',
     'Anti-inflammatory plan and rest', 'Carprofen 25mg daily x5',
     'Follow-up if limping continues.', '2026-04-03', '2026-03-24 09:40:00', '2026-03-24 09:40:00'),

    (13005, 5006, '2026-03-26', 'LAB_TEST', 'Dr. Aya Mzoughi', 'PetLife Diagnostics', 'A-', 'YES',
     'Pollen', 'None', 'Spay surgery 2024', 'Rabies 2025-04-20; DHPP 2025-04-20',
     'Weight-management diet', 'Topical flea prevention monthly',
     'Watch hydration and appetite', 'Routine blood panel',
     'No abnormalities detected', 'None', 'Results shared with owner by email.',
     '2026-09-26', '2026-03-26 13:15:00', '2026-03-26 13:15:00'),

    (13006, 5007, '2026-03-21', 'GROOMING_CLEARANCE', 'Dr. Hichem Saidi', 'Coastal Vet Clinic', 'B-', 'YES',
     'None', 'Mild dermatitis', 'None', 'Rabies 2025-09-06; FVRCP 2025-09-06',
     'Skin-sensitive nutrition', 'Deworm every 3 months',
     'Use hypoallergenic shampoo only', 'Dermatitis stable',
     'Topical care maintained', 'Skin spray as needed',
     'Cleared for grooming package.', '2026-06-21', '2026-03-21 08:55:00', '2026-03-21 08:55:00'),

    (13007, 5008, '2026-03-23', 'ANNUAL_CHECKUP', 'Dr. Rania Hammami', 'Prime Animal Center', 'O-', 'YES',
     'Beef protein', 'None', 'Knee surgery 2023', 'Rabies 2025-01-15; DHPP 2025-01-15',
     'Large-breed maintenance diet', 'Monthly tick and flea combo',
     'Avoid high-impact jumps', 'General health good',
     'Continue current conditioning plan', 'Glucosamine daily',
     'Slight overweight trend, monitor portions.', '2026-09-23',
     '2026-03-23 15:10:00', '2026-03-23 15:10:00'),

    (13008, 5009, '2026-03-27', 'VACCINATION', 'Dr. Khaled Ben Youssef', 'Central Pet Hospital', 'A+', 'NO',
     'None', 'None', 'None', 'Rabies 2026-03-27; DHPP 2026-03-27',
     'Puppy growth formula', 'Deworming every 6 weeks',
     'Observe for fever or fatigue 24h after shots', 'Vaccines administered on schedule',
     'Standard post-vaccine observation', 'None',
     'Owner advised on booster timeline.', '2026-04-27',
     '2026-03-27 17:00:00', '2026-03-27 17:00:00');

COMMIT;

SET FOREIGN_KEY_CHECKS
= 1;
