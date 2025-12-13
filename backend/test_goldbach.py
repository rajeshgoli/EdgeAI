import requests
import json

def test_goldbach():
    # Load data
    with open('spin_data.json', 'r') as f:
        data = json.load(f)
    
    # Take last 1000 candles
    chart_data = data['past_data'][-1000:]
    
    payload = {
        "chart_data": chart_data,
        "strategy_persona": "GOLDBACH_MODE"
    }
    
    try:
        response = requests.post("http://localhost:8000/analyze", json=payload)
        response.raise_for_status()
        result = response.json()
        
        print("Status Code:", response.status_code)
        print("Narrative:", result.get("narrative"))
        print("Dealing Range:", json.dumps(result.get("dealing_range"), indent=2))
        print("Current Status:", json.dumps(result.get("current_status"), indent=2))
        print("Signals:", json.dumps(result.get("signals"), indent=2))
        
    except Exception as e:
        print(f"Error: {e}")
        if 'response' in locals():
            print(response.text)

if __name__ == "__main__":
    test_goldbach()
