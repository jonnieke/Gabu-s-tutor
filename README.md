<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1s37oVTLW1LUg7iXVPfAgL77fRR-69SlG

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## GCS Upload Service (optional)

A tiny server to receive data URLs and save JPGs to Google Cloud Storage.

Setup:
1. `cd server && npm install`
2. Set env:
   - `GCS_BUCKET` (public bucket name)
   - `GOOGLE_APPLICATION_CREDENTIALS` (path to service account JSON)
3. `npm start`

Client env (in project root `.env`):
```
GCS_UPLOAD_URL=http://localhost:8787/upload
GCS_PUBLIC_BASE_URL=https://storage.googleapis.com
```

Deploy to Cloud Run/Functions and update the two envs above for production.