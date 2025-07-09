from flask import Flask
from flaskr.python import pages
from pathlib import Path

def create_app():
    base_dir = Path(__file__).resolve().parent.parent
    template_folder = str(base_dir / "templates")
    static_folder = str(base_dir / "static")
    app = Flask(__name__, template_folder=template_folder, static_folder=static_folder)

    app.register_blueprint(pages.bp)

    return app
