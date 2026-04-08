# Lyncis Security Platform - UI

This repository contains the `lyncis-ui` project, the web-based frontend for the Lyncis Security Platform.

The platform consists of three separate repositories (backend, agent, and UI). This UI provides a modern, lean, and professional command center for managing security agents and viewing system hardening reports.

## Technology Stack

- **Framework:** React + Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS (Custom Sci-Fi palette)
- **Routing:** React Router
- **API Client:** Axios

## Developer Setup

### 1. Prerequisites

- Node.js (v18 or newer recommended)
- npm

### 2. Installation

Clone the repository and install the dependencies:

```bash
npm install
```

### 3. Environment Variables

The application needs to know where the `lyncis-backend` is running. Copy the example environment file:

```bash
cp .env.example .env
```

Update the `.env` file if your backend is running on a different URL. By default, it expects the backend to expose its REST API at `http://localhost:3000/api/v1/ui`.

### 4. Running locally

Start the Vite development server:

```bash
npm run dev
```

### 5. Building for Production

To build and type-check the application for production deployment:

```bash
npm run build
```

## Related Repositories

- [lyncis-agent](https://github.com/marcelhaerle/lyncis-agent) — Go binary deployed on managed hosts
- [lyncis-backend](https://github.com/marcelhaerle/lyncis-backend) — Go API backend
