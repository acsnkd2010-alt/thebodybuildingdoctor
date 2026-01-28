# WordPress Plugin Installation Guide

## Prerequisites

- WordPress 5.8 or higher
- PHP 7.4 or higher
- Next.js application deployed (for CORS configuration)

## Installation Steps

### 1. Install the Plugin

**Option A: Manual Installation**
1. Download or clone this plugin folder
2. Upload the `bodybuilding-media-channel` folder to `/wp-content/plugins/` directory
3. Activate the plugin through the 'Plugins' menu in WordPress

**Option B: Via WordPress Admin**
1. Go to Plugins → Add New
2. Click "Upload Plugin"
3. Select the `bodybuilding-media-channel.zip` file
4. Click "Install Now" and then "Activate Plugin"

### 2. Configure Plugin Settings

1. Go to **Settings → BMC Settings** in WordPress admin
2. Enter your Next.js application URL (e.g., `https://your-app.vercel.app`)
3. Click "Save Settings"

This URL is used for CORS configuration to allow your Next.js app to access the WordPress REST API.

### 3. Install JWT Authentication Plugin (Recommended)

For full JWT authentication support:

1. Install **"JWT Authentication for WP REST API"** plugin
   - Search for it in Plugins → Add New
   - Or download from: https://wordpress.org/plugins/jwt-authentication-for-wp-rest-api/

2. Configure JWT plugin:
   - Add this to your `wp-config.php`:
   ```php
   define('JWT_AUTH_SECRET_KEY', 'your-secret-key-here');
   define('JWT_AUTH_CORS_ENABLE', true);
   ```
   - Generate a secret key: `openssl rand -base64 32`

### 4. Create Application Password

1. Go to **Users → Your Profile** in WordPress admin
2. Scroll down to **"Application Passwords"** section
3. Enter a name (e.g., "Next.js App")
4. Click "Add New Application Password"
5. **Copy the generated password** - you'll need this for your Next.js `.env` file

### 5. Configure Next.js Environment Variables

Add these to your Next.js `.env` or Vercel environment variables:

```env
WORDPRESS_API_URL=https://your-wordpress-site.com
WORDPRESS_API_KEY=your-application-password-here
JWT_SECRET=your-jwt-secret-key-here
```

## How It Works

### Custom REST API Endpoints

The plugin adds the following endpoints:

1. **Get Post Likes**
   ```
   GET /wp-json/bmc/v1/posts/{id}/likes
   ```

2. **Toggle Post Like**
   ```
   POST /wp-json/bmc/v1/posts/{id}/like
   ```

3. **Get User's Liked Posts**
   ```
   GET /wp-json/bmc/v1/users/{id}/liked-posts
   ```

### Custom Fields Added to Posts

Each post in the WordPress REST API now includes:

```json
{
  "acf": {
    "likes": 5,
    "liked_by": [1, 2, 3]
  }
}
```

These fields are automatically included when fetching posts via:
```
GET /wp-json/wp/v2/posts
GET /wp-json/wp/v2/posts/{id}
```

### Featured Media Enhancement

The plugin also enhances the featured media response to include all image sizes:

```json
{
  "featured_media_details": {
    "id": 123,
    "source_url": "https://...",
    "sizes": {
      "medium": { "source_url": "...", "width": 300, "height": 200 },
      "large": { "source_url": "...", "width": 1024, "height": 768 },
      "full": { "source_url": "...", "width": 1920, "height": 1080 }
    }
  }
}
```

## Testing the Integration

### Test REST API Endpoints

1. **Test WordPress REST API:**
   ```
   https://your-site.com/wp-json/wp/v2/posts
   ```

2. **Test Custom Endpoint:**
   ```
   https://your-site.com/wp-json/bmc/v1/posts/1/likes
   ```

3. **Test with Authentication:**
   Use Postman or curl with Basic Auth:
   ```bash
   curl -X POST https://your-site.com/wp-json/bmc/v1/posts/1/like \
     -H "Authorization: Basic base64(username:app_password)"
   ```

## Troubleshooting

### CORS Errors

- Make sure you've entered your Next.js URL in Settings → BMC Settings
- Check that the URL matches exactly (including https/http)
- Clear browser cache and try again

### Authentication Fails

- Verify Application Password is correct
- Check that JWT plugin is installed and configured
- Ensure `JWT_AUTH_SECRET_KEY` is set in `wp-config.php`

### Likes Not Saving

- Check that the WordPress user has permission to edit posts
- Verify Application Password has proper permissions
- Check WordPress error logs for any PHP errors

### Custom Fields Not Showing

- Clear any caching plugins
- Verify the plugin is activated
- Check REST API response includes `acf` field

## Support

For issues or questions:
1. Check WordPress error logs
2. Enable WordPress debug mode: `define('WP_DEBUG', true);` in `wp-config.php`
3. Test REST API endpoints directly
4. Verify all environment variables are set correctly
