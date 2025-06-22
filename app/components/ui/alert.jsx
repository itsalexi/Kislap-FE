import * as React from 'react';
import { cn } from '../../lib/utils';

const alertVariants = {
    default: 'bg-white text-gray-900 border-gray-200',
    destructive: 'bg-red-50 text-red-800 border-red-200',
};

function Alert({ className, variant = 'default', ...props }) {
    const baseClasses = 'relative w-full rounded-lg border px-4 py-3 text-sm';
    const variantClasses = alertVariants[variant] || alertVariants.default;

    return (
        <div
            role="alert"
            className={cn(baseClasses, variantClasses, className)}
            {...props}
        />
    );
}

function AlertTitle({ className, ...props }) {
    return (
        <div
            className={cn('font-medium tracking-tight mb-1', className)}
            {...props}
        />
    );
}

function AlertDescription({ className, ...props }) {
    return <div className={cn('text-sm', className)} {...props} />;
}

export { Alert, AlertTitle, AlertDescription };
