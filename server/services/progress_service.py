from models import ProgressLog
from database import db


class ProgressService:

    @staticmethod
    def add(user_id, data):

        log = ProgressLog(
            user_id=user_id,
            **data
        )

        db.session.add(log)
        db.session.commit()

        return log

    @staticmethod
    def get_all(user_id):
        return ProgressLog.query.filter_by(user_id=user_id).order_by(
            ProgressLog.log_date.desc(),
            ProgressLog.created_at.desc()
        ).all()

    @staticmethod
    def get_latest(user_id):
        return ProgressLog.query.filter_by(user_id=user_id).order_by(
            ProgressLog.log_date.desc(),
            ProgressLog.created_at.desc()
        ).first()

    @staticmethod
    def get(progress_id, user_id):
        return ProgressLog.query.filter_by(
            id=progress_id,
            user_id=user_id
        ).first()

    @staticmethod
    def update(progress_id, user_id, data):
        log = ProgressService.get(progress_id, user_id)

        if not log:
            return None

        for key, value in data.items():
            if hasattr(log, key) and key not in ("id", "user_id", "created_at"):
                setattr(log, key, value)

        db.session.commit()

        return log

    @staticmethod
    def delete(progress_id, user_id):
        log = ProgressService.get(progress_id, user_id)

        if not log:
            return None

        db.session.delete(log)
        db.session.commit()

        return log
