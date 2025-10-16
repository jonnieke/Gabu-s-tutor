@echo off
echo ========================================
echo Deploying Gabu's Tutor with Fixes
echo ========================================
echo.

echo Step 1: Installing dependencies...
npm install
echo.

echo Step 2: Building the application...
npm run build
echo.

echo Step 3: Checking build output...
dir dist\assets
echo.

echo Step 4: Deploying to Firebase...
firebase deploy
echo.

echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo Your app should be available at:
echo https://somaai-gabu.web.app
echo https://somaai-gabu.firebaseapp.com
echo.
echo If you still see errors, try:
echo 1. Hard refresh (Ctrl+F5)
echo 2. Clear browser cache
echo 3. Check browser console for errors
echo.
pause
