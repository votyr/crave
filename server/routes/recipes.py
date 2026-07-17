from flask import Blueprint, jsonify, request

from routes.profile import _resolve_user_id
from services import RecipeService


recipes_bp = Blueprint("recipes", __name__)


RECIPE_FIELDS = {
    "title",
    "description",
    "cuisine",
    "meal_type",
    "diet_type",
    "prep_time",
    "cook_time",
    "servings",
    "calories",
    "protein",
    "carbs",
    "fat",
    "fiber",
    "ingredients",
    "instructions",
    "nutrition",
    "recipe_json",
    "ai_response",
    "image_url",
    "favorite",
}


def _recipe_payload(recipe):
    return {
        "id": recipe.id,
        "user_id": recipe.user_id,
        "title": recipe.title,
        "description": recipe.description,
        "cuisine": recipe.cuisine,
        "meal_type": recipe.meal_type,
        "diet_type": recipe.diet_type,
        "prep_time": recipe.prep_time,
        "cook_time": recipe.cook_time,
        "servings": recipe.servings,
        "calories": recipe.calories,
        "protein": recipe.protein,
        "carbs": recipe.carbs,
        "fat": recipe.fat,
        "fiber": recipe.fiber,
        "ingredients": recipe.ingredients,
        "instructions": recipe.instructions,
        "nutrition": recipe.nutrition,
        "recipe_json": recipe.recipe_json,
        "ai_response": recipe.ai_response,
        "image_url": recipe.image_url,
        "favorite": recipe.favorite,
        "created_at": recipe.created_at.isoformat() if recipe.created_at else None,
        "updated_at": recipe.updated_at.isoformat() if recipe.updated_at else None,
    }


def _request_data():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return None

    return {key: value for key, value in data.items() if key in RECIPE_FIELDS}


@recipes_bp.route("", methods=["GET"])
def get_recipes():
    user_id = _resolve_user_id()

    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    recipes = RecipeService.get_all(user_id)

    return jsonify({"recipes": [_recipe_payload(recipe) for recipe in recipes]})


@recipes_bp.route("/favorites", methods=["GET"])
def get_favorite_recipes():
    user_id = _resolve_user_id()

    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    recipes = RecipeService.get_favorites(user_id)

    return jsonify({"recipes": [_recipe_payload(recipe) for recipe in recipes]})


@recipes_bp.route("/<int:recipe_id>", methods=["GET"])
def get_recipe(recipe_id):
    user_id = _resolve_user_id()

    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    recipe = RecipeService.get(recipe_id, user_id)

    if not recipe:
        return jsonify({"error": "Recipe not found"}), 404

    return jsonify({"recipe": _recipe_payload(recipe)})


@recipes_bp.route("", methods=["POST"])
def create_recipe():
    user_id = _resolve_user_id()

    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    data = _request_data()

    if data is None:
        return jsonify({"error": "Request body must be a JSON object"}), 400

    if not data.get("title"):
        return jsonify({"error": "Title is required"}), 400

    recipe = RecipeService.create(user_id, data)

    return jsonify({"recipe": _recipe_payload(recipe)}), 201


@recipes_bp.route("/<int:recipe_id>", methods=["PATCH"])
def update_recipe(recipe_id):
    user_id = _resolve_user_id()

    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    data = _request_data()

    if data is None:
        return jsonify({"error": "Request body must be a JSON object"}), 400

    if "title" in data and not data["title"]:
        return jsonify({"error": "Title cannot be empty"}), 400

    recipe = RecipeService.update(recipe_id, user_id, data)

    if not recipe:
        return jsonify({"error": "Recipe not found"}), 404

    return jsonify({"recipe": _recipe_payload(recipe)})


@recipes_bp.route("/<int:recipe_id>", methods=["DELETE"])
def delete_recipe(recipe_id):
    user_id = _resolve_user_id()

    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    recipe = RecipeService.delete(recipe_id, user_id)

    if not recipe:
        return jsonify({"error": "Recipe not found"}), 404

    return jsonify({"message": "Recipe deleted"})


@recipes_bp.route("/<int:recipe_id>/favorite", methods=["PATCH"])
def toggle_recipe_favorite(recipe_id):
    user_id = _resolve_user_id()

    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    recipe = RecipeService.toggle_favorite(recipe_id, user_id)

    if not recipe:
        return jsonify({"error": "Recipe not found"}), 404

    return jsonify({"recipe": _recipe_payload(recipe)})
