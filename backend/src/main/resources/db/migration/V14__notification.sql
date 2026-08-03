CREATE TYPE notification_type_enum AS ENUM ('DEADLINE', 'RANK', 'GOAL', 'CAPTAIN');
CREATE TABLE notifications (
                               id SERIAL PRIMARY KEY,
                               user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                               message VARCHAR(255) NOT NULL,
                               is_read BOOLEAN NOT NULL DEFAULT FALSE,
                               created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                               type notification_type_enum NOT NULL
);

-- Indexing user_id and is_read together makes fetching unread notifications lightning fast
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;