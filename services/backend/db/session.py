from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

# Get DB URL from environment variable; fallback to your known URL if not set
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://fscope:fscope_pw@127.0.0.1:5433/fscope"
)

# Create the SQLAlchemy engine (the actual DB connection pool)
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,     # checks if connection is alive before using it
    future=True             # enables 2.0 style usage
)

# Session factory — gives each request its own DB session
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base class for our models to inherit from
Base = declarative_base()
