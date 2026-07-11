# Security Architecture & Rules: Personal Finance Tracker

This document presents a security review of the Personal Finance Tracker, detailing authentication safety, authorization rules, and potential security concerns.

---

## 🛡️ Database Authorization (`firestore.rules`)

The primary security layer is Cloud-enforced. Because clients talk directly to Firestore, **it is critical to verify user sessions on every request**.

Firestore checks the rules defined in `firestore.rules` before executing any query:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

### Security Benefits
* **Complete User Isolation**: A user with ID `userA` cannot read or write documents under the `/users/userB` path because `request.auth.uid` would fail to match `userB`.
* **Zero-Trust Cascading Rules**: The recursive wild card `/{document=**}` applies this rule to all sub-collections, securing categories, incomes, and expenses automatically.

---

## 🔑 Firebase API Key Isolation

A common concern in serverless architectures is placing Firebase API keys inside client-side bundles (e.g. `firebase-applet-config.json` is packaged in the client code).

* **Is it safe?** Yes. In Firebase, the API key is not an admin credential. It simply identifies the Firebase project to the SDK.
* **Why it's secure**: The API key does not bypass the firestore rules. Even with the API key, an unauthorized attacker cannot query or modify user data because Firestore requires a valid user token from Firebase Auth, matching the `firestore.rules` restrictions.

---

## 🌐 Sandbox & Browser Security

1. **XSS Prevention**:
   * All dynamic text rendered in React (such as descriptions or display names) is automatically escaped by React's Virtual DOM, preventing Cross-Site Scripting (XSS) via HTML or script injections.
2. **Safe Image Referrals**:
   * External user images are fetched with `referrerPolicy="no-referrer"` on `<img>` nodes to maintain privacy when connecting to third-party CDNs (like Dicebear or Google avatars).

---

## 🔒 Potential Security Concerns & Mitigations

### 1. Inactive Session Caching
* **Issue**: The Firebase Auth SDK persists the session on the client device indefinitely by default. If a user logs into the app on a public computer, their session could remain open.
* **Mitigation**: Users should use the explicit **Logout** button. This calls `auth.signOut()`, clearing the token cache immediately.

### 2. Client-Side Input Manipulation
* **Issue**: Sophisticated attackers could manipulate input fields or values in local memory before writes occur.
* **Mitigation**: Adding type validations and restricting values to non-negative floats prior to dispatching transactions. Future rules can enforce schema formats on the server side using helper functions within `firestore.rules`.
