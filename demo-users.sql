-- Add demo users for the stories
INSERT INTO usertbl (userid, password, email, name, age, interest, location, profileimg, cdate) VALUES 
('demo-user-1', 'demo123', 'user1@demo.com', 'Alice Writer', '28', 'Fantasy, Adventure', 'New York', '/demo-avatar-1.jpg', NOW()),
('demo-user-2', 'demo123', 'user2@demo.com', 'Sam Explorer', '32', 'Science Fiction, Space', 'California', '/demo-avatar-2.jpg', NOW()),
('demo-user-3', 'demo123', 'user3@demo.com', 'Detective Annie', '25', 'Mystery, Detective', 'London', '/demo-avatar-3.jpg', NOW()),
('test-viewer', 'demo123', 'viewer@demo.com', 'Story Reader', '30', 'All genres', 'Global', '/demo-avatar-4.jpg', NOW());