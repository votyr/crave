import { Link } from 'react-router-dom';
import { Dumbbell, Utensils, MapPin, HeartPulse, Sparkles, ThermometerSun } from 'lucide-react';
import Button from '../components/ui/Button';
import SectionHeading from '../components/ui/SectionHeading';
import Marquee from '../components/ui/Marquee';

const mosaicTiles = [
  { label: 'Meal 01', icon: Utensils, color: 'bg-crave-poppy', delay: 0 },
  { label: 'Workout', icon: Dumbbell, color: 'bg-crave-jade', delay: 1 },
  { label: 'Local', icon: MapPin, color: 'bg-crave-butter', delay: 2 },
  { label: 'Heart', icon: HeartPulse, color: 'bg-crave-jadeDeep', delay: 3 },
  { label: 'Meal 02', icon: Utensils, color: 'bg-crave-butter', delay: 4 },
  { label: 'Plan', icon: Sparkles, color: 'bg-crave-poppy', delay: 5 },
  { label: 'Climate', icon: ThermometerSun, color: 'bg-crave-jade', delay: 6 },
  { label: 'Meal 03', icon: Utensils, color: 'bg-crave-poppy', delay: 7 },
];

const todaySpecials = [
  { label: 'Personalized', value: 'Faith-aware meals' },
  { label: 'Adaptive', value: 'Climate + location' },
  { label: 'AI Trainer', value: 'Goal-based routines' },
];

const bento = [
  {
    tone: 'poppy',
    title: 'Nutrition that knows you',
    body: 'CRAVE builds meals around your religion, allergies, diet, and local climate so every dish feels like home.',
  },
  {
    tone: 'jade',
    title: 'Fitness that fits',
    body: 'From gentle mobility to athletic strength work, your weekly routine adapts to your activity level and progress.',
  },
  {
    tone: 'butter',
    title: 'Local health awareness',
    body: 'Temperature, season, and regional ingredients are factored into hydration, meals, and recovery guidance.',
  },
  {
    tone: 'ink',
    title: 'Community accountability',
    body: 'Share streaks, join challenges, and stay consistent with people following similar health goals.',
  },
];

function LandingPage() {
  return (
    <div className="min-h-screen bg-crave-bone text-crave-ink">
      <section className="relative overflow-hidden border-b-2 border-crave-ink">
        <div className="grain-overlay" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-20">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {mosaicTiles.map((tile) => (
              <div
                key={tile.label}
                className={`group flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border-2 border-crave-ink ${tile.color} text-crave-bone shadow-hard transition hover:-translate-x-1 hover:-translate-y-1 hover:shadow-hard-lg`}
                style={{ transitionDelay: `${tile.delay * 40}ms` }}
              >
                <tile.icon className="h-7 w-7 transition-transform group-hover:scale-110" strokeWidth={2.5} />
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest2 opacity-90">
                  {tile.label}
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-start gap-6">
            <div className="inline-flex items-center gap-2 rounded-full border-2 border-crave-ink bg-crave-bone2 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest2 text-crave-ink">
              <span className="h-1.5 w-1.5 rounded-full bg-crave-poppy" />
              {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
            </div>
            <h1 className="font-display text-5xl font-extrabold leading-[0.95] tracking-tight text-crave-ink sm:text-6xl lg:text-7xl">
              Your body's
              <br />
              <span className="text-crave-poppy">daily special.</span>
            </h1>
            <p className="max-w-md text-lg leading-relaxed text-crave-ink/75">
              AI-crafted nutrition and fitness that respect your health, faith, climate, and daily life.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="solid" href="/signup">
                Start your plan
              </Button>
              <Button variant="ghost" href="/login">
                Already a regular
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Marquee
        tone="jade"
        items={[
          'Personalized to your faith',
          'Climate-aware hydration',
          'Allergies considered',
          'Goal-based workouts',
          'Local ingredient focus',
        ]}
      />

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
          <SectionHeading
            kicker="Today's specials"
            title="Three things CRAVE does for you every day."
            subtitle="Mix and match what matters — nutrition, movement, and mindful habits tuned to who you are."
          />
          <div className="rounded-2xl border-2 border-crave-ink bg-crave-bone p-6 shadow-hard">
            <h3 className="mb-4 border-b-2 border-crave-ink pb-3 font-display text-2xl font-extrabold text-crave-ink">
              The daily board
            </h3>
            <ul className="space-y-3">
              {todaySpecials.map((item) => (
                <li key={item.label} className="flex items-end gap-2">
                  <span className="font-mono text-xs font-bold uppercase tracking-widest2 text-crave-poppy">
                    {item.label}
                  </span>
                  <span className="leader-line" />
                  <span className="text-right text-base font-semibold text-crave-ink">{item.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="border-y-2 border-crave-ink bg-crave-bone2 py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            centered
            kicker="The full menu"
            title="Everything on the CRAVE menu."
            subtitle="A complete toolkit for personalized wellness, designed around your real life."
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {bento.map((cell) => {
              const tones = {
                poppy: 'bg-crave-poppy text-crave-bone',
                jade: 'bg-crave-jade text-crave-bone',
                butter: 'bg-crave-butter text-crave-ink',
                ink: 'bg-crave-ink text-crave-bone',
              };
              return (
                <div
                  key={cell.title}
                  className={`rounded-2xl border-2 border-crave-ink p-5 shadow-hard transition hover:-translate-x-1 hover:-translate-y-1 hover:shadow-hard-lg ${tones[cell.tone]}`}
                >
                  <h3 className="font-display text-xl font-extrabold">{cell.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed opacity-90">{cell.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="rounded-3xl border-2 border-crave-ink bg-crave-jade p-8 text-crave-bone shadow-hard lg:p-12">
          <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-widest2 text-crave-butter">Open now</p>
              <h2 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl">
                Ready to order your first plan?
              </h2>
              <p className="mt-2 max-w-xl opacity-90">
                Tell CRAVE about your diet, location, and goals. The AI kitchen will have a plan ready in seconds.
              </p>
            </div>
            <Button variant="butter" href="#/signup">
              Get started
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t-2 border-crave-ink bg-crave-ink py-8 text-crave-bone">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <span className="font-display text-xl font-extrabold">CRAVE</span>
          <p className="font-mono text-[10px] uppercase tracking-widest2 opacity-60">
            AI wellness, made personal • {new Date().getFullYear()}
          </p>
          <div className="flex gap-4 font-mono text-xs font-bold uppercase tracking-widest">
            <Link to="/login" className="hover:text-crave-butter">
              Login
            </Link>
            <Link to="/signup" className="hover:text-crave-butter">
              Sign up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
