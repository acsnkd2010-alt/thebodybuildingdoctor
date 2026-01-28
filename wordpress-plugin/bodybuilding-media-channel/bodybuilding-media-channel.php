<?php
/**
 * Plugin Name: Bodybuilding Media Channel Integration
 * Plugin URI: https://your-site.com
 * Description: WordPress plugin to integrate with Next.js Bodybuilding Media Channel application. Provides JWT authentication, custom fields for likes, and enhanced REST API endpoints.
 * Version: 1.0.0
 * Author: Your Name
 * Author URI: https://your-site.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: bodybuilding-media-channel
 * Requires at least: 5.8
 * Requires PHP: 7.4
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('BMC_VERSION', '1.0.0');
define('BMC_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('BMC_PLUGIN_URL', plugin_dir_url(__FILE__));

/**
 * Main plugin class
 */
class Bodybuilding_Media_Channel {
    
    private static $instance = null;
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function __construct() {
        $this->init_hooks();
    }
    
    private function init_hooks() {
        // Activation/Deactivation hooks
        register_activation_hook(__FILE__, array($this, 'activate'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));
        
        // Initialize plugin
        add_action('plugins_loaded', array($this, 'init'));
        
        // Add REST API endpoints
        add_action('rest_api_init', array($this, 'register_rest_routes'));
        
        // Add custom fields to REST API
        add_action('rest_api_init', array($this, 'add_custom_fields_to_rest'));
        
        // CORS headers for Next.js app
        add_action('rest_api_init', array($this, 'add_cors_headers'));
        
        // Add admin menu
        add_action('admin_menu', array($this, 'add_admin_menu'));
        
        // Add settings link
        add_filter('plugin_action_links_' . plugin_basename(__FILE__), array($this, 'add_settings_link'));
    }
    
    /**
     * Plugin activation
     */
    public function activate() {
        // Create custom table for likes if needed (optional - using post meta instead)
        $this->create_tables();
        
        // Flush rewrite rules
        flush_rewrite_rules();
    }
    
    /**
     * Plugin deactivation
     */
    public function deactivate() {
        flush_rewrite_rules();
    }
    
    /**
     * Initialize plugin
     */
    public function init() {
        // Load text domain for translations
        load_plugin_textdomain('bodybuilding-media-channel', false, dirname(plugin_basename(__FILE__)) . '/languages');
    }
    
    /**
     * Create custom tables (optional - using post meta instead)
     */
    private function create_tables() {
        global $wpdb;
        
        $charset_collate = $wpdb->get_charset_collate();
        $table_name = $wpdb->prefix . 'bmc_likes';
        
        $sql = "CREATE TABLE IF NOT EXISTS $table_name (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            post_id bigint(20) NOT NULL,
            user_id bigint(20) NOT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY post_user (post_id, user_id),
            KEY post_id (post_id),
            KEY user_id (user_id)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
    
    /**
     * Register custom REST API routes
     */
    public function register_rest_routes() {
        // JWT Authentication endpoint (if JWT plugin is not installed)
        register_rest_route('bmc/v1', '/auth/token', array(
            'methods' => 'POST',
            'callback' => array($this, 'generate_jwt_token'),
            'permission_callback' => '__return_true',
        ));
        
        // Get likes for a post
        register_rest_route('bmc/v1', '/posts/(?P<id>\d+)/likes', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_post_likes'),
            'permission_callback' => array($this, 'check_authentication'),
        ));
        
        // Toggle like for a post
        register_rest_route('bmc/v1', '/posts/(?P<id>\d+)/like', array(
            'methods' => 'POST',
            'callback' => array($this, 'toggle_post_like'),
            'permission_callback' => array($this, 'check_authentication'),
        ));
        
        // Get user's liked posts
        register_rest_route('bmc/v1', '/users/(?P<id>\d+)/liked-posts', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_user_liked_posts'),
            'permission_callback' => array($this, 'check_authentication'),
        ));
    }
    
    /**
     * Add CORS headers for Next.js app
     */
    public function add_cors_headers() {
        $nextjs_url = get_option('bmc_nextjs_url', '');
        
        if (!empty($nextjs_url)) {
            remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
            add_filter('rest_pre_serve_request', function($value) use ($nextjs_url) {
                header('Access-Control-Allow-Origin: ' . esc_url_raw($nextjs_url));
                header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
                header('Access-Control-Allow-Credentials: true');
                header('Access-Control-Allow-Headers: Authorization, Content-Type');
                return $value;
            });
        }
    }
    
    /**
     * Add custom fields to REST API response
     */
    public function add_custom_fields_to_rest() {
        // Add likes count and liked_by array to posts
        register_rest_field('post', 'acf', array(
            'get_callback' => array($this, 'get_post_custom_fields'),
            'update_callback' => array($this, 'update_post_custom_fields'),
            'schema' => array(
                'type' => 'object',
                'context' => array('view', 'edit'),
            ),
        ));
        
        // Ensure featured media is included
        add_filter('rest_prepare_post', array($this, 'add_featured_media_to_response'), 10, 3);
    }
    
    /**
     * Get custom fields for post
     */
    public function get_post_custom_fields($object, $field_name, $request) {
        $post_id = $object['id'];
        
        return array(
            'likes' => (int) get_post_meta($post_id, 'bmc_likes', true) ?: 0,
            'liked_by' => get_post_meta($post_id, 'bmc_liked_by', true) ?: array(),
        );
    }
    
    /**
     * Update custom fields for post
     */
    public function update_post_custom_fields($value, $object, $field_name) {
        if (!is_array($value)) {
            return false;
        }
        
        $post_id = $object->ID;
        
        if (isset($value['likes'])) {
            update_post_meta($post_id, 'bmc_likes', (int) $value['likes']);
        }
        
        if (isset($value['liked_by']) && is_array($value['liked_by'])) {
            update_post_meta($post_id, 'bmc_liked_by', $value['liked_by']);
        }
        
        return true;
    }
    
    /**
     * Add featured media to REST API response
     */
    public function add_featured_media_to_response($response, $post, $request) {
        if (!isset($response->data['featured_media']) || $response->data['featured_media'] == 0) {
            return $response;
        }
        
        $featured_media_id = $response->data['featured_media'];
        
        // Get media details
        $media = get_post($featured_media_id);
        if ($media && $media->post_type === 'attachment') {
            $image_sizes = array();
            $attachment_meta = wp_get_attachment_metadata($featured_media_id);
            
            if ($attachment_meta && isset($attachment_meta['sizes'])) {
                foreach ($attachment_meta['sizes'] as $size => $size_data) {
                    $image_sizes[$size] = array(
                        'source_url' => wp_get_attachment_image_src($featured_media_id, $size)[0],
                        'width' => $size_data['width'],
                        'height' => $size_data['height'],
                    );
                }
            }
            
            // Add full size
            $full_image = wp_get_attachment_image_src($featured_media_id, 'full');
            if ($full_image) {
                $image_sizes['full'] = array(
                    'source_url' => $full_image[0],
                    'width' => $full_image[1],
                    'height' => $full_image[2],
                );
            }
            
            $response->data['featured_media_details'] = array(
                'id' => $featured_media_id,
                'source_url' => wp_get_attachment_url($featured_media_id),
                'sizes' => $image_sizes,
            );
        }
        
        return $response;
    }
    
    /**
     * Generate JWT token (fallback if JWT plugin not installed)
     */
    public function generate_jwt_token($request) {
        $username = $request->get_param('username');
        $password = $request->get_param('password');
        
        if (empty($username) || empty($password)) {
            return new WP_Error('missing_credentials', 'Username and password are required', array('status' => 400));
        }
        
        $user = wp_authenticate($username, $password);
        
        if (is_wp_error($user)) {
            return new WP_Error('invalid_credentials', 'Invalid username or password', array('status' => 401));
        }
        
        // Generate token (simplified - use proper JWT library in production)
        $token_data = array(
            'user_id' => $user->ID,
            'username' => $user->user_login,
            'email' => $user->user_email,
            'exp' => time() + (30 * DAY_IN_SECONDS),
        );
        
        // Note: This is a simplified token. For production, use a proper JWT library
        // or rely on JWT Authentication for WP REST API plugin
        $token = base64_encode(json_encode($token_data));
        
        return array(
            'token' => $token,
            'user' => array(
                'id' => $user->ID,
                'username' => $user->user_login,
                'email' => $user->user_email,
                'name' => $user->display_name,
            ),
        );
    }
    
    /**
     * Check authentication
     */
    public function check_authentication($request) {
        // Check if user is logged in via WordPress
        $user_id = get_current_user_id();
        
        if ($user_id === 0) {
            // Try to authenticate via JWT token
            $auth_header = $request->get_header('Authorization');
            
            if (!empty($auth_header) && preg_match('/Bearer\s+(.*)$/i', $auth_header, $matches)) {
                $token = $matches[1];
                // Verify token and set user (simplified - use proper JWT verification)
                // For production, use JWT Authentication for WP REST API plugin
            }
        }
        
        // Allow if user is authenticated or if using Application Password
        return $user_id > 0 || $this->check_application_password($request);
    }
    
    /**
     * Check Application Password authentication
     */
    private function check_application_password($request) {
        if (!function_exists('wp_validate_application_password')) {
            return false;
        }
        
        $auth_header = $request->get_header('Authorization');
        if (empty($auth_header)) {
            return false;
        }
        
        // Basic auth format: Authorization: Basic base64(username:password)
        if (preg_match('/Basic\s+(.*)$/i', $auth_header, $matches)) {
            $credentials = base64_decode($matches[1]);
            list($username, $password) = explode(':', $credentials, 2);
            
            $user = wp_authenticate_application_password(null, $username, $password);
            if ($user && !is_wp_error($user)) {
                wp_set_current_user($user->ID);
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Get likes for a post
     */
    public function get_post_likes($request) {
        $post_id = (int) $request->get_param('id');
        $user_id = get_current_user_id();
        
        if (!$post_id || !get_post($post_id)) {
            return new WP_Error('invalid_post', 'Invalid post ID', array('status' => 404));
        }
        
        $likes = (int) get_post_meta($post_id, 'bmc_likes', true) ?: 0;
        $liked_by = get_post_meta($post_id, 'bmc_liked_by', true) ?: array();
        
        if (!is_array($liked_by)) {
            $liked_by = array();
        }
        
        return array(
            'post_id' => $post_id,
            'likes' => $likes,
            'liked_by' => $liked_by,
            'user_liked' => $user_id > 0 && in_array($user_id, $liked_by),
        );
    }
    
    /**
     * Toggle like for a post
     */
    public function toggle_post_like($request) {
        $post_id = (int) $request->get_param('id');
        $user_id = get_current_user_id();
        
        if ($user_id === 0) {
            return new WP_Error('unauthorized', 'User must be authenticated', array('status' => 401));
        }
        
        if (!$post_id || !get_post($post_id)) {
            return new WP_Error('invalid_post', 'Invalid post ID', array('status' => 404));
        }
        
        $liked_by = get_post_meta($post_id, 'bmc_liked_by', true) ?: array();
        if (!is_array($liked_by)) {
            $liked_by = array();
        }
        
        $is_liked = in_array($user_id, $liked_by);
        
        if ($is_liked) {
            // Unlike
            $liked_by = array_values(array_diff($liked_by, array($user_id)));
            $likes = max(0, (int) get_post_meta($post_id, 'bmc_likes', true) - 1);
        } else {
            // Like
            $liked_by[] = $user_id;
            $liked_by = array_unique($liked_by);
            $likes = (int) get_post_meta($post_id, 'bmc_likes', true) + 1;
        }
        
        update_post_meta($post_id, 'bmc_likes', $likes);
        update_post_meta($post_id, 'bmc_liked_by', $liked_by);
        
        return array(
            'post_id' => $post_id,
            'liked' => !$is_liked,
            'likes' => $likes,
            'liked_by' => $liked_by,
        );
    }
    
    /**
     * Get user's liked posts
     */
    public function get_user_liked_posts($request) {
        $user_id = (int) $request->get_param('id');
        $current_user_id = get_current_user_id();
        
        // Users can only view their own liked posts
        if ($user_id !== $current_user_id) {
            return new WP_Error('forbidden', 'You can only view your own liked posts', array('status' => 403));
        }
        
        // Get all posts where user has liked
        $args = array(
            'post_type' => 'post',
            'posts_per_page' => -1,
            'meta_query' => array(
                array(
                    'key' => 'bmc_liked_by',
                    'value' => serialize(array($user_id)),
                    'compare' => 'LIKE',
                ),
            ),
        );
        
        $posts = get_posts($args);
        $liked_posts = array();
        
        foreach ($posts as $post) {
            $liked_by = get_post_meta($post->ID, 'bmc_liked_by', true) ?: array();
            if (is_array($liked_by) && in_array($user_id, $liked_by)) {
                $liked_posts[] = $post->ID;
            }
        }
        
        return array(
            'user_id' => $user_id,
            'liked_post_ids' => $liked_posts,
        );
    }
    
    /**
     * Add admin menu
     */
    public function add_admin_menu() {
        add_options_page(
            __('Bodybuilding Media Channel Settings', 'bodybuilding-media-channel'),
            __('BMC Settings', 'bodybuilding-media-channel'),
            'manage_options',
            'bmc-settings',
            array($this, 'render_settings_page')
        );
    }
    
    /**
     * Add settings link to plugin page
     */
    public function add_settings_link($links) {
        $settings_link = '<a href="' . admin_url('options-general.php?page=bmc-settings') . '">' . __('Settings', 'bodybuilding-media-channel') . '</a>';
        array_unshift($links, $settings_link);
        return $links;
    }
    
    /**
     * Render settings page
     */
    public function render_settings_page() {
        if (isset($_POST['bmc_save_settings']) && check_admin_referer('bmc_settings')) {
            update_option('bmc_nextjs_url', sanitize_text_field($_POST['bmc_nextjs_url']));
            echo '<div class="notice notice-success"><p>' . __('Settings saved!', 'bodybuilding-media-channel') . '</p></div>';
        }
        
        $nextjs_url = get_option('bmc_nextjs_url', '');
        ?>
        <div class="wrap">
            <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
            <form method="post" action="">
                <?php wp_nonce_field('bmc_settings'); ?>
                <table class="form-table">
                    <tr>
                        <th scope="row">
                            <label for="bmc_nextjs_url"><?php _e('Next.js Application URL', 'bodybuilding-media-channel'); ?></label>
                        </th>
                        <td>
                            <input type="url" id="bmc_nextjs_url" name="bmc_nextjs_url" value="<?php echo esc_attr($nextjs_url); ?>" class="regular-text" placeholder="https://your-nextjs-app.vercel.app" />
                            <p class="description"><?php _e('Enter the URL of your deployed Next.js application. This is used for CORS configuration.', 'bodybuilding-media-channel'); ?></p>
                        </td>
                    </tr>
                </table>
                <?php submit_button(__('Save Settings', 'bodybuilding-media-channel'), 'primary', 'bmc_save_settings'); ?>
            </form>
            
            <hr>
            
            <h2><?php _e('REST API Endpoints', 'bodybuilding-media-channel'); ?></h2>
            <p><?php _e('The following endpoints are available for your Next.js application:', 'bodybuilding-media-channel'); ?></p>
            <ul>
                <li><code><?php echo esc_url(rest_url('bmc/v1/posts/{id}/likes')); ?></code> - Get likes for a post</li>
                <li><code><?php echo esc_url(rest_url('bmc/v1/posts/{id}/like')); ?></code> - Toggle like for a post</li>
                <li><code><?php echo esc_url(rest_url('bmc/v1/users/{id}/liked-posts')); ?></code> - Get user's liked posts</li>
            </ul>
            
            <h2><?php _e('WordPress REST API', 'bodybuilding-media-channel'); ?></h2>
            <p><?php _e('Standard WordPress REST API endpoints:', 'bodybuilding-media-channel'); ?></p>
            <ul>
                <li><code><?php echo esc_url(rest_url('wp/v2/posts')); ?></code> - Get all posts</li>
                <li><code><?php echo esc_url(rest_url('wp/v2/posts/{id}')); ?></code> - Get single post</li>
                <li><code><?php echo esc_url(rest_url('wp/v2/media/{id}')); ?></code> - Get media</li>
            </ul>
            
            <h2><?php _e('Custom Fields Added to Posts', 'bodybuilding-media-channel'); ?></h2>
            <p><?php _e('Each post now includes the following custom fields in the REST API response:', 'bodybuilding-media-channel'); ?></p>
            <ul>
                <li><strong>acf.likes</strong> - Total number of likes</li>
                <li><strong>acf.liked_by</strong> - Array of user IDs who liked the post</li>
            </ul>
        </div>
        <?php
    }
}

// Initialize plugin
Bodybuilding_Media_Channel::get_instance();
