CREATE TABLE transfers (
                           id SERIAL PRIMARY KEY,
                           fantasy_team_id INT NOT NULL REFERENCES fantasy_teams(id) ON DELETE CASCADE,
                           gameweek_id INT NOT NULL REFERENCES gameweeks(id) ON DELETE RESTRICT,
                           player_out_id INT NOT NULL REFERENCES players(id) ON DELETE RESTRICT,
                           player_in_id INT NOT NULL REFERENCES players(id) ON DELETE RESTRICT,
                           player_out_price NUMERIC(15, 2) NOT NULL,
                           player_in_price NUMERIC(15, 2) NOT NULL,
                           transferred_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                           is_free_transfer BOOLEAN NOT NULL DEFAULT TRUE
);