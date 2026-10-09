import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker

raw_db_url = os.getenv(
    "DATABASE_URL",
    "postgresql://aurous_db1_user:2GS1JBtgYpsrrvnsuBvJOUNZ2pxbTUL3@dpg-dalqnim1egvs73fhq9qg-a.oregon-postgres.render.com/aurous_db1"
)

if raw_db_url.startswith("postgres://"):
    raw_db_url = raw_db_url.replace("postgres://", "postgresql://", 1)

# If internal Render hostname is used outside of Render, auto-fix to external public hostname
if "@dpg-" in raw_db_url and ".render.com" not in raw_db_url and "RENDER" not in os.environ:
    raw_db_url = raw_db_url.replace("@dpg-dalqnim1egvs73fhq9qg-a/", "@dpg-dalqnim1egvs73fhq9qg-a.oregon-postgres.render.com/")

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

