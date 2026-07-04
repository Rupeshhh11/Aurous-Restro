import sqlite3

def add_is_signature_column():
    conn = sqlite3.connect('aurous.db')
    cursor = conn.cursor()
    
    try:
        cursor.execute("ALTER TABLE menu_items ADD COLUMN is_signature BOOLEAN DEFAULT 0;")
        conn.commit()
        print("Successfully added 'is_signature' column to 'menu_items' table.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            print("Column 'is_signature' already exists.")
        else:
            print(f"An error occurred: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    add_is_signature_column()
