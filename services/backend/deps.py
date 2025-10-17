from typing import Generator

from sqlalchemy.orm import Session

from .db.session import SessionLocal


def get_db() -> Generator[Session, None, None]:
    """Yield a SQLAlchemy session per request and ensure it closes."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
