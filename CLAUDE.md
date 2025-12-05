# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**2Sweety** is a social dating platform with real-time chat, video/voice calls, matchmaking, and multi-language support. The repository contains two applications:

1. **Main Web App (Root)**: Production React application using Create React App
2. **soulmate-unlimited-hub-main**: Modern full-stack version (Vite + Express + Supabase) - see its own CLAUDE.md

This document focuses on the **Main Web App** at the repository root.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Tailwind CSS 3.x |
| State | React Context (MyProvider, ThemeContext) |
| Real-time | Firebase Firestore, Agora RTC (video/voice) |
| Auth | Firebase Auth, Google OAuth, Facebook Login, Apple Sign-In |
| i18n | i18next + react-i18next (19 languages) |
| Payments | Stripe, PayPal, Razorpay, PayStack, FlutterWave, MercadoPago, Midtrans, Payfast, SenangPay, Paytm, Khalti |
| Build | Create React App, Docker, Nginx |
| Deploy | Coolify, GitHub Actions CI/CD |

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (port 3000)
npm start

# Run with dev script (uses start-dev.sh)
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## Project Structure

```
/
├── src/
│   ├── App.js                    # Main app with routing
│   ├── index.js                  # Entry point with providers
│   ├── Language.jsx              # i18n configuration (19 languages, ~560KB)
│   ├── Context.js                # TodoContext
│   ├── Context/
│   │   ├── MyProvider.jsx        # Global app state (auth, user data, API URLs)
│   │   └── ThemeContext.jsx      # Dark/light theme management
│   ├── LoginComponent/           # Authenticated user screens
│   │   ├── Dashboard.jsx         # Main user dashboard
│   │   ├── Profile.jsx           # User profile management
│   │   ├── UserChat.jsx          # Chat interface
│   │   ├── Favorites.jsx         # Explore/favorites
│   │   ├── Wallet.jsx            # Coin wallet
│   │   ├── Upgrade.jsx           # Premium upgrade
│   │   └── ...                   # History, BlockUser, etc.
│   ├── MobilComponent/           # Onboarding & registration flow
│   │   ├── Home.jsx              # Landing page
│   │   ├── Register.jsx          # Registration
│   │   ├── Birthdate.jsx         # DOB input
│   │   ├── Gender.jsx            # Gender selection
│   │   ├── Hobbies.jsx           # Interest selection
│   │   └── ...                   # Goals, Languages, Religion, Image
│   ├── PaymentMethod/            # Payment integrations
│   │   ├── Stripe.jsx
│   │   ├── PayPal.jsx
│   │   ├── Razorpay.jsx
│   │   └── ...                   # 12 payment providers
│   ├── User_Call/                # Video/voice calling
│   │   ├── Video_call.jsx        # Agora video call
│   │   └── Voice_Call.jsx        # Agora voice call
│   ├── Users_Chats/
│   │   └── Firebase.js           # Firebase configuration
│   └── components/               # Shared components
│       ├── SharedHeader.jsx      # Global navigation header
│       ├── SharedFooter.jsx      # Global footer
│       └── LanguageSelector.jsx  # Language dropdown
├── public/
│   ├── firebase-messaging-sw.js  # Firebase push notifications
│   └── OneSignalSDKWorker.js     # OneSignal push notifications
├── Dockerfile                    # Multi-stage production build
├── Dockerfile.coolify            # Coolify-specific build
├── docker-compose.yml            # Local Docker development
├── nginx.conf                    # Nginx configuration
├── tailwind.config.js            # Tailwind with custom brand colors
└── .github/workflows/            # CI/CD pipelines
```

## Architecture & Patterns

### Context Providers

The app uses nested React Context providers:

```jsx
<ThemeProvider>           {/* Dark/light mode */}
  <MyProvider>            {/* Global state: user, API URLs, payment state */}
    <TodoContext.Provider> {/* UI state */}
      <Router>
        <GoogleOAuthProvider>
          <AgoraRTCProvider>
            <I18nextProvider>
              <App />
```

### Key State in MyProvider

- **API URLs**: `basUrl`, `imageBaseURL`, `paymentBaseURL`
- **User Data**: `name`, `email`, `number`, `birthdate`, `gender`, `hobbies`, etc.
- **Auth**: `uid`, `profileId`, `registerUid`
- **Payment**: `planId`, `transactionId`, `amount`, `currency`
- **Calling**: `isVoiceCalling`, `isVideoCalling`, `callStatus`
- **Chat**: `chatId`, `chatUserName`

### Routing Pattern

Routes are organized by authentication state:
- **Public**: `/`, `/home`, `/login`, `/register`, `/page/*`
- **Protected**: `/dashboard`, `/profile`, `/chat`, `/wallet`, `/explore`
- **Payment**: `/payment`, `/razorpay`, `/paypal`, `/stripe`
- **Static Pages**: `/about`, `/contact`, `/privacy`, `/terms`

### Firebase Integration

```javascript
// src/Users_Chats/Firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore, getDatabase, getMessaging, getAnalytics } from 'firebase/...';

// Services exported: db, database, messaging, analytics
```

Used for:
- Real-time chat (Firestore)
- Push notifications (Cloud Messaging)
- Analytics

## Internationalization (i18n)

### Supported Languages (19)

| Code | Language | Code | Language |
|------|----------|------|----------|
| en | English | sv | Swedish |
| no | Norwegian | fi | Finnish |
| da | Danish | tr | Turkish |
| ar | Arabic | zh | Chinese |
| fr | French | de | German |
| ru | Russian | es | Spanish |
| it | Italian | pt | Portuguese |
| nl | Dutch | ja | Japanese |
| ko | Korean | hi | Hindi |
| vi | Vietnamese | | |

### Translation Pattern

All translations are in `src/Language.jsx`. To add a new translation key:

```javascript
// In Language.jsx resources object
en: {
  translation: {
    "Your Key": "English value",
    // ...
  }
},
sv: {
  translation: {
    "Your Key": "Swedish value",
    // ...
  }
},
// Repeat for all 19 languages
```

### Using Translations

```jsx
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();
  return <h1>{t('Your Key')}</h1>;
};
```

## Environment Variables

Required variables (see `.env.example` for full list):

```bash
# API Endpoints
REACT_APP_API_BASE_URL=https://api.2sweety.com/api/
REACT_APP_IMAGE_BASE_URL=https://api.2sweety.com/
REACT_APP_PAYMENT_BASE_URL=https://api.2sweety.com/

# Firebase (required)
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=

# Social Login
REACT_APP_GOOGLE_CLIENT_ID=
REACT_APP_FACEBOOK_APP_ID=

# Services
REACT_APP_AGORA_APP_ID=           # Video/voice calls
REACT_APP_ONESIGNAL_APP_ID=       # Push notifications

# Payment (as needed)
REACT_APP_STRIPE_PUBLISHABLE_KEY=
REACT_APP_PAYPAL_CLIENT_ID=
REACT_APP_RAZORPAY_KEY_ID=
```

**Important**: These are BUILD-TIME variables. For Coolify/Docker, pass as build arguments.

## Styling Conventions

### Tailwind Configuration

Custom brand colors in `tailwind.config.js`:

```javascript
colors: {
  primary: {
    DEFAULT: '#ec4899',  // pink-500
    // 50-900 scale
  },
  secondary: '#ef4444',   // red-500
  accent: '#f97316',      // orange-500
}
```

### Dark Mode

Uses Tailwind's `class` strategy:
- Toggle via `ThemeContext.toggleTheme()`
- Persisted in `localStorage.theme`
- Respects system preference on first load

```jsx
// Example dark mode classes
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
```

### Common Gradient

The brand gradient is used throughout:
```jsx
className="bg-gradient-to-r from-pink-500 via-red-500 to-orange-500"
```

## Deployment

### Docker Build

```bash
# Build locally
docker build -t 2sweety-web .

# Run with compose
docker-compose up --build
```

### Coolify Deployment

1. Connect repository to Coolify
2. Set Dockerfile path: `./Dockerfile`
3. Add all `REACT_APP_*` variables as **Build Arguments**
4. Deploy triggers via GitHub webhook

### GitHub Actions CI/CD

Workflow in `.github/workflows/deploy-coolify.yml`:
1. Quality checks (lint, tests, security audit)
2. Docker build and test
3. Deploy to Coolify via webhook
4. Post-deployment health checks

## Common Development Tasks

### Adding a New Page

1. Create component in `src/LoginComponent/` or `src/MobilComponent/`
2. Add route in `src/App.js`
3. Add translations to all 19 languages in `Language.jsx`
4. Import and use `useTranslation` hook

### Adding a New Payment Method

1. Create component in `src/PaymentMethod/`
2. Add route in `App.js`
3. Add environment variable for API keys
4. Update Dockerfile build args

### Modifying Translations

1. Open `src/Language.jsx`
2. Find all language sections (en, sv, no, fi, da, tr, ar, zh, fr, de, ru, es, it, pt, nl, ja, ko, hi, vi)
3. Add/modify the key in **all 19 sections**
4. Test with language selector

### Adding Video/Voice Call Features

Agora RTC is configured in `index.js`:
```javascript
const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
```

Call components are in `src/User_Call/`.

## Important Conventions

1. **JSHint Directives**: Files start with `/* jshint esversion: 6 */` and `/* jshint ignore:start */`

2. **Authentication Check**: Use `localStorage.getItem("token")` for auth state

3. **API Calls**: Use URLs from MyContext (`basUrl`, `imageBaseURL`)

4. **Component Organization**:
   - `LoginComponent/` - Authenticated user screens
   - `MobilComponent/` - Registration flow screens
   - `components/` - Shared/reusable components

5. **Route Order Matters**: Specific routes before generic ones (e.g., `/page/about` before `/page/:title`)

6. **Translation Keys**: Keep consistent across all 19 languages

## Security Notes

- Never commit `.env` files with real credentials
- API keys in client code are restricted by domain (Firebase, Google Maps, etc.)
- Secret keys (Stripe Secret, etc.) must stay on backend only
- See `.env.example` for PUBLIC vs SECRET key guidance

## Related Documentation

- `docs/deployment/` - Deployment guides
- `docs/api/api-keys-guide.md` - API key setup
- `GOOGLE_OAUTH_SETUP.md` - Google OAuth configuration
- `SOCIAL_LOGIN_SETUP_GUIDE.md` - Social login setup
- `soulmate-unlimited-hub-main/CLAUDE.md` - Modern full-stack version docs
