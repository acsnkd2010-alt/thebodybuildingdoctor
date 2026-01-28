# Bodybuilding Media Channel WordPress Plugin

This WordPress plugin provides seamless integration between WordPress and the Next.js Bodybuilding Media Channel application.

## Features

✅ **Custom REST API Endpoints** - Dedicated endpoints for likes functionality  
✅ **Custom Fields** - Adds `likes` and `liked_by` fields to all posts via REST API  
✅ **CORS Configuration** - Automatic CORS headers for Next.js app  
✅ **JWT Support** - Works with JWT Authentication plugins  
✅ **Application Password Auth** - Supports WordPress Application Passwords  
✅ **Featured Media Enhancement** - Includes all image sizes in REST API responses  
✅ **Admin Settings** - Easy configuration via WordPress admin  

## Installation

See [INSTALLATION.md](./INSTALLATION.md) for detailed installation instructions.

## Quick Start

1. Upload plugin to `/wp-content/plugins/`
2. Activate plugin
3. Go to Settings → BMC Settings
4. Enter your Next.js app URL
5. Create Application Password in User Profile
6. Add credentials to Next.js `.env` file

## REST API Endpoints

### Custom Endpoints

- `GET /wp-json/bmc/v1/posts/{id}/likes` - Get likes for a post
- `POST /wp-json/bmc/v1/posts/{id}/like` - Toggle like (requires auth)
- `GET /wp-json/bmc/v1/users/{id}/liked-posts` - Get user's liked posts

### Enhanced WordPress Endpoints

- `GET /wp-json/wp/v2/posts` - Now includes `acf.likes` and `acf.liked_by`
- `GET /wp-json/wp/v2/posts/{id}` - Includes custom fields and enhanced featured media

## Custom Fields

Each post includes:

```json
{
  "acf": {
    "likes": 10,
    "liked_by": [1, 5, 12, 23]
  }
}
```

## Requirements

- WordPress 5.8+
- PHP 7.4+
- Next.js application (for CORS configuration)

## Optional Dependencies

- JWT Authentication for WP REST API plugin (recommended)
- Advanced Custom Fields plugin (optional, plugin works without it)

## License

GPL v2 or later
