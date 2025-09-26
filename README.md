# Hermetiq - Advanced Security Vulnerability Scanner

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

Hermetiq is a comprehensive web application security scanner that performs automated vulnerability assessments and provides detailed, actionable security reports. Built with modern web technologies, it offers real-time scanning capabilities with an intuitive dashboard interface.

## 🚀 Features

### Core Security Scanning
- **Automated Vulnerability Detection**: Comprehensive security scans that identify critical, high, medium, and low-severity vulnerabilities
- **Real-time Streaming**: Live vulnerability discovery with Server-Sent Events (SSE) for immediate feedback
- **Risk Assessment**: Intelligent risk scoring algorithm that evaluates overall security posture
- **Detailed Reporting**: Structured vulnerability reports with evidence, explanations, and remediation guidance

### Advanced Analytics
- **Severity Breakdown**: Visual representation of vulnerability distribution across severity levels
- **Risk Score Visualization**: Color-coded risk indicators with intuitive scoring system
- **Interactive Dashboards**: Beautiful, responsive dashboard with animated data updates
- **Progress Tracking**: Real-time progress indicators during security scans

### Developer Experience
- **Modern Tech Stack**: Built with Next.js 15, React 18, TypeScript, and Tailwind CSS
- **Component Library**: Customizable UI components built on shadcn/ui
- **Type Safety**: Full TypeScript coverage for reliable, maintainable code
- **Responsive Design**: Mobile-first design that works across all devices

### Integrations & APIs
- **GitHub Integration**: Scan repositories and analyze code security
- **Multiple API Support**: Configurable API keys for various security tools
- **Webhook Support**: Automated notifications and integrations
- **Database Integration**: PostgreSQL with Prisma ORM for data persistence

## 🏗️ Architecture

### Frontend (React/Next.js)
- **Framework**: Next.js 15 with App Router
- **UI Library**: shadcn/ui components with Tailwind CSS
- **State Management**: Zustand for client-side state
- **Routing**: TanStack Router for type-safe routing
- **Forms**: React Hook Form with Zod validation
- **Real-time**: Server-Sent Events for live updates

### Backend (FastAPI/Python)
- **Framework**: FastAPI for high-performance APIs
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk for user management
- **Security Tools**: Integration with multiple security scanning tools
- **Background Jobs**: Asynchronous task processing

### Infrastructure
- **Monorepo**: Turborepo with pnpm for efficient package management
- **Deployment**: Vercel-ready configuration
- **Database**: Neon PostgreSQL hosting
- **Storage**: Vercel Blob for file storage
- **Monitoring**: Sentry for error tracking, PostHog for analytics

## 📋 Prerequisites

- **Node.js** 18+ and **pnpm** 10.5.2+
- **Python** 3.11+ with **Poetry** for backend
- **PostgreSQL** database (local or cloud)
- **Git** for version control

## 🚀 Quick Start

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd hermetiq
pnpm install
```

### 2. Environment Setup

Copy environment files and configure:

```bash
# Frontend environment
cp frontend/.env.example frontend/.env.local

# Backend environment
cp backend/.env.example backend/.env

# Configure your API keys and database connection
```

### 3. Database Setup

```bash
# Run database migrations
pnpm migrate

# (Optional) Seed with sample data
pnpm db:seed
```

### 4. Development Server

```bash
# Start all services (frontend, backend, database)
pnpm dev
```

Visit `http://localhost:3000` to access the application.

## 📖 Usage

### Running Security Scans

1. **Navigate to Scan**: Go to the scan section in the dashboard
2. **Configure Target**: Enter the target URL or repository
3. **Start Scan**: Click "Start Security Audit"
4. **Monitor Progress**: Watch real-time progress and vulnerability discovery
5. **View Results**: Access detailed reports with risk scores and findings

### Managing API Keys

1. **Access Settings**: Navigate to Settings → API Keys
2. **Configure Integrations**: Add API keys for security tools
3. **Save Configuration**: Keys are encrypted and securely stored

### Viewing Reports

1. **Report Dashboard**: Access vulnerability reports from the main dashboard
2. **Detailed Analysis**: Click on individual findings for evidence and remediation
3. **Export Options**: Download reports in various formats
4. **Historical Data**: View scan history and trends

## 🛠️ Development

### Project Structure

```
hermetiq/
├── frontend/                 # Next.js React application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── routes/          # Page routes and layouts
│   │   ├── stores/          # Zustand state management
│   │   ├── lib/             # Utilities and helpers
│   │   └── trpc/            # API client configuration
├── backend/                  # FastAPI Python application
│   ├── app/
│   │   ├── api/             # API routes and endpoints
│   │   ├── core/            # Configuration and utilities
│   │   ├── integrations/    # External service integrations
│   │   └── models/          # Database models
├── packages/                 # Shared packages and configurations
│   ├── design-system/       # UI component library
│   ├── database/           # Database utilities and schemas
│   └── auth/               # Authentication utilities
```

### Key Scripts

```bash
# Development
pnpm dev              # Start all development servers
pnpm dev:frontend     # Start only frontend
pnpm dev:backend      # Start only backend

# Building
pnpm build           # Build all applications
pnpm build:frontend  # Build frontend only

# Testing
pnpm test            # Run all tests
pnpm test:frontend   # Run frontend tests

# Database
pnpm migrate         # Run database migrations
pnpm db:studio       # Open Prisma Studio

# Code Quality
pnpm lint           # Run linting
pnpm format         # Format code with Prettier
```
