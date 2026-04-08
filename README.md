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

## Docker Setup & Usage

This project includes a multi-stage `Dockerfile` that builds the static React application and serves it securely via Nginx. It supports **runtime environment injection**, meaning you can configure the backend API URL when starting the container without needing to rebuild the image.

### Building the Image

```bash
docker build -t lyncis-ui .
```

### Running the Container

Run the container and inject your backend URL using the `LYNCIS_API_BASE_URL` environment variable:

```bash
docker run -p 8080:80 \
  -e LYNCIS_API_BASE_URL=https://api.yourdomain.com/api/v1/ui \
  lyncis-ui
```

If `VITE_API_BASE_URL` is omitted, the application will default to `/api/v1/ui` (ideal if you are proxying paths on the same domain).

## Related Repositories

- [lyncis-agent](https://github.com/marcelhaerle/lyncis-agent) — Go binary deployed on managed hosts
- [lyncis-backend](https://github.com/marcelhaerle/lyncis-backend) — Go API backend
