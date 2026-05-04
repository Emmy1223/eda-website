Minimal backend for Emmys Digital Academy demo site

This workspace contains a minimal Express backend (`server.js`) to handle password-reset verification codes and serve the static site. It's intentionally lightweight so you can test a server-driven verification flow locally.

Quick start

1. Install dependencies (PowerShell):

```powershell
cd 'c:\Users\HI\Documents\EDA Website'
npm install
```

2. Run the server in dev mode (prints codes to console and includes them in API response):

```powershell
npm run dev
```

3. Open your browser at: http://localhost:3000/forgot-password.html

If you're using VS Code Live Server (default port 5500)

- Option A (recommended for simple testing): keep Live Server running on port 5500 and run this backend on port 3000 (default). The backend now allows Cross-Origin requests from `http://localhost:5500` for local testing. No additional config required.

- Option B: run the backend on port 5500 instead (stop Live Server), e.g. set the `PORT` env var before starting:

```powershell
$env:PORT = '5500'; npm start
```

or using the dev script:

```powershell
$env:DEV = 'true'; $env:PORT = '5500'; npm run dev
```

If you prefer to restrict allowed origins, set `ALLOWED_ORIGINS` to a comma-separated list (e.g. `http://localhost:5500,http://127.0.0.1:5500`).

Notes

- **Production Setup**:
  - Set `DEV=false` to disable dev mode (codes not returned in responses).
  - Configure SMTP for real emails: set environment variables `SMTP_HOST`, `SMTP_PORT` (default 587), `SMTP_USER`, `SMTP_PASS`, `FROM_EMAIL` (optional), `SMTP_SECURE` (true for port 465).
  - The backend now includes full user management with SQLite database and bcrypt hashing.
  - Login and signup are now server-side; passwords are hashed and stored securely.
  - Password reset updates the database.

- For local testing, `DEV=true` (the `dev` script) will include the generated code in the API response so you can test without SMTP.
- The backend serves static files and handles CORS for local development.

Security

- Passwords are hashed with bcrypt before storage.
- Do not use `DEV=true` in production.
- Use HTTPS in production and validate inputs thoroughly.

Files added

- `server.js` — Express backend with `/api/send-reset-code`, `/api/verify-reset-code`, `/api/reset-password`.
- `package.json` — scripts and dependencies.

If you want, I can:
- Add a small users JSON file on the server so password resets update server-side users as well.
- Add email templates and better error handling.
- Add automated tests for the new endpoints.

Server-side users (added)

- This project now includes a `users.json` file in the project root. It's a simple demo user store used by the server so that `/api/reset-password` can update a user's password server-side when a valid code and `newPassword` are provided.
- The demo stores passwords as plaintext for simplicity. For any real deployment, replace this with a proper database and store hashed passwords (bcrypt or similar).

If you'd like, I can:
- Migrate `users.json` to a small SQLite DB and add password hashing.
- Add server-side endpoints to create/delete/list users for admin purposes (demo-only).
