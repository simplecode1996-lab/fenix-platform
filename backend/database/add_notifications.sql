-- Add notifications table for admin notifications
CREATE TABLE IF NOT EXISTS notifications (
    notification_id SERIAL PRIMARY KEY,
    user_code INTEGER REFERENCES users(user_code) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_read ON notifications(is_read, created_at DESC);

COMMENT ON TABLE notifications IS 'Stores admin notifications for password resets and other events';
