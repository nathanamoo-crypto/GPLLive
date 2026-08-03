-- 1. Create the Fixture Status ENUM
CREATE TYPE fixture_status AS ENUM ('SCHEDULED', 'LIVE', 'FINISHED','POSTPONED');

-- 2. Create the Table
CREATE TABLE fixtures (
                          id SERIAL PRIMARY KEY,
                          gameweek_id INT NOT NULL REFERENCES gameweeks(id) ON DELETE CASCADE,
                          home_club_id INT REFERENCES real_clubs(id) ON DELETE RESTRICT,
                          away_club_id INT REFERENCES real_clubs(id) ON DELETE RESTRICT,
                          match_date TIMESTAMP WITHOUT TIME ZONE NOT NULL,
                          venue VARCHAR(255) NOT NULL,
                          status fixture_status NOT NULL DEFAULT 'SCHEDULED'
);