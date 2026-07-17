from datetime import datetime
from database import db


class AIHistory(db.Model):
    __tablename__ = "ai_history"

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    # nutrition | workout | recipe | chat
    type = db.Column(db.String(30), nullable=False)

    model_used = db.Column(db.String(100))

    prompt_version = db.Column(db.String(20))

    prompt = db.Column(db.Text, nullable=False)

    response_text = db.Column(db.Text)

    response_json = db.Column(db.JSON)

    metadata_json = db.Column(db.JSON)

    is_saved = db.Column(
        db.Boolean,
        default=False
    )

    linked_plan_id = db.Column(db.Integer)

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    user = db.relationship(
        "User",
        back_populates="ai_history"
    )