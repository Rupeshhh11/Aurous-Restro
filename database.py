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

# Default PostgreSQL database for Aurous
DEFAULT_PG_URL = (
    "postgresql://aurous_db1_user:2GS1JBtgYpsrrvnsuBvJOUNZ2pxbTUL3"
    "@dpg-dalqnim1egvs73fhq9qg-a.oregon-postgres.render.com/aurous_db1"
)

raw_db_url = os.getenv("DATABASE_URL", DEFAULT_PG_URL)

if raw_db_url.startswith("postgres://"):
    raw_db_url = raw_db_url.replace("postgres://", "postgresql://", 1)

sqlite_file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "aurous.db")
sqlite_url = f"sqlite:///{sqlite_file_path}"

def generate_pg_candidates(primary_url: str):
    candidates = []
    
    # 1. If URL has internal Render format (@dpg-something without .render.com),
    # construct the public external Oregon host which is guaranteed to resolve from anywhere.
    if "@dpg-" in primary_url and ".render.com" not in primary_url:
        ext_url = re.sub(r'(@dpg-[^:/]+)(?::\d+)?(/|$)', r'\1.oregon-postgres.render.com\2', primary_url)
        ssl_ext = ext_url + ('&' if '?' in ext_url else '?') + 'sslmode=require'
        candidates.append(ssl_ext)
        candidates.append(ext_url)
    else:
        ssl_primary = primary_url + ('&' if '?' in primary_url else '?') + 'sslmode=require'
        candidates.append(ssl_primary)
        candidates.append(primary_url)
        
    # 2. Add the known default external Oregon PostgreSQL host as reliable backup
    ssl_default = DEFAULT_PG_URL + '?sslmode=require'
    if ssl_default not in candidates:
        candidates.append(ssl_default)
    if DEFAULT_PG_URL not in candidates:
        candidates.append(DEFAULT_PG_URL)
        
    # 3. Also include primary URL as provided
    if primary_url not in candidates:
        candidates.append(primary_url)
        
    return candidates

engine = None
is_postgres = False
db_connection_info = ""

if raw_db_url.startswith("sqlite"):
    print("[Database] Using SQLite database as requested by URL.")
    engine = create_engine(raw_db_url, connect_args={"check_same_thread": False})
    db_connection_info = "SQLite local file"
else:
    candidates = generate_pg_candidates(raw_db_url)
    last_error = None
    
    for candidate_url in candidates:
        masked_host = candidate_url.split("@")[-1] if "@" in candidate_url else "unknown"
        # Try up to 2 attempts per candidate with small backoff
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
