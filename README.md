# Project Management System

A full-stack project management system with a **Web App** (React + Vite + Tailwind), **Mobile App** (React Native + Expo), and a **Backend** (Express + TypeScript + Prisma + PostgreSQL).

## Project Structure

```
├── backend/     → REST API server (Express, TypeScript, Prisma, PostgreSQL)
├── web/         → Web dashboard (React, Vite, TailwindCSS)
├── mobile/      → Mobile app (React Native, Expo)
└── docker-compose.yml
```

---

## 1. Database Setup (PostgreSQL)

**Option A – Docker** (recommended if Docker is installed):
```bash
docker-compose up -d
```
This creates a PostgreSQL instance at `localhost:5432` with:
- DB: `projectmanagement`
- User: `user`
- Password: `password`

**Option B – Local PostgreSQL**: Create a database named `projectmanagement` and update `backend/.env` accordingly.

---

## 2. Backend Setup

```bash
cd backend
npm install
```

> **Note:** `npm install` auto-runs `prisma generate` via the `postinstall` script.

3. Verify your `.env` file has the correct `DATABASE_URL`. Default:
```
DATABASE_URL="postgresql://user:password@localhost:5432/projectmanagement?schema=public"
```

4. Run the database migration (creates tables):
```bash
npm run prisma:migrate
# OR if migrate fails, push the schema directly:
npm run prisma:push
```

5. Start the backend development server:
```bash
npm run dev
```
The API will be running at **http://localhost:5000**

---

## 3. Web App Setup

```bash
cd web
npm install
npm run dev
```
The web app will be running at **http://localhost:5173**

---

## 4. Mobile App Setup (Expo)

```bash
cd mobile
npm install
npm start
```
- Download the **Expo Go** app on your iOS or Android device
- Scan the QR code from the terminal
- **Important:** If running on a real device, update `mobile/src/lib/api.ts` and change `localhost` to your **computer's local IP address** (e.g., `http://192.168.1.100:5000/api`)

---

## API Endpoints

All protected routes require: `Authorization: Bearer <token>`

### Auth
| Method | Endpoint | Body |
|--------|----------|------|
| POST | `/api/auth/register` | `{ fullName, email, password }` |
| POST | `/api/auth/login` | `{ email, password }` |
| POST | `/api/auth/logout` | — |
| GET | `/api/auth/me` | — (protected) |

### Projects (all protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List all projects (query: `name`, `status`) |
| GET | `/api/projects/:id` | Get project + its tasks |
| POST | `/api/projects` | Create project |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |

### Tasks (all protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List tasks (query: `projectId`, `name`, `status`, `priority`) |
| GET | `/api/tasks/:id` | Get task |
| POST | `/api/tasks` | Create task (`projectId` required) |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |

### Dashboard (protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Get stats: totalProjects, totalTasks, completedTasks, pendingTasks, projectsInProgress |

---

## Environment Variables

**`backend/.env`:**
```env
PORT=5000
JWT_SECRET=supersecretjwtkey123!
DATABASE_URL="postgresql://user:password@localhost:5432/projectmanagement?schema=public"
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express, TypeScript, Prisma ORM |
| Database | PostgreSQL |
| Web Frontend | React 18, Vite, TailwindCSS, React Router v6 |
| Mobile | React Native, Expo, React Navigation |
| Auth | JWT (jsonwebtoken) + bcrypt |
| Mobile Storage | expo-secure-store (secure JWT storage) |
