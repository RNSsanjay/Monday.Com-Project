# Vercel Deployment Script for Monday.com BI Project (PowerShell)

Write-Host "🚀 Starting Vercel deployment for Monday.com BI Project..." -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "vercel.json")) {
    Write-Host "❌ Error: vercel.json not found. Please run this script from the project root." -ForegroundColor Red
    exit 1
}

# Check if frontend directory exists
if (-not (Test-Path "frontend")) {
    Write-Host "❌ Error: frontend directory not found." -ForegroundColor Red
    exit 1
}

Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
Set-Location frontend
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies." -ForegroundColor Red
    exit 1
}

Write-Host "🔍 Type checking..." -ForegroundColor Yellow
npm run type-check

Write-Host "🏗️ Building project..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful!" -ForegroundColor Green
    Set-Location ..
    
    Write-Host "🌐 Deploying to Vercel..." -ForegroundColor Yellow
    npx vercel --prod
    
    Write-Host "🎉 Deployment complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Post-deployment checklist:" -ForegroundColor Cyan
    Write-Host "1. ✅ Verify environment variables in Vercel dashboard" -ForegroundColor White
    Write-Host "2. ✅ Test Monday.com API integration" -ForegroundColor White
    Write-Host "3. ✅ Test Groq AI functionality" -ForegroundColor White
    Write-Host "4. ✅ Check console for any errors" -ForegroundColor White
    Write-Host ""
    Write-Host "🔗 Your app should be live at your Vercel URL!" -ForegroundColor Green
} else {
    Write-Host "❌ Build failed. Please check the errors above." -ForegroundColor Red
    exit 1
}