# Production Deployment Guide: Mama Thes Store

This document details the production deployment, domain setup, environment variable configuration, backups, and security guidelines for Mama Thes Store.

## 1. Hosting Architecture Recommendation

Mama Thes Store is built with Next.js 14 App Router and utilizes:
- **Server Actions & Route Handlers**: Dynamic server-side APIs for price validation and payment verification.
- **Firebase Authentication, Firestore & Storage**: Managed NoSQL cloud database, user identity, and media asset storage.

### Recommended Providers:
1. **Vercel**: Native zero-configuration Next.js deployment with global Edge network and instant cache invalidation.
2. **Firebase App Hosting**: Next.js-native hosting within Google Cloud / Firebase ecosystem.
3. **Docker / AWS ECS / Google Cloud Run**: Containerized Node.js deployment using standard `standalone` Next.js output.

---

## 2. Environment Variables Checklist

Configure the following secrets in your deployment platform's environment settings:

| Variable | Description | Exposed to Browser? |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_APP_NAME` | Name of the store ("Mama Thes Store") | Yes |
| `NEXT_PUBLIC_APP_URL` | Canonical domain (e.g. `https://mamathesstore.com`) | Yes |
| `NEXT_PUBLIC_STORE_CURRENCY` | `GHS` | Yes |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Web API Key | Yes |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `mama-thes-store.firebaseapp.com` | Yes |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `mama-thes-store` | Yes |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `mama-thes-store.appspot.com` | Yes |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging sender ID | Yes |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase Web App ID | Yes |
| `FIREBASE_CLIENT_EMAIL` | Service Account Email | **No (Server only)** |
| `FIREBASE_PRIVATE_KEY` | Service Account Private Key | **No (Server only)** |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Paystack Live Public Key (`pk_live_...`) | Yes |
| `PAYSTACK_SECRET_KEY` | Paystack Live Secret Key (`sk_live_...`) | **No (Server only)** |

---

## 3. Custom Domain Configuration (e.g. `mamathesstore.com`)

1. In your hosting dashboard, add domain `mamathesstore.com` and `www.mamathesstore.com`.
2. Configure DNS records with your registrar:
   - **Apex domain**: `A` record pointing to your host's IP (e.g. `76.76.21.21`).
   - **WWW subdomain**: `CNAME` pointing to `cname.vercel-dns.com` or your provider's CNAME.
3. Verify SSL certificate auto-provisioning (Let's Encrypt TLS 1.3).

---

## 4. Paystack Webhook Configuration

1. In your Paystack Merchant Dashboard, navigate to **Settings > API Keys & Webhooks**.
2. Set **Webhook URL** to:
   ```
   https://mamathesstore.com/api/payments/verify
   ```
3. Set test and live secret keys in your environment variables.

---

## 5. Security Rules

### Cloud Firestore Rules (`firestore.rules`)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read for products and categories
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.role == 'admin';
    }
    match /categories/{categoryId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.role == 'admin';
    }
    // Users can only access their own orders
    match /orders/{orderId} {
      allow read: if request.auth != null && (resource.data.customerId == request.auth.uid || request.auth.token.role == 'admin');
      allow create: if true; // Validated via server-side Route Handlers
      allow update, delete: if request.auth != null && request.auth.token.role == 'admin';
    }
  }
}
```

---

## 6. Backups and Disaster Recovery

1. **Firestore Automated Backups**: Schedule daily exports to a Google Cloud Storage (GCS) multi-region bucket using Google Cloud Scheduler.
2. **Audit Logging**: All administrative changes, order status updates, and stock edits record timestamped logs to preserve accountability.
