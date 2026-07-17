from datetime import date

from flask import Blueprint, jsonify, request

from routes.profile import _resolve_user_id
from services import ProgressService


progress_bp = Blueprint("progress", __name__)


PROGRESS_FIELDS = {
    "log_date",
    "weight",
    "calories",
    "protein",
    "carbs",
    "fat",
    "water_ml",
    "steps",
    "sleep_hours",
    "workout_completed",
    "mood",
    "notes",
}


def _progress_payload(log):
    return {
        "id": log.id,
        "user_id": log.user_id,
        "log_date": log.log_date.isoformat() if log.log_date else None,
        "weight": log.weight,
        "calories": log.calories,
        "protein": log.protein,
        "carbs": log.carbs,
        "fat": log.fat,
        "water_ml": log.water_ml,
        "steps": log.steps,
        "sleep_hours": log.sleep_hours,
        "workout_completed": log.workout_completed,
        "mood": log.mood,
        "notes": log.notes,
        "created_at": log.created_at.isoformat() if log.created_at else None,
    }


def _request_data():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return None, "Request body must be a JSON object"

    data = {key: value for key, value in data.items() if key in PROGRESS_FIELDS}

    if "log_date" in data:
        try:
            data["log_date"] = date.fromisoformat(data["log_date"])
        except (TypeError, ValueError):
            return None, "log_date must use YYYY-MM-DD format"

    return data, None


@progress_bp.route("", methods=["GET"])
def get_progress_logs():
    user_id = _resolve_user_id()

    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    logs = ProgressService.get_all(user_id)

    return jsonify({"progress": [_progress_payload(log) for log in logs]})


@progress_bp.route("/latest", methods=["GET"])
def get_latest_progress_log():
    user_id = _resolve_user_id()

    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    log = ProgressService.get_latest(user_id)

    if not log:
        return jsonify({"error": "Progress log not found"}), 404

    return jsonify({"progress": _progress_payload(log)})


@progress_bp.route("", methods=["POST"])
def create_progress_log():
    user_id = _resolve_user_id()

    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    data, error = _request_data()

    if error:
        return jsonify({"error": error}), 400

    if not data.get("log_date"):
        return jsonify({"error": "log_date is required"}), 400

    log = ProgressService.add(user_id, data)

    return jsonify({"progress": _progress_payload(log)}), 201


@progress_bp.route("/<int:progress_id>", methods=["PATCH"])
def update_progress_log(progress_id):
    user_id = _resolve_user_id()

    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    data, error = _request_data()

    if error:
        return jsonify({"error": error}), 400

    log = ProgressService.update(progress_id, user_id, data)

    if not log:
        return jsonify({"error": "Progress log not found"}), 404

    return jsonify({"progress": _progress_payload(log)})


@progress_bp.route("/<int:progress_id>", methods=["DELETE"])
def delete_progress_log(progress_id):
    user_id = _resolve_user_id()

    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    log = ProgressService.delete(progress_id, user_id)

    if not log:
        return jsonify({"error": "Progress log not found"}), 404

    return jsonify({"message": "Progress log deleted"})
