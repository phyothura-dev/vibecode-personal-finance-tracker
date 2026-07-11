# API & Data Fetching Layer: Personal Finance Tracker

This document describes how the application communicates with external cloud services, processes mutations, and handles operational network failures.

---

## 🌐 External API Integrations

The Personal Finance Tracker relies entirely on **Serverless cloud connections** via the official Google Firebase client SDK, eliminating the need to maintain, deploy, or scale a custom intermediate server layer.

The client acts as its own API consumer, connecting over secure, encrypted WebSockets to Google's Firestore endpoint:
`https://firestore.googleapis.com`

Authentication processes, password evaluations, and Google OAuth flow redirections are similarly proxied directly to:
`https://identitytoolkit.googleapis.com`

---

## 💾 Internal Database API Functions

Database writes are coordinated in `src/App.tsx` through a clean set of async controller handlers. These abstract Firebase transactions from the user interface:

### 1. Incomes API Controller
* `handleAddIncome(data)`: Dispatches a write via `addDoc` to `users/{uid}/incomes`.
* `handleEditIncome(id, data)`: Modifies fields of a transaction document using `updateDoc`.
* `handleDeleteIncome(id)`: Removes a document using `deleteDoc`.

### 2. Expenses API Controller
* `handleAddExpense(data)`: Logs a document to `users/{uid}/expenses`.
* `handleEditExpense(id, data)`: Updates the transaction document.
* `handleDeleteExpense(id)`: Deletes the transaction document.

### 3. Categories API Controller
* `handleAddCategory(name, type)`: Generates a category document under `users/{uid}/categories` with an ID slug.
* `handleRenameCategory(id, name)`: Modifies the display title of a custom category.
* `handleDeleteCategory(id)`: Deletes the custom category.

### 4. Profiles API Controller
* `handleUpdateProfile(data)`: Mutates key-value values under `users/{uid}`.

---

## 🚨 Error Handling & Machine Diagnostics

All operations are wrapped in `try/catch` safety blocks. Unhandled exceptions are intercepted by a centralized reporter in `src/lib/firebase.ts` called `handleFirestoreError`.

This function converts raw exceptions into structured, JSON-stringified payloads containing:
1. Operational context (`CREATE`, `UPDATE`, `DELETE`, `LIST`, `GET`).
2. Document path information.
3. Diagnostic authentication variables (User ID, Provider ID list, Verified status).

```typescript
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
```

### 📶 Network Resilience & Caching
Firestore supports seamless **Offline Caching**. Under flaky network environments, the applet doesn't crash:
* Updates are written to a local browser cache.
* The local cache triggers UI updates instantly.
* When the network recovers, the SDK syncs the changes to the cloud backend.
