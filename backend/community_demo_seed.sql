-- Elif community demo seed data
-- Import with:
--   mysql -u root Elif < backend/community_demo_seed.sql
--
-- Demo credentials
--   admin1@elif.com / password
--   admin2@elif.com / password
--   vet1@elif.com / password
--   provider1@elif.com / password
--   user1@elif.com / password
--   user2@elif.com / password
--   user3@elif.com / password
--   user4@elif.com / password
--   user5@elif.com / password
--   user6@elif.com / password

START TRANSACTION;

SET FOREIGN_KEY_CHECKS = 0;

DELETE FROM message WHERE id BETWEEN 8001 AND 8010;
DELETE FROM conversation WHERE id BETWEEN 7001 AND 7003;
DELETE FROM community_vote WHERE id BETWEEN 6001 AND 6030;
DELETE FROM community_comment WHERE id BETWEEN 5001 AND 5030;
DELETE FROM community_post WHERE id BETWEEN 4001 AND 4020;
DELETE FROM flair WHERE id BETWEEN 3501 AND 3520;
DELETE FROM community_rule WHERE id BETWEEN 3001 AND 3020;
DELETE FROM community_member WHERE id BETWEEN 2501 AND 2550;
DELETE FROM community WHERE id BETWEEN 2001 AND 2010;
DELETE FROM `user` WHERE id BETWEEN 1001 AND 1015;

SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO `user` (
  id, first_name, last_name, email, password_hash, role, created_at, last_login
) VALUES
  (1001, 'Admin', 'One', 'admin1@elif.com', '$2y$10$317oVyzQHXK9Yjl0CWsh3u.hiJy/YV.vI1skpp2ChfI0BNbmUvx9G', 'ADMIN', '2026-03-01 09:00:00', '2026-03-18 08:10:00'),
  (1002, 'Admin', 'Two', 'admin2@elif.com', '$2y$10$317oVyzQHXK9Yjl0CWsh3u.hiJy/YV.vI1skpp2ChfI0BNbmUvx9G', 'ADMIN', '2026-03-01 09:05:00', '2026-03-18 08:20:00'),
  (1003, 'Nour', 'Vet', 'vet1@elif.com', '$2y$10$317oVyzQHXK9Yjl0CWsh3u.hiJy/YV.vI1skpp2ChfI0BNbmUvx9G', 'VET', '2026-03-02 10:00:00', '2026-03-17 18:15:00'),
  (1004, 'Sami', 'Provider', 'provider1@elif.com', '$2y$10$317oVyzQHXK9Yjl0CWsh3u.hiJy/YV.vI1skpp2ChfI0BNbmUvx9G', 'SERVICE_PROVIDER', '2026-03-02 10:30:00', '2026-03-17 11:45:00'),
  (1005, 'Lina', 'Peterson', 'user1@elif.com', '$2y$10$317oVyzQHXK9Yjl0CWsh3u.hiJy/YV.vI1skpp2ChfI0BNbmUvx9G', 'USER', '2026-03-03 08:00:00', '2026-03-18 07:55:00'),
  (1006, 'Youssef', 'Haddad', 'user2@elif.com', '$2y$10$317oVyzQHXK9Yjl0CWsh3u.hiJy/YV.vI1skpp2ChfI0BNbmUvx9G', 'USER', '2026-03-03 08:10:00', '2026-03-17 21:00:00'),
  (1007, 'Meriem', 'Trabelsi', 'user3@elif.com', '$2y$10$317oVyzQHXK9Yjl0CWsh3u.hiJy/YV.vI1skpp2ChfI0BNbmUvx9G', 'USER', '2026-03-03 08:20:00', '2026-03-18 09:05:00'),
  (1008, 'Omar', 'Ben Ali', 'user4@elif.com', '$2y$10$317oVyzQHXK9Yjl0CWsh3u.hiJy/YV.vI1skpp2ChfI0BNbmUvx9G', 'USER', '2026-03-03 08:30:00', '2026-03-16 19:22:00'),
  (1009, 'Sara', 'Mansour', 'user5@elif.com', '$2y$10$317oVyzQHXK9Yjl0CWsh3u.hiJy/YV.vI1skpp2ChfI0BNbmUvx9G', 'USER', '2026-03-03 08:40:00', '2026-03-18 06:40:00'),
  (1010, 'Karim', 'Jaziri', 'user6@elif.com', '$2y$10$317oVyzQHXK9Yjl0CWsh3u.hiJy/YV.vI1skpp2ChfI0BNbmUvx9G', 'USER', '2026-03-03 08:50:00', '2026-03-17 22:10:00');

INSERT INTO community (
  id, name, slug, description, type, created_by, banner_url, icon_url, member_count, created_at
) VALUES
  (2001, 'Golden Retriever Club', 'golden-retriever-club', 'A friendly place for golden retriever owners to share daily routines, food tips, training wins, and health questions in one supportive space.', 'PUBLIC', 1005, 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=300&q=80', 5, '2026-03-05 09:00:00'),
  (2002, 'Cat Care Circle', 'cat-care-circle', 'Cat parents compare routines, litter solutions, enrichment ideas, and behavior advice while keeping answers calm, practical, and kind.', 'PUBLIC', 1006, 'https://images.unsplash.com/photo-1511044568932-338cba0ad803?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=300&q=80', 4, '2026-03-06 10:00:00'),
  (2003, 'First Time Adopters', 'first-time-adopters', 'Questions for people preparing to adopt their first pet, from supplies and settling in to the first vet visit and early training habits.', 'PUBLIC', 1003, 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=300&q=80', 4, '2026-03-07 11:00:00'),
  (2004, 'Rescue Foster Network', 'rescue-foster-network', 'A private coordination hub for foster families and volunteers sharing placement updates, urgent needs, and handoff logistics.', 'PRIVATE', 1002, 'https://images.unsplash.com/photo-1535930749574-1399327ce78f?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=300&q=80', 3, '2026-03-08 12:00:00');

INSERT INTO community_member (
  id, community_id, user_id, role, joined_at
) VALUES
  (2501, 2001, 1005, 'CREATOR', '2026-03-05 09:00:00'),
  (2502, 2001, 1003, 'MODERATOR', '2026-03-05 10:00:00'),
  (2503, 2001, 1006, 'MEMBER', '2026-03-05 10:30:00'),
  (2504, 2001, 1007, 'MEMBER', '2026-03-05 11:00:00'),
  (2505, 2001, 1009, 'MEMBER', '2026-03-05 11:15:00'),
  (2506, 2002, 1006, 'CREATOR', '2026-03-06 10:00:00'),
  (2507, 2002, 1003, 'MODERATOR', '2026-03-06 10:15:00'),
  (2508, 2002, 1005, 'MEMBER', '2026-03-06 11:00:00'),
  (2509, 2002, 1008, 'MEMBER', '2026-03-06 11:20:00'),
  (2510, 2003, 1003, 'CREATOR', '2026-03-07 11:00:00'),
  (2511, 2003, 1004, 'MODERATOR', '2026-03-07 11:20:00'),
  (2512, 2003, 1007, 'MEMBER', '2026-03-07 11:40:00'),
  (2513, 2003, 1010, 'MEMBER', '2026-03-07 12:00:00'),
  (2514, 2004, 1002, 'CREATOR', '2026-03-08 12:00:00'),
  (2515, 2004, 1004, 'MODERATOR', '2026-03-08 12:10:00'),
  (2516, 2004, 1009, 'MEMBER', '2026-03-08 12:20:00');

INSERT INTO community_rule (
  id, community_id, title, description, rule_order
) VALUES
  (3001, 2001, 'Be specific with health questions', 'Include age, food, recent symptoms, and what changed recently so replies can be more useful.', 1),
  (3002, 2001, 'Share routines, not judgment', 'Different families manage training and enrichment differently. Keep advice practical and respectful.', 2),
  (3003, 2002, 'No unsafe home remedies', 'When a cat may need medical attention, say so clearly and avoid risky DIY treatment suggestions.', 1),
  (3004, 2002, 'Indoor enrichment first', 'Posts about behavior should include scratching, climbing, and play context when possible.', 2),
  (3005, 2003, 'There are no silly beginner questions', 'This community is specifically for first-time adopters. Keep replies welcoming and clear.', 1),
  (3006, 2004, 'Protect foster privacy', 'Do not share adopter contact details, intake records, or exact addresses in public screenshots.', 1);

INSERT INTO flair (
  id, community_id, name, color, text_color
) VALUES
  (3501, 2001, 'Health', '#F97316', '#FFFFFF'),
  (3502, 2001, 'Training', '#0F766E', '#FFFFFF'),
  (3503, 2001, 'Food', '#2563EB', '#FFFFFF'),
  (3504, 2002, 'Behavior', '#7C3AED', '#FFFFFF'),
  (3505, 2002, 'Litter', '#DC2626', '#FFFFFF'),
  (3506, 2003, 'Adoption Prep', '#D97706', '#FFFFFF'),
  (3507, 2003, 'First Week', '#059669', '#FFFFFF'),
  (3508, 2004, 'Urgent', '#B91C1C', '#FFFFFF');

INSERT INTO community_post (
  id, community_id, user_id, title, content, image_url, type, flair_id, vote_score, view_count, created_at, updated_at, deleted_at
) VALUES
  (4001, 2001, 1005, 'What food schedule works best for an 8 month old golden?', 'Our puppy acts hungry all the time and I am trying to balance training treats with regular meals. I would love to hear what feeding schedule worked for your golden around this age and when you switched portions.', NULL, 'QUESTION', 3503, 9, 44, '2026-03-15 09:00:00', '2026-03-15 09:00:00', NULL),
  (4002, 2001, 1003, 'Loose leash practice that finally started working for my dog', 'The biggest change for us was shortening sessions and rewarding every calm check-in for one week straight. Once the pattern clicked, walks became much less frustrating for both of us.', NULL, 'DISCUSSION', 3502, 6, 31, '2026-03-15 13:30:00', '2026-03-15 13:30:00', NULL),
  (4003, 2002, 1006, 'My cat suddenly hates the new litter box setup', 'I changed the litter box location to a busier hallway and now my cat is hesitating and scratching outside the box instead. If anyone has transition tips, I would appreciate them before I move everything again.', NULL, 'QUESTION', 3505, 8, 27, '2026-03-16 08:15:00', '2026-03-16 08:15:00', NULL),
  (4004, 2002, 1008, 'Window perch plus puzzle feeder reduced 5am zoomies', 'Sharing this because the combination of morning play, a puzzle feeder, and a sunny perch made a bigger difference than any one thing alone. It might help someone dealing with restless indoor cats.', NULL, 'DISCUSSION', 3504, 5, 19, '2026-03-16 12:20:00', '2026-03-16 12:20:00', NULL),
  (4005, 2003, 1003, 'Checklist for the first 48 hours after adoption', 'I keep seeing the same early panic moments, so here is the starter checklist I give to first-time adopters: quiet room, fresh water, simple feeding plan, emergency numbers, and realistic expectations for decompression.', NULL, 'DISCUSSION', 3506, 12, 53, '2026-03-14 10:00:00', '2026-03-14 10:00:00', NULL),
  (4006, 2003, 1010, 'How soon should I book the first vet visit after adoption?', 'We are picking up our adopted kitten this weekend and I am unsure whether to schedule the first vet visit immediately or wait a few days for her to settle in. I want to do the right thing without creating extra stress.', NULL, 'QUESTION', 3507, 7, 22, '2026-03-17 09:40:00', '2026-03-17 09:40:00', NULL),
  (4007, 2004, 1004, 'Need weekend foster coverage for a medium energy dog', 'One of our regular foster families has an emergency this weekend. If you can cover Saturday to Monday, please comment with timing and whether you can handle medication reminders.', NULL, 'QUESTION', 3508, 4, 16, '2026-03-17 14:00:00', '2026-03-17 14:00:00', NULL);

INSERT INTO community_comment (
  id, post_id, parent_comment_id, user_id, content, image_url, vote_score, is_accepted_answer, created_at, deleted_at
) VALUES
  (5001, 4001, NULL, 1003, 'At that age I usually suggest three measured meals plus keeping training treats within the daily calorie budget. If appetite feels extreme even with proper portions, mention it at the next vet visit.', NULL, 6, true, '2026-03-15 09:20:00', NULL),
  (5002, 4001, NULL, 1006, 'We switched to two larger meals too early and it backfired for a while. Three meals gave us much steadier energy and fewer scavenging attempts.', NULL, 4, false, '2026-03-15 09:45:00', NULL),
  (5003, 4001, 5001, 1005, 'That helps a lot. I think the treat creep is the part I have been underestimating.', NULL, 2, false, '2026-03-15 10:00:00', NULL),
  (5004, 4002, NULL, 1007, 'Short sessions changed everything for us too. Once I stopped trying to fix the whole walk at once, progress got much more consistent.', NULL, 3, false, '2026-03-15 14:10:00', NULL),
  (5005, 4003, NULL, 1003, 'If the only change was location, I would move the box back first and then reintroduce the new spot gradually. Busy areas can be a big factor for sensitive cats.', NULL, 5, true, '2026-03-16 09:00:00', NULL),
  (5006, 4003, NULL, 1005, 'Mine also refused a box when I switched the litter and location at the same time. Reverting one variable made troubleshooting much easier.', NULL, 3, false, '2026-03-16 09:30:00', NULL),
  (5007, 4005, NULL, 1007, 'The quiet room advice saved us. We were tempted to let our rescue explore the whole apartment immediately and that would have been too much.', NULL, 4, false, '2026-03-14 11:10:00', NULL),
  (5008, 4005, NULL, 1010, 'Would you add anything specific for first-night crate or carrier setup?', NULL, 1, false, '2026-03-14 11:40:00', NULL),
  (5009, 4005, 5008, 1003, 'Yes, a towel that already smells like the shelter or foster home can make the first night much easier for some pets.', NULL, 2, false, '2026-03-14 12:00:00', NULL),
  (5010, 4006, NULL, 1003, 'For a new adoption with no urgent symptoms, booking within the first week is usually a good balance. It gives you a baseline exam without making day one even more overwhelming.', NULL, 6, true, '2026-03-17 10:05:00', NULL),
  (5011, 4006, NULL, 1004, 'If you already have vaccine paperwork, bring it and write down any food or stool questions before the visit so you do not forget them.', NULL, 3, false, '2026-03-17 10:20:00', NULL),
  (5012, 4007, NULL, 1009, 'I can cover Saturday afternoon through Monday morning and I am comfortable with simple medication schedules.', NULL, 2, false, '2026-03-17 14:30:00', NULL);

INSERT INTO community_vote (
  id, user_id, target_id, target_type, value
) VALUES
  (6001, 1003, 4001, 'POST', 1),
  (6002, 1006, 4001, 'POST', 1),
  (6003, 1007, 4001, 'POST', 1),
  (6004, 1009, 4001, 'POST', 1),
  (6005, 1005, 5001, 'COMMENT', 1),
  (6006, 1006, 5001, 'COMMENT', 1),
  (6007, 1007, 5001, 'COMMENT', 1),
  (6008, 1005, 4005, 'POST', 1),
  (6009, 1007, 4005, 'POST', 1),
  (6010, 1010, 4005, 'POST', 1),
  (6011, 1004, 4006, 'POST', 1),
  (6012, 1003, 5005, 'COMMENT', 1);

INSERT INTO conversation (
  id, participant_one_id, participant_two_id, created_at, last_message_at
) VALUES
  (7001, 1005, 1003, '2026-03-16 15:00:00', '2026-03-18 08:30:00'),
  (7002, 1006, 1005, '2026-03-16 17:20:00', '2026-03-17 19:10:00'),
  (7003, 1009, 1004, '2026-03-17 13:50:00', '2026-03-17 14:15:00');

INSERT INTO message (
  id, conversation_id, sender_id, content, read_at, created_at, deleted_at
) VALUES
  (8001, 7001, 1005, 'Thanks again for the feeding advice in the retriever community.', '2026-03-16 15:05:00', '2026-03-16 15:01:00', NULL),
  (8002, 7001, 1003, 'Happy to help. If appetite spikes continue, keep a quick note for the next checkup.', '2026-03-16 15:06:00', '2026-03-16 15:04:00', NULL),
  (8003, 7001, 1005, 'Will do. I might post an update next week.', NULL, '2026-03-18 08:30:00', NULL),
  (8004, 7002, 1006, 'Did the cat litter transition ever settle down for you?', '2026-03-16 17:30:00', '2026-03-16 17:21:00', NULL),
  (8005, 7002, 1005, 'Yes, moving the box back for two days fixed the panic and then I changed location more slowly.', '2026-03-16 17:35:00', '2026-03-16 17:34:00', NULL),
  (8006, 7002, 1006, 'That is reassuring. I am going to try one change at a time tonight.', NULL, '2026-03-17 19:10:00', NULL),
  (8007, 7003, 1004, 'Can you confirm your availability for the foster handoff this weekend?', '2026-03-17 14:00:00', '2026-03-17 13:55:00', NULL),
  (8008, 7003, 1009, 'Yes, Saturday after 2pm works for me and I can take the supply bag too.', NULL, '2026-03-17 14:15:00', NULL);

COMMIT;
