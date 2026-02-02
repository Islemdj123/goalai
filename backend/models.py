from sqlalchemy import Column, String, Boolean, Float, DateTime, Integer
from .database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    email = Column(String, primary_key=True, index=True)
    username = Column(String)
    password = Column(String)
    status = Column(String, default="unpaid")
    has_paid = Column(Boolean, default=False)
    payment_status = Column(String, default="unpaid")
    plan = Column(String, nullable=True)
    txid = Column(String, nullable=True)
    payment_account = Column(String, nullable=True)
    receipt_path = Column(String, nullable=True)
    expiry_date = Column(String, nullable=True)
    balance = Column(Float, default=0.0)
    is_admin = Column(Boolean, default=False)
    pending_amount = Column(Float, default=0.0)

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String, index=True)
    amount = Column(Float)
    txid = Column(String)
    payment_account = Column(String, nullable=True)
    receipt_path = Column(String)
    status = Column(String, default="pending") # pending, approved, rejected
    created_at = Column(DateTime, default=datetime.utcnow)

class Settings(Base):
    __tablename__ = "settings"
    key = Column(String, primary_key=True)
    value = Column(String)
