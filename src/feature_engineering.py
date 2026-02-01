import pandas as pd
import numpy as np
import os
import sys
import pickle

# إضافة المجلد الرئيسي للمسار
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import config

def calculate_advanced_features(df):
    # ترتيب حسب التاريخ
    df['date'] = pd.to_datetime(df['date']).dt.tz_localize(None)
    df = df.sort_values('date')
    
    # تحويل الأهداف لنقاط
    def get_points(row, team_type):
        if row['home_goals'] == row['away_goals']: return 1
        if team_type == 'home':
            return 3 if row['home_goals'] > row['away_goals'] else 0
        else:
            return 3 if row['away_goals'] > row['home_goals'] else 0

    # ميزات جديدة
    new_cols = [
        'home_avg_scored', 'home_avg_conceded', 'away_avg_scored', 'away_avg_conceded',
        'h_form_pts', 'h_form_goals', 'a_form_pts', 'a_form_goals',
        'h_strength', 'a_strength'
    ]
    for col in new_cols:
        df[col] = 0.0

    teams = pd.concat([df['home_team'], df['away_team']]).unique()
    team_history = {team: {'scored': [], 'conceded': [], 'points': []} for team in teams}

    print("جاري حساب الميزات المتقدمة (المعدلات، الفورمة، القوة)...")
    
    for idx, row in df.iterrows():
        h_team = row['home_team']
        a_team = row['away_team']
        
        # ميزات صاحب الأرض قبل المباراة
        if len(team_history[h_team]['scored']) > 0:
            df.at[idx, 'home_avg_scored'] = np.mean(team_history[h_team]['scored'][-10:])
            df.at[idx, 'home_avg_conceded'] = np.mean(team_history[h_team]['conceded'][-10:])
            df.at[idx, 'h_form_pts'] = sum(team_history[h_team]['points'][-5:])
            df.at[idx, 'h_form_goals'] = sum(team_history[h_team]['scored'][-5:])
            df.at[idx, 'h_strength'] = np.mean(team_history[h_team]['points'][-10:])
        
        # ميزات الضيف قبل المباراة
        if len(team_history[a_team]['scored']) > 0:
            df.at[idx, 'away_avg_scored'] = np.mean(team_history[a_team]['scored'][-10:])
            df.at[idx, 'away_avg_conceded'] = np.mean(team_history[a_team]['conceded'][-10:])
            df.at[idx, 'a_form_pts'] = sum(team_history[a_team]['points'][-5:])
            df.at[idx, 'a_form_goals'] = sum(team_history[a_team]['scored'][-5:])
            df.at[idx, 'a_strength'] = np.mean(team_history[a_team]['points'][-10:])
            
        # تحديث السجل بعد المباراة
        team_history[h_team]['scored'].append(row['home_goals'])
        team_history[h_team]['conceded'].append(row['away_goals'])
        team_history[h_team]['points'].append(get_points(row, 'home'))
        
        team_history[a_team]['scored'].append(row['away_goals'])
        team_history[a_team]['conceded'].append(row['home_goals'])
        team_history[a_team]['points'].append(get_points(row, 'away'))

    df['expected_goal_diff'] = df['home_avg_scored'] - df['away_avg_scored']
    df['winner_target'] = np.where(df['home_goals'] > df['away_goals'], 1,
                          np.where(df['home_goals'] < df['away_goals'], 2, 0))
    df['btts_target'] = ((df['home_goals'] > 0) & (df['away_goals'] > 0)).astype(int)
    
    return df, team_history

def create_features():
    if not os.path.exists(config.PROCESSED_DATA_PATH):
        print(f"الملف {config.PROCESSED_DATA_PATH} غير موجود.")
        return

    df = pd.read_csv(config.PROCESSED_DATA_PATH)
    df, team_history = calculate_advanced_features(df)
    
    # حفظ الإحصائيات الحالية للتوقعات المستقبلية
    current_stats = {}
    for team, stats in team_history.items():
        if len(stats['scored']) > 0:
            current_stats[team] = {
                'avg_scored': np.mean(stats['scored'][-10:]),
                'avg_conceded': np.mean(stats['conceded'][-10:]),
                'form_pts': sum(stats['points'][-5:]),
                'form_goals': sum(stats['scored'][-5:]),
                'strength': np.mean(stats['points'][-10:])
            }
        else:
            current_stats[team] = {
                'avg_scored': 0.0, 'avg_conceded': 0.0,
                'form_pts': 0.0, 'form_goals': 0.0, 'strength': 0.0
            }

    with open(config.TEAM_STATS_PATH, "wb") as f:
        pickle.dump(current_stats, f)
        
    df.to_csv("data/processed/features_advanced.csv", index=False)
    print("تم تحديث الميزات المتقدمة بنجاح.")
    return df

if __name__ == "__main__":
    create_features()
