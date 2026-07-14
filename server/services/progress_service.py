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