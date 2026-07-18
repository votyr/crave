import os

import requests


DEFAULT_RECIPE_IMAGE_URL = (
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
    "?auto=format&fit=crop&w=800&q=80"
)


class UnsplashService:

    @staticmethod
    def _search_once(access_key: str, query: str):
        try:
            response = requests.get(
                "https://api.unsplash.com/search/photos",
                headers={"Authorization": f"Client-ID {access_key}"},
                params={"query": query, "per_page": 1, "orientation": "landscape"},
                timeout=5,
            )
            response.raise_for_status()
            results = response.json().get("results", [])
            if results:
                return results[0].get("urls", {}).get("regular")
        except (requests.RequestException, ValueError, KeyError, TypeError):
            pass
        return None

    @staticmethod
    def get_recipe_image(search_term: str, fallback_term: str = None) -> str:
        access_key = os.getenv("UNSPLASH_ACCESS_KEY")
        if not access_key:
            return DEFAULT_RECIPE_IMAGE_URL

        for term in filter(None, [search_term, fallback_term]):
            url = UnsplashService._search_once(access_key, term)
            if url:
                return url

        return DEFAULT_RECIPE_IMAGE_URL