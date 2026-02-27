# 404 Error Fix Script for Vercel Deployment
# Run this if you are getting 404 errors after deployment

Write-Host "Checking Vercel deployment configuration for 404 fixes..." -ForegroundColor Yellow

# Check if we are in the correct directory
if (-not (Test-Path "vercel.json")) {
    Write-Host "ERROR: vercel.json not found!" -ForegroundColor Red
    Write-Host "Make sure you are running this from the project root directory." -ForegroundColor Red
    Write-Host "Current directory: $PWD" -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Path "frontend")) {
    Write-Host "❌ ERROR: frontend directory not found!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Project structure looks correct" -ForegroundColor Green

# Check vercel.json configuration
$vercelConfig = Get-Content "vercel.json" | ConvertFrom-Json
if ($vercelConfig.outputDirectory -eq "frontend/dist") {
    Write-Host "✅ Output directory correctly configured" -ForegroundColor Green
} else {
    Write-Host "❌ Output directory issue in vercel.json" -ForegroundColor Red
}

# Check if _redirects file exists
if (Test-Path "frontend/public/_redirects") {
    Write-Host "✅ _redirects file exists for SPA routing" -ForegroundColor Green
} else {
    Write-Host "❌ _redirects file missing" -ForegroundColor Red
    Write-Host "   Creating _redirects file..." -ForegroundColor Yellow
    New-Item -Path "frontend/public" -ItemType Directory -Force | Out-Null
    Set-Content -Path "frontend/public/_redirects" -Value "/* /index.html 200"
    Write-Host "✅ Created _redirects file" -ForegroundColor Green
}

# Test build
Write-Host "🏗️ Testing build process..." -ForegroundColor Yellow
Set-Location frontend
$buildResult = npm run build 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful" -ForegroundColor Green
    
    # Check if _redirects is copied to dist
    if (Test-Path "dist/_redirects") {
        Write-Host "✅ _redirects file copied to dist" -ForegroundColor Green
    } else {
        Write-Host "⚠️  _redirects not found in dist" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Build failed:" -ForegroundColor Red
    Write-Host $buildResult -ForegroundColor Red
    Set-Location ..
    exit 1
}

Set-Location ..

Write-Host ""
Write-Host "🚀 Ready to deploy! Run one of these commands:" -ForegroundColor Green
Write-Host "   vercel --prod" -ForegroundColor Cyan
Write-Host "   OR push to your connected GitHub repository" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔧 If you still get 404 errors after deployment:" -ForegroundColor Yellow
Write-Host "   1. Check Vercel dashboard Settings General" -ForegroundColor White
Write-Host "   2. Verify Output Directory equals frontend/dist" -ForegroundColor White
Write-Host "   3. Verify Build Command includes npm ci and npm run build" -ForegroundColor White
Write-Host "   4. Redeploy: vercel --prod" -ForegroundColor White