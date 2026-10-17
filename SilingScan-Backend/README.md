# SilingScan backend

Express API and Drizzle ORM schema for the SilingScan frontend. PostgreSQL is
the source of truth for accounts, sessions, and scan history.

## Setup

1. Create a PostgreSQL database (Neon is supported) and copy its connection
   string.
2. Copy `.env.example` to `.env` and set `DATABASE_URL`. Keep `.env` private.
   Set `CORS_ORIGINS` to your deployed frontend origin (comma-separated if
   there is more than one); localhost is allowed for development. Set
   `ADMIN_EMAIL` and a private `ADMIN_PASSWORD` (12+ characters) to provision
   the private administrator account on the next server start.
   Admin is not a signup role; only the configured account can sign in as
   administrator. On startup, the configured admin password is synchronized
   to the existing admin account so changing the private environment variable
   also rotates its password.
3. From this folder, install dependencies and create the database tables:

   ```sh
   npm install
   npm run db:push
   npm run dev
   ```

The API listens on `http://localhost:8000` by default. Create an account from
the frontend signup form; accounts are stored in PostgreSQL and passwords are
hashed before storage.

## API

- `GET /api/health` — health check
- `POST /api/auth/signup` — create an account and session
- `POST /api/auth/login` — sign in
- `GET /api/auth/me` — get the current account
- `POST /api/auth/logout` — revoke the current session
- `GET /api/scans` — list scans allowed for the current role
- `POST /api/scans/analyze` — accept an image upload and run diagnosis
- `GET/POST /api/crops` — view and add the signed-in farmer's crop records
- `GET/POST /api/advisories` — browse and publish specialist field guidance
- `GET /api/admin/users` — administrator-only account directory
- `GET /api/admin/scans` — administrator-only list of uploaded scans and their owners
- `PATCH /api/admin/users/:id/role` — administrator-only role assignment

Image diagnosis remains unavailable until the trained disease-detection model
is connected. Valid uploads are still saved and shown as awaiting diagnosis;
the frontend does not present a fabricated prediction.

For production, run `npm run build` and `npm start`. Set `VITE_API_URL` in the
frontend to the deployed API's `/api` URL. Set `CORS_ORIGINS` to the exact
deployed frontend origin (comma-separated for multiple origins); localhost is
also allowed for development. The repository's root `render.yaml` provisions
the Express API on Render with its database and admin credentials supplied as
private service environment variables.
