CREATE TABLE fantasy_teams (
                               id SERIAL PRIMARY KEY,
                               user_id INT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
                               team_name VARCHAR(100) NOT NULL UNIQUE,
                               budget_remaining NUMERIC(15, 2) NOT NULL DEFAULT 100000000.00,
                               total_points INT NOT NULL DEFAULT 0,
                               transfer_points INT NOT NULL DEFAULT 5,
                               created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                               updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                               free_hit_budget_snapshot NUMERIC(15, 2)
);