# Stage 1: Build the React application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package.json and lock files
COPY package.json package-lock.json* ./

# Install dependencies (using ci for reproducible builds if lockfile exists)
RUN npm ci || npm install

# Copy the rest of the application source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine-slim

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration for single-page applications
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Add entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Security: Run as non-root user
# Nginx image already has an 'nginx' user, but we need to give it permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html && \
    mkdir -p /var/cache/nginx && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid && \
    chown nginx:nginx /entrypoint.sh

# Switch to the non-root user
USER nginx

# Expose port 80
EXPOSE 80

# Configure an entrypoint for runtime injections
ENTRYPOINT ["/entrypoint.sh"]

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
