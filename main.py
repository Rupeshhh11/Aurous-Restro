from fastapi import FastAPI, Depends, HTTPException, Form, UploadFile, File, status
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
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

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Aurous Restro API")

# Auth settings
SECRET_KEY = "aurous_secret_key_change_this_in_production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 600 # Long expiry for convenience

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# Helper functions for Auth
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
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = schemas.TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = db.query(models.Member).filter(models.Member.username == token_data.username).first()
    if user is None:
        raise credentials_exception
    return user

# Ensure upload directory exists
os.makedirs("assets/images/uploads", exist_ok=True)

# Create a default admin user if none exists
@app.on_event("startup")
async def create_admin():
    db = next(get_db())
    admin = db.query(models.Member).filter(models.Member.username == "admin").first()
    if not admin:
        hashed_pw = get_password_hash("aurous123")
        admin_member = models.Member(username="admin", hashed_password=hashed_pw, full_name="Aurous Admin")
        db.add(admin_member)
        db.commit()

# --- Public API Endpoints ---

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
    image: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    image_url = None
    if image and image.filename:
        file_extension = os.path.splitext(image.filename)[1]
        unique_filename = f"{uuid.uuid4().hex}{file_extension}"
        file_path = f"assets/images/uploads/{unique_filename}"
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        image_url = f"/{file_path}"

    db_review = models.Review(
        name=name,
        location=location,
        rating=rating,
        review_text=review_text,
        image_url=image_url
    )
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review

# --- Admin/Auth API Endpoints ---

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
    return db.query(models.Reservation).order_by(models.Reservation.created_at.desc()).all()

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

# --- Static Routes ---

app.mount("/assets", StaticFiles(directory="assets"), name="assets")

@app.get("/")
def read_index():
    return FileResponse("index.html")

@app.get("/login")
def read_login():
    return FileResponse("login.html")

@app.get("/dashboard")
def read_dashboard():
    return FileResponse("dashboard.html")

@app.get("/reviews")
def read_reviews_page():
    return FileResponse("reviews.html")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
