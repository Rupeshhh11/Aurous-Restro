from sqlalchemy import text
from database import engine, SessionLocal
import models
from passlib.context import CryptContext
import datetime

def check_and_update_db():
    # 1. Ensure all tables are created based on SQLAlchemy models
    models.Base.metadata.create_all(bind=engine)
    print("Tables verified/created.")

    # 2. Add columns to reviews if they don't exist
    with engine.connect() as conn:
        for column_name, sql_type in [("reply_text", "TEXT"), ("replied_at", "TIMESTAMP")]:
            try:
                conn.execute(text(f"ALTER TABLE reviews ADD COLUMN {column_name} {sql_type}"))
                conn.commit()
                print(f"Added column {column_name} to reviews.")
            except Exception as e:
                # Handle already exists gracefully
                if "duplicate column" in str(e).lower() or "already exists" in str(e).lower():
                    pass
                else:
                    print(f"Error checking/adding column {column_name}: {e}")

    # 3. Create or update admin user
    db = SessionLocal()
    try:
        pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
        hashed_pw = pwd_context.hash("aurous123")
        
        admin = db.query(models.Member).filter(models.Member.username == 'admin').first()
        if admin:
            print("Updating admin password...")
            admin.hashed_password = hashed_pw
            db.commit()
        else:
            print("Creating admin user...")
            admin_user = models.Member(
                username="admin",
                hashed_password=hashed_pw,
                full_name="Aurous Admin",
                created_at=datetime.datetime.utcnow()
            )
            db.add(admin_user)
            db.commit()
    finally:
        db.close()
    
    print("Database check complete.")

if __name__ == "__main__":
    check_and_update_db()
