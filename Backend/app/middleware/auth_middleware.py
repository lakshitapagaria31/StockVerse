from collections.abc import Awaitable, Callable

from fastapi import HTTPException
from jose import JWTError, jwt
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

from app.config import settings


PUBLIC_EXACT_PATHS = {
    "/",
    "/health",
    "/openapi.json",
    "/favicon.ico",
}

PUBLIC_PATH_PREFIXES = (
    "/docs",
    "/redoc",
    "/auth",
)


class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(
        self,
        request: Request,
        call_next: Callable[[Request], Awaitable[Response]],
    ) -> Response:
        if request.method == "OPTIONS":
            return await call_next(request)

        path = request.url.path
        if path in PUBLIC_EXACT_PATHS or path.startswith(PUBLIC_PATH_PREFIXES):
            return await call_next(request)

        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return JSONResponse(status_code=401, content={"detail": "Missing bearer token"})

        token = auth_header.replace("Bearer ", "", 1)
        try:
            payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
            request.state.user_email = payload.get("sub")
            if not request.state.user_email:
                raise HTTPException(status_code=401, detail="Invalid token payload")
        except (JWTError, HTTPException):
            return JSONResponse(status_code=401, content={"detail": "Invalid or expired token"})

        return await call_next(request)
