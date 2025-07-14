import os
import requests
from bs4 import BeautifulSoup
import json
import time
import random

import sys
sys.path.append(os.path.dirname(__file__))
from python.calculator import compute_score, compute_rankings


def fetch_spelling_bee():
    # Add random delay between 0 and 40 minutes (0-2400 seconds)
    delay = random.uniform(0, 2400)
    print(f"Sleeping for {delay:.1f} seconds before visiting NYT Spelling Bee...")
    time.sleep(delay)
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

def compile_info():
    info = fetch_spelling_bee()
    info_dict = {
        'center_letter': info['center_letter'],
        'outer_letters': info['outer_letters'],
        'answers': info['answers'],
        'pangrams': info['pangrams'],
    }

    answers = info['answers']
    pangrams = info['pangrams']
    max_score = compute_score(answers, pangrams)
    ranking_scores = compute_rankings(max_score)
    info_dict.update(ranking_scores)
    return info_dict

if __name__ == '__main__':
    info = compile_info()
    print(info)