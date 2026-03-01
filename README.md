# NutriSnap — Frontend

> **Cheesehacks 2026** · UW-Madison Dining Hall Nutrition Tracker

Mobile-first React app for NutriSnap: snap your tray, get nutrition info, and track macros with live dining hall menus and personalized recommendations.

**Repositories:** [Frontend (this repo)](https://github.com/cheesehacks-26/nutrisnap) · [API (backend)](https://github.com/cheesehacks-26/nutrisnap-api)

---

## API

The frontend talks to the NutriSnap backend API:

- **Live API:** [https://nutrisnap-api.onrender.com](https://nutrisnap-api.onrender.com)
- **API repo & docs:** [nutrisnap-api](https://github.com/cheesehacks-26/nutrisnap-api/blob/main/README.md) (endpoints, auth, menu, logging, recommendations, etc.)

Authenticated requests use `Authorization: Bearer <token>`.

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| React 19 + Vite | UI and build |
| Inline CSS / JS | Styling (no external CSS lib) |
| `fetch` | Backend communication |

---

## Getting Started

### Prerequisites

- Node.js 18+

### Install & run

```bash
cd nutrisnap
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (HMR) |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## Project structure

- `src/` — React app (components, pages, hooks, etc.)
- `public/` — Static assets
- `index.html` — Entry HTML

---

## License

[MIT](LICENSE)
