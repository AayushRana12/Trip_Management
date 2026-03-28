from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

users = [
    {"email": "admin@gmail.com", "password": "1234", "role": "admin"},
    {"email": "user@gmail.com", "password": "1234", "role": "user"},
]

@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()  # ✅ safer

    if not data:
        return jsonify({"error": "No data received"}), 400

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Missing fields"}), 400

    for user in users:
        if user["email"] == email and user["password"] == password:
            return jsonify({
                "email": user["email"],
                "role": user["role"]
            })

    return jsonify({"error": "Invalid credentials"}), 401


if __name__ == "__main__":
    app.run(debug=True)