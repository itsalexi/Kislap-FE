'use client';

import { useState } from 'react';
import { useAuth } from '../components/AuthProvider.js';
import { useRouter } from 'next/navigation';
import { claimCard } from '../lib/cards.js';
import { Button } from '../components/ui/button.jsx';
import { Input } from '../components/ui/input.jsx';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '../components/ui/card.jsx';
import { Alert, AlertDescription } from '../components/ui/alert.jsx';
import LoadingSpinner from '../components/LoadingSpinner.js';
import ErrorPage, { ErrorTypes } from '../components/ErrorPage';
import { CreditCard, CheckCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function ClaimPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [cardUuid, setCardUuid] = useState('');
    const [error, setError] = useState(null);
    const [claiming, setClaiming] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!cardUuid.trim()) {
            setError('Please enter a card UUID');
            return;
        }

        try {
            setClaiming(true);
            setError(null);

            const result = await claimCard(cardUuid.trim());
            if (result.error) {
                setError(result.error);
            } else {
                setSuccess(true);
            }
        } catch (err) {
            setError('Failed to claim card. Please try again.');
        } finally {
            setClaiming(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 mt-4">
                <LoadingSpinner message="Checking authentication..." />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <ErrorPage
                    type={ErrorTypes.AUTH_REQUIRED}
                    message="Please log in to claim a card."
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center">
                        Claim Your Card
                    </h1>
                    <p className="text-gray-600 mt-2 text-sm sm:text-base text-center">
                        Enter the card UUID provided to you to claim your
                        digital business card.
                    </p>
                </div>

                {error && (
                    <Alert className="mb-6">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <Card className="max-w-md mx-auto">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                            <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span>Card Information</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label
                                htmlFor="cardUuid"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Card UUID
                            </label>
                            <Input
                                id="cardUuid"
                                type="text"
                                value={cardUuid}
                                onChange={(e) => setCardUuid(e.target.value)}
                                placeholder="Enter the card UUID"
                                className="w-full"
                            />
                        </div>

                        <Button
                            onClick={handleSubmit}
                            disabled={claiming || !cardUuid.trim()}
                            className="w-full flex items-center justify-center space-x-2"
                        >
                            {claiming ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                                <CreditCard className="h-4 w-4" />
                            )}
                            <span>
                                {claiming ? 'Claiming...' : 'Claim Card'}
                            </span>
                        </Button>
                    </CardContent>
                </Card>

                {success && (
                    <Card className="max-w-md mx-auto mt-6 border-green-200 bg-green-50">
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-green-800 mb-2">
                                    Card Claimed Successfully!
                                </h3>
                                <p className="text-sm text-green-700 mb-4">
                                    Your digital business card has been claimed
                                    and is now available in your dashboard.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <Link href="/dashboard" className="flex-1">
                                        <Button className="w-full">
                                            Go to Dashboard
                                        </Button>
                                    </Link>
                                    <Link
                                        href={`/card/${cardUuid}`}
                                        className="flex-1"
                                    >
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                        >
                                            View Card
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
