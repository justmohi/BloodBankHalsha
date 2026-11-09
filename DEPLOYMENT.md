# Blood Bank Halsha — Firebase Hosting + Cloud Run

## Architecture

- Firebase Hosting serves the Vite production bundle from `dist/`.
- Firebase Hosting rewrites `/api/**` to the Cloud Run service `blood-bank-halsha-api` in `asia-south1`.
- Express runs from `server.ts` and listens on Cloud Run's `PORT`.
- Firebase Admin uses Application Default Credentials on Cloud Run. Do not upload a service-account JSON key.

## Prerequisites

- Node.js 22.12+ and npm
- Firebase CLI and Google Cloud CLI
- Access to Firebase project `blood-bank-halsha`
- A linked Cloud Billing account (Cloud Run requires a billing-enabled project)

## Configure frontend environment

Create a local `.env` file from `.env.example` and fill in the real Firebase Web App values for project `blood-bank-halsha`. These `VITE_*` values are compiled into the browser bundle; they are public client configuration, not server secrets. Do not commit `.env`.

Set the following server-side variables in Cloud Run (use Secret Manager for secrets):

- `GEMINI_API_KEY` — secret; store in Secret Manager
- `APP_URL` — Firebase Hosting URL after first deploy
- `VITE_FIREBASE_PROJECT_ID=blood-bank-halsha` — Admin SDK project selection fallback

The Firebase Admin SDK on Cloud Run should use the service account's Application Default Credentials. Grant that service account only the roles it needs, including Firestore access. Do not set `GOOGLE_APPLICATION_CREDENTIALS` to a downloaded key file.

## Build and deploy

1. Install dependencies and build the frontend locally:

   ```bash
   npm install
   npm run build
   ```

2. Set the active Google Cloud project and enable required APIs:

   ```bash
   gcloud config set project blood-bank-halsha
   gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com
   ```

3. Build and deploy the API container (run from the repository root after `dist/` exists):

   ```bash
   gcloud builds submit --tag asia-south1-docker.pkg.dev/blood-bank-halsha/cloud-run-source-deploy/blood-bank-halsha-api
   gcloud run deploy blood-bank-halsha-api --image asia-south1-docker.pkg.dev/blood-bank-halsha/cloud-run-source-deploy/blood-bank-halsha-api --region asia-south1 --platform managed --allow-unauthenticated --set-env-vars NODE_ENV=production,PORT=8080,VITE_FIREBASE_PROJECT_ID=blood-bank-halsha
   ```

   Configure `GEMINI_API_KEY` through Secret Manager and attach it to the Cloud Run service; do not put secret values in shell history or source control. Grant the Cloud Run runtime service account the minimum required Firestore permissions.

4. Deploy only Hosting first:

   ```bash
   firebase use blood-bank-halsha
   firebase deploy --only hosting
   ```

   The Hosting rewrite sends `/api/**` requests to the Cloud Run service. The Cloud Run service must be deployed before the API rewrite can work.

## Important security gate

The existing Firestore rules currently allow any signed-in user to create `requestRecipients` and `notifications`, and allow any signed-in user to create blood requests without checking that `requesterId` matches the caller. The current client code writes some of these documents directly. Do not deploy the Firestore rules to production until those writes are moved behind authenticated server endpoints and the rules are tightened and tested in the Emulator Suite.

The Express token verifier rejects unverified JWT payloads. Firebase Admin must be able to verify Firebase ID tokens using the Cloud Run service account / project configuration.

## Verification

- Open the Hosting URL and confirm the SPA loads.
- Open `/healthz` on the Cloud Run service URL and confirm it returns `{ "status": "ok" }`.
- Test authenticated API routes with a real Firebase ID token.
- Check Cloud Run logs for Admin SDK / Firestore permission errors.
