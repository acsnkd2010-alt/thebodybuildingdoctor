#!/bin/bash
# Quick deployment script for Vercel

echo "🚀 Bodybuilding Media Channel - Vercel Deployment"
echo "=================================================="
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm i -g vercel
fi

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📝 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit: Bodybuilding Media Channel"
    echo "✅ Git repository initialized"
fi

echo ""
echo "🔐 Make sure you have your environment variables ready:"
echo "   - WORDPRESS_API_URL"
echo "   - WORDPRESS_API_KEY (WordPress Application Password)"
echo "   - JWT_SECRET (generate with: openssl rand -base64 32)"
echo ""
read -p "Press Enter to continue with deployment..."

echo ""
echo "🌐 Deploying to Vercel..."
vercel

echo ""
echo "✅ Deployment initiated!"
echo ""
echo "📋 Next steps:"
echo "1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables"
echo "2. Add all required environment variables"
echo "3. Run 'vercel --prod' to deploy to production"
echo ""
