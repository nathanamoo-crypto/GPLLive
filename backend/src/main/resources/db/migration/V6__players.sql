CREATE TYPE player_position AS ENUM ('GK', 'DEF', 'MID', 'FWD');
CREATE TYPE player_status AS ENUM ('AVAILABLE', 'INJURED', 'SUSPENDED', 'INACTIVE','INTERNATIONAL_DUTY');
CREATE TABLE players (
                         id SERIAL PRIMARY KEY,
                         full_name VARCHAR(255) NOT NULL,
                         club_id INT NOT NULL REFERENCES real_clubs(id) ON DELETE RESTRICT,
                         position player_position NOT NULL,
                         jersey_number INT,
                         photo_url VARCHAR(255),
                         status player_status NOT NULL DEFAULT 'AVAILABLE',
                         nationality VARCHAR(100) NOT NULL
);