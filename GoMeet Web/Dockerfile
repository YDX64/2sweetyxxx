# ============================================
# Multi-stage Dockerfile for 2Sweety React App
# Optimized for Coolify Production Deployment
# ============================================

# ============================================
# Stage 1: Build Stage
# ============================================
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install build dependencies (for node-gyp and native modules)
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git

# Copy package files
COPY package*.json ./

# Install dependencies with production optimization
RUN npm ci --only=production --ignore-scripts && \
    npm cache clean --force

# Copy source code
COPY . .

# Build arguments for environment variables
# These will be injected at build time by Coolify
ARG REACT_APP_API_BASE_URL
ARG REACT_APP_IMAGE_BASE_URL
ARG REACT_APP_PAYMENT_BASE_URL
ARG REACT_APP_FIREBASE_API_KEY
ARG REACT_APP_FIREBASE_AUTH_DOMAIN
ARG REACT_APP_FIREBASE_PROJECT_ID
ARG REACT_APP_FIREBASE_STORAGE_BUCKET
ARG REACT_APP_FIREBASE_MESSAGING_SENDER_ID
ARG REACT_APP_FIREBASE_APP_ID
ARG REACT_APP_FIREBASE_MEASUREMENT_ID
ARG REACT_APP_ONESIGNAL_APP_ID
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
    SKIP_PREFLIGHT_CHECK=true

# Build the application
RUN npm run build

# Remove development dependencies and source code
RUN rm -rf node_modules src

# ============================================
# Stage 2: Production Stage with Nginx
# ============================================
FROM nginx:1.25-alpine

# Install security updates
RUN apk update && \
    apk upgrade && \
    apk add --no-cache \
    curl \
    tzdata && \
    rm -rf /var/cache/apk/*

# Set timezone (optional, adjust as needed)
ENV TZ=UTC

# Create nginx user with restricted permissions
RUN addgroup -g 1001 -S nginx-app && \
    adduser -u 1001 -S nginx-app -G nginx-app

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf
COPY nginx-default.conf /etc/nginx/conf.d/default.conf

# Copy built application from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Copy public assets that need to be in root (service workers, etc.)
COPY --from=builder /app/public/firebase-messaging-sw.js /usr/share/nginx/html/
COPY --from=builder /app/public/OneSignalSDKWorker.js /usr/share/nginx/html/

# Set proper permissions
RUN chown -R nginx-app:nginx-app /usr/share/nginx/html && \
    chown -R nginx-app:nginx-app /var/cache/nginx && \
    chown -R nginx-app:nginx-app /var/log/nginx && \
    chown -R nginx-app:nginx-app /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx-app:nginx-app /var/run/nginx.pid

# Switch to non-root user
USER nginx-app

# Expose port 8080 (Coolify prefers non-root ports)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8080/ || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
