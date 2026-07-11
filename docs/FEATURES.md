# Application Features: Personal Finance Tracker

This document presents a detailed breakdown of all user-facing and system features currently implemented in the Personal Finance Tracker application.

---

## 🔐 1. Authentication & Onboarding

### Purpose
To secure user data by isolating individual records and providing personalized sessions.

### Implemented Capabilities
* **Dual Providers**: 
  * **Email & Password**: Supports traditional credentials.
  * **Google OAuth**: Fast login via Firebase's `signInWithPopup`.
* **Flow States**: Covers Sign In, Registration (Sign Up), and a Password Reset flow.
* **Onboarding Setup**: Upon registering, the system automatically creates a profile record in `users/{userId}` and seeds baseline default categories:
  * **Incomes**: *Salary, Freelance, Bonus*
  * **Expenses**: *Food, Transport, Shopping, Bills, Entertainment*
* **Developer Onboarding Warn System**: If the developer hasn't enabled Email/Password providers in their Firebase Console, the system catches the `auth/operation-not-allowed` error code and mounts an instructions panel directing how to activate it in the Firebase dashboard.

### Related Modules
* `src/components/Auth.tsx`
* `src/App.tsx`
* `src/lib/firebase.ts`

---

## 📊 2. Dynamic Performance Dashboard

### Purpose
To aggregate data instantly, offering real-time KPIs and interactive visualizations.

### Implemented Capabilities
* **Financial Metric Cards**:
  * **Total Balance**: Income minus expenses. Color-coded (indigo for positive, red for deficit).
  * **Total Income**: Aggregated earnings, with an "Add Income" shortcut.
  * **Total Expenses**: Aggregated spending, with an "Add Expense" shortcut.
* **Monthly Income Goal Progress Tracker**:
  * Visually displays progress against a user-defined monthly income target.
  * Includes a circular/semi-circular SVG indicator or colored progress bar illustrating completion percentages.
* **Recharts Trend Analysis**:
  * **Last 6 Months Income vs. Expense (Bar Chart)**: Dual-colored bar charts showing financial flow over time.
  * **Category Distribution (Pie Chart)**: Segmented circle indicating where funds are spent (e.g., Food, Bills), with a customized hovering hover tool.
* **Recent Activities Log**: Quick overview list of the five most recent transactions.

### Related Modules
* `src/components/Dashboard.tsx`
* `src/components/Sidebar.tsx`

---

## 💰 3. Income & Expense Manager

### Purpose
To provide structured interfaces for logging and auditing transactions.

### Implemented Capabilities
* **Full CRUD Operations**:
  * **Add**: Modal or inline form allowing entry of Amount, Date, Category (sourced from the custom category state), and Description.
  * **Edit**: Prefills existing parameters for direct corrections.
  * **Delete**: Removes items with immediate background metric updates.
* **Visual Validation**: Red highlights on fields with incorrect types (e.g., negative numbers, empty titles).

### Related Modules
* `src/components/IncomeManager.tsx`
* `src/components/ExpenseManager.tsx`

---

## 🏷️ 4. Custom Category Engine

### Purpose
To classify transactions to enable rich chart filtering and budget analysis.

### Implemented Capabilities
* **Segmented Tabs**: Separate controls for Income categories and Expense categories.
* **Custom Addition**: Users can create unique tags (e.g., "Gym Membership").
* **Inline Renaming**: Double-click or click-to-edit inline inputs to modify titles.
* **Safety Rules**: Prevents deletion of categories currently referenced by active transactions, or alerts users to secure integrity.

### Related Modules
* `src/components/CategoryManager.tsx`

---

## 🔍 5. Global Transaction History Ledger

### Purpose
To serve as a central searchable repository of all transaction records across all dates.

### Implemented Capabilities
* **Comprehensive Combined List**: Merges and sorts incomes and expenses into a single unified grid.
* **Filter Options**: Filter by Transaction Type (All, Incomes, Expenses), Category, or custom Date Ranges.
* **Fuzzy Text Search**: Real-time filtering as you type, matching descriptions or amounts.

### Related Modules
* `src/components/TransactionHistory.tsx`

---

## ⚙️ 6. Personal Settings & Localization

### Purpose
To customize the application's appearance, currency, and goals.

### Implemented Capabilities
* **Profile Settings**:
  * **Display Name**: Update user name.
  * **Custom Avatar Picker**: Select from stylized preset initials or input a custom photo URL.
  * **Currency Systems**: Toggle default symbols:
    * `$` (USD)
    * `€` (EUR)
    * `£` (GBP)
    * `¥` (JPY)
  * **Monthly Income Goal**: Numeric target for earnings used on the dashboard gauges.

### Related Modules
* `src/components/ProfileManager.tsx`
* `src/components/Header.tsx`
