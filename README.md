# LifeTracker 🏃‍♂️💰

A full-stack personal tracking app for **expenses** and **daily habits** with a clean, minimal design.

![Tech Stack](https://img.shields.io/badge/stack-Spring%20Boot%203.2%20%7C%20React%2018%20%7C%20TypeScript-blue)

## ✨ Features

### 📊 Dashboard
- Summary cards: monthly spending, active habits, categories used
- Today's habits quick-check widget
- Expense breakdown pie chart (last 30 days)

### 💰 Expenses
- Full CRUD with form validation
- Date range + category filters
- Monthly spending pie chart + category breakdown with progress bars
- Running total bar showing filtered sum
- CSV export
- Recharts-powered visualizations

### 🔥 Habits
- Create & manage daily habits
- 7-day visual grid — tap any circle to log completion
- Streak tracking (current + longest)
- Total completion count

### 🎨 Design
- **Minimalism theme** — monochrome palette, generous whitespace, precise typography
- **Dark mode** 🌙 with system preference detection
- **Responsive** — collapsible sidebar on mobile
- **Smooth animations** — fade/slide/scale transitions
- **Toast notifications** for all CRUD operations
- **Custom confirmation dialogs** (no browser prompts)

---

## 🏗️ Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Java 17+ | Language |
| Spring Boot 3.2 | Framework |
| Spring Data JPA | Database ORM |
| Spring Security + JWT | Authentication |
| H2 (dev) / PostgreSQL (prod) | Database |
| Maven | Build tool |

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + TypeScript | UI framework |
| Vite 5 | Build tool |
| Tailwind CSS 3 | Styling |
| Axios | HTTP client |
| React Router v6 | Routing |
| Recharts | Charts |
| Lucide React | Icons |
| date-fns | Date utilities |

---

## 🚀 Getting Started

### Prerequisites
- **Java 17+** and **Maven** (for backend)
- **Node.js 18+** and **npm** (for frontend)

### 1. Clone & Setup
```bash
git clone https://github.com/nakulsharma97/lifetrackerr.git
cd lifetrackerr
```

### 2. Start Backend
```bash
cd backend
./mvnw spring-boot:run
```
- Runs on `http://localhost:8080`
- Uses H2 in-memory database (data resets on restart)
- Demo user pre-seeded: **`demo` / `demo123`**

### 3. Start Frontend
```bash
cd frontend
npm install
npm run dev
```
- Runs on `http://localhost:5173`
- API calls proxied to `localhost:8080`

### 4. Open in Browser
Visit **[http://localhost:5173](http://localhost:5173)** and log in with `demo` / `demo123`.

---

## 📁 Project Structure

```
lifetrackerr/
├── backend/
│   ├── pom.xml
│   └── src/main/java/com/lifetracker/
│       ├── LifeTrackerApplication.java
│       ├── config/          # Security, CORS, exception handler, data initializer
│       ├── security/        # JWT provider, filter, user details service
│       ├── entity/          # User, Category, Expense, Habit, HabitLog
│       ├── repository/      # Spring Data JPA repositories
│       ├── dto/             # Request/response DTOs
│       ├── service/         # Business logic (incl. streak calculation 🔥)
│       └── controller/      # REST controllers
│
├── frontend/
│   ├── package.json
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx          # Routes + ToastProvider + auth guards
│   │   ├── index.css        # Tailwind + design system classes
│   │   ├── components/      # Sidebar, LoadingState, ErrorState, ConfirmDialog
│   │   ├── pages/           # Dashboard, Expenses, Habits, Login, Register
│   │   ├── lib/             # API client, auth storage, toast system, theme
│   │   └── types/           # TypeScript interfaces
│   └── public/
│
├── .gitignore
└── README.md
```

---

## 📡 API Endpoints

All endpoints except `/api/auth/*` require `Authorization: Bearer <jwt>` header.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Get JWT token |
| GET | `/api/categories?type=EXPENSE\|HABIT` | List categories |
| GET | `/api/expenses?from=&to=&categoryId=` | List expenses (filtered) |
| POST | `/api/expenses` | Create expense |
| PUT | `/api/expenses/{id}` | Update expense |
| DELETE | `/api/expenses/{id}` | Delete expense |
| GET | `/api/expenses/summary` | Monthly expense summary |
| GET | `/api/habits` | List habits (with streaks) |
| POST | `/api/habits` | Create habit |
| PUT | `/api/habits/{id}` | Update habit |
| DELETE | `/api/habits/{id}` | Delete habit |
| POST | `/api/habits/{id}/log` | Log/update habit completion |
| GET | `/api/habits/streaks` | Get streak data |

---

## 🐳 Production Deployment

### Backend (PostgreSQL)
```bash
cd backend
./mvnw package -DskipTests
java -jar target/lifetracker-*.jar --spring.profiles.active=prod
```

Set env vars:
```
DATABASE_URL=jdbc:postgresql://host:5432/lifetracker
DATABASE_USERNAME=your_user
DATABASE_PASSWORD=your_pass
JWT_SECRET=your-256-bit-base64-secret
```

### Frontend (Static Build)
```bash
cd frontend
npm run build
# Serve frontend/dist/ via Nginx, Vercel, or Netlify
```

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

---

## 📄 License

MIT
