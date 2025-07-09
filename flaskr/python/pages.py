from flask import Flask, jsonify, render_template, Blueprint
from flaskr.python.scraper import fetch_spelling_bee
from flaskr.python.calculator import compute_max_score, compute_rankings
from flask_cors import CORS
import os

bp = Blueprint("pages", __name__)

index_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

@bp.route('/bee')
def bee():
    info = fetch_spelling_bee()
    info_dict = {
        'center_letter': info['center_letter'],
        'outer_letters': info['outer_letters'],
        'answers': info['answers'],
        'pangrams': info['pangrams'],
    }

    answers = info['answers']
    pangrams = info['pangrams']
    max_score = compute_max_score(answers, pangrams)
    ranking_scores = compute_rankings(max_score)
    info_dict.update(ranking_scores)
    return jsonify(info_dict)

@bp.route('/')
def root():
    return render_template("index.html")

