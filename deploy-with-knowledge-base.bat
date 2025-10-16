@echo off
echo ========================================
echo Deploying Gabu's Tutor with Knowledge Base
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
echo New Features Added:
echo ✓ Knowledge Base with AI insights
echo ✓ Scrolling banner with latest tech news
echo ✓ Clickable modals with detailed explanations
echo ✓ Categories: Medicine, Agriculture, Creativity, Climate, Career, Daily Life, Education, Research
echo ✓ Auto-updating content every 5 seconds
echo ✓ Parent-friendly content and SEO optimization
echo.
echo Your app is now available at:
echo https://somaai-gabu.web.app
echo https://somaai-gabu.firebaseapp.com
echo.
pause
