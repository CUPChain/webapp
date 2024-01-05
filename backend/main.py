from flask import Flask

app = Flask(__name__, static_folder="../frontend/build", static_url_path="/")


@app.route("/")
def index():
    return app.send_static_file("index.html")


@app.errorhandler(404)
def not_found(e):
    return app.send_static_file("index.html")


# @app.route("/login/")
# def login():
#     # here we have the login page

#     return {"login": "bla bla"}


# @app.route("/appointment/")  # add <user_id> to the path
# def book_appointments():
#     # here we have the booked appointment page
#     # and the list of available prescriptions

#     return {"appointment": "bla bla"}


# @app.route("/reservation_info/")  # add <reservation_id> to the path
# def reservation_info():
#     # here we have the information about the reservation
#     # ith the qr and the stuff about the verification on the blockchain

#     return {"reservation_info": "bla bla"}


# @app.route("/account/")  # add <user_id> to the path
# def account():
#     # here we have the account page

#     return {"account": "bla bla"}


if __name__ == "__main__":
    app.run(debug=True)
