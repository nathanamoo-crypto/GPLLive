-- Email verification for manual sign-up. DEFAULT TRUE backfills every
-- existing account as verified (they already logged in successfully
-- before this feature existed - no reason to lock anyone out
-- retroactively). New registrations explicitly set this to false in
-- application code and only flip it to true once the emailed code is
-- confirmed. Google Sign-In accounts are also set true immediately at
-- creation time, since Google already confirmed that email for us.
ALTER TABLE users ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE users ADD COLUMN verification_code VARCHAR(6);

ALTER TABLE users ADD COLUMN verification_code_expires_at TIMESTAMP WITHOUT TIME ZONE;
