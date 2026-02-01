import requests
import pandas as pd
import os
import sys
import time

# إضافة المجلد الرئيسي للمسار لجلب الإعدادات
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import config

def fetch_matches():
    headers = {"X-Auth-Token": config.API_TOKEN}
    # الدوريات المتاحة فعلياً في حسابك
    competitions = ["PL", "PD", "BL1", "SA", "FL1", "DED", "PPL", "CL"]
    
    # تحديد السنوات للمواسم الأخيرة (تشمل 2025 وهو موسم 2025/2026 الحالي)
    seasons = [2022, 2023, 2024, 2025]
    
    all_matches = []

    print(f"🚀 بدء جلب البيانات الحقيقية باستخدام API Key...")

    for comp in competitions:
        print(f"\n--- دوري: {comp} ---")
        for season in seasons:
            url = f"{config.BASE_URL}/competitions/{comp}/matches"
            params = {"season": season}
            
            try:
                response = requests.get(url, headers=headers, params=params, timeout=20)
                
                if response.status_code == 200:
                    matches = response.json().get("matches", [])
                    finished = [m for m in matches if m["status"] == "FINISHED"]
                    for match in finished:
                        all_matches.append({
                            "date": match["utcDate"],
                            "home_team": match["homeTeam"]["name"],
                            "away_team": match["awayTeam"]["name"],
                            "home_goals": match["score"]["fullTime"]["home"],
                            "away_goals": match["score"]["fullTime"]["away"],
                            "status": match["status"]
                        })
                    print(f"✅ تم جلب {len(finished)} مباراة لموسم {season}.")
                elif response.status_code == 429:
                    print("⚠️ تجاوزت عدد الطلبات المسموحة (Rate Limit). انتظر دقيقة...")
                    time.sleep(60)
                else:
                    msg = response.json().get('message', 'خطأ غير معروف')
                    print(f"❌ {response.status_code} ({comp} {season}): {msg}")
                
                # الخطة المجانية تسمح بـ 10 طلبات في الدقيقة (6 ثواني بين الطلبات)
                time.sleep(6) 
            except Exception as e:
                print(f"⚠️ خطأ: {e}")
                time.sleep(10)

    if all_matches:
        df = pd.DataFrame(all_matches)
        df.drop_duplicates(inplace=True)
        os.makedirs(os.path.dirname(config.RAW_DATA_PATH), exist_ok=True)
        df.to_csv(config.RAW_DATA_PATH, index=False)
        print(f"\n✅ اكتمل الجلب! تم حفظ {len(df)} مباراة حقيقية في {config.RAW_DATA_PATH}")
    else:
        print("\n🛑 لم يتم جلب أي بيانات. تأكد من صلاحية الـ API Key أو حالة الاتصال.")

if __name__ == "__main__":
    fetch_matches()
