from services.ai_service import AIService


class RecommendationService:
    """Health AI recommendations generator.

    Safe to import/boot even when AI credentials are missing.
    Falls back to deterministic recommendations when AI is unavailable.
    """

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
            return fallback

