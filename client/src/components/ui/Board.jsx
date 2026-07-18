function Board({ title, items, className = '', labelClass = '', onItemClick, compactIngredients = false }) {
  return (
    <div className={`rounded-2xl border-2 border-crave-ink bg-crave-bone p-5 shadow-hard ${className}`}>
      {title && (
        <h3 className="mb-4 border-b-2 border-crave-ink pb-3 font-display text-xl font-extrabold text-crave-ink">
          {title}
        </h3>
      )}
      <ul className="space-y-3">
        {items.map((item) => {
          const clickable = Boolean(onItemClick);
          return (
            <li
              key={item.label || item.title}
              onClick={clickable ? () => onItemClick(item) : undefined}
              className={`${compactIngredients ? 'block' : 'flex items-end gap-2'} ${clickable ? 'cursor-pointer rounded-lg -mx-2 px-2 py-1 transition hover:bg-crave-bone2' : ''}`}
            >
              {compactIngredients ? (
                <>
                  <span className={`font-mono text-xs font-bold uppercase tracking-widest2 ${labelClass || 'text-crave-poppy'}`}>
                    {item.title || item.label}
                  </span>
                  <ul className="mt-1 space-y-0.5 text-sm text-crave-ink/80">
                    {(item.ingredients || []).slice(0, 3).map((ingredient) => (
                      <li key={ingredient}>• {ingredient}</li>
                    ))}
                  </ul>
                </>
              ) : (
                <>
                  <span className={`font-mono text-xs font-bold uppercase tracking-widest2 ${labelClass || 'text-crave-poppy'}`}>
                    {item.label || item.title}
                  </span>
                  <span className="leader-line" />
                  <span className="text-right text-sm font-medium text-crave-ink/90">{item.value || item.detail}</span>
                </>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default Board;
