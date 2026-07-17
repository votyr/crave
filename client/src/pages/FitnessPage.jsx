import { useEffect, useMemo, useState } from 'react';
import { Activity, Dumbbell, Flame } from 'lucide-react';
import Board from '../components/ui/Board';
import Ticket from '../components/ui/Ticket';
import AIRecommendationPanel from '../components/AIRecommendationPanel';

const API_BASE = import.meta.env.VITE_API_BASE;

const defaultCategories = [
  {
    name: 'Warm-up',
    items: [
      { label: 'Mobility flow', value: 'hips, shoulders, spine', tag: '5 min' },
      { label: 'Breathing drill', value: 'box breathing x 5 rounds', tag: '3 min' },
      { label: 'Light walk', value: 'easy pace to raise temp', tag: '5 min' },
    ],
  },
  {
    name: 'Strength',
    items: [
      { label: 'Bodyweight circuit', value: 'squats, push-ups, lunges', tag: '3x12' },
      { label: 'Core set', value: 'planks, dead bugs, leg raises', tag: '3x30s' },
      { label: 'Glute bridge', value: 'single-leg progression', tag: '3x10' },
    ],
  },
  {
    name: 'Cardio',
    items: [
      { label: 'Brisk walk', value: 'outdoors or treadmill', tag: '20 min' },
      { label: 'Interval bike', value: '30s on / 30s off', tag: '15 min' },
      { label: 'Jump rope', value: 'steady rhythm', tag: '10 min' },
    ],
  },
  {
    name: 'Recovery',
    items: [
      { label: 'Static stretch', value: 'full body hold series', tag: '10 min' },
      { label: 'Foam rolling', value: 'legs and back', tag: '8 min' },
      { label: 'Sleep prep', value: 'no screens + light snack', tag: 'habit' },
    ],
  },
];

function FitnessPage({ profile, onApplyWorkoutPlan, onSelectExercise }) {
  const [activePlan, setActivePlan] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('crave_token');
    if (!token) return;

    let cancelled = false;

    const loadActivePlan = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/workouts/latest`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include',
        });

        if (response.status === 404) return;
        if (!response.ok) throw new Error('Could not load workout plan.');

        const data = await response.json();
        if (!cancelled) setActivePlan(data.workout);
      } catch (error) {
        console.error(error);
      }
    };

    loadActivePlan();

    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(() => {
    const workout = activePlan?.workout_json || activePlan?.plan_json;
    const exercises = workout?.exercises || workout || profile?.customWorkout;

    if (exercises) {
      return Object.entries(exercises).map(([name, items]) => ({ name, items }));
    }
    return defaultCategories;
  }, [activePlan, profile?.customWorkout]);

  const handleApplyPlan = async (result) => {
    const savedPlan = await onApplyWorkoutPlan(result);
    setActivePlan(savedPlan);
  };

  return (
    <div className="space-y-6">
      <section className="relative z-10 rounded-2xl border-2 border-crave-ink bg-crave-poppy p-6 text-crave-bone shadow-hard">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest2 text-crave-butter">
              <Activity className="h-4 w-4" />
              Training menu
            </div>
            <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              A flexible routine built for your body.
            </h2>
          </div>
          <div className="flex gap-3">
            <div className="rounded-xl border-2 border-crave-bone px-4 py-2 text-center">
              <Dumbbell className="mx-auto h-5 w-5 text-crave-butter" />
              <span className="mt-1 block font-mono text-[10px] uppercase tracking-widest">Strength</span>
            </div>
            <div className="rounded-xl border-2 border-crave-bone px-4 py-2 text-center">
              <Flame className="mx-auto h-5 w-5 text-crave-butter" />
              <span className="mt-1 block font-mono text-[10px] uppercase tracking-widest">Cardio</span>
            </div>
          </div>
        </div>
      </section>

      <AIRecommendationPanel page="fitness" onApply={handleApplyPlan} />

      <div className="grid gap-5 md:grid-cols-2">
        {categories.map((cat) => (
          <Board
            key={cat.name}
            title={cat.name}
            items={cat.items}
            onItemClick={(item) => onSelectExercise?.(item.label)}
          />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-2xl border-2 border-crave-ink bg-crave-jade p-6 text-crave-bone shadow-hard">
          <h3 className="mb-3 font-display text-2xl font-extrabold">Weekly progression</h3>
          <div className="space-y-3">
            {[
              { label: 'Mon', value: 'Full body strength', active: true },
              { label: 'Tue', value: 'Active recovery walk', active: false },
              { label: 'Wed', value: 'Cardio intervals', active: false },
              { label: 'Thu', value: 'Mobility + core', active: false },
            ].map((day) => (
              <div
                key={day.label}
                className={`flex items-center justify-between rounded-xl border-2 px-4 py-3 ${
                  day.active ? 'border-crave-bone bg-crave-jadeDeep' : 'border-crave-bone/40 bg-crave-bone/10'
                }`}
              >
                <span className="font-mono text-xs font-bold uppercase tracking-widest2">{day.label}</span>
                <span className="text-sm font-semibold">{day.value}</span>
              </div>
            ))}
          </div>
        </div>
        <Ticket
          title="Session receipt"
          rows={[
            { label: 'Warm-up', value: '5 min' },
            { label: 'Strength', value: '25 min' },
            { label: 'Cardio', value: '20 min' },
            { label: 'Recovery', value: '10 min' },
          ]}
          totalLabel="Total"
          totalValue="60 min"
        />
      </div>
    </div>
  );
}

export default FitnessPage;
