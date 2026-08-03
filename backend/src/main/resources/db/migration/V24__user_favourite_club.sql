-- Replace the free-text favourite_team column with a real link to real_clubs,
-- so a user's favourite club always points at an actual club record instead
-- of an arbitrary string.
ALTER TABLE users
    ADD COLUMN favourite_club_id INT REFERENCES real_clubs(id);

ALTER TABLE users
    DROP COLUMN favourite_team;
