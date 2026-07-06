from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime

class ReservationCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=80)
    phone: str = Field(..., min_length=7, max_length=20)
    occasion: str = Field(default="", max_length=80)
    date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")
    hour: str = Field(..., pattern=r"^(0?[1-9]|1[0-2])$")
    minute: str = Field(..., pattern=r"^[0-5]\d$")
    ampm: str = Field(..., pattern=r"^(AM|PM)$")
    guest_count: int = Field(..., ge=1, le=20)
    status: str = "pending"

    @field_validator("name", "phone", "occasion", mode="before")
    @classmethod
    def strip_text(cls, value):
        return value.strip() if isinstance(value, str) else value

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value):
        digits = "".join(ch for ch in value if ch.isdigit())
        if len(digits) < 7 or len(digits) > 15:
            raise ValueError("Phone number must contain 7 to 15 digits.")
        return value

    @field_validator("status")
    @classmethod
    def validate_status(cls, value):
        allowed = {"pending", "confirmed", "completed", "cancelled"}
        if value not in allowed:
            raise ValueError("Invalid reservation status.")
        return value

class ReservationResponse(ReservationCreate):
    id: int
    created_at: datetime
    deleted_by_admin: int = 0
    deleted_by_user: int = 0
    cancelled_at: Optional[str] = None
    arriving_confirmed: Optional[int] = 0
    orders: list["OrderSummaryResponse"] = Field(default_factory=list)
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
    is_pinned: bool = False
    created_at: datetime
    class Config:
        from_attributes = True

class VibePhotoResponse(BaseModel):
    id: int
    image_url: str
    likes: int
    approved: bool
    caption: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True

class VibeBannerResponse(BaseModel):
    id: int
    image_url: Optional[str] = None
    description: Optional[str] = None
    class Config:
        from_attributes = True

class ReviewReply(BaseModel):
    review_id: int
    reply_text: str = Field(..., min_length=1, max_length=600)

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

class BulkDelete(BaseModel):
    ids: list[int]

class TableAuthRequest(BaseModel):
    table_number: int = Field(..., ge=1, le=200)
    auth_code: str = Field(..., min_length=4, max_length=12)

class TableAuthResponse(BaseModel):
    message: str
    table_number: int
    reservation_id: Optional[int] = None
    reservation: Optional[ReservationResponse] = None

class MenuItemCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    category: str = Field(..., min_length=2, max_length=80)
    description: Optional[str] = Field(default=None, max_length=500)
    price: int = Field(..., ge=0, le=100000)
    image_url: Optional[str] = None
    is_veg: bool = True
    is_available: bool = True
    is_signature: bool = False

class MenuItemUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=120)
    category: Optional[str] = Field(default=None, min_length=2, max_length=80)
    description: Optional[str] = Field(default=None, max_length=500)
    price: Optional[int] = Field(default=None, ge=0, le=100000)
    image_url: Optional[str] = None
    is_veg: Optional[bool] = None
    is_available: Optional[bool] = None
    is_signature: Optional[bool] = None

class MenuItemResponse(BaseModel):
    id: int
    name: str
    category: str
    description: Optional[str] = None
    price: int
    image_url: Optional[str] = None
    is_veg: bool
    is_available: bool
    is_signature: bool
    class Config:
        from_attributes = True

class OrderItemCreate(BaseModel):
    item_name: str = Field(..., min_length=1, max_length=120)
    quantity: int = Field(..., ge=1, le=99)
    price_per_item: int = Field(..., ge=0, le=100000)

class OrderCreate(BaseModel):
    table_number: int = Field(..., ge=1, le=200)
    items: list[OrderItemCreate] = Field(..., min_length=1, max_length=100)

class OrderItemResponse(BaseModel):
    id: int
    item_name: str
    quantity: int
    price_per_item: int
    class Config:
        from_attributes = True

class OrderSummaryResponse(BaseModel):
    id: int
    table_number: int
    status: str
    total_amount: int
    created_at: datetime
    items: list[OrderItemResponse]
    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    id: int
    table_number: int
    status: str
    total_amount: int
    created_at: datetime
    items: list[OrderItemResponse]
    reservation_id: Optional[int] = None
    reservation: Optional[ReservationResponse] = None
    class Config:
        from_attributes = True

class ActiveTableResponse(BaseModel):
    id: int
    table_number: int
    auth_code: Optional[str] = None
    is_active: bool
    reservation_id: Optional[int] = None
    reservation: Optional[ReservationResponse] = None
    class Config:
        from_attributes = True
