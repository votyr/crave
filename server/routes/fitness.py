from flask import Blueprint
from services import FitnessService, ProfileService
from auth_tokens import verify_token

fitness_bp = Blueprint("fitness", __name__)