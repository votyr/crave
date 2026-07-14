from flask import Blueprint, jsonify, session

from services import (
    FitnessService,
    ProfileService
)

fitness_bp = Blueprint(
    "fitness",
    __name__
)


@fitness_bp.route("/generate")
def generate():

    if "user_id" not in session:
        return jsonify({
            "error": "Unauthorized"
        }), 401

    profile = ProfileService.get(
        session["user_id"]
    )

    plan = FitnessService.generate(
        profile
    )

    return jsonify({
        "workout_plan": plan
    })