#!/bin/bash
# Automated Vercel Deployment Script

set -e

echo "🚀 Bodybuilding Media Channel - Vercel Deployment"
echo "=================================================="
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm i -g vercel
fi

# Check authentication
if ! vercel whoami &> /dev/null; then
    echo "🔐 Vercel authentication required..."
    echo "Opening browser for authentication..."
    vercel login
fi

echo ""
echo "✅ Authenticated as: $(vercel whoami)"
echo ""

# Check if project is already linked
if [ -f ".vercel/project.json" ]; then
    echo "📎 Project already linked to Vercel"
    read -p "Deploy to production? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🚀 Deploying to production..."
        vercel --prod
    else
        echo "🚀 Deploying to preview..."
        vercel
    fi
else
    echo "🆕 Setting up new Vercel project..."
    vercel
    
    echo ""
    echo "📋 IMPORTANT: Set environment variables in Vercel Dashboard:"
    echo "   1. Go to: https://vercel.com/dashboard"
    echo "   2. Select your project"
    echo "   3. Go to Settings → Environment Variables"
    echo "   4. Add these variables:"
    echo "      - WORDPRESS_API_URL"
    echo "      - WORDPRESS_API_KEY"
    echo "      - JWT_SECRET"
    echo "      - NODE_ENV=production"
    echo ""
    read -p "Press Enter after setting environment variables..."
    
    echo "🚀 Deploying to production..."
    vercel --prod
fi

echo ""
echo "✅ Deployment complete!"
echo "🌐 Check your Vercel dashboard for the live URL"
