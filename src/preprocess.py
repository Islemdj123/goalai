import pandas as pd
import os
import sys

# إضافة المجلد الرئيسي للمسار
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import config

def preprocess_data():
    if not os.path.exists(config.RAW_DATA_PATH):
        print(f"الملف {config.RAW_DATA_PATH} غير موجود. يرجى تشغيل fetch_data.py أولاً.")
        return

    # قراءة البيانات
    df = pd.read_csv(config.RAW_DATA_PATH)
    
    # 1. حذف القيم الناقصة
    df.dropna(inplace=True)
    
    # 2. الاحتفاظ بالأعمدة المطلوبة فقط
    required_columns = ["date", "home_team", "away_team", "home_goals", "away_goals"]
    df = df[required_columns]
    
    # تحويل التاريخ إلى صيغة datetime
    df['date'] = pd.to_datetime(df['date'])
    
    # حفظ البيانات النظيفة
    os.makedirs(os.path.dirname(config.PROCESSED_DATA_PATH), exist_ok=True)
    df.to_csv(config.PROCESSED_DATA_PATH, index=False)
    print(f"تم تنظيف البيانات وحفظ {len(df)} صف في {config.PROCESSED_DATA_PATH}")

if __name__ == "__main__":
    preprocess_data()
