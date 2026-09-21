# Velvet Invite 💌

> AI-Powered Wedding Website Builder for Nigerian Couples.

Velvet Invite is a self-serve SaaS platform that enables engaged couples to design, personalize, and publish interactive wedding websites in minutes.

---

## Tech Stack

- **Backend**: Python, [FastAPI](https://fastapi.tiangolo.com/), [Pydantic v2](https://docs.pydantic.dev/), [Motor](https://motor.readthedocs.io/) & [Beanie ODM](https://roman-right.github.io/beanie/) (MongoDB async driver), [Anthropic Python SDK](https://github.com/anthropics/anthropic-sdk-python).
- **Frontend**: React 19, TypeScript, [Vite](https://vite.dev/), [Tailwind CSS v4](https://tailwindcss.com/), [React Router](https://reactrouter.com/), [Lucide React](https://lucide.dev/).
- **Package Managers**: `uv` for Python backend, `npm` for frontend.

---

## Project Structure

```
velvet-invite/
├── backend/
│   ├── app/
│   │   ├── config.py              # Environment configuration & settings
│   │   ├── database.py            # Motor & Beanie MongoDB initialization
│   │   ├── main.py                # FastAPI entrypoint & /health endpoint
│   │   └── services/
│   │       └── ai_builder.py      # AIBuilderService abstraction (Anthropic Claude default)
│   ├── tests/
│   │   └── test_health.py         # Automated API tests
│   ├── .env.example               # Configuration template
│   └── pyproject.toml             # Backend dependencies
├── frontend/
│   ├── src/
│   │   ├── api/client.ts          # Typed backend API client
│   │   ├── App.tsx                # Skeleton interface & live health monitor
│   │   └── index.css              # Tailwind styles
│   ├── package.json
│   └── vite.config.ts
└── .gitignore
```

---

## Getting Started

### 1. Backend Setup

```bash
cd backend
# Copy environment template
cp .env.example .env

# Install dependencies and start server with uv
uv run uvicorn app.main:app --reload --port 8000
```

Verify backend health at [http://localhost:8000/health](http://localhost:8000/health).

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.
