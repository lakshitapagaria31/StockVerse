# StockVerse Backend (FastAPI)

FastAPI backend for inventory and warehouse operations with async PostgreSQL, JWT authentication, OTP flow, and inventory ledger tracking.

## Why FastAPI

- Fast performance and async support
- Automatic OpenAPI docs and Swagger UI
- Strong Python ecosystem compatibility

## Backend Architecture

```text
Backend/
  app/
    main.py
    config.py

    database/
      connection.py
      models.py

    routers/
      auth.py
      products.py
      warehouses.py
      receipts.py
      deliveries.py
      transfers.py
      adjustments.py

    schemas/
      product_schema.py
      warehouse_schema.py
      operation_schema.py

    services/
      inventory_service.py
      stock_service.py

    utils/
      auth_utils.py
      otp_utils.py

    middleware/
      auth_middleware.py

  requirements.txt
```

## Database

Database selection is profile-based:

- `APP_ENV=dev` defaults to SQLite (`DEV_DATABASE_URL`)
- `APP_ENV=prod` defaults to PostgreSQL (`PROD_DATABASE_URL`)
- `DATABASE_URL` always overrides both

### Tables

- `users`: `id`, `name`, `email`, `password_hash`, `role`, `created_at`
- `products`: `id`, `name`, `sku`, `category`, `unit`, `created_at`
- `warehouses`: `id`, `name`, `location`
- `stock`: `id`, `product_id`, `warehouse_id`, `quantity`
- `stock_movements`: `id`, `product_id`, `operation_type`, `quantity`, `source_location`, `destination_location`, `timestamp`, `user_id`

## API Endpoints

### Auth

- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/reset-password`
- `POST /auth/verify-otp`

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

### Receipts

- `POST /receipts`
- `GET /receipts`

### Deliveries

- `POST /deliveries`
- `GET /deliveries`

### Transfers

- `POST /transfers`
- `GET /transfers`

### Adjustments

- `POST /adjustments`
- `GET /adjustments`

## Inventory Logic

Rules implemented in `app/services/inventory_service.py`:

- Receipt: `stock += quantity`
- Delivery: `stock -= quantity`
- Transfer:
  source `stock -= quantity`
  destination `stock += quantity`
- Adjustment: `stock = counted_quantity`

Every operation writes a `stock_movements` ledger record.

## Security

- JWT authentication for protected endpoints
- Password hashing using `bcrypt` (`passlib`)
- OTP request rate limiting via `otp_utils.py` (starter implementation)

## Git Workflow

Recommended branching strategy:

- `main`
- `develop`
- `feature/*`

Examples:

- `feature/products`
- `feature/receipts`
- `feature/dashboard`

## Quick Start

1. Install dependencies:

```bash
cd Backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

2. Configure environment:

```bash
export APP_ENV="dev"
export SECRET_KEY="change_this_to_a_long_random_secret"
export ACCESS_TOKEN_EXPIRE_MINUTES="60"
export OTP_REQUEST_LIMIT="5"
export OTP_WINDOW_SECONDS="900"
```

3. Run the server (single command in dev):

```bash
uvicorn app.main:app --reload --port 8000
```

For production profile:

```bash
APP_ENV="prod" uvicorn app.main:app --reload --port 8000
```

To force a specific DB URL regardless of profile:

```bash
DATABASE_URL="postgresql+asyncpg://postgres:postgres@localhost:5432/stockverse" uvicorn app.main:app --reload --port 8000
```

4. Open automatic docs:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Troubleshooting

- `zsh: no such user or named directory: python`
  Cause: running `~python ...` instead of `python ...`.
  Fix:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

## Production Next Steps

- Replace in-memory OTP store with Redis.
- Add Alembic migrations and version control for schema changes.
- Add stricter request throttling and audit logging.
- Add test suite for auth and stock movement workflows.
