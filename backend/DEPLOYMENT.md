# Deploying the shared backend (free)

This deploys the backend once to a URL every teammate's app can reach, so
nobody needs Postgres or Java installed locally just to use/test the app.
Total cost: $0, no credit card required on either service.

Stack: **Render** (runs the Spring Boot app) + **Neon** (Postgres database).

## 1. Create the database (Neon)

1. Go to https://neon.tech and sign up (no credit card needed).
2. Create a new project (any name, e.g. `gpl-fantasy`).
3. On the project dashboard, find the **connection string**. It looks like:
   `postgresql://neondb_owner:AbC123xyz@ep-cool-name-12345.us-east-2.aws.neon.tech/neondb?sslmode=require`
4. Break that one string into the three pieces the backend needs:
   - `DATABASE_URL` = `jdbc:postgresql://ep-cool-name-12345.us-east-2.aws.neon.tech/neondb?sslmode=require`
     (same host/db/params as the connection string, just with `jdbc:` in
     front instead of the `user:password@` part)
   - `DATABASE_USERNAME` = `neondb_owner` (the part before the `:` after `postgresql://`)
   - `DATABASE_PASSWORD` = `AbC123xyz` (the part between `:` and `@`)

   Keep these three values handy for step 2.

## 2. Deploy the app (Render)

1. Go to https://render.com and sign up with your GitHub account (no credit
   card needed).
2. Push this backend repo to GitHub first if you haven't (see "Pushing to
   GitHub" below).
3. In Render: **New +** → **Web Service** → connect the GitHub repo.
4. Configure:
   - **Branch**: `develop` (matches the frontend repo's working branch - Render
     redeploys automatically every time anyone pushes to this branch, so the
     shared backend stays current with the team's latest work)
   - **Language**: Docker (Render's Java buildpack isn't available - there's a
     `Dockerfile` in the repo root that builds and runs the app instead; with
     Docker selected, Render just uses it automatically, no build/start
     command fields needed)
   - **Instance Type**: Free
5. Add environment variables (Render's "Environment" tab):
   | Key | Value |
   |---|---|
   | `SPRING_PROFILES_ACTIVE` | `prod` |
   | `DATABASE_URL` | (from step 1) |
   | `DATABASE_USERNAME` | (from step 1) |
   | `DATABASE_PASSWORD` | (from step 1) |
   | `JWT_SECRET` | any long random string - e.g. generate one with `openssl rand -base64 48` |
6. Click **Deploy**. First build takes a few minutes. Flyway will
   automatically create all the tables in the new Neon database on first
   startup - no manual migration step needed.
7. Once live, Render gives you a URL like `https://gplfantasyleaague.onrender.com`.
   Test it: open `https://<your-url>/fixtures` in a browser - you should get
   a JSON response (empty array is fine, means it's working) rather than an
   error page.

**Free tier caveat**: Render's free web service spins down after 15 minutes
of no traffic. The next request after that wakes it back up but takes
20-50 seconds. This is normal and fine for a student project - just means
the first request after a break is slow, not broken.

## 3. Point the frontend at it

In the frontend repo, open `src/constants/apiUrls.ts` and replace the
placeholder with your real Render URL:

```ts
const API_HOST = process.env.EXPO_PUBLIC_API_HOST ?? 'https://your-actual-url.onrender.com';
```

Commit and push. Every teammate gets this automatically on their next
`git pull` - nobody needs to configure anything locally to use the shared
backend. Anyone who wants to point at their own machine instead (e.g. while
testing an in-progress backend change) can still override it locally via
`.env.local` - see the comment in `apiUrls.ts`.

## Team git workflow

Standard `develop` + `main` setup: everyone pushes/merges feature work into
`develop` day-to-day. `main` stays as the stable branch, updated by merging
`develop` into it periodically (e.g. after a milestone or before a demo) -
not on every single commit.

## Pushing to GitHub (if not already done)

Backend (from this repo's root) - creates both branches at the same
starting point:
```
git commit -m "Initial commit"
git remote add origin https://github.com/<your-username>/<repo-name>.git

git branch -M develop
git push -u origin develop

git checkout -b main
git push -u origin main
```

Create the empty repo on GitHub first (github.com → New repository) before
running the commands above.

Later, to promote develop's work into main:
```
git checkout main
git merge develop
git push
```
