#!/usr/bin/env bash

# Vercel Deployment Script for Monday.com BI Project

echo "🚀 Starting Vercel deployment for Monday.com BI Project..."

# Check if we're in the right directory
if [ ! -f "vercel.json" ]; then
    echo "❌ Error: vercel.json not found. Please run this script from the project root."
    exit 1
fi

# Check if frontend directory exists
if [ ! -d "frontend" ]; then
    echo "❌ Error: frontend directory not found."
    exit 1
fi

echo "📦 Installing dependencies..."
cd frontend
npm install

echo "🔍 Type checking..."
npm run type-check

echo "🏗️ Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    cd ..
    
    echo "🌐 Deploying to Vercel..."
    npx vercel --prod
    
    echo "🎉 Deployment complete!"
    echo ""
    echo "📋 Post-deployment checklist:"
    echo "1. ✅ Verify environment variables in Vercel dashboard"
    echo "2. ✅ Test Monday.com API integration"
    echo "3. ✅ Test Groq AI functionality"
    echo "4. ✅ Check console for any errors"
    echo ""
    echo "🔗 Your app should be live at your Vercel URL!"
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi