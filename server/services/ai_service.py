import os

from google import genai

client = None


def _client():
    global client

    if client is None:
        client = genai.Client(
            api_key=os.getenv("GEMINI_API_KEY")
        )

    return client


class AIService:

    @staticmethod
    def generate(prompt):

        response = _client().models.generate_content(
            model="gemini-3.5-flash",
            contents=prompt,
        )

        return response.text