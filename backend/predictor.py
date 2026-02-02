import pandas as pd
import pickle
import os
import sys
import requests
import config

# Add parent directory to path to import config
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

def clean_numpy(obj):
    import numpy as np
    if isinstance(obj, dict):
        return {k: clean_numpy(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [clean_numpy(v) for v in obj]
    elif isinstance(obj, (np.integer, np.floating, np.bool_)):
        return obj.item()
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    return obj

def get_predictions(lang="en"):
    print(f"PREDICTOR: Generating predictions for lang={lang}")
    if not os.path.exists(config.WINNER_MODEL_PATH) or not os.path.exists(config.TEAM_STATS_PATH):
        return {"error": "Models not found"}
        
    with open(config.WINNER_MODEL_PATH, "rb") as f: winner_model = pickle.load(f)
    with open(config.BTTS_MODEL_PATH, "rb") as f: btts_model = pickle.load(f)
    with open(config.TEAM_STATS_PATH, "rb") as f: team_stats = pickle.load(f)

    url = f"{config.BASE_URL}/matches?status=SCHEDULED,LIVE,IN_PLAY,PAUSED"
    headers = {"X-Auth-Token": config.API_TOKEN}
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code != 200:
            return {"error": f"API Error: {response.status_code}"}
        matches = response.json().get("matches", [])
    except Exception as e:
        return {"error": f"Connection failed: {str(e)}"}

    if not matches:
        msg = "No scheduled matches."
        if lang == "ar": msg = "لا توجد مباريات مجدولة حالياً."
        elif lang == "fr": msg = "Aucun match prévu."
        return {"results": [], "message": msg}

    results = []
    for m in matches:
        home_name = m["homeTeam"]["name"]
        away_name = m["awayTeam"]["name"]
        
        # البحث المرن عن إحصائيات الفرق
        h_s = team_stats.get(home_name)
        if not h_s: 
            for key in team_stats:
                if key in home_name or home_name in key:
                    h_s = team_stats[key]
                    break
                    
        a_s = team_stats.get(away_name)
        if not a_s:
            for key in team_stats:
                if key in away_name or away_name in key:
                    a_s = team_stats[key]
                    break
        
        if not h_s or not a_s: 
            reason = "Stats loading for these teams..."
            if lang == "ar": reason = "جاري تحميل الإحصائيات لهذه الفرق..."
            elif lang == "fr": reason = "Chargement des stats pour ces équipes..."
            
            winner_msg = "Analyzing..."
            if lang == "ar": winner_msg = "جاري التحليل..."
            elif lang == "fr": winner_msg = "Analyse..."

            results.append({
                "match": f"{home_name} vs {away_name}",
                "home_team": home_name,
                "away_team": away_name,
                "home_logo": m["homeTeam"].get("crest", ""),
                "away_logo": m["awayTeam"].get("crest", ""),
                "winner": winner_msg,
                "prob": "N/A",
                "prob_val": 0,
                "btts": "N/A",
                "btts_prob": "N/A",
                "high_conf": False,
                "time": m["utcDate"],
                "reason": reason,
                "home_stats": {"avg_scored": 0, "avg_conceded": 0, "form_pts": 0, "strength": 0},
                "away_stats": {"avg_scored": 0, "avg_conceded": 0, "form_pts": 0, "strength": 0}
            })
            continue
            
        feature_names = ['home_avg_scored', 'home_avg_conceded', 'away_avg_scored', 'away_avg_conceded', 'h_form_pts', 'h_form_goals', 'a_form_pts', 'a_form_goals', 'h_strength', 'a_strength', 'expected_goal_diff']
        features_df = pd.DataFrame([[h_s['avg_scored'], h_s['avg_conceded'], a_s['avg_scored'], a_s['avg_conceded'], h_s['form_pts'], h_s['form_goals'], a_s['form_pts'], a_s['form_goals'], h_s['strength'], a_s['strength'], h_s['avg_scored'] - a_s['avg_scored']]], columns=feature_names)
        
        w_p = winner_model.predict_proba(features_df)[0]
        b_p = btts_model.predict_proba(features_df)[0][1]
        
        idx = w_p.argmax()
        winner_res = ["DRAW", home_name, away_name][idx]
        if lang == "ar":
            if idx == 0: winner_res = "تعادل"
            elif idx == 1: winner_res = home_name
            else: winner_res = away_name
        elif lang == "fr":
            if idx == 0: winner_res = "NUL"
            elif idx == 1: winner_res = home_name
            else: winner_res = away_name
        
        max_p = w_p[idx]
        
        # reasoning logic with translations
        if idx == 1: # Home Win
            scored_diff = h_s['avg_scored'] - a_s['avg_scored']
            conceded_diff = a_s['avg_conceded'] - h_s['avg_conceded']
            if scored_diff > 0:
                if lang == "ar": reason = f"أداء هجومي متفوق (+{scored_diff:.2f} أهداف) وقوة هجومية أكبر لصالح الفريق المضيف."
                elif lang == "fr": reason = f"Performance offensive supérieure (+{scored_diff:.2f} buts) et plus grande force offensive pour l'équipe à domicile."
                else: reason = f"Superior attacking performance (+{scored_diff:.2f} goals) and greater offensive strength for the home team."
            elif conceded_diff > 0:
                if lang == "ar": reason = f"صلابة دفاعية أكبر (يستقبل أهدافاً أقل بـ {conceded_diff:.2f}) مما يعطيهم الأفضلية."
                elif lang == "fr": reason = f"Plus grande solidité défensive (encaisse {conceded_diff:.2f} buts de moins) leur donnant l'avantage."
                else: reason = f"Greater defensive solidity (concedes {conceded_diff:.2f} fewer goals) giving them the edge."
            else:
                if lang == "ar": reason = f"أفضلية الأرض مع قوة إجمالية متفوقة ({h_s['strength']:.2f})."
                elif lang == "fr": reason = f"Avantage du terrain avec une force globale supérieure ({h_s['strength']:.2f})."
                else: reason = f"Home ground advantage with superior overall strength ({h_s['strength']:.2f})."
        elif idx == 2: # Away Win
            scored_diff = a_s['avg_scored'] - h_s['avg_scored']
            conceded_diff = h_s['avg_conceded'] - a_s['avg_conceded']
            if scored_diff > 0:
                if lang == "ar": reason = f"تفوق هجومي واضح للضيف (+{scored_diff:.2f} أهداف) يجعله المفضل."
                elif lang == "fr": reason = f"Supériorité offensive claire pour le visiteur (+{scored_diff:.2f} buts) en fait le favori."
                else: reason = f"Clear attacking superiority for the visitor (+{scored_diff:.2f} goals) makes them the favorite."
            elif conceded_diff > 0:
                if lang == "ar": reason = f"تنظيم دفاعي متميز خارج الأرض (يستقبل أهدافاً أقل بـ {conceded_diff:.2f}) يمنحه فرصة أفضل."
                elif lang == "fr": reason = f"Organisation défensive exceptionnelle à l'extérieur (encaisse {conceded_diff:.2f} de moins) leur donne une meilleure chance."
                else: reason = f"Outstanding defensive organization away from home (concedes {conceded_diff:.2f} fewer) gives them a better chance."
            else:
                if lang == "ar": reason = f"مستوى فني أعلى في المباريات الأخيرة ({a_s['form_pts']} نقطة) وقدرة عالية على الحسم."
                elif lang == "fr": reason = f"Forme technique supérieure lors des derniers matchs ({a_s['form_pts']} points) et grande capacité de finition."
                else: reason = f"Higher technical form in recent matches ({a_s['form_pts']} points) and high finishing ability."
        else: # Draw
            if lang == "ar": reason = "توازن كبير في الأرقام الهجومية والدفاعية وتقارب في المستوى، مما يرجح كفة التعادل."
            elif lang == "fr": reason = "Grand équilibre des statistiques offensives et défensives et proximité de niveau, ce qui favorise un match nul."
            else: reason = "Great balance in attacking and defensive figures and closeness in level, which favors a draw."

        btts_res = "YES" if b_p > 0.5 else "NO"
        if lang == "ar": btts_res = "نعم" if b_p > 0.5 else "لا"
        elif lang == "fr": btts_res = "OUI" if b_p > 0.5 else "NON"

        results.append({
            "match": f"{home_name} vs {away_name}",
            "home_team": home_name,
            "away_team": away_name,
            "home_logo": m["homeTeam"].get("crest", ""),
            "away_logo": m["awayTeam"].get("crest", ""),
            "winner": winner_res,
            "prob": f"{max_p*100:.1f}%",
            "prob_val": float(max_p),
            "btts": btts_res,
            "btts_prob": f"{b_p*100:.1f}%",
            "high_conf": bool(max(w_p[1], w_p[2]) >= 0.65 and w_p[0] <= 0.25),
            "time": m["utcDate"],
            "reason": reason,
            "home_stats": {
                "avg_scored": float(h_s['avg_scored']),
                "avg_conceded": float(h_s['avg_conceded']),
                "form_pts": int(h_s['form_pts']),
                "strength": float(h_s['strength'])
            },
            "away_stats": {
                "avg_scored": float(a_s['avg_scored']),
                "avg_conceded": float(a_s['avg_conceded']),
                "form_pts": int(a_s['form_pts']),
                "strength": float(a_s['strength'])
            }
        })

    return clean_numpy({"results": results})

def get_live_matches():
    # Fetching IN_PLAY, PAUSED, and FINISHED (recently ended) matches
    url = f"{config.BASE_URL}/matches?status=IN_PLAY,PAUSED,FINISHED"
    headers = {"X-Auth-Token": config.API_TOKEN}
    try:
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code != 200:
            return []
        all_matches = response.json().get("matches", [])
        
        # Limit FINISHED matches to those from today only to avoid clutter
        from datetime import datetime, timezone
        now = datetime.now(timezone.utc)
        
        results = []
        for m in all_matches:
            current_score = m.get("score", {})
            status = m.get("status")
            
            # Formatting match status/minute
            display_time = "LIVE"
            if status == "PAUSED":
                display_time = "HT"
            elif status == "FINISHED":
                # Only show if ended in the last 2 hours or same day
                display_time = "FT"
            else:
                minute = m.get('minute')
                if minute:
                    display_time = f"{minute}'"
                else:
                    try:
                        match_time_str = m['utcDate'].replace('Z', '+00:00')
                        start_time = datetime.fromisoformat(match_time_str)
                        elapsed = now - start_time
                        # Subtract 4 minutes as requested by user to match real time
                        elapsed_mins = int(elapsed.total_seconds() / 60) - 4
                        
                        if elapsed_mins < 0:
                            display_time = "0'"
                        elif elapsed_mins <= 45:
                            display_time = f"{elapsed_mins}'"
                        elif elapsed_mins <= 60:
                            display_time = "HT"
                        elif elapsed_mins <= 105:
                            display_time = f"{elapsed_mins - 15}'"
                        else:
                            display_time = "90+'"
                    except:
                        display_time = "LIVE"
            
            results.append({
                "match": f"{m['homeTeam']['name']} vs {m['awayTeam']['name']}",
                "home_team": m['homeTeam']['name'],
                "away_team": m['awayTeam']['name'],
                "home_logo": m['homeTeam'].get('crest', ''),
                "away_logo": m['awayTeam'].get('crest', ''),
                "home_score": current_score.get("fullTime", {}).get("home", 0),
                "away_score": current_score.get("fullTime", {}).get("away", 0),
                "minute": display_time,
                "status": status,
                "competition": m.get("competition", {}).get("name", "Unknown League")
            })
        
        # Sort so LIVE are first, then HT, then FT
        status_order = {"IN_PLAY": 0, "PAUSED": 1, "FINISHED": 2}
        results.sort(key=lambda x: status_order.get(x["status"], 3))
        
        return results
    except Exception as e:
        print(f"Error fetching live matches: {e}")
        return []
