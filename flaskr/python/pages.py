from flask import Flask, jsonify, render_template, Blueprint
from flaskr.python.scraper import fetch_spelling_bee
from flask_cors import CORS
import os

bp = Blueprint("pages", __name__)

index_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

@bp.route('/bee')
def bee():
    info = fetch_spelling_bee()
    return jsonify({
        'center_letter': info['center_letter'],
        'outer_letters': info['outer_letters']
    })

@bp.route('/')
def root():
    return render_template("index.html")

