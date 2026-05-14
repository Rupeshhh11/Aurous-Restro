from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ReservationCreate(BaseModel):
    name: str
    phone: str
    occasion: str
    date: str
    hour: str
    minute: str
    ampm: str
    guest_count: int

class ReservationResponse(ReservationCreate):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

class ReviewResponse(BaseModel):
    id: int
    name: str
    location: str
    rating: int
    review_text: str
    image_url: Optional[str] = None
    reply_text: Optional[str] = None
    replied_at: Optional[datetime] = None
    created_at: datetime
    class Config:
        from_attributes = True

class ReviewReply(BaseModel):
    review_id: int
    reply_text: str

class MemberBase(BaseModel):
    username: str
    full_name: Optional[str] = None

class MemberCreate(MemberBase):
    password: str

class MemberResponse(MemberBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
