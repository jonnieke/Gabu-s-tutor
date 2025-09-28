# PowerShell script to start the dev server
Set-Location "D:\gabu's tutor\Gabu-s-tutor"
Write-Host "Current directory: $(Get-Location)"
Write-Host "Checking for package.json..."
if (Test-Path "package.json") {
    Write-Host "package.json found! Starting dev server..."
    npm run dev
} else {
    Write-Host "package.json not found in current directory"
    Write-Host "Contents of current directory:"
    Get-ChildItem
}
