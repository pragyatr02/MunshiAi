from pydantic import BaseModel, Field
from typing import Optional


class CustomerCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    phone: str = Field(..., min_length=1, max_length=50)
    address: str = Field(..., min_length=1, max_length=255)


class CustomerUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    phone: Optional[str] = Field(default=None, min_length=1, max_length=50)
    address: Optional[str] = Field(default=None, min_length=1, max_length=255)


class CustomerResponse(BaseModel):
    id: int
    user_id: int
    name: str
    phone: str
    address: str

    class Config:
        from_attributes = True
   