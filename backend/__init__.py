from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS

from .config import config

db = SQLAlchemy()
migrate = Migrate()


def create_app(config_mode):
    app = Flask(__name__, static_folder="../frontend/build", static_url_path="/")
    if config_mode == "development":
        CORS(app) # This will enable CORS for all routes
    app.config.from_object(config[config_mode])

    db.init_app(app)
    migrate.init_app(app, db)

    return app
