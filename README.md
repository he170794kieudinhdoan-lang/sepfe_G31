# Worklink - React Template

This is a modern React web application built with **Vite**, **Tailwind CSS**, and **React Router**. It follows a **Feature-Based Architecture** to ensure scalability and maintainability.

## 🚀 Tech Stack

- **Core:** React 19, Vite 7
- **Styling:** Tailwind CSS
- **State Management:** React Query (TanStack Query)
- **Forms:** React Hook Form + Zod Validation
- **Utilities:** Axios, Lucide React (Icons)

## 📂 Project Structure

The project follows a modular structure where code is organized by **features** rather than technical layers.

```
src/
├── assets/         # Static assets (images, fonts)
├── components/     # Shared generic UI components (Buttons, Inputs, etc.)
├── features/       # Feature-specific modules (Jobs, Auth, etc.)
│   └── jobs/
│       ├── components/  # Components specific to this feature
│       ├── hooks/       # Custom hooks for this feature
│       └── api/         # API calls for this feature
├── lib/            # Shared utilities and helpers (axios setups, cn helper)
├── shared/         # Shared layouts, constants, or types
├── app/            # App-wide setup (routes, providers)
├── App.jsx         # Root component
└── main.jsx        # Entry point
```

## 🛠️ Prerequisites

Ensure you have the following installed:

- **Node.js** (v18 or higher recommended)
- **pnpm** (preferred) or npm/yarn

## ⚙️ Installation & Setup

1.  **Clone the repository** (if not already done).

2.  **Install dependencies**:

    ```bash
    pnpm install
    # or
    npm install
    ```

3.  **Environment Configuration**:
    Copy the example environment file to create your local config:

    ```bash
    cp .env.example .env
    ```

    Update `.env` with your actual values if needed:
    - `VITE_API_URL`: URL of your backend API.
    - `VITE_APP_TITLE`: Title of the application.

## 🏃‍♂️ Running the Project

**Development Mode:**
Starts the local development server with Hot Module Replacement (HMR).

```bash
pnpm dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

**Production Build:**
Builds the app for production to the `dist` folder.

```bash
pnpm build
# or
npm run build
```

**Preview Production Build:**
Locally preview the production build.

```bash
pnpm preview
# or
npm run preview
```

## 🎨 Code Quality

- **Linting:** Run `pnpm lint` to check for code issues using ESLint.
- **Formatting:** A `.prettierrc` file is included for code formatting.

## 🤝 Contributing

1.  Create a feature branch (`git checkout -b feature/amazing-feature`).
2.  Commit your changes (`git commit -m 'Add some amazing feature'`).
3.  Push to the branch (`git push origin feature/amazing-feature`).
4.  Open a Pull Request.
