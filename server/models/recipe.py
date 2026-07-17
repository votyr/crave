from datetime import datetime
from database import db


class Recipe(db.Model):

    __tablename__ = "recipes"

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    title = db.Column(
        db.String(200),
        nullable=False
    )

    description = db.Column(db.Text)

    cuisine = db.Column(db.String(100))

    meal_type = db.Column(db.String(50))
    # Breakfast, Lunch, Dinner, Snack, Dessert

    diet_type = db.Column(db.String(50))
    # Vegetarian, Vegan, Keto, High Protein, etc.

    prep_time = db.Column(db.Integer)
    cook_time = db.Column(db.Integer)
    servings = db.Column(db.Integer)

    calories = db.Column(db.Integer)
    protein = db.Column(db.Float)
    carbs = db.Column(db.Float)
    fat = db.Column(db.Float)
    fiber = db.Column(db.Float)

    ingredients = db.Column(db.JSON)

    instructions = db.Column(db.JSON)

    nutrition = db.Column(db.JSON)

    recipe_json = db.Column(db.JSON)

    ai_response = db.Column(db.Text)

    image_url = db.Column(db.String(500))

    favorite = db.Column(
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
        back_populates="recipes"
    )