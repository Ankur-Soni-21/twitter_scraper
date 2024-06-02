from flask import Flask, jsonify
import subprocess
import json

app = Flask(__name__)

@app.route('/get-tags')
def get_tags():
    # Execute the Python script to scrape Twitter tags
    result = subprocess.run(['python', 'twitter_scraper.py'], capture_output=True, text=True)
    # Parse the output JSON
    tags = json.loads(result.stdout)
    # Return the tags as JSON
    return jsonify(tags=tags)

if __name__ == "__main__":
    app.run(debug=True)
