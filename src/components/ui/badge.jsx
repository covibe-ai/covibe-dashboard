const variantStyles = {
  default: 'border-transparent bg-primary text-primary-foreground shadow-sm',
  secondary: 'border-transparent bg-secondary text-secondary-foreground',
  destructive: 'border-transparent bg-destructive text-destructive-foreground shadow-sm',
  outline: 'text-foreground',
  success: 'border-transparent bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  warning: 'border-transparent bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

function Badge({ className = '', variant = 'default', children, ...props }) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

export default Badge;