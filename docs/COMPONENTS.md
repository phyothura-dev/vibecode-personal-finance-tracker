# UI Component Directory: Personal Finance Tracker

This document catalogs and details the React UI components, the layout grid, design language, and styling conventions powering the application.

---

## 🎨 Visual Identity & Style Guide

The visual theme is **Swiss-Modern**—minimalist, high-contrast, and focused on clean typography, generous padding, and subtle shadows.

* **Primary Background**: Light off-white (`#F8FAFC`).
* **Accent Color**: Indigo Blue (`#4F46E5`).
* **Text Tone**: Primary Charcoal (`#111827`), secondary Slate Gray (`#6B7280`).
* **Typography**:
  * **Headings**: Inter / System-Sans, medium-weight with tracking-tight.
  * **Monospace data metrics**: JetBrains Mono for transaction values, dates, and currency outputs.
* **Component Containers**: Defined by rounded-xl boundaries and borders (`border-slate-200`) rather than deep gradients.

---

## 📐 Layout Grid & Component Nesting

The application structure is modular and fits into a single, cohesive view-container:

```text
┌────────────────────────────────────────────────────────┐
│                        App.tsx                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │                    Header.tsx                    │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌───────────────┐ ┌────────────────────────────────┐  │
│  │  Sidebar.tsx  │ │         Active Tab Component   │  │
│  │               │ │ • Dashboard.tsx                │  │
│  │  • Nav Links  │ │ • IncomeManager.tsx            │  │
│  │  • App Brand  │ │ • ExpenseManager.tsx           │  │
│  │               │ │ • CategoryManager.tsx          │  │
│  │  • Sign Out   │ │ • ProfileManager.tsx           │  │
│  └───────────────┘ └────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

---

## 📂 Component Directory

### 1. `Auth.tsx`
* **Purpose**: Displays sign-in, registration, and reset views. Contains Google Sign-In triggers.
* **Interface Props**:
  * `onShowToast`: Handles dynamic event notifications.
* **Special Treatment**: Renders an alert box if the developer hasn't enabled Email/Password sign-ins in the Firebase Console.

### 2. `Header.tsx`
* **Purpose**: Global app bar showing current user display names, custom avatar configurations, mobile menu triggers, and direct Sign Out buttons.
* **Interface Props**:
  * `profile`: `UserProfile | null`
  * `onLogout`: Action to sign out.
  * `onToggleSidebar`: For mobile views.
  * `onChangeTab`: Action link to switch tabs.

### 3. `Sidebar.tsx`
* **Purpose**: Primary desktop navigation rail.
* **Interface Props**:
  * `activeTab`: `string`
  * `onChangeTab`: Set active view.
  * `onLogout`: Quick logout action.

### 4. `Dashboard.tsx`
* **Purpose**: Primary analytics dashboard. Uses Recharts to visualize spending and income trends over the last 6 months.
* **Interface Props**:
  * `incomes`: `Income[]`
  * `expenses`: `Expense[]`
  * `profile`: `UserProfile | null`
  * `onChangeTab`: Used to redirect from card shortcuts.

### 5. `IncomeManager.tsx`
* **Purpose**: Interactive ledger to record earnings. Sells addition form inputs, prefilled edit cards, and delete controls.
* **Interface Props**:
  * `incomes`: `Income[]`
  * `categories`: `Category[]`
  * `profile`: `UserProfile | null`
  * `onAdd`: Add-income dispatch.
  * `onEdit`: Edit-income dispatch.
  * `onDelete`: Delete-income dispatch.
  * `onShowToast`: Notification triggers.

### 6. `ExpenseManager.tsx`
* **Purpose**: Interactive ledger to record expenditures. Fits identically to the structure of `IncomeManager`.
* **Interface Props**: Same structure as `IncomeManager`.

### 7. `CategoryManager.tsx`
* **Purpose**: Customize categorizations.
* **Interface Props**:
  * `categories`: `Category[]`
  * `onAddCategory`: Add category dispatch.
  * `onRenameCategory`: Rename category dispatch.
  * `onDeleteCategory`: Delete category dispatch.
  * `onShowToast`: Notification triggers.

### 8. `TransactionHistory.tsx`
* **Purpose**: Global transactions grid. Integrates date search, dynamic keyword inputs, and type filters.
* **Interface Props**:
  * `incomes`: `Income[]`
  * `expenses`: `Expense[]`
  * `profile`: `UserProfile | null`

### 9. `ProfileManager.tsx`
* **Purpose**: Edit settings (Display name, custom avatar urls, default currency systems, monthly goals).
* **Interface Props**:
  * `profile`: `UserProfile | null`
  * `onUpdate`: Update profile settings dispatch.
  * `onShowToast`: Notification triggers.

### 10. `Toast.tsx`
* **Purpose**: Dynamic overlay feedback window.
* **Interface Props**:
  * `message`: `string`
  * `type`: `'success' | 'error'`
  * `onClose`: Automatic timeout dismiss callback.
