<div align="center">
  <h1>🏃 LifeTracker</h1>
  <p><strong>Track expenses & daily habits — clean, minimal, self-hosted</strong></p>

  <p>
    <img src="https://img.shields.io/badge/java-17-%23ED8B00?logo=java" alt="Java 17">
    <img src="https://img.shields.io/badge/spring%20boot-3.2-%236DB33F?logo=springboot" alt="Spring Boot 3.2">
    <img src="https://img.shields.io/badge/react-18-%2361DAFB?logo=react" alt="React 18">
    <img src="https://img.shields.io/badge/vite-5-%23646CFF?logo=vite" alt="Vite 5">
    <img src="https://img.shields.io/badge/postgresql-16-%234169E1?logo=postgresql" alt="PostgreSQL 16">
    <img src="https://img.shields.io/badge/docker-ready-%232496ED?logo=docker" alt="Docker Ready">
  </p>
</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started (Local)](#-getting-started-local)
- [Docker Deployment (One Command)](#-docker-deployment-one-command)
- [API Endpoints](#-api-endpoints)
- [Environment Variables](#-environment-variables)
- [Production Build](#-production-build)
- [Cloud Deployment](#-cloud-deployment)
- [Screenshots](#-screenshots)

---

## ✨ Features

### 📊 Dashboard
| Widget | Description |
|--------|-------------|
| **Monthly Spend** | Total expenses this month with transaction count |
| **Active Habits** | Number of habits being tracked |
| **Categories Used** | Expense categories with spending |
| **Pie Chart** | Expense breakdown by category (Recharts) |
| **Today's Habits** | Quick status with streak counts |

### 💰 Expenses
| Feature | Details |
|---------|---------|
| **CRUD** | Create, edit, delete expenses with validations |
| **Filters** | Date range picker + category dropdown |
| **Pie Chart** | Monthly spending by category |
| **Progress Bars** | Per-category spending with percentage |
| **Running Total** | "Showing X expenses — Total: $Y" |
| **CSV Export** | Download filtered data as CSV |
| **Toast Alerts** | Success/error feedback on all actions |

### 🔥 Habits
| Feature | Details |
|---------|---------|
| **CRUD** | Create, rename, delete habits |
| **7-Day Grid** | Visual log — tap to toggle |
| **Streak Tracking** | Current + longest streak per habit |
| **Total Completions** | Lifetime completion count |
| **Weekly Summary Chart** | Bar chart — completions per day (last 4 weeks) |
| **Progress Bars** | Per-day completion percentage |

### 🎨 UI/UX
- **Minimal theme** — monochrome palette, generous whitespace, thin borders
- **Dark mode** 🌙 — toggle in sidebar, persists to localStorage, system preference detection
- **Responsive** — collapsible sidebar with hamburger menu on mobile
- **Page transitions** — Framer Motion fade/slide/scale between routes
- **Loading skeletons** — shimmer placeholders for all data states
- **Error handling** — inline banners with retry + dismiss
- **Confirmation dialogs** — custom modal replaces browser prompts

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Browser (:80)                        │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                    Frontend                              │
│         Nginx Alpine (static files + SPA routing)        │
│                                                          │
│  /api/* ──────► proxy to backend:8080                    │
│  /* ─────────► serve index.html (React SPA)             │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                    Backend                                │
│         Spring Boot 3.2 / Java 17                        │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐               │
│  │Controller│→ │ Service  │→ │Repository│               │
│  └──────────┘  └──────────┘  └──────────┘               │
│       │              │             │                     │
│  ┌────▼────┐   ┌────▼────┐   ┌────▼────┐                │
│  │   JWT   │   │ Streak  │   │ JPA/HQL │                │
│  │  Auth   │   │ Engine  │   │ Queries │                │
│  └─────────┘   └─────────┘   └─────────┘                │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                    Database                               │
│         PostgreSQL 16 (production)                       │
│         H2 in-memory (development)                       │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐               │
│  │   users  │  │categories│  │ expenses │               │
│  └──────────┘  └──────────┘  └──────────┘               │
│  ┌──────────┐  ┌──────────┐                              │
│  │  habits  │  │habit_logs│                              │
│  └──────────┘  └──────────┘                              │
└──────────────────────────────────────────────────────────┘
```

### Data Flow

```
User Action → React → Axios (JWT) → Nginx → Spring Boot → JPA → PostgreSQL
                                                                    │
User ← React ← JSON Response ← Spring Boot ← Service Layer ←───────┘
```

### Auth Flow

```
Login → POST /api/auth/login → JWT generated (256-bit HMAC, 24h expiry)
                                │
         Every request ───► Bearer token in Authorization header
                                │
         JwtAuthenticationFilter validates → SecurityContext set
```

### Streak Logic 🔥

```
1. Query all habit_logs ordered by date descending
2. Build set of completed dates
3. Current streak: count consecutive days backward from most recent
   (only if last completion was today or yesterday)
4. Longest streak: scan all dates, track longest consecutive run
```

---

## 🛠 Tech Stack

### Backend

| Technology | Purpose |
|------------|---------|
| **Java 17** | Language |
| **Spring Boot 3.2.5** | Web framework, DI, validation |
| **Spring Security + JWT** | Authentication with 256-bit HMAC |
| **Spring Data JPA** | Database ORM |
| **H2** | Dev database (in-memory) |
| **PostgreSQL** | Production database |
| **Lombok** | Boilerplate reduction |
| **Maven** | Build & dependency management |

### Frontend

| Technology | Purpose |
|------------|---------|
| **React 18 + TypeScript** | UI framework |
| **Vite 5** | Build tool & dev server |
| **Tailwind CSS 3** | Utility-first styling |
| **Axios** | HTTP client with JWT interceptor |
| **React Router v6** | Client-side routing |
| **Recharts** | Charts (pie + bar) |
| **Framer Motion** | Page transitions |
| **Lucide React** | Icons |
| **date-fns** | Date formatting & arithmetic |

### Infrastructure

| Tool | Purpose |
|------|---------|
| **Docker** | Containerization |
| **Docker Compose** | Multi-service orchestration |
| **Nginx** | Frontend serving + reverse proxy |

---

## 📁 Project Structure

```
lifetracker/
├── backend/
│   ├── Dockerfile                    # Multi-stage: Maven build → JRE runtime
│   ├── pom.xml                       # Maven config (Spring Boot 3.2, JPA, Security, JWT)
│   └── src/main/java/com/lifetracker/
│       ├── LifeTrackerApplication.java
│       ├── config/
│       │   ├── SecurityConfig.java       # Stateless JWT, CORS, BCrypt
│       │   ├── SecurityUtil.java         # Extract user ID from SecurityContext
│       │   ├── GlobalExceptionHandler.java
│       │   └── DataInitializer.java      # Seeds demo user + categories
│       ├── security/
│       │   ├── JwtTokenProvider.java     # 256-bit HMAC, 24h JWT
│       │   ├── JwtAuthenticationFilter.java
│       │   └── CustomUserDetailsService.java
│       ├── entity/
│       │   ├── User.java                # username, email, passwordHash
│       │   ├── Category.java            # name, type (EXPENSE|HABIT)
│       │   ├── Expense.java             # amount, description, date
│       │   ├── Habit.java               # name, frequency, createdAt
│       │   └── HabitLog.java            # habit+date unique, completed flag
│       ├── repository/                  # Spring Data JPA repositories
│       ├── dto/                         # Request/response DTOs
│       ├── service/                     # Business logic + streak engine
│       └── controller/                  # REST controllers
│
├── frontend/
│   ├── Dockerfile                    # Multi-stage: Node build → Nginx serve
│   ├── nginx.conf                    # SPA routing + /api proxy
│   ├── vite.config.ts                # Dev proxy to localhost:8080
│   ├── tailwind.config.js
│   └── src/
│       ├── main.tsx                  # Entry point
│       ├── App.tsx                   # Routes + auth guards + toast + theme
│       ├── index.css                 # Tailwind + design system tokens
│       ├── components/
│       │   ├── Sidebar.tsx           # Nav + dark mode toggle + mobile hamburger
│       │   ├── LoadingState.tsx      # 5 skeleton variants
│       │   ├── ErrorState.tsx        # Error banner + full-page error
│       │   ├── ConfirmDialog.tsx     # Keyboard-accessible modal
│       │   └── PageTransition.tsx    # Framer Motion wrappers
│       ├── pages/
│       │   ├── LandingPage.tsx       # Marketing page with scroll animations
│       │   ├── LoginPage.tsx
│       │   ├── RegisterPage.tsx
│       │   ├── DashboardPage.tsx     # Summary cards + pie chart + today's habits
│       │   ├── ExpensesPage.tsx      # CRUD + filters + pie chart + CSV export
│       │   └── HabitsPage.tsx        # CRUD + 7-day grid + bar chart
│       └── lib/
│           ├── api.ts                # Axios instance + JWT interceptor
│           ├── auth.ts               # localStorage helpers
│           ├── useToast.tsx          # Toast context (auto-dismiss 3.5s)
│           └── useTheme.tsx          # Dark mode hook + system pref detection
│
├── docker-compose.yml              # PostgreSQL + backend + frontend
├── .env.example                    # All env vars documented
├── .dockerignore
└── .gitignore
```

---

## 🚀 Getting Started (Local)

### Prerequisites
- **Java 17+** and **Maven** (for backend)
- **Node.js 18+** and **npm** (for frontend)

### 1. Clone
```bash
git clone https://github.com/nakulsharma97/lifetrackerr.git
cd lifetrackerr
```

### 2. Start Backend
```bash
cd backend
mvn spring-boot:run
```
- Runs on **http://localhost:8080**
- Uses H2 in-memory database (resets on restart)
- Demo user auto-seeded

### 3. Start Frontend
```bash
cd frontend
npm install
npm run dev
```
- Runs on **http://localhost:5173**
- API calls proxied to `localhost:8080`

### 4. Open in browser
Visit **http://localhost:5173** → Log in with **`demo` / `demo123`**

---

## 🐳 Docker Deployment (One Command)

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Start everything
```bash
docker compose up -d
```

| Service | Port | URL |
|---------|------|-----|
| **Frontend** (Nginx) | `80` | http://localhost |
| **Backend** (Spring Boot) | `8080` | http://localhost:8080 |
| **PostgreSQL 16** | `5432` | internal |

Login with **`demo` / `demo123`** (auto-seeded on first run).

### Customize env vars
```bash
DB_PASSWORD=mysecurepass \
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))") \
docker compose up -d
```

### Stop
```bash
docker compose down
```

### Reset database
```bash
docker compose down -v
docker compose up -d
```

### Build images manually
```bash
docker compose build --no-cache
docker compose up -d
```

---

## 📡 API Endpoints

All endpoints except `/api/auth/*`, `/api/health`, and `/api/version` require:
```
Authorization: Bearer <jwt_token>
```

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Create account (`username`, `email`, `password`) |
| `POST` | `/api/auth/login` | Get JWT token (`username`, `password`) |

### System
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check → `{ status, timestamp, service }` |
| `GET` | `/api/version` | Version info → `{ version, springBootVersion, ... }` |

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/categories?type=EXPENSE\|HABIT` | List categories by type |

### Expenses
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/expenses` | List (filter: `from`, `to`, `categoryId`) |
| `POST` | `/api/expenses` | Create (`amount`, `description`, `date`, `categoryId`) |
| `PUT` | `/api/expenses/{id}` | Update |
| `DELETE` | `/api/expenses/{id}` | Delete |
| `GET` | `/api/expenses/summary` | Monthly summary with breakdown |

### Habits
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/habits` | List all habits with recent logs + streaks |
| `POST` | `/api/habits` | Create (`name`, `frequency?`) |
| `PUT` | `/api/habits/{id}` | Update (`name`) |
| `DELETE` | `/api/habits/{id}` | Delete |
| `POST` | `/api/habits/{id}/log` | Log completion (`date?`, `completed?`) |
| `GET` | `/api/habits/streaks` | Get all streak data |
| `GET` | `/api/habits/weekly-summary?weeks=4` | Weekly completion summary |

---

## 🔐 Environment Variables

### Frontend (set at build time)
| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `/api` | Backend API URL (set for production builds) |

### Backend (set at runtime)
| Variable | Default | Description |
|----------|---------|-------------|
| `SPRING_PROFILES_ACTIVE` | — | Set to `prod` for PostgreSQL |
| `DATABASE_URL` | `jdbc:postgresql://localhost:5432/lifetracker` | PostgreSQL connection |
| `DATABASE_USERNAME` | `lifetracker` | DB user |
| `DATABASE_PASSWORD` | `changeme` | DB password |
| `JWT_SECRET` | *generated default* | 256-bit key in Base64 |
| `PORT` | `8080` | Server port |

### Generate your own JWT secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 📦 Production Build

### Backend JAR
```bash
cd backend
mvn package -DskipTests
java -jar target/lifetracker-backend-*.jar --spring.profiles.active=prod
```

### Frontend static build
```bash
cd frontend
VITE_API_URL=https://your-api.com npm run build
# output: frontend/dist/ — deploy to any static host
```

---

## ☁️ Cloud Deployment

| Service | What to deploy | Notes |
|---------|----------------|-------|
| **Railway** / **Render** / **Fly.io** | Backend JAR (`backend/target/*.jar`) | Set env vars + PostgreSQL addon |
| **Vercel** / **Netlify** | Frontend (`frontend/dist/`) | Set `VITE_API_URL` build env |

---

## 🖼️ Screenshots

### Landing Page
```
Hero with tagline → Features grid → CTA section
```

### Dashboard
```
┌─────────┬──────────┬──────────┐
│  Spend  │  Habits  │  Cats    │
├─────────┴──────────┴──────────┤
│   Today's Habits              │
├───────────────────────────────┤
│   Expense Pie Chart           │
│   (donut + category list)     │
└───────────────────────────────┘
```

### Expenses Page
```
┌─────────────────────────────────┐
│  Filters: [From] [To] [Cat] ↺  │
├────────────────┬────────────────┤
│  Pie Chart     │  Breakdown     │
│  (donut)       │  progress bars │
├────────────────┴────────────────┤
│  Running total bar              │
├─────────────────────────────────┤
│  Table: Date | Cat | Desc | Amt │
│  [+ Add] [Edit] [Delete]        │
└─────────────────────────────────┘
```

### Habits Page
```
┌─────────────────────────────────┐
│  Weekly Summary Bar Chart       │
│  + day-by-day progress bars     │
├─────────────────────────────────┤
│  Habit Card  ─────────────────  │
│  Name 🔥5 ✓12          ✏️ 🗑️   │
│  [M][T][W][T][F][S][S]          │
├─────────────────────────────────┤
│  Habit Card  ─────────────────  │
│  ...                            │
└─────────────────────────────────┘
```

---

## 📄 License

MIT — free to use, modify, and distribute.

---

<p align="center">
  Built with ❤️ using Spring Boot + React<br>
  <a href="https://github.com/nakulsharma97/lifetrackerr">GitHub</a>
</p>
