class FoodService:

    @staticmethod
    def restrictions(profile):

        restrictions = []

        if profile.religion == "Islam":
            restrictions.append("Halal")

        if profile.religion == "Hinduism":
            restrictions.append("Avoid beef")

        if profile.allergies:
            restrictions.extend(profile.allergies)

        return restrictions