function StatCard({ label, value, note, icon: Icon, tone = 'ink' }) {
  const tones = {
    ink: 'bg-crave-ink text-crave-bone',
    jade: 'bg-crave-jade text-crave-bone',
    poppy: 'bg-crave-poppy text-crave-bone',
    butter: 'bg-crave-butter text-crave-ink',
    bone: 'bg-crave-bone2 text-crave-ink',
  };
  return (
    <div className={`rounded-2xl border-2 border-crave-ink p-4 shadow-hard-sm ${tones[tone] || tones.ink}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest2 opacity-80">{label}</p>
          <p className="mt-1 font-display text-2xl font-extrabold leading-none">{value}</p>
        </div>
        {Icon && <Icon className="h-6 w-6 shrink-0 opacity-90" strokeWidth={2.5} />}
      </div>
      {note && <p className="mt-2 text-xs opacity-80">{note}</p>}
    </div>
  );
}

export default StatCard;
