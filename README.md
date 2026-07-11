# Personal Finance Tracker System Documentation

Welcome to the central documentation index for the **Personal Finance Tracker** codebase. This directory contains a highly detailed breakdown of the application's architecture, security protocols, database schemas, and state mechanisms.

---

## 📚 Documentation Index

To explore specific sections of the application, click on the corresponding documentation link below:

| Document | Description |
| :--- | :--- |
| **[Project Overview](./PROJECT_OVERVIEW.md)** | Application purpose, scope, main functional modules, and current operational status. |
| **[System Architecture](./ARCHITECTURE.md)** | System design patterns, comprehensive folder layouts, and component-to-cloud data flow loops. |
| **[Application Features](./FEATURES.md)** | Breakdown of all user features (Dashboard, Incomes/Expenses registers, Category Manager, Settings, etc.). |
| **[Navigation & Routing](./ROUTES.md)** | Routing structure, view-state managers, and public vs. protected route criteria. |
| **[Authentication Architecture](./AUTHENTICATION.md)** | Authentication logic, Google OAuth integration, session life cycles, and developer error recovery setups. |
| **[Database Schema & Security](./DATABASE.md)** | Firestore structures, sub-collection models, and deployed security rules definitions. |
| **[State Management](./STATE_MANAGEMENT.md)** | React state stores, dynamic snapshot listeners, and render optimization strategies. |
| **[API & Data Fetching](./API.md)** | Internal controller APIs, Firebase proxying, and diagnostic error interceptors. |
| **[UI Component Directory](./COMPONENTS.md)** | Visual design guides, component specifications, props mapping, and component nesting. |
| **[Project Dependencies](./DEPENDENCIES.md)** | Full inventory of runtime and build dependencies with their technical roles. |
| **[Security & Sandbox Review](./SECURITY.md)** | Zero-trust authentication checks, sandbox integrations, and safe image fetch guidelines. |
| **[Code Quality Review](./CODE_REVIEW.md)** | Objective code quality evaluation, strengths, and concrete recommendations for scaling. |

---

## 🛠️ Technology Stack Summary

* **Frontend Framework**: React 18, Vite (Fast Bundler)
* **Design & Layout**: Tailwind CSS (Utility-First), Lucide React (Icons)
* **Data Visualization**: Recharts (D3-powered responsive charts)
* **Animation & Transitions**: motion/react (Framer Motion)
* **Backend Infrastructure**: Google Cloud Firebase (Auth & Firestore)
* **Development Language**: TypeScript (Strict Typings)
