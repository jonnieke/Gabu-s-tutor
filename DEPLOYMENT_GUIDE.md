# Gabu's Tutor - Deployment Guide

## Issues Fixed

1. **Environment Variables**: Added fallback values for missing environment variables
2. **TypeScript Configuration**: Added Vite client types to resolve import.meta.env issues
3. **React Version**: Downgraded from React 19 to React 18 for better compatibility
4. **Dependencies**: Added missing TypeScript type definitions

## Environment Variables for Vercel

Add these environment variables in your Vercel dashboard:

### Required
```
GEMINI_API_KEY=AIzaSyCmlHJZGwAOSct5qaBAZJ9t0ANys1_hb3o
```

### Optional (Firebase - for full functionality)
```
VITE_FIREBASE_API_KEY=AIzaSyBqBYxOcIBIx3BLFI6-suErpAx5nxb8TF0
VITE_FIREBASE_AUTH_DOMAIN=somaai-gabu.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=somaai-gabu
VITE_FIREBASE_STORAGE_BUCKET=somaai-gabu.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=317429740899
VITE_FIREBASE_APP_ID=1:317429740899:web:39a02cfe21a88b218a4f56
VITE_FIREBASE_MEASUREMENT_ID=G-G7D5GBTSQQ
```

## Deployment Steps

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Build the Application**:
   ```bash
   npm run build
   ```

3. **Deploy to Vercel**:
   - Connect your GitHub repository to Vercel
   - Set the environment variables in Vercel dashboard
   - Deploy

## Testing

1. Visit `https://your-app.vercel.app/diagnostic.html` to check if the site loads
2. Check browser console for any errors
3. Test the main functionality

## Troubleshooting

If the site is still broken:

1. Check browser console for JavaScript errors
2. Verify environment variables are set correctly in Vercel
3. Check Vercel build logs for any build errors
4. Ensure all dependencies are properly installed

## Key Changes Made

- Fixed environment variable handling with fallbacks
- Updated TypeScript configuration
- Downgraded React version for stability
- Added proper error boundaries
- Created diagnostic page for troubleshooting
