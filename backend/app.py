import os
from flask_swagger import swagger
from flask_swagger_ui import get_swaggerui_blueprint
from flask import jsonify
from flasgger import Swagger

from . import create_app

app = create_app(os.getenv("CONFIG_MODE") or "development")
swag = Swagger(app)


@app.route("/")
def index():
    return app.send_static_file("index.html")


@app.errorhandler(404)
def not_found(e):
    return app.send_static_file("index.html")


# Applications Routes APIs
from .appointments import view
from .prescriptions import view
from .patients import view
from .hospitals import view
from .login import view
from .doctors import view
from .medical_exam import view


# ----------------------------------------------- #
# Swagger documentation route
@app.route("/swagger")
def get_swagger():
    swag = swagger(app)
    swag["info"]["version"] = "1.0"
    swag["info"]["title"] = "CUPChain API"
    return jsonify(swag)


# Swagger UI route
SWAGGER_URL = "/swagger-ui"
API_URL = "/swagger"
swaggerui_blueprint = get_swaggerui_blueprint(
    SWAGGER_URL, API_URL, config={"app_name": "CUPChain API"}
)
app.register_blueprint(swaggerui_blueprint, url_prefix=SWAGGER_URL)


if __name__ == "__main__":
    # To Run the Server in Terminal from the /backend path => flask run or flask run -h localhost -p 5000
    # To Run the Server with Automatic Restart When Changes Occurred => FLASK_DEBUG=1 flask run -h localhost -p 5000

    app.run()
