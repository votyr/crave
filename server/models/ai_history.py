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

    model_used = db.Column(db.String(100))

    prompt_version = db.Column(db.String(20))
    
    metadata_json = db.Column(db.JSON)

    prompt = db.Column(db.Text)

    response = db.Column(db.Text)

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    user = db.relationship(
        "User",
        back_populates="ai_history"
    )