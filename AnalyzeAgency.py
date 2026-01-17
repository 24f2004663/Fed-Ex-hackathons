import sys
import json
import re
import argparse
import os

def analyze(file_path):
    extracted_score = None
    extracted_capacity = None
    
    try:
        if not os.path.exists(file_path):
            print(json.dumps({"error": "File not found"}))
            sys.exit(1)

        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
            
            # regex for score: "Score: 95", "Rating: 88/100", "Performance: 92%"
            score_match = re.search(r'(?:Score|Rating|Performance|Grade)\s*[:=]\s*(\d{1,3})', content, re.IGNORECASE)
            if score_match:
                extracted_score = int(score_match.group(1))
                if extracted_score > 100: extracted_score = 100
            
            # regex for capacity: "Capacity: 10", "Cases: 5"
            cap_match = re.search(r'(?:Capacity|Load|Handle|Cases)\s*[:=]\s*(\d{1,3})', content, re.IGNORECASE)
            if cap_match:
                extracted_capacity = int(cap_match.group(1))

    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

    # Result Access
    result = {
        "score": extracted_score,
        "capacity": extracted_capacity
    }
    print(json.dumps(result))

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    # We don't need agency_id anymore for analysis, just the file
    parser.add_argument('--agency_id', required=False) 
    parser.add_argument('--file', required=True)
    args = parser.parse_args()
    
    analyze(args.file)
