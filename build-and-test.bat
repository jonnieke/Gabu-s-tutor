@echo off
echo ========================================
echo Building Gabu's Tutor with CSS Fix
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

echo Step 4: Starting preview server...
echo Your app will be available at http://localhost:4173
echo Press Ctrl+C to stop the server
npm run preview
