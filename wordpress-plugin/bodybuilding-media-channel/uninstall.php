<?php
/**
 * Uninstall script for Bodybuilding Media Channel plugin
 * 
 * This file is executed when the plugin is deleted from WordPress
 */

// Exit if accessed directly
if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

// Delete plugin options
delete_option('bmc_nextjs_url');

// Optionally delete custom post meta (uncomment if you want to remove all likes data)
// global $wpdb;
// $wpdb->query("DELETE FROM {$wpdb->postmeta} WHERE meta_key IN ('bmc_likes', 'bmc_liked_by')");

// Optionally delete custom table (if you're using it)
// global $wpdb;
// $table_name = $wpdb->prefix . 'bmc_likes';
// $wpdb->query("DROP TABLE IF EXISTS {$table_name}");
