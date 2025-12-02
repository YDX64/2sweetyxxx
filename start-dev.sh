#!/bin/bash
# 2Sweety Development Startup Script
# This ensures environment variables are loaded correctly

# Clear any conflicting environment variables
unset REACT_APP_GOOGLE_CLIENT_ID
unset REACT_APP_FACEBOOK_APP_ID
unset REACT_APP_APPLE_CLIENT_ID

# Start the development server
npm start
