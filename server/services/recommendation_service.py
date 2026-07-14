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
            import json
            raw = AIService.generate(prompt)
            raw = raw.strip().removeprefix("```json").removesuffix("```").strip()
            return json.loads(raw)
        except Exception:
            import traceback
            traceback.print_exc()
            return fallback

    @staticmethod
    def generate(profile, context=None):
        context = context or {}

        fallback = {
            "summary": "Tailored guidance based on your goal and preferences.",
            "recommendations": [
                f"Stay consistent with a {getattr(profile, 'goal', 'steady')} focus.",
                "Prioritize protein at each meal and include fiber-rich foods.",
                "Hydrate daily and aim for steady activity in your routine.",
                "If you have allergies, avoid trigger ingredients and read labels.",
            ],
        }

        prompt = f"""
You are a health coach.
Create actionable recommendations (3-6 bullets) based on the user's health profile.

Rules:
- Return ONLY valid JSON.
- Keep recommendations practical and specific.
- Do not include medical claims.

User profile:
- age: {getattr(profile, 'age', None)}
- gender: {getattr(profile, 'gender', None)}
- height: {getattr(profile, 'height', None)}
- weight: {getattr(profile, 'weight', None)}
- religion: {getattr(profile, 'religion', None)}
- goal: {getattr(profile, 'goal', None)}
- activity_level: {getattr(profile, 'activity_level', None)}
- dietary_preferences: {getattr(profile, 'dietary_preferences', None)}
- allergies: {getattr(profile, 'allergies', None)}

Optional context:
{context}

Return JSON schema:
{{
  "summary": "string",
  "recommendations": ["string", ...]
}}
"""

        try:
            import json

            raw = AIService.generate(prompt)
            return json.loads(raw)
        except Exception:
            import traceback
            traceback.print_exc() 
            return fallback

