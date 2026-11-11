# Safe Status Dashboard

This folder is an isolated, read-only Node.js status dashboard. It does not import, execute, or communicate with files in the repository root.

## Included
- HTTP Basic Authentication for the dashboard
- Rate-limited authenticated routes
- Helmet security headers and a restrictive Content Security Policy
- Read-only runtime status: uptime, Node.js version, platform, and process memory
- Public `/health` endpoint for hosting health checks

## Explicitly not included
No device enrollment, device control, Telegram integration, camera/microphone access, SMS/contacts/location access, keylogging, file browsing/uploads, remote shell, arbitrary command execution, or data exfiltration.

## Deploy on Render
1. Open Render and choose **New > Blueprint**.
2. Connect this repository.
3. Set the Blueprint file path to `safe-dashboard/render.yaml`.
4. When prompted, set `DASHBOARD_USER` and `DASHBOARD_PASSWORD`. Use a unique password with at least 20 characters. Do not commit secrets to GitHub.
5. Deploy the Blueprint. Render will build and start only this folder because its service root is configured separately by the Blueprint path's service configuration below.

## Run locally
Use Node.js 20 or later:
```sh
cd safe-dashboard
npm install
DASHBOARD_USER=admin DASHBOARD_PASSWORD='replace-with-a-long-random-secret' npm start
```
Open `http://localhost:3000`. The browser will request the Basic Auth credentials.

## Important
The root-level project files are not used by this dashboard. Do not deploy the root-level server. For Render monorepo isolation, configure the service **Root Directory** as `safe-dashboard` and use `npm install` / `npm start` as the build and start commands.
