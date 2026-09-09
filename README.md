# SmartCare-TN: Offline-First Rural Healthcare & Triage PWA

SmartCare-TN is an offline-first Progressive Web Application (PWA) engineered to maintain continuous emergency medical access, facility discovery, and clinical triage in rural environments with constrained, intermittent, or zero-bandwidth (2G/offline) connectivity.

Built for deployment in public healthcare ecosystems (such as Tamil Nadu Primary Healthcare Networks), the system operates entirely client-side when disconnected, syncing back to state health registries upon network restoration.

---

## 🚀 Key Features

* **Zero-Bandwidth Resilience:** Functions fully on 0 kbps cellular connections with an ultra-lean core shell bundle (<600 KB) and strict memory capping (<30 MB) suited for entry-level mobile devices.
* **Offline Facility & Emergency Discovery:** Localized directory caching via IndexedDB and CacheStorage, storing regional health centers, emergency contact numbers, and equipment capabilities.
* **Client-Side Proximity Routing:** Employs the mathematical Haversine formula directly against raw device GPS coordinates to calculate distances and sort facilities without calling third-party map APIs.
* **Service Worker Asset Caching:** Configured with Workbox via `vite-plugin-pwa` for deterministic caching, precaching core bundles and guarding API routes from fallback interference.
* **Background Data Synchronization:** Queues local modifications and syncs updates with ABDM / e-Aushadhi standards when connectivity is re-established.
* **Intelligent Resource Allocation (Backend Modules):** Employs Google OR-Tools for optimal patient-to-bed load distribution and Meta Prophet for epidemiological time-series surge forecasting.

---

## 🛠 Tech Stack

* **Frontend:** React 18, TypeScript, Tailwind CSS, Vite
* **PWA & Storage:** `vite-plugin-pwa`, Workbox, IndexedDB API, CacheStorage API
* **Icons & UI:** Lucide React
* **Operations & Forecasting Modules:** Python, Google OR-Tools, Meta Prophet

---

## 📂 Project Structure

```text
SIH-Smartcare/
├── public/                 # Static assets, PWA icons (192x192, 512x512)
├── src/
│   ├── assets/             # Vector icons and graphics
│   ├── components/         # Reusable triage, directory, and filter components
│   ├── services/           # IndexedDB handlers, sync logic, and GPS utilities
│   ├── App.tsx             # Root dashboard & navigation views
│   ├── main.tsx            # Entry point & PWA Service Worker bootstrap
│   └── index.css           # Tailwind base styles
├── index.html              # HTML entry shell
├── vite.config.ts          # Vite configuration + Workbox PWA caching rules
├── tsconfig.json           # TypeScript configuration
└── package.json            # Project dependencies and run scripts
