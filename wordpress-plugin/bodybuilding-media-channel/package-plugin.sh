#!/bin/bash
# Script to package the WordPress plugin for distribution

PLUGIN_NAME="bodybuilding-media-channel"
VERSION="1.0.0"
ZIP_NAME="${PLUGIN_NAME}-v${VERSION}.zip"

# Create zip file excluding unnecessary files
zip -r "$ZIP_NAME" . \
  -x "*.git*" \
  -x "*.DS_Store" \
  -x "package-plugin.sh" \
  -x "*.md" \
  -x "node_modules/*"

echo "Plugin packaged as: $ZIP_NAME"
echo "Upload this file to WordPress via Plugins → Add New → Upload Plugin"
