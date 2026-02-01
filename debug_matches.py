import os
import sys
import json
import requests
import pickle

# Add parent directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))
import config

def debug_predictions():
    print("Checking API connection...")
    url = f"{config.BASE_URL}/matches?status=SCHEDULED"
    headers = {"X-Auth-Token": config.API_TOKEN}
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        print(f"API Status: {response.status_code}")
        if response.status_code != 200:
            print(f"Error: {response.text}")
            return
        
        matches = response.json().get("matches", [])
        print(f"Total scheduled matches from API: {len(matches)}")
        
        if not os.path.exists(config.TEAM_STATS_PATH):
            print(f"Error: {config.TEAM_STATS_PATH} not found")
            return
            
        with open(config.TEAM_STATS_PATH, "rb") as f:
            team_stats = pickle.load(f)
        
        print(f"Total teams in stats: {len(team_stats)}")
        
        found_stats = 0
        missing_teams = set()
        for m in matches:
            h = m["homeTeam"]["name"]
            a = m["awayTeam"]["name"]
            if h in team_stats and a in team_stats:
                found_stats += 1
            else:
                if h not in team_stats: missing_teams.add(h)
                if a not in team_stats: missing_teams.add(a)
        
        print(f"Matches with available stats: {found_stats}")
        if missing_teams:
            print(f"Missing stats for {len(missing_teams)} teams: {list(missing_teams)[:10]}...")

    except Exception as e:
        print(f"Debug failed: {str(e)}")

if __name__ == "__main__":
    debug_predictions()
