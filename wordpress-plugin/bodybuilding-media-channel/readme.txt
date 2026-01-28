=== Bodybuilding Media Channel Integration ===
Contributors: yourname
Tags: rest-api, jwt, authentication, nextjs, media-channel
Requires at least: 5.8
Tested up to: 6.4
Stable tag: 1.0.0
Requires PHP: 7.4
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

WordPress plugin to integrate with Next.js Bodybuilding Media Channel application. Provides JWT authentication, custom fields for likes, and enhanced REST API endpoints.

== Description ==

This plugin enables seamless integration between WordPress and your Next.js Bodybuilding Media Channel application. It provides:

* Custom REST API endpoints for likes functionality
* Custom fields (likes, liked_by) added to posts via REST API
* CORS configuration for Next.js app
* JWT authentication support (works with JWT Authentication for WP REST API plugin)
* Application Password authentication support
* Admin settings page for configuration

== Installation ==

1. Upload the plugin files to the `/wp-content/plugins/bodybuilding-media-channel` directory, or install the plugin through the WordPress plugins screen directly.
2. Activate the plugin through the 'Plugins' screen in WordPress.
3. Go to Settings > BMC Settings to configure your Next.js application URL.
4. Install and configure "JWT Authentication for WP REST API" plugin for full JWT support (recommended).

== Frequently Asked Questions ==

= Do I need the JWT Authentication plugin? =

It's recommended but not required. This plugin will work with WordPress Application Passwords or the JWT Authentication for WP REST API plugin.

= How do I configure CORS? =

Go to Settings > BMC Settings and enter your Next.js application URL. The plugin will automatically configure CORS headers.

= How are likes stored? =

Likes are stored as WordPress post meta fields:
* `bmc_likes` - Total count of likes
* `bmc_liked_by` - Array of user IDs who liked the post

= Can I use this with other REST API clients? =

Yes! The custom fields and endpoints work with any REST API client, not just Next.js.

== Changelog ==

= 1.0.0 =
* Initial release
* Custom REST API endpoints for likes
* Custom fields added to posts
* CORS configuration
* Admin settings page

== Upgrade Notice ==

= 1.0.0 =
Initial release of the plugin.
