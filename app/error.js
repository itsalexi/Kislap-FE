'use client';

import ErrorPage, { ErrorTypes } from './components/ErrorPage';

export default function Error({ error, reset }) {
    return (
        <ErrorPage
            type={ErrorTypes.SERVER_ERROR}
            title="Something went wrong!"
            message={
                error?.message ||
                'An unexpected error occurred. Please try again.'
            }
            onRetry={reset}
        />
    );
}
