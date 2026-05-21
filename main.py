from fastapi import FastAPI, Depends, HTTPException, Form, UploadFile, File, status
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import os
import shutil
import uuid
from typing import List

import models
import schemas
from database import engine, get_db


models.Base.metadata.create_all(bind=engine)


with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE reservations ADD COLUMN cancelled_at VARCHAR"))
        conn.commit()
    except Exception:

        pass
    try:
        conn.execute(text("ALTER TABLE reservations ADD COLUMN arriving_confirmed INTEGER DEFAULT 0"))
        conn.commit()
    except Exception:

        pass

app = FastAPI(title="Aurous Restro API")


SECRET_KEY = "aurous_secret_key_change_this_in_production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 600

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_member(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str | None = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = schemas.TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = db.query(models.Member).filter(models.Member.username == token_data.username).first()
    if user is None:
        raise credentials_exception
    return user


os.makedirs("assets/images/uploads", exist_ok=True)


@app.on_event("startup")
async def startup_event():
    db = next(get_db())
    
    try:
        db.execute(text("ALTER TABLE active_tables ADD COLUMN reservation_id INTEGER REFERENCES reservations(id)"))
        db.commit()
    except Exception as e:
        db.rollback()

    try:
        db.execute(text("ALTER TABLE orders ADD COLUMN reservation_id INTEGER REFERENCES reservations(id)"))
        db.commit()
    except Exception as e:
        db.rollback()

    try:
        db.execute(text("ALTER TABLE reservations ADD COLUMN status VARCHAR DEFAULT 'pending'"))
        db.commit()
    except Exception as e:
        db.rollback()

    try:
        db.execute(text("ALTER TABLE reservations ADD COLUMN deleted_by_admin INTEGER DEFAULT 0"))
        db.commit()
    except Exception as e:
        db.rollback()

    try:
        db.execute(text("ALTER TABLE reservations ADD COLUMN deleted_by_user INTEGER DEFAULT 0"))
        db.commit()
    except Exception as e:
        db.rollback()

    try:
        db.execute(text("ALTER TABLE reservations ADD COLUMN arriving_confirmed INTEGER DEFAULT 0"))
        db.commit()
    except Exception as e:
        db.rollback()

    admin = db.query(models.Member).filter(models.Member.username == "admin").first()
    if not admin:
        hashed_pw = get_password_hash("aurous123")
        admin_member = models.Member(username="admin", hashed_password=hashed_pw, full_name="Aurous Admin")
        db.add(admin_member)
        db.commit()

    # Seed Tables
    if db.query(models.ActiveTable).count() == 0:
        for i in range(1, 11):
            db.add(models.ActiveTable(table_number=i))
        db.commit()

    # Seed Menu Items
    if db.query(models.MenuItem).count() == 0:
        dummy_menu = [
            {"name": "Roasted Chicken Chilli", "category": "Non-Veg", "price": 450, "is_veg": False, "description": "Spicy roasted chicken tossed in Asian sauces.", "image_url": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&q=80&w=1013"},
            {"name": "Chef's Special Sizzler", "category": "Non-Veg", "price": 650, "is_veg": False, "description": "Smoked directly at your table. Rich and flavorful.", "image_url": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=1469"},
            {"name": "Golden Fish Fingers", "category": "Non-Veg", "price": 380, "is_veg": False, "description": "Crispy on the outside, tender inside. Served with tartar sauce.", "image_url": "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&q=80&w=1374"},
            {"name": "Paneer Tikka Masala", "category": "Veg", "price": 350, "is_veg": True, "description": "Grilled cottage cheese in rich tomato gravy.", "image_url": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=1000"},
            {"name": "Aurous Signature Mix", "category": "Drinks", "price": 400, "is_veg": True, "description": "Crafted by mixologists to perfectly accompany your evening.", "image_url": "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=1470"},
            {"name": "Butter Naan", "category": "Roti", "price": 60, "is_veg": True, "description": "Soft and fluffy Indian flatbread brushed with butter.", "image_url": "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=1000"}
        ]
        for item in dummy_menu:
            db.add(models.MenuItem(**item))
        db.commit()



@app.post("/api/reservations", response_model=schemas.ReservationResponse)
def create_reservation(reservation: schemas.ReservationCreate, db: Session = Depends(get_db)):
    db_reservation = models.Reservation(**reservation.model_dump())
    db.add(db_reservation)
    db.commit()
    db.refresh(db_reservation)
    return db_reservation

@app.get("/api/reviews", response_model=list[schemas.ReviewResponse])
def get_reviews(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    reviews = db.query(models.Review).order_by(models.Review.created_at.desc()).offset(skip).limit(limit).all()
    return reviews

@app.post("/api/reviews", response_model=schemas.ReviewResponse)
async def create_review(
    name: str = Form(...),
    location: str = Form(...),
    rating: int = Form(...),
    review_text: str = Form(...),
    images: List[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    image_urls = []
    if images:
        for img in images:
            if img.filename:
                file_extension = os.path.splitext(img.filename)[1]
                unique_filename = f"{uuid.uuid4().hex}{file_extension}"
                file_path = f"assets/images/uploads/{unique_filename}"
                with open(file_path, "wb") as buffer:
                    shutil.copyfileobj(img.file, buffer)
                image_urls.append(f"/{file_path}")
    
    image_url_str = ",".join(image_urls) if image_urls else None

    db_review = models.Review(
        name=name,
        location=location,
        rating=rating,
        review_text=review_text,
        image_url=image_url_str
    )
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review



@app.post("/api/auth/login", response_model=schemas.Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.Member).filter(models.Member.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/admin/reservations", response_model=List[schemas.ReservationResponse])
def admin_get_reservations(current_member: models.Member = Depends(get_current_member), db: Session = Depends(get_db)):
    return db.query(models.Reservation).filter(models.Reservation.deleted_by_admin == 0).order_by(models.Reservation.created_at.desc()).all()

@app.get("/api/admin/reviews", response_model=List[schemas.ReviewResponse])
def admin_get_reviews(current_member: models.Member = Depends(get_current_member), db: Session = Depends(get_db)):
    return db.query(models.Review).order_by(models.Review.created_at.desc()).all()

@app.post("/api/admin/reviews/reply", response_model=schemas.ReviewResponse)
def admin_reply_to_review(reply: schemas.ReviewReply, current_member: models.Member = Depends(get_current_member), db: Session = Depends(get_db)):
    db_review = db.query(models.Review).filter(models.Review.id == reply.review_id).first()
    if not db_review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    db_review.reply_text = reply.reply_text
    db_review.replied_at = datetime.utcnow()
    db.commit()
    db.refresh(db_review)
    return db_review

@app.delete("/api/reviews/{review_id}")
def delete_review_public(review_id: int, db: Session = Depends(get_db)):
    db_review = db.query(models.Review).filter(models.Review.id == review_id).first()
    if not db_review:
        raise HTTPException(status_code=404, detail="Review not found")
    db.delete(db_review)
    db.commit()
    return {"detail": "Review deleted"}

@app.delete("/api/admin/reviews/{review_id}")
def admin_delete_review(review_id: int, current_member: models.Member = Depends(get_current_member), db: Session = Depends(get_db)):
    db_review = db.query(models.Review).filter(models.Review.id == review_id).first()
    if not db_review:
        raise HTTPException(status_code=404, detail="Review not found")
    db.delete(db_review)
    db.commit()
    return {"detail": "Review deleted"}
    
@app.delete("/api/admin/reservations/{reservation_id}")
def admin_delete_reservation(reservation_id: int, current_member: models.Member = Depends(get_current_member), db: Session = Depends(get_db)):
    db_res = db.query(models.Reservation).filter(models.Reservation.id == reservation_id).first()
    if not db_res:
        raise HTTPException(status_code=404, detail="Reservation not found")
    db_res.deleted_by_admin = 1
    db.commit()
    return {"detail": "Reservation deleted"}

@app.patch("/api/admin/reservations/{reservation_id}/complete")
def admin_complete_reservation(reservation_id: int, current_member: models.Member = Depends(get_current_member), db: Session = Depends(get_db)):
    db_res = db.query(models.Reservation).filter(models.Reservation.id == reservation_id).first()
    if not db_res:
        raise HTTPException(status_code=404, detail="Reservation not found")
    db_res.status = "completed"
    db.commit()
    db.refresh(db_res)
    return db_res

@app.patch("/api/admin/reservations/{reservation_id}/confirm")
def admin_confirm_reservation(reservation_id: int, current_member: models.Member = Depends(get_current_member), db: Session = Depends(get_db)):
    db_res = db.query(models.Reservation).filter(models.Reservation.id == reservation_id).first()
    if not db_res:
        raise HTTPException(status_code=404, detail="Reservation not found")
    db_res.status = "confirmed"
    db.commit()
    db.refresh(db_res)
    return db_res

@app.patch("/api/admin/reservations/{reservation_id}/arrive-confirm")
def admin_arrive_confirm_reservation(reservation_id: int, current_member: models.Member = Depends(get_current_member), db: Session = Depends(get_db)):
    db_res = db.query(models.Reservation).filter(models.Reservation.id == reservation_id).first()
    if not db_res:
        raise HTTPException(status_code=404, detail="Reservation not found")
    db_res.arriving_confirmed = 1
    db.commit()
    db.refresh(db_res)
    return db_res

@app.post("/api/admin/reservations/bulk-delete")
def admin_bulk_delete_reservations(data: schemas.BulkDelete, current_member: models.Member = Depends(get_current_member), db: Session = Depends(get_db)):
    db.query(models.Reservation).filter(models.Reservation.id.in_(data.ids)).update({"deleted_by_admin": 1}, synchronize_session=False)
    db.commit()
    return {"detail": f"{len(data.ids)} reservations deleted"}

@app.patch("/api/reservations/{reservation_id}/cancel")
def cancel_reservation(reservation_id: int, db: Session = Depends(get_db)):
    db_res = db.query(models.Reservation).filter(models.Reservation.id == reservation_id).first()
    if not db_res:
        raise HTTPException(status_code=404, detail="Reservation not found")
    db_res.status = "cancelled"
    db_res.cancelled_at = datetime.utcnow().strftime("%Y-%m-%d")
    db.commit()
    db.refresh(db_res)
    return db_res

@app.post("/api/reservations/sync", response_model=List[schemas.ReservationResponse])
def sync_reservations(data: schemas.BulkDelete, db: Session = Depends(get_db)):
    return db.query(models.Reservation).filter(
        models.Reservation.id.in_(data.ids),
        models.Reservation.deleted_by_user == 0
    ).all()

@app.patch("/api/reservations/{reservation_id}/user-delete")
def user_delete_reservation(reservation_id: int, db: Session = Depends(get_db)):
    db_res = db.query(models.Reservation).filter(models.Reservation.id == reservation_id).first()
    if not db_res:
        raise HTTPException(status_code=404, detail="Reservation not found")
    db_res.deleted_by_user = 1
    db.commit()
    return {"detail": "Reservation deleted by user"}

@app.post("/api/table/auth")
def table_auth(req: schemas.TableAuthRequest, db: Session = Depends(get_db)):
    table = db.query(models.ActiveTable).filter(models.ActiveTable.table_number == req.table_number).first()
    if not table or not table.is_active or table.auth_code != req.auth_code:
        raise HTTPException(status_code=401, detail="Invalid table number or code")
    return {"message": "Authenticated successfully", "table_number": table.table_number}

@app.get("/api/menu", response_model=List[schemas.MenuItemResponse])
def get_menu(db: Session = Depends(get_db)):
    return db.query(models.MenuItem).filter(models.MenuItem.is_available == True).all()

@app.post("/api/orders", response_model=schemas.OrderResponse)
def create_order(req: schemas.OrderCreate, db: Session = Depends(get_db)):
    table = db.query(models.ActiveTable).filter(models.ActiveTable.table_number == req.table_number).first()
    if not table or not table.is_active:
        raise HTTPException(status_code=400, detail="Table is not active")
    
    total = sum([item.quantity * item.price_per_item for item in req.items])
    db_order = models.Order(table_number=req.table_number, total_amount=total, status="pending", reservation_id=table.reservation_id)
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    
    for item in req.items:
        db_item = models.OrderItem(order_id=db_order.id, **item.model_dump())
        db.add(db_item)
    
    db.commit()
    db.refresh(db_order)
    return db_order

@app.get("/api/admin/tables", response_model=List[schemas.ActiveTableResponse])
def get_tables(current_member: models.Member = Depends(get_current_member), db: Session = Depends(get_db)):
    return db.query(models.ActiveTable).order_by(models.ActiveTable.table_number).all()

import random
import string

@app.post("/api/admin/tables/{table_id}/generate-code", response_model=schemas.ActiveTableResponse)
def generate_table_code(table_id: int, reservation_id: int | None = None, current_member: models.Member = Depends(get_current_member), db: Session = Depends(get_db)):
    table = db.query(models.ActiveTable).filter(models.ActiveTable.id == table_id).first()
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")
    
    code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    table.auth_code = code
    table.is_active = True
    table.reservation_id = reservation_id
    db.commit()
    db.refresh(table)
    return table

@app.post("/api/admin/tables/{table_id}/clear", response_model=schemas.ActiveTableResponse)
def clear_table(table_id: int, current_member: models.Member = Depends(get_current_member), db: Session = Depends(get_db)):
    table = db.query(models.ActiveTable).filter(models.ActiveTable.id == table_id).first()
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")
    table.auth_code = None
    table.is_active = False
    table.reservation_id = None
    db.commit()
    db.refresh(table)
    return table

@app.get("/api/admin/orders", response_model=List[schemas.OrderResponse])
def get_orders(current_member: models.Member = Depends(get_current_member), db: Session = Depends(get_db)):
    return db.query(models.Order).order_by(models.Order.created_at.desc()).all()

@app.patch("/api/admin/orders/{order_id}/status", response_model=schemas.OrderResponse)
def update_order_status(order_id: int, status: str, current_member: models.Member = Depends(get_current_member), db: Session = Depends(get_db)):
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    db_order.status = status
    db.commit()
    db.refresh(db_order)
    return db_order

@app.get("/api/admin/menu", response_model=List[schemas.MenuItemResponse])
def admin_get_menu(current_member: models.Member = Depends(get_current_member), db: Session = Depends(get_db)):
    return db.query(models.MenuItem).all()

@app.post("/api/admin/menu", response_model=schemas.MenuItemResponse)
def admin_create_menu_item(item: schemas.MenuItemCreate, current_member: models.Member = Depends(get_current_member), db: Session = Depends(get_db)):
    db_item = models.MenuItem(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@app.put("/api/admin/menu/{item_id}", response_model=schemas.MenuItemResponse)
def admin_update_menu_item(item_id: int, item: schemas.MenuItemUpdate, current_member: models.Member = Depends(get_current_member), db: Session = Depends(get_db)):
    db_item = db.query(models.MenuItem).filter(models.MenuItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    
    for key, value in item.model_dump(exclude_unset=True).items():
        setattr(db_item, key, value)
    
    db.commit()
    db.refresh(db_item)
    return db_item

@app.delete("/api/admin/menu/{item_id}")
def admin_delete_menu_item(item_id: int, current_member: models.Member = Depends(get_current_member), db: Session = Depends(get_db)):
    db_item = db.query(models.MenuItem).filter(models.MenuItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    db.delete(db_item)
    db.commit()
    return {"detail": "Menu item deleted"}

@app.post("/api/admin/menu/upload-image")
async def upload_menu_image(file: UploadFile = File(...), current_member: models.Member = Depends(get_current_member), db: Session = Depends(get_db)):
    file_extension = os.path.splitext(file.filename or "")[1]
    unique_filename = f"menu_{uuid.uuid4().hex}{file_extension}"
    file_path = f"assets/images/uploads/{unique_filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"image_url": f"/{file_path}"}


app.mount("/assets", StaticFiles(directory="assets"), name="assets")

@app.get("/")
def read_index():
    return FileResponse("index.html")

@app.get("/menu")
def read_menu():
    return FileResponse("menu.html")

@app.get("/login")
def read_login():
    return FileResponse("login.html")

@app.get("/dashboard")
def read_dashboard():
    return FileResponse("dashboard.html")

@app.get("/reviews")
@app.get("/reviews.html")
def read_reviews_page():
    return FileResponse("reviews.html")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
