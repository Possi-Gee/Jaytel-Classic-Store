# Jaytel Classic Store

A chic, production-ready, single-vendor e-commerce platform and installable Progressive Web App (PWA) designed for girlish glamour, luxury fashion, and beauty in Ghana. Designed mobile-first to feel like a high-end native shopping app on mobile screens (down to 320px) while progressively transforming into a desktop boutique experience on larger monitors.

## 👑 Brand & Design Identity

- **Brand Name**: Jaytel Classic Store
- **Logo & Motifs**: Official "JC" monogram with a royal pink crown, hot pink shopping bag, sweet hearts, and glamorous typography.
- **Color Palette**: Hot Barbie & Candy Pink (`#ec4899`, `#db2777`), Pastel Blush Rose (`#fdf2f8`, `#fce7f3`), Rose Gold, and Deep Black accents.
- **Aesthetic**: Feminine, chic, polished, and glamorous with soft romantic shadows and glowing pink accents.

---

## 🎯 Architecture & Technologies

- **Frontend & App Framework**: Next.js 14 App Router, React 18, TypeScript (Strict).
- **Styling & Design System**: Vanilla Tailwind CSS with custom design tokens, safe-area support (`env(safe-area-inset-*)`), and tap-target optimizations (min 44px).
- **Backend & APIs**: Next.js Route Handlers (`/api/orders`, `/api/payments`), Firebase Authentication, Cloud Firestore, and Firebase Admin SDK.
- **PWA**: Installable Web App Manifest, Service Worker caching, and offline fallback.
- **Ghanaian Commerce**: Ghana Cedi (`GH₵`) pricing, Ghana phone validation, Mobile Money (MTN MoMo, Telecel Cash, AT Money) and Card payment adapters, and Ghana regional delivery zones.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your Firebase web app keys and Paystack credentials.
> **Note:** If Paystack keys are left blank or set to test keys, the application seamlessly activates **Safe Sandbox Mode**, allowing instant simulation of Ghanaian Mobile Money and card payments.

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Run Verification Tests
```bash
node src/test/run-tests.mjs
```

---

## 📱 Mobile-First Features & Breakpoints

- **Responsive Breakpoints**:
  - `320px – 374px`: Small mobile (zero horizontal overflow, compact headers, single-handed controls)
  - `375px – 479px`: Standard mobile
  - `480px – 767px`: Large mobile / Phablets
  - `768px – 1023px`: Tablets (iPad portrait/landscape)
  - `1024px – 1439px`: Desktop (expanded header navigation and filter sidebars)
  - `1440px+`: Ultrawide & large screens (centered `max-w-7xl` container)
- **App-Like Navigation**: Fixed bottom navigation bar (`Home`, `Shop`, `Wishlist`, `Orders`, `Account`) with safe-area notch padding for iOS and Android.
- **PWA Installation**: Install prompt on Android Chrome and Safari "Add to Home Screen" instructions.
- **Offline Fallback**: Offline notification screen with automatic reload detection.

---

## 🛡️ Administrative Portal

Access the administration dashboard at `/admin`.
- Role-protected with server-side authorization.
- Real-time order fulfillment pipeline (Pending $\rightarrow$ Confirmed $\rightarrow$ Processing $\rightarrow$ Out for delivery $\rightarrow$ Delivered).
- Product catalog creation and live inventory stock adjustment (+ / -).
- Ghana delivery fee zones and performance metrics.
- Demo role switcher available on the account page for quick testing.
