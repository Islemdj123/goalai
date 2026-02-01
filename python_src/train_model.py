import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
import pickle
import os
import sys

# إضافة المجلد الرئيسي للمسار
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import config

def train_models():
    feature_path = "data/processed/features_advanced.csv"
    if not os.path.exists(feature_path):
        print(f"الملف {feature_path} غير موجود.")
        return

    df = pd.read_csv(feature_path)
    
    # اختيار الميزات المتقدمة
    features = [
        'home_avg_scored', 'home_avg_conceded', 'away_avg_scored', 'away_avg_conceded',
        'h_form_pts', 'h_form_goals', 'a_form_pts', 'a_form_goals',
        'h_strength', 'a_strength', 'expected_goal_diff'
    ]
    
    # تنظيف البيانات من أي قيم NaN قد تنتج عن الحسابات الأولية
    df = df.dropna(subset=features + ['winner_target', 'btts_target'])
    X = df[features]
    
    print(f"عدد العينات للتدريب: {len(X)}")

    # 1. تدريب نموذج الفائز (Winner Model)
    y_winner = df['winner_target']
    X_train, X_test, y_train, y_test = train_test_split(X, y_winner, test_size=0.2, random_state=42)
    
    winner_model = RandomForestClassifier(n_estimators=200, max_depth=10, random_state=42)
    winner_model.fit(X_train, y_train)
    winner_acc = accuracy_score(y_test, winner_model.predict(X_test))
    
    # 2. تدريب نموذج BTTS (BTTS Model)
    y_btts = df['btts_target']
    X_train_b, X_test_b, y_train_b, y_test_b = train_test_split(X, y_btts, test_size=0.2, random_state=42)
    
    btts_model = RandomForestClassifier(n_estimators=200, max_depth=10, random_state=42)
    btts_model.fit(X_train_b, y_train_b)
    btts_acc = accuracy_score(y_test_b, btts_model.predict(X_test_b))
    
    # حفظ النماذج
    os.makedirs("models", exist_ok=True)
    with open(config.WINNER_MODEL_PATH, "wb") as f:
        pickle.dump(winner_model, f)
    with open(config.BTTS_MODEL_PATH, "wb") as f:
        pickle.dump(btts_model, f)
        
    print(f"تم تدريب النماذج بنجاح!")
    print(f"دقة نموذج الفائز: {winner_acc:.2f}")
    print(f"دقة نموذج BTTS: {btts_acc:.2f}")

if __name__ == "__main__":
    train_models()
