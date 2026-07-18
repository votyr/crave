import json
import traceback

from services.ai_service import AIService


class FitnessService:

    @staticmethod
    def generate(profile, excluded_exercises=None):
        excluded_exercises = excluded_exercises or []

        fallback = {
            "summary": "A balanced weekly routine tailored to your goal.",
            "exercises": {
                "Warm-up": [{
                    "title": "Mobility Flow",
                    "description": "Dynamic hip, shoulder, and spine movements to raise body temperature safely.",
                    "sets_reps": "5 min",
                }],
                "Strength": [{
                    "title": "Bodyweight Circuit",
                    "description": "A full-body circuit using squats, push-ups, and lunges.",
                    "sets_reps": "3x12",
                }],
                "Cardio": [{
                    "title": "Brisk Walk",
                    "description": "Steady-state cardio at a conversational pace outdoors or on a treadmill.",
                    "sets_reps": "20 min",
                }],
                "Recovery": [{
                    "title": "Static Stretch",
                    "description": "A gentle full-body hold series to cool down after training.",
                    "sets_reps": "10 min",
                }],
            },
        }

        prompt = f"""
You are a fitness coach. Create a workout session plan as JSON matching this EXACT schema:

{{
  "summary": "one sentence overview",
  "exercises": {{
    "Warm-up": [
      {{
        "title": "short exercise name only, for example Bodyweight Squat",
        "description": "a full 1-2 sentence coaching explanation",
        "sets_reps": "duration or reps, for example 5 min or 3x12"
      }},
      ...2-3 items
    ],
    "Strength": [...2-3 items],
    "Cardio": [...2-3 items],
    "Recovery": [...2-3 items]
  }}
}}

Rules:
- Return ONLY valid JSON, no markdown fences.
- title MUST be only the exercise name. Never include coaching advice, benefits, duration, reps, or a descriptive sentence in title.
- description must contain the full coaching explanation. It is shown in the AI preview, not on workout cards.
- sets_reps must contain the duration or repetitions, such as "5 min" or "3x12".
- Respect activity level; do not exceed the user's stated capacity.
- Avoid these exercises entirely if listed: {excluded_exercises}
- Do not include anything requiring equipment unless implied by activity_level.

User profile:
- goal: {getattr(profile, 'goal', None)}
- weight: {getattr(profile, 'weight', None)}
- activity_level: {getattr(profile, 'activity_level', None)}
- age: {getattr(profile, 'age', None)}
"""

        try:
            raw = AIService.generate(prompt)
            raw = raw.strip().removeprefix("```json").removesuffix("```").strip()
            return FitnessService._normalize_workout_plan(json.loads(raw))
        except Exception:
            traceback.print_exc()
            return FitnessService._normalize_workout_plan(fallback)

    @staticmethod
    def _normalize_workout_plan(result):
        """Keep legacy workout fields while guaranteeing the structured exercise schema."""
        if not isinstance(result, dict) or not isinstance(result.get("exercises"), dict):
            return result

        for category, items in result["exercises"].items():
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
                sets_reps = item.get("sets_reps") or item.get("tag")
                short = item.get("short") or sets_reps or ""

                normalized_items.append({
                    **item,
                    "title": title,
                    "description": description,
                    "sets_reps": sets_reps,
                    # Preserve the original UI/API fields for older clients.
                    "label": item.get("label") or title,
                    "short": short,
                    "value": item.get("value") or short,
                    "detail": item.get("detail") or description,
                    "tag": item.get("tag") or sets_reps,
                })

            result["exercises"][category] = normalized_items

        return result
