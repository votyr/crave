import json
import traceback

from services.ai_service import AIService
from services.unsplash_service import UnsplashService, DEFAULT_RECIPE_IMAGE_URL


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
                "Breakfast": [{
                    "title": "Greek Yogurt Bowl",
                    "description": "A creamy, balanced breakfast with protein and fiber.",
                    "ingredients": [
                        {"quantity": "1", "unit": "cup", "name": "Greek yogurt", "preparation": "", "notes": ""},
                        {"quantity": "1/4", "unit": "cup", "name": "Oats", "preparation": "", "notes": ""},
                        {"quantity": "1/2", "unit": "cup", "name": "Berries", "preparation": "", "notes": ""},
                        {"quantity": "1", "unit": "tbsp", "name": "Chia seeds", "preparation": "", "notes": ""},
                    ],
                    "calories": "380 kcal",
                }],
                "Lunch": [{
                    "title": "Quinoa Power Bowl",
                    "description": "A filling grain and vegetable bowl with plant-based protein.",
                    "ingredients": [
                        {"quantity": "1", "unit": "cup", "name": "Quinoa", "preparation": "cooked", "notes": ""},
                        {"quantity": "1", "unit": "cup", "name": "Mixed vegetables", "preparation": "roasted", "notes": ""},
                        {"quantity": "1/2", "unit": "cup", "name": "Chickpeas", "preparation": "cooked", "notes": ""},
                        {"quantity": "1", "unit": "tsp", "name": "Lemon juice", "preparation": "", "notes": ""},
                    ],
                    "calories": "520 kcal",
                }],
                "Dinner": [{
                    "title": "Grilled Fish or Tofu",
                    "description": "A light, protein-rich dinner with greens and whole grains.",
                    "ingredients": [
                        {"quantity": "150", "unit": "g", "name": "Fish or tofu", "preparation": "grilled", "notes": ""},
                        {"quantity": "2", "unit": "cups", "name": "Leafy greens", "preparation": "", "notes": ""},
                        {"quantity": "1/2", "unit": "cup", "name": "Whole grains", "preparation": "cooked", "notes": ""},
                        {"quantity": None, "unit": None, "name": "Fresh herbs", "preparation": "chopped", "notes": "for garnish"},
                    ],
                    "calories": "610 kcal",
                }],
                "Hydration": [{
                    "title": "Morning Hydration",
                    "description": "Start the day with a glass of water.",
                    "ingredients": [
                        {"quantity": "500", "unit": "ml", "name": "Water", "preparation": "", "notes": ""},
                    ],
                    "calories": "0 kcal",
                }],
            },
        }
        prompt = f"""
You are a nutrition planner. Create a one-day meal plan as JSON matching this EXACT schema:
{{
"summary": "one sentence overview",
"meals": {{
    "Breakfast": [{{
      "title": "short food name only, for example Moong Dal Chilla",
      "description": "a full 1-2 sentence meal explanation",
      "ingredients": [
        {{"quantity": "500", "unit": "g", "name": "Boneless Skinless Chicken Breast", "preparation": "cubed", "notes": ""}},
        {{"quantity": null, "unit": null, "name": "Salt", "preparation": "", "notes": "to taste"}}
      ],
      "calories": "XXX kcal"
    }}, ...2-3 items],
    "Lunch": [...2-3 items],
    "Dinner": [...2-3 items],
    "Hydration": [...2-3 items]
}}
}}
Rules:
- Return ONLY valid JSON, no markdown fences.
- Each meal category needs 2-3 concrete dish options, not tips.
- title MUST be only the dish or food name. Never include calories, weather, nutrition claims, or a descriptive sentence in title.
- description must contain the full explanatory text for the meal.
- ingredients must contain the complete ingredient list, ordered with the three primary ingredients first.
- Every ingredient MUST be an object with exactly these fields: quantity, unit, name, preparation, notes.
- quantity contains only the numeric value (for example "1/2"), unit contains only the measurement unit, and name contains only the ingredient name.
- preparation is optional and only contains preparation words such as chopped, diced, cubed, or minced.
- notes is optional and only contains phrases such as "to taste", "for garnish", "optional", or "divided".
- Never include quantity or unit in name. Use null for quantity and unit only when no measurable quantity exists; do not use "As needed" unless that is genuinely the only accurate amount.
- Respect dietary_preferences and allergies strictly — never include excluded ingredients.
- calories must be an approximate calorie string like "420 kcal".
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
            return RecommendationService._normalize_meal_plan(json.loads(raw))
        except Exception:
            traceback.print_exc()
            return fallback

    @staticmethod
    def _normalize_meal_plan(result):
        """Keep legacy meal fields while guaranteeing the structured meal schema."""
        if not isinstance(result, dict) or not isinstance(result.get("meals"), dict):
            return result
        for category, items in result["meals"].items():
            if not isinstance(items, list):
                continue
            normalized_items = []
            for item in items:
                if not isinstance(item, dict):
                    continue
                title = item.get("title") or item.get("label") or category
                description = (
                    item.get("description")
                    or item.get("detail")
                    or item.get("value")
                    or ""
                )
                ingredients = item.get("ingredients")
                if not isinstance(ingredients, list):
                    ingredients = [
                        ingredient.strip()
                        for ingredient in str(item.get("value") or "").split(",")
                        if ingredient.strip()
                    ]
                ingredients = [
                    RecommendationService._normalize_ingredient(ingredient)
                    for ingredient in ingredients
                ]
                calories = item.get("calories") or item.get("tag")
                normalized_items.append({
                    **item,
                    "title": title,
                    "description": description,
                    "ingredients": ingredients,
                    "calories": calories,
                    "label": item.get("label") or title,
                    "value": item.get("value") or description,
                    "tag": item.get("tag") or calories,
                })
            result["meals"][category] = normalized_items
        return result

    @staticmethod
    def _normalize_ingredient(ingredient):
        if isinstance(ingredient, dict):
            return {
                "quantity": ingredient.get("quantity"),
                "unit": ingredient.get("unit"),
                "name": ingredient.get("name") or ingredient.get("label") or "",
                "preparation": ingredient.get("preparation") or "",
                "notes": ingredient.get("notes") or "",
            }
        return {
            "quantity": None,
            "unit": None,
            "name": str(ingredient),
            "preparation": "",
            "notes": "",
        }

    @staticmethod
    def _recipe_fallback(dish=None):
        title = dish or "Chef's Choice"
        return {
            "title": title,
            "dish": title,
            "search_term": title,
            "description": "A simple recipe generated from your preferences.",
            "ingredients": [{
                "quantity": None,
                "unit": None,
                "name": "Ingredients unavailable right now.",
                "preparation": "",
                "notes": "",
                "image_search_fallback": "a generic English food category for photo search if the dish name has no results, e.g. 'lentil stir fry' or 'indian curry'",
            }],
            "steps": ["Recipe generation failed. Try again shortly."],
            # No trustworthy AI content to search on -> go straight to the placeholder,
            # skip the network round trip entirely.
            "image_url": DEFAULT_RECIPE_IMAGE_URL,
        }

    @staticmethod
    def _attach_image(recipe):
        search_term = recipe.get("title") or recipe.get("dish") or recipe.get("search_term")
        fallback_term = recipe.get("image_search_fallback")
        recipe["image_url"] = UnsplashService.get_recipe_image(search_term, fallback_term)
        return recipe

    @staticmethod
    def _run_recipe_prompt(prompt, dish=None):
        try:
            raw = AIService.generate(prompt)
            raw = raw.strip().removeprefix("```json").removesuffix("```").strip()
            recipe = RecommendationService._normalize_recipe(json.loads(raw))
            return RecommendationService._attach_image(recipe)
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
    def _normalize_recipe(recipe):
        if not isinstance(recipe, dict):
            return RecommendationService._recipe_fallback()
        title = recipe.get("title") or recipe.get("dish") or "Chef's Choice"
        recipe["title"] = title
        recipe["dish"] = recipe.get("dish") or title
        recipe["search_term"] = recipe.get("search_term") or title
        recipe["description"] = recipe.get("description") or recipe.get("pairing") or ""
        recipe["image_search_fallback"] = recipe.get("image_search_fallback") or recipe.get("cuisine") or "indian food"
        recipe["ingredients"] = [
            RecommendationService._normalize_ingredient(ingredient)
            for ingredient in recipe.get("ingredients", [])
        ]
        return recipe

    @staticmethod
    def generate_recipe(profile, mode, dish=None, ingredients=None, missing_ingredients=None, context=None):
        """
        Dispatches to a mode-specific prompt. All modes return the same JSON shape:
        {
          "dish": str, "title": str, "search_term": str, "description": str,
          "servings": str, "prep_time": str,
          "ingredients": [object, ...], "steps": [str, ...],
          "pairing": str (optional), "image_url": str
        }
        image_url is always populated via _attach_image / _recipe_fallback - no mode
        needs its own Unsplash call.
        """
        missing_ingredients = missing_ingredients or []
        ingredients = ingredients or []
        context = context or {}
        schema = """
Return ONLY valid JSON matching:
{
    "title": "short recipe name only, e.g. Chicken Tikka Masala",
    "search_term": "canonical dish name for a food photo search, e.g. Chicken Tikka Masala",
    "description": "a detailed 1-2 sentence recipe explanation",
    "dish": "name of the dish",
    "servings": "e.g. 2",
    "prep_time": "e.g. 15 min",
    "ingredients": [
        {
            "quantity": "500",
            "unit": "g",
            "name": "Boneless Skinless Chicken Breast",
            "preparation": "cubed",
            "notes": ""
        }
    ],
    "steps": ["step 1", "step 2", ...],
    "pairing": "short serving suggestion"
}
No markdown fences, no commentary outside the JSON.
title must only contain the recipe name. search_term must only contain the canonical dish name and must never include the description. description contains the detailed explanation for the AI response. Do not return an image URL.
For every ingredient return quantity, unit, name, preparation, and notes. quantity contains only the numeric value, unit contains only the measurement unit, and name contains only the ingredient name. preparation contains optional preparation instructions such as chopped, diced, cubed, or minced. notes contains optional phrases such as "to taste", "for garnish", or "optional". Never include quantity or unit inside name. Use null for quantity and unit when there is truly no measurable quantity; never use "As needed" unless that is genuinely accurate.
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