from models import WorkoutPlan
from database import db


class WorkoutPlanService:

    @staticmethod
    def create(user_id, data):
        plan_data = dict(data)
        plan_data.pop("active", None)
        workout_json = plan_data.get("workout_json")

        if workout_json is not None and "plan_json" not in plan_data:
            plan_data["plan_json"] = workout_json

        WorkoutPlan.query.filter_by(
            user_id=user_id,
            active=True
        ).update({"active": False}, synchronize_session=False)

        plan = WorkoutPlan(
            user_id=user_id,
            active=True,
            **plan_data
        )

        db.session.add(plan)
        db.session.commit()

        return plan

    @staticmethod
    def get_all(user_id):
        return WorkoutPlan.query.filter_by(user_id=user_id).order_by(
            WorkoutPlan.created_at.desc()
        ).all()

    @staticmethod
    def get_latest(user_id):
        return WorkoutPlan.query.filter_by(
            user_id=user_id,
            active=True
        ).order_by(WorkoutPlan.created_at.desc()).first()

    @staticmethod
    def get(plan_id, user_id):
        return WorkoutPlan.query.filter_by(
            id=plan_id,
            user_id=user_id
        ).first()

    @staticmethod
    def update(plan_id, user_id, data):
        plan = WorkoutPlanService.get(plan_id, user_id)

        if not plan:
            return None

        plan_data = dict(data)
        workout_json = plan_data.get("workout_json")

        if workout_json is not None and "plan_json" not in plan_data:
            plan_data["plan_json"] = workout_json

        if plan_data.get("active") is True:
            WorkoutPlan.query.filter(
                WorkoutPlan.user_id == user_id,
                WorkoutPlan.id != plan_id,
                WorkoutPlan.active.is_(True)
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
        plan = WorkoutPlanService.get(plan_id, user_id)

        if not plan:
            return None

        db.session.delete(plan)
        db.session.commit()

        return plan
