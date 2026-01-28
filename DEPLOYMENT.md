# Vercel Deployment Guide

## Quick Deploy to Vercel

### Option 1: Deploy via Vercel CLI (Fastest)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy from project directory**:
   ```bash
   cd /Users/sumersinghharawat/Workspaces/Clients/thebodybuildingdoctor
   vercel
   ```

4. **Follow the prompts**:
   - Set up and deploy? **Yes**
   - Which scope? (Select your account)
   - Link to existing project? **No** (for first deployment)
   - Project name? (Press Enter for default or enter custom name)
   - Directory? (Press Enter for `./`)
   - Override settings? **No**

5. **Set Environment Variables**:
   After deployment, go to Vercel Dashboard → Your Project → Settings → Environment Variables
   
   Add these variables:
   ```
   WORDPRESS_API_URL=https://your-wordpress-site.com
   WORDPRESS_API_KEY=your-wordpress-application-password
   JWT_SECRET=your-secure-random-string-here
   NODE_ENV=production
   ```

6. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via GitHub (Recommended for CI/CD)

1. **Initialize Git** (if not done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Bodybuilding Media Channel"
   ```

2. **Create GitHub Repository**:
   - Go to https://github.com/new
   - Create a new repository (don't initialize with README)
   - Copy the repository URL

3. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/yourusername/your-repo-name.git
   git branch -M main
   git push -u origin main
   ```

4. **Import to Vercel**:
   - Go to https://vercel.com/new
   - Click "Import Git Repository"
   - Select your GitHub repository
   - Click "Import"

5. **Configure Project**:
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)

6. **Add Environment Variables**:
   Before clicking "Deploy", click "Environment Variables" and add:
   ```
   WORDPRESS_API_URL=https://your-wordpress-site.com
   WORDPRESS_API_KEY=your-wordpress-application-password
   JWT_SECRET=your-secure-random-string-here
   NODE_ENV=production
   ```

7. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `https://your-project.vercel.app`

## Environment Variables Setup

### Generate JWT Secret

```bash
openssl rand -base64 32
```

Copy the output and use it as your `JWT_SECRET`.

### WordPress Setup

1. **Get WordPress API URL**:
   - Your WordPress site URL (e.g., `https://your-site.com`)
   - Make sure REST API is accessible at `/wp-json/`

2. **Create Application Password**:
   - WordPress Admin → Users → Your Profile
   - Scroll to "Application Passwords"
   - Create new password for "Next.js App"
   - Copy the generated password

3. **Install WordPress Plugin**:
   - Upload `wordpress-plugin/bodybuilding-media-channel` to WordPress
   - Activate plugin
   - Go to Settings → BMC Settings
   - Enter your Vercel app URL (e.g., `https://your-project.vercel.app`)

## Post-Deployment Checklist

- [ ] Environment variables set in Vercel
- [ ] WordPress plugin installed and configured
- [ ] WordPress Application Password created
- [ ] CORS configured in WordPress plugin settings
- [ ] Test login functionality
- [ ] Test media feed loading
- [ ] Test like functionality
- [ ] Verify responsive design on mobile

## Troubleshooting

### Build Fails

- Check Node.js version (Vercel uses Node 18+ by default)
- Verify all dependencies in `package.json`
- Check build logs in Vercel dashboard

### Environment Variables Not Working

- Ensure variables are set for "Production" environment
- Redeploy after adding new variables
- Check variable names match exactly (case-sensitive)

### WordPress API Errors

- Verify `WORDPRESS_API_URL` includes protocol (https://)
- Test WordPress REST API: `https://your-site.com/wp-json/wp/v2/posts`
- Check Application Password is correct
- Verify WordPress plugin is activated

### CORS Errors

- Ensure WordPress plugin has your Vercel URL configured
- Check browser console for exact CORS error
- Verify URLs match exactly (no trailing slashes)

## Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update WordPress plugin CORS settings with new domain

## Monitoring

- Vercel Dashboard shows deployment status
- Check Function Logs for API route errors
- Monitor WordPress REST API usage
- Set up Vercel Analytics (optional)
