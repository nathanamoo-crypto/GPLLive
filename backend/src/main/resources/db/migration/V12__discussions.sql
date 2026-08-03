CREATE TABLE discussions (
                             id SERIAL PRIMARY KEY,
                             user_id INT REFERENCES users(id) ON DELETE CASCADE,
                             fixture_id INT REFERENCES fixtures(id) ON DELETE CASCADE,
                             message TEXT NOT NULL,
                             created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);