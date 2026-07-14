function Ticket({ title, rows, totalLabel, totalValue, children }) {
  return (
    <div className="relative">
      <div className="ticket-edge rounded-2xl border-2 border-crave-ink bg-crave-bone px-5 py-6 shadow-hard">
        {title && (
          <h3 className="mb-4 border-b-2 border-dashed border-crave-ink/30 pb-3 text-center font-display text-xl font-extrabold text-crave-ink">
            {title}
          </h3>
        )}
        <div className="space-y-2">
          {rows.map((row) => (
            <div key={row.label} className="flex justify-between gap-3 text-sm">
              <span className="font-medium text-crave-ink/75">{row.label}</span>
              <span className="font-mono font-semibold text-crave-ink">{row.value}</span>
            </div>
          ))}
        </div>
        {(totalLabel || totalValue) && (
          <div className="mt-4 flex justify-between gap-3 border-t-2 border-dashed border-crave-ink/30 pt-3">
            <span className="font-display text-lg font-extrabold text-crave-ink">{totalLabel}</span>
            <span className="font-mono text-lg font-bold text-crave-poppy">{totalValue}</span>
          </div>
        )}
        {children && <div className="mt-4 border-t-2 border-dashed border-crave-ink/30 pt-4">{children}</div>}
      </div>
    </div>
  );
}

export default Ticket;
