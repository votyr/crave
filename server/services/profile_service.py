from models import UserProfile
from database import db

class ProfileService:

    @staticmethod
    def get(user_id):
        return UserProfile.query.filter_by(user_id=user_id).first()

    @staticmethod
    def update(user_id, data):

        profile = UserProfile.query.filter_by(user_id=user_id).first()

        if not profile:
            return None

        for key, value in data.items():
            if hasattr(profile, key):
                setattr(profile, key, value)

        db.session.commit()

        return profile