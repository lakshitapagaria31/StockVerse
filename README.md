# StockVerse

StockVerse is a full inventory management system with a React frontend and FastAPI backend.

## Project Structure

- `frontend/`: React + Vite + TypeScript UI
- `Backend/`: FastAPI + SQLAlchemy backend
- `run-dev.sh`: starts frontend and backend together in local development

## Features

- Authentication: signup, login, JWT auth
- Password reset with OTP flow
- Product and warehouse management
- Stock operations: receipts, deliveries, transfers, adjustments
- Stock movement history and ledger-style tracking
- Light/dark/system theme support

## Tech Stack

### Frontend

- React
- Vite
- TypeScript
- Tailwind CSS + shadcn/ui
- Zustand

### Backend

- FastAPI
- SQLAlchemy (async)
- JWT (`python-jose`)
- `passlib` + `bcrypt`
- SQLite (dev fallback) / PostgreSQL (prod)

## Run Locally

### Quick Start (Both Services)

```bash
./run-dev.sh
```

Starts:

- Frontend: `http://127.0.0.1:8080`
- Backend: `http://127.0.0.1:8000`
- Swagger: `http://127.0.0.1:8000/docs`

### Backend Setup (Manual)

```bash
cd Backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### Frontend Setup (Manual)

```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 8080
```

## Configuration

### Backend Environment

Use `Backend/.env.example` as the template.

Important keys:

- `APP_ENV`: `dev` or `prod`
- `DATABASE_URL`: optional override for all environments
- `DEV_DATABASE_URL`: default dev DB URL
- `PROD_DATABASE_URL`: default prod DB URL
- `SECRET_KEY`: JWT secret
- `OTP_REQUEST_LIMIT`: max OTP requests in window
- `OTP_WINDOW_SECONDS`: OTP request window
- `CORS_ORIGINS`: comma-separated allowed origins

### Frontend Environment

Use `frontend/.env.example` as the template.

- `VITE_API_BASE_URL=/api` (recommended for single-domain routing)

## API Overview

### Auth

- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/token`
- `POST /auth/reset-password`
- `POST /auth/verify-otp`
- `POST /auth/confirm-reset-password`

### Products

- `GET /products`
- `POST /products`
- `GET /products/{id}`
- `PUT /products/{id}`
- `DELETE /products/{id}`

### Warehouses

- `GET /warehouses`
- `POST /warehouses`
- `GET /warehouses/{id}`
- `PUT /warehouses/{id}`
- `DELETE /warehouses/{id}`

### Operations

- `POST /receipts`, `GET /receipts`
- `POST /deliveries`, `GET /deliveries`
- `POST /transfers`, `GET /transfers`
- `POST /adjustments`, `GET /adjustments`

## Inventory Logic

- Receipt: add stock
- Delivery: subtract stock
- Transfer: subtract from source, add to destination
- Adjustment: set stock to counted quantity

All operations write movement records.

## Single-URL Deployment (Frontend + Backend)

Deploy frontend on Vercel and backend on Render/Railway/Fly, then proxy backend through `/api`.

1. Deploy backend and get URL, for example `https://stockverse-api.onrender.com`.
2. Deploy `frontend/` on Vercel.
3. Add Vercel rewrite:

```json
[
  {
    "source": "/api/:path*",
    "destination": "https://stockverse-api.onrender.com/:path*"
  }
]
```

4. Keep frontend env `VITE_API_BASE_URL=/api`.
5. Add your Vercel domain to backend `CORS_ORIGINS`.

Result: users access one URL, API is routed behind `/api`.

## Notes

- Do not commit real `.env` files.
- For production, use managed PostgreSQL and secure secrets.
