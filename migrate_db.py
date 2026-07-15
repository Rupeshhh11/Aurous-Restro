from sqlalchemy import text
from database import engine

def add_is_signature_column():
    with engine.connect() as conn:
        try:
            # Change BOOLEAN DEFAULT 0 to DEFAULT FALSE to be PostgreSQL-compatible
            conn.execute(text("ALTER TABLE menu_items ADD COLUMN is_signature BOOLEAN DEFAULT FALSE;"))
            conn.commit()
            print("Successfully added 'is_signature' column to 'menu_items' table.")
        except Exception as e:
            if "duplicate column" in str(e).lower() or "already exists" in str(e).lower():
                print("Column 'is_signature' already exists.")
            else:
                print(f"An error occurred: {e}")

if __name__ == "__main__":
    add_is_signature_column()
