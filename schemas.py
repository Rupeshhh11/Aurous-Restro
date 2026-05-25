from pydantic import BaseModel, Field
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
    status: str = "pending"

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

class BulkDelete(BaseModel):
    ids: list[int]

class TableAuthRequest(BaseModel):
    table_number: int
    auth_code: str

class TableAuthResponse(BaseModel):
    message: str
    table_number: int
    reservation_id: Optional[int] = None
    reservation: Optional[ReservationResponse] = None

class MenuItemCreate(BaseModel):
    name: str
    category: str
    description: Optional[str] = None
    price: int
    image_url: Optional[str] = None
    is_veg: bool = True
    is_available: bool = True

class MenuItemUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    price: Optional[int] = None
    image_url: Optional[str] = None
    is_veg: Optional[bool] = None
    is_available: Optional[bool] = None

class MenuItemResponse(BaseModel):
    id: int
    name: str
    category: str
    description: Optional[str] = None
    price: int
    image_url: Optional[str] = None
    is_veg: bool
    is_available: bool
    class Config:
        from_attributes = True

class OrderItemCreate(BaseModel):
    item_name: str
    quantity: int
    price_per_item: int

class OrderCreate(BaseModel):
    table_number: int
    items: list[OrderItemCreate]

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
