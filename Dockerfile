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

# Copy package files from GoMeet Web directory
COPY ["GoMeet Web/package.json", "GoMeet Web/package-lock.json*", "./"]

# Install ALL dependencies (including devDependencies for build)
RUN npm ci

# Copy all source code from GoMeet Web
COPY ["GoMeet Web/", "./"]

# Build arguments for environment variables
ARG REACT_APP_API_BASE_URL=https://api.2sweety.com/api/
ARG REACT_APP_IMAGE_BASE_URL=https://api.2sweety.com/
ARG REACT_APP_PAYMENT_BASE_URL=https://api.2sweety.com/
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
    CI=false

# Build the application
RUN npm run build

# ============================================
# Stage 2: Production Stage with Nginx
# ============================================
FROM nginx:alpine

# Remove default nginx config
RUN rm -rf /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Copy service workers
COPY --from=builder /app/public/firebase-messaging-sw.js /usr/share/nginx/html/
COPY --from=builder /app/public/OneSignalSDKWorker.js /usr/share/nginx/html/

# Set permissions
RUN chmod -R 755 /usr/share/nginx/html && \
    chown -R nginx:nginx /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]