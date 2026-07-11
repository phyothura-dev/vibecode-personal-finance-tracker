# Database Schema & Security: Personal Finance Tracker

This document describes the database design, JSON-like document models, path structures, and authorization security rules governing Cloud Firestore.

---

## 🗄️ Database Technology

The application utilizes **Google Cloud Firestore**, a fully managed, serverless, NoSQL document database designed for real-time mobile and web application data synchronization.

---

## 🔧 DB Configuration & Initialization

Database endpoints are initialized in `src/lib/firebase.ts` by pulling settings dynamically from `firebase-applet-config.json`:

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import config from '../../firebase-applet-config.json';

const app = initializeApp(config);
export const auth = getAuth(app);
export const db = config.firestoreDatabaseId ? getFirestore(app, config.firestoreDatabaseId) : getFirestore(app);
```

---

## 📐 Data Models & Sub-Collections

Data is organized using an **owner-isolated root collection model**. Every document is nested under a unique user's root document (`users/{userId}`), preventing cross-tenant leakage.

```text
users/
└── {userId}                  <-- Document: User Profile Settings
    ├── categories/
    │   └── {categoryId}      <-- Document: Transaction category settings
    ├── incomes/
    │   └── {incomeId}        <-- Document: Income transactions
    └── expenses/
        └── {expenseId}       <-- Document: Expense transactions
```

### 1. User Profile Document
* **Collection Path**: `users/{userId}`
* **TypeScript Interface**: `UserProfile` in `src/types.ts`
* **Attributes**:
  * `fullName` (*string*): User's primary display name.
  * `photoURL` (*string*): Image link or Dicebear avatar path.
  * `currency` (*string*): Currency system used across views (`$`, `€`, `£`, `¥`).
  * `monthlyIncomeGoal` (*number | null*): Target earnings used for gauges.
  * `email` (*string*): Encoded email address.

### 2. Categories Sub-Collection
* **Collection Path**: `users/{userId}/categories`
* **TypeScript Interface**: `Category` in `src/types.ts`
* **Attributes**:
  * `name` (*string*): Custom display title (e.g. "Rent").
  * `type` (*string*): Category category, strictly `'income'` or `'expense'`.

### 3. Incomes Sub-Collection
* **Collection Path**: `users/{userId}/incomes`
* **TypeScript Interface**: `Income` in `src/types.ts`
* **Attributes**:
  * `amount` (*number*): Value of earnings. Must be positive.
  * `category` (*string*): Associated custom category ID.
  * `date` (*string*): Occurrence date (formatted as `YYYY-MM-DD`).
  * `description` (*string*): Detailed notes.
  * `createdAt` (*string*): Automatic ISO registration timestamp.

### 4. Expenses Sub-Collection
* **Collection Path**: `users/{userId}/expenses`
* **TypeScript Interface**: `Expense` in `src/types.ts`
* **Attributes**:
  * `amount` (*number*): Value of spending. Must be positive.
  * `category` (*string*): Associated custom category ID.
  * `date` (*string*): Occurrence date (formatted as `YYYY-MM-DD`).
  * `description` (*string*): Detailed notes.
  * `createdAt` (*string*): Automatic ISO registration timestamp.

---

## 🛡️ Firestore Security Rules (`firestore.rules`)

The system's integrity is protected at the cloud level via strict rules that enforce zero-trust security. Users are strictly forbidden from reading or writing data belonging to any other user.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Isolated User Rules
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Cascade authorization to all sub-collections
      match /{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

### Safety Features
* **Authentication Lock**: Queries fail instantly if the user header is null (`request.auth != null`).
* **ID Mapping Constraint**: Users can only request records if their authenticated identity matches the requested document path (`request.auth.uid == userId`).
