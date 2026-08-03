CREATE TABLE player_prices (
                               id SERIAL PRIMARY KEY,
                               player_id INT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
                               gameweek_id INT NOT NULL REFERENCES gameweeks(id) ON DELETE CASCADE,
                               price NUMERIC(15, 2) NOT NULL,
                               recorded_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);