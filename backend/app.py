import os

from . import create_app

app = create_app(os.getenv("CONFIG_MODE") or "development")


@app.route("/")
def index():
    return app.send_static_file("index.html")


@app.errorhandler(404)
def not_found(e):
    return app.send_static_file("index.html")


# Applications Routes APIs
from . import views
from . import login

# ----------------------------------------------- #

if __name__ == "__main__":
    # To Run the Server in Terminal from the /backend path => flask run or flask run -h localhost -p 5000
    # To Run the Server with Automatic Restart When Changes Occurred => FLASK_DEBUG=1 flask run -h localhost -p 5000

    app.run()
