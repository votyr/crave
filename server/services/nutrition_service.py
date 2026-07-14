from services.ai_service import AIService


class NutritionService:

    @staticmethod
    def generate(profile, weather):

        prompt = f"""
        Create a healthy meal plan.

        Age:
        {profile.age}

        Weight:
        {profile.weight}

        Height:
        {profile.height}

        Goal:
        {profile.goal}

        Religion:
        {profile.religion}

        Dietary preferences:
        {profile.dietary_preferences}

        Allergies:
        {profile.allergies}

        Weather:
        {weather}
        """

        return AIService.generate(prompt)