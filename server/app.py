# app.py
from flask import Flask, request, jsonify, session
from flask_cors import CORS
from openai import OpenAI
from werkzeug.security import generate_password_hash, check_password_hash
import os
from datetime import datetime
from dotenv import load_dotenv
from database import db
from models import (
    User,
    UserProfile,
    MealPlan,
    WorkoutPlan,
    ProgressLog,
    AIHistory,
)

# Load environment variables from .env
load_dotenv()

app = Flask(__name__)

app.secret_key = os.getenv("SECRET_KEY", "dev_secret")

db_port = os.getenv("DB_PORT")

# Allow the server to start even when DB env vars are not provided (local preview mode)
if all([os.getenv("DB_USER"), os.getenv("DB_PASSWORD"), os.getenv("DB_HOST"), db_port, os.getenv("DB_NAME")]):
    app.config["SQLALCHEMY_DATABASE_URI"] = (
        f"postgresql://"
        f"{os.getenv('DB_USER')}:"
        f"{os.getenv('DB_PASSWORD')}@"
        f"{os.getenv('DB_HOST')}:"
        f"{db_port}/"
        f"{os.getenv('DB_NAME')}"
    )
else:
    # In-memory sqlite for development/offline use
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)

CORS(
    app,
    supports_credentials=True,
    origins=["http://localhost:5173",
    "http://localhost:3000"]
)

# OpenAI client is used in server/services/ai_service.py.
# Avoid initializing it here so the server can start even if env vars are missing.


from routes import (
    auth_bp,
    profile_bp,
    nutrition_bp,
    fitness_bp,
    ai_bp,
    requirements_bp,
)


# Health + weather endpoints expected by frontend
from services import WeatherService

@app.route("/")
def home():
    return {
        "status": "online",
        "message": "Crave Backend is running 🚀"
    }

@app.get("/api/health")
def health():
    return jsonify({"message": "Backend connected"})

@app.get("/api/user/stats")
def user_stats():
    location = request.args.get("location", "")
    if not location:
        return jsonify({"weather": None})

    try:
        lat_str, lon_str = [p.strip() for p in location.split(",")]
        lat, lon = float(lat_str), float(lon_str)
    except (ValueError, IndexError):
        return jsonify({"weather": None, "error": "location must be 'lat,lon'"}), 400

    try:
        weather = WeatherService.current(lat, lon)
    except Exception:
        return jsonify({"weather": None, "error": "weather lookup failed"}), 502

    return jsonify({"weather": weather})

app.register_blueprint(auth_bp, url_prefix="/api/auth")
# Existing profile routes under /api/profile
app.register_blueprint(profile_bp, url_prefix="/api/profile")
# Alias required by frontend: /api/users/profile
from routes.profile import get_profile as users_profile_get, update_profile as users_profile_update
app.add_url_rule(
    "/api/users/profile",
    endpoint="users_profile_get",
    view_func=users_profile_get,
    methods=["GET"],
)
app.add_url_rule(
    "/api/users/profile",
    endpoint="users_profile_update",
    view_func=users_profile_update,
    methods=["PUT"],
)
app.register_blueprint(nutrition_bp, url_prefix="/api/nutrition")
app.register_blueprint(fitness_bp, url_prefix="/api/fitness")
app.register_blueprint(ai_bp, url_prefix="/api/ai")
app.register_blueprint(requirements_bp, url_prefix="/api/requirements")


if __name__ == "__main__":
    with app.app_context():
        db.create_all()

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )