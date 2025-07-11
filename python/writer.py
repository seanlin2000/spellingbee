import base64
import json
import os
import requests
from datetime import datetime
from zoneinfo import ZoneInfo

import click

from python.scraper import compile_info

def read_json_github(repo, path, token):
    """Read a JSON file from a GitHub repository."""
    url = f"https://api.github.com/repos/{repo}/contents/{path}"
    headers = {"Authorization": f"token {token}"}
    resp = requests.get(url, headers=headers)
    resp.raise_for_status()
    content = resp.json()
    file_content = base64.b64decode(content['content']).decode('utf-8')
    return json.loads(file_content)

def write_json_github(repo, path, data, token, commit_message="Update JSON file"):
    """Write a JSON file to a GitHub repository (creates or updates)."""
    url = f"https://api.github.com/repos/{repo}/contents/{path}"
    headers = {"Authorization": f"token {token}"}
    # Check if file exists to get its SHA
    resp = requests.get(url, headers=headers)
    if resp.status_code == 200:
        sha = resp.json()['sha']
    else:
        sha = None
    content = base64.b64encode(json.dumps(data, ensure_ascii=False, indent=2).encode('utf-8')).decode('utf-8')
    payload = {
        "message": commit_message,
        "content": content,
        "branch": "main"
    }
    if sha:
        payload["sha"] = sha
    put_resp = requests.put(url, headers=headers, json=payload)
    put_resp.raise_for_status()
    return put_resp.json()

def github_file_exists(repo, path, token):
    """Check if a file exists at the given path in the GitHub repository."""
    url = f"https://api.github.com/repos/{repo}/contents/{path}"
    headers = {"Authorization": f"token {token}"}
    resp = requests.get(url, headers=headers)
    return resp.status_code == 200

def get_github_token(token_path="token.txt"):
    """Read the GitHub token from a file in the same directory as this script."""
    abs_path = os.path.join(os.path.dirname(__file__), token_path)
    with open(abs_path, "r", encoding="utf-8") as f:
        return f.read().strip()
    
def create_dates_dict(date):
    return {
        "current_date": date,
        "valid_dates": [date]
    }

@click.command()
@click.option("--overwrite", help="Overwrite file", default=False)
@click.option("--local", help="Running locally or on github", default=False)
def run(overwrite, local):
    TOKEN = get_github_token() if local else os.environ["TOKEN_GITHUB"]
    REPO = "seanlin2000/spellingbee"
    print(TOKEN)
    pacific_now = datetime.now(ZoneInfo("America/Los_Angeles"))
    date = pacific_now.strftime("%Y%m%d")
    json_path = f"data/bee_{date}.json"
    print(date, json_path)
    bee_data = compile_info()
    data_exists = github_file_exists(REPO, json_path, TOKEN)
    if (data_exists and overwrite) or (not data_exists):
        write_json_github(REPO, json_path, bee_data, TOKEN)
    
    date_path = "data/dates.json"
    date_path_exists = github_file_exists(REPO, date_path, TOKEN)
    if date_path_exists:
        dates_data = read_json_github(REPO, date_path, TOKEN)
        dates_data["current_date"] = date
        if date not in dates_data["valid_dates"]:
            dates_data["valid_dates"].append(date)
    else:
        dates_data = create_dates_dict(date)
    write_json_github(REPO, date_path, dates_data, TOKEN)

if __name__ == '__main__':
    run()

