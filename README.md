# StockVerse

StockVerse is split into two apps:

- `frontend/`: React + Vite web app
- `Backend/`: FastAPI backend

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

## Environment Files

- Backend template: `Backend/.env.example`
- Frontend template: `frontend/.env.example`

Do not commit real `.env` files.
