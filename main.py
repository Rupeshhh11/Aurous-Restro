from fastapi import FastAPI, Depends, HTTPException, Form, UploadFile, File
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os
import shutil
import uuid

import models
import schemas
from database import engine, get_db

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Aurous Restro API")

# Ensure upload directory exists
os.makedirs("assets/images/uploads", exist_ok=True)

# API Endpoints
@app.post("/api/reservations", response_model=schemas.ReservationResponse)
def create_reservation(reservation: schemas.ReservationCreate, db: Session = Depends(get_db)):
    db_reservation = models.Reservation(**reservation.model_dump())
    db.add(db_reservation)
    db.commit()
    db.refresh(db_reservation)
    return db_reservation

@app.get("/api/reservations", response_model=list[schemas.ReservationResponse])
def get_reservations(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    reservations = db.query(models.Reservation).offset(skip).limit(limit).all()
    return reservations

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
        # Generate unique filename
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

@app.get("/api/reviews", response_model=list[schemas.ReviewResponse])
def get_reviews(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    # Get reviews ordered by newest first
    reviews = db.query(models.Review).order_by(models.Review.created_at.desc()).offset(skip).limit(limit).all()
    return reviews


# Mount static files correctly
app.mount("/assets", StaticFiles(directory="assets"), name="assets")

# Serve HTML pages directly
@app.get("/")
def read_index():
    return FileResponse("index.html")

@app.get("/index.html")
def read_index_html():
    return FileResponse("index.html")

@app.get("/reviews.html")
def read_reviews():
    return FileResponse("reviews.html")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
