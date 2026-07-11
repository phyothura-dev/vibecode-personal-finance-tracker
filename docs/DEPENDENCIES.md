# Project Dependencies: Personal Finance Tracker

This document catalogs and explains the third-party npm packages, libraries, and developer tools required to compile and run the Personal Finance Tracker.

---

## 🚀 Runtime Dependencies

The packages listed below are compiled into the production client bundle.

| Dependency Name | Rationale & Usage |
| :--- | :--- |
| **`react`** & **`react-dom`** | The UI component engine. Enables declarative component trees, hooks, and responsive DOM updates. |
| **`firebase`** | Google's serverless platform library. Sells Firestore database client hooks and Authentication/OAuth sessions. |
| **`recharts`** | Charting library built on D3. Sells modular, highly customizable `<ResponsiveContainer>`, `<BarChart>`, and `<PieChart>` visual widgets. |
| **`lucide-react`** | Sells lightweight, scalable, and responsive vector icons (e.g., DollarSign, Lock, Chrome, TrendingUp). |
| **`motion`** (imported from `motion/react`) | Framer Motion library. Animates route/tab transitions, modal pop-ups, list additions, and toast banners. |

---

## 🛠️ Developer Dependencies

These dependencies are used during development and compilation, but are omitted from the production client-side code to optimize bundle sizes.

| Dependency Name | Rationale & Usage |
| :--- | :--- |
| **`typescript`** | Enforces static type checking, preventing data structures mismatch. |
| **`vite`** | The build system. Sells extremely fast hot-module replacements (HMR) and compresses/bundles production static assets. |
| **`tailwindcss`** | Utility-first CSS generator. Generates atomic CSS classes directly based on source file references. |
| **`@types/react`** & **`@types/react-dom`** | TypeScript type definitions for the React library. |
| **`eslint`** | Validates syntax, enforces code quality guidelines, and flags potential security concerns. |

---

## 📦 Build Configurations

### Vite Pipeline (`vite.config.ts`)
Configured to serve content on port `3000` internally, outputting static bundles into the `/dist` directory for production deployment.

### TypeScript Config (`tsconfig.json`)
Compiles to modern ECMAScript standards (`ESNext`) with JSX configured for standard React rendering. Enforces rigorous type checking via `strict: true`.
