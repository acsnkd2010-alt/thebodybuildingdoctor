# WordPress & Next.js Integration Guide

This guide explains how the WordPress plugin integrates with the Next.js Bodybuilding Media Channel application.

## Architecture Overview

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   Next.js App   │────────▶│  WordPress Site  │────────▶│  WordPress DB    │
│   (Vercel)      │  REST   │   + Plugin       │         │   (Posts/Meta)   │
└─────────────────┘  API    └──────────────────┘         └─────────────────┘
```

## Data Flow

### 1. Authentication Flow

```
User Login (Next.js)
    ↓
POST /api/auth/login
    ↓
Authenticate with WordPress JWT endpoint
    ↓
Create Next.js session JWT
    ↓
Store in HTTP-only cookie
```

**WordPress Endpoints Used:**
- `POST /wp-json/jwt-auth/v1/token` (JWT Authentication plugin)
- Or Application Password authentication

### 2. Fetching Posts

```
Dashboard Page Load
    ↓
GET /api/media?page=1
    ↓
Fetch from WordPress REST API
    ↓
GET /wp-json/wp/v2/posts?_embed=true
    ↓
Returns posts with:
  - Title, content, excerpt
  - Featured media (via _embed)
  - Custom fields: acf.likes, acf.liked_by
```

### 3. Like Functionality

**Option A: Using Plugin Custom Endpoint (Preferred)**
```
User clicks Like
    ↓
POST /api/media/{id}/like
    ↓
POST /wp-json/bmc/v1/posts/{id}/like
    ↓
WordPress Plugin:
  - Checks authentication
  - Updates post meta (bmc_likes, bmc_liked_by)
  - Returns updated like count
```

**Option B: Fallback via Standard REST API**
```
POST /api/media/{id}/like
    ↓
POST /wp-json/wp/v2/posts/{id}
Body: { "acf": { "likes": 5, "liked_by": [1,2,3] } }
    ↓
WordPress Plugin update_callback:
  - Updates post meta fields
  - Returns success
```

## Custom Fields Structure

### WordPress Post Meta
- `bmc_likes` (integer) - Total like count
- `bmc_liked_by` (array) - User IDs who liked

### REST API Response
```json
{
  "id": 123,
  "title": { "rendered": "Post Title" },
  "acf": {
    "likes": 5,
    "liked_by": [1, 2, 3, 5, 8]
  }
}
```

## Per-Post Functionality

Each WordPress post automatically includes:

1. **Custom Fields** - Added via `register_rest_field('post', 'acf', ...)`
2. **Featured Media** - Enhanced with all image sizes
3. **Like Endpoints** - Available at `/bmc/v1/posts/{id}/like`

### Example: Fetching a Single Post

```bash
GET /wp-json/wp/v2/posts/123?_embed=true
```

Response includes:
- Standard WordPress post data
- `acf` object with likes
- `_embedded['wp:featuredmedia']` with image URLs
- `featured_media_details` (added by plugin)

### Example: Liking a Post

```bash
POST /wp-json/bmc/v1/posts/123/like
Authorization: Basic base64(username:app_password)
```

Response:
```json
{
  "post_id": 123,
  "liked": true,
  "likes": 6,
  "liked_by": [1, 2, 3, 5, 8, 10]
}
```

## Environment Variables

### Next.js (.env)
```env
WORDPRESS_API_URL=https://your-wordpress-site.com
WORDPRESS_API_KEY=your-application-password
JWT_SECRET=your-jwt-secret
```

### WordPress (wp-config.php)
```php
define('JWT_AUTH_SECRET_KEY', 'your-jwt-secret');
define('JWT_AUTH_CORS_ENABLE', true);
```

## Testing the Integration

### 1. Test WordPress REST API
```bash
curl https://your-site.com/wp-json/wp/v2/posts
```

Should return posts with `acf` field.

### 2. Test Custom Endpoint
```bash
curl https://your-site.com/wp-json/bmc/v1/posts/1/likes
```

### 3. Test Like Endpoint (with auth)
```bash
curl -X POST https://your-site.com/wp-json/bmc/v1/posts/1/like \
  -H "Authorization: Basic $(echo -n 'username:app_password' | base64)"
```

### 4. Test from Next.js
```bash
# After logging in
curl https://your-nextjs-app.vercel.app/api/media?page=1 \
  -H "Cookie: session=your-session-token"
```

## Troubleshooting

### Posts Not Showing Custom Fields

1. Verify plugin is activated
2. Clear WordPress cache
3. Check REST API response includes `acf` field
4. Verify post meta exists: `get_post_meta($post_id, 'bmc_likes')`

### Likes Not Saving

1. Check user authentication
2. Verify Application Password has edit permissions
3. Check WordPress error logs
4. Test endpoint directly with Postman/curl

### CORS Errors

1. Verify Next.js URL in Settings → BMC Settings
2. Check browser console for exact CORS error
3. Ensure URL matches exactly (protocol, domain, port)

### Authentication Fails

1. Verify JWT plugin is installed
2. Check `JWT_AUTH_SECRET_KEY` in wp-config.php
3. Verify Application Password is correct
4. Test JWT endpoint directly

## Security Considerations

1. **Application Passwords** - Use strong, unique passwords
2. **JWT Secret** - Generate secure random string (32+ characters)
3. **CORS** - Only allow your Next.js domain
4. **HTTPS** - Always use HTTPS in production
5. **Rate Limiting** - Consider adding rate limiting for like endpoints

## Performance Optimization

1. **Caching** - WordPress REST API responses are cached
2. **Pagination** - Use pagination for large post lists
3. **Image Optimization** - WordPress serves optimized image sizes
4. **CDN** - Use CDN for WordPress media files

## Next Steps

1. Install and activate the WordPress plugin
2. Configure settings in WordPress admin
3. Create Application Password
4. Deploy Next.js app to Vercel
5. Set environment variables
6. Test the integration end-to-end
