from fastapi import FastAPI, Response, status
from sqlalchemy import text
from app.core.config import settings
from app.db.database import engine
from app.api.customers import router as customers_router
from app.api.auth import router as auth_router
from app.api.transactions import router as transactions_router
from app.api.products import router as products_router
from app.api.ai import router as ai_router
from app.api.drafts import router as drafts_router
from app.api.voice import router as voice_router
from app.api.query import router as query_router
from app.api.dashboard import router as dashboard_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title=settings.PROJECT_NAME)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth_router)
app.include_router(customers_router)
app.include_router(transactions_router)
app.include_router(products_router)
app.include_router(ai_router)
app.include_router(drafts_router)
app.include_router(voice_router)
app.include_router(query_router)
app.include_router(dashboard_router)

@app.get("/", tags=["General"])
def root():
    """Root welcome endpoint."""
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} API",
        "docs_url": "/docs",
        "health_url": "/health",
    }


@app.get("/health", tags=["Monitoring"])
def health(response: Response):
    """
    Health check endpoint that verifies the PostgreSQL database connection.
    """
    try:
        # Verify connection to PostgreSQL
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return {
            "status": "healthy",
            "database": "connected"
        }
    except Exception as exc:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(exc)
        }

