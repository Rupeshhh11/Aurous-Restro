import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Ensure .env is loaded from directory of database.py or current working dir
env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
load_dotenv(env_path)
load_dotenv()  # also check current working directory

raw_db_url = os.getenv(
    "DATABASE_URL",
    "postgresql://aurous_db1_user:2GS1JBtgYpsrrvnsuBvJOUNZ2pxbTUL3@dpg-dalqnim1egvs73fhq9qg-a.oregon-postgres.render.com/aurous_db1"
)

if raw_db_url.startswith("postgres://"):
    raw_db_url = raw_db_url.replace("postgres://", "postgresql://", 1)

# If internal Render hostname is used outside of Render, auto-fix to external public hostname
if "@dpg-" in raw_db_url and ".render.com" not in raw_db_url and "RENDER" not in os.environ:
    raw_db_url = raw_db_url.replace("@dpg-dalqnim1egvs73fhq9qg-a/", "@dpg-dalqnim1egvs73fhq9qg-a.oregon-postgres.render.com/")

sqlite_file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "aurous.db")
sqlite_url = f"sqlite:///{sqlite_file_path}"

is_postgres = False

try:
    if raw_db_url.startswith("sqlite"):
        engine = create_engine(raw_db_url, connect_args={"check_same_thread": False})
    else:
        # Use generous 15-second timeout, pool pre-ping, and connection recycling
        engine = create_engine(
            raw_db_url,
            connect_args={"connect_timeout": 15},
            pool_pre_ping=True,
            pool_recycle=300
        )
        with engine.connect() as conn:
            pass
        is_postgres = True
        print("[Database] Successfully connected to PostgreSQL (Render)!")
except Exception as e:
    # If remote postgres host fails to resolve locally, fallback to local sqlite
    print(f"[Database] Remote database connection failed ({e}), falling back to SQLite ({sqlite_file_path})...")
    raw_db_url = sqlite_url
    engine = create_engine(raw_db_url, connect_args={"check_same_thread": False})

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
            tables = ['vibe_banners', 'vibe_photos', 'menu_items', 'bill_settings', 'reservations', 'active_tables', 'orders', 'order_items', 'reviews']
            for t in tables:
                try:
                    result = pg_conn.execute(Base.metadata.tables[t].select())
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
            print("[Database] Synced PostgreSQL data to local SQLite backup.")
    except Exception as e:
        print(f"[Database] SQLite sync notice: {e}")


