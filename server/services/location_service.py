class LocationService:

    @staticmethod
    def normalize(city, country):

        return {
            "city": city.title(),
            "country": country.title()
        }