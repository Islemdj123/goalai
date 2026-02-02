import streamlit as st
import pandas as pd
import pickle
import requests
import os
import sys
import time
from datetime import datetime, timezone
import textwrap
import json
from backend.auth import verify_password, get_password_hash
from backend import predictor, models, database
from sqlalchemy.orm import Session

# إضافة المجلد الرئيسي للمسار
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '.')))
import config

# --- نظام إدارة المستخدمين والإعدادات ---
SETTINGS_FILE = "data/settings.json"

def get_db():
    db = database.SessionLocal()
    try:
        return db
    finally:
        pass # Handle closing manually in streamlit

def load_settings():
    if not os.path.exists(SETTINGS_FILE):
        default = {"binance_id": "Not Set", "baridimob_id": "Not Set"}
        with open(SETTINGS_FILE, "w") as f: json.dump(default, f)
        return default
    with open(SETTINGS_FILE, "r") as f:
        try: return json.load(f)
        except: return {"binance_id": "Not Set", "baridimob_id": "Not Set"}

def save_settings(settings):
    with open(SETTINGS_FILE, "w") as f:
        json.dump(settings, f, indent=4)

# إعدادات الصفحة
st.set_page_config(page_title="AI Match Predictor 2026", page_icon="⚽", layout="wide")

# تصميم CSS عصري متطور
st.markdown("""
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap');
    html, body, [class*="css"] { font-family: 'Plus Jakarta Sans', sans-serif; }
    .stApp { background: radial-gradient(circle at top right, #1a1a2e, #0f0f1a); color: white; }
    
    /* Header / Appbar Styling */
    .appbar {
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(10px);
        padding: 1rem 2rem;
        border-radius: 0 0 20px 20px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        margin-bottom: 2rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .appbar-title {
        font-size: 1.5rem;
        font-weight: 800;
        background: linear-gradient(90deg, #00d4ff, #0088ff);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    .match-card {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 20px; padding: 25px; margin-bottom: 20px;
        transition: transform 0.3s ease;
    }
    .match-card:hover { transform: translateY(-5px); border-color: #00d4ff; }
    
    .live-indicator {
        background: #ff4b2b; color: white; padding: 3px 12px; border-radius: 50px;
        font-size: 0.75em; font-weight: bold; animation: pulse 1.5s infinite;
    }
    @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
    
    .countdown-box { color: #00d4ff; font-weight: bold; font-size: 0.85em; }
    .score-box { font-size: 2.2em; font-weight: 800; color: #fff; margin: 0 20px; }
    .team-name { font-size: 1.2em; font-weight: 700; flex: 1; display: flex; align-items: center; gap: 10px; }
    .team-logo { width: 30px; height: 30px; object-fit: contain; }
    .prediction-logo { width: 20px; height: 20px; object-fit: contain; vertical-align: middle; margin-right: 5px; }
    
    .detail-section {
        background: rgba(0,0,0,0.2); border-radius: 12px; padding: 15px; margin-top: 15px;
    }
    .high-badge {
        background: linear-gradient(45deg, #ff4b2b, #ff416c);
        color: white; padding: 4px 12px; border-radius: 50px; font-size: 0.7em; font-weight: 700;
    }
    </style>
""", unsafe_allow_html=True)

@st.cache_resource
def load_models():
    try:
        with open(config.WINNER_MODEL_PATH, "rb") as f: winner_model = pickle.load(f)
        with open(config.BTTS_MODEL_PATH, "rb") as f: btts_model = pickle.load(f)
        with open(config.TEAM_STATS_PATH, "rb") as f: team_stats = pickle.load(f)
        return winner_model, btts_model, team_stats
    except: return None, None, None

def fetch_api_data(endpoint):
    url = f"{config.BASE_URL}/{endpoint}"
    headers = {"X-Auth-Token": config.API_TOKEN}
    try:
        response = requests.get(url, headers=headers, timeout=10)
        return response.json().get("matches", []) if response.status_code == 200 else []
    except: return []

def get_countdown(match_time_str):
    try:
        match_time = datetime.strptime(match_time_str, '%Y-%m-%dT%H:%M:%SZ').replace(tzinfo=timezone.utc)
        now = datetime.now(timezone.utc)
        diff = match_time - now
        if diff.total_seconds() <= 0: return "STARTED"
        days = diff.days
        hours, rem = divmod(diff.seconds, 3600)
        minutes, _ = divmod(rem, 60)
        if days > 0: return f"In {days}d {hours}h"
        return f"Starting in {hours}h {minutes}m"
    except: return "Scheduled"

def main():
    # Load data
    db = get_db()
    settings = load_settings()
    
    # Custom Appbar
    st.markdown(f"""
        <div class="appbar">
            <div class="appbar-title">⚽ AI MATCH CENTER</div>
            <div style="color: #888; font-weight: 600;">2026 PREDICTION ENGINE</div>
        </div>
    """, unsafe_allow_html=True)

    st.sidebar.title("🎮 Navigation")
    
    if 'authenticated' not in st.session_state:
        st.session_state.authenticated = False
    if 'username' not in st.session_state:
        st.session_state.username = None
    if 'admin_access' not in st.session_state:
        st.session_state.admin_access = False
    if 'show_payment_ui' not in st.session_state:
        st.session_state.show_payment_ui = False
    if 'selected_plan' not in st.session_state:
        st.session_state.selected_plan = None

    if not st.session_state.authenticated:
        tab_login, tab_reg = st.sidebar.tabs(["Login", "Register"])
        
        with tab_login:
            e_login = st.text_input("Email", key="l_email")
            p_login = st.text_input("Password", type="password", key="l_pass")
            if st.button("Sign In"):
                user = db.query(models.User).filter(models.User.email == e_login).first()
                if user:
                    stored_pass = user.password or ""
                    is_valid = False
                    if stored_pass.startswith('$pbkdf2-sha256$') or stored_pass.startswith('$2b$'):
                        try: is_valid = verify_password(p_login, stored_pass)
                        except: is_valid = (p_login == stored_pass)
                    else: is_valid = (p_login == stored_pass)
                    
                    if is_valid:
                        st.session_state.authenticated = True
                        st.session_state.username = e_login
                        if e_login in ["islemdjeridi", "admin@match.ai", "admin"]:
                            st.session_state.admin_access = True
                        st.rerun()
                    else: st.error("Invalid credentials")
                else: st.error("User not found")
        
        with tab_reg:
            u_reg = st.text_input("Username", key="r_user")
            e_reg = st.text_input("Email", key="r_email")
            p_reg = st.text_input("Password", type="password", key="r_pass")
            if st.button("Create Account"):
                existing = db.query(models.User).filter(models.User.email == e_reg).first()
                if existing: st.error("Email already exists")
                elif e_reg and p_reg:
                    new_user = models.User(username=u_reg, email=e_reg, password=get_password_hash(p_reg), status="unpaid", has_paid=False)
                    db.add(new_user)
                    db.commit()
                    st.success("Account created! Please login.")
        
        st.info("Please login to access the dashboard.")
        return

    # User data
    current_user_email = st.session_state.username
    db_user = db.query(models.User).filter(models.User.email == current_user_email).first()
    if not db_user:
        st.session_state.authenticated = False
        st.rerun()

    st.session_state.payment_status = db_user.status or "unpaid"
    
    nav_view = st.sidebar.radio("View", ["Home Center", "Predictions Only", "Profile"])

    if nav_view == "Profile":
        st.markdown(f"### 👤 Profile: {db_user.username}")
        if st.sidebar.button("Logout"):
            st.session_state.authenticated = False
            st.rerun()
        return

    # --- ميزة اختيار الخطة والدفع ---
    if st.session_state.payment_status == "unpaid" and st.session_state.get('show_payment_ui'):
        st.markdown(f"### 💳 Complete Payment for `{st.session_state.get('selected_plan', 'Premium')}`")
        if st.button("⬅️ Change Plan / Back"):
            st.session_state.show_payment_ui = False
            st.rerun()
                
            st.markdown("---")
            pay_col1, pay_col2 = st.columns(2)
            with pay_col1:
                st.subheader("1️⃣ Pay via:")
                method = st.radio("Payment Method:", ["Binance USDT", "Baridimob"], horizontal=True)
                
                if "Binance" in method:
                    st.markdown(f"""
                    <div style="background: #fcf1d8; padding: 20px; border-radius: 15px; border: 1px solid #f0b90b; color: #000;">
                        <b style="color: #f0b90b; font-size: 1.2em;">Binance ID:</b><br>
                        <code style="font-size: 1.5em; font-weight: bold;">{settings.get('binance_id')}</code>
                        <p style="margin-top:10px; font-size: 0.9em;">Send the exact amount to the ID above.</p>
                    </div>
                    """, unsafe_allow_html=True)
                else:
                    st.markdown(f"""
                    <div style="background: #e1f5fe; padding: 20px; border-radius: 15px; border: 1px solid #03a9f4; color: #000;">
                        <b style="color: #03a9f4; font-size: 1.2em;">Baridimob RIP:</b><br>
                        <code style="font-size: 1.3em; font-weight: bold;">{settings.get('baridimob_id')}</code>
                        <p style="margin-top:10px; font-size: 0.9em;">Transfer the equivalent amount in DZD.</p>
                    </div>
                    """, unsafe_allow_html=True)
            
            with pay_col2:
                st.subheader("2️⃣ Proof of Payment")
                uploaded_file = st.file_uploader("Upload Receipt Screenshot", type=['png', 'jpg', 'jpeg'], key="main_receipt_upload")
                tx_id = st.text_input("Transaction ID / Ref", placeholder="Paste your reference here")
                
                if st.button("Confirm & Send to Admin", use_container_width=True):
                    if uploaded_file and tx_id:
                        file_ext = uploaded_file.name.split('.')[-1]
                        file_path = f"data/receipts/{current_user_email.replace('@', '_')}_{int(time.time())}.{file_ext}"
                        with open(file_path, "wb") as f:
                            f.write(uploaded_file.getbuffer())
                        
                        db_user.status = "pending"
                        db_user.payment_status = "pending"
                        db_user.has_paid = False
                        db_user.plan = st.session_state.selected_plan
                        db_user.txid = f"{st.session_state.selected_plan} | {tx_id}"
                        db_user.receipt_path = file_path
                        db.commit()
                        st.success("Payment submitted! Admin will notify you shortly.")
                        st.session_state.show_payment_ui = False
                        time.sleep(2)
                        st.rerun()
                    else:
                        st.error("Please upload receipt and enter ID.")
        
        st.markdown("---")

    # قسم حالة الدفع في القائمة الجانبية (للمتابعة فقط)
    with st.sidebar.expander("💳 Subscription Status"):
        if db_user.status == "unpaid":
            st.warning("Status: Unpaid")
        elif db_user.status == "pending":
            st.info("⏳ Pending Verification")
            if db_user.receipt_path:
                st.image(db_user.receipt_path, caption="Your Receipt")
        elif db_user.status == "paid":
            st.success("💎 Premium Active")

    # لوحة تحكم الأدمن
    if st.session_state.admin_access:
        with st.sidebar.expander("🛠️ ADMIN TOOLS", expanded=True):
            st.write("### 🔑 Admin Management")
            
            # Update Payment Info
            st.write("---")
            st.write("**Update Payment Info**")
            new_binance = st.text_input("Binance ID", value=settings.get('binance_id'))
            new_baridi = st.text_input("Baridimob ID", value=settings.get('baridimob_id'))
            if st.button("Save Payment Info"):
                settings['binance_id'] = new_binance
                settings['baridimob_id'] = new_baridi
                save_settings(settings)
                st.success("Payment info updated!")
                time.sleep(1)
                st.rerun()

            st.write("---")
            st.write("**Pending Requests**")
            pending_users = db.query(models.User).filter(models.User.status == "pending").all()
            if not pending_users:
                st.caption("No pending payments.")
            
            for pu in pending_users:
                with st.container():
                    st.markdown(f"**User:** `{pu.email}`")
                    plan_display = (pu.plan or "Unknown").capitalize()
                    st.write(f"Plan: **{plan_display}**")
                    st.write(f"Ref: {pu.txid}")
                    if pu.receipt_path and os.path.exists(pu.receipt_path):
                        st.image(pu.receipt_path, use_container_width=True)
                    
                    col1, col2 = st.columns(2)
                    amount_to_add = st.number_input("Amount to add to balance:", min_value=0.0, value=0.0, key=f"amt_{pu.email}")
                    if col1.button("✅ Approve", key=f"app_{pu.email}"):
                        pu.status = "paid"
                        pu.payment_status = "paid"
                        pu.has_paid = True
                        
                        # Update balance
                        pu.balance = (pu.balance or 0.0) + amount_to_add
                        
                        # Set expiry date based on plan
                        from datetime import datetime, timedelta
                        now = datetime.utcnow()
                        plan = (pu.plan or "").lower()
                        if 'daily' in plan:
                            expiry = now.replace(hour=23, minute=59, second=59, microsecond=999999)
                        elif '5days' in plan:
                            expiry = (now + timedelta(days=4)).replace(hour=23, minute=59, second=59, microsecond=999999)
                        elif '10days' in plan:
                            expiry = (now + timedelta(days=9)).replace(hour=23, minute=59, second=59, microsecond=999999)
                        elif 'monthly' in plan:
                            expiry = (now + timedelta(days=29)).replace(hour=23, minute=59, second=59, microsecond=999999)
                        elif 'yearly' in plan:
                            expiry = (now + timedelta(days=364)).replace(hour=23, minute=59, second=59, microsecond=999999)
                        else:
                            expiry = (now + timedelta(days=29)).replace(hour=23, minute=59, second=59, microsecond=999999) # Default 30 days
                            
                        pu.expiry_date = expiry.isoformat()
                        db.commit()
                        st.success(f"Approved {pu.email}")
                        st.rerun()
                    if col2.button("❌ Reject", key=f"rej_{pu.email}"):
                        pu.status = "unpaid"
                        pu.payment_status = "unpaid"
                        pu.has_paid = False
                        if pu.receipt_path and os.path.exists(pu.receipt_path):
                            os.remove(pu.receipt_path)
                            pu.receipt_path = None
                        db.commit()
                        st.error(f"Rejected {pu.email}")
                        st.rerun()
                    st.write("---")
            
            if st.button("Logout Admin Session"):
                st.session_state.admin_access = False
                st.rerun()
    elif st.session_state.username == "islemdjeridi":
        if st.sidebar.button("Show Admin Panel"):
            st.session_state.admin_access = True
            st.rerun()

    if st.sidebar.button("Logout"):
        st.session_state.authenticated = False
        st.session_state.username = None
        st.rerun()

    winner_model, btts_model, team_stats = load_models()
    
    if not winner_model:
        st.error("Model assets missing. Please run the training pipeline.")
        return

    # Sidebar controls
    if st.sidebar.button("🔄 Refresh Live Data", use_container_width=True):
        st.cache_resource.clear()
        st.rerun()
    
    filter_option = st.sidebar.radio("Predictions Filter:", ["All", "High Confidence 🔥"])
    auto_refresh = st.sidebar.checkbox("Auto-update (60s)", value=True)

    # Fetch Data
    live_matches = predictor.get_live_matches()
    predictions_data = predictor.get_predictions()
    upcoming_matches = predictions_data.get("results", [])
    
    col_main, col_right = st.columns([3, 1])

    with col_main:
        # LIVE SECTION
        if nav_view == "Home Center":
            st.markdown("### 🏟️ Live Now")
            if not live_matches:
                st.info("No live matches currently in progress.")
            else:
                for m in live_matches:
                    h_logo = m.get('home_logo', '')
                    a_logo = m.get('away_logo', '')
                    
                    live_html = f"""<div class="match-card" style="border-left: 5px solid #ff4b2b;">
<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
<div style="display: flex; flex-direction: column;">
    <span class="live-indicator">LIVE</span>
    <span style="color: #888; font-size: 0.7em; margin-top: 4px; text-transform: uppercase;">{m.get('competition', 'Unknown')}</span>
</div>
<span style="color: #ff4b2b; font-weight: bold;">{m.get('minute', '??')}'</span>
</div>
<div style="display: flex; justify-content: center; align-items: center;">
<div class="team-name" style="justify-content: flex-end;">
{m['home_team']} <img src="{h_logo}" class="team-logo">
</div>
<div class="score-box">{m['home_score']} - {m['away_score']}</div>
<div class="team-name" style="justify-content: flex-start;">
<img src="{a_logo}" class="team-logo"> {m['away_team']}
</div>
</div>
</div>""".strip()
                    st.markdown(live_html, unsafe_allow_html=True)
            st.markdown("---")

        # UPCOMING SECTION
        st.markdown("### 📅 Upcoming & Predictions")
        processed_count = 0
        if not upcoming_matches:
            st.info("No predictions available right now.")
        else:
            for p in upcoming_matches:
                h_name, a_name = p["home_team"], p["away_team"]
                h_logo, a_logo = p["home_logo"], p["away_logo"]
                
                conf = p["high_conf"]
                
                if filter_option == "High Confidence 🔥" and not conf: continue
                processed_count += 1
                
                # UI Card Preparation
                countdown = get_countdown(p["time"])
                badge = f'<span class="high-badge">🔥 HIGH CONFIDENCE</span>' if conf else ""
                
                # Check Payment Status for Content (Admin bypasses this)
                if st.session_state.payment_status == "paid" or st.session_state.admin_access:
                    max_prob = p["prob_val"]
                    # Calculate Confidence Color
                    conf_color = "#00d4ff" if max_prob < 0.7 else "#00ff88" if max_prob < 0.85 else "#ffbc00"
                    
                    b_p_yes = p["btts"] == "YES"
                    
                    win_text = p["winner"]
                    if win_text == h_name:
                        win_logo_html = f'<img src="{h_logo}" class="prediction-logo">'
                    elif win_text == a_name:
                        win_logo_html = f'<img src="{a_logo}" class="prediction-logo">'
                    else:
                        win_logo_html = ""

                    prediction_html = f"""
<div style="text-align: center;">
    <div style="color: #888; font-size: 0.7em; text-transform: uppercase;">Winner Prediction</div>
    <div style="color: #00d4ff; font-weight: bold; display: flex; align-items: center; justify-content: center; font-size: 1.1em;">
        {win_logo_html} {win_text}
    </div>
</div>
<div style="text-align: center; min-width: 100px;">
    <div style="color: #888; font-size: 0.7em; text-transform: uppercase;">Confidence</div>
    <div style="font-weight: bold; color: {conf_color}; font-size: 1.2em;">{p['prob']}</div>
    <div style="width: 100%; background: rgba(255,255,255,0.1); height: 4px; border-radius: 10px; margin-top: 4px;">
        <div style="width: {max_prob*100}%; background: {conf_color}; height: 100%; border-radius: 10px;"></div>
    </div>
</div>
<div style="text-align: center;">
    <div style="color: #888; font-size: 0.7em; text-transform: uppercase;">BTTS</div>
    <div style="font-weight: bold; font-size: 1.1em; color: {"#00ff88" if b_p_yes else "#ff4b2b"}">{p['btts']} {"✅" if b_p_yes else "❌"} ({p['btts_prob']})</div>
</div>
"""
                else:
                    status_msg = "🕒 Waiting for Admin Confirmation" if st.session_state.payment_status == "pending" else "🔒 Prediction Locked"
                    prediction_html = f"""
<div style="text-align: center; flex: 1; filter: blur(2px); opacity: 0.5;">
    {status_msg}
</div>
<div style="text-align: center; flex: 1;">
    <span style="background: #00d4ff; color: #000; padding: 2px 8px; border-radius: 4px; font-size: 0.8em; font-weight: bold;">PREMIUM ONLY</span>
</div>
"""

                upcoming_html = f"""<div class="match-card">
<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
<span class="countdown-box">🕒 {countdown}</span>
{badge}
</div>
<div style="display: flex; justify-content: center; align-items: center; margin-bottom: 20px;">
<div class="team-name" style="justify-content: flex-end;">
{h_name} <img src="{h_logo}" class="team-logo">
</div>
<div style="color: #00d4ff; font-weight: 900; margin: 0 20px;">VS</div>
<div class="team-name" style="justify-content: flex-start;">
<img src="{a_logo}" class="team-logo"> {a_name}
</div>
</div>
<div style="display: flex; justify-content: space-around; background: rgba(255,255,255,0.05); padding: 15px; border-radius: 12px;">
{prediction_html}
</div>
</div>""".strip()
                
                with st.container():
                    st.markdown(upcoming_html, unsafe_allow_html=True)
                    
                    if st.session_state.payment_status == "paid" or st.session_state.admin_access:
                        with st.expander("🔍 Match Analysis & Prediction Logic"):
                            st.markdown(f"### Reasoning for {win_logo_html} {p['winner']}", unsafe_allow_html=True)
                            col_a, col_b = st.columns(2)
                            h_s, a_s = p["home_stats"], p["away_stats"]
                            with col_a:
                                st.markdown(f"**<img src='{h_logo}' style='width:25px'> {h_name} Stats**", unsafe_allow_html=True)
                                st.write(f"⚽ **Avg Scored:** {h_s['avg_scored']:.2f}")
                                st.write(f"🛡️ **Avg Conceded:** {h_s['avg_conceded']:.2f}")
                                st.write(f"📈 **Form Points:** {h_s['form_pts']}")
                                st.write(f"💪 **Strength Index:** {h_s['strength']:.2f}")
                            with col_b:
                                st.markdown(f"**<img src='{a_logo}' style='width:25px'> {a_name} Stats**", unsafe_allow_html=True)
                                st.write(f"⚽ **Avg Scored:** {a_s['avg_scored']:.2f}")
                                st.write(f"🛡️ **Avg Conceded:** {a_s['avg_conceded']:.2f}")
                                st.write(f"📈 **Form Points:** {a_s['form_pts']}")
                                st.write(f"💪 **Strength Index:** {a_s['strength']:.2f}")
                            
                            st.markdown("---")
                            st.info(f"💡 **AI Logic:** {p['reason']}")
                    else:
                        st.info("💡 Unlock Premium to see detailed AI reasoning and full stats.")

    with col_right:
        st.markdown("### 📊 Live Overview")
        st.metric("Matches Live", len(live_matches))
        st.metric("Predictions Available", processed_count)
        
        st.markdown("---")
        st.caption("Auto-refreshing ensures you get the latest scores and match minutes as they happen.")

    if auto_refresh:
        time.sleep(60)
        st.rerun()

if __name__ == "__main__":
    main()
