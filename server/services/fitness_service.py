from services.ai_service import AIService


class FitnessService:

    @staticmethod
    def generate(profile):

        prompt = f"""
        Create a weekly workout.

        Goal:
        {profile.goal}

        Weight:
        {profile.weight}

        Activity:
        {profile.activity_level}
        """

        return AIService.generate(prompt)