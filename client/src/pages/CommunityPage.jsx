import { Users, Trophy, Calendar, MessageCircle, Plus, ChevronRight } from 'lucide-react';
import Button from '../components/ui/Button';
import SectionHeading from '../components/ui/SectionHeading';

const groups = [
  { name: 'Morning Movers', members: 128, tag: 'Daily check-in', active: true },
  { name: 'Halal Eats Club', members: 84, tag: 'Recipe share', active: false },
  { name: 'Climate-Aware Nutrition', members: 210, tag: 'Local tips', active: false },
  { name: 'Strength for Beginners', members: 156, tag: 'Form help', active: false },
];

const challenges = [
  { title: '7-day hydration streak', participants: 342, daysLeft: 4 },
  { title: '10k steps a day', participants: 518, daysLeft: 9 },
  { title: 'Meat-free weekdays', participants: 127, daysLeft: 12 },
];

function CommunityPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border-2 border-crave-ink bg-crave-bone p-6 shadow-hard">
        <SectionHeading
          kicker="The regulars' corner"
          title="Accountability, shared by people like you."
          subtitle="Join groups, pick up challenges, and share progress with a community that gets your goals."
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
        <div className="rounded-2xl border-2 border-crave-ink bg-crave-bone p-5 shadow-hard">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-2xl font-extrabold">Groups</h3>
            <Button variant="jade" className="px-4 py-2 text-[10px]">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              New
            </Button>
          </div>
          <ul className="space-y-3">
            {groups.map((group) => (
              <li
                key={group.name}
                className="flex items-center justify-between rounded-xl border-2 border-crave-ink bg-crave-bone2 p-3 shadow-hard-sm transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard"
              >
                <div>
                  <p className="font-display text-lg font-extrabold">{group.name}</p>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-widest2 text-crave-ink/60">
                    {group.members} members • {group.tag}
                  </p>
                </div>
                <button className="rounded-full border-2 border-crave-ink bg-crave-poppy p-2 text-crave-bone shadow-hard-sm transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border-2 border-crave-ink bg-crave-jade p-5 text-crave-bone shadow-hard">
            <div className="mb-4 flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest2 text-crave-butter">
              <Trophy className="h-4 w-4" />
              Live challenges
            </div>
            <ul className="space-y-3">
              {challenges.map((challenge) => (
                <li
                  key={challenge.title}
                  className="flex items-center justify-between rounded-xl border-2 border-crave-bone/40 bg-crave-bone/10 px-4 py-3"
                >
                  <div>
                    <p className="font-semibold">{challenge.title}</p>
                    <p className="text-xs opacity-80">{challenge.participants} joined</p>
                  </div>
                  <span className="rounded-full border-2 border-crave-bone px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-widest">
                    {challenge.daysLeft}d left
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border-2 border-crave-ink bg-crave-butter p-5 text-crave-ink shadow-hard">
            <div className="mb-3 flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest2 text-crave-ink/70">
              <Calendar className="h-4 w-4" />
              This week
            </div>
            <p className="text-sm leading-relaxed">
              Join the <strong>Morning Movers</strong> check-in tomorrow at 7 AM local time. Share one win from this
              week to earn your streak badge.
            </p>
          </div>
        </div>
      </div>

      <section className="rounded-2xl border-2 border-crave-ink bg-crave-ink p-6 text-crave-bone shadow-hard">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-display text-2xl font-extrabold">Have a question?</h3>
            <p className="mt-1 text-sm opacity-80">Start a conversation with the community moderators.</p>
          </div>
          <Button variant="butter">
            <MessageCircle className="mr-2 h-4 w-4" />
            Open chat
          </Button>
        </div>
      </section>
    </div>
  );
}

export default CommunityPage;
