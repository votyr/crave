function Marquee({ items, tone = 'jade' }) {
  const toneClass = tone === 'poppy' ? 'bg-crave-poppy text-crave-bone' : 'bg-crave-jade text-crave-bone';
  const all = [...items, ...items];
  return (
    <div className={`overflow-hidden border-y-2 border-crave-ink ${toneClass}`}>
      <div className="flex w-max animate-marquee items-center gap-8 py-3">
        {all.map((item, index) => (
          <span key={index} className="flex items-center gap-3 font-mono text-xs font-bold uppercase tracking-widest2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-current" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export default Marquee;
