CREATE TABLE motm_votes (
                            id SERIAL PRIMARY KEY,
                            user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                            fixture_id INT NOT NULL REFERENCES fixtures(id) ON DELETE CASCADE,
                            player_id INT NOT NULL REFERENCES players(id) ON DELETE RESTRICT,
                            voted_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                            CONSTRAINT unique_user_fixture_vote UNIQUE (user_id, fixture_id)
);