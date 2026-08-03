-- Test/dev-data fix: none of the seeded gameweeks (V19) were ever marked
-- is_current, so GET /gameweeks/current always 404s and any feature that
-- depends on "the active gameweek" (transfers, chip activation) can't be
-- exercised at all - the confirm button just silently has nothing to send.
-- Marks the season's last gameweek current and pushes its deadline/end_date
-- into the future (relative to whenever this migration actually runs), since
-- its originally seeded dates are already in the past for a season that's
-- already finished.
UPDATE gameweeks
SET is_current = TRUE,
    deadline = NOW() + INTERVAL '30 days',
    end_date = NOW() + INTERVAL '37 days'
WHERE season = '2025/2026' AND gameweek_number = 34;
