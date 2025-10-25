# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GoMeet is a complete social dating platform with two main components:
- **Web Application**: React-based web app (GoMeet Web/)
- **Mobile Application**: Flutter-based mobile app (mobile-app/GoMeet Flutter code v1.5/)

Both applications share the same backend API and Firebase infrastructure for real-time features.

## Repository Structure

```
2sweet/
├── GoMeet Web/                 # React web application
├── mobile-app/
│   └── GoMeet Flutter code v1.5/  # Flutter mobile app
└── Document/                   # Documentation assets
```

## Web Application (React)

### Development Commands

```bash
cd "GoMeet Web"
npm install              # Install dependencies
npm start                # Run development server (localhost:3000)
npm test                 # Run tests
npm run build            # Build for production
```

### Architecture

**State Management**:
- React Context API (`Context/MyProvider.jsx`) manages global state
- Context provides: user data, authentication state, payment info, location data, API configuration

**Key Configuration** (in `Context/MyProvider.jsx`):
- `basUrl`: API base URL (https://gomeet.cscodetech.cloud/api/)
- `imageBaseURL`: Image assets base URL
- `paymentBaseURL`: Payment gateway base URL

**Routing**: React Router v6 with protected routes based on localStorage token

**Main Feature Sections**:
- Authentication flow: Login → Register → Multi-step onboarding (phone, birthdate, gender, goals, location, hobbies, language, religion, preferences, images)
- Home/Dashboard: User discovery and matching
- Chat: Firebase-based real-time messaging
- Video/Audio Calls: Agora RTC integration
- Profile Management: View/edit profile, favorites, block users
- Payments: Multiple gateway support (Razorpay, PayPal, Stripe, PayStack, Flutterwave, Mercado Pago, etc.)
- Wallet/Coin system: In-app currency management

**Key Dependencies**:
- Firebase (auth, messaging, Firestore)
- Agora (video/audio calls)
- Multiple payment gateways
- React Bootstrap, Tailwind CSS
- i18next for internationalization

**File Structure**:
- `LoginComponent/`: Authenticated user screens
- `MobilComponent/`: Registration and onboarding flows
- `PaymentMethod/`: Payment gateway integrations
- `User_Call/`: Video/audio call components
- `Users_Chats/`: Chat/messaging components

## Mobile Application (Flutter)

### Development Commands

```bash
cd "mobile-app/GoMeet Flutter code v1.5"
flutter pub get          # Install dependencies
flutter run              # Run on connected device/emulator
flutter build apk        # Build Android APK
flutter build ios        # Build iOS app (requires macOS)
flutter test             # Run tests
```

### Architecture

**State Management**: Hybrid approach
- BLoC pattern (flutter_bloc) for business logic
- Provider for UI state management

**Key BLoCs**:
- `AuthCubit`: Authentication state
- `HomePageCubit`: Home screen logic
- `MatchCubit`: Matching functionality
- `EditProfileCubit`: Profile editing
- `OnbordingCubit`: Onboarding flow
- `ThemeBloc`: Light/dark mode
- `LanguageCubit`: Multi-language support
- `PremiumBloc`: Premium subscription management

**Key Providers**:
- `HomeProvider`: Home screen data
- `ProfileProvider`: User profile data
- `MatchProvider`: Match data
- `ChattingProvider`: Chat state
- `VcProvider`: Video call state
- `AudioCallProvider`: Audio call state
- `WalletProvider`: Wallet/coin management
- `CoinProvider`: Coin transactions

**Core Services**:
- `Api` class (`core/api.dart`): HTTP client using Dio with logging
- `ChatService`: Firebase Firestore chat operations
- `AuthFirebase`: Firebase authentication
- Firebase Messaging for push notifications

**Key Features**:
- Multi-step onboarding (phone verification, profile setup)
- Swipe-based matching UI
- Real-time chat with Firebase
- Video/audio calls with Agora RTC Engine
- Google Maps integration for location
- Premium subscriptions and in-app purchases
- Multi-language support (9+ languages in `lang/` folder)
- Google Mobile Ads integration
- PayPal, Razorpay payment integrations

**Project Structure**:
- `lib/Logic/cubits/`: BLoC state management
- `lib/presentation/screens/`: UI screens organized by feature
  - `splash_bording/`: Splash, onboarding, auth
  - `BottomNavBar/`: Main app tabs (home, likes, chats, map)
  - `other/`: Profile, premium, edit profile, details
  - `AudioCall/`: Audio calling screens
- `lib/presentation/widgets/`: Reusable UI components
- `lib/presentation/firebase/`: Firebase-related screens (chat, video call)
- `lib/data/models/`: Data models
- `lib/core/`: Core utilities (API, routes, UI constants, push notifications, ads)
- `lib/by_coin_screen/`: Coin/wallet management screens
- `lib/wallete_code/`: Wallet functionality
- `lib/payment/`: Payment gateway integrations
- `lib/language/localization/`: i18n setup

**Configuration Files**:
- `pubspec.yaml`: Dependencies and assets
- `firebase_options.dart`: Firebase configuration
- `lib/core/config.dart`: App configuration (likely contains API URLs)

## Shared Infrastructure

### Firebase Setup
Both apps use Firebase for:
- Authentication (email, phone, social login)
- Cloud Firestore (real-time chat, user data)
- Firebase Messaging (push notifications)
- Firebase Storage (user images, media)

**Important**: Firebase configuration files exist in both projects:
- Web: `GoMeet Web/src/Users_Chats/Firebase.js`
- Mobile: `mobile-app/GoMeet Flutter code v1.5/lib/firebase_options.dart`

### API Integration
Both applications communicate with the same REST API:
- Base URL: `https://gomeet.cscodetech.cloud/api/`
- Mobile: Configured in `lib/core/config.dart`
- Web: Configured in `Context/MyProvider.jsx`

### Real-time Communication
- **Video/Audio Calls**: Agora RTC (requires Agora App ID configuration)
- **Chat**: Firebase Firestore real-time listeners
- **Push Notifications**: Firebase Cloud Messaging + OneSignal

## Common Development Workflows

### Adding a New Feature
1. **Mobile**: Create BLoC/Cubit for business logic, Provider for UI state, add screens in `presentation/screens/`, add route in `core/routes.dart`
2. **Web**: Create component in appropriate folder, add route in `App.js`, use MyContext for global state

### Working with Chat
- Both platforms use Firebase Firestore collections
- Chat messages stored in Firestore with real-time listeners
- Video/audio calls trigger Firebase documents that other users listen for

### Payment Integration
- Web: Payment components in `PaymentMethod/` folder
- Mobile: Payment screens in `lib/payment/` and `lib/by_coin_screen/`
- Multiple gateways supported: Razorpay, Stripe, PayPal, PayStack, Flutterwave, Mercado Pago, Paytm, PayFast, Khalti, Midtrans, SenangPay

### Localization
- **Mobile**: JSON files in `lang/` folder (en, es, ar, hi, gu, id, be, af)
- **Web**: i18next configuration in `Language.jsx`
- Both support RTL languages (Arabic, etc.)

## Environment Setup Requirements

### Web Application
- Node.js (v14+ recommended)
- npm or yarn
- Firebase project with web app configured
- Agora App ID for video calls
- Payment gateway API keys

### Mobile Application
- Flutter SDK (3.2.0+)
- Dart SDK (>= 3.2.0 < 4.0.0)
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)
- Firebase project with iOS/Android apps configured
- Agora App ID
- Google Maps API key
- Payment gateway credentials
- OneSignal App ID for push notifications

## Key Files to Configure Before Running

### Web
1. `Context/MyProvider.jsx` - API URLs
2. Firebase configuration files
3. `.env` file for API keys (if exists)

### Mobile
1. `lib/core/config.dart` - API URLs and keys
2. `android/app/google-services.json` - Firebase Android config
3. `ios/firebase_app_id_file.json` - Firebase iOS config
4. `lib/firebase_options.dart` - Firebase options
5. Google Maps API keys in Android/iOS native configs

## Testing

### Web
- Jest tests configured
- Run with `npm test`

### Mobile
- Flutter widget tests in `test/` folder
- Run with `flutter test`
- No extensive test coverage currently exists

## Build and Deployment

### Web Production Build
```bash
cd "GoMeet Web"
npm run build
# Output in build/ folder ready for deployment
```

### Mobile Production Build
```bash
cd "mobile-app/GoMeet Flutter code v1.5"
# Android
flutter build apk --release
flutter build appbundle --release

# iOS (macOS only)
flutter build ios --release
```

## Important Notes

- Both applications are tightly coupled to the backend API at `https://gomeet.cscodetech.cloud`
- Changing API endpoints requires updates in both `Context/MyProvider.jsx` (web) and `lib/core/config.dart` (mobile)
- Firebase project must have both web and mobile apps configured
- Agora RTC credentials must be obtained and configured separately
- Payment gateway integrations require merchant accounts and API keys for each provider
- The codebase includes multiple payment gateways but most require configuration before use
- Push notifications use both Firebase Messaging and OneSignal
- Google Ads integration exists but requires AdMob account setup
