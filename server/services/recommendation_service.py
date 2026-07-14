import json
import traceback

from services.ai_service import AIService


class RecommendationService:
    """Health AI recommendations generator.

    Safe to import/boot even when AI credentials are missing.
    Falls back to deterministic recommendations when AI is unavailable.
    """

    @staticmethod
    def generate_meal_plan(profile, context=None):
        context = context or {}

        fallback = {
            "summary": "A balanced plan tailored to your preferences.",
            "meals": {
                "Breakfast": [{"label": "Greek yogurt bowl", "value": "oats, berries, chia", "tag": "380 kcal"}],
                "Lunch": [{"label": "Quinoa power bowl", "value": "roasted veg + legumes", "tag": "520 kcal"}],
                "Dinner": [{"label": "Grilled fish / tofu", "value": "greens, warm grain", "tag": "610 kcal"}],
                "Hydration": [{"label": "Morning", "value": "500 ml water", "tag": "0 kcal"}],
            },
        }

        prompt = f"""
You are a nutrition planner. Create a one-day meal plan as JSON matching this EXACT schema:

{{
"summary": "one sentence overview",
"meals": {{
    "Breakfast": [{{"label": "dish name", "value": "short ingredient description", "tag": "XXX kcal"}}, ...2-3 items],
    "Lunch": [...2-3 items],
    "Dinner": [...2-3 items],
    "Hydration": [...2-3 items]
}}
}}

Rules:
- Return ONLY valid JSON, no markdown fences.
- Each meal category needs 2-3 concrete dish options, not tips.
- Respect dietary_preferences and allergies strictly — never include excluded ingredients.
- Keep tag as an approximate calorie count string like "420 kcal".

User profile:
- goal: {getattr(profile, 'goal', None)}
- religion: {getattr(profile, 'religion', None)}
- dietary_preferences: {getattr(profile, 'dietary_preferences', None)}
- allergies: {getattr(profile, 'allergies', None)}
- climate: {getattr(profile, 'climate', None)}

Optional context (may include excluded ingredients from chat): {context}
"""

        try:
            raw = AIService.generate(prompt)
            raw = raw.strip().removeprefix("```json").removesuffix("```").strip()
            return json.loads(raw)
        except Exception:
            traceback.print_exc()
            return fallback

    @staticmethod
    def _recipe_fallback(dish=None):
        return {
            "dish": dish or "Chef's Choice",
            "ingredients": ["Ingredients unavailable right now."],
            "steps": ["Recipe generation failed. Try again shortly."],
        }

    @staticmethod
    def _run_recipe_prompt(prompt, dish=None):
        try:
            raw = AIService.generate(prompt)
            raw = raw.strip().removeprefix("```json").removesuffix("```").strip()
            return json.loads(raw)
        except Exception:
            traceback.print_exc()
            return RecommendationService._recipe_fallback(dish)

    @staticmethod
    def _profile_block(profile):
        return f"""
- dietary_preferences: {getattr(profile, 'dietary_preferences', None)}
- allergies: {getattr(profile, 'allergies', None)}
- religion: {getattr(profile, 'religion', None)}
- goal: {getattr(profile, 'goal', None)}
"""

    @staticmethod
    def generate_recipe(profile, mode, dish=None, ingredients=None, missing_ingredients=None, context=None):
        """
        Dispatches to a mode-specific prompt. All modes return the same JSON shape:
        {
          "dish": str, "servings": str, "prep_time": str,
          "ingredients": [str, ...], "steps": [str, ...],
          "pairing": str (optional), "image": str (optional)
        }
        """
        missing_ingredients = missing_ingredients or []
        ingredients = ingredients or []
        context = context or {}

        schema = """
Return ONLY valid JSON matching:
{
    "dish": "name of the dish",
    "servings": "e.g. 2",
    "prep_time": "e.g. 15 min",
    "ingredients": ["ingredient with quantity", ...],
    "steps": ["step 1", "step 2", ...],
    "pairing": "short serving suggestion"
}
No markdown fences, no commentary outside the JSON.
"""

        missing_note = (
            f'- The user does NOT have these ingredients available: {missing_ingredients}. '
            f"Suggest common substitutes for each in the ingredients list."
            if missing_ingredients else ""
        )

        if mode == "search":
            prompt = f"""
You are a cooking assistant. Give a simple home recipe for: "{dish}"
{schema}
Rules:
{RecommendationService._profile_block(profile)}
{missing_note}
"""
            return RecommendationService._run_recipe_prompt(prompt, dish)

        if mode == "ingredients":
            prompt = f"""
You are a cooking assistant. The user has these ingredients available: {ingredients}.
Invent a simple, realistic home dish using mostly these plus common pantry staples
(oil, salt, pepper, basic spices). Pick a sensible dish name yourself.
{schema}
Rules:
{RecommendationService._profile_block(profile)}
{missing_note}
"""
            return RecommendationService._run_recipe_prompt(prompt)

        if mode == "surprise":
            prompt = f"""
You are a cooking assistant. Surprise the user with an interesting, slightly unusual
dish they've probably never made before. Pick any cuisine.
{schema}
Rules:
{RecommendationService._profile_block(profile)}
"""
            return RecommendationService._run_recipe_prompt(prompt)

        if mode == "healthy":
            prompt = f"""
You are a nutrition-aware cooking assistant. Suggest a healthy dish tailored to this
user's goal and profile below (e.g. weight loss, muscle gain, maintenance).
{schema}
Rules:
{RecommendationService._profile_block(profile)}
"""
            return RecommendationService._run_recipe_prompt(prompt)

        if mode == "seasonal":
            location = context.get("location") or getattr(profile, "climate", None)
            month = context.get("month")
            prompt = f"""
You are a cooking assistant. Suggest a dish using produce that is currently in season
for this location/climate: {location}. Current month: {month}.
{schema}
Rules:
{RecommendationService._profile_block(profile)}
"""
            return RecommendationService._run_recipe_prompt(prompt)

        if mode == "faith":
            prompt = f"""
You are a cooking assistant. Suggest a dish that strictly respects the user's religious
dietary rules (e.g. halal, kosher, jain, hindu-vegetarian) based on their profile below.
Do not include any excluded ingredient under any circumstance.
{schema}
Rules:
{RecommendationService._profile_block(profile)}
"""
            return RecommendationService._run_recipe_prompt(prompt)

        # Unknown mode fallback
        return RecommendationService._recipe_fallback(dish)