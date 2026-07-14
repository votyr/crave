function Input({ label, name, value, onChange, type = 'text', placeholder, options, as = 'input' }) {
  const base =
    'w-full rounded-xl border-2 border-crave-ink bg-crave-bone2 px-4 py-2.5 text-sm text-crave-ink placeholder:text-crave-ink/40 focus:border-crave-poppy focus:bg-crave-bone focus:outline-none';

  return (
    <label className="block text-sm font-medium text-crave-ink">
      <span className="mb-1 block font-mono text-[11px] font-bold uppercase tracking-widest2 text-crave-ink/70">{label}</span>
      {as === 'select' ? (
        <select name={name} value={value} onChange={onChange} className={base}>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={base}
        />
      )}
    </label>
  );
}

export default Input;
