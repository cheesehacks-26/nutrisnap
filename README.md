# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# 🦡 NutriSnap

> **Cheesehacks 2026** · UW-Madison Dining Hall Nutrition Tracker

NutriSnap is a mobile-first web app that helps UW-Madison students eat smarter at the dining halls. Snap a photo of your tray, get instant nutrition info, and receive personalized meal recommendations based on your daily goals — all powered by real Nutrislice menu data.

---

## ✨ Features

- **📸 Snap & Log** — Point your camera at your tray and NutriSnap auto-detects your food and matches it to the dining hall menu
- **📋 Live Menu** — Browse real-time menus from all 6 UW dining halls (Gordon, Four Lakes, Rheta's, Liz's, Carson's, Lowell)
- **⭐ Smart Recommendations** — Personalized meal suggestions based on your remaining macro goals for the day
- **📊 Dashboard** — See today's calorie and macro progress at a glance with an animated ring and progress bars
- **📈 Trends** — 7-day history of your calorie and macro intake with interactive charts
- **🔐 Auth** — Secure account system with email/password login and persistent sessions

---

## 🛠 Tech Stack

### Frontend — `nutrisnap`
| Tool | Purpose |
|------|---------|
| React 19 + Vite | UI framework |
| Inline CSS / JS | Styling (no external CSS lib) |
| `fetch` API | Backend communication |

### Backend — `nutrisnap-api`
| Tool | Purpose |
|------|---------|
| Node.js + Express | API server |
| Supabase | Database + Auth (PostgreSQL) |
| Nutrislice API | Live dining hall menu data |
| Render | Deployment |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A Supabase project
- Render account (for deployment)

### Frontend

```bash
git clone https://github.com/cheesehacks-26/nutrisnap
cd nutrisnap
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Backend

```bash
git clone https://github.com/cheesehacks-26/nutrisnap-api
cd nutrisnap-api
npm install
```

Create a `.env` file:
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PORT=3001
```

```bash
npm start
```

---

## 🔌 API Overview

Base URL: `https://nutrisnap-api.onrender.com`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/register` | ❌ | Create account |
| `POST` | `/auth/login` | ❌ | Get session token |
| `GET` | `/api/profile` | ✅ | Get user profile & goals |
| `PUT` | `/api/profile` | ✅ | Update profile |
| `GET` | `/api/menu?hall=&meal=` | ❌ | Live dining hall menu |
| `GET` | `/api/dining-halls` | ❌ | All halls with hours |
| `POST` | `/api/log` | ✅ | Log a meal |
| `GET` | `/api/log?date=` | ✅ | Today's logs + totals |
| `DELETE` | `/api/log/:id` | ✅ | Delete a log entry |
| `GET` | `/api/recommend?meal=` | ✅ | Personalized recommendations |

### Dining Halls
`gordon-avenue-market` · `four-lakes-market` · `rhetas-market` · `lizs-market` · `carsons-market` · `lowell-market`

---

## 👥 Team

Built at **Cheesehacks 2026** by the NutriSnap team 🧀

---

## 📄 License

MIT
