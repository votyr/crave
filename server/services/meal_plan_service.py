from models import MealPlan
from database import db


class MealPlanService:

    @staticmethod
    def _meal_title(meal_json):
        if not isinstance(meal_json, dict):
            return None

        meals = meal_json.get("meals", meal_json)
        if not isinstance(meals, dict):
            return None

        for items in meals.values():
            if not isinstance(items, list):
                continue

            for item in items:
                if not isinstance(item, dict):
                    continue

                title = item.get("title") or item.get("label")
                if isinstance(title, str) and title.strip():
                    return title.strip()

        return None

    @staticmethod
    def create(user_id, data):
        plan_data = dict(data)
        plan_data.pop("active", None)
        meal_json = plan_data.get("meal_json") or plan_data.get("plan_json")

        meal_title = MealPlanService._meal_title(meal_json)
        if meal_title:
            plan_data["title"] = meal_title

        if meal_json is not None and "plan_json" not in plan_data:
            plan_data["plan_json"] = meal_json

        MealPlan.query.filter_by(
            user_id=user_id,
            active=True
        ).update({"active": False}, synchronize_session=False)

        plan = MealPlan(
            user_id=user_id,
            active=True,
            **plan_data
        )

        db.session.add(plan)
        db.session.commit()

        return plan

    @staticmethod
    def get_all(user_id):
        return MealPlan.query.filter_by(user_id=user_id).order_by(
            MealPlan.created_at.desc()
        ).all()

    @staticmethod
    def get_latest(user_id):
        return MealPlan.query.filter_by(
            user_id=user_id,
            active=True
        ).order_by(MealPlan.created_at.desc()).first()

    @staticmethod
    def get(plan_id, user_id):
        return MealPlan.query.filter_by(
            id=plan_id,
            user_id=user_id
        ).first()

    @staticmethod
    def update(plan_id, user_id, data):
        plan = MealPlanService.get(plan_id, user_id)

        if not plan:
            return None

        plan_data = dict(data)
        meal_json = plan_data.get("meal_json") or plan_data.get("plan_json")

        meal_title = MealPlanService._meal_title(meal_json)
        if meal_title and "title" not in plan_data:
            plan_data["title"] = meal_title

        if meal_json is not None and "plan_json" not in plan_data:
            plan_data["plan_json"] = meal_json

        if plan_data.get("active") is True:
            MealPlan.query.filter(
                MealPlan.user_id == user_id,
                MealPlan.id != plan_id,
                MealPlan.active.is_(True)
            ).update({"active": False}, synchronize_session=False)

        for key, value in plan_data.items():
            if hasattr(plan, key) and key not in (
                "id", "user_id", "created_at", "updated_at"
            ):
                setattr(plan, key, value)

        db.session.commit()

        return plan

    @staticmethod
    def delete(plan_id, user_id):
        plan = MealPlanService.get(plan_id, user_id)

        if not plan:
            return None

        db.session.delete(plan)
        db.session.commit()

        return plan
