import requests
import pandas as pd
import pickle
import os
import sys

# إضافة المجلد الرئيسي للمسار
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import config

def predict_system():
    # 1. تحميل النماذج والبيانات
    if not os.path.exists(config.WINNER_MODEL_PATH) or not os.path.exists(config.TEAM_STATS_PATH):
        print("النماذج غير موجودة. يرجى التدريب أولاً.")
        return
        
    with open(config.WINNER_MODEL_PATH, "rb") as f: winner_model = pickle.load(f)
    with open(config.BTTS_MODEL_PATH, "rb") as f: btts_model = pickle.load(f)
    with open(config.TEAM_STATS_PATH, "rb") as f: team_stats = pickle.load(f)

    # 2. جلب المباريات القادمة من API حصراً
    print(f"📡 جلب المباريات القادمة من الـ API (Token: {config.API_TOKEN[:5]}***)...")
    url = f"{config.BASE_URL}/matches?status=SCHEDULED"
    headers = {"X-Auth-Token": config.API_TOKEN}
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code != 200:
            print(f"❌ خطأ في الـ API: {response.status_code}")
            return
        matches = response.json().get("matches", [])
    except Exception as e:
        print(f"❌ فشل الاتصال: {e}")
        return

    if not matches:
        print("📭 لا توجد مباريات قادمة في الـ API حالياً.")
        return

    results = []
    for m in matches:
        home_name = m["homeTeam"]["name"]
        away_name = m["awayTeam"]["name"]
        
        h_s = team_stats.get(home_name)
        a_s = team_stats.get(away_name)
        
        if not h_s or not a_s: continue
            
        feature_names = ['home_avg_scored', 'home_avg_conceded', 'away_avg_scored', 'away_avg_conceded', 'h_form_pts', 'h_form_goals', 'a_form_pts', 'a_form_goals', 'h_strength', 'a_strength', 'expected_goal_diff']
        features_df = pd.DataFrame([[h_s['avg_scored'], h_s['avg_conceded'], a_s['avg_scored'], a_s['avg_conceded'], h_s['form_pts'], h_s['form_goals'], a_s['form_pts'], a_s['form_goals'], h_s['strength'], a_s['strength'], h_s['avg_scored'] - a_s['avg_scored']]], columns=feature_names)
        
        w_p = winner_model.predict_proba(features_df)[0]
        b_p = btts_model.predict_proba(features_df)[0][1]
        
        idx = w_p.argmax()
        winner_res = ["🤝 DRAW", home_name, away_name][idx]
        max_p = w_p[idx]
        
        results.append({
            "Match": f"{home_name} vs {away_name}",
            "Winner": winner_res,
            "Prob": f"{max_p*100:.1f}%",
            "BTTS": "YES" if b_p > 0.5 else "NO",
            "High Conf": "🔥" if (max(w_p[1], w_p[2]) >= 0.70 and w_p[0] <= 0.20) else ""
        })

    if results:
        df_final = pd.DataFrame(results)
        print("\n--- تـوقـعـات الـ API الـحـقـيـقـيـة ---")
        print(df_final.to_string(index=False))
    else:
        print("⚠️ لم يتم العثور على بيانات إحصائية كافية للفرق في المباريات القادمة.")

if __name__ == "__main__":
    predict_system()
