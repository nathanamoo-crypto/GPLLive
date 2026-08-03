CREATE TABLE player_gameweek_stats (
                                       id SERIAL PRIMARY KEY,
                                       player_id INT NOT NULL REFERENCES players(id) ON DELETE RESTRICT,
                                       fixture_id INT NOT NULL REFERENCES fixtures(id) ON DELETE CASCADE,
                                       minutes_played INT NOT NULL DEFAULT 0,
                                       goals_scored INT NOT NULL DEFAULT 0,
                                       assists INT NOT NULL DEFAULT 0,
                                       clean_sheet BOOLEAN NOT NULL DEFAULT FALSE,
                                       yellow_card INT NOT NULL DEFAULT 0,
                                       red_card BOOLEAN NOT NULL DEFAULT FALSE,
                                       saves INT NOT NULL DEFAULT 0,
                                       fantasy_point INT NOT NULL DEFAULT 0,
                                       CONSTRAINT unique_player_fixture_stat UNIQUE (player_id, fixture_id)
);

-- Indexing fixture_id helps when rendering match center stats
CREATE INDEX idx_player_stats_fixture ON player_gameweek_stats(fixture_id);
-- Indexing fantasy_point helps pull the top performers of a gameweek instantly
CREATE INDEX idx_player_stats_points ON player_gameweek_stats(fantasy_point DESC);