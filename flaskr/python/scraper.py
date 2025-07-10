import requests
from bs4 import BeautifulSoup
import json

def fetch_spelling_bee():
    URL = 'https://www.nytimes.com/puzzles/spelling-bee'
    HEADERS = {'User-Agent': 'Mozilla/5.0'}
    resp = requests.get(URL, headers=HEADERS)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, 'html.parser')

    # Find the script tag that contains the initial state
    script = soup.find('script', string=lambda s: s and 'window.gameData' in s)
    if not script:
        raise RuntimeError("Couldn't locate game data script in page.")

    # Extract JSON
    text = script.string
    prefix = 'window.gameData = '
    json_str = text[len(prefix):].strip()
    if json_str.endswith(';'):
        json_str = json_str[:-1]
    data = json.loads(json_str)

    # Extract letters
    letters = data['today']['outerLetters']
    letters = [letter.capitalize() for letter in letters]
    center = data['today']['centerLetter'].capitalize()

    # Extract answers and pangrams
    answers = data['today'].get('answers', [])
    pangrams = data['today'].get('pangrams', [])

    return {
        'center_letter': center,
        'outer_letters': letters,
        'answers': answers,
        'pangrams': pangrams
    }

if __name__ == '__main__':
    info = fetch_spelling_bee()
    print("Center letter:", info['center_letter'])
    print("Outer letters:", info['outer_letters'])
    print("Answers:", info['answers'])
    print("Pangrams:", info['pangrams'])
