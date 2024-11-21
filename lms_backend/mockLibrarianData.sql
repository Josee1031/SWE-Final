-- CREATE TABLE User (
--     user_ID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
--     name VARCHAR(100) NOT NULL,
--     email VARCHAR(100) NOT NULL UNIQUE,
--     password VARCHAR(100) NOT NULL,
--     is_staff BOOLEAN DEFAULT FALSE
-- );

INSERT INTO User (user_ID, name, email, password, is_staff) VALUES
(1, "John Doe", "john.doe@example.com", 'password90', TRUE),
(2, "Martha Kent", "martha.kent@example.com", 'password91', TRUE),
(3, "Bruce Wayne", "bruce.wayne@example.com", 'password92', TRUE),
(4, "Clark Kent", "clark.kent@example.com", 'password93', TRUE),
(5, "Lois Lane", "lois.lane@example.com", 'password94', TRUE),
(6, "Peter Parker", "peter.parker@example.com", 'password95', TRUE),
(7, "Diana Prince", "diana.prince@example.com", 'password96', TRUE),
(8, "Natasha Romanoff", "natasha.romanoff@example.com", 'password97', TRUE),
(9, "Stephen Strange", "stephen.strange@example.com", 'password98', TRUE),
(10, "Tony Stark", "tony.stark@example.com", 'password99', TRUE);
