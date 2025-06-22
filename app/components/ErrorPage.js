'use client';

import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import {
    AlertTriangle,
    Shield,
    Home,
    RefreshCw,
    ArrowLeft,
    UserX,
    Server,
} from 'lucide-react';

const ErrorTypes = {
    AUTH_REQUIRED: 'auth_required',
    ADMIN_REQUIRED: 'admin_required',
    NOT_FOUND: 'not_found',
    SERVER_ERROR: 'server_error',
    NETWORK_ERROR: 'network_error',
    GENERIC: 'generic',
};

const ErrorConfig = {
    [ErrorTypes.AUTH_REQUIRED]: {
        icon: UserX,
        title: 'Authentication Required',
        message: 'You must be logged in to access this page.',
        primaryAction: {
            label: 'Login',
            href: '/',
            variant: 'default',
        },
        secondaryAction: {
            label: 'Go Home',
            href: '/',
            variant: 'outline',
        },
    },
    [ErrorTypes.ADMIN_REQUIRED]: {
        icon: Shield,
        title: 'Admin Access Required',
        message:
            'You do not have admin privileges to access this page. Only users with ADMIN role can access the admin dashboard.',
        primaryAction: {
            label: 'Return to Home',
            href: '/',
            variant: 'default',
        },
        secondaryAction: {
            label: 'Go to Dashboard',
            href: '/dashboard',
            variant: 'outline',
        },
    },
    [ErrorTypes.NOT_FOUND]: {
        icon: AlertTriangle,
        title: 'Page Not Found',
        message: 'The page you are looking for does not exist.',
        primaryAction: {
            label: 'Go Home',
            href: '/',
            variant: 'default',
        },
        secondaryAction: {
            label: 'Go Back',
            action: 'back',
            variant: 'outline',
        },
    },
    [ErrorTypes.SERVER_ERROR]: {
        icon: Server,
        title: 'Server Error',
        message: 'Something went wrong on our end. Please try again later.',
        primaryAction: {
            label: 'Try Again',
            action: 'retry',
            variant: 'default',
        },
        secondaryAction: {
            label: 'Go Home',
            href: '/',
            variant: 'outline',
        },
    },
    [ErrorTypes.NETWORK_ERROR]: {
        icon: AlertTriangle,
        title: 'Network Error',
        message:
            'Unable to connect to the server. Please check your internet connection.',
        primaryAction: {
            label: 'Try Again',
            action: 'retry',
            variant: 'default',
        },
        secondaryAction: {
            label: 'Go Home',
            href: '/',
            variant: 'outline',
        },
    },
    [ErrorTypes.GENERIC]: {
        icon: AlertTriangle,
        title: 'Something Went Wrong',
        message: 'An unexpected error occurred. Please try again.',
        primaryAction: {
            label: 'Try Again',
            action: 'retry',
            variant: 'default',
        },
        secondaryAction: {
            label: 'Go Home',
            href: '/',
            variant: 'outline',
        },
    },
};

export default function ErrorPage({
    type = ErrorTypes.GENERIC,
    title,
    message,
    primaryAction,
    secondaryAction,
    onRetry,
    className = 'flex items-center justify-center py-16',
}) {
    const config = ErrorConfig[type] || ErrorConfig[ErrorTypes.GENERIC];

    // Use provided props or fall back to config defaults
    const finalTitle = title || config.title;
    const finalMessage = message || config.message;
    const finalPrimaryAction = primaryAction || config.primaryAction;
    const finalSecondaryAction = secondaryAction || config.secondaryAction;

    const IconComponent = config.icon;

    const handleAction = (action) => {
        if (action.action === 'retry' && onRetry) {
            onRetry();
        } else if (action.action === 'back') {
            window.history.back();
        } else if (action.href) {
            window.location.href = action.href;
        }
    };

    return (
        <div className={className}>
            <div className="max-w-md text-center">
                <div className="mb-6 flex justify-center">
                    <IconComponent className="h-16 w-16 text-red-500" />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {finalTitle}
                </h1>

                <Alert className="mb-6">
                    <AlertDescription>{finalMessage}</AlertDescription>
                </Alert>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    {finalPrimaryAction && (
                        <Button
                            variant={finalPrimaryAction.variant}
                            onClick={() => handleAction(finalPrimaryAction)}
                            className="flex items-center space-x-2"
                        >
                            {finalPrimaryAction.action === 'retry' && (
                                <RefreshCw className="h-4 w-4" />
                            )}
                            {finalPrimaryAction.action === 'back' && (
                                <ArrowLeft className="h-4 w-4" />
                            )}
                            {finalPrimaryAction.href && (
                                <Home className="h-4 w-4" />
                            )}
                            <span>{finalPrimaryAction.label}</span>
                        </Button>
                    )}

                    {finalSecondaryAction && (
                        <Button
                            variant={finalSecondaryAction.variant}
                            onClick={() => handleAction(finalSecondaryAction)}
                            className="flex items-center space-x-2"
                        >
                            {finalSecondaryAction.action === 'retry' && (
                                <RefreshCw className="h-4 w-4" />
                            )}
                            {finalSecondaryAction.action === 'back' && (
                                <ArrowLeft className="h-4 w-4" />
                            )}
                            {finalSecondaryAction.href && (
                                <Home className="h-4 w-4" />
                            )}
                            <span>{finalSecondaryAction.label}</span>
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

// Export error types for easy usage
export { ErrorTypes };
