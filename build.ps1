Write-Host "Building Gabu's Tutor..." -ForegroundColor Green
try {
    npm run build
    Write-Host "Build completed successfully!" -ForegroundColor Green
} catch {
    Write-Host "Build failed: $($_.Exception.Message)" -ForegroundColor Red
}
Read-Host "Press Enter to continue"
