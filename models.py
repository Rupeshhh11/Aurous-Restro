from sqlalchemy import Column, Integer, String, DateTime
from database import Base
import datetime

class Reservation(Base):
    __tablename__ = "reservations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    phone = Column(String)
    occasion = Column(String)
    date = Column(String)
    hour = Column(String)
    minute = Column(String)
    ampm = Column(String)
    guest_count = Column(Integer)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    location = Column(String)
    rating = Column(Integer)
    review_text = Column(String)
    image_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
