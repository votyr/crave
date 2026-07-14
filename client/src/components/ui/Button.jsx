function Button({ children, variant = 'solid', href, onClick, type = 'button', className = '' }) {
  const base =
    'inline-flex items-center justify-center rounded-full border-2 border-crave-ink px-6 py-3 font-mono text-sm font-bold uppercase tracking-widest2 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-crave-ink focus-visible:ring-offset-2 focus-visible:ring-offset-crave-bone active:translate-x-[2px] active:translate-y-[2px] active:shadow-none';
  const styles = {
    solid: 'bg-crave-poppy text-crave-bone shadow-hard hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-hard-lg',
    jade: 'bg-crave-jade text-crave-bone shadow-hard hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-hard-lg',
    butter: 'bg-crave-butter text-crave-ink shadow-hard hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-hard-lg',
    ghost: 'bg-crave-bone text-crave-ink shadow-hard-sm hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-hard',
  };

  const classes = `${base} ${styles[variant] || styles.solid} ${className}`;

  if (href) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
    </button>
  );
}

export default Button;
