# StockVerse

StockVerse is split into two apps:

- `frontend/`: React + Vite web app
- `Backend/`: FastAPI backend

## Run Both Together

```bash
./run-dev.sh
```

This starts:

- Backend on `http://127.0.0.1:8000`
- Frontend on `http://127.0.0.1:8080`

## Run Backend

```bash
cd Backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Backend docs: `http://127.0.0.1:8000/docs`

## Run Frontend

```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 8080
```

Frontend app: `http://127.0.0.1:8080`

## Deploy As Single URL

Use frontend on Vercel and proxy backend behind `/api` so users open one domain only.

1. Deploy backend to Render/Railway/Fly and get a URL (example: `https://stockverse-api.onrender.com`).
2. Deploy `frontend/` to Vercel.
3. In Vercel project settings, add rewrites:

```json
[
	{
		"source": "/api/:path*",
		"destination": "https://stockverse-api.onrender.com/:path*"
	}
]
```

4. Keep `VITE_API_BASE_URL=/api` on frontend.
5. In backend CORS config, allow your Vercel domain (for direct calls, health checks, and docs access).

Result: your app works from one public URL, with API hidden behind `/api`.

## Environment Files

- Backend template: `Backend/.env.example`
- Frontend template: `frontend/.env.example`

Do not commit real `.env` files.
