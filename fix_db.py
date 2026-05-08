import sqlite3

def check_and_update_db():
    conn = sqlite3.connect('aurous.db')
    cursor = conn.cursor()
    
    # Check reviews table
    cursor.execute("PRAGMA table_info(reviews)")
    columns = [col[1] for col in cursor.fetchall()]
    
    if 'reply_text' not in columns:
        print("Adding reply_text to reviews...")
        cursor.execute("ALTER TABLE reviews ADD COLUMN reply_text TEXT")
    
    if 'replied_at' not in columns:
        print("Adding replied_at to reviews...")
        cursor.execute("ALTER TABLE reviews ADD COLUMN replied_at DATETIME")
        
    # Check if members table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='members'")
    if not cursor.fetchone():
        print("Creating members table...")
        cursor.execute("""
            CREATE TABLE members (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE,
                hashed_password TEXT,
                full_name TEXT,
                created_at DATETIME
            )
        """)
    
    # Reset admin user with correct hash for pbkdf2_sha256
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
    hashed_pw = pwd_context.hash("aurous123")
    
    cursor.execute("SELECT id FROM members WHERE username='admin'")
    admin = cursor.fetchone()
    if admin:
        print("Updating admin password...")
        cursor.execute("UPDATE members SET hashed_password=? WHERE username='admin'", (hashed_pw,))
    else:
        print("Creating admin user...")
        import datetime
        cursor.execute("INSERT INTO members (username, hashed_password, full_name, created_at) VALUES (?, ?, ?, ?)",
                       ("admin", hashed_pw, "Aurous Admin", datetime.datetime.utcnow()))
    
    conn.commit()
    conn.close()
    print("Database check complete.")

if __name__ == "__main__":
    check_and_update_db()
