from flask import Blueprint, request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash
from services import ProfileService  # add this import

import os

from database import db
from models import User, UserProfile
from auth_tokens import make_token, verify_token


auth_bp = Blueprint("auth", __name__)


def _user_payload(user: User):
    profile = getattr(user, "profile", None)

    dietary = getattr(profile, "dietary_preferences", None)
    if dietary is None:
        dietary = []

    allergies = getattr(profile, "allergies", None)
    if allergies is None:
        allergies = []

    return {
        "id": user.id,
        "name": user.full_name,
        "email": user.email,
        # These keys are shaped to match the frontend's `profile` object.
        "age": getattr(profile, "age", None),
        "goal": getattr(profile, "goal", None),
        "activity": getattr(profile, "activity_level", None),
        "dietary": dietary,
        "religion": getattr(profile, "religion", None),
        "location": getattr(profile, "city", None) or getattr(profile, "country", None),
        "weather": {
            "temperature": getattr(profile, "temperature", None),
            "humidity": getattr(profile, "humidity", None),
            "climate": getattr(profile, "climate", None),
            "updated_at": (
                profile.weather_updated_at.isoformat()
                if profile.weather_updated_at
                else None
            ),
        },
        "allergies": allergies,
        "weight": getattr(profile, "weight", None),
    }

def _jwt_secret() -> str:
    return os.getenv("SECRET_KEY", "dev_secret")

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}

    email = data.get("email")
    password = data.get("password")
    full_name = data.get("name") or data.get("full_name") or data.get("fullName")

    if not email or not password:
        return jsonify({"error": "Email and password are required."}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered."}), 400

    username = email.split("@", 1)[0]

    user = User(
        username=username,
        email=email,
        full_name=full_name,
        password_hash=generate_password_hash(password),
    )

    db.session.add(user)
    db.session.commit()

    profile = UserProfile(user_id=user.id)
    db.session.add(profile)
    db.session.commit()

    # Apply any profile fields sent at signup
    profile_fields = {k: v for k, v in data.items()
                        if k not in ("email", "password", "name", "full_name", "fullName")}
    if profile_fields:
        mapped = dict(profile_fields)
        if "activityLevel" in mapped:
            mapped["activity_level"] = mapped.pop("activityLevel")
        if "dietaryPreferences" in mapped:
            mapped["dietary_preferences"] = mapped.pop("dietaryPreferences")
        if "location" in mapped:
            mapped["city"] = mapped.pop("location")
        ProfileService.update(user.id, mapped)

    token = make_token({"sub": user.id}, _jwt_secret())

    return jsonify({
        "message": "Registration successful.",
        "token": token,
        "user": _user_payload(user),
    })

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}

    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first()

    if user is None or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid credentials."}), 401

    session["user_id"] = user.id

    token = make_token({"sub": user.id}, _jwt_secret())

    return jsonify({
        "message": "Login successful.",
        "token": token,
        "user": _user_payload(user),
    })


@auth_bp.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"message": "Logged out."})


@auth_bp.route("/me")
def me():
    # Prefer JWT bearer token (frontend uses Authorization header)
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header.split(" ", 1)[1].strip()
        payload = verify_token(token, _jwt_secret())
        if payload and payload.get("sub"):
            user = User.query.get(payload.get("sub"))
            if user:
                return jsonify({"user": _user_payload(user)})

    # Fallback to cookie session
    if "user_id" not in session:
        return jsonify({"error": "Unauthorized."}), 401

    user = User.query.get(session["user_id"])
    if not user:
        return jsonify({"error": "Unauthorized."}), 401

    return jsonify({"user": _user_payload(user)})

