# Project Overview: Personal Finance Tracker

Welcome to the **Personal Finance Tracker** project documentation. This document provides a high-level overview of the application's purpose, scope, and implementation status.

---

## 🎯 Purpose of the Application

The **Personal Finance Tracker** is a secure, interactive, and visually polished full-stack personal finance manager. It is designed to help individuals take control of their financial health by tracking income and expenditures, organizing transactions through custom categories, monitoring monthly financial targets, and gaining visual insights into their cash flow.

It bridges the gap between simple ledger lists and complex accounting tools by providing an elegant, distraction-free dashboard that runs entirely in real-time, syncing data across sessions.

---

## ⚡ Main Functionality

The platform is fully implemented with the following key modules:

1. **Secure Onboarding & Authentication**:
   * Multi-mode auth interface supporting login, registration, and password recovery.
   * Dual-sign-in support (Secure Email/Password & Google OAuth).
   * Context-aware error handling that guides developers and users with diagnostic visual panels if standard auth providers are misconfigured in the Firebase console.

2. **Unified Analytics Dashboard**:
   * Real-time calculation of Total Income, Total Expenses, and Net Balance.
   * Bento-style summary widgets with color-coded safety indicators (e.g., green for positive position, rose for a deficit).
   * Interactive Recharts visualizations including a **Last 6 Months Income vs. Expense** bar chart and a **Category-based Spending Distribution** pie chart.
   * Fast, dynamic transaction feeds highlighting the five most recent activities.

3. **Income Ledger**:
   * Dynamic registers to record earnings with exact date picker, amount, descriptive notes, and custom categories.
   * Support for full CRUD operations (Create, Read, Update, Delete) with live database reactivity.

4. **Expense Ledger**:
   * Expense recording with category tags, notes, and strict validation.
   * Full CRUD support with instant balance reconciliation.

5. **Category Customization Engine**:
   * Segmented management of Income and Expense categories.
   * Custom category additions, standard renaming, and deletions.
   * Automatic seeding of baseline categories (e.g., *Salary, Food, Transport, Bills, Shopping, Entertainment*) for newly registered users.

6. **Interactive Profile & Goal Systems**:
   * Personalized metadata management (Display Name, custom user photo/initials).
   * Global currency localization switching between USD ($), EUR (€), GBP (£), and JPY (¥).
   * Monthly Income Goal tracking displaying dynamic progress gauges on the dashboard to visualize goal completion percentage.

---

## 📈 Current Implementation Status

The application is **fully operational, compiled, and production-ready**. 

* **Frontend**: Powered by **React 18** and **Vite**, utilizing **Tailwind CSS** for an elegant, high-contrast dashboard aesthetic (slate colors, generous negative space, crisp border treatments). Animations are smoothly managed via **motion/react**.
* **Backend & Persistence**: Implemented serverlessly via the client-side **Google Firebase Firestore** and **Firebase Authentication SDK**.
* **Schema Validation**: Explicit typescript interfaces defined in `src/types.ts` prevent runtime state corruption.
* **Security & Deployments**: Database operations are strictly governed by deployed JSON configurations and owner-isolated `firestore.rules`.
