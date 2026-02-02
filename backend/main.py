from fastapi import FastAPI, Depends, HTTPException, status, Form, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from . import schemas, auth, predictor, models
from .database import engine, get_db
from fastapi.staticfiles import StaticFiles
import os
import json
import time
from datetime import datetime
from typing import List

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Football Predictor API")

@app.middleware("http")
async def remove_api_prefix(request, call_next):
    if request.url.path.startswith("/api"):
        request.scope["path"] = request.url.path.replace("/api", "", 1)
    return await call_next(request)

# Mount static files safely
os.makedirs("data/receipts", exist_ok=True)
os.makedirs("backend/uploads/landing", exist_ok=True)

if os.path.exists("data"):
    app.mount("/data", StaticFiles(directory="data"), name="data")
if os.path.exists("backend/uploads"):
    app.mount("/uploads", StaticFiles(directory="backend/uploads"), name="uploads")
if os.path.exists("public"):
    app.mount("/public", StaticFiles(directory="public"), name="public")

# Enable CORS for production - more permissive for debugging
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

@app.post("/register", response_model=schemas.Token)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_user = models.User(
        email=user.email,
        username=user.username,
        password=auth.get_password_hash(user.password),
        status="unpaid",
        has_paid=False
    )
    db.add(new_user)
    db.commit()
    
    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/login", response_model=schemas.Token)
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user or not auth.verify_password(user.password, db_user.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    
    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

def sync_user_status(user: models.User, db: Session):
    if user.has_paid:
        if not user.expiry_date:
            user.has_paid = False
            user.status = "expired"
            db.commit()
        else:
            try:
                expiry_dt = datetime.fromisoformat(user.expiry_date)
                if expiry_dt <= datetime.utcnow():
                    user.has_paid = False
                    user.status = "expired"
                    db.commit()
            except:
                user.has_paid = False
                db.commit()

    if user.balance <= 0 and not user.has_paid:
        if user.status == "paid":
             user.status = "expired"
             db.commit()

    return user

@app.get("/me")
def get_me(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    email = auth.get_current_user(token)
    db_user = db.query(models.User).filter(models.User.email == email).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user = sync_user_status(db_user, db)
    
    time_left_str = "0 days"
    if user.expiry_date:
        try:
            expiry_dt = datetime.fromisoformat(user.expiry_date)
            remaining = expiry_dt - datetime.utcnow()
            if remaining.total_seconds() > 0:
                days = remaining.days
                hours = int(remaining.seconds / 3600)
                if days > 0:
                    time_left_str = f"{days} d"
                else:
                    time_left_str = f"{hours} h"
            else:
                time_left_str = "Expired"
        except:
            pass

    return {
        "email": user.email, 
        "username": user.username or "User", 
        "has_paid": user.has_paid, 
        "status": user.status,
        "expiry_date": user.expiry_date,
        "days_left": time_left_str,
        "balance": user.balance,
        "pending_amount": user.pending_amount,
        "is_admin": user.is_admin
    }

@app.get("/predictions")
def get_predictions(lang: str = "en", token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        email = auth.get_current_user(token)
        db_user = db.query(models.User).filter(models.User.email == email).first()
        if not db_user:
            raise HTTPException(status_code=404, detail="User not found")
            
        user = sync_user_status(db_user, db)
        
        has_paid = user.has_paid
        balance = user.balance
        is_admin = user.is_admin
        
        full_data = predictor.get_predictions(lang=lang)
        is_actually_paid = (has_paid and user.status == "paid") or is_admin
        
        if not is_actually_paid and balance <= 0:
            masked_results = []
            for m in full_data.get("results", []):
                masked_m = m.copy()
                masked_m["winner"] = "???"
                masked_m["prob"] = "???"
                masked_m["prob_val"] = 0
                masked_m["btts"] = "???"
                masked_m["btts_prob"] = "???"
                
                locked_msg = "Subscription required"
                if lang == "ar": locked_msg = "يجب شحن الرصيد لتفعيل التوقعات"
                elif lang == "fr": locked_msg = "Abonnement requis"
                
                masked_m["reason"] = locked_msg
                masked_m["home_stats"] = {"avg_scored": 0, "avg_conceded": 0, "form_pts": 0, "strength": 0}
                masked_m["away_stats"] = {"avg_scored": 0, "avg_conceded": 0, "form_pts": 0, "strength": 0}
                masked_m["is_locked"] = True
                masked_results.append(masked_m)
            return predictor.clean_numpy({"results": masked_results, "is_locked": True})
        
        return predictor.clean_numpy({**full_data, "is_locked": False})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/live-matches")
def get_live_matches(token: str = Depends(oauth2_scheme)):
    return {"results": predictor.get_live_matches()}

@app.post("/submit-payment")
async def submit_payment(
    plan_id: str = Form(...),
    tx_id: str = Form(...),
    amount: float = Form(...),
    payment_account: str = Form(...), # Made mandatory
    receipt: UploadFile = File(...),
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    try:
        email = auth.get_current_user(token)
        user = db.query(models.User).filter(models.User.email == email).first()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        # Ensure data directory exists in root
        data_dir = os.path.join(os.getcwd(), "data", "receipts")
        os.makedirs(data_dir, exist_ok=True)
        
        file_ext = receipt.filename.split('.')[-1]
        file_name = f"{email.replace('@', '_')}_{int(time.time())}.{file_ext}"
        file_path = os.path.join(data_dir, file_name)
        
        with open(file_path, "wb") as buffer:
            content = await receipt.read()
            buffer.write(content)
            
        # Save path with leading slash for consistent serving
        receipt_url_path = f"data/receipts/{file_name}"
        
        user.status = "pending"
        user.payment_status = "pending"
        user.has_paid = False
        user.plan = plan_id
        user.pending_amount = amount
        user.txid = f"{plan_id} | {tx_id}"
        user.payment_account = payment_account
        user.receipt_path = receipt_url_path
        
        # Log transaction history
        new_transaction = models.Transaction(
            user_email=email,
            amount=amount,
            txid=f"{plan_id} | {tx_id}",
            payment_account=payment_account,
            receipt_path=receipt_url_path,
            status="pending"
        )
        db.add(new_transaction)
        db.commit()
        
        return {"status": "success", "message": "Payment submitted for verification"}
    except Exception as e:
        print(f"Payment Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/payment-status")
def get_payment_status(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    email = auth.get_current_user(token)
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        return {"status": "unpaid", "has_paid": False}
    return {
        "status": user.payment_status or "unpaid",
        "has_paid": user.has_paid
    }

def get_admin_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    email = auth.get_current_user(token)
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user or not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

@app.get("/admin/users")
def admin_get_users(admin=Depends(get_admin_user), db: Session = Depends(get_db)):
    users = db.query(models.User).all()
    return [{
        "email": u.email,
        "username": u.username,
        "status": u.status,
        "has_paid": u.has_paid,
        "payment_status": u.payment_status,
        "plan": u.plan,
        "balance": u.balance,
        "pending_amount": u.pending_amount,
        "expiry_date": u.expiry_date,
        "txid": u.txid,
        "payment_account": u.payment_account,
        "receipt_path": u.receipt_path
    } for u in users]

@app.post("/admin/approve-payment")
def admin_approve_payment(email: str = Form(...), days: int = Form(...), admin=Depends(get_admin_user), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user: raise HTTPException(404, "User not found")
    
    from datetime import timedelta
    now = datetime.utcnow()
    target_date = now + timedelta(days=days-1)
    expiry_dt = target_date.replace(hour=23, minute=59, second=59, microsecond=0)
    
    user.status = "paid"
    user.payment_status = "approved"
    user.has_paid = True
    user.expiry_date = expiry_dt.isoformat()
    # Add pending amount to balance
    user.balance += user.pending_amount
    user.pending_amount = 0
    db.commit()
    return {"status": "success"}

@app.post("/admin/cancel-subscription")
def admin_cancel_subscription(email: str = Form(...), admin=Depends(get_admin_user), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user: raise HTTPException(404, "User not found")
    user.status = "unpaid"
    user.has_paid = False
    user.expiry_date = None
    db.commit()
    return {"status": "success"}

@app.post("/admin/delete-user")
def admin_delete_user(email: str = Form(...), admin=Depends(get_admin_user), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user: raise HTTPException(404, "User not found")
    if user.email == admin.email:
        raise HTTPException(400, "Cannot delete yourself")
    db.delete(user)
    db.commit()
    return {"status": "success"}

@app.post("/admin/reject-payment")
def admin_reject_payment(email: str = Form(...), admin=Depends(get_admin_user), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user: raise HTTPException(404, "User not found")
    user.status = "unpaid"
    user.payment_status = "rejected"
    user.has_paid = False
    db.commit()
    return {"status": "success"}

@app.post("/admin/update-balance")
def admin_update_balance(email: str = Form(...), balance: float = Form(...), admin=Depends(get_admin_user), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user: raise HTTPException(404, "User not found")
    user.balance = balance
    db.commit()
    return {"status": "success"}

@app.post("/admin/update-expiry")
def admin_update_expiry(email: str = Form(...), expiry_date: str = Form(...), admin=Depends(get_admin_user), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user: raise HTTPException(404, "User not found")
    user.expiry_date = expiry_date
    user.has_paid = True
    user.status = "paid"
    db.commit()
    return {"status": "success"}

@app.get("/admin/transactions", response_model=List[schemas.TransactionOut])
def admin_get_transactions(admin=Depends(get_admin_user), db: Session = Depends(get_db)):
    transactions = db.query(models.Transaction).order_by(models.Transaction.created_at.desc()).all()
    return transactions

@app.post("/admin/approve-transaction")
def admin_approve_transaction(tx_id: int = Form(...), days: int = Form(...), admin=Depends(get_admin_user), db: Session = Depends(get_db)):
    tx = db.query(models.Transaction).filter(models.Transaction.id == tx_id).first()
    if not tx: raise HTTPException(404, "Transaction not found")
    
    user = db.query(models.User).filter(models.User.email == tx.user_email).first()
    if not user: raise HTTPException(404, "User not found")
    
    from datetime import timedelta
    now = datetime.utcnow()
    target_date = now + timedelta(days=days-1)
    expiry_dt = target_date.replace(hour=23, minute=59, second=59, microsecond=0)
    
    user.status = "paid"
    user.payment_status = "approved"
    user.has_paid = True
    user.expiry_date = expiry_dt.isoformat()
    user.balance += tx.amount
    
    tx.status = "approved"
    
    db.commit()
    return {"status": "success"}

@app.post("/admin/reject-transaction")
def admin_reject_transaction(tx_id: int = Form(...), admin=Depends(get_admin_user), db: Session = Depends(get_db)):
    tx = db.query(models.Transaction).filter(models.Transaction.id == tx_id).first()
    if not tx: raise HTTPException(404, "Transaction not found")
    
    tx.status = "rejected"
    
    # Also update user payment status if it matches this txid
    user = db.query(models.User).filter(models.User.email == tx.user_email).first()
    if user and user.txid == tx.txid:
        user.payment_status = "rejected"
        user.status = "unpaid"
        
    db.commit()
    return {"status": "success"}

@app.get("/admin/settings")
def admin_get_settings(admin=Depends(get_admin_user), db: Session = Depends(get_db)):
    binance = db.query(models.Settings).filter(models.Settings.key == "binance_id").first()
    baridimob = db.query(models.Settings).filter(models.Settings.key == "baridimob_id").first()
    return {
        "binance_id": binance.value if binance else "Not Set",
        "baridimob_id": baridimob.value if baridimob else "Not Set"
    }

@app.post("/admin/update-settings")
def admin_update_settings(binance_id: str = Form(...), baridimob_id: str = Form(...), admin=Depends(get_admin_user), db: Session = Depends(get_db)):
    for key, val in [("binance_id", binance_id), ("baridimob_id", baridimob_id)]:
        setting = db.query(models.Settings).filter(models.Settings.key == key).first()
        if setting: setting.value = val
        else: db.add(models.Settings(key=key, value=val))
    db.commit()
    return {"status": "success"}

@app.get("/payment-settings")
def get_payment_settings(db: Session = Depends(get_db)):
    binance = db.query(models.Settings).filter(models.Settings.key == "binance_id").first()
    baridimob = db.query(models.Settings).filter(models.Settings.key == "baridimob_id").first()
    return {
        "binance_id": binance.value if binance else "Not Set",
        "baridimob_id": baridimob.value if baridimob else "Not Set"
    }

LANDING_SETTINGS_FILE = "data/landing_settings.json"

@app.get("/landing/settings")
def get_landing_settings():
    if os.path.exists(LANDING_SETTINGS_FILE):
        with open(LANDING_SETTINGS_FILE, "r") as f:
            return json.load(f)
    return {}

@app.post("/admin/landing/update")
def update_landing_settings(settings: dict, admin=Depends(get_admin_user)):
    with open(LANDING_SETTINGS_FILE, "w") as f:
        json.dump(settings, f, indent=4)
    return {"status": "success"}

@app.post("/admin/upload-media")
async def upload_media(file: UploadFile = File(...), admin=Depends(get_admin_user)):
    upload_dir = "backend/uploads/landing"
    os.makedirs(upload_dir, exist_ok=True)
    
    file_ext = file.filename.split('.')[-1]
    file_name = f"media_{int(time.time())}.{file_ext}"
    file_path = os.path.join(upload_dir, file_name)
    
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
        
    return {"url": f"/uploads/landing/{file_name}"}
