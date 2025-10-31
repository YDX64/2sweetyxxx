# 2Sweety Dating App - Development Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Getting Started](#getting-started)
3. [Environment Variables](#environment-variables)
4. [API Configuration](#api-configuration)
5. [Firebase Setup](#firebase-setup)
6. [Social Login Configuration](#social-login-configuration)
7. [Payment Gateway Integration](#payment-gateway-integration)
8. [Push Notifications](#push-notifications)
9. [Development Workflow](#development-workflow)
10. [Building and Deployment](#building-and-deployment)
11. [Troubleshooting](#troubleshooting)
12. [Project Structure](#project-structure)
13. [Adding New Features](#adding-new-features)
14. [Security Considerations](#security-considerations)
15. [Performance Optimization](#performance-optimization)

---

## 1. Project Overview

### About 2Sweety
2Sweety (GoMeet) is a modern dating application built with React that connects people based on shared interests, location, and preferences. The app features real-time chat, video/voice calling, and a sophisticated matching algorithm.

### Technology Stack
- **Frontend Framework**: React 18.2.0
- **Styling**: Tailwind CSS 3.3.6 + Material-UI 6.1.0
- **Routing**: React Router DOM 6.26.2
- **State Management**: React Context API
- **Backend Communication**: Axios 1.7.7
- **Real-time Chat**: Firebase Firestore
- **Video/Voice Calls**: Agora RTC SDK 4.23.0
- **Push Notifications**: OneSignal
- **Internationalization**: i18next 23.16.5
- **Payment Gateways**:
  - Razorpay
  - PayPal
  - Stripe
  - PayStack
  - Flutterwave
  - Mercado Pago
  - Paytm
  - Khalti
  - Midtrans
  - Senang Pay
  - Payfast

### Key Features
- User authentication (Email, Phone, Social Login)
- Profile creation with interests, hobbies, and preferences
- Swipe-based matching system
- Real-time messaging with Firebase
- Video and voice calling with Agora
- Premium subscriptions and coin-based features
- Wallet system for purchases
- Gift sending system
- Location-based matching
- Multi-language support
- Push notifications
- User blocking and reporting
- Email/Phone verification

---

## 2. Getting Started

### Prerequisites
- **Node.js**: v16.0.0 or higher (recommended v18.x LTS)
- **npm**: v8.0.0 or higher (comes with Node.js)
- **Git**: For version control
- **Code Editor**: VS Code (recommended) or any modern IDE

### Installation Steps

1. **Clone the Repository**
```bash
git clone <repository-url>
cd "GoMeet Web"
```

2. **Install Dependencies**
```bash
npm install
```

3. **Configure Environment Variables**
```bash
# Create .env.local file in the root directory
cp .env.example .env.local
```

4. **Update Environment Variables**
Edit `.env.local` with your actual configuration values (see [Environment Variables](#environment-variables) section)

5. **Start Development Server**
```bash
npm start
```

The application will open at `http://localhost:3000`

6. **Verify Installation**
- The app should load without errors
- Check browser console for any warnings
- Test basic navigation

### Running Development Server

```bash
# Start development server
npm start

# The app runs on http://localhost:3000
# Hot reload is enabled - changes will reflect automatically
```

### Building for Production

```bash
# Create optimized production build
npm run build

# Output will be in the 'build' folder
# This creates minified, optimized files ready for deployment
```

### Running Tests

```bash
# Run test suite
npm test

# Run tests with coverage
npm test -- --coverage
```

---

## 3. Environment Variables

### Complete .env Template

Create a `.env.local` file in the root directory with the following variables:

```bash
# ============================================
# GENERAL CONFIGURATION
# ============================================
ESLINT_NO_DEV_ERRORS=true
GENERATE_SOURCEMAP=false
SKIP_PREFLIGHT_CHECK=true

# ============================================
# API CONFIGURATION
# ============================================
# Backend API Base URL
REACT_APP_API_BASE_URL=https://gomeet.cscodetech.cloud/api/
REACT_APP_IMAGE_BASE_URL=https://gomeet.cscodetech.cloud/
REACT_APP_PAYMENT_BASE_URL=https://gomeet.cscodetech.cloud/

# API Timeout (milliseconds)
REACT_APP_API_TIMEOUT=30000

# ============================================
# FIREBASE CONFIGURATION
# ============================================
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
REACT_APP_FIREBASE_DATABASE_URL=https://your-project-id.firebaseio.com

# ============================================
# SOCIAL LOGIN - GOOGLE
# ============================================
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
REACT_APP_GOOGLE_CLIENT_SECRET=your_google_client_secret

# ============================================
# SOCIAL LOGIN - FACEBOOK
# ============================================
REACT_APP_FACEBOOK_APP_ID=your_facebook_app_id
REACT_APP_FACEBOOK_APP_SECRET=your_facebook_app_secret

# ============================================
# SOCIAL LOGIN - APPLE
# ============================================
REACT_APP_APPLE_CLIENT_ID=com.yourapp.identifier
REACT_APP_APPLE_REDIRECT_URI=https://yourdomain.com/auth/apple/callback
REACT_APP_APPLE_TEAM_ID=your_team_id
REACT_APP_APPLE_KEY_ID=your_key_id

# ============================================
# PAYMENT GATEWAYS
# ============================================

# Razorpay (India)
REACT_APP_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
REACT_APP_RAZORPAY_KEY_SECRET=your_razorpay_secret

# PayPal
REACT_APP_PAYPAL_CLIENT_ID=your_paypal_client_id
REACT_APP_PAYPAL_CLIENT_SECRET=your_paypal_secret
REACT_APP_PAYPAL_MODE=sandbox # or production

# Stripe
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxx
REACT_APP_STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxx

# PayStack (Africa)
REACT_APP_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxx
REACT_APP_PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxx

# Flutterwave (Africa)
REACT_APP_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-xxxxxxxxxxxxxxx
REACT_APP_FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-xxxxxxxxxxxxxxx

# Mercado Pago (Latin America)
REACT_APP_MERCADOPAGO_PUBLIC_KEY=TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
REACT_APP_MERCADOPAGO_ACCESS_TOKEN=TEST-xxxxxxxxxx-xxxxxx-xxxxxxxxxxxx

# Paytm (India)
REACT_APP_PAYTM_MERCHANT_ID=your_merchant_id
REACT_APP_PAYTM_MERCHANT_KEY=your_merchant_key
REACT_APP_PAYTM_WEBSITE=WEBSTAGING # or WEBPROD
REACT_APP_PAYTM_INDUSTRY_TYPE=Retail

# Khalti (Nepal)
REACT_APP_KHALTI_PUBLIC_KEY=test_public_key_xxxxxxxxxx
REACT_APP_KHALTI_SECRET_KEY=test_secret_key_xxxxxxxxxx

# Midtrans (Indonesia)
REACT_APP_MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxxxxxxxxxx
REACT_APP_MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxxxxxxxxxxx
REACT_APP_MIDTRANS_IS_PRODUCTION=false

# Senang Pay (Malaysia)
REACT_APP_SENANGPAY_MERCHANT_ID=your_merchant_id
REACT_APP_SENANGPAY_SECRET_KEY=your_secret_key

# Payfast (South Africa)
REACT_APP_PAYFAST_MERCHANT_ID=your_merchant_id
REACT_APP_PAYFAST_MERCHANT_KEY=your_merchant_key
REACT_APP_PAYFAST_PASSPHRASE=your_passphrase
REACT_APP_PAYFAST_MODE=sandbox # or production

# ============================================
# PUSH NOTIFICATIONS - ONESIGNAL
# ============================================
REACT_APP_ONESIGNAL_APP_ID=your_onesignal_app_id
REACT_APP_ONESIGNAL_REST_API_KEY=your_onesignal_rest_api_key
REACT_APP_ONESIGNAL_SAFARI_WEB_ID=web.onesignal.auto.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# ============================================
# VIDEO/VOICE CALLING - AGORA
# ============================================
REACT_APP_AGORA_APP_ID=your_agora_app_id
REACT_APP_AGORA_APP_CERTIFICATE=your_agora_app_certificate

# ============================================
# MAPS & LOCATION
# ============================================
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
REACT_APP_DEFAULT_LATITUDE=37.7749
REACT_APP_DEFAULT_LONGITUDE=-122.4194

# ============================================
# IMAGE UPLOAD
# ============================================
REACT_APP_MAX_IMAGE_SIZE=5242880 # 5MB in bytes
REACT_APP_ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/jpg,image/webp
REACT_APP_MAX_IMAGES_PER_PROFILE=6

# ============================================
# APP CONFIGURATION
# ============================================
REACT_APP_NAME=2Sweety
REACT_APP_VERSION=1.0.0
REACT_APP_ENVIRONMENT=development # or staging, production

# Default Language
REACT_APP_DEFAULT_LANGUAGE=en

# Currency
REACT_APP_DEFAULT_CURRENCY=USD
REACT_APP_CURRENCY_SYMBOL=$

# Matching Algorithm
REACT_APP_MAX_DISTANCE_KM=50000 # Maximum distance in kilometers
REACT_APP_MIN_AGE=18
REACT_APP_MAX_AGE=100

# Features Toggle
REACT_APP_ENABLE_VIDEO_CALL=true
REACT_APP_ENABLE_VOICE_CALL=true
REACT_APP_ENABLE_GIFT_SENDING=true
REACT_APP_ENABLE_PREMIUM_FEATURES=true

# ============================================
# DEVELOPMENT/DEBUG
# ============================================
REACT_APP_DEBUG_MODE=false
REACT_APP_SHOW_API_LOGS=false
REACT_APP_ENABLE_ANALYTICS=true

# ============================================
# SECURITY
# ============================================
REACT_APP_ENCRYPTION_KEY=your_32_character_encryption_key_here
REACT_APP_SESSION_TIMEOUT=3600000 # 1 hour in milliseconds
```

### Environment-Specific Configuration

#### Development (.env.development)
```bash
REACT_APP_ENVIRONMENT=development
REACT_APP_API_BASE_URL=http://localhost:8000/api/
REACT_APP_DEBUG_MODE=true
REACT_APP_SHOW_API_LOGS=true
```

#### Staging (.env.staging)
```bash
REACT_APP_ENVIRONMENT=staging
REACT_APP_API_BASE_URL=https://staging-api.2sweety.com/api/
REACT_APP_DEBUG_MODE=false
REACT_APP_SHOW_API_LOGS=true
```

#### Production (.env.production)
```bash
REACT_APP_ENVIRONMENT=production
REACT_APP_API_BASE_URL=https://api.2sweety.com/api/
REACT_APP_DEBUG_MODE=false
REACT_APP_SHOW_API_LOGS=false
GENERATE_SOURCEMAP=false
```

### Important Notes

1. **Never commit `.env.local` or `.env.production` to version control**
2. Add `.env*.local` to `.gitignore`
3. Keep `.env.example` updated with all required variables (without actual values)
4. Use different API keys for development, staging, and production
5. All environment variables must be prefixed with `REACT_APP_` to be accessible in React

---

## 4. API Configuration

### Backend API Setup

The application uses a PHP-based backend API hosted at `https://gomeet.cscodetech.cloud/api/`. All API calls are made through the Context Provider.

### API Base URLs

```javascript
// Configured in src/Context/MyProvider.jsx
const basUrl = "https://gomeet.cscodetech.cloud/api/";
const imageBaseURL = "https://gomeet.cscodetech.cloud/";
const paymentBaseURL = "https://gomeet.cscodetech.cloud/";
```

### Available API Endpoints

#### Authentication Endpoints

##### 1. User Registration
```http
POST /api/user_signup.php
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "ccode": "+1",
  "mobile": "1234567890",
  "refercode": "" // Optional
}
```

**Response:**
```json
{
  "ResponseCode": "200",
  "Result": "true",
  "ResponseMsg": "Signup Successfully",
  "UserLogin": {
    "id": "123",
    "name": "John Doe",
    "email": "john@example.com",
    "mobile": "1234567890",
    "ccode": "+1",
    "wallet": "0",
    "rcode": "ABC123",
    "is_subscribe": "0"
  }
}
```

##### 2. User Login
```http
POST /api/user_login.php
```

**Request Body:**
```json
{
  "mobile": "1234567890",
  "ccode": "+1",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "ResponseCode": "200",
  "Result": "true",
  "ResponseMsg": "Login Successfully",
  "UserLogin": {
    "id": "123",
    "name": "John Doe",
    "email": "john@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "profile_pic": "uploads/users/user123.jpg",
    "wallet": "100",
    "is_subscribe": "1"
  }
}
```

##### 3. Social Login (Google/Facebook/Apple)
```http
POST /api/user_login_social.php
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "name": "John Doe",
  "login_type": "google", // or "facebook", "apple"
  "social_id": "google_user_id_12345",
  "profile_pic": "https://lh3.googleusercontent.com/a/..."
}
```

##### 4. Email Verification
```http
POST /api/email_verify.php
```

**Request Body:**
```json
{
  "uid": "123",
  "otp": "123456"
}
```

##### 5. Phone Number Verification (OTP)
```http
POST /api/u_verify_otp.php
```

**Request Body:**
```json
{
  "uid": "123",
  "otp": "123456",
  "mobile": "1234567890",
  "ccode": "+1"
}
```

##### 6. Resend OTP
```http
POST /api/u_send_otp.php
```

**Request Body:**
```json
{
  "mobile": "1234567890",
  "ccode": "+1"
}
```

##### 7. Logout
```http
POST /api/user_logout.php
```

**Request Body:**
```json
{
  "uid": "123"
}
```

#### Profile Management

##### 8. Get User Profile
```http
POST /api/profile_view.php
```

**Request Body:**
```json
{
  "uid": "123"
}
```

**Response:**
```json
{
  "ResponseCode": "200",
  "Result": "true",
  "UserLogin": {
    "id": "123",
    "name": "John Doe",
    "email": "john@example.com",
    "mobile": "1234567890",
    "gender": "Male",
    "birth_date": "1990-01-01",
    "profile_pic": "uploads/users/user123.jpg",
    "bio": "Love to travel and meet new people",
    "latitude": "37.7749",
    "longitude": "-122.4194",
    "wallet": "100",
    "total_like": "25",
    "total_visit": "150",
    "is_verify": "1",
    "is_subscribe": "1",
    "Interest_Array": [
      {"id": "1", "title": "Travel"},
      {"id": "2", "title": "Photography"}
    ],
    "Language_Array": [
      {"id": "1", "title": "English"},
      {"id": "2", "title": "Spanish"}
    ],
    "Profile_Array": [
      {"id": "1", "img": "uploads/profile/img1.jpg"},
      {"id": "2", "img": "uploads/profile/img2.jpg"}
    ]
  }
}
```

##### 9. Update Profile
```http
POST /api/profile_edit.php
```

**Request Body (multipart/form-data):**
```json
{
  "uid": "123",
  "name": "John Doe",
  "email": "john@example.com",
  "bio": "Updated bio",
  "birth_date": "1990-01-01",
  "gender": "Male",
  "latitude": "37.7749",
  "longitude": "-122.4194",
  "interest": "1,2,3", // Comma-separated interest IDs
  "language": "1,2", // Comma-separated language IDs
  "religion_id": "1",
  "goal_id": "1",
  "profile_pic": [File], // Optional - image file
  "gallery_images[]": [File, File, ...] // Optional - multiple images
}
```

##### 10. Upload Identity Document
```http
POST /api/identity_doc.php
```

**Request Body:**
```json
{
  "uid": "123",
  "img": "base64_encoded_image_string"
}
```

##### 11. Delete Profile Image
```http
POST /api/profile_img_delete.php
```

**Request Body:**
```json
{
  "uid": "123",
  "img_id": "45"
}
```

#### Swipe/Like/Match System

##### 12. Get Home Data (Users to Swipe)
```http
POST /api/home_data.php
```

**Request Body:**
```json
{
  "uid": "123",
  "lats": "37.7749",
  "longs": "-122.4194"
}
```

**Response:**
```json
{
  "ResponseCode": "200",
  "Result": "true",
  "currency": "$",
  "directchat": "10", // Coins required for direct chat
  "filterinclude": "1", // Filter feature included in premium
  "UserData": [
    {
      "id": "456",
      "name": "Jane Smith",
      "gender": "Female",
      "birth_date": "1992-05-15",
      "profile_pic": "uploads/users/user456.jpg",
      "bio": "Adventure seeker",
      "rate_km": "5.2", // Distance in km
      "is_verify": "1",
      "is_subscribe": "1",
      "Interest_Array": [
        {"id": "1", "title": "Hiking"},
        {"id": "3", "title": "Music"}
      ],
      "Profile_Array": [
        {"img": "uploads/profile/img1.jpg"},
        {"img": "uploads/profile/img2.jpg"}
      ]
    }
  ]
}
```

##### 13. Like User (Swipe Right)
```http
POST /api/add_like.php
```

**Request Body:**
```json
{
  "uid": "123",
  "profile_id": "456"
}
```

**Response:**
```json
{
  "ResponseCode": "200",
  "Result": "true",
  "ResponseMsg": "Profile Liked Successfully",
  "is_match": "1" // 1 if mutual like (match), 0 otherwise
}
```

##### 14. Dislike User (Swipe Left)
```http
POST /api/add_dislike.php
```

**Request Body:**
```json
{
  "uid": "123",
  "profile_id": "456"
}
```

##### 15. Get Favorites/Likes List
```http
POST /api/favorite.php
```

**Request Body:**
```json
{
  "uid": "123"
}
```

**Response:**
```json
{
  "ResponseCode": "200",
  "Result": "true",
  "UserData": [
    {
      "id": "456",
      "name": "Jane Smith",
      "profile_pic": "uploads/users/user456.jpg",
      "rate_km": "5.2",
      "is_match": "1"
    }
  ]
}
```

##### 16. Get Visitors List
```http
POST /api/visitorlist.php
```

**Request Body:**
```json
{
  "uid": "123"
}
```

##### 17. Get Matches List
```http
POST /api/matchlist.php
```

**Request Body:**
```json
{
  "uid": "123"
}
```

#### Chat/Messaging

##### 18. Direct Chat (Send Coins to Unlock)
```http
POST /api/direct_chat.php
```

**Request Body:**
```json
{
  "uid": "123",
  "profile_id": "456"
}
```

**Response:**
```json
{
  "ResponseCode": "200",
  "Result": "true",
  "ResponseMsg": "Chat Unlocked Successfully",
  "remaining_coins": "90"
}
```

**Note:** Real-time messaging is handled by Firebase Firestore (see Firebase Setup section)

#### Payment/Subscription

##### 19. Get Payment Gateways
```http
POST /api/paymentgateway.php
```

**Response:**
```json
{
  "ResponseCode": "200",
  "Result": "true",
  "currency": "$",
  "PaymentData": [
    {
      "id": "1",
      "title": "Razorpay",
      "subtitle": "razorpay",
      "img": "uploads/payment/razorpay.png",
      "status": "1",
      "attributes": "rzp_test_xxxxxxxxxx"
    },
    {
      "id": "2",
      "title": "PayPal",
      "subtitle": "paypal",
      "status": "1",
      "attributes": "paypal_client_id"
    }
  ]
}
```

##### 20. Get Premium Plans
```http
POST /api/plan.php
```

**Request Body:**
```json
{
  "uid": "123"
}
```

**Response:**
```json
{
  "ResponseCode": "200",
  "Result": "true",
  "currency": "$",
  "PlanData": [
    {
      "id": "1",
      "title": "Gold Membership",
      "description": "1 Month Premium Access",
      "price": "29.99",
      "day": "30",
      "plan_description": [
        "Unlimited Likes",
        "See Who Likes You",
        "Advanced Filters",
        "Ad-Free Experience"
      ]
    },
    {
      "id": "2",
      "title": "Platinum Membership",
      "description": "3 Months Premium Access",
      "price": "69.99",
      "day": "90"
    }
  ]
}
```

##### 21. Purchase Premium Plan
```http
POST /api/plan_purchase.php
```

**Request Body:**
```json
{
  "uid": "123",
  "plan_id": "1",
  "transaction_id": "txn_1234567890",
  "amount": "29.99",
  "p_method_id": "1" // Payment method ID
}
```

**Response:**
```json
{
  "ResponseCode": "200",
  "Result": "true",
  "ResponseMsg": "Plan Purchased Successfully",
  "UserLogin": {
    "is_subscribe": "1",
    "plan_end_date": "2025-11-10"
  }
}
```

##### 22. Get Coin Packages
```http
POST /api/coin_plan.php
```

**Response:**
```json
{
  "ResponseCode": "200",
  "Result": "true",
  "currency": "$",
  "CoinData": [
    {
      "id": "1",
      "coin": "100",
      "price": "9.99",
      "status": "1"
    },
    {
      "id": "2",
      "coin": "500",
      "price": "39.99",
      "status": "1"
    }
  ]
}
```

##### 23. Purchase Coins
```http
POST /api/coin_purchase.php
```

**Request Body:**
```json
{
  "uid": "123",
  "coin_id": "1",
  "transaction_id": "txn_0987654321",
  "amount": "9.99",
  "p_method_id": "1"
}
```

#### Wallet Management

##### 24. Get Wallet Balance
```http
POST /api/wallet_report.php
```

**Request Body:**
```json
{
  "uid": "123"
}
```

**Response:**
```json
{
  "ResponseCode": "200",
  "Result": "true",
  "wallet": "150",
  "currency": "$",
  "WalletData": [
    {
      "id": "1",
      "message": "Purchased 100 coins",
      "status": "Credit",
      "amt": "100",
      "tdate": "2025-10-01 14:30:00"
    },
    {
      "id": "2",
      "message": "Direct chat with Jane",
      "status": "Debit",
      "amt": "10",
      "tdate": "2025-10-02 16:45:00"
    }
  ]
}
```

##### 25. Get Coin Report
```http
POST /api/coin_report.php
```

**Request Body:**
```json
{
  "uid": "123"
}
```

##### 26. Payout Request
```http
POST /api/payout_request.php
```

**Request Body:**
```json
{
  "uid": "123",
  "amount": "50.00",
  "receipt": "base64_encoded_receipt_image"
}
```

##### 27. Get Payout List
```http
POST /api/payout_list.php
```

**Request Body:**
```json
{
  "uid": "123"
}
```

#### Premium Features

##### 28. Send Gift
```http
POST /api/gift_send.php
```

**Request Body:**
```json
{
  "uid": "123",
  "profile_id": "456",
  "gift_id": "5,7,9", // Comma-separated gift IDs
  "total_coin": "30" // Total coins to deduct
}
```

**Response:**
```json
{
  "ResponseCode": "200",
  "Result": "true",
  "ResponseMsg": "Gift Sent Successfully",
  "remaining_coins": "70"
}
```

##### 29. Get Gift List
```http
POST /api/giftlist.php
```

**Response:**
```json
{
  "ResponseCode": "200",
  "Result": "true",
  "GiftData": [
    {
      "id": "1",
      "title": "Rose",
      "img": "uploads/gifts/rose.png",
      "coin": "5"
    },
    {
      "id": "2",
      "title": "Diamond Ring",
      "img": "uploads/gifts/ring.png",
      "coin": "50"
    }
  ]
}
```

#### Block/Report Users

##### 30. Block User
```http
POST /api/add_block.php
```

**Request Body:**
```json
{
  "uid": "123",
  "block_uid": "789",
  "reason": "Inappropriate behavior"
}
```

##### 31. Unblock User
```http
POST /api/unblock.php
```

**Request Body:**
```json
{
  "uid": "123",
  "block_uid": "789"
}
```

##### 32. Get Blocked Users List
```http
POST /api/blocklist.php
```

**Request Body:**
```json
{
  "uid": "123"
}
```

##### 33. Report User
```http
POST /api/report_user.php
```

**Request Body:**
```json
{
  "uid": "123",
  "profile_id": "789",
  "comment": "Spam account",
  "reason_id": "3"
}
```

#### Additional Endpoints

##### 34. Get Interests List
```http
POST /api/interest.php
```

**Response:**
```json
{
  "ResponseCode": "200",
  "Result": "true",
  "InterestData": [
    {"id": "1", "title": "Travel", "img": "uploads/interests/travel.png"},
    {"id": "2", "title": "Music", "img": "uploads/interests/music.png"}
  ]
}
```

##### 35. Get Languages List
```http
POST /api/languagelist.php
```

##### 36. Get Religion List
```http
POST /api/religionlist.php
```

##### 37. Get Goals/Relationship List
```http
POST /api/goal.php
```

##### 38. Get App Pages (Terms, Privacy, etc.)
```http
POST /api/pagelist.php
```

**Response:**
```json
{
  "ResponseCode": "200",
  "Result": "true",
  "PageList": [
    {
      "id": "1",
      "title": "Terms and Conditions",
      "description": "<p>Full terms and conditions HTML content...</p>",
      "status": "1"
    },
    {
      "id": "2",
      "title": "Privacy Policy",
      "description": "<p>Privacy policy content...</p>",
      "status": "1"
    }
  ]
}
```

##### 39. Get SMS Type Configuration
```http
POST /api/sms_type.php
```

**Response:**
```json
{
  "ResponseCode": "200",
  "Result": "true",
  "sms_type": "firebase" // or "twilio", "msg91", etc.
}
```

##### 40. Get Notifications
```http
POST /api/notificationlist.php
```

**Request Body:**
```json
{
  "uid": "123"
}
```

### API Request/Response Format

#### Standard Request Headers
```javascript
{
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  // For authenticated requests
  'Authorization': 'Bearer <token>'
}
```

#### Standard Response Format
```json
{
  "ResponseCode": "200", // "200" = success, "401" = error
  "Result": "true",      // "true" = success, "false" = error
  "ResponseMsg": "Success message or error description",
  "UserLogin": {},       // User data (if applicable)
  "Data": []            // Response data (varies by endpoint)
}
```

### Error Handling

#### Common Error Codes
```json
{
  "ResponseCode": "401",
  "Result": "false",
  "ResponseMsg": "Error message"
}
```

**Error Scenarios:**
- `ResponseCode: "401"` - Authentication failed
- `ResponseCode: "404"` - Resource not found
- `ResponseCode: "500"` - Server error
- `ResponseCode: "400"` - Bad request / Validation error

#### Example Error Handling in Code
```javascript
import axios from 'axios';
import { showTost } from './showTost';

const apiCall = async (endpoint, data) => {
  try {
    const response = await axios.post(`${basUrl}${endpoint}`, data);

    if (response.data.ResponseCode === "200" && response.data.Result === "true") {
      return response.data;
    } else {
      showTost(response.data.ResponseMsg || "An error occurred", "error");
      return null;
    }
  } catch (error) {
    console.error("API Error:", error);
    showTost("Network error. Please try again.", "error");
    return null;
  }
};
```

### API Rate Limiting

The backend may implement rate limiting. Best practices:
- Cache responses when appropriate
- Implement exponential backoff for retries
- Batch requests when possible
- Use debouncing for search/filter operations

---

## 5. Firebase Setup

Firebase is used for real-time chat messaging and push notifications in the 2Sweety app.

### Firebase Project Creation

1. **Go to Firebase Console**
   - Visit [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - Sign in with your Google account

2. **Create New Project**
   - Click "Add project"
   - Enter project name: `2sweety-dating-app` (or your preferred name)
   - Enable Google Analytics (recommended)
   - Select or create Analytics account
   - Click "Create project"

3. **Register Web App**
   - In project overview, click the web icon `</>`
   - App nickname: `2Sweety Web`
   - Check "Also set up Firebase Hosting" (optional)
   - Click "Register app"

### Firestore Database Configuration

1. **Enable Firestore**
   - In Firebase Console, go to "Firestore Database"
   - Click "Create database"
   - Start in **test mode** for development (switch to production mode later)
   - Choose location closest to your users
   - Click "Enable"

2. **Database Structure**

Create the following collections:

```
users/
  ├── {userId}/
  │   ├── id: string
  │   ├── name: string
  │   ├── email: string
  │   ├── profile_pic: string
  │   ├── online: boolean
  │   ├── lastSeen: timestamp
  │   └── fcmToken: string

chats/
  ├── {chatId}/
  │   ├── users: array[userId1, userId2]
  │   ├── lastMessage: string
  │   ├── lastMessageTime: timestamp
  │   ├── unreadCount_userId1: number
  │   ├── unreadCount_userId2: number
  │   └── messages/
  │       ├── {messageId}/
  │       │   ├── senderId: string
  │       │   ├── receiverId: string
  │       │   ├── message: string
  │       │   ├── type: string (text/image/voice)
  │       │   ├── timestamp: timestamp
  │       │   ├── read: boolean
  │       │   └── imageUrl: string (optional)

notifications/
  ├── {userId}/
  │   ├── {notificationId}/
  │   │   ├── title: string
  │   │   ├── body: string
  │   │   ├── type: string (match/message/like/gift)
  │   │   ├── timestamp: timestamp
  │   │   ├── read: boolean
  │   │   └── data: object
```

### Firebase Authentication Setup

1. **Enable Authentication Methods**
   - Go to "Authentication" in Firebase Console
   - Click "Get started"
   - Enable the following sign-in methods:
     - **Email/Password**: For traditional signup
     - **Google**: For Google OAuth
     - **Facebook**: For Facebook login
     - **Apple**: For Apple Sign In

2. **Configure Google Sign-In**
   - Click "Google" in Sign-in providers
   - Enable toggle
   - Enter project support email
   - Save

3. **Configure Facebook Sign-In**
   - Click "Facebook" in Sign-in providers
   - Enable toggle
   - Enter App ID and App Secret from Facebook Developer Console
   - Copy OAuth redirect URI and add to Facebook App settings
   - Save

4. **Configure Apple Sign-In**
   - Click "Apple" in Sign-in providers
   - Enable toggle
   - Enter required details from Apple Developer account
   - Save

### Storage Bucket Configuration

1. **Enable Firebase Storage**
   - Go to "Storage" in Firebase Console
   - Click "Get started"
   - Start in **test mode** (update rules for production)
   - Choose storage location
   - Click "Done"

2. **Storage Structure**
```
storage/
  ├── users/
  │   ├── {userId}/
  │   │   ├── profile.jpg
  │   │   └── gallery/
  │   │       ├── img1.jpg
  │   │       ├── img2.jpg
  │   │       └── ...
  │
  ├── chat/
  │   ├── {chatId}/
  │   │   ├── img_timestamp.jpg
  │   │   └── ...
  │
  └── verification/
      └── {userId}_document.jpg
```

### Security Rules

#### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users collection
    match /users/{userId} {
      // Allow read for authenticated users
      allow read: if request.auth != null;
      // Allow write only for own profile
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Chats collection
    match /chats/{chatId} {
      // Allow read if user is part of the chat
      allow read: if request.auth != null &&
        request.auth.uid in resource.data.users;

      // Allow create if user is part of the chat
      allow create: if request.auth != null &&
        request.auth.uid in request.resource.data.users;

      // Allow update if user is part of the chat
      allow update: if request.auth != null &&
        request.auth.uid in resource.data.users;

      // Messages subcollection
      match /messages/{messageId} {
        // Allow read if user is part of the parent chat
        allow read: if request.auth != null &&
          request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.users;

        // Allow create if user is sender
        allow create: if request.auth != null &&
          request.auth.uid == request.resource.data.senderId;

        // Allow update only for read status
        allow update: if request.auth != null &&
          request.auth.uid == resource.data.receiverId &&
          request.resource.data.diff(resource.data).affectedKeys().hasOnly(['read']);
      }
    }

    // Notifications collection
    match /notifications/{userId}/{notificationId} {
      // Allow read for own notifications
      allow read: if request.auth != null && request.auth.uid == userId;
      // Allow write for own notifications
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

#### Storage Security Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    // Users folder
    match /users/{userId}/{allPaths=**} {
      // Allow read for all authenticated users
      allow read: if request.auth != null;
      // Allow write only for own files
      allow write: if request.auth != null &&
        request.auth.uid == userId &&
        request.resource.size < 5 * 1024 * 1024 && // 5MB max
        request.resource.contentType.matches('image/.*');
    }

    // Chat images
    match /chat/{chatId}/{allPaths=**} {
      // Allow read if user is part of the chat (requires Firestore lookup)
      allow read: if request.auth != null;
      // Allow write if authenticated and valid image
      allow write: if request.auth != null &&
        request.resource.size < 5 * 1024 * 1024 &&
        request.resource.contentType.matches('image/.*');
    }

    // Verification documents
    match /verification/{userId}_{allPaths=**} {
      // Only allow read by admins (implement custom claims)
      allow read: if request.auth != null &&
        request.auth.token.admin == true;
      // Allow write only for own documents
      allow write: if request.auth != null &&
        request.auth.uid == userId &&
        request.resource.size < 10 * 1024 * 1024;
    }
  }
}
```

### Firebase Configuration in Code

Update `src/Users_Chats/Firebase.js`:

```javascript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { getStorage } from 'firebase/storage';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const db = getFirestore(app);
const database = getDatabase(app);
const messaging = getMessaging(app);
const storage = getStorage(app);

// Request notification permission and get FCM token
export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: 'YOUR_VAPID_KEY' // Get from Firebase Console -> Project Settings -> Cloud Messaging
      });
      console.log('FCM Token:', token);
      return token;
    }
  } catch (error) {
    console.error('Error getting FCM token:', error);
  }
};

// Listen for foreground messages
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });

// Export initialized Firebase services
export { db, database, messaging, storage };
```

### Firebase Cloud Messaging (FCM) Setup

1. **Generate VAPID Key**
   - Go to Firebase Console -> Project Settings
   - Click "Cloud Messaging" tab
   - Under "Web configuration", click "Generate key pair"
   - Copy the VAPID key
   - Add to `.env.local`:
     ```bash
     REACT_APP_FIREBASE_VAPID_KEY=your_vapid_key_here
     ```

2. **Create Service Worker**

Create `public/firebase-messaging-sw.js`:

```javascript
importScripts('https://www.gstatic.com/firebasejs/11.1.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.1.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo192.png',
    badge: '/logo192.png',
    tag: payload.data?.chatId || 'default',
    requireInteraction: true,
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        for (let client of windowClients) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
```

### Testing Firebase Setup

1. **Test Firestore Connection**
```javascript
import { collection, addDoc } from 'firebase/firestore';
import { db } from './Users_Chats/Firebase';

const testFirestore = async () => {
  try {
    const docRef = await addDoc(collection(db, "test"), {
      message: "Firebase is working!",
      timestamp: new Date()
    });
    console.log("Document written with ID: ", docRef.id);
  } catch (error) {
    console.error("Error adding document: ", error);
  }
};
```

2. **Test FCM**
```javascript
import { requestNotificationPermission, onMessageListener } from './Users_Chats/Firebase';

// Request permission and get token
const fcmToken = await requestNotificationPermission();
console.log('FCM Token:', fcmToken);

// Listen for messages
onMessageListener()
  .then((payload) => {
    console.log('Message received:', payload);
  })
  .catch((err) => console.log('Failed to receive message:', err));
```

---

## 6. Social Login Configuration

For detailed social login setup, see [SOCIAL_LOGIN_INTEGRATION.md](./SOCIAL_LOGIN_INTEGRATION.md).

### Quick Setup Checklist

#### Google OAuth Setup
- [ ] Create project in Google Cloud Console
- [ ] Enable Google+ API
- [ ] Create OAuth 2.0 credentials
- [ ] Add authorized JavaScript origins
- [ ] Add authorized redirect URIs
- [ ] Copy Client ID to `.env.local`

#### Facebook Login Setup
- [ ] Create app in Facebook Developers
- [ ] Add Facebook Login product
- [ ] Configure Valid OAuth Redirect URIs
- [ ] Set App Domains
- [ ] Copy App ID and App Secret to `.env.local`
- [ ] Enable required permissions

#### Apple Sign In Setup
- [ ] Enroll in Apple Developer Program
- [ ] Create App ID with Sign In capability
- [ ] Create Services ID
- [ ] Create and download private key
- [ ] Configure Return URLs
- [ ] Copy credentials to `.env.local`

### Testing Social Login in Development

1. **Google Login Test**
```bash
# Add to authorized origins
http://localhost:3000

# Add to redirect URIs
http://localhost:3000/auth/google/callback
```

2. **Facebook Login Test**
```bash
# Add test users in Facebook App Dashboard
# Use test mode for development
```

3. **Apple Sign In Test**
```bash
# Apple requires HTTPS even in development
# Use ngrok or similar for local testing:
ngrok http 3000
```

---

## 7. Payment Gateway Integration

The app supports multiple payment gateways for global reach.

### Supported Payment Gateways

1. **Razorpay** (India)
2. **PayPal** (Global)
3. **Stripe** (Global)
4. **PayStack** (Africa)
5. **Flutterwave** (Africa)
6. **Mercado Pago** (Latin America)
7. **Paytm** (India)
8. **Khalti** (Nepal)
9. **Midtrans** (Indonesia)
10. **Senang Pay** (Malaysia)
11. **Payfast** (South Africa)

### Configuration for Each Gateway

#### Razorpay Setup

1. **Create Account**
   - Go to [https://razorpay.com](https://razorpay.com)
   - Sign up for merchant account
   - Complete KYC verification

2. **Get API Keys**
   - Dashboard -> Settings -> API Keys
   - Generate Test Keys for development
   - Generate Live Keys for production

3. **Configure in .env**
```bash
REACT_APP_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
REACT_APP_RAZORPAY_KEY_SECRET=your_secret_key
```

4. **Implementation Example**
```javascript
// src/PaymentMethod/Razorpay.jsx
import useRazorpay from "react-razorpay";

const options = {
  key: process.env.REACT_APP_RAZORPAY_KEY_ID,
  amount: amount * 100, // Amount in paise
  currency: "INR",
  name: "2Sweety",
  description: "Premium Subscription",
  order_id: orderId, // Get from backend
  handler: function (response) {
    // Handle success
    console.log(response.razorpay_payment_id);
  },
  prefill: {
    name: userData.name,
    email: userData.email,
    contact: userData.mobile
  },
  theme: {
    color: "#980EFF"
  }
};

const rzp = new Razorpay(options);
rzp.open();
```

#### PayPal Setup

1. **Create Developer Account**
   - Go to [https://developer.paypal.com](https://developer.paypal.com)
   - Create app in Dashboard

2. **Get Credentials**
   - Copy Client ID and Secret
   - Use Sandbox credentials for testing

3. **Configure in .env**
```bash
REACT_APP_PAYPAL_CLIENT_ID=your_client_id
REACT_APP_PAYPAL_CLIENT_SECRET=your_secret
REACT_APP_PAYPAL_MODE=sandbox # or production
```

#### Stripe Setup

1. **Create Account**
   - Go to [https://stripe.com](https://stripe.com)
   - Create account and verify business

2. **Get API Keys**
   - Dashboard -> Developers -> API keys
   - Copy Publishable key and Secret key

3. **Configure in .env**
```bash
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxx
REACT_APP_STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxx
```

4. **Implementation Example**
```javascript
// src/PaymentMethod/Stripe.jsx
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    event.preventDefault();

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: elements.getElement(CardElement),
    });

    if (!error) {
      // Send paymentMethod.id to backend
      console.log('Payment Method:', paymentMethod);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit" disabled={!stripe}>
        Pay
      </button>
    </form>
  );
};
```

### Testing Payments in Development

#### Test Card Numbers

**Stripe:**
```
Card Number: 4242 4242 4242 4242
Expiry: Any future date
CVC: Any 3 digits
ZIP: Any 5 digits
```

**Razorpay:**
```
Card Number: 4111 1111 1111 1111
Expiry: Any future date
CVV: Any 3 digits
OTP: 123456
```

**PayPal:**
```
Use PayPal Sandbox test accounts
Email: sb-test@personal.example.com
Password: provided in sandbox
```

### Webhook Setup

Webhooks are required for payment confirmation and subscription renewals.

#### Razorpay Webhook

1. **Create Webhook**
   - Dashboard -> Settings -> Webhooks
   - Add URL: `https://yourdomain.com/api/razorpay_webhook.php`
   - Select events: `payment.captured`, `payment.failed`, `subscription.charged`
   - Copy webhook secret

2. **Verify Webhook**
```php
// Backend webhook handler
$webhookSecret = 'your_webhook_secret';
$webhookSignature = $_SERVER['HTTP_X_RAZORPAY_SIGNATURE'];
$payload = file_get_contents('php://input');

$expectedSignature = hash_hmac('sha256', $payload, $webhookSecret);

if ($webhookSignature === $expectedSignature) {
  // Process webhook
  $event = json_decode($payload, true);

  if ($event['event'] === 'payment.captured') {
    // Update payment status
  }
}
```

#### Stripe Webhook

1. **Create Webhook**
   - Dashboard -> Developers -> Webhooks
   - Add endpoint: `https://yourdomain.com/api/stripe_webhook.php`
   - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`

2. **Verify Webhook**
```php
$endpoint_secret = 'whsec_...';
$payload = @file_get_contents('php://input');
$sig_header = $_SERVER['HTTP_STRIPE_SIGNATURE'];

try {
  $event = \Stripe\Webhook::constructEvent($payload, $sig_header, $endpoint_secret);
} catch(\Exception $e) {
  http_response_code(400);
  exit();
}

// Handle event
switch ($event->type) {
  case 'payment_intent.succeeded':
    // Update subscription
    break;
}
```

---

## 8. Push Notifications

### OneSignal Configuration

OneSignal is used for push notifications across web and mobile platforms.

#### Setup Steps

1. **Create OneSignal Account**
   - Go to [https://onesignal.com](https://onesignal.com)
   - Sign up and create new app
   - App name: `2Sweety Dating App`

2. **Configure Web Push**
   - Select "Web Push" platform
   - Choose "Typical Site" setup
   - Enter site URL: `https://yourdomain.com`
   - Upload icon (256x256 px recommended)
   - Configure notification settings

3. **Get Credentials**
   - Copy App ID
   - Copy REST API Key
   - For Safari: Copy Safari Web ID

4. **Add to .env.local**
```bash
REACT_APP_ONESIGNAL_APP_ID=your_app_id_here
REACT_APP_ONESIGNAL_REST_API_KEY=your_rest_api_key
REACT_APP_ONESIGNAL_SAFARI_WEB_ID=web.onesignal.auto.xxxxxxxx
```

#### OneSignal SDK Integration

1. **Initialize OneSignal**

Update `public/index.html`:
```html
<script src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" defer></script>
<script>
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  OneSignalDeferred.push(async function(OneSignal) {
    await OneSignal.init({
      appId: "YOUR_ONESIGNAL_APP_ID",
      safari_web_id: "YOUR_SAFARI_WEB_ID",
      notifyButton: {
        enable: true,
      },
      allowLocalhostAsSecureOrigin: true
    });
  });
</script>
```

2. **Tag Users**
```javascript
// After user login
window.OneSignalDeferred.push(function(OneSignal) {
  OneSignal.User.addTag("user_id", userId);
  OneSignal.User.addEmail(userEmail);
  OneSignal.User.addSms(userPhone);
});
```

3. **Send Notification from Backend**
```javascript
// src/User_Call/Onesignal.js
const sendNotification = async (userId, title, message, data) => {
  try {
    const response = await axios.post(
      'https://onesignal.com/api/v1/notifications',
      {
        app_id: onesignalAppId,
        filters: [
          { field: 'tag', key: 'user_id', value: userId }
        ],
        headings: { en: title },
        contents: { en: message },
        data: data,
        web_url: data.url || '/',
        chrome_web_icon: '/logo192.png',
        chrome_web_badge: '/logo192.png'
      },
      {
        headers: {
          'Authorization': `Basic ${onesignalRestApiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('OneSignal error:', error);
  }
};
```

#### Notification Types

1. **Match Notification**
```javascript
sendNotification(userId, 'New Match!', 'You matched with Jane!', {
  type: 'match',
  profileId: '456',
  url: '/chat'
});
```

2. **Message Notification**
```javascript
sendNotification(userId, 'New Message', 'Jane sent you a message', {
  type: 'message',
  chatId: 'chat_123',
  url: '/chat'
});
```

3. **Like Notification**
```javascript
sendNotification(userId, 'Someone Likes You!', 'You have a new like', {
  type: 'like',
  url: '/explore'
});
```

4. **Gift Notification**
```javascript
sendNotification(userId, 'Gift Received!', 'Jane sent you a gift', {
  type: 'gift',
  giftId: '5',
  senderId: '456',
  url: '/profile'
});
```

### Testing Notifications

1. **Test in Development**
```bash
# OneSignal requires HTTPS
# Use ngrok for local testing:
ngrok http 3000

# Update OneSignal site URL to ngrok URL
```

2. **Send Test Notification**
   - OneSignal Dashboard -> Messages
   - Click "New Push"
   - Select "Send to Test Users"
   - Enter your OneSignal User ID
   - Compose message and send

3. **Debug Notifications**
```javascript
// Enable OneSignal logging
window.OneSignalDeferred.push(function(OneSignal) {
  OneSignal.Debug.setLogLevel('trace');
});

// Check subscription status
window.OneSignalDeferred.push(async function(OneSignal) {
  const isPushSupported = await OneSignal.Notifications.isPushSupported();
  const permission = await OneSignal.Notifications.permissionNative;
  console.log('Push supported:', isPushSupported);
  console.log('Permission:', permission);
});
```

---

## 9. Development Workflow

### Git Branching Strategy

We follow **Git Flow** branching model:

```
main (production)
  └── develop (integration)
      ├── feature/user-authentication
      ├── feature/chat-system
      ├── feature/payment-integration
      ├── bugfix/login-error
      └── hotfix/critical-security-fix
```

#### Branch Naming Conventions

- **Feature**: `feature/feature-name`
- **Bugfix**: `bugfix/bug-description`
- **Hotfix**: `hotfix/critical-fix`
- **Release**: `release/v1.0.0`

#### Workflow

1. **Create Feature Branch**
```bash
git checkout develop
git pull origin develop
git checkout -b feature/new-feature
```

2. **Make Changes and Commit**
```bash
git add .
git commit -m "feat: add user profile editing"
```

3. **Push and Create Pull Request**
```bash
git push origin feature/new-feature
# Create PR on GitHub/GitLab
```

4. **Merge to Develop**
```bash
# After code review approval
git checkout develop
git merge feature/new-feature
git push origin develop
```

5. **Deploy to Production**
```bash
git checkout main
git merge develop
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin main --tags
```

### Commit Message Convention

Follow **Conventional Commits** specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, missing semi-colons, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```bash
feat(auth): add Google OAuth login
fix(chat): resolve message ordering issue
docs(readme): update installation instructions
refactor(dashboard): optimize swipe component
```

### Code Review Process

1. **Pull Request Checklist**
   - [ ] Code follows project style guide
   - [ ] All tests pass
   - [ ] No console errors or warnings
   - [ ] Documentation updated (if needed)
   - [ ] Screenshots added (for UI changes)
   - [ ] Breaking changes noted

2. **Review Guidelines**
   - Review within 24 hours
   - Provide constructive feedback
   - Test functionality locally
   - Check for security vulnerabilities
   - Verify mobile responsiveness

3. **Approval Requirements**
   - At least 1 approval from senior developer
   - All CI/CD checks must pass
   - No merge conflicts

### Testing Guidelines

#### Unit Tests

```javascript
// Example: Testing API utility function
import { apiCall } from './utils/api';

describe('apiCall', () => {
  it('should return data on successful API call', async () => {
    const data = await apiCall('user_login.php', {
      mobile: '1234567890',
      password: 'test123'
    });

    expect(data.ResponseCode).toBe('200');
    expect(data.Result).toBe('true');
  });

  it('should handle API errors', async () => {
    const data = await apiCall('invalid_endpoint.php', {});
    expect(data).toBeNull();
  });
});
```

#### Component Tests

```javascript
// Example: Testing Dashboard component
import { render, screen, fireEvent } from '@testing-library/react';
import Dashboard from './LoginComponent/Dashboard';

describe('Dashboard', () => {
  it('renders user cards', () => {
    render(<Dashboard />);
    expect(screen.getByText(/Discover/i)).toBeInTheDocument();
  });

  it('handles swipe right action', () => {
    render(<Dashboard />);
    const likeButton = screen.getByRole('button', { name: /like/i });
    fireEvent.click(likeButton);
    // Assert expected behavior
  });
});
```

#### Integration Tests

```javascript
// Example: Testing login flow
describe('Login Flow', () => {
  it('should login user with valid credentials', async () => {
    // 1. Enter phone number
    // 2. Enter password
    // 3. Click login
    // 4. Verify redirect to dashboard
    // 5. Verify user data in localStorage
  });
});
```

### Deployment Process

See [Building and Deployment](#building-and-deployment) section for detailed deployment instructions.

---

## 10. Building and Deployment

### Production Build

#### 1. Pre-build Checklist

- [ ] All environment variables configured for production
- [ ] Firebase security rules updated to production mode
- [ ] Payment gateways switched to live keys
- [ ] API base URL pointing to production server
- [ ] Debug mode disabled
- [ ] Source maps disabled (`GENERATE_SOURCEMAP=false`)
- [ ] All tests passing
- [ ] No console errors in production build

#### 2. Create Production Build

```bash
# Clean previous builds
rm -rf build

# Create optimized production build
npm run build

# Output will be in the 'build' folder
```

#### 3. Verify Build

```bash
# Serve build locally for testing
npx serve -s build

# Open http://localhost:3000
# Test critical user flows:
# - Login/Registration
# - Profile creation
# - Matching/Swiping
# - Chat messaging
# - Payment flow
```

### Environment-Specific Configurations

#### Development Build
```bash
# Uses .env.development
npm start
```

#### Staging Build
```bash
# Create .env.staging
# Then build:
REACT_APP_ENV=staging npm run build
```

#### Production Build
```bash
# Uses .env.production
npm run build
```

### Deployment to Hosting Platforms

#### Deploy to Vercel

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy**
```bash
# First deployment
vercel

# Production deployment
vercel --prod
```

4. **Configure Environment Variables**
   - Go to Vercel Dashboard -> Project -> Settings -> Environment Variables
   - Add all production environment variables
   - Redeploy after adding variables

#### Deploy to Netlify

1. **Install Netlify CLI**
```bash
npm install -g netlify-cli
```

2. **Login to Netlify**
```bash
netlify login
```

3. **Deploy**
```bash
# Build and deploy
npm run build
netlify deploy --prod --dir=build
```

4. **Configure Redirects**

Create `public/_redirects`:
```
/*    /index.html   200
```

#### Deploy to Firebase Hosting

1. **Install Firebase CLI**
```bash
npm install -g firebase-tools
```

2. **Login to Firebase**
```bash
firebase login
```

3. **Initialize Hosting**
```bash
firebase init hosting

# Select options:
# - Public directory: build
# - Single-page app: Yes
# - Automatic builds: No
```

4. **Deploy**
```bash
npm run build
firebase deploy --only hosting
```

#### Deploy to AWS S3 + CloudFront

1. **Build Application**
```bash
npm run build
```

2. **Create S3 Bucket**
```bash
aws s3 mb s3://2sweety-app
```

3. **Upload Build**
```bash
aws s3 sync build/ s3://2sweety-app --delete
```

4. **Configure CloudFront**
   - Create CloudFront distribution
   - Set origin to S3 bucket
   - Configure custom error responses (404 -> 200 with /index.html)
   - Add SSL certificate
   - Configure caching behavior

### CI/CD Setup

#### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout code
      uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run tests
      run: npm test -- --coverage --watchAll=false

    - name: Build application
      run: npm run build
      env:
        REACT_APP_API_BASE_URL: ${{ secrets.API_BASE_URL }}
        REACT_APP_FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
        # Add all environment variables as secrets

    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
        vercel-args: '--prod'
        working-directory: ./
```

#### GitLab CI/CD

Create `.gitlab-ci.yml`:

```yaml
stages:
  - test
  - build
  - deploy

test:
  stage: test
  image: node:18
  script:
    - npm ci
    - npm test -- --coverage --watchAll=false
  only:
    - merge_requests
    - main

build:
  stage: build
  image: node:18
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - build/
  only:
    - main

deploy:
  stage: deploy
  image: node:18
  script:
    - npm install -g netlify-cli
    - netlify deploy --prod --dir=build --auth=$NETLIFY_AUTH_TOKEN --site=$NETLIFY_SITE_ID
  only:
    - main
  when: on_success
```

### Post-Deployment Checklist

- [ ] Verify production URL is accessible
- [ ] Test user registration and login
- [ ] Verify Firebase connection (chat, notifications)
- [ ] Test payment gateway integration
- [ ] Check social login functionality
- [ ] Verify push notifications working
- [ ] Test on multiple devices (desktop, mobile, tablet)
- [ ] Check browser compatibility (Chrome, Firefox, Safari, Edge)
- [ ] Monitor error logs and analytics
- [ ] Verify SSL certificate is valid
- [ ] Test performance (Lighthouse score > 90)

### Rollback Strategy

If issues are detected after deployment:

1. **Immediate Rollback (Vercel)**
```bash
vercel rollback
```

2. **Immediate Rollback (Netlify)**
   - Go to Netlify Dashboard
   - Click "Deploys"
   - Click "..." on previous successful deploy
   - Click "Publish deploy"

3. **Git Revert**
```bash
# Revert last commit
git revert HEAD
git push origin main

# Redeploy automatically triggers
```

---

## 11. Troubleshooting

### Common Development Issues

#### Issue: npm install fails with errors

**Symptoms:**
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE could not resolve
```

**Solutions:**
```bash
# Solution 1: Use legacy peer deps
npm install --legacy-peer-deps

# Solution 2: Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# Solution 3: Update npm
npm install -g npm@latest
```

#### Issue: Module not found errors

**Symptoms:**
```
Module not found: Can't resolve 'module-name'
```

**Solutions:**
```bash
# Reinstall specific package
npm uninstall module-name
npm install module-name

# Clear webpack cache
rm -rf node_modules/.cache

# Restart dev server
npm start
```

#### Issue: CORS errors in development

**Symptoms:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solutions:**

1. **Add proxy to package.json:**
```json
{
  "proxy": "https://gomeet.cscodetech.cloud"
}
```

2. **Or install CORS browser extension** (for development only)

3. **Backend fix** (preferred - configure backend to allow your domain)

#### Issue: Firebase connection errors

**Symptoms:**
```
Firebase: Error (auth/configuration-not-found)
Firebase: Error (messaging/failed-service-worker-registration)
```

**Solutions:**

1. **Verify Firebase config**
```javascript
// Check all values are set correctly
console.log(process.env.REACT_APP_FIREBASE_API_KEY);
console.log(process.env.REACT_APP_FIREBASE_PROJECT_ID);
```

2. **Restart development server** after changing .env
```bash
# Stop server (Ctrl+C)
# Start again
npm start
```

3. **Check service worker registration**
```javascript
// In public/index.html
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js')
    .then((registration) => {
      console.log('Service Worker registered:', registration);
    })
    .catch((error) => {
      console.error('Service Worker registration failed:', error);
    });
}
```

### API Connection Problems

#### Issue: API returns 401 Unauthorized

**Symptoms:**
```json
{
  "ResponseCode": "401",
  "Result": "false",
  "ResponseMsg": "Invalid token"
}
```

**Solutions:**

1. **Check token in localStorage**
```javascript
console.log('Token:', localStorage.getItem('token'));
```

2. **Re-login to get fresh token**

3. **Verify token is being sent in requests**
```javascript
// Add to axios interceptor
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);
```

#### Issue: API timeout errors

**Symptoms:**
```
timeout of 30000ms exceeded
```

**Solutions:**

1. **Increase timeout**
```javascript
axios.defaults.timeout = 60000; // 60 seconds
```

2. **Check network connection**

3. **Verify backend server is running**

4. **Use API monitoring tool** (Postman, Insomnia)

### Firebase Configuration Errors

#### Issue: Firestore permission denied

**Symptoms:**
```
FirebaseError: Missing or insufficient permissions
```

**Solutions:**

1. **Check Firestore security rules**
```javascript
// Ensure rules allow your operation
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

2. **Verify user is authenticated**
```javascript
import { getAuth } from 'firebase/auth';

const auth = getAuth();
console.log('Current user:', auth.currentUser);
```

3. **Test with open rules** (development only)
```javascript
// WARNING: Only for testing!
allow read, write: if true;
```

#### Issue: Firebase messaging not working

**Symptoms:**
- No notifications received
- FCM token not generated

**Solutions:**

1. **Check HTTPS requirement**
   - Firebase messaging requires HTTPS (except localhost)
   - Use ngrok for local testing with HTTPS

2. **Verify service worker**
```bash
# Check if service worker is registered
# Open browser DevTools -> Application -> Service Workers
```

3. **Request notification permission**
```javascript
if ('Notification' in window) {
  Notification.requestPermission().then(permission => {
    console.log('Notification permission:', permission);
  });
}
```

4. **Check VAPID key**
```javascript
// Ensure VAPID key is configured
const messaging = getMessaging();
getToken(messaging, {
  vapidKey: 'YOUR_VAPID_KEY'
}).then(token => {
  console.log('FCM Token:', token);
});
```

### Build Errors

#### Issue: Build fails with memory error

**Symptoms:**
```
FATAL ERROR: Ineffective mark-compacts near heap limit
```

**Solutions:**

1. **Increase Node memory**
```bash
# Linux/Mac
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build

# Windows
set NODE_OPTIONS=--max-old-space-size=4096 && npm run build
```

2. **Add to package.json**
```json
{
  "scripts": {
    "build": "react-scripts --max_old_space_size=4096 build"
  }
}
```

#### Issue: Build fails with "Module parse failed"

**Symptoms:**
```
Module parse failed: Unexpected token
You may need an appropriate loader
```

**Solutions:**

1. **Check file extensions**
   - Use `.jsx` for React components
   - Use `.js` for utilities

2. **Update webpack config** (if ejected)
```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      }
    ]
  }
};
```

### Payment Gateway Issues

#### Issue: Razorpay payment fails

**Symptoms:**
- Payment modal doesn't open
- "Invalid key" error

**Solutions:**

1. **Verify API key**
```javascript
console.log('Razorpay Key:', process.env.REACT_APP_RAZORPAY_KEY_ID);
```

2. **Check test/live mode mismatch**
   - Test keys: `rzp_test_*`
   - Live keys: `rzp_live_*`

3. **Ensure HTTPS in production**
   - Razorpay requires HTTPS in production

#### Issue: Stripe Elements not rendering

**Symptoms:**
- Blank payment form
- Console error about Elements

**Solutions:**

1. **Wrap with Elements provider**
```javascript
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

<Elements stripe={stripePromise}>
  <CheckoutForm />
</Elements>
```

2. **Check Stripe.js loading**
```javascript
// Ensure stripe is loaded before using
const stripe = await loadStripe('pk_test_...');
if (!stripe) {
  console.error('Stripe failed to load');
}
```

### Performance Issues

#### Issue: Slow app loading

**Solutions:**

1. **Enable code splitting**
```javascript
import React, { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./LoginComponent/Dashboard'));

<Suspense fallback={<div>Loading...</div>}>
  <Dashboard />
</Suspense>
```

2. **Optimize images**
```bash
# Install image optimization tool
npm install --save-dev imagemin-cli

# Optimize images
imagemin src/images/* --out-dir=build/images
```

3. **Analyze bundle size**
```bash
npm run build
npx source-map-explorer 'build/static/js/*.js'
```

#### Issue: Laggy swipe animations

**Solutions:**

1. **Use CSS transforms** (hardware accelerated)
```css
.card {
  transform: translateX(0);
  transition: transform 0.3s ease;
}
```

2. **Reduce re-renders**
```javascript
import React, { memo } from 'react';

const UserCard = memo(({ user }) => {
  // Component code
});
```

3. **Optimize images**
```javascript
// Use srcset for responsive images
<img
  src={imageSrc}
  srcSet={`${imageSrc} 1x, ${imageSrc2x} 2x`}
  loading="lazy"
/>
```

### Getting Help

If you encounter issues not covered here:

1. **Check browser console** for error messages
2. **Review API response** in Network tab
3. **Search GitHub Issues** in repository
4. **Check documentation** for specific libraries
5. **Contact support team** with:
   - Error message
   - Steps to reproduce
   - Browser/device information
   - Screenshots/screen recording

---

## 12. Project Structure

### Directory Structure

```
GoMeet Web/
├── public/
│   ├── index.html                 # Main HTML file
│   ├── manifest.json              # PWA manifest
│   ├── firebase-messaging-sw.js   # Firebase service worker
│   ├── OneSignalSDKWorker.js      # OneSignal service worker
│   ├── logo192.png                # App icon (192x192)
│   ├── logo512.png                # App icon (512x512)
│   └── favicon.ico                # Favicon
│
├── src/
│   ├── Context/
│   │   └── MyProvider.jsx         # Global state management
│   │
│   ├── LoginComponent/            # Authenticated user components
│   │   ├── Dashboard.jsx          # Main dashboard (swipe screen)
│   │   ├── Header.jsx             # Navigation header
│   │   ├── Profile.jsx            # User profile page
│   │   ├── Detail.jsx             # Other user profile details
│   │   ├── Favorites.jsx          # Liked users list
│   │   ├── UserChat.jsx           # Chat interface
│   │   ├── Wallet.jsx             # Wallet management
│   │   ├── Upgrade.jsx            # Premium subscription page
│   │   ├── BuyCoin.jsx            # Coin purchase page
│   │   ├── History.jsx            # Transaction history
│   │   ├── BlockUser.jsx          # Blocked users list
│   │   ├── NotificationShow.jsx   # Notifications page
│   │   ├── Pages.jsx              # Dynamic pages (terms, privacy)
│   │   ├── PrivacyPolicy.jsx      # Privacy policy page
│   │   ├── TermsOfService.jsx     # Terms of service page
│   │   └── Login.jsx              # Login page
│   │
│   ├── MobilComponent/            # Registration flow components
│   │   ├── Home.jsx               # Landing page
│   │   ├── Register.jsx           # Registration form
│   │   ├── PhoneNum.jsx           # Phone number input
│   │   ├── Validate.jsx           # OTP verification
│   │   ├── Birthdate.jsx          # Date of birth selection
│   │   ├── Gender.jsx             # Gender selection
│   │   ├── Goals.jsx              # Relationship goals
│   │   ├── Nearby.jsx             # Location permission
│   │   ├── Hobbies.jsx            # Interests selection
│   │   ├── Languages.jsx          # Languages selection
│   │   ├── Religion.jsx           # Religion selection
│   │   ├── Gender-2.jsx           # Preference selection
│   │   └── Image.jsx              # Profile photo upload
│   │
│   ├── PaymentMethod/             # Payment gateway integrations
│   │   ├── Payment.jsx            # Payment method selection
│   │   ├── Razorpay.jsx           # Razorpay integration
│   │   ├── PayPal.jsx             # PayPal integration
│   │   ├── Stripe.jsx             # Stripe integration
│   │   ├── PayStack.jsx           # PayStack integration
│   │   ├── FlutterWave.jsx        # Flutterwave integration
│   │   ├── MercadoPago.jsx        # Mercado Pago integration
│   │   ├── PaytmPayment.jsx       # Paytm integration
│   │   ├── Khalti_Payment.jsx     # Khalti integration
│   │   ├── Midtrans.jsx           # Midtrans integration
│   │   ├── SenangPay.jsx          # Senang Pay integration
│   │   ├── Payfast.jsx            # Payfast integration
│   │   ├── Success.jsx            # Payment success page
│   │   ├── Checkout.jsx           # Checkout page
│   │   └── PaymentRespons.jsx     # Payment response handler
│   │
│   ├── Users_Chats/               # Firebase chat functionality
│   │   └── Firebase.js            # Firebase configuration
│   │
│   ├── User_Call/                 # Voice/Video calling
│   │   ├── Onesignal.js           # OneSignal integration
│   │   ├── Voice_Call.jsx         # Voice call interface
│   │   └── Video_call.jsx         # Video call interface
│   │
│   ├── images/                    # Static images
│   │   ├── backgrounds/           # Background images
│   │   ├── icons/                 # Icon files
│   │   ├── logos/                 # Logo variations
│   │   └── flag/                  # Country flags
│   │
│   ├── Icon/                      # SVG icons
│   │   ├── heartRed.svg
│   │   ├── chat.svg
│   │   ├── gift.svg
│   │   └── ...
│   │
│   ├── JSON File/                 # Animation data
│   │   ├── like.json              # Like animation
│   │   └── dislike.json           # Dislike animation
│   │
│   ├── css/                       # Custom CSS files
│   │   └── styles.css
│   │
│   ├── App.js                     # Main app component
│   ├── index.js                   # Entry point
│   ├── Context.js                 # React Context definition
│   ├── Language.js                # i18n configuration
│   ├── showTost.js                # Toast notification utility
│   ├── NotFound.jsx               # 404 page
│   ├── App.test.js                # App tests
│   └── reportWebVitals.js         # Performance monitoring
│
├── .env.local                     # Environment variables (local)
├── .env.example                   # Environment template
├── .firebaserc                    # Firebase project config
├── .gitignore                     # Git ignore rules
├── package.json                   # NPM dependencies
├── package-lock.json              # Dependency lock file
├── tailwind.config.js             # Tailwind CSS configuration
├── README.md                      # Project readme
├── DEVELOPMENT.md                 # This file
└── SOCIAL_LOGIN_INTEGRATION.md    # Social login guide
```

### Component Organization

#### Context Providers

**MyProvider.jsx** - Global state management
```javascript
// Manages:
// - API base URLs
// - User authentication state
// - Profile data
// - Payment state
// - Chat state
// - Call state
// - App configuration (Agora, OneSignal)
```

#### Authentication Flow

```
Home.jsx (Landing)
  └── Register.jsx
      └── PhoneNum.jsx
          └── Validate.jsx (OTP)
              └── Birthdate.jsx
                  └── Gender.jsx
                      └── Goals.jsx
                          └── Nearby.jsx (Location)
                              └── Hobbies.jsx
                                  └── Languages.jsx
                                      └── Religion.jsx
                                          └── Gender-2.jsx (Preferences)
                                              └── Image.jsx
                                                  └── Dashboard.jsx
```

#### Main App Routes

```javascript
// Public routes
/                    → Home or Dashboard (based on auth)
/login               → Login page
/register            → Registration start
/validate            → OTP verification

// Registration flow
/phonenumber         → Phone number input
/birthdate           → Date of birth
/gender              → Gender selection
/golas               → Relationship goals
/nearby              → Location permission
/hobbies             → Interests
/languages           → Languages
/religion            → Religion
/preference          → Who they want to meet
/image               → Profile photos

// Authenticated routes
/dashboard           → Main swipe screen
/profile             → User's own profile
/detail/:name        → Other user's profile
/explore             → Favorites/Likes list
/chat                → Chat interface
/wallet              → Wallet management
/upgrade             → Premium plans
/buyCoin             → Coin packages
/history             → Transaction history
/blockUser           → Blocked users
/notification        → Notifications

// Payment routes
/payment             → Payment method selection
/razorpay            → Razorpay checkout
/paypal              → PayPal checkout
/done                → Payment success
/cancel              → Payment cancelled

// Static pages
/privacy             → Privacy policy
/terms               → Terms of service
/page/:title         → Dynamic pages

// 404
/*                   → Not found page
```

### Routing Structure

```javascript
// src/App.js
<Router>
  {isAuthenticated && <Header />}
  <Routes>
    <Route path="/" element={isAuthenticated ? <Dashboard /> : <Home />} />
    {/* Registration flow */}
    <Route path="/register" element={<Register />} />
    {/* ... other routes */}
  </Routes>
</Router>
```

### State Management Flow

```
Component
  ↓
useContext(MyContext)
  ↓
Access global state:
  - basUrl
  - imageBaseURL
  - user data
  - chat state
  - payment state
  ↓
Update state via setters
  ↓
Re-render affected components
```

### Data Flow Example

```javascript
// 1. User swipes right
Dashboard.jsx → handleLike()
  ↓
// 2. Make API call
axios.post(`${basUrl}add_like.php`, { uid, profile_id })
  ↓
// 3. Update local state
setApi(updatedArray)
  ↓
// 4. Show animation
setLike(true) → Lottie animation
  ↓
// 5. If match, send notification
if (response.is_match === "1") {
  sendPushNotification(...)
}
  ↓
// 6. Update Firestore (if needed)
addDoc(collection(db, "chats"), {...})
```

---

## 13. Adding New Features

### Step-by-Step Guide

#### Example: Adding a "Super Like" Feature

**Step 1: Plan the Feature**

Define requirements:
- User can super like once per day (or with coins)
- Super like sends special notification
- Recipient sees super like badge
- Premium users get unlimited super likes

**Step 2: Backend API (if needed)**

Coordinate with backend team for new endpoint:
```http
POST /api/add_superlike.php

Request:
{
  "uid": "123",
  "profile_id": "456"
}

Response:
{
  "ResponseCode": "200",
  "Result": "true",
  "ResponseMsg": "Super Like Sent",
  "remaining_superlikes": "0",
  "is_match": "1"
}
```

**Step 3: Update Context Provider**

Add to `src/Context/MyProvider.jsx`:
```javascript
const [superLikesRemaining, setSuperLikesRemaining] = useState(1);

const Value = {
  // ... existing values
  superLikesRemaining,
  setSuperLikesRemaining,
};
```

**Step 4: Create UI Components**

Add super like button to `src/LoginComponent/Dashboard.jsx`:
```javascript
import SuperLikeIcon from "../Icon/superlike.svg";

const handleSuperLike = async () => {
  if (superLikesRemaining <= 0 && !isPremium) {
    showTost("No super likes remaining. Upgrade to premium!", "warning");
    navigate('/upgrade');
    return;
  }

  try {
    const response = await axios.post(`${basUrl}add_superlike.php`, {
      uid: userData.id,
      profile_id: currentUser.id
    });

    if (response.data.ResponseCode === "200") {
      // Show animation
      setSuperLikeAnimation(true);

      // Update remaining super likes
      setSuperLikesRemaining(response.data.remaining_superlikes);

      // If match, navigate to chat
      if (response.data.is_match === "1") {
        showTost("It's a Super Match!", "success");
        navigate('/chat');
      }

      // Move to next card
      nextCard();
    }
  } catch (error) {
    console.error("Super like error:", error);
    showTost("Failed to send super like", "error");
  }
};

// In JSX
<button
  onClick={handleSuperLike}
  className="super-like-btn"
  disabled={superLikesRemaining <= 0 && !isPremium}
>
  <img src={SuperLikeIcon} alt="Super Like" />
  {!isPremium && <span>{superLikesRemaining}</span>}
</button>
```

**Step 5: Add Notification**

Update `src/User_Call/Onesignal.js` to support super like notifications:
```javascript
export const sendSuperLikeNotification = async (receiverId, senderName, senderPic) => {
  await sendNotification(receiverId, 'Super Like!', `${senderName} super liked you!`, {
    type: 'superlike',
    senderId: senderId,
    senderPic: senderPic,
    url: '/explore'
  });
};
```

**Step 6: Update Firestore Structure**

Add super like data to Firestore:
```javascript
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../Users_Chats/Firebase';

await setDoc(doc(db, "superlikes", `${userId}_${profileId}`), {
  senderId: userId,
  receiverId: profileId,
  timestamp: new Date(),
  viewed: false
});
```

**Step 7: Add Animations**

Create super like animation JSON:
```javascript
// src/JSON File/superlike.json
{
  "v": "5.5.7",
  "fr": 29.9700012207031,
  "ip": 0,
  "op": 60,
  "w": 500,
  "h": 500,
  // ... Lottie animation data
}
```

Use in component:
```javascript
import SuperLikeAnimation from "../JSON File/superlike.json";

{superLikeAnimation && (
  <div className="animation-overlay">
    <Lottie
      animationData={SuperLikeAnimation}
      loop={false}
      onComplete={() => setSuperLikeAnimation(false)}
    />
  </div>
)}
```

**Step 8: Add Styling**

Create styles in component or CSS file:
```css
.super-like-btn {
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
}

.super-like-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.super-like-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.animation-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  z-index: 9999;
}
```

**Step 9: Testing**

Write tests for the feature:
```javascript
// src/__tests__/SuperLike.test.js
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Dashboard from '../LoginComponent/Dashboard';

describe('Super Like Feature', () => {
  it('should send super like when button clicked', async () => {
    render(<Dashboard />);

    const superLikeBtn = screen.getByRole('button', { name: /super like/i });
    fireEvent.click(superLikeBtn);

    await waitFor(() => {
      expect(screen.getByText(/super like sent/i)).toBeInTheDocument();
    });
  });

  it('should show upgrade prompt when no super likes remaining', async () => {
    // Mock user with 0 super likes
    render(<Dashboard />);

    const superLikeBtn = screen.getByRole('button', { name: /super like/i });
    fireEvent.click(superLikeBtn);

    await waitFor(() => {
      expect(screen.getByText(/upgrade to premium/i)).toBeInTheDocument();
    });
  });
});
```

**Step 10: Documentation**

Update documentation:
```markdown
### Super Like Feature

Users can send a super like to stand out. Features:
- Free users: 1 super like per day
- Premium users: Unlimited super likes
- Recipient receives special notification
- Super like badge displayed on profile

**API Endpoint:**
POST /api/add_superlike.php

**Implementation:**
See src/LoginComponent/Dashboard.jsx - handleSuperLike()
```

### Best Practices for New Features

1. **Follow existing patterns**
   - Use same folder structure
   - Follow naming conventions
   - Use existing utilities (showTost, etc.)

2. **State management**
   - Add to Context only if needed globally
   - Use local state for component-specific data
   - Use useReducer for complex state logic

3. **API integration**
   - Centralize API calls in utility functions
   - Handle errors consistently
   - Show loading states

4. **User experience**
   - Add loading indicators
   - Provide clear error messages
   - Show success confirmations
   - Implement optimistic updates

5. **Mobile-first design**
   - Test on mobile devices
   - Use responsive Tailwind classes
   - Ensure touch-friendly buttons (min 44x44px)

6. **Performance**
   - Lazy load components when possible
   - Optimize images
   - Debounce user inputs
   - Memoize expensive calculations

7. **Accessibility**
   - Add proper ARIA labels
   - Ensure keyboard navigation
   - Maintain color contrast
   - Provide alt text for images

---

## 14. Security Considerations

### Environment Variable Protection

1. **Never commit sensitive data**
```bash
# Add to .gitignore
.env.local
.env.production
.env.*.local
```

2. **Use environment variables for all secrets**
```javascript
// GOOD
const apiKey = process.env.REACT_APP_RAZORPAY_KEY_ID;

// BAD - Never hardcode
const apiKey = "rzp_live_abc123";
```

3. **Validate environment variables on startup**
```javascript
// src/index.js
const requiredEnvVars = [
  'REACT_APP_API_BASE_URL',
  'REACT_APP_FIREBASE_API_KEY',
  'REACT_APP_ONESIGNAL_APP_ID'
];

requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});
```

### API Key Security

1. **Use different keys for environments**
```bash
# Development
REACT_APP_RAZORPAY_KEY_ID=rzp_test_xxx

# Production
REACT_APP_RAZORPAY_KEY_ID=rzp_live_xxx
```

2. **Restrict API key domains**
   - In Razorpay/Stripe dashboard, whitelist your domain
   - Block requests from unauthorized domains

3. **Never expose secret keys in frontend**
```javascript
// GOOD - Use publishable key only
const stripe = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

// BAD - Never use secret key in frontend
const stripe = loadStripe(process.env.REACT_APP_STRIPE_SECRET_KEY); // ❌
```

### User Data Protection

1. **Encrypt sensitive data before storage**
```javascript
import CryptoJS from 'crypto-js';

const encryptData = (data) => {
  return CryptoJS.AES.encrypt(
    JSON.stringify(data),
    process.env.REACT_APP_ENCRYPTION_KEY
  ).toString();
};

const decryptData = (ciphertext) => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, process.env.REACT_APP_ENCRYPTION_KEY);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};
```

2. **Implement secure session management**
```javascript
// Set session timeout
const SESSION_TIMEOUT = 3600000; // 1 hour

const checkSession = () => {
  const lastActivity = localStorage.getItem('lastActivity');
  const now = Date.now();

  if (now - lastActivity > SESSION_TIMEOUT) {
    // Session expired
    localStorage.clear();
    window.location.href = '/login';
  }
};

// Update last activity on user action
document.addEventListener('click', () => {
  localStorage.setItem('lastActivity', Date.now());
});
```

3. **Sanitize user inputs**
```javascript
import DOMPurify from 'dompurify';

const sanitizeInput = (input) => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML tags
    ALLOWED_ATTR: []
  });
};

// Use before saving or displaying
const userBio = sanitizeInput(input.value);
```

### Authentication Best Practices

1. **Validate tokens on each request**
```javascript
// Axios interceptor
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token not expired
      const tokenData = parseJwt(token);
      if (tokenData.exp * 1000 < Date.now()) {
        // Token expired
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject('Token expired');
      }
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);
```

2. **Implement rate limiting on login attempts**
```javascript
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 900000; // 15 minutes

const checkLoginAttempts = (identifier) => {
  const attempts = JSON.parse(localStorage.getItem('loginAttempts') || '{}');
  const userAttempts = attempts[identifier] || { count: 0, lastAttempt: 0 };

  const now = Date.now();

  // Reset if lockout time has passed
  if (now - userAttempts.lastAttempt > LOCKOUT_TIME) {
    userAttempts.count = 0;
  }

  if (userAttempts.count >= MAX_LOGIN_ATTEMPTS) {
    const remainingTime = LOCKOUT_TIME - (now - userAttempts.lastAttempt);
    throw new Error(`Too many login attempts. Try again in ${Math.ceil(remainingTime / 60000)} minutes.`);
  }

  return userAttempts;
};
```

3. **Use secure password policies**
```javascript
const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (password.length < minLength) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }
  if (!hasUpperCase) {
    return { valid: false, message: 'Password must contain uppercase letter' };
  }
  if (!hasLowerCase) {
    return { valid: false, message: 'Password must contain lowercase letter' };
  }
  if (!hasNumbers) {
    return { valid: false, message: 'Password must contain number' };
  }
  if (!hasSpecialChar) {
    return { valid: false, message: 'Password must contain special character' };
  }

  return { valid: true, message: 'Password is strong' };
};
```

### CORS Configuration

**Backend must configure CORS properly:**
```php
// Backend CORS headers
header('Access-Control-Allow-Origin: https://yourdomain.com');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');
```

### Content Security Policy

Add to `public/index.html`:
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://cdn.onesignal.com https://www.gstatic.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https: blob:;
  connect-src 'self' https://gomeet.cscodetech.cloud https://*.firebaseio.com;
  frame-src 'self' https://api.razorpay.com https://checkout.stripe.com;
">
```

### XSS Prevention

1. **Use React's built-in XSS protection**
```javascript
// React automatically escapes JSX
<div>{userInput}</div> // Safe

// Avoid dangerouslySetInnerHTML unless absolutely necessary
<div dangerouslySetInnerHTML={{ __html: userInput }} /> // Unsafe
```

2. **If HTML rendering is needed, sanitize first**
```javascript
import DOMPurify from 'dompurify';

<div dangerouslySetInnerHTML={{
  __html: DOMPurify.sanitize(userInput)
}} />
```

### Secure File Uploads

1. **Validate file types**
```javascript
const validateImageFile = (file) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only JPEG, PNG, JPG, and WebP are allowed.');
  }

  if (file.size > maxSize) {
    throw new Error('File size exceeds 5MB limit.');
  }

  return true;
};
```

2. **Scan files for malware (backend)**
```php
// Use ClamAV or similar on backend
$clamav = new ClamAV();
$result = $clamav->scanFile($uploadedFile);
if ($result !== ClamAV::RESULT_OK) {
  throw new Exception('File failed security scan');
}
```

### HTTPS Enforcement

**In production, always use HTTPS:**

1. **Redirect HTTP to HTTPS**
```javascript
// Add to public/index.html
if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
  location.replace(`https:${location.href.substring(location.protocol.length)}`);
}
```

2. **Use HSTS header**
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

---

## 15. Performance Optimization

### Image Optimization

1. **Use WebP format**
```javascript
<picture>
  <source srcSet="image.webp" type="image/webp" />
  <source srcSet="image.jpg" type="image/jpeg" />
  <img src="image.jpg" alt="Profile" />
</picture>
```

2. **Implement lazy loading**
```javascript
<img
  src="placeholder.jpg"
  data-src="actual-image.jpg"
  loading="lazy"
  alt="Profile"
/>
```

3. **Responsive images**
```javascript
<img
  srcSet="
    image-320w.jpg 320w,
    image-640w.jpg 640w,
    image-1280w.jpg 1280w
  "
  sizes="(max-width: 320px) 280px,
         (max-width: 640px) 600px,
         1200px"
  src="image-640w.jpg"
  alt="Profile"
/>
```

4. **Compress images**
```bash
# Using imagemin
npm install --save-dev imagemin-cli imagemin-webp

# Compress images
imagemin src/images/* --out-dir=public/images --plugin=webp
```

### Code Splitting

1. **Route-based splitting**
```javascript
import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const Dashboard = lazy(() => import('./LoginComponent/Dashboard'));
const Profile = lazy(() => import('./LoginComponent/Profile'));
const Chat = lazy(() => import('./LoginComponent/UserChat'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
```

2. **Component-based splitting**
```javascript
const PaymentModal = lazy(() => import('./PaymentMethod/Payment'));

const UpgradePage = () => {
  const [showPayment, setShowPayment] = useState(false);

  return (
    <>
      <button onClick={() => setShowPayment(true)}>Upgrade</button>

      {showPayment && (
        <Suspense fallback={<div>Loading payment...</div>}>
          <PaymentModal />
        </Suspense>
      )}
    </>
  );
};
```

### Lazy Loading

1. **Lazy load images on scroll**
```javascript
import { useEffect, useRef } from 'react';

const LazyImage = ({ src, alt }) => {
  const imgRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            observer.unobserve(img);
          }
        });
      },
      { rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return <img ref={imgRef} data-src={src} alt={alt} />;
};
```

### Caching Strategies

1. **API response caching**
```javascript
const cache = new Map();

const cachedApiCall = async (endpoint, data, ttl = 300000) => {
  const key = `${endpoint}-${JSON.stringify(data)}`;

  // Check cache
  if (cache.has(key)) {
    const { data: cachedData, timestamp } = cache.get(key);
    if (Date.now() - timestamp < ttl) {
      return cachedData;
    }
  }

  // Make API call
  const response = await axios.post(`${basUrl}${endpoint}`, data);

  // Store in cache
  cache.set(key, {
    data: response.data,
    timestamp: Date.now()
  });

  return response.data;
};
```

2. **Service Worker caching**
```javascript
// In service worker
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/')) {
    // Network first for API calls
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clonedResponse = response.clone();
          caches.open('api-cache').then(cache => {
            cache.put(event.request, clonedResponse);
          });
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    // Cache first for static assets
    event.respondWith(
      caches.match(event.request)
        .then(response => response || fetch(event.request))
    );
  }
});
```

### Bundle Size Optimization

1. **Analyze bundle**
```bash
npm run build
npx source-map-explorer 'build/static/js/*.js'
```

2. **Remove unused dependencies**
```bash
# Find unused dependencies
npx depcheck

# Remove them
npm uninstall unused-package
```

3. **Use lighter alternatives**
```javascript
// Instead of moment.js (heavy)
import dayjs from 'dayjs'; // Lighter alternative

// Instead of lodash (if using few functions)
import debounce from 'lodash/debounce'; // Import only what you need
```

### React Performance

1. **Memoize expensive calculations**
```javascript
import { useMemo } from 'react';

const Dashboard = () => {
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Expensive filtering logic
      return matchesCriteria(user);
    });
  }, [users, filters]); // Only recalculate when dependencies change
};
```

2. **Prevent unnecessary re-renders**
```javascript
import { memo } from 'react';

const UserCard = memo(({ user, onLike, onDislike }) => {
  return (
    <div className="user-card">
      {/* Card content */}
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if user changed
  return prevProps.user.id === nextProps.user.id;
});
```

3. **Use useCallback for functions**
```javascript
import { useCallback } from 'react';

const Dashboard = () => {
  const handleLike = useCallback((userId) => {
    // Like logic
  }, []); // Doesn't change

  const handleDislike = useCallback((userId) => {
    // Dislike logic
  }, []);

  return <UserCard onLike={handleLike} onDislike={handleDislike} />;
};
```

### Database Query Optimization

**Firebase Firestore:**

1. **Use indexes**
```javascript
// Create composite index for common queries
// In Firebase Console -> Firestore -> Indexes
// Add index for: collection=chats, fields=[users, lastMessageTime desc]
```

2. **Limit query results**
```javascript
import { collection, query, where, orderBy, limit } from 'firebase/firestore';

const q = query(
  collection(db, "chats"),
  where("users", "array-contains", userId),
  orderBy("lastMessageTime", "desc"),
  limit(20) // Only fetch 20 most recent chats
);
```

3. **Paginate large datasets**
```javascript
import { getDocs, startAfter } from 'firebase/firestore';

let lastVisible = null;

const loadMoreMessages = async () => {
  let q = query(
    collection(db, "chats", chatId, "messages"),
    orderBy("timestamp", "desc"),
    limit(25)
  );

  if (lastVisible) {
    q = query(q, startAfter(lastVisible));
  }

  const snapshot = await getDocs(q);
  lastVisible = snapshot.docs[snapshot.docs.length - 1];

  return snapshot.docs.map(doc => doc.data());
};
```

### Network Optimization

1. **Compress requests**
```javascript
axios.defaults.headers.common['Accept-Encoding'] = 'gzip, deflate, br';
```

2. **Batch API requests**
```javascript
const batchRequests = async (requests) => {
  return Promise.all(requests.map(req => axios.post(req.url, req.data)));
};

// Instead of sequential calls
const results = await batchRequests([
  { url: `${basUrl}interest.php`, data: {} },
  { url: `${basUrl}languagelist.php`, data: {} },
  { url: `${basUrl}religionlist.php`, data: {} }
]);
```

3. **Debounce search inputs**
```javascript
import { useState, useEffect } from 'react';
import debounce from 'lodash/debounce';

const SearchUsers = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const debouncedSearch = useCallback(
    debounce((term) => {
      // API call
      axios.post(`${basUrl}search_users.php`, { query: term });
    }, 500), // Wait 500ms after user stops typing
    []
  );

  useEffect(() => {
    if (searchTerm) {
      debouncedSearch(searchTerm);
    }
  }, [searchTerm]);

  return (
    <input
      type="text"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search users..."
    />
  );
};
```

### Performance Monitoring

1. **Track Web Vitals**
```javascript
// src/reportWebVitals.js
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

const sendToAnalytics = (metric) => {
  // Send to analytics service
  console.log(metric);
};

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

2. **Use React Profiler**
```javascript
import { Profiler } from 'react';

const onRenderCallback = (
  id, // Component name
  phase, // "mount" or "update"
  actualDuration // Time spent rendering
) => {
  console.log(`${id} ${phase} took ${actualDuration}ms`);
};

<Profiler id="Dashboard" onRender={onRenderCallback}>
  <Dashboard />
</Profiler>
```

3. **Lighthouse CI**
```bash
# Install Lighthouse CI
npm install -g @lhci/cli

# Run audit
lhci autorun --config=lighthouserc.json
```

---

## Conclusion

This documentation provides comprehensive guidance for developing the 2Sweety dating app. For additional help:

- **Backend API Documentation**: Contact backend team
- **Firebase Documentation**: [https://firebase.google.com/docs](https://firebase.google.com/docs)
- **React Documentation**: [https://react.dev](https://react.dev)
- **Tailwind CSS**: [https://tailwindcss.com/docs](https://tailwindcss.com/docs)
- **Project Repository**: [Your Git Repository URL]

### Quick Links

- [Social Login Integration Guide](./SOCIAL_LOGIN_INTEGRATION.md)
- [API Postman Collection](#) (if available)
- [Design System](#) (if available)
- [Deployment Guide](#building-and-deployment)

### Support Contacts

- **Lead Developer**: [Name] - [Email]
- **Backend Team**: [Email]
- **DevOps**: [Email]
- **Support**: [Email]

---

**Last Updated**: October 10, 2025
**Version**: 1.0.0
**Maintained By**: Development Team
