# Navigation & Routing: Personal Finance Tracker

This document explains how view states, protected content, and navigation flows are organized in the Personal Finance Tracker.

---

## 🧭 View-State Driven Routing

To maintain high performance and prevent unnecessary resource-heavy mounting cycles, the application utilizes a **View-State Routing** architecture managed in the main orchestrator (`src/App.tsx`). 

Rather than deploying a bulky external package like React Router, the active page is governed by the `activeTab` React state. This architecture is fast, has zero overhead, and works perfectly in sandboxed environments (such as iframes).

---

## 🔒 Route Classifications

The application divides views into two distinct states based on the presence of a valid Firebase session (`user`).

```text
               ┌───────────────────────┐
               │    App Engine Boot    │
               └───────────┬───────────┘
                           │
                 Is Auth Session Active?
                 ┌─────────┴─────────┐
              No │               Yes │
                 ▼                   ▼
      ┌──────────────────────┐  ┌──────────────────────┐
      │   PUBLIC VIEW STATE  │  │ PROTECTED VIEW STATE │
      │                      │  │                      │
      │ • Sign In            │  │ • Dashboard (Active) │
      │ • Sign Up            │  │ • Incomes           │
      │ • Forgot Password    │  │ • Expenses          │
      │                      │  │ • Category Config   │
      │                      │  │ • User Profile      │
      └──────────────────────┘  │ • Master Ledger     │
                                └──────────────────────┘
```

### 1. Public Views
Accessible only when no user is logged in (`user === null`). If an unauthenticated user loads the app, they are redirected here:
* **Sign In Screen**: Sells credentials and triggers Auth. Includes a Google login trigger.
* **Sign Up Screen**: For registering new accounts.
* **Forgot Password Screen**: Form to trigger password recovery emails.

### 2. Protected Views
Shed only when `user !== null`. Contains the primary application dashboard:
* **Dashboard** (`activeTab === 'dashboard'`): General metric bento-grid, charts, goal completion widget, and recent transactions.
* **Incomes** (`activeTab === 'incomes'`): Ledger to read/write/delete income transactions.
* **Expenses** (`activeTab === 'expenses'`): Ledger to read/write/delete expense transactions.
* **Categories** (`activeTab === 'categories'`): Section to customize categorization maps.
* **Profile** (`activeTab === 'profile'`): Admin settings for default currency, name, target monthly goal, and visual avatar.
* **All Transactions** (`activeTab === 'history'`): Master filter and search ledger.

---

## 🔄 Navigation Flow & Interactions

1. **AuthState Observer**: 
   * On initial boot, `onAuthStateChanged(auth, ...)` listens for an active session.
   * If found, the application fetches the associated user profile from `/users/{uid}` and populates the global store, transitioning `loading` to `false`.
2. **Sidebar Navigation**:
   * Located on the left (collapsible on mobile screens).
   * Changing a tab is handled via `setActiveTab(tabName)`.
3. **Internal Redirect Hooks**:
   * Dashboard metric cards include shortcut anchors (e.g. "Add Income" redirects the view state to `incomes` automatically).
4. **Session Termination**:
   * Clicking "Logout" in the Header triggers `auth.signOut()`. The reactive observer catches this change, clears the state, and flips the view instantly back to the public Authentication screen.
