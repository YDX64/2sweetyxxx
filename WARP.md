# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**2Sweety** (formerly GoMeet) is a full-stack social dating platform with three main components:
- **React Web Application** (`GoMeet Web/`) - Client-facing dating web app
- **PHP Admin Panel** (`2Sweety Admin/`) - Backend API and admin dashboard
- **Flutter Mobile App** (separate repository) - Mobile client

All components share the same MySQL database, Firebase infrastructure, and backend API.

## Development Commands

### Web Application (React)

```bash
cd "GoMeet Web"

# Install dependencies
npm install

# Development server (localhost:3000)
npm start

# Production build
npm run build

# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

### Admin Panel (PHP)

```bash
cd "2Sweety Admin"

# Local PHP development server
php -S localhost:8000

# Deploy to production (requires Coolify setup)
./deploy.sh

# Database setup (imports schema and data)
../database-setup.sh

# Database backup
./database-backup.sh
```

### Database Management

```bash
# Setup database from scratch (interactive)
./database-setup.sh

# Backup current database
./database-backup.sh

# Import SQL file directly
docker exec -i 2sweety-mysql mysql -u root -p gommet < "mobile-app/Gommet Database 1.5/Gomeet.sql"
```

## Core Architecture

### State Management (React Web)

The app uses **React Context API** for global state management via `Context/MyProvider.jsx`:

- **Authentication state**: `uid`, `registerUid`, `profileId`
- **User data**: `name`, `email`, `bio`, `gender`, `birthdate`, `location`
- **Configuration**: `basUrl`, `imageBaseURL`, `paymentBaseURL`
- **Payment state**: `planId`, `transactionId`, `walletCoin`, `buyCoin`
- **Communication**: `chatId`, `isVideoCalling`, `isVoiceCalling`, `callStatus`
- **App config**: `agoraAppId`, `onesignalAppId`, `currency`, `color`

All components access this context via: `import { MyContext } from '../Context';` then `useContext(MyContext)`.

### API Structure (PHP Backend)

**Base URL**: `https://gomeet.cscodetech.cloud/api/` (configured in `Context/MyProvider.jsx`)

Key API endpoints in `2Sweety Admin/api/`:
- **Authentication**: `mobile_check.php`, `msg_otp.php`, `forget_password.php`
- **User Management**: `edit_profile.php`, `getdata.php`, `user_info.php`, `acc_delete.php`
- **Matching**: `home_data.php`, `like_dislike.php`, `new_match.php`, `filter.php`, `passed.php`
- **Social**: `favourite.php`, `like_me.php`, `blocklist.php`, `del_unlike.php`
- **Payments**: `package_purchase.php`, `list_package.php`, `paymentlist.php`
- **Gifts**: `gift_list.php`, `giftbuy.php`, `my_gift.php`
- **Health check**: `health.php`

API responses typically use JSON format with structure: `{"ResponseCode": "200", "Result": "true", "ResponseMsg": "...", "ResultData": {...}}`

### Database Schema

**Database**: `gommet` (MySQL 8.0, utf8mb4_unicode_ci)

Key tables (24 total):
- **Users**: `tbl_user` - User profiles with location, preferences, interests
- **Matching**: `tbl_like` - Swipe actions, `tbl_match` - Successful matches
- **Messaging**: Handled via Firebase Firestore (not MySQL)
- **Payments**: `tbl_plan`, `tbl_package`, `tbl_purchase`, `tbl_payment`
- **Content**: `tbl_interest`, `tbl_language`, `tbl_goal`, `tbl_religion`, `tbl_gift`
- **Admin**: `admin` - Admin panel access
- **Wallet**: `tbl_wallet` - User coin balances and transactions

### Firebase Integration

**Project ID**: `sweet-a6718`

Firebase is used for:
1. **Real-time Chat** - Firestore collections for messages and conversations
2. **Cloud Messaging** - Push notifications for messages and matches
3. **Authentication** - Social login verification (supplemental to backend)
4. **Storage** - User images and media uploads

Configuration files:
- Web: `GoMeet Web/src/Users_Chats/Firebase.js`
- Admin: Firebase Admin SDK credentials in environment variables

### Routing & Protected Routes

React Router v6 with authentication-based protection:

**Unauthenticated routes** (`MobilComponent/`):
- `/` - PhoneNum (login)
- `/register` - Register
- `/validate` - OTP verification
- `/birthdate`, `/gender`, `/goals`, `/nearby`, `/hobbies`, `/languages`, `/religion`, `/image` - Onboarding flow

**Authenticated routes** (`LoginComponent/`):
- `/dashboard` - Main swipe/discovery interface
- `/detail/:id` - User profile detail
- `/profile` - Own profile
- `/userchat` - Chat list
- `/upgrade` - Premium subscription
- `/buycoin` - Purchase coins
- `/wallet` - Wallet management
- `/history` - Transaction history
- `/favorites` - Liked users
- `/blockuser` - Blocked users list

Routes are protected via localStorage token check in `App.js`.

### Payment Gateway Integration

Multiple payment processors supported (configured in `PaymentMethod/`):
- **Razorpay** (India) - `Razorpay.jsx`
- **Stripe** (Global) - `Stripe.jsx`
- **PayPal** (Global) - `PayPal.jsx`
- **PayStack** (Africa) - `PayStack.jsx`
- **Flutterwave** (Africa) - `FlutterWave.jsx`
- **Mercado Pago** (Latin America) - `MercadoPago.jsx`
- **Paytm** (India) - `PaytmPayment.jsx`
- **Others**: Khalti, Midtrans, SenangPay, Payfast

Payment flow:
1. User selects plan/package → Component sets `planId`/`purchaseId` in context
2. User selects payment method → Redirects to `PaymentMethod/Payment.jsx`
3. Payment component loads gateway SDK → Processes transaction
4. Success → Calls `package_purchase.php` → Updates database → Redirects to `PaymentRespons.jsx`

### Video/Audio Calling (Agora RTC)

**Implementation**: `User_Call/Video_call.jsx`, `User_Call/Voice_Call.jsx`

Call flow:
1. User initiates call → Creates Firebase document in `call` collection
2. Recipient's client detects document → Shows incoming call UI
3. Accept → Both join Agora channel using `agoraAppId` from context
4. Agora handles WebRTC signaling and media streaming
5. End call → Cleanup Firebase documents

Key Agora configuration:
- App ID stored in context via API settings
- Channels use unique identifiers based on user IDs
- Token-based authentication for production

## Common Development Workflows

### Adding a New Feature to Web App

1. **Create component** in appropriate folder:
   - Authenticated users: `LoginComponent/`
   - Registration/onboarding: `MobilComponent/`
   - Payments: `PaymentMethod/`
   - Chat: `Users_Chats/`
   - Calls: `User_Call/`

2. **Add route** in `App.js`:
   ```javascript
   <Route path="/newfeature" element={<NewFeature />} />
   ```

3. **Use global state** via MyContext:
   ```javascript
   import { MyContext } from '../Context';
   const { basUrl, uid } = useContext(MyContext);
   ```

4. **Make API calls** using Axios:
   ```javascript
   const response = await axios.post(`${basUrl}endpoint.php`, formData);
   ```

5. **Handle errors and loading states** consistently across the app

### Adding a New API Endpoint

1. **Create PHP file** in `2Sweety Admin/api/`

2. **Include database connection**: `require_once '../inc/Connection.php';`

3. **Validate input** and check authentication (if required)

4. **Return consistent JSON format**:
   ```php
   $returnArr = array(
       "ResponseCode" => "200",
       "Result" => "true", 
       "ResponseMsg" => "Success",
       "ResultData" => $data
   );
   echo json_encode($returnArr);
   ```

5. **Update API documentation** in relevant files

### Working with Firebase Chat

Chat messages are stored in Firestore, not MySQL:

**Collections structure**:
- `users/{userId}` - User metadata for chat
- `conversations/{conversationId}` - Conversation metadata
- `conversations/{conversationId}/messages/{messageId}` - Individual messages

**Real-time listeners** in `Users_Chats/` components subscribe to message changes.

### Implementing Role-Based Access Control (RBAC)

For the admin-only components requirement:

1. **Add role field** to user context state in `Context/MyProvider.jsx`:
   ```javascript
   const [userRole, setUserRole] = useState('user'); // 'user', 'premium', 'admin'
   ```

2. **Create ProtectedRoute component**:
   ```javascript
   const ProtectedRoute = ({ children, requiredRole }) => {
     const { userRole } = useContext(MyContext);
     return userRole === requiredRole ? children : <Navigate to="/dashboard" />;
   };
   ```

3. **Wrap admin routes**:
   ```javascript
   <Route path="/admin/*" element={
     <ProtectedRoute requiredRole="admin">
       <AdminDashboard />
     </ProtectedRoute>
   } />
   ```

4. **Conditionally render UI elements** based on role:
   ```javascript
   {userRole === 'admin' && <AdminButton />}
   {userRole === 'premium' && <PremiumFeature />}
   ```

5. **Backend validation**: Always validate role in PHP API endpoints (never trust client-side checks)

### Testing Changes

1. **Run web app locally**: `cd "GoMeet Web" && npm start`
2. **Check browser console** for errors
3. **Test API endpoints** with curl or Postman
4. **Verify database changes** via MySQL client or admin panel
5. **Test on multiple browsers** (Chrome, Safari, Firefox)
6. **Check mobile responsiveness** (Chrome DevTools device mode)

### Deployment Workflow

**Web Application (Coolify)**:
1. Update environment variables in `.env.coolify` if needed
2. Push changes to GitHub
3. Coolify auto-deploys from main branch
4. Monitor deployment logs in Coolify dashboard
5. Verify at `https://2sweety.com`

**Backend API**:
1. Update PHP files in `2Sweety Admin/`
2. Use `deploy.sh` script or push to Coolify
3. Verify at `https://api.2sweety.com`
4. Check `api/health.php` endpoint

**Database migrations**:
1. Backup first: `./database-backup.sh`
2. Test migration locally
3. Apply to production MySQL container
4. Verify with admin panel or direct queries

## Configuration Files

### Environment Variables

**Web** (`.env.local` or `.env.coolify`):
- `REACT_APP_API_BASE_URL` - Backend API base URL
- `REACT_APP_FIREBASE_*` - Firebase configuration (7 variables)
- `REACT_APP_AGORA_APP_ID` - Video call app ID
- `REACT_APP_ONESIGNAL_APP_ID` - Push notifications
- Payment gateway keys (public keys only)

**Backend** (set in Coolify or docker-compose):
- `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` - Database credentials
- `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL` - Firebase Admin SDK
- Payment gateway secret keys
- `JWT_SECRET`, `API_KEY` - Security tokens

### Critical Files

- `GoMeet Web/src/Context/MyProvider.jsx` - Global state and API URLs
- `GoMeet Web/src/App.js` - Routing configuration
- `2Sweety Admin/inc/Connection.php` - Database connection (not in repo)
- `2Sweety Admin/api/` - All backend endpoints
- `database-setup.sh` - Database initialization script
- `docker-compose.production.yml` - Full stack deployment config

## Key Integrations

**OneSignal** (Push Notifications):
- App ID: `94b2b6c5-fabb-4454-a2b7-75cf75b84789`
- Configured in `User_Call/Onesignal.js`
- Sends notifications for: messages, matches, likes, calls

**Agora** (Video/Audio):
- SDK versions: agora-rtc-sdk-ng (4.23.0), agora-rtm-sdk (2.2.0)
- Requires app ID and certificate from Agora console
- Handles peer-to-peer media streaming

**Firebase**:
- Firestore for chat messages (real-time sync)
- Cloud Messaging for push notifications
- Storage for user images
- Authentication for social login verification

## Important Notes

- **Never commit** `.env.local`, database credentials, or API keys
- **Always test payment gateways** in sandbox mode before production
- **Database charset** must be `utf8mb4_unicode_ci` for emoji support
- **CORS must be enabled** on backend for web app to make API calls
- **Firebase security rules** must be properly configured for production
- **User images** are stored on backend server, not in database (paths only)
- **Location data** (latitude/longitude) is required for nearby matching feature
- **The mobile app** is in a separate repository but shares the same backend
- **API rate limiting** should be implemented for production use
- **All times** should be stored in UTC in database, converted to local timezone in frontend
