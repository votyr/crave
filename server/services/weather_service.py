import requests

class WeatherService:

    @staticmethod
    def current(lat, lon):
        response = requests.get(
            "https://api.open-meteo.com/v1/forecast",
            params={
                "latitude": lat,
                "longitude": lon,
                "current": "temperature_2m,relative_humidity_2m",
            },
            timeout=10,
        )

        current = response.json()["current"]

        temp = current["temperature_2m"]
        humidity = current["relative_humidity_2m"]

        # Feels-like climate classification
        if temp >= 34:
            climate = "very hot"

        elif temp >= 30:
            if humidity >= 70:
                climate = "hot & humid"
            else:
                climate = "hot"

        elif temp >= 24:
            if humidity >= 80:
                climate = "humid"
            else:
                climate = "warm"

        elif temp >= 18:
            if humidity >= 75:
                climate = "cool & humid"
            else:
                climate = "mild"

        elif temp >= 10:
            climate = "cool"

        else:
            climate = "cold"

        return {
            "temperature": temp,
            "humidity": humidity,
            "climate": climate,
        }