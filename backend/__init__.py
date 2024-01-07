from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

from .config import config

db = SQLAlchemy()
migrate = Migrate()


def create_app(config_mode):
    app = Flask(__name__, static_folder="../frontend/build", static_url_path="/")
    app.config.from_object(config[config_mode])

    db.init_app(app)
    migrate.init_app(app, db)

    return app
