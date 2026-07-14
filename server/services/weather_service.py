import requests


class WeatherService:

    @staticmethod
    def current(lat, lon):
        url = "https://api.open-meteo.com/v1/forecast"

        response = requests.get(
            url,
            params={
                "latitude": lat,
                "longitude": lon,
                "current": "temperature_2m,relative_humidity_2m",
            },
            timeout=10,
        )

        data = response.json()["current"]

        temp = data["temperature_2m"]

        # Simple climate classification
        if temp >= 30:
            climate = "hot"
        elif temp >= 20:
            climate = "warm"
        elif temp >= 10:
            climate = "cool"
        else:
            climate = "cold"

        return {
            "temperature": temp,
            "humidity": data["relative_humidity_2m"],
            "climate": climate,
        }