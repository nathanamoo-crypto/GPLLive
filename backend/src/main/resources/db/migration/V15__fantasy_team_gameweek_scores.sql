CREATE TABLE fantasy_team_gameweek_scores (
                                              id SERIAL PRIMARY KEY,
                                              fantasy_team_id INT NOT NULL REFERENCES fantasy_teams(id) ON DELETE CASCADE,
                                              gameweek_id INT NOT NULL REFERENCES gameweeks(id) ON DELETE CASCADE,
                                              total_points INT NOT NULL DEFAULT 0,
                                              CONSTRAINT unique_team_gameweek_score UNIQUE (fantasy_team_id, gameweek_id)
);

-- Indexing gameweek and points together makes global and mini-league leaderboards super fast
CREATE INDEX idx_gameweek_leaderboard ON fantasy_team_gameweek_scores(gameweek_id, total_points DESC);