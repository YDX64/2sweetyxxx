# 2Sweety - Modern Dating Application

A full-featured dating application built with React, TypeScript, Express, and Supabase.

## 🚀 Features

- **Complete Dating Platform**: Swipe-based matching, real-time chat, video calls
- **Multi-tier Subscriptions**: 6 subscription levels with progressive features
- **Internationalization**: Support for 17 languages
- **Real-time Features**: WebSocket chat, live notifications, WebRTC video calls
- **Advanced Filtering**: Location-based search, preference matching
- **Security**: Row-level security, content moderation, secure authentication
- **Admin Panel**: User management, content moderation, analytics

## 📋 Prerequisites

- Node.js >= 20.0.0
- npm or yarn
- Supabase account
- Stripe account (for payments)

## 🛠️ Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/2sweety.git
   cd 2sweety
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Database setup**
   ```bash
   npm run db:push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## 🔒 Backup Strategy

This project includes a comprehensive backup strategy with GitHub Actions:

- **Continuous Backups**: Daily automated backups
- **Pre-deployment Snapshots**: Automatic before each deployment
- **Database Backups**: Separate database schema backups
- **Emergency Recovery**: Quick rollback procedures

See [BACKUP_STRATEGY.md](BACKUP_STRATEGY.md) for details.

## 📚 Documentation

- [Development Workflow](DEVELOPMENT_WORKFLOW.md)
- [Backup Strategy](BACKUP_STRATEGY.md)
- [Disaster Recovery](DISASTER_RECOVERY.md)
- [Deployment Options](DEPLOYMENT_OPTIONS.md)
- [Coolify Setup](COOLIFY_SETUP.md)

## 🚀 Deployment

Supports multiple deployment platforms:
- Coolify (recommended)
- Vercel
- Railway
- Traditional VPS

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For issues and questions:
1. Check the documentation
2. Review [DISASTER_RECOVERY.md](DISASTER_RECOVERY.md) for emergencies
3. Create an issue in the repository