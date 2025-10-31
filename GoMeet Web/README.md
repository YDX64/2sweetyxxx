# 💕 2Sweety - Dating Web Application

**2Sweety** - Modern, güvenli ve kullanıcı dostu bir dating (flört) web uygulaması.

## 🌟 Overview

2Sweety is a modern, feature-rich social dating platform built with React. Connect with people, chat in real-time, and find meaningful relationships through our intelligent matching system.

## Features

- 🔐 **Secure Authentication** - Multi-step registration with phone verification
- 💬 **Real-time Chat** - Firebase-powered instant messaging
- 📹 **Video/Audio Calls** - Agora RTC integration
- 🎯 **Smart Matching** - Advanced matching algorithm
- 💳 **Multiple Payment Gateways** - Razorpay, PayPal, Stripe, and more
- 🌍 **Multi-language Support** - i18next internationalization
- 📱 **Responsive Design** - Works on all devices
- 🎨 **Modern UI** - React Bootstrap and Tailwind CSS

## Tech Stack

- **Frontend**: React, React Router v6
- **State Management**: React Context API
- **Styling**: Tailwind CSS, React Bootstrap
- **Real-time**: Firebase (Auth, Firestore, Messaging)
- **Video/Audio**: Agora RTC
- **Internationalization**: i18next
- **Payment**: Multiple gateway integrations

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm start
```

Runs the app at [http://localhost:3000](http://localhost:3000)

### Build

```bash
npm run build
```

Builds the app for production to the `build` folder.

## Configuration

Key configurations are managed in `Context/MyProvider.jsx`:
- API base URL
- Image base URL
- Payment gateway URLs
- Firebase configuration

## Project Structure

```
src/
├── LoginComponent/     # Authenticated user screens
├── MobilComponent/     # Registration & onboarding
├── PaymentMethod/      # Payment gateway integrations
├── User_Call/          # Video/audio call components
├── Users_Chats/        # Chat/messaging components
└── Context/            # Global state management
```

## License

Private - All rights reserved

## 📦 Deployment

### Coolify Deployment

Detailed deployment instructions: **[COOLIFY_DEPLOYMENT_TR.md](./COOLIFY_DEPLOYMENT_TR.md)** (Turkish)

Quick deployment (10 minutes):
1. Push to GitHub
2. Create application in Coolify
3. Add environment variables (from `.env.coolify`)
4. Deploy!

### Environment Variables

See `.env.coolify` for complete list of required and optional environment variables.

**Minimum required**:
- Firebase configuration
- API URLs
- Build settings

## 🌐 Production URLs

- **Website**: https://2sweety.com
- **API**: https://api.2sweety.com (when ready)

## 📞 Contact

- **Email**: info@2sweety.com
- **Support**: support@2sweety.com

---

**Made with ❤️ by 2Sweety Team**
