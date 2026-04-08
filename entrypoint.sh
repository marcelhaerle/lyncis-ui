#!/bin/sh
# Generate runtime environment configuration
API_URL=${LYNCIS_API_BASE_URL:-/api/v1/ui}

# Writing the environment variables to the static JS file
cat <<EOF > /usr/share/nginx/html/env-config.js
window.__ENV__ = {
  VITE_API_BASE_URL: "${API_URL}"
};
EOF

# Make sure it's accessible by the web server
chmod 644 /usr/share/nginx/html/env-config.js

# Execute the CMD from Dockerfile
exec "$@"
