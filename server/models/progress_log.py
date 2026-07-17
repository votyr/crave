from datetime import datetime
from database import db


class ProgressLog(db.Model):

    __tablename__ = "progress_logs"

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    log_date = db.Column(
        db.Date,
        nullable=False
    )

    weight = db.Column(db.Float)

    calories = db.Column(db.Integer)

    protein = db.Column(db.Integer)

    carbs = db.Column(db.Integer)

    fat = db.Column(db.Integer)

    water_ml = db.Column(db.Integer)

    steps = db.Column(db.Integer)

    sleep_hours = db.Column(db.Float)

    workout_completed = db.Column(
        db.Boolean,
        default=False
    )

    mood = db.Column(db.String(30))

    notes = db.Column(db.Text)

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    user = db.relationship(
        "User",
        back_populates="progress_logs"
    )