from pydantic import BaseModel, field_validator
from typing import List, Optional
import re
from datetime import datetime

EMAIL_REGEX = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        if not re.match(EMAIL_REGEX, v):
            raise ValueError("Invalid email format")
        return v

class UserLogin(BaseModel):
    email: str
    password: str

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        if not re.match(EMAIL_REGEX, v):
            raise ValueError("Invalid email format")
        return v

class Token(BaseModel):
    access_token: str
    token_type: str

class MatchPrediction(BaseModel):
    match: str
    winner: str
    prob: str
    btts: str
    high_conf: bool

class Plan(BaseModel):
    id: str
    name: str
    price: float
    duration: str

class PaymentSubmit(BaseModel):
    plan_id: str
    tx_id: str

class TransactionOut(BaseModel):
    id: int
    user_email: str
    amount: float
    txid: str
    receipt_path: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
