from flask import Blueprint, jsonify, request

from services import AIService

ai_bp = Blueprint(
    "ai",
    __name__
)


@ai_bp.route("/generate", methods=["POST"])
def generate():

    data = request.get_json()

    prompt = data.get("prompt")

    response = AIService.generate(
        prompt
    )

    return jsonify({
        "response": response
    })