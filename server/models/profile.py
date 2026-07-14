from datetime import datetime
from database import db


class UserProfile(db.Model):
    __tablename__ = "user_profiles"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), unique=True, nullable=False)

    age = db.Column(db.Integer)
    gender = db.Column(db.String(20))
    height = db.Column(db.Float)
    weight = db.Column(db.Float)
    religion = db.Column(db.String(50))
    country = db.Column(db.String(100))
    city = db.Column(db.String(100))

    # Location
    lat = db.Column(db.Float)
    lon = db.Column(db.Float)

    # Cached weather
    temperature = db.Column(db.Float)
    humidity = db.Column(db.Integer)
    climate = db.Column(db.String(30))
    weather_updated_at = db.Column(db.DateTime)

    # Fitness
    goal = db.Column(db.String(50))
    activity_level = db.Column(db.String(50))
    dietary_preferences = db.Column(db.JSON)
    allergies = db.Column(db.JSON)
    medical_conditions = db.Column(db.JSON)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = db.relationship("User", back_populates="profile")