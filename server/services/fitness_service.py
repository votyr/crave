from services.ai_service import AIService


class FitnessService:

    @staticmethod
    def generate(profile, excluded_exercises=None):
        excluded_exercises = excluded_exercises or []

        fallback = {
            "summary": "A balanced weekly routine tailored to your goal.",
            "exercises": {
                "Warm-up": [{"label": "Mobility flow", "short": "hips, shoulders, spine", "detail": "Dynamic mobility to raise body temperature.", "tag": "5 min"}],
                "Strength": [{"label": "Bodyweight circuit", "short": "squats, push-ups, lunges", "detail": "Full-body strength circuit.", "tag": "3x12"}],
                "Cardio": [{"label": "Brisk walk", "short": "outdoors or treadmill", "detail": "Steady-state cardio.", "tag": "20 min"}],
                "Recovery": [{"label": "Static stretch", "short": "full body hold series", "detail": "Cool-down stretching.", "tag": "10 min"}],
            },
        }

        prompt = f"""
You are a fitness coach. Create a workout session plan as JSON matching this EXACT schema:

{{
  "summary": "one sentence overview",
  "exercises": {{
    "Warm-up": [
      {{"label": "exercise name", "short": "3-5 word cue, e.g. 'hips, shoulders, spine'", "detail": "1-2 sentence description of how to perform it", "tag": "duration or reps, e.g. '5 min' or '3x12'"}},
      ...2-3 items
    ],
    "Strength": [...2-3 items],
    "Cardio": [...2-3 items],
    "Recovery": [...2-3 items]
  }}
}}

Rules:
- Return ONLY valid JSON, no markdown fences.
- "short" must be a brief cue, NEVER a full sentence — max 6 words.
- "detail" can be fuller, used only in a preview, not on cards.
- Respect activity level — do not exceed the user's stated capacity.
- Avoid these exercises entirely if listed: {excluded_exercises}
- Do not include anything requiring equipment unless implied by activity_level.

User profile:
- goal: {getattr(profile, 'goal', None)}
- weight: {getattr(profile, 'weight', None)}
- activity_level: {getattr(profile, 'activity_level', None)}
- age: {getattr(profile, 'age', None)}
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