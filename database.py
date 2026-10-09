import os
import re
import time
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Ensure .env is loaded from directory of database.py or current working dir
env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
load_dotenv(env_path)
load_dotenv()  # also check current working directory

# Default PostgreSQL database for Aurous (using explicit psycopg2 driver)
DEFAULT_PG_URL = (
    "postgresql+psycopg2://aurous_db1_user:2GS1JBtgYpsrrvnsuBvJOUNZ2pxbTUL3"
    "@dpg-dalqnim1egvs73fhq9qg-a.oregon-postgres.render.com/aurous_db1"
)

raw_db_url = os.getenv("DATABASE_URL", DEFAULT_PG_URL)

sqlite_file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "aurous.db")
sqlite_url = f"sqlite:///{sqlite_file_path}"

def normalize_pg_url(u: str) -> str:
    """Ensures postgresql URLs specify the psycopg2 driver to avoid driver mismatch in SQLAlchemy 2.0"""
    if u.startswith("postgres://"):
        return u.replace("postgres://", "postgresql+psycopg2://", 1)
    if u.startswith("postgresql://"):
        return u.replace("postgresql://", "postgresql+psycopg2://", 1)
    return u

def generate_pg_candidates(primary_url: str):
    candidates = []
    
    # 1. Primary choice: External Oregon host with psycopg2 driver and sslmode=require
    ssl_default = DEFAULT_PG_URL + "?sslmode=require"
    candidates.append(ssl_default)
    candidates.append(DEFAULT_PG_URL)
    
    # 2. Normalized primary URL
    norm_primary = normalize_pg_url(primary_url)
    
    # If primary URL has internal Render host (@dpg-... without .render.com),
    # also add the public external Oregon equivalent
    if "@dpg-" in norm_primary and ".render.com" not in norm_primary:
        ext_url = re.sub(r'(@dpg-[^:/]+)(?::\d+)?(/|$)', r'\1.oregon-postgres.render.com\2', norm_primary)
        ssl_ext = ext_url + ('&' if '?' in ext_url else '?') + 'sslmode=require'
        if ssl_ext not in candidates:
            candidates.append(ssl_ext)
        if ext_url not in candidates:
            candidates.append(ext_url)
    else:
        ssl_p = norm_primary + ('&' if '?' in norm_primary else '?') + 'sslmode=require'
        if ssl_p not in candidates:
            candidates.append(ssl_p)
        if norm_primary not in candidates:
            candidates.append(norm_primary)
            
    # 3. Fallbacks using standard postgresql:// scheme (for psycopg 3 if available)
    std_default = (
        "postgresql://aurous_db1_user:2GS1JBtgYpsrrvnsuBvJOUNZ2pxbTUL3"
        "@dpg-dalqnim1egvs73fhq9qg-a.oregon-postgres.render.com/aurous_db1?sslmode=require"
    )
    if std_default not in candidates:
        candidates.append(std_default)
        
    return candidates

engine = None
is_postgres = False
db_connection_info = ""

last_error_str = ""
tested_candidates = []

if raw_db_url.startswith("sqlite"):
    print("[Database] Using SQLite database as requested by URL.")
    engine = create_engine(raw_db_url, connect_args={"check_same_thread": False})
    db_connection_info = "SQLite local file"
else:
    candidates = generate_pg_candidates(raw_db_url)
    last_error = None
    
    for candidate_url in candidates:
        masked_host = candidate_url.split("@")[-1] if "@" in candidate_url else "unknown"
        tested_candidates.append(masked_host)
        for attempt in range(1, 3):
            try:
                test_engine = create_engine(
                    candidate_url,
                    connect_args={"connect_timeout": 10},
                    pool_pre_ping=True,
                    pool_recycle=300
                )
                with test_engine.connect() as conn:
                    conn.execute(text("SELECT 1"))
                engine = test_engine
                is_postgres = True
                db_connection_info = f"PostgreSQL ({masked_host})"
                print(f"[Database] Successfully connected to PostgreSQL: {masked_host}")
                break
            except Exception as err:
                last_error = err
                time.sleep(1)
        if is_postgres:
            break

    if not is_postgres:
        last_error_str = str(last_error)
        print(f"[Database] All PostgreSQL connection attempts failed ({last_error}). Falling back to SQLite ({sqlite_file_path})...")
        engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})
        db_connection_info = f"SQLite Fallback ({sqlite_file_path})"

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def sync_sqlite_backup():
    """
    Safely syncs PostgreSQL data to local aurous.db so local fallback is never empty.
    """
    if not is_postgres:
        return
    try:
        import sqlite3
        with engine.connect() as pg_conn:
            sq_conn = sqlite3.connect(sqlite_file_path)
            sq_cur = sq_conn.cursor()
            tables = [
                'vibe_banners', 'vibe_photos', 'menu_items',
                'bill_settings', 'reservations', 'active_tables',
                'orders', 'order_items', 'reviews'
            ]
            for t in tables:
                try:
                    result = pg_conn.execute(text(f"SELECT * FROM {t}"))
                    rows = result.fetchall()
                    if not rows:
                        continue
                    cols = list(result.keys())
                    placeholders = ','.join(['?' for _ in cols])
                    col_names = ','.join(cols)
                    sq_cur.execute(f"DELETE FROM {t}")
                    sq_cur.executemany(f"INSERT INTO {t} ({col_names}) VALUES ({placeholders})", [tuple(r) for r in rows])
                except Exception:
                    pass
            sq_conn.commit()
            sq_conn.close()
            print("[Database] Successfully synced PostgreSQL data to local SQLite backup.")
    except Exception as e:
        print(f"[Database] SQLite backup sync notice: {e}")
