#!/bin/bash

echo "========================================"
echo "Gabu's Tutor - Firebase Deployment"
echo "========================================"
echo

echo "Step 1: Installing Firebase CLI..."
npm install -g firebase-tools
echo

echo "Step 2: Logging into Firebase..."
firebase login
echo

echo "Step 3: Building the application..."
npm run build
echo

echo "Step 4: Deploying to Firebase..."
firebase deploy
echo

echo "========================================"
echo "Deployment Complete!"
echo "========================================"
echo
echo "Your app should be available at:"
echo "https://somaai-gabu.web.app"
echo "https://somaai-gabu.firebaseapp.com"
echo
