from datetime import datetime
from database import db


class WorkoutPlan(db.Model):

    __tablename__ = "workout_plans"

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    title = db.Column(
        db.String(150),
        nullable=False
    )

    description = db.Column(db.Text)

    plan_json = db.Column(db.JSON)

    workout_json = db.Column(db.JSON)

    ai_response = db.Column(db.Text)

    duration_weeks = db.Column(db.Integer)

    difficulty = db.Column(db.String(30))

    estimated_minutes = db.Column(db.Integer)

    active = db.Column(
        db.Boolean,
        default=False
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

    user = db.relationship(
        "User",
        back_populates="workout_plans"
    )
