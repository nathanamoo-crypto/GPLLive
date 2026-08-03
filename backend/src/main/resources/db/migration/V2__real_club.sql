CREATE TYPE club_status AS ENUM ('ACTIVE', 'RELEGATED', 'WITHDRAWN', 'SUSPENDED');
CREATE TABLE real_clubs (
                            id SERIAL PRIMARY KEY,
                            full_name VARCHAR(255) NOT NULL,
                            short_name VARCHAR(50) NOT NULL,
                            logo_url VARCHAR(255),
                            home_ground VARCHAR(255) NOT NULL,
                            city VARCHAR(100) NOT NULL,
                            founded_year INT NOT NULL,
                            status club_status NOT NULL
);