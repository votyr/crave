from flask import Blueprint, jsonify, request

from services import ProfileService

requirements_bp = Blueprint("requirements", __name__)


@requirements_bp.route("/missing", methods=["GET"])
def missing():
    """Return which profile fields are missing.

    This is designed to be backend-only support for the frontend.
    It uses the same auth logic as profile routes (Authorization: Bearer <token>).
    """

    # Import here to avoid circular deps
    import os
    from auth_tokens import verify_token
    from flask import session

    def _jwt_secret():
        return os.getenv("SECRET_KEY", "dev_secret")

    def _get_bearer_user_id():
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return None
        token = auth_header.split(" ", 1)[1].strip()
        payload = verify_token(token, _jwt_secret())
        return payload.get("sub") if payload else None

    user_id = _get_bearer_user_id()
    if user_id is None:
        user_id = session.get("user_id")

    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    profile = ProfileService.get(user_id)
    if not profile:
        return jsonify({"error": "Profile not found"}), 404

    dietary = getattr(profile, "dietary_preferences", None) or []
    allergies = getattr(profile, "allergies", None) or []

    missing_fields = []

    # Frontend profile keys
    if getattr(profile, "age", None) in (None, ""):
        missing_fields.append("age")
    if getattr(profile, "weight", None) in (None, ""):
        missing_fields.append("weight")
    if getattr(profile, "goal", None) in (None, ""):
        missing_fields.append("goal")
    if getattr(profile, "activity_level", None) in (None, ""):
        missing_fields.append("activity")
    if not getattr(profile, "religion", None):
        missing_fields.append("religion")
    if not (getattr(profile, "city", None) or getattr(profile, "country", None)):
        missing_fields.append("location")
    if getattr(profile, "climate", None) in (None, ""):
        missing_fields.append("climate")
    # Dietary can be empty; decide if you want to require at least 1.
    if len(dietary) == 0:
        missing_fields.append("dietary")
    if len(allergies) == 0:
        missing_fields.append("allergies")

    return jsonify({"missing": missing_fields})

