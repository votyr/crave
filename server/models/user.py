from datetime import datetime
from database import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    username = db.Column(
        db.String(50),
        unique=True,
        nullable=False
    )

    email = db.Column(
        db.String(255),
        unique=True,
        nullable=False
    )

    password_hash = db.Column(
        db.Text,
        nullable=False
    )

    full_name = db.Column(
        db.String(100)
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    profile = db.relationship(
        "UserProfile",
        back_populates="user",
        uselist=False,
        cascade="all, delete"
    )

    meal_plans = db.relationship(
        "MealPlan",
        back_populates="user",
        cascade="all, delete"
    )

    workout_plans = db.relationship(
        "WorkoutPlan",
        back_populates="user",
        cascade="all, delete"
    )

    progress_logs = db.relationship(
        "ProgressLog",
        back_populates="user",
        cascade="all, delete"
    )

    ai_history = db.relationship(
        "AIHistory",
        back_populates="user",
        cascade="all, delete"
    )