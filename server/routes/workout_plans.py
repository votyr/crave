from flask import Blueprint, jsonify, request

from routes.profile import _resolve_user_id
from services import WorkoutPlanService


workout_plans_bp = Blueprint("workout_plans", __name__)


WORKOUT_PLAN_FIELDS = {
    "title",
    "description",
    "plan_json",
    "workout_json",
    "ai_response",
    "duration_weeks",
    "difficulty",
    "estimated_minutes",
    "active",
}


def _workout_plan_payload(plan):
    return {
        "id": plan.id,
        "user_id": plan.user_id,
        "title": plan.title,
        "description": plan.description,
        "plan_json": plan.plan_json,
        "workout_json": plan.workout_json,
        "ai_response": plan.ai_response,
        "duration_weeks": plan.duration_weeks,
        "difficulty": plan.difficulty,
        "estimated_minutes": plan.estimated_minutes,
        "active": plan.active,
        "created_at": plan.created_at.isoformat() if plan.created_at else None,
        "updated_at": plan.updated_at.isoformat() if plan.updated_at else None,
    }


def _request_data():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return None

    return {key: value for key, value in data.items() if key in WORKOUT_PLAN_FIELDS}


@workout_plans_bp.route("", methods=["GET"])
def get_workout_plans():
    user_id = _resolve_user_id()

    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    plans = WorkoutPlanService.get_all(user_id)

    return jsonify({"workouts": [_workout_plan_payload(plan) for plan in plans]})


@workout_plans_bp.route("/latest", methods=["GET"])
def get_latest_workout_plan():
    user_id = _resolve_user_id()

    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    plan = WorkoutPlanService.get_latest(user_id)

    if not plan:
        return jsonify({"error": "Workout plan not found"}), 404

    return jsonify({"workout": _workout_plan_payload(plan)})


@workout_plans_bp.route("", methods=["POST"])
def create_workout_plan():
    user_id = _resolve_user_id()

    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    data = _request_data()

    if data is None:
        return jsonify({"error": "Request body must be a JSON object"}), 400

    if not data.get("title"):
        return jsonify({"error": "Title is required"}), 400

    if not data.get("workout_json") and not data.get("plan_json"):
        return jsonify({"error": "workout_json is required"}), 400

    plan = WorkoutPlanService.create(user_id, data)

    return jsonify({"workout": _workout_plan_payload(plan)}), 201


@workout_plans_bp.route("/<int:plan_id>", methods=["PATCH"])
def update_workout_plan(plan_id):
    user_id = _resolve_user_id()

    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    data = _request_data()

    if data is None:
        return jsonify({"error": "Request body must be a JSON object"}), 400

    if "title" in data and not data["title"]:
        return jsonify({"error": "Title cannot be empty"}), 400

    plan = WorkoutPlanService.update(plan_id, user_id, data)

    if not plan:
        return jsonify({"error": "Workout plan not found"}), 404

    return jsonify({"workout": _workout_plan_payload(plan)})


@workout_plans_bp.route("/<int:plan_id>", methods=["DELETE"])
def delete_workout_plan(plan_id):
    user_id = _resolve_user_id()

    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    plan = WorkoutPlanService.delete(plan_id, user_id)

    if not plan:
        return jsonify({"error": "Workout plan not found"}), 404

    return jsonify({"message": "Workout plan deleted"})
