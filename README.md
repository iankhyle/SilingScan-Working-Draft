# SilingScan

SilingScan is a chili pepper crop-management application with a React frontend
and an Express/PostgreSQL backend.

## Repository layout

- `SilingScan-Frontend/` — React application
- `SilingScan-Backend/` — Express API and Drizzle database schema

## Run locally

### Backend

1. Create `SilingScan-Backend/.env` from `.env.example` and set a valid
   `DATABASE_URL`. Keep `.env` private.
2. From `SilingScan-Backend/`, install dependencies and prepare the database:

   ```sh
   npm install
   npm run db:push
   npm run dev
   ```

   The API listens on `http://localhost:8000` by default.

### Frontend

1. Create `SilingScan-Frontend/.env.local` from `.env.example` if the API is
   not running at its default local URL.
2. From `SilingScan-Frontend/`, install dependencies and start the app:

   ```sh
   npm install
   npm run dev
   ```

See each application folder's README for additional setup and available scripts.

## Deploy with Netlify, Render, and Neon

The frontend is deployed to Netlify, the existing Express API runs as a Render
web service, and Neon provides PostgreSQL. Netlify does not connect directly
to Neon: it calls the API, which reads and writes data in Neon.

1. Create a Neon PostgreSQL project and database. Set the database schema up
   with the backend's `npm run db:push` command using the Neon connection
   string as `DATABASE_URL`.
2. In Render, create a Blueprint from this repository and select `render.yaml`.
   Set `DATABASE_URL` to the Neon connection string and choose a private
   `ADMIN_PASSWORD` of at least 12 characters. Enter a new password directly
   in Render and do not send it in chat or store it in source control. The API
   synchronizes the administrator account password from this private value on
   startup. The blueprint creates the API
   service and exposes `/api/health`.
3. In Netlify, import the same repository. It reads `netlify.toml` to build
   `SilingScan-Frontend`. Set the required `VITE_API_URL` to the Render service
   URL with `/api` appended, for example
   `https://silingscan-api.onrender.com/api`, then deploy. The production
   build fails if this variable is missing rather than silently shipping a
   frontend pointed at localhost.
4. Copy the deployed Netlify site origin (for example
   `https://your-site.netlify.app`, without a path or trailing slash) into
   Render's `CORS_ORIGINS` environment variable and redeploy the API.
5. Check `https://<your-api-host>/api/health`. Sign in to the API-provisioned
   administrator account at the deployed Netlify login page; uploaded scans
   are saved in Neon and visible from the admin workspace.

The sample Render service uses its free plan, which may sleep when idle and
take longer to answer the first request. Set up both hosting services and
their environment variables before expecting the deployed frontend to reach
the API.
