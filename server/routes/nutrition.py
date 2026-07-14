from flask import Blueprint, jsonify, session

from services import (
    NutritionService,
    WeatherService,
    ProfileService
)

nutrition_bp = Blueprint(
    "nutrition",
    __name__
)


@nutrition_bp.route("/generate")
def generate():

    if "user_id" not in session:
        return jsonify({
            "error": "Unauthorized"
        }), 401

    profile = ProfileService.get(
        session["user_id"]
    )

    weather = WeatherService.current(
        profile.city,
        profile.country
    )

    plan = NutritionService.generate(
        profile,
        weather
    )

    return jsonify({
        "meal_plan": plan
    })