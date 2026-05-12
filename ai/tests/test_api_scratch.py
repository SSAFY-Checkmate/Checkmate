import sys
import os
from fastapi.testclient import TestClient

# Add current dir to path to import main
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from main import app

client = TestClient(app)

def test_extract_claims():
    text_to_test = """
    Apple Inc. was founded in 1976 by Steve Jobs. 
    The company is incredibly innovative.
    """
    
    payload = {
        "text": text_to_test,
        "video_title": "History of Apple (1976-2024)"
    }
    
    print("Sending request to /claims/extract ...")
    try:
        response = client.post("/claims/extract", json=payload)
        print(f"Status Code: {response.status_code}")
        print("Response JSON:")
        print(response.json())
    except Exception as e:
        print(f"Error during request: {e}")

if __name__ == "__main__":
    test_extract_claims()
