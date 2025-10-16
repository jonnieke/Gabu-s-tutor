# Firebase Deployment Guide for Gabu's Tutor

## Prerequisites

1. **Node.js** (version 16 or higher)
2. **npm** or **yarn**
3. **Firebase CLI**
4. **Git** (for version control)

## Step 1: Install Firebase CLI

### Option A: Install via npm (Recommended)
```bash
npm install -g firebase-tools
```

### Option B: Install via yarn
```bash
yarn global add firebase-tools
```

### Verify Installation
```bash
firebase --version
```

## Step 2: Login to Firebase

```bash
firebase login
```

This will open your browser and ask you to authenticate with your Google account.

## Step 3: Initialize Firebase in Your Project

Navigate to your project directory and run:

```bash
firebase init hosting
```

### Configuration Options:
1. **Select your Firebase project**: Choose `somaai-gabu`
2. **Public directory**: Enter `dist` (this is where Vite builds your app)
3. **Single-page app**: Enter `y` (since this is a React SPA)
4. **Overwrite index.html**: Enter `n` (we want to keep our built index.html)
5. **GitHub integration**: Enter `n` (optional, you can set this up later)

## Step 4: Configure Firebase Hosting

The `firebase init` command will create a `firebase.json` file. Let's verify it looks correct:

```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

## Step 5: Build Your Application

```bash
npm run build
```

This will create the `dist` folder with your production-ready files.

## Step 6: Deploy to Firebase

```bash
firebase deploy
```

## Step 7: Verify Deployment

After deployment, Firebase will provide you with a URL like:
- `https://somaai-gabu.web.app`
- `https://somaai-gabu.firebaseapp.com`

## Environment Variables for Firebase Hosting

Since Firebase Hosting is a static hosting service, you'll need to handle environment variables differently:

### Option 1: Build-time Environment Variables
Create a `.env.production` file:
```
GEMINI_API_KEY=AIzaSyCmlHJZGwAOSct5qaBAZJ9t0ANys1_hb3o
VITE_FIREBASE_API_KEY=AIzaSyBqBYxOcIBIx3BLFI6-suErpAx5nxb8TF0
VITE_FIREBASE_AUTH_DOMAIN=somaai-gabu.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=somaai-gabu
VITE_FIREBASE_STORAGE_BUCKET=somaai-gabu.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=317429740899
VITE_FIREBASE_APP_ID=1:317429740899:web:39a02cfe21a88b218a4f56
VITE_FIREBASE_MEASUREMENT_ID=G-G7D5GBTSQQ
```

### Option 2: Use Firebase Functions (Advanced)
For dynamic environment variables, you can use Firebase Functions, but for this app, build-time variables should work fine.

## Custom Domain (Optional)

1. Go to Firebase Console → Hosting
2. Click "Add custom domain"
3. Follow the DNS configuration instructions
4. Firebase will provide SSL certificates automatically

## Automatic Deployments with GitHub (Optional)

1. Connect your GitHub repository to Firebase
2. Set up automatic deployments on push
3. Configure build settings:
   - Build command: `npm run build`
   - Output directory: `dist`

## Troubleshooting

### Common Issues:

1. **Build fails**: Check that all dependencies are installed
2. **Environment variables not working**: Ensure `.env.production` file exists
3. **404 errors**: Check that `firebase.json` has proper rewrites for SPA
4. **Authentication issues**: Run `firebase logout` then `firebase login` again

### Useful Commands:

```bash
# Deploy only hosting
firebase deploy --only hosting

# Deploy with specific project
firebase deploy --project somaai-gabu

# View hosting history
firebase hosting:channel:list

# Rollback to previous deployment
firebase hosting:channel:rollback
```

## Security Considerations

1. **API Keys**: Never commit API keys to public repositories
2. **Firebase Rules**: Configure proper security rules for Firestore
3. **CORS**: Firebase Hosting handles CORS automatically

## Performance Optimization

1. **Caching**: Firebase Hosting provides automatic caching
2. **CDN**: Global CDN for fast content delivery
3. **Compression**: Automatic gzip compression
4. **HTTP/2**: Automatic HTTP/2 support

## Monitoring and Analytics

1. **Firebase Analytics**: Already configured with your measurement ID
2. **Performance Monitoring**: Available in Firebase Console
3. **Crashlytics**: For error tracking (optional)

## Next Steps After Deployment

1. Test all functionality on the live site
2. Set up monitoring and alerts
3. Configure custom domain (if desired)
4. Set up CI/CD pipeline for automatic deployments
