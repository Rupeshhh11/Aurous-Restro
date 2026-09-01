import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker

raw_db_url = os.getenv(
    "DATABASE_URL",
    "postgresql://aurous_db_user:6McWJSyrRf7eIoaFK6ewPM6hs3Bez3WF@dpg-d9bv0b57vvec73ffjl0g-a.oregon-postgres.render.com/aurous_db"
)

if raw_db_url.startswith("postgres://"):
    raw_db_url = raw_db_url.replace("postgres://", "postgresql://", 1)

try:
    if raw_db_url.startswith("sqlite"):
        engine = create_engine(raw_db_url, connect_args={"check_same_thread": False})
    else:
        # Try connecting with a 4-second timeout to test connectivity
        engine = create_engine(raw_db_url, connect_args={"connect_timeout": 4})
        with engine.connect() as conn:
            pass
except Exception as e:
    # If remote postgres host fails to resolve locally, fallback to local sqlite
    print(f"[Database] Remote database connection failed ({e}), falling back to SQLite (aurous.db)...")
    raw_db_url = "sqlite:///./aurous.db"
    engine = create_engine(raw_db_url, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

