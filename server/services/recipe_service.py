from models import Recipe
from database import db


class RecipeService:

    @staticmethod
    def create(user_id, data):
        recipe = Recipe(
            user_id=user_id,
            **data
        )

        db.session.add(recipe)
        db.session.commit()

        return recipe

    @staticmethod
    def get_all(user_id):
        return Recipe.query.filter_by(user_id=user_id).order_by(
            Recipe.created_at.desc()
        ).all()

    @staticmethod
    def get(recipe_id, user_id):
        return Recipe.query.filter_by(
            id=recipe_id,
            user_id=user_id
        ).first()

    @staticmethod
    def update(recipe_id, user_id, data):
        recipe = RecipeService.get(recipe_id, user_id)

        if not recipe:
            return None

        for key, value in data.items():
            if hasattr(recipe, key) and key not in (
                "id", "user_id", "created_at", "updated_at"
            ):
                setattr(recipe, key, value)

        db.session.commit()

        return recipe

    @staticmethod
    def delete(recipe_id, user_id):
        recipe = RecipeService.get(recipe_id, user_id)

        if not recipe:
            return None

        db.session.delete(recipe)
        db.session.commit()

        return recipe

    @staticmethod
    def toggle_favorite(recipe_id, user_id):
        recipe = RecipeService.get(recipe_id, user_id)

        if not recipe:
            return None

        recipe.favorite = not recipe.favorite
        db.session.commit()

        return recipe

    @staticmethod
    def get_favorites(user_id):
        return Recipe.query.filter_by(
            user_id=user_id,
            favorite=True
        ).order_by(Recipe.created_at.desc()).all()
