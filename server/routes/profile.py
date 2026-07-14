import os
from flask import Blueprint, request, jsonify, session

from services import ProfileService
from auth_tokens import verify_token
from models import User

profile_bp = Blueprint("profile", __name__)


def _jwt_secret() -> str:
    return os.getenv("SECRET_KEY", "dev_secret")


def _get_bearer_user_id():
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None
    token = auth_header.split(" ", 1)[1].strip()
    payload = verify_token(token, _jwt_secret())
    return payload.get("sub") if payload else None


def _resolve_user_id():
    user_id = _get_bearer_user_id()
    if user_id is not None:
        return user_id
    return session.get("user_id")


@profile_bp.route("", methods=["GET"])
def get_profile():
    user_id = _resolve_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    profile = ProfileService.get(user_id)
    if not profile:
        return jsonify({"error": "Profile not found"}), 404

    return jsonify({
        "id": profile.id,
        "user_id": profile.user_id,
        "age": profile.age,
        "weight": profile.weight,
        "height": profile.height,
        "goal": profile.goal,
        "activity": profile.activity_level,
        "dietary": profile.dietary_preferences,
        "religion": profile.religion,
        "location": profile.city,
        "lat": profile.lat,
        "lon": profile.lon,
        "climate": profile.climate,
        "allergies": profile.allergies,
    })


@profile_bp.route("", methods=["PUT"])
def update_profile():
    user_id = _resolve_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json() or {}

    mapped = dict(data)
    if "activityLevel" in mapped:
        mapped["activity_level"] = mapped.pop("activityLevel")
    if "dietaryPreferences" in mapped:
        mapped["dietary_preferences"] = mapped.pop("dietaryPreferences")
    if "location" in mapped:
        mapped["city"] = mapped.pop("location")
    # lat, lon, climate pass through unchanged — model field names already match

    profile = ProfileService.update(user_id, mapped)
    if not profile:
        return jsonify({"error": "Profile not found"}), 404

    return jsonify({
        "id": profile.id,
        "user_id": profile.user_id,
        "age": profile.age,
        "weight": profile.weight,
        "height": profile.height,
        "goal": profile.goal,
        "activity": profile.activity_level,
        "dietary": profile.dietary_preferences,
        "religion": profile.religion,
        "location": profile.city,
        "lat": profile.lat,
        "lon": profile.lon,
        "climate": profile.climate,
        "allergies": profile.allergies,
    })