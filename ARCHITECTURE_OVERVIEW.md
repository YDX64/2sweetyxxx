# 2Sweety Dating App - Production Architecture Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         EXTERNAL USERS / CLIENTS                             │
├─────────────────┬────────────────────┬───────────────────┬──────────────────┤
│   Web Browser   │   iOS App          │   Android App     │   Admin Panel    │
│  (React SPA)    │  (Flutter)         │  (Flutter)        │   (PHP)          │
└────────┬────────┴──────────┬─────────┴─────────┬─────────┴────────┬─────────┘
         │                   │                   │                  │
         └───────────────────┴───────────────────┴──────────────────┘
                                     │
                                     ▼
         ┌──────────────────────────────────────────────────────────┐
         │              CLOUDFLARE (Optional CDN/DDoS)               │
         │   - SSL Termination                                       │
         │   - DDoS Protection                                       │
         │   - CDN for Static Assets                                 │
         └───────────────────────────┬──────────────────────────────┘
                                     │
                                     ▼
         ┌──────────────────────────────────────────────────────────┐
         │                    api.2sweety.com                        │
         │              DNS: Pointing to Server IP                   │
         └───────────────────────────┬──────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                           SERVER INFRASTRUCTURE                             │
│                    (VPS/Cloud - Running Coolify/Docker)                     │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                          TRAEFIK (Reverse Proxy)                      │  │
│  │  - HTTPS/SSL (Let's Encrypt Auto-Renewal)                            │  │
│  │  - Request Routing                                                    │  │
│  │  - Load Balancing                                                     │  │
│  └───────────────────────────────┬──────────────────────────────────────┘  │
│                                  │                                          │
│       ┌──────────────────────────┼──────────────────────────┐              │
│       ▼                          ▼                          ▼              │
│  ┌─────────────────┐   ┌─────────────────┐     ┌──────────────────┐       │
│  │  APP CONTAINER  │   │ REDIS CONTAINER │     │  MYSQL CONTAINER │       │
│  │  lo4wc088...    │   │  redis-2sweety  │     │   z8co40wo4...   │       │
│  ├─────────────────┤   ├─────────────────┤     ├──────────────────┤       │
│  │                 │   │                 │     │                  │       │
│  │ ┌─────────────┐ │   │  Redis 7        │     │  MySQL 8.x       │       │
│  │ │  Nginx      │ │   │                 │     │                  │       │
│  │ │  (Web)      │ │   │  Port: 6379     │     │  Port: 3306      │       │
│  │ └──────┬──────┘ │   │                 │     │                  │       │
│  │        │        │   │  Uses:          │     │  Database:       │       │
│  │        ▼        │   │  - Cache        │     │  - gomeet        │       │
│  │ ┌─────────────┐ │   │  - Sessions     │     │                  │       │
│  │ │ PHP-FPM     │ │   │  - Queues       │     │  Volumes:        │       │
│  │ │ (Laravel)   │ │   │                 │     │  - mysql-data    │       │
│  │ └──────┬──────┘ │   │  Volumes:       │     │                  │       │
│  │        │        │   │  - redis-data   │     │  Backups:        │       │
│  │        ▼        │   └─────────────────┘     │  Daily 2AM       │       │
│  │ ┌─────────────┐ │                           │  /root/db-bak... │       │
│  │ │ Supervisor  │ │                           └──────────────────┘       │
│  │ │ (Workers)   │ │                                                       │
│  │ └─────────────┘ │                                                       │
│  │                 │                                                       │
│  │  Queue Workers: │                                                       │
│  │  - 4x General   │                                                       │
│  │  - Notif Worker │                                                       │
│  │  - Payment Work │                                                       │
│  │  - Image Proc   │                                                       │
│  │                 │                                                       │
│  │  Storage:       │                                                       │
│  │  /var/www/html/ │                                                       │
│  │  ├── public/    │                                                       │
│  │  ├── storage/   │                                                       │
│  │  │   ├── logs/  │                                                       │
│  │  │   └── app/   │                                                       │
│  │  └── vendor/    │                                                       │
│  └─────────────────┘                                                       │
│                                                                              │
└────────────────────────────────────────────────────────────────────────────┘
                 │                    │                    │
                 ▼                    ▼                    ▼
    ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
    │   FIREBASE       │  │    AGORA RTC     │  │  PAYMENT GWs     │
    │                  │  │                  │  │                  │
    │ - Auth           │  │ - Video Calls    │  │ - Razorpay       │
    │ - Firestore      │  │ - Audio Calls    │  │ - Stripe         │
    │ - Cloud Msg      │  │ - WebRTC         │  │ - PayPal         │
    │ - Storage        │  │                  │  │ - PayStack       │
    └──────────────────┘  └──────────────────┘  │ - Flutterwave    │
                                                 └──────────────────┘
                 │
                 ▼
    ┌──────────────────┐
    │   ONESIGNAL      │
    │                  │
    │ - Push Notif     │
    │ - iOS/Android    │
    │ - Web Push       │
    └──────────────────┘
```

---

## Data Flow Overview

### 1. User Authentication Flow
```
User → Browser/App → Traefik → Nginx → PHP/Laravel → Firebase Auth
                                                    ↓
                                            MySQL (user record)
                                                    ↓
                                            Redis (session)
                                                    ↓
                                            ← JWT Token
```

### 2. Real-time Chat Flow
```
User A → App → Firebase Firestore (write message)
                        ↓
                   Firebase Listeners
                        ↓
              User B ← App ← Firebase Firestore (read message)
                                    ↓
                            OneSignal (push notification)
```

### 3. Video/Audio Call Flow
```
User A → App → API → Agora Token Service → Agora App ID + Token
                                                    ↓
                                            Agora RTC Network
                                                    ↓
                                            User B ← App ← Agora
```

### 4. Payment Processing Flow
```
User → App → Traefik → Nginx → PHP/Laravel → Payment Gateway API
                                        ↓
                                   Queue Worker
                                        ↓
                               Process Payment Job
                                        ↓
                              Update MySQL (payment)
                                        ↓
                           OneSignal (success notification)
```

### 5. Background Job Processing
```
API Request → Laravel → Queue Job (Redis)
                              ↓
                       Queue Worker (picks job)
                              ↓
                    ┌─────────┴─────────┐
                    ▼                   ▼
             Send Email          Process Image
             via SMTP            Optimize/Resize
                    │                   │
                    └─────────┬─────────┘
                              ▼
                     Update MySQL Status
                              ↓
                    Send Push Notification
```

---

## Critical Dependencies

### External Services (MUST be configured)
```
┌─────────────────────────────────────────────────────────────┐
│ SERVICE          │ PURPOSE              │ CRITICALITY       │
├──────────────────┼──────────────────────┼───────────────────┤
│ Firebase         │ Auth, Chat, Storage  │ 🔴 CRITICAL      │
│ OneSignal        │ Push Notifications   │ 🔴 CRITICAL      │
│ Agora            │ Video/Audio Calls    │ 🔴 CRITICAL      │
│ Payment Gateway  │ Subscriptions/Coins  │ 🔴 CRITICAL      │
│ Email SMTP       │ Password Resets      │ 🟡 HIGH          │
│ CDN (Optional)   │ Static Assets        │ 🟢 RECOMMENDED   │
│ Monitoring       │ Uptime Alerts        │ 🟢 RECOMMENDED   │
└─────────────────────────────────────────────────────────────┘
```

### Internal Services (MUST be running)
```
┌─────────────────────────────────────────────────────────────┐
│ SERVICE          │ STATUS CHECK                             │
├──────────────────┼──────────────────────────────────────────┤
│ MySQL            │ docker ps | grep z8co40wo4              │
│ Redis            │ docker ps | grep redis                  │
│ App Container    │ docker ps | grep lo4wc0888              │
│ Queue Workers    │ docker exec ... ps aux | grep queue     │
│ Cron Jobs        │ crontab -l                              │
│ SSL Certificate  │ openssl s_client -connect ...           │
└─────────────────────────────────────────────────────────────┘
```

---

## Resource Requirements

### Minimum Server Specs (Basic Operation)
```
┌────────────────────────────────────────────────────────┐
│ CPU:     2 cores                                       │
│ RAM:     4 GB                                          │
│ Disk:    50 GB SSD                                     │
│ Network: 100 Mbps                                      │
└────────────────────────────────────────────────────────┘
```

### Recommended Server Specs (Production - 1000 users)
```
┌────────────────────────────────────────────────────────┐
│ CPU:     4 cores                                       │
│ RAM:     8 GB                                          │
│ Disk:    100 GB SSD                                    │
│ Network: 1 Gbps                                        │
└────────────────────────────────────────────────────────┘
```

### Optimal Server Specs (High Load - 10000+ users)
```
┌────────────────────────────────────────────────────────┐
│ CPU:     8+ cores                                      │
│ RAM:     16+ GB                                        │
│ Disk:    250+ GB SSD                                   │
│ Network: 1+ Gbps                                       │
│ Backup:  S3/R2 for media storage                      │
└────────────────────────────────────────────────────────┘
```

### Container Resource Allocation
```
┌──────────────────┬─────────────┬─────────────┬──────────┐
│ CONTAINER        │ CPU LIMIT   │ MEM LIMIT   │ PRIORITY │
├──────────────────┼─────────────┼─────────────┼──────────┤
│ App (lo4wc...)   │ 2 cores     │ 4 GB        │ HIGH     │
│ MySQL (z8co...)  │ 2 cores     │ 2 GB        │ HIGH     │
│ Redis            │ 1 core      │ 512 MB      │ MEDIUM   │
│ Traefik          │ 0.5 core    │ 256 MB      │ MEDIUM   │
└──────────────────┴─────────────┴─────────────┴──────────┘
```

---

## Network Ports

### External (Internet-facing)
```
┌────────────────────────────────────────────────────────┐
│ PORT    │ SERVICE           │ PURPOSE                  │
├─────────┼───────────────────┼──────────────────────────┤
│ 443     │ HTTPS (Traefik)   │ All web traffic          │
│ 80      │ HTTP (Traefik)    │ Redirect to HTTPS        │
└────────────────────────────────────────────────────────┘
```

### Internal (Docker network - 'coolify')
```
┌────────────────────────────────────────────────────────┐
│ PORT    │ SERVICE           │ PURPOSE                  │
├─────────┼───────────────────┼──────────────────────────┤
│ 3306    │ MySQL             │ Database connections     │
│ 6379    │ Redis             │ Cache/Queue/Sessions     │
│ 9000    │ PHP-FPM           │ FastCGI to Nginx         │
└────────────────────────────────────────────────────────┘
```

### Agora RTC (for video/audio - firewall must allow)
```
┌────────────────────────────────────────────────────────┐
│ Ports: 1080-10000 UDP                                  │
│ Purpose: WebRTC media streams                          │
│ Direction: Bidirectional                               │
└────────────────────────────────────────────────────────┘
```

---

## Data Storage Layout

### Application Files
```
/var/lib/docker/volumes/
├── app-data/
│   └── _data/
│       └── var/www/html/
│           ├── public/          (web root)
│           ├── storage/
│           │   ├── app/
│           │   │   └── public/  (user uploads)
│           │   │       ├── profiles/
│           │   │       ├── chat-media/
│           │   │       └── gifts/
│           │   └── logs/
│           │       └── laravel.log
│           └── vendor/
```

### Database Files
```
/var/lib/docker/volumes/
└── mysql-data/
    └── _data/
        └── gomeet/             (database)
            ├── users.ibd
            ├── messages.ibd
            ├── likes.ibd
            ├── matches.ibd
            └── payments.ibd
```

### Redis Data
```
/var/lib/docker/volumes/
└── redis-data/
    └── _data/
        └── dump.rdb           (persistence file)
```

### Backups
```
/root/
└── db-backups/
    ├── gomeet_20251030_020000.sql.gz
    ├── gomeet_20251029_020000.sql.gz
    └── ... (30 days retention)
```

### Logs
```
/var/log/
├── cron-*.log              (cron job outputs)
├── db-backup.log           (backup status)
├── docker-cleanup.log      (cleanup operations)
├── disk-check.log          (disk space alerts)
└── health-check.log        (health monitoring)
```

---

## Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY DEFENSE IN DEPTH                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Layer 7: External                                          │
│  ┌────────────────────────────────────────────┐            │
│  │ Cloudflare DDoS Protection (optional)      │            │
│  │ Rate Limiting                              │            │
│  └────────────────────────────────────────────┘            │
│                       │                                     │
│  Layer 6: SSL/TLS                                           │
│  ┌────────────────────────────────────────────┐            │
│  │ Let's Encrypt SSL Certificate              │            │
│  │ TLS 1.2/1.3 Only                           │            │
│  │ Strong Cipher Suites                       │            │
│  └────────────────────────────────────────────┘            │
│                       │                                     │
│  Layer 5: Network                                           │
│  ┌────────────────────────────────────────────┐            │
│  │ Firewall (UFW/iptables)                    │            │
│  │ Only ports 80, 443, 22 exposed             │            │
│  │ SSH key-only authentication                │            │
│  └────────────────────────────────────────────┘            │
│                       │                                     │
│  Layer 4: Application                                       │
│  ┌────────────────────────────────────────────┐            │
│  │ JWT Authentication                         │            │
│  │ CSRF Protection                            │            │
│  │ XSS Prevention                             │            │
│  │ SQL Injection Prevention (ORM)             │            │
│  │ Rate Limiting per User                     │            │
│  └────────────────────────────────────────────┘            │
│                       │                                     │
│  Layer 3: Container                                         │
│  ┌────────────────────────────────────────────┐            │
│  │ Non-root User (www-data)                   │            │
│  │ Read-only Filesystem (where possible)      │            │
│  │ Resource Limits (CPU, Memory)              │            │
│  │ No Privileged Mode                         │            │
│  └────────────────────────────────────────────┘            │
│                       │                                     │
│  Layer 2: Database                                          │
│  ┌────────────────────────────────────────────┐            │
│  │ Strong Passwords                           │            │
│  │ Internal Network Only                      │            │
│  │ Encrypted Backups                          │            │
│  │ Parameterized Queries                      │            │
│  └────────────────────────────────────────────┘            │
│                       │                                     │
│  Layer 1: File System                                       │
│  ┌────────────────────────────────────────────┐            │
│  │ Secure File Permissions                    │            │
│  │ No Execute on Uploads                      │            │
│  │ Input Validation                           │            │
│  │ Virus Scanning (optional)                  │            │
│  └────────────────────────────────────────────┘            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Monitoring Points

```
┌─────────────────────────────────────────────────────────────┐
│ MONITORING CHECKPOINT    │ CHECK FREQUENCY │ ALERT ON       │
├──────────────────────────┼─────────────────┼────────────────┤
│ Site Uptime              │ 1 minute        │ Down 1 min     │
│ API Response Time        │ 5 minutes       │ > 2 seconds    │
│ Container Health         │ 5 minutes       │ Not running    │
│ Disk Space               │ 6 hours         │ > 80%          │
│ Database Connections     │ 5 minutes       │ > 400/500      │
│ Failed Queue Jobs        │ Hourly          │ > 10 failed    │
│ SSL Certificate Expiry   │ Daily           │ < 30 days      │
│ Database Backup          │ Daily           │ Backup failed  │
│ Error Log                │ Real-time       │ Critical error │
│ Memory Usage             │ 5 minutes       │ > 90%          │
│ CPU Usage                │ 5 minutes       │ > 90%          │
└─────────────────────────────────────────────────────────────┘
```

---

## Disaster Recovery Plan

### RTO (Recovery Time Objective): 15 minutes
### RPO (Recovery Point Objective): 24 hours (daily backups)

### Recovery Procedures:

1. **Complete System Failure:**
   ```bash
   # 1. Start database
   docker start z8co40wo4sc8ow4wsog4cw44
   sleep 30

   # 2. Start application
   docker start lo4wc0888kowwwco8w0gsoco-220639619982
   sleep 20

   # 3. Verify health
   curl https://api.2sweety.com/api/health
   ```

2. **Database Corruption:**
   ```bash
   # 1. Stop app (prevent writes)
   docker stop lo4wc0888kowwwco8w0gsoco-220639619982

   # 2. Restore from last backup
   BACKUP=/root/db-backups/gomeet_YYYYMMDD_HHMMSS.sql.gz
   gunzip < $BACKUP | docker exec -i z8co40wo4sc8ow4wsog4cw44 mysql -u root -p gomeet

   # 3. Restart app
   docker start lo4wc0888kowwwco8w0gsoco-220639619982
   ```

3. **Server Completely Lost:**
   - Provision new server
   - Install Coolify
   - Deploy containers from Coolify config
   - Restore database from off-site backup
   - Update DNS if IP changed
   - Estimated time: 2-4 hours

---

## Performance Optimization Checklist

```
┌─────────────────────────────────────────────────────────────┐
│ OPTIMIZATION          │ STATUS  │ IMPACT    │ EFFORT        │
├───────────────────────┼─────────┼───────────┼───────────────┤
│ ✅ OpCache Enabled    │ ❌ TODO │ 5x faster │ 15 min        │
│ ✅ Redis for Cache    │ ❌ TODO │ 3x faster │ 15 min        │
│ ✅ Database Indexes   │ ❌ TODO │ 10x faster│ 30 min        │
│ ✅ Image Optimization │ ❌ TODO │ 50% size  │ 30 min        │
│ ✅ CDN for Assets     │ ⚠️ OPT  │ 2x faster │ 1 hour        │
│ ✅ Query Optimization │ ❌ TODO │ 5x faster │ 2 hours       │
│ ✅ Lazy Loading       │ ⚠️ OPT  │ 30% faster│ 2 hours       │
│ ✅ Gzip Compression   │ ⚠️ OPT  │ 70% size  │ 15 min        │
└─────────────────────────────────────────────────────────────┘

Legend: ❌ TODO = Not implemented
        ✅ DONE = Implemented
        ⚠️ OPT  = Optional but recommended
```

---

## Scaling Strategy

### Current: Single Server (0-1000 users)
```
1 Server → All services
```

### Phase 2: Separated Database (1000-5000 users)
```
Server 1: App + Redis
Server 2: MySQL (dedicated)
```

### Phase 3: Load Balanced (5000-20000 users)
```
Load Balancer
    ↓
┌───┴───┐
App 1  App 2  → Redis Cluster → MySQL Master
                                    ↓
                              MySQL Replicas
```

### Phase 4: Microservices (20000+ users)
```
- Separate chat service
- Separate video call service
- Separate payment service
- Separate matching algorithm service
- Message queue (RabbitMQ/Kafka)
- Object storage (S3/R2) for media
```

---

**This architecture provides:**
- ✅ High availability
- ✅ Horizontal scalability
- ✅ Disaster recovery
- ✅ Performance monitoring
- ✅ Security in depth
- ✅ Cost efficiency at small scale
- ✅ Clear upgrade path to enterprise scale

---

**Last Updated:** 2025-10-30
**Next Review:** Monthly
