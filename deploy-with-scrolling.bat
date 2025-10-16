@echo off
echo Building Gabu's Tutor with Improved Knowledge Base...
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
        echo 🎉 Deployment successful! 
        echo.
        echo 🚀 New Features Deployed:
        echo   • Carousel-style Knowledge Base navigation
        echo   • Improved AI technology icons
        echo   • Scrolling content to prevent cropping
        echo   • Better responsive design
        echo.
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
