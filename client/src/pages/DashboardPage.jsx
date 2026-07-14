import { useEffect, useState } from 'react';
import { Utensils, Dumbbell, Droplets, Footprints, Target, ThermometerSun, Wind } from 'lucide-react';
import StatCard from '../components/ui/StatCard';
import Board from '../components/ui/Board';
import Ticket from '../components/ui/Ticket';
import Badge from '../components/ui/Badge';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

function DashboardPage({ profile, backendStatus, plan }) {
  const [localStats, setLocalStats] = useState({ temp: null, condition: null, humidity: null });

  useEffect(() => {
    fetch(`${API_BASE}/api/user/stats?location=${encodeURIComponent(profile.location?.label || '')}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.weather) {
          setLocalStats({
            temp: data.weather.temperature,
            condition: data.weather.condition,
            humidity: data.weather.humidity,
          });
        }
      })
      .catch(() => {});
  }, [profile.location?.label]);

  const focus = profile.goal === 'lose' ? 'Fat loss' : profile.goal === 'gain' ? 'Muscle gain' : 'Steady wellness';

  const mealItems = (plan?.meals || []).map((m) => ({
    label: m.title,
    value: m.detail,
    tag: m.title === 'Breakfast' ? '380 kcal' : m.title === 'Lunch' ? '520 kcal' : '610 kcal',
  }));

  const fitnessItems = (plan?.fitness || []).map((f) => ({
    label: f.title,
    value: f.detail,
    tag: f.title === 'Morning' ? '20 min' : f.title === 'Midday' ? '25 min' : '10 min',
  }));

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl border-2 border-crave-ink bg-crave-bone p-6 shadow-hard">
        <div className="grain-overlay" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="jade">{focus}</Badge>
              <Badge tone="butter">{profile.location?.label}</Badge>
              {profile.dietary?.map((d) => (
                <Badge key={d} tone="ink">
                  {d}
                </Badge>
              ))}
            </div>
            <h2 className="mt-4 font-display text-4xl font-extrabold leading-none tracking-tight sm:text-5xl">
              Good day, {profile.name}
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-crave-ink/75">
              Your plan is tuned for {profile.activity} movement, {profile.religion || 'your'} dietary guidelines,
              and {profile.climate} climate. CRAVE is ready to serve.
            </p>
          </div>

          <div className="flex min-w-[260px] flex-col gap-2 rounded-2xl border-2 border-crave-ink bg-crave-bone2 p-4 shadow-hard-sm">
            <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest2 text-crave-ink/70">
              <ThermometerSun className="h-4 w-4 text-crave-poppy" />
              Local health
            </div>
            <div className="flex items-end justify-between">
              <span className="font-display text-3xl font-extrabold text-crave-ink">
                {localStats.temp != null ? `${localStats.temp}°C` : '--'}
              </span>
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-crave-jade">
                {localStats.condition || profile.climate}
              </span>
            </div>
            {localStats.humidity != null && (
              <div className="flex items-center gap-1.5 text-xs text-crave-ink/70">
                <Wind className="h-3.5 w-3.5" />
                Humidity {localStats.humidity}%
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Today's focus" value={focus} note="Aligned with your goal" icon={Target} tone="ink" />
        <StatCard label="Hydration" value="2.2 L" note="A glass before lunch" icon={Droplets} tone="jade" />
        <StatCard label="Steps" value="8.4 k" note="Keep the momentum" icon={Footprints} tone="poppy" />
        <StatCard label="Backend" value={backendStatus === 'Backend connected' ? 'Online' : 'Preview'} note={backendStatus} icon={Wind} tone="butter" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Board
          title="Today's board"
          items={[
            { label: 'Meals', value: `${mealItems.length} items planned` },
            ...mealItems,
            { label: 'Fitness', value: `${fitnessItems.length} sessions` },
            ...fitnessItems,
          ]}
          className="bg-crave-bone"
        />

        <div className="space-y-6">
          <Ticket
            title="Daily receipt"
            rows={[
              { label: 'Focus', value: focus },
              { label: 'Dietary', value: profile.dietary?.join(', ') || 'Any' },
              { label: 'Religion', value: profile.religion || 'Any' },
              { label: 'Location', value: profile.location?.label },
              { label: 'Climate', value: profile.climate },
              { label: 'Activity', value: profile.activity },
            ]}
            totalLabel="Consistency"
            totalValue="On track"
          />

          <div className="rounded-2xl border-2 border-crave-ink bg-crave-jade p-5 text-crave-bone shadow-hard">
            <div className="mb-3 flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest2 text-crave-butter">
              <Utensils className="h-4 w-4" />
              Chef's note
            </div>
            <p className="text-sm leading-relaxed opacity-95">
              {plan?.habits?.slice(0, 2).join('. ')}. Avoid {profile.allergies?.join(', ') || 'known allergens'} where
              possible.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
