import requests
import config

def check_leagues():
    headers = {"X-Auth-Token": config.API_TOKEN}
    url = f"{config.BASE_URL}/competitions"
    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            comps = response.json().get("competitions", [])
            print("--- Available Competitions ---")
            for c in comps:
                print(f"Code: {c['code']}, Name: {c['name']}")
        else:
            print(f"Error: {response.status_code}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_leagues()
