# Full Stack Security Audit (Web & Mobile)

_Based on practical pentesting advice adapted for cross-platform projects_

## part 1: The Universal Backend (API & Database)

**These controls protect the "Brain" of your system. Both your Web and Mobile apps rely on this.**

### 1. Automated Code Review

**Goal:** Catch logic flaws and injections before merging.

- [ ] **Action:** Integrate AI review (e.g., Coderabbit) on PRs.
- [ ] **Verify:** Ensure scans cover both backend API code and mobile source code (Swift/Kotlin/Dart).

### 2. Rate Limiting (Crucial for Mobile)

**Goal:** Stop API abuse. Mobile APIs are often reverse-engineered and hammered by scripts.

- [ ] **Action:** Implement strict rate limits (e.g., 100 req/hour per IP or User ID).
- [ ] **Mobile Specific:** Do not rely solely on IP limiting (mobile IPs change on cellular). Limit by **User ID** or **Device ID**.
- [ ] **Verify:** Script a loop of requests against your API and verify it returns `429 Too Many Requests`.

### 3. Row Level Security (RLS)

**Goal:** The database enforces that User A cannot see User B's data.

- [ ] **Action:** Enable RLS in Postgres (or equivalent in your DB).
- [ ] **Test:** Create a test user, grab their auth token, and try to request a different user's UUID via cURL. It should fail at the DB level.

### 4. Secrets Management

**Goal:** Keep keys out of the repo.

- [ ] **Action:** Use AWS Secrets Manager/Google Secret Manager.
- [ ] **Policy:** Rotate keys every 90 days.

### 5. HTTPS & Certificate Pinning

**Goal:** Encrypt transit.

- [ ] **Action:** Enforce HTTPS everywhere. Redirect HTTP -> HTTPS.
- [ ] **Mobile Specific:** Consider **Certificate Pinning** (prevents Man-in-the-Middle attacks on compromised networks). _Note: Requires careful maintenance._

---

## Part 2: Web Client Specifics

**Browser-based vulnerabilities.**

### 1. CAPTCHA Implementation

- [ ] **Action:** Add Invisible CAPTCHA to public forms (Login/Signup).
- [ ] **Goal:** Stop "Contact Us" spam and credential stuffing.

### 2. Cookie Hygiene

- [ ] **Action:** Set cookies to `HttpOnly` (prevent JS access) and `Secure` (HTTPS only).
- [ ] **Action:** Set `SameSite=Strict` or `Lax` to prevent CSRF attacks.

### 3. CSP (Content Security Policy)

- [ ] **Action:** Implement CSP headers to restrict where scripts can load from.
- [ ] **Goal:** Mitigate XSS (Cross-Site Scripting) attacks if an input sanitization fails.

---

## Part 3: Mobile Client Specifics (iOS & Android)

**The "Public Client" problem: You cannot trust the binary in the user's hand.**

### 1. NO Secrets in the Code (The #1 Mobile Mistake)

**Goal:** Prevent extraction of API keys.

- [ ] **Action:** **REMOVE** all AWS keys, Stripe Secret keys, and Admin tokens from `Info.plist`, `build.gradle`, or source code.
- [ ] **Reality Check:** If you release an app with a secret key, a hacker _will_ decompile it and steal it.
- [ ] **Fix:** Proxy 3rd party API calls through your Backend API. The app talks to your server -> Your server adds the key -> Your server talks to Stripe/AWS.

### 2. Secure Local Storage

**Goal:** Protect saved user data on the device.

- [ ] **Action (iOS):** Use **Keychain Services**. Never save tokens/passwords to `UserDefaults`.
- [ ] **Action (Android):** Use **EncryptedSharedPreferences** or Android Keystore. Never use plain `SharedPreferences`.
- [ ] **Verify:** Connect a rooted/jailbroken device and inspect the app's local files. Tokens should not be readable in plain text.

### 3. Binary Protections

**Goal:** Make reverse engineering harder.

- [ ] **Action (Android):** Enable **R8/ProGuard** code obfuscation and shrinking in your release build.
- [ ] **Action (iOS):** Ensure symbols are stripped in release builds.

### 4. Platform-Native Anti-Bot (Better than CAPTCHA)

**Goal:** Verify the request is coming from a real device, not a script.

- [ ] **Action (iOS):** Implement **DeviceCheck** or **App Attest**.
- [ ] **Action (Android):** Implement **Play Integrity API**.
- [ ] **Logic:** These APIs generate a token proving the device is valid. Your backend should reject requests without this token.

### 5. Deep Link Validation

**Goal:** Prevent URL scheme hijacking.

- [ ] **Action:** Validate all parameters passed via Deep Links (e.g., `myapp://reset-password?token=...`).
- [ ] **Risk:** Malicious apps can register your custom scheme and steal data if parameters aren't verified. Use **Universal Links (iOS)** and **App Links (Android)** instead of custom schemes where possible.

## Part 4: Store Compliance & Logic (Pre-Flight)

### 1. Store Requirements

- [ ] **Account Deletion:** "Delete Account" button exists and functions (wipes DB + Auth).
- [ ] **Permissions:** `NSLocationWhenInUseUsageDescription` in Info.plist explains "Why" clearly.
- [ ] **Google Play Signing:** Added Google Play Console's SHA-1 fingerprint to Google Cloud OAuth.

### 2. Logic & Session Hygiene

- [ ] **Logout Cleanup:** Wipes FCM Token from Supabase on logout to prevent data leaks to shared devices.
- [ ] **RLS Audit:** Verified `anon` key cannot write/delete data; only `authenticated` users can.

### 3. Production Config

- [ ] **Supabase URL:** Pointing to Prod instance (not local/staging).
- [ ] **Error Boundaries:** App doesn't crash to home screen on API errors; shows a "Retry" UI instead.
