function Board({ title, items, className = '', labelClass = '' }) {
  return (
    <div className={`rounded-2xl border-2 border-crave-ink bg-crave-bone p-5 shadow-hard ${className}`}>
      {title && (
        <h3 className="mb-4 border-b-2 border-crave-ink pb-3 font-display text-xl font-extrabold text-crave-ink">
          {title}
        </h3>
      )}
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.label || item.title} className="flex items-end gap-2">
            <span className={`font-mono text-xs font-bold uppercase tracking-widest2 ${labelClass || 'text-crave-poppy'}`}>
              {item.label || item.title}
            </span>
            <span className="leader-line" />
            <span className="text-right text-sm font-medium text-crave-ink/90">{item.value || item.detail}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Board;
