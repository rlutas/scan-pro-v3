import * as React from "react"

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive';
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className = "", variant = "default", ...props }, ref) => {
    const variantClasses = variant === 'destructive' 
      ? 'border-red-500/50 text-red-700 dark:border-red-500 dark:text-red-400 [&>svg]:text-red-600 bg-red-50 dark:bg-red-900/20'
      : 'bg-background text-foreground';

    return (
      <div
        ref={ref}
        role="alert"
        className={`relative w-full rounded-lg border p-4 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg+div]:translate-y-[-3px] [&>svg~*]:pl-7 ${variantClasses} ${className}`}
        {...props}
      />
    );
  }
);
Alert.displayName = "Alert"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className = "", ...props }, ref) => (
  <div
    ref={ref}
    className={`text-sm [&_p]:leading-relaxed ${className}`}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertDescription } 