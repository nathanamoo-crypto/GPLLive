CREATE TYPE chip_enum AS ENUM ('TRIPLE_CAPTAIN', 'WILDCARD', 'FREEHIT', 'BENCH_BOOST','WILDCARD_2');
CREATE TABLE chips (
                       id SERIAL PRIMARY KEY,
                       fantasy_team_id INT NOT NULL REFERENCES fantasy_teams(id) ON DELETE CASCADE,
                       gameweek_id INT NOT NULL REFERENCES gameweeks(id) ON DELETE RESTRICT,
                       chip_type chip_enum NOT NULL,
                       used_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                       CONSTRAINT unique_team_gameweek_chip UNIQUE (fantasy_team_id, gameweek_id)
);