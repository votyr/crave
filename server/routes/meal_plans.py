from flask import Blueprint, jsonify, request

from routes.profile import _resolve_user_id
from services import MealPlanService


meal_plans_bp = Blueprint("meal_plans", __name__)


MEAL_PLAN_FIELDS = {
    "title",
    "description",
    "plan_json",
    "meal_json",
    "ai_response",
    "calories",
    "protein",
    "carbs",
    "fat",
    "duration_days",
    "active",
}


def _meal_plan_payload(plan):
    return {
        "id": plan.id,
        "user_id": plan.user_id,
        "title": plan.title,
        "description": plan.description,
        "plan_json": plan.plan_json,
        "meal_json": plan.meal_json,
        "ai_response": plan.ai_response,
        "calories": plan.calories,
        "protein": plan.protein,
        "carbs": plan.carbs,
        "fat": plan.fat,
        "duration_days": plan.duration_days,
        "active": plan.active,
        "created_at": plan.created_at.isoformat() if plan.created_at else None,
        "updated_at": plan.updated_at.isoformat() if plan.updated_at else None,
    }


def _request_data():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return None

    return {key: value for key, value in data.items() if key in MEAL_PLAN_FIELDS}


@meal_plans_bp.route("", methods=["GET"])
def get_meal_plans():
    user_id = _resolve_user_id()

    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    plans = MealPlanService.get_all(user_id)

    return jsonify({"meals": [_meal_plan_payload(plan) for plan in plans]})


@meal_plans_bp.route("/latest", methods=["GET"])
def get_latest_meal_plan():
    user_id = _resolve_user_id()

    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    plan = MealPlanService.get_latest(user_id)

    if not plan:
        return jsonify({"error": "Meal plan not found"}), 404

    return jsonify({"meal": _meal_plan_payload(plan)})


@meal_plans_bp.route("", methods=["POST"])
def create_meal_plan():
    user_id = _resolve_user_id()

    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    data = _request_data()

    if data is None:
        return jsonify({"error": "Request body must be a JSON object"}), 400

    if not data.get("title"):
        return jsonify({"error": "Title is required"}), 400

    if not data.get("meal_json") and not data.get("plan_json"):
        return jsonify({"error": "meal_json is required"}), 400

    plan = MealPlanService.create(user_id, data)

    return jsonify({"meal": _meal_plan_payload(plan)}), 201


@meal_plans_bp.route("/<int:plan_id>", methods=["PATCH"])
def update_meal_plan(plan_id):
    user_id = _resolve_user_id()

    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    data = _request_data()

    if data is None:
        return jsonify({"error": "Request body must be a JSON object"}), 400

    if "title" in data and not data["title"]:
        return jsonify({"error": "Title cannot be empty"}), 400

    plan = MealPlanService.update(plan_id, user_id, data)

    if not plan:
        return jsonify({"error": "Meal plan not found"}), 404

    return jsonify({"meal": _meal_plan_payload(plan)})


@meal_plans_bp.route("/<int:plan_id>", methods=["DELETE"])
def delete_meal_plan(plan_id):
    user_id = _resolve_user_id()

    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    plan = MealPlanService.delete(plan_id, user_id)

    if not plan:
        return jsonify({"error": "Meal plan not found"}), 404

    return jsonify({"message": "Meal plan deleted"})
