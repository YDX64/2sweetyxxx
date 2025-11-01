# ============================================
# Multi-stage Dockerfile for 2Sweety Platform
# Root Dockerfile for Coolify Deployment
# ============================================

# ============================================
# Stage 1: Build Stage
# ============================================
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git

# Copy package files from GoMeet Web directory
COPY ["GoMeet Web/package.json", "GoMeet Web/package-lock.json*", "./"]

# Install ALL dependencies (including devDependencies for build)
RUN npm ci && \
    npm cache clean --force

# Copy all source code from GoMeet Web
COPY ["GoMeet Web/", "./"]

# Build arguments for environment variables
ARG REACT_APP_API_BASE_URL=https://gomeet.cscodetech.cloud/api/
ARG REACT_APP_IMAGE_BASE_URL=https://gomeet.cscodetech.cloud/
ARG REACT_APP_PAYMENT_BASE_URL=https://gomeet.cscodetech.cloud/
ARG REACT_APP_FIREBASE_API_KEY
ARG REACT_APP_FIREBASE_AUTH_DOMAIN=sweet-a6718.firebaseapp.com
ARG REACT_APP_FIREBASE_PROJECT_ID=sweet-a6718
ARG REACT_APP_FIREBASE_STORAGE_BUCKET=sweet-a6718.firebasestorage.app
ARG REACT_APP_FIREBASE_MESSAGING_SENDER_ID
ARG REACT_APP_FIREBASE_APP_ID
ARG REACT_APP_FIREBASE_MEASUREMENT_ID
ARG REACT_APP_ONESIGNAL_APP_ID=94b2b6c5-fabb-4454-a2b7-75cf75b84789
ARG REACT_APP_AGORA_APP_ID
ARG REACT_APP_GOOGLE_MAPS_API_KEY
ARG REACT_APP_RAZORPAY_KEY_ID
ARG REACT_APP_PAYPAL_CLIENT_ID
ARG REACT_APP_STRIPE_PUBLISHABLE_KEY
ARG REACT_APP_GOOGLE_CLIENT_ID
ARG REACT_APP_FACEBOOK_APP_ID

# Set environment variables for build
ENV NODE_ENV=production \
    GENERATE_SOURCEMAP=false \
    ESLINT_NO_DEV_ERRORS=true \
    SKIP_PREFLIGHT_CHECK=true \
    CI=false

# Build the application (fail if build fails)
RUN npm run build

# Remove development dependencies after successful build
RUN rm -rf node_modules src

# ============================================
# Stage 2: Production Stage with Nginx
# ============================================
FROM nginx:1.25-alpine

# Install required packages
RUN apk update && \
    apk upgrade && \
    apk add --no-cache \
    curl \
    tzdata && \
    rm -rf /var/cache/apk/*

# Set timezone
ENV TZ=UTC

# Create custom nginx configuration for Coolify
RUN echo 'server { \
    listen 80; \
    listen [::]:80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html index.htm; \
    \
    # Compression \
    gzip on; \
    gzip_vary on; \
    gzip_min_length 1024; \
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml application/javascript application/json; \
    \
    # Security headers \
    add_header X-Frame-Options "SAMEORIGIN" always; \
    add_header X-Content-Type-Options "nosniff" always; \
    add_header X-XSS-Protection "1; mode=block" always; \
    \
    # SPA routing \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    \
    # Static assets caching \
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ { \
        expires 30d; \
        add_header Cache-Control "public, immutable"; \
    } \
    \
    # Service worker no-cache \
    location ~* (service-worker\.js|firebase-messaging-sw\.js|OneSignalSDKWorker\.js)$ { \
        add_header Cache-Control "no-cache, no-store, must-revalidate"; \
    } \
    \
    # API proxy (if needed) \
    location /api { \
        proxy_pass https://gomeet.cscodetech.cloud; \
        proxy_http_version 1.1; \
        proxy_set_header Upgrade $http_upgrade; \
        proxy_set_header Connection "upgrade"; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
        proxy_set_header X-Forwarded-Proto $scheme; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Copy built application from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Copy service workers from builder if they exist (ignore if missing)
COPY --from=builder /app/public/*.js /usr/share/nginx/html/ 2>/dev/null || true

# Set permissions
RUN chmod -R 755 /usr/share/nginx/html

# Expose port 80 (Coolify will handle port mapping)
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]