import pandas as pd
import numpy as np
import os
import sys
import json

# إضافة المجلد الرئيسي للمسار
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import config

def generate_mock():
    print("جاري توليد بيانات وهمية...")
    
    teams = [
        "Real Madrid", "Barcelona", "Manchester City", "Liverpool", "Arsenal", 
        "Bayern Munich", "PSG", "AC Milan", "Inter Milan", "Napoli",
        "Al Hilal", "Al Nassr", "Al Ittihad", "Al Ahli", "Al Shabab"
    ]
    
    # 1. بيانات تاريخية للتدريب
    history_data = []
    for i in range(300):
        h = np.random.choice(teams)
        a = np.random.choice([t for t in teams if t != h])
        history_data.append({
            "date": pd.Timestamp.now() - pd.Timedelta(days=np.random.randint(1, 500)),
            "home_team": h,
            "away_team": a,
            "home_goals": np.random.randint(0, 5),
            "away_goals": np.random.randint(0, 5),
            "status": "FINISHED"
        })
    pd.DataFrame(history_data).to_csv(config.RAW_DATA_PATH, index=False)
    
    # 2. مباريات قادمة (Upcoming)
    upcoming_data = []
    for i in range(10):
        h = np.random.choice(teams)
        a = np.random.choice([t for t in teams if t != h])
        upcoming_data.append({
            "homeTeam": {"name": h, "crest": ""},
            "awayTeam": {"name": a, "crest": ""},
            "utcDate": (pd.Timestamp.now() + pd.Timedelta(hours=np.random.randint(1, 48))).strftime('%Y-%m-%dT%H:%M:%SZ'),
            "status": "TIMED"
        })
    
    os.makedirs("data/raw", exist_ok=True)
    with open("data/raw/mock_upcoming.json", "w") as f:
        json.dump(upcoming_data, f)

    # 3. مباريات مباشرة (Live)
    live_data = []
    for i in range(3):
        h = np.random.choice(teams)
        a = np.random.choice([t for t in teams if t != h])
        live_data.append({
            "homeTeam": {"name": h, "crest": ""},
            "awayTeam": {"name": a, "crest": ""},
            "score": {
                "fullTime": {"home": np.random.randint(0, 3), "away": np.random.randint(0, 3)}
            },
            "status": "IN_PLAY",
            "minute": np.random.randint(1, 90),
            "utcDate": pd.Timestamp.now().strftime('%Y-%m-%dT%H:%M:%SZ')
        })
    
    with open("data/raw/mock_live.json", "w") as f:
        json.dump(live_data, f)
        
    print("تم إنشاء البيانات التاريخية، القادمة والمباشرة (Mock) بنجاح!")

if __name__ == "__main__":
    generate_mock()
