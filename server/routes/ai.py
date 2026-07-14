import os
from flask import Blueprint, jsonify, request, session

from services import AIService, RecommendationService, ProfileService, FitnessService
from auth_tokens import verify_token

ai_bp = Blueprint("ai", __name__)

VALID_RECIPE_MODES = {"search", "ingredients", "surprise", "healthy", "seasonal", "faith"}


def _jwt_secret() -> str:
    return os.getenv("SECRET_KEY", "dev_secret")


def _resolve_user_id():
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header.split(" ", 1)[1].strip()
        payload = verify_token(token, _jwt_secret())
        if payload:
            return payload.get("sub")
    return session.get("user_id")


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


@ai_bp.route("/recipe", methods=["POST"])
def recipe():
    user_id = _resolve_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    profile = ProfileService.get(user_id)
    if not profile:
        return jsonify({"error": "Profile not found"}), 404

    data = request.get_json() or {}
    mode = data.get("mode")

    if mode not in VALID_RECIPE_MODES:
        return jsonify({"error": f"invalid or missing mode. must be one of {sorted(VALID_RECIPE_MODES)}"}), 400

    dish = data.get("dish")
    if mode == "search" and not dish:
        return jsonify({"error": "dish is required for mode=search"}), 400

    ingredients = data.get("ingredients", [])
    if mode == "ingredients" and not ingredients:
        return jsonify({"error": "ingredients is required for mode=ingredients"}), 400

    missing_ingredients = data.get("missingIngredients", [])

    # seasonal mode can optionally use the profile's cached location/climate,
    # or an explicit override sent from the client
    context = {
        "location": data.get("location") or profile.city or profile.country,
        "climate": profile.climate,
    }

    result = RecommendationService.generate_recipe(
        profile,
        mode,
        dish=dish,
        ingredients=ingredients,
        missing_ingredients=missing_ingredients,
        context=context,
    )
    return jsonify(result)


@ai_bp.route("/generate", methods=["POST"])
def generate():
    data = request.get_json()
    prompt = data.get("prompt")
    response = AIService.generate(prompt)
    return jsonify({"response": response})


@ai_bp.route("/generate-workout", methods=["POST"])
def generate_workout():
    user_id = _resolve_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    profile = ProfileService.get(user_id)
    if not profile:
        return jsonify({"error": "Profile not found"}), 404

    data = request.get_json() or {}
    excluded = data.get("excludedExercises", [])

    result = FitnessService.generate(profile, excluded)
    return jsonify(result)