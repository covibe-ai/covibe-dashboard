import { forwardRef } from 'react';

const Card = forwardRef(function Card({ className = '', children, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={`rounded-xl border bg-card text-card-foreground shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

const CardHeader = forwardRef(function CardHeader({ className = '', children, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={`flex flex-col space-y-1.5 p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

const CardTitle = forwardRef(function CardTitle({ className = '', children, ...props }, ref) {
  return (
    <h3
      ref={ref}
      className={`font-semibold leading-none tracking-tight ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
});

const CardDescription = forwardRef(function CardDescription({ className = '', children, ...props }, ref) {
  return (
    <p
      ref={ref}
      className={`text-sm text-muted-foreground ${className}`}
      {...props}
    >
      {children}
    </p>
  );
});

const CardContent = forwardRef(function CardContent({ className = '', children, ...props }, ref) {
  return (
    <div ref={ref} className={`p-6 pt-0 ${className}`} {...props}>
      {children}
    </div>
  );
});

const CardFooter = forwardRef(function CardFooter({ className = '', children, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={`flex items-center p-6 pt-0 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

export default Card;
export { CardHeader, CardTitle, CardDescription, CardContent, CardFooter };