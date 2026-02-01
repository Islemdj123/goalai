import json
import os
from sqlalchemy.orm import Session
from backend.database import SessionLocal, engine
from backend import models

# Ensure tables are created
models.Base.metadata.create_all(bind=engine)

def migrate():
    users_file = "data/users.json"
    if not os.path.exists(users_file):
        print("No users.json found.")
        return

    with open(users_file, "r") as f:
        users_data = json.load(f)

    db = SessionLocal()
    try:
        for email, data in users_data.items():
            existing = db.query(models.User).filter(models.User.email == email).first()
            if not existing:
                user = models.User(
                    email=email,
                    username=data.get("username"),
                    password=data.get("password"),
                    status=data.get("status", "unpaid"),
                    has_paid=data.get("has_paid", False),
                    payment_status=data.get("payment_status", "unpaid"),
                    plan=data.get("plan"),
                    txid=data.get("txid"),
                    receipt_path=data.get("receipt_path"),
                    expiry_date=data.get("expiry_date"),
                    balance=data.get("balance", 0.0)
                )
                db.add(user)
                print(f"Migrated user: {email}")
        db.commit()
        print("Migration completed successfully.")
    except Exception as e:
        print(f"Error during migration: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    migrate()
