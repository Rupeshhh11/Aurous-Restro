from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
import datetime

class Member(Base):
    __tablename__ = "members"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

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
    status = Column(String, default="pending")
    deleted_by_admin = Column(Integer, default=0)
    deleted_by_user = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    location = Column(String)
    rating = Column(Integer)
    review_text = Column(String)
    image_url = Column(String, nullable=True)
    reply_text = Column(String, nullable=True)
    replied_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
