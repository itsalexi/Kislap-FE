import * as React from 'react';
import { cn } from '../../lib/utils';

const buttonVariants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
    ghost: 'text-gray-700 hover:bg-gray-100',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    link: 'text-blue-600 underline hover:text-blue-800',
};

const buttonSizes = {
    default: 'h-9 px-4 py-2',
    sm: 'h-8 px-3 text-sm',
    lg: 'h-10 px-6 text-base',
    icon: 'h-9 w-9',
};

function Button({
    className,
    variant = 'default',
    size = 'default',
    asChild = false,
    ...props
}) {
    const baseClasses =
        'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50';
    const variantClasses = buttonVariants[variant] || buttonVariants.default;
    const sizeClasses = buttonSizes[size] || buttonSizes.default;

    const classes = cn(baseClasses, variantClasses, sizeClasses, className);

    if (asChild) {
        return React.cloneElement(props.children, {
            className: cn(classes, props.children.props.className),
            ...props,
        });
    }

    return <button className={classes} {...props} />;
}

export { Button };
