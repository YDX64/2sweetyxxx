#!/bin/bash

echo "🚀 Coolify Deployment Script Starting..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build client
echo "🏗️ Building client application..."
cd client && npm install && npm run build
cd ..

# Copy built files to server public directory
echo "📋 Copying built files..."
rm -rf server/public
cp -r client/dist server/public

# Build server
echo "🖥️ Building server..."
npm run build

echo "✅ Deployment preparation completed!"
echo "🌐 Starting application..."

# Start the application
npm start 