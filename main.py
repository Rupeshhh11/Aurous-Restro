from fastapi import FastAPI, Depends, HTTPException, Form, UploadFile, File, Query, status
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, RedirectResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import text
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import os
import shutil
import uuid
from typing import List, Optional
from dotenv import load_dotenv

# Load .env from the directory this file lives in (works locally and on Render)
_env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
load_dotenv(_env_path)
load_dotenv()  # also pick up any CWD .env

import models
from urllib.parse import urlparse
import schemas
from database import engine, get_db
import cloudinary
import cloudinary.uploader

cloudinary_url = os.getenv("CLOUDINARY_URL")
if cloudinary_url and cloudinary_url.startswith("cloudinary://"):
    _parsed = urlparse(cloudinary_url)
    cloudinary.config(
        cloud_name=_parsed.hostname,
        api_key=_parsed.username,
        api_secret=_parsed.password,
        secure=True
    )
else:
    cloudinary.config(
        cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME", "qahddnsk"),
        api_key=os.getenv("CLOUDINARY_API_KEY", "115729462567943"),
        api_secret=os.getenv("CLOUDINARY_API_SECRET", "c6BU-l-B7zwIqEMRj-QnMRKZwkM"),
        secure=True
    )

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
    try:
        conn.execute(text("ALTER TABLE vibe_photos ADD COLUMN approved BOOLEAN DEFAULT FALSE"))
        conn.commit()
    except Exception:
        pass
    # Orders table migrations
    for col_def in [
        "order_type VARCHAR DEFAULT 'dine_in'",
        "customer_name VARCHAR",
        "customer_phone VARCHAR",
        "subtotal INTEGER DEFAULT 0",
        "cgst_amount FLOAT DEFAULT 0.0",
        "sgst_amount FLOAT DEFAULT 0.0",
        "discount_amount FLOAT DEFAULT 0.0",
        "service_charge FLOAT DEFAULT 0.0",
        "grand_total FLOAT DEFAULT 0.0",
        "payment_method VARCHAR DEFAULT 'cash'",
        "invoice_number VARCHAR",
        "notes VARCHAR"
    ]:
        try:
            conn.execute(text(f"ALTER TABLE orders ADD COLUMN {col_def}"))
            conn.commit()
        except Exception:
            pass

# Seed default bill settings if not present
with engine.connect() as conn:
    try:
        res = conn.execute(text("SELECT COUNT(*) FROM bill_settings")).scalar()
        if res == 0:
            conn.execute(text("""
                INSERT INTO bill_settings (
                    restaurant_name, tagline, address, phone, gstin, fssai_number,
                    cgst_rate, sgst_rate, service_charge_rate, enable_gst, enable_service_charge,
                    invoice_prefix, header_note, footer_message, refund_policy, show_fssai, show_gstin, updated_at
                ) VALUES (
                    'Aurous Restro & Cafe', 'Fine Dining & Aesthetic Vibes', '123 Gourmet Boulevard, Food District',
                    '+91 98765 43210', '07AAAAA0000A1Z5', '10020011000123', 2.5, 2.5, 0.0, true, false,
                    'AUR-', 'TAX INVOICE', 'Thank you for dining with us! Please visit again.',
                    'Goods / Food once sold will not be returned or refunded.', true, true, CURRENT_TIMESTAMP
                )
            """))
            conn.commit()
    except Exception as e:
        pass



app = FastAPI(title="Aurous Restro API")


SECRET_KEY = os.getenv("AUROUS_SECRET_KEY", "aurous_secret_key_change_this_in_production")
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


# Local uploads folder is no longer needed since we store images on Cloudinary

ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}
MAX_UPLOAD_BYTES = 5 * 1024 * 1024


def validate_image_upload(file: UploadFile) -> str:
    extension = os.path.splitext(file.filename or "")[1].lower()
    expected_extension = ALLOWED_IMAGE_TYPES.get(file.content_type or "")
    if not expected_extension or extension not in {expected_extension, ".jpeg" if expected_extension == ".jpg" else expected_extension}:
        raise HTTPException(status_code=400, detail="Only JPG, PNG, and WebP images are allowed.")

    file.file.seek(0, os.SEEK_END)
    size = file.file.tell()
    file.file.seek(0)
    if size <= 0:
        raise HTTPException(status_code=400, detail="Uploaded image is empty.")
    if size > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=400, detail="Image must be 5 MB or smaller.")
    return ".jpg" if extension == ".jpeg" else extension


def save_upload(file: UploadFile, prefix: str) -> str:
    file_extension = validate_image_upload(file)
    # We do not append the extension to the public_id, Cloudinary manages formats automatically
    unique_filename = f"{prefix}_{uuid.uuid4().hex}"
    try:
        upload_result = cloudinary.uploader.upload(
            file.file,
            public_id=unique_filename,
            folder="aurous_uploads"
        )
        return upload_result.get("secure_url")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload image to Cloudinary: {str(e)}")



@app.on_event("startup")
async def startup_event():
    db = next(get_db())
    try:
        for stmt in [
            "ALTER TABLE active_tables ADD COLUMN reservation_id INTEGER REFERENCES reservations(id)",
            "ALTER TABLE orders ADD COLUMN reservation_id INTEGER REFERENCES reservations(id)",
            "ALTER TABLE reservations ADD COLUMN status VARCHAR DEFAULT 'pending'",
            "ALTER TABLE reservations ADD COLUMN deleted_by_admin INTEGER DEFAULT 0",
            "ALTER TABLE reservations ADD COLUMN deleted_by_user INTEGER DEFAULT 0",
            "ALTER TABLE reservations ADD COLUMN arriving_confirmed INTEGER DEFAULT 0",
            "ALTER TABLE reviews ADD COLUMN is_pinned BOOLEAN DEFAULT FALSE"
        ]:
            try:
                db.execute(text(stmt))
                db.commit()
            except Exception:
                db.rollback()
        # Ensure caption column exists for vibe_photos
        try:
            db.execute(text("ALTER TABLE vibe_photos ADD COLUMN caption VARCHAR"))
            db.commit()
        except Exception:
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
                {"name": "Roasted Chicken Chilli", "category": "Starters", "price": 450, "is_veg": False, "description": "Spicy roasted chicken tossed in Asian sauces.", "image_url": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&q=80&w=1013"},
                {"name": "Chef's Special Sizzler", "category": "Main Course", "price": 650, "is_veg": False, "description": "Smoked directly at your table. Rich and flavorful.", "image_url": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=1469"},
                {"name": "Golden Fish Fingers", "category": "Starters", "price": 380, "is_veg": False, "description": "Crispy on the outside, tender inside. Served with tartar sauce.", "image_url": "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&q=80&w=1374"},
                {"name": "Paneer Tikka Masala", "category": "Main Course", "price": 350, "is_veg": True, "description": "Grilled cottage cheese in rich tomato gravy.", "image_url": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=1000"},
                {"name": "Aurous Signature Mix", "category": "Drinks", "price": 400, "is_veg": True, "description": "Crafted by mixologists to perfectly accompany your evening.", "image_url": "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=1470"},
                {"name": "Butter Naan", "category": "Roti", "price": 60, "is_veg": True, "description": "Soft and fluffy Indian flatbread brushed with butter.", "image_url": "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=1000"}
            ]
            for item in dummy_menu:
                db.add(models.MenuItem(**item))
            db.commit()
    finally:
        db.close()

    # After startup tables/seeds, sync PostgreSQL data to local SQLite backup
    try:
        from database import sync_sqlite_backup
        sync_sqlite_backup()
    except Exception as _sync_err:
        print(f"[Startup] SQLite backup sync skipped: {_sync_err}")



@app.get("/api/db-status")
def get_db_status():
    from database import is_postgres, db_connection_info
    return {
        "status": "connected",
        "is_postgres": is_postgres,
        "database": "PostgreSQL (Render Persistent)" if is_postgres else "SQLite (Ephemeral Fallback)",
        "info": db_connection_info,
        "is_render": "RENDER" in os.environ
    }

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
    images: Optional[List[UploadFile]] = File(None),
    db: Session = Depends(get_db)
):
    name = name.strip()
    location = location.strip()
    review_text = review_text.strip()
    if not 1 <= rating <= 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5.")
    if not name or len(name) > 80 or len(location) > 80 or not review_text or len(review_text) > 1000:
        raise HTTPException(status_code=400, detail="Please provide valid review details.")

    image_urls = []
    if images:
        if len(images) > 4:
            raise HTTPException(status_code=400, detail="You can upload up to 4 images.")
        for img in images:
            if img.filename:
                image_urls.append(save_upload(img, "review"))
    
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

def _reservation_with_orders_query(db: Session):
    return db.query(models.Reservation).options(
        joinedload(models.Reservation.orders).joinedload(models.Order.items)
    )

@app.get("/api/admin/reservations", response_model=List[schemas.ReservationResponse])
def admin_get_reservations(current_member: models.Member = Depends(get_current_member), db: Session = Depends(get_db)):
    return _reservation_with_orders_query(db).filter(
        models.Reservation.deleted_by_admin == 0
    ).order_by(models.Reservation.created_at.desc()).all()

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
def delete_review_public(review_id: int, current_member: models.Member = Depends(get_current_member), db: Session = Depends(get_db)):
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

@app.put("/api/admin/reviews/{review_id}/pin", response_model=schemas.ReviewResponse)
def admin_toggle_pin_review(review_id: int, current_member: models.Member = Depends(get_current_member), db: Session = Depends(get_db)):
    db_review = db.query(models.Review).filter(models.Review.id == review_id).first()
    if not db_review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    db_review.is_pinned = not db_review.is_pinned
    db.commit()
    db.refresh(db_review)
    return db_review
    
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
    return _reservation_with_orders_query(db).filter(
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

@app.post("/api/table/auth", response_model=schemas.TableAuthResponse)
def table_auth(req: schemas.TableAuthRequest, db: Session = Depends(get_db)):
    table = db.query(models.ActiveTable).filter(models.ActiveTable.table_number == req.table_number).first()
    if not table or not table.is_active or table.auth_code != req.auth_code:
        raise HTTPException(status_code=401, detail="Invalid table number or code")

    linked_reservation = None
    if table.reservation_id:
        linked_reservation = _reservation_with_orders_query(db).filter(
            models.Reservation.id == table.reservation_id,
            models.Reservation.deleted_by_user == 0
        ).first()

    return {
        "message": "Authenticated successfully",
        "table_number": table.table_number,
        "reservation_id": table.reservation_id,
        "reservation": linked_reservation,
    }

@app.get("/api/menu", response_model=List[schemas.MenuItemResponse])
def get_menu(db: Session = Depends(get_db)):
    return db.query(models.MenuItem).filter(models.MenuItem.is_available == True).all()

@app.get("/api/bill-settings", response_model=schemas.BillSettingResponse)
def get_bill_settings(db: Session = Depends(get_db)):
    setting = db.query(models.BillSetting).first()
    if not setting:
        setting = models.BillSetting()
        db.add(setting)
        db.commit()
        db.refresh(setting)
    return setting

@app.put("/api/admin/bill-settings", response_model=schemas.BillSettingResponse)
def update_bill_settings(
    req: schemas.BillSettingUpdate,
    current_member: models.Member = Depends(get_current_member),
    db: Session = Depends(get_db)
):
    setting = db.query(models.BillSetting).first()
    if not setting:
        setting = models.BillSetting()
        db.add(setting)
        db.flush()

    for key, value in req.model_dump(exclude_unset=True).items():
        setattr(setting, key, value)
    
    setting.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(setting)
    return setting

@app.post("/api/orders", response_model=schemas.OrderResponse)
def create_order(req: schemas.OrderCreate, db: Session = Depends(get_db)):
    reservation_id = None
    if req.table_number > 0:
        table = db.query(models.ActiveTable).filter(models.ActiveTable.table_number == req.table_number).first()
        if table and table.is_active:
            reservation_id = table.reservation_id

    subtotal = sum([item.quantity * item.price_per_item for item in req.items])
    grand_total = req.grand_total if req.grand_total is not None and req.grand_total > 0 else float(subtotal)
    
    # Generate sequential/timestamped invoice number
    today_str = datetime.utcnow().strftime("%Y%m%d")
    rand_suffix = ''.join(random.choices(string.digits, k=4))
    invoice_no = req.invoice_number or f"AUR-{today_str}-{rand_suffix}"

    db_order = models.Order(
        table_number=req.table_number,
        status=req.status or "pending",
        total_amount=int(grand_total),
        reservation_id=reservation_id,
        order_type=req.order_type or "dine_in",
        customer_name=req.customer_name,
        customer_phone=req.customer_phone,
        subtotal=subtotal,
        cgst_amount=req.cgst_amount or 0.0,
        sgst_amount=req.sgst_amount or 0.0,
        discount_amount=req.discount_amount or 0.0,
        service_charge=req.service_charge or 0.0,
        grand_total=grand_total,
        payment_method=req.payment_method or "cash",
        invoice_number=invoice_no,
        notes=req.notes
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    
    for item in req.items:
        db_item = models.OrderItem(
            order_id=db_order.id,
            item_name=item.item_name,
            quantity=item.quantity,
            price_per_item=item.price_per_item
        )
        db.add(db_item)
    
    db.commit()
    db.refresh(db_order)
    return db_order

@app.post("/api/admin/orders/pos", response_model=schemas.OrderResponse)
def admin_pos_create_order(
    req: schemas.OrderCreate,
    current_member: models.Member = Depends(get_current_member),
    db: Session = Depends(get_db)
):
    return create_order(req, db)


@app.get("/api/admin/tables", response_model=List[schemas.ActiveTableResponse])
def get_tables(current_member: models.Member = Depends(get_current_member), db: Session = Depends(get_db)):
    return db.query(models.ActiveTable).options(
        joinedload(models.ActiveTable.reservation)
    ).order_by(models.ActiveTable.table_number).all()

import random
import string

@app.post("/api/admin/tables/{table_id}/generate-code", response_model=schemas.ActiveTableResponse)
def generate_table_code(table_id: int, reservation_id: int | None = None, current_member: models.Member = Depends(get_current_member), db: Session = Depends(get_db)):
    table = db.query(models.ActiveTable).filter(models.ActiveTable.id == table_id).first()
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")

    if reservation_id is not None:
        res = db.query(models.Reservation).filter(models.Reservation.id == reservation_id).first()
        if not res:
            raise HTTPException(status_code=404, detail="Reservation not found")
    
    code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    table.auth_code = code
    table.is_active = True
    table.reservation_id = reservation_id
    db.commit()
    db.refresh(table)
    table = db.query(models.ActiveTable).options(joinedload(models.ActiveTable.reservation)).filter(models.ActiveTable.id == table_id).first()
    return table

@app.patch("/api/admin/tables/{table_id}/link-reservation", response_model=schemas.ActiveTableResponse)
def link_table_reservation(table_id: int, reservation_id: int | None = None, current_member: models.Member = Depends(get_current_member), db: Session = Depends(get_db)):
    table = db.query(models.ActiveTable).filter(models.ActiveTable.id == table_id).first()
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")
    if not table.is_active:
        raise HTTPException(status_code=400, detail="Activate table first")

    if reservation_id is not None:
        res = db.query(models.Reservation).filter(models.Reservation.id == reservation_id).first()
        if not res:
            raise HTTPException(status_code=404, detail="Reservation not found")
        table.reservation_id = reservation_id
    else:
        table.reservation_id = None

    db.commit()
    table = db.query(models.ActiveTable).options(joinedload(models.ActiveTable.reservation)).filter(models.ActiveTable.id == table_id).first()
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
    return db.query(models.Order).options(
        joinedload(models.Order.items),
        joinedload(models.Order.reservation),
    ).order_by(models.Order.created_at.desc()).all()

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
    return {"image_url": save_upload(file, "menu")}


@app.get("/api/vibe-photos", response_model=List[schemas.VibePhotoResponse])
def get_vibe_photos(limit: Optional[int] = Query(None, ge=1, le=500), offset: int = Query(0, ge=0), db: Session = Depends(get_db)):
    query = db.query(models.VibePhoto).filter(models.VibePhoto.approved == True).order_by(models.VibePhoto.created_at.desc())
    if limit is not None:
        query = query.offset(offset).limit(limit)
    photos = query.all()
    if not photos and offset == 0:
        # Fallback premium Unsplash images if database is empty.
        # likes=0 so they are NOT fake — real count persists once liked via the like endpoint
        return [
            schemas.VibePhotoResponse(id=-1, image_url="https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&q=80&w=1470", likes=0, approved=True, created_at=datetime.utcnow()),
            schemas.VibePhotoResponse(id=-2, image_url="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=1470", likes=0, approved=True, created_at=datetime.utcnow() - timedelta(days=1)),
            schemas.VibePhotoResponse(id=-3, image_url="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1470", likes=0, approved=True, created_at=datetime.utcnow() - timedelta(days=2))
        ]
    return photos

@app.post("/api/vibe-photos/{photo_id}/like", response_model=schemas.VibePhotoResponse)
def like_vibe_photo(photo_id: int, db: Session = Depends(get_db)):
    if photo_id < 0:
        # It's a negative-ID fallback image.
        # First check if it already exists by URL so we don't duplicate rows.
        fallbacks = {
            -1: "https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&q=80&w=1470",
            -2: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=1470",
            -3: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1470"
        }
        url = fallbacks.get(photo_id, fallbacks[-1])
        # Look up by URL — it might have been inserted already
        db_photo = db.query(models.VibePhoto).filter(models.VibePhoto.image_url == url).first()
        if db_photo:
            db_photo.likes += 1
        else:
            db_photo = models.VibePhoto(image_url=url, likes=1, approved=True)
            db.add(db_photo)
        db.commit()
        db.refresh(db_photo)
        return db_photo
    
    db_photo = db.query(models.VibePhoto).filter(models.VibePhoto.id == photo_id).first()
    if not db_photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    db_photo.likes += 1
    db.commit()
    db.refresh(db_photo)
    return db_photo

@app.post("/api/vibe-photos/upload", response_model=schemas.VibePhotoResponse)
async def upload_vibe_photo(file: UploadFile = File(...), caption: str | None = Form(None), db: Session = Depends(get_db)):
    image_url = save_upload(file, "vibe")
    if caption is not None:
        caption = caption.strip()[:240]

    db_photo = models.VibePhoto(image_url=image_url, approved=False, caption=caption)
    db.add(db_photo)
    db.commit()
    db.refresh(db_photo)
    return db_photo

# Admin Moderation / Vibe APIs
@app.get("/api/admin/vibe-photos", response_model=List[schemas.VibePhotoResponse])
def admin_get_all_vibe_photos(current_member: models.Member = Depends(get_current_member), db: Session = Depends(get_db)):
    return db.query(models.VibePhoto).order_by(models.VibePhoto.created_at.desc()).all()

@app.post("/api/admin/vibe-photos", response_model=schemas.VibePhotoResponse)
async def admin_upload_vibe_photo(file: UploadFile = File(...), caption: str | None = Form(None), current_member: models.Member = Depends(get_current_member), db: Session = Depends(get_db)):
    image_url = save_upload(file, "vibe")
    if caption is not None:
        caption = caption.strip()[:240]
    
    db_photo = models.VibePhoto(image_url=image_url, approved=True, caption=caption)
    db.add(db_photo)
    db.commit()
    db.refresh(db_photo)
    return db_photo

@app.post("/api/admin/vibe-photos/{photo_id}/approve", response_model=schemas.VibePhotoResponse)
def approve_vibe_photo(photo_id: int, current_member: models.Member = Depends(get_current_member), db: Session = Depends(get_db)):
    db_photo = db.query(models.VibePhoto).filter(models.VibePhoto.id == photo_id).first()
    if not db_photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    db_photo.approved = True
    db.commit()
    db.refresh(db_photo)
    return db_photo

@app.delete("/api/admin/vibe-photos/{photo_id}")
def admin_delete_vibe_photo(photo_id: int, current_member: models.Member = Depends(get_current_member), db: Session = Depends(get_db)):
    db_photo = db.query(models.VibePhoto).filter(models.VibePhoto.id == photo_id).first()
    if not db_photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    
    # Delete local file if it exists
    if db_photo.image_url.startswith("/assets/images/uploads/"):
        try:
            os.remove(db_photo.image_url.lstrip("/"))
        except Exception:
            pass
    elif "res.cloudinary.com" in db_photo.image_url:
        try:
            parts = db_photo.image_url.split("/")
            if "aurous_uploads" in parts:
                folder_index = parts.index("aurous_uploads")
                cloudinary_public_id = "/".join(parts[folder_index:])
                cloudinary_public_id = cloudinary_public_id.split(".")[0]
            else:
                last_part = parts[-1]
                cloudinary_public_id = last_part.split(".")[0]
            cloudinary.uploader.destroy(cloudinary_public_id)
        except Exception:
            pass
            
    db.delete(db_photo)
    db.commit()
    return {"detail": "Photo deleted"}

# Vibe Banner APIs
@app.get("/api/vibe-banner", response_model=Optional[schemas.VibeBannerResponse])
def get_vibe_banner(db: Session = Depends(get_db)):
    return db.query(models.VibeBanner).first()

@app.post("/api/admin/vibe-banner", response_model=schemas.VibeBannerResponse)
async def update_vibe_banner(
    files: Optional[List[UploadFile]] = File(None),
    existing_urls: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    current_member: models.Member = Depends(get_current_member),
    db: Session = Depends(get_db)
):
    if description is not None:
        description = description.strip()
        words = description.split()
        if len(words) > 20:
            raise HTTPException(status_code=400, detail="Description cannot be more than 20 words.")
        if len(description) > 180:
            raise HTTPException(status_code=400, detail="Description is too long.")

    banner = db.query(models.VibeBanner).first()
    if not banner:
        banner = models.VibeBanner()
        db.add(banner)
        db.flush()

    old_urls = [u.strip() for u in (banner.image_url or "").split(",") if u.strip()]
    kept_urls = [u.strip() for u in (existing_urls or "").split(",") if u.strip()] if existing_urls is not None else old_urls

    new_urls = []
    if files:
        valid_files = [f for f in files if f and f.filename]
        if len(kept_urls) + len(valid_files) > 4:
            raise HTTPException(status_code=400, detail="You can have up to 4 banner photos in total.")
        for f in valid_files:
            new_urls.append(save_upload(f, "banner"))

    final_urls = kept_urls + new_urls
    if len(final_urls) > 4:
        final_urls = final_urls[:4]

    # Clean up any removed Cloudinary images
    for u in old_urls:
        if u not in final_urls and "cloudinary.com" in u:
            try:
                parts = u.split("/")
                if "aurous_uploads" in parts:
                    idx = parts.index("aurous_uploads")
                    public_id = "/".join(parts[idx:]).split(".")[0]
                else:
                    public_id = parts[-1].split(".")[0]
                cloudinary.uploader.destroy(public_id)
            except Exception as e:
                print(f"Error destroying old Cloudinary banner image: {e}")

    banner.image_url = ",".join(final_urls) if final_urls else None
    if description is not None:
        banner.description = description

    db.commit()
    db.refresh(banner)
    return banner

@app.delete("/api/admin/vibe-banner", response_model=Optional[schemas.VibeBannerResponse])
async def delete_vibe_banner(
    index: Optional[int] = Query(None),
    image_url: Optional[str] = Query(None),
    current_member: models.Member = Depends(get_current_member),
    db: Session = Depends(get_db)
):
    banner = db.query(models.VibeBanner).first()
    if not banner or not banner.image_url:
        return banner

    urls = [u.strip() for u in banner.image_url.split(",") if u.strip()]

    target_url_to_delete = None

    if image_url:
        if image_url in urls:
            urls.remove(image_url)
            target_url_to_delete = image_url
    elif index is not None and 0 <= index < len(urls):
        target_url_to_delete = urls.pop(index)
    else:
        # Delete all banner images
        for u in urls:
            if "cloudinary.com" in u:
                try:
                    parts = u.split("/")
                    if "aurous_uploads" in parts:
                        idx = parts.index("aurous_uploads")
                        public_id = "/".join(parts[idx:]).split(".")[0]
                    else:
                        public_id = parts[-1].split(".")[0]
                    cloudinary.uploader.destroy(public_id)
                except Exception as e:
                    print(f"Error destroying Cloudinary banner image: {e}")
        banner.image_url = None
        db.commit()
        db.refresh(banner)
        return banner

    if target_url_to_delete and "cloudinary.com" in target_url_to_delete:
        try:
            parts = target_url_to_delete.split("/")
            if "aurous_uploads" in parts:
                idx = parts.index("aurous_uploads")
                public_id = "/".join(parts[idx:]).split(".")[0]
            else:
                public_id = parts[-1].split(".")[0]
            cloudinary.uploader.destroy(public_id)
        except Exception as e:
            print(f"Error destroying Cloudinary image: {e}")

    banner.image_url = ",".join(urls) if urls else None
    db.commit()
    db.refresh(banner)
    return banner


app.mount("/assets", StaticFiles(directory="assets"), name="assets")

@app.get("/")
def read_index():
    response = FileResponse("index.html")
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response

@app.get("/menu")
def read_menu():
    return FileResponse("menu.html")

@app.get("/login")
def read_login():
    return RedirectResponse(url="/?admin=true")

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


