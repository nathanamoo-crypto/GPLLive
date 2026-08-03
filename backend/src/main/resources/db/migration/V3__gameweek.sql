CREATE TABLE gameweeks (
                           id SERIAL PRIMARY KEY,
                           season VARCHAR(20) NOT NULL,
                           gameweek_number INT NOT NULL,
                           start_date TIMESTAMP WITHOUT TIME ZONE NOT NULL,
                           end_date TIMESTAMP WITHOUT TIME ZONE NOT NULL,
                           is_current BOOLEAN NOT NULL DEFAULT FALSE,
                           deadline TIMESTAMP WITHOUT TIME ZONE NOT NULL,
                           CONSTRAINT unique_season_gameweek UNIQUE (season, gameweek_number)
);