function Badge({ children, tone = 'ink' }) {
  const tones = {
    ink: 'bg-crave-ink text-crave-bone',
    jade: 'bg-crave-jade text-crave-bone',
    poppy: 'bg-crave-poppy text-crave-bone',
    butter: 'bg-crave-butter text-crave-ink',
    bone: 'bg-crave-bone2 text-crave-ink',
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border-2 border-crave-ink px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-widest ${tones[tone] || tones.ink}`}
    >
      {children}
    </span>
  );
}

export default Badge;
