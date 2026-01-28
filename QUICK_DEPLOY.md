# 🚀 Quick Deploy to Vercel - Step by Step

Since you already have Vercel CLI installed, follow these steps:

## Step 1: Open Terminal

Open your terminal and navigate to the project:
```bash
cd /Users/sumersinghharawat/Workspaces/Clients/thebodybuildingdoctor
```

## Step 2: Initialize Git (Optional but Recommended)

```bash
git init
git add .
git commit -m "Initial commit: Bodybuilding Media Channel"
```

## Step 3: Deploy to Vercel

### Option A: Quick Deploy (Recommended)
```bash
vercel
```

Follow the interactive prompts:
- **Set up and deploy?** → Type `Y` and press Enter
- **Which scope?** → Select your account
- **Link to existing project?** → Type `N` (for first time)
- **Project name?** → Press Enter for default or enter custom name
- **Directory?** → Press Enter (uses `./`)
- **Override settings?** → Type `N`

### Option B: Non-Interactive Deploy
```bash
vercel --yes
```

## Step 4: Set Environment Variables

After deployment, **IMPORTANT**: You must add environment variables:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your project
3. Go to **Settings** → **Environment Variables**
4. Add these variables (one by one):

   ```
   Name: WORDPRESS_API_URL
   Value: https://your-wordpress-site.com
   Environment: Production, Preview, Development (select all)
   ```

   ```
   Name: WORDPRESS_API_KEY
   Value: your-wordpress-application-password
   Environment: Production, Preview, Development (select all)
   ```

   ```
   Name: JWT_SECRET
   Value: [Generate with: openssl rand -base64 32]
   Environment: Production, Preview, Development (select all)
   ```

   ```
   Name: NODE_ENV
   Value: production
   Environment: Production, Preview, Development (select all)
   ```

5. **Save** each variable

## Step 5: Deploy to Production

After adding environment variables, deploy to production:

```bash
vercel --prod
```

Or redeploy from Vercel Dashboard:
- Go to **Deployments** tab
- Click **⋯** (three dots) on latest deployment
- Click **Redeploy**

## Step 6: Get Your Live URL

After deployment, Vercel will provide you with:
- **Preview URL**: `https://your-project-xyz.vercel.app`
- **Production URL**: `https://your-project.vercel.app` (if you set a custom domain)

## Step 7: Configure WordPress Plugin

1. Install the WordPress plugin from `wordpress-plugin/bodybuilding-media-channel/`
2. Go to WordPress Admin → **Settings** → **BMC Settings**
3. Enter your Vercel app URL (e.g., `https://your-project.vercel.app`)
4. Save settings

## 🎉 You're Live!

Your Next.js app should now be accessible at your Vercel URL.

## Troubleshooting

### If deployment fails:
- Check build logs in Vercel Dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version (Vercel uses Node 18+)

### If environment variables don't work:
- Make sure you selected all environments (Production, Preview, Development)
- Redeploy after adding variables
- Check variable names match exactly (case-sensitive)

### If WordPress connection fails:
- Verify `WORDPRESS_API_URL` includes `https://` or `http://`
- Test WordPress REST API: `https://your-site.com/wp-json/wp/v2/posts`
- Check Application Password is correct

## Need Help?

Check the detailed guide in `DEPLOYMENT.md` or `README.md`
