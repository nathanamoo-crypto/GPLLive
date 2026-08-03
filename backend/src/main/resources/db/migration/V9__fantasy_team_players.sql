CREATE TABLE fantasy_team_players (
                                      id SERIAL PRIMARY KEY,
                                      fantasy_team_id INT NOT NULL REFERENCES fantasy_teams(id) ON DELETE CASCADE,
                                      player_id INT NOT NULL REFERENCES players(id) ON DELETE RESTRICT,
                                      is_part_of_xi BOOLEAN NOT NULL DEFAULT FALSE,
                                      is_captain BOOLEAN NOT NULL DEFAULT FALSE,
                                      is_vice_captain BOOLEAN NOT NULL DEFAULT FALSE,
                                      purchase_price NUMERIC(15, 2) NOT NULL,
                                      current_price NUMERIC(15, 2) NOT NULL
);