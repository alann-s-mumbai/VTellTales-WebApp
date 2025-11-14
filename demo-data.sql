-- Demo data for VTellTales database testing

-- Insert story types
INSERT INTO storytypes (stid, sttype) VALUES 
(1, 'Adventure'),
(2, 'Fantasy'),
(3, 'Educational'),
(4, 'Comedy'),
(5, 'Mystery'),
(6, 'Science Fiction');

-- Insert demo stories
INSERT INTO userstory (userid, storytitle, storydesc, storylike, storyimg, storystatus, storypages, storytype, createdate, statusbyadmin) VALUES 
('demo-user-1', 'The Magic Forest Adventure', 'Join Lucy as she discovers a magical forest filled with talking animals and hidden treasures.', 25, '/demo-cover-1.jpg', 1, 8, 2, NOW(), 1),
('demo-user-2', 'Space Explorer Sam', 'Follow Sam on an incredible journey through the solar system, meeting alien friends and solving cosmic puzzles.', 18, '/demo-cover-2.jpg', 1, 12, 6, NOW(), 1),
('demo-user-1', 'The Friendly Dragon', 'A heartwarming tale about a young dragon who just wants to make friends with the village children.', 31, '/demo-cover-3.jpg', 1, 6, 2, NOW(), 1),
('demo-user-3', 'Detective Annie''s Case', 'Help Detective Annie solve the mystery of the missing library books in this interactive adventure.', 22, '/demo-cover-4.jpg', 1, 10, 5, NOW(), 1),
('demo-user-2', 'The Laughing Robot', 'Meet Giggles, a robot who spreads joy and laughter wherever he goes in this fun-filled comedy.', 15, '/demo-cover-5.jpg', 1, 7, 4, NOW(), 1);