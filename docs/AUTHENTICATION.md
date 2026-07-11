# Authentication Architecture: Personal Finance Tracker

This document explains the security mechanics, session life cycles, OAuth configuration, and user isolation protocols implemented in the Personal Finance Tracker.

---

## 🔐 Identity Platform Integration

The application leverages **Firebase Authentication** as its primary Identity Provider. This provides industry-standard security out of the box, including encrypted password hashing, automatic secure token rotations, and session state persistence.

---

## 🔄 Authentication Flows

```
                   ┌──────────────────────────────────────┐
                   │           Authentication UI          │
                   └───────┬──────────────────────┬───────┘
                           │                      │
                  User selects method     User selects method
                           │                      │
                           ▼                      ▼
                ┌─────────────────────┐┌─────────────────────┐
                │   Email/Password    ││    Google Sign-In    │
                └──────────┬──────────┘└──────────┬──────────┘
                           │                      │
                    Sends Credentials        Launches Popup
                           │                      │
                           ▼                      ▼
                ┌────────────────────────────────────────────┐
                │             Firebase Auth SDK              │
                │        (Token verification / OAuth)        │
                └──────────────────────┬─────────────────────┘
                                       │
                               Session Created
                                       ▼
                ┌────────────────────────────────────────────┐
                │         App.tsx AuthStateObserver          │
                │     • Fetches/Creates Profile Doc          │
                │     • Auto-seeds Default Categories        │
                │     • Unlocks DB listeners                 │
                └────────────────────────────────────────────┘
```

### 1. Traditional Email & Password Flow
* **Registration**: Users submit full name, email, password, and preferred currency. If registration succeeds, a corresponding profile document is created in Firestore.
* **Sign In**: Credentials are sent directly to Firebase servers.
* **Password Recovery**: Users can request password reset links via email.

### 2. Federated Google OAuth Flow
* Implemented via standard browser popups using `signInWithPopup(auth, new GoogleAuthProvider())`.
* Provides a frictionless, secure login experience.
* Session creation initiates a check in Firestore; if the user document under `/users/{uid}` does not exist, a profile is auto-created using the user's Google photo and displayName, alongside auto-seeded category folders.

---

## 🛠️ Diagnostics & Operation Error Recovery

Because the workspace can run under arbitrary or freshly cloned Firebase environments, the application includes a **fault-tolerant developer safety net**:

If the Firebase project has not enabled the **Email/Password** provider in the Authentication tab, the Firebase SDK rejects sign-in/sign-up requests with the code:
`auth/operation-not-allowed`

The application catches this exception and:
1. Keeps the page active instead of locking up.
2. Changes the state of `operationNotAllowedError` to `true`.
3. Renders a prominent, styling-consistent **Configuration Action Required** box.
4. Explains the exact reason and provides direct steps and console links:
   * **Location**: *Firebase Console > Build > Authentication > Sign-in method*.
   * **Action**: *Click "Add new provider" > Select "Email/Password" > Check "Enable" > Save*.

This prevents developer friction and guarantees rapid environment diagnostics.

---

## 📦 Session Handling

* **State Persistence**: Sessions are automatically persisted client-side using the browser's IndexedDB / Local Storage layers, managed internally by the Firebase Web SDK.
* **OnBoot Verification**: On page load, the application displays a loading splash while checking for cached tokens.
* **Auth Observer**: The listener `onAuthStateChanged` listens to token adjustments:
  * Upon valid token discovery, it updates the global state: `setUser(currentUser)`.
  * If the session expires or the user signs out, it resets the local state: `setUser(null)`.
