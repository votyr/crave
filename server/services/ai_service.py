from openai import OpenAI
import os

# Initialize lazily so the server can start without OpenAI/Github credentials.
client = None


def _client():
    global client
    if client is None:
        client = OpenAI(
            base_url="https://models.github.ai/inference",
            api_key=os.getenv("GITHUB_TOKEN"),
        )
    return client


class AIService:

    @staticmethod
    def generate(prompt):

        response = _client().chat.completions.create(
            model="openai/gpt-4.1",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert nutritionist and fitness coach."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        return response.choices[0].message.content