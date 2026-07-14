function SectionHeading({ kicker, title, subtitle, centered = false }) {
  return (
    <div className={`max-w-3xl ${centered ? 'mx-auto text-center' : ''}`}>
      <p className="inline-block font-mono text-xs font-bold uppercase tracking-widest2 text-crave-poppy">
        {kicker}
      </p>
      <h2 className="mt-3 font-display text-3xl font-extrabold leading-[1.05] tracking-tight text-crave-ink sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {subtitle && <p className="mt-3 text-base leading-relaxed text-crave-ink/75">{subtitle}</p>}
    </div>
  );
}

export default SectionHeading;
