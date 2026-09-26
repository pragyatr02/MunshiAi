from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

# Create PostgreSQL database engine using settings.DATABASE_URL
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True
)

# SessionLocal class for database sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for SQLAlchemy ORM models
Base = declarative_base()


def get_db():
    """Dependency that creates and yields a database session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
