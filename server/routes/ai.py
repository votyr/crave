import os
from flask import Blueprint, jsonify, request, session

from services import AIService, RecommendationService, ProfileService
from auth_tokens import verify_token

ai_bp = Blueprint("ai", __name__)

def _jwt_secret() -> str:
    return os.getenv("SECRET_KEY", "dev_secret")

@ai_bp.route("/meal-plan", methods=["POST"])
def meal_plan():
    user_id = _resolve_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    profile = ProfileService.get(user_id)
    if not profile:
        return jsonify({"error": "Profile not found"}), 404

    data = request.get_json() or {}
    excluded = data.get("excluded", [])  # from chat, see part 3

    result = RecommendationService.generate_meal_plan(
        profile, context={"excluded_ingredients": excluded}
    )
    return jsonify(result)

def _resolve_user_id():
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header.split(" ", 1)[1].strip()
        payload = verify_token(token, _jwt_secret())
        if payload:
            return payload.get("sub")
    return session.get("user_id")


@ai_bp.route("/recommend", methods=["POST"])
def recommend():
    user_id = _resolve_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    profile = ProfileService.get(user_id)
    if not profile:
        return jsonify({"error": "Profile not found"}), 404

    data = request.get_json() or {}
    page = data.get("page", "general")  # "nutrition" | "fitness" | "profile"

    result = RecommendationService.generate(profile, context={"page": page})
    return jsonify(result)


@ai_bp.route("/generate", methods=["POST"])
def generate():
    data = request.get_json()
    prompt = data.get("prompt")
    response = AIService.generate(prompt)
    return jsonify({"response": response})