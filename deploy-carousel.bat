@echo off
echo Building Gabu's Tutor with Carousel Knowledge Base...
echo.

echo Step 1: Installing dependencies...
call npm install

echo.
echo Step 2: Building the application...
call npm run build

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Build successful! 
    echo.
    echo Step 3: Deploying to Firebase...
    call firebase deploy
    
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo 🎉 Deployment successful! Your Knowledge Base carousel is live!
        echo Visit: https://somaai-gabu.web.app
    ) else (
        echo.
        echo ❌ Firebase deployment failed. Please check your Firebase configuration.
    )
) else (
    echo.
    echo ❌ Build failed. Please check the error messages above.
)

echo.
pause
