ALTER TABLE workout_plans
ADD COLUMN IF NOT EXISTS workout_json JSONB;

ALTER TABLE meal_plans
ADD COLUMN IF NOT EXISTS meal_json JSONB;

UPDATE workout_plans
SET workout_json = plan_json
WHERE workout_json IS NULL
  AND plan_json IS NOT NULL;

UPDATE meal_plans
SET meal_json = plan_json
WHERE meal_json IS NULL
  AND plan_json IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_workout_plans_active_user
ON workout_plans (user_id, active, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_meal_plans_active_user
ON meal_plans (user_id, active, created_at DESC);
