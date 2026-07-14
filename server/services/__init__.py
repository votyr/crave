from .ai_service import AIService
from .nutrition_service import NutritionService
from .fitness_service import FitnessService
from .weather_service import WeatherService
from .location_service import LocationService
from .food_service import FoodService
from .profile_service import ProfileService
from .progress_service import ProgressService
# Note: recommendation_service is optional; keep server bootable even if the file is empty/incomplete.
try:
    from .recommendation_service import RecommendationService
except Exception:  # pragma: no cover
    RecommendationService = None

__all__ = [
    "AIService",
    "NutritionService",
    "FitnessService",
    "WeatherService",
    "LocationService",
    "FoodService",
    "ProfileService",
    "ProgressService",
    "RecommendationService",
]
