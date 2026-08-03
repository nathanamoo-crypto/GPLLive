CREATE TABLE fixture_results (
                                 id SERIAL PRIMARY KEY,
                                 fixture_id INT NOT NULL UNIQUE REFERENCES fixtures(id) ON DELETE CASCADE,
                                 home_score INT NOT NULL DEFAULT 0,
                                 away_score INT NOT NULL DEFAULT 0,
                                 home_possession INT NOT NULL DEFAULT 0,
                                 away_possession INT NOT NULL DEFAULT 0,
                                 recorded_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);