'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
import { getUserCards, claimCard } from '../lib/cards.js';
import { Button } from '../components/ui/button.jsx';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '../components/ui/card.jsx';
import { Alert, AlertDescription } from '../components/ui/alert.jsx';
import { Plus, CreditCard, BarChart3, Eye, Edit } from 'lucide-react';
import { Input } from '../components/ui/input.jsx';
import { RefreshCw } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorPage, { ErrorTypes } from '../components/ErrorPage';
import Link from 'next/link';

export default function Dashboard() {
    const { user, loading: authLoading } = useAuth();
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cardUuid, setCardUuid] = useState('');
    const [claiming, setClaiming] = useState(false);

    useEffect(() => {
        if (!authLoading && user) {
            loadCards();
        } else if (!authLoading && !user) {
            setLoading(false);
        }
    }, [authLoading, user]);

    const loadCards = async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await getUserCards();
            if (result.error) {
                setError(result.error);
            } else {
                setCards(Array.isArray(result) ? result : []);
            }
        } catch (err) {
            setError('Failed to load cards');
        } finally {
            setLoading(false);
        }
    };

    const handleClaimCard = async () => {
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
                await loadCards();
                setCardUuid('');
            }
        } catch (err) {
            setError('Failed to claim card');
        } finally {
            setClaiming(false);
        }
    };

    if (authLoading || loading) {
        return <LoadingSpinner />;
    }

    if (!user) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <ErrorPage type={ErrorTypes.AUTH_REQUIRED} />
            </div>
        );
    }

    const stats = {
        totalCards: cards.length,
        claimedCards: cards.length,
        claimRate: 100, // All cards returned by getUserCards are claimed
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        Dashboard
                    </h1>
                    <p className="text-gray-600 mt-2 text-sm sm:text-base">
                        Welcome back, {user.name}!
                    </p>
                </div>

                {error && (
                    <Alert className="mb-6">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* User Stats */}
                <div className="grid grid-cols-1 gap-3 sm:gap-6 mb-6 sm:mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium">
                                Your Cards
                            </CardTitle>
                            <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg sm:text-2xl font-bold">
                                {stats.claimedCards}
                            </div>
                            <p className="text-xs text-gray-500">
                                Cards you&apos;ve claimed
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Claim Card Section */}
                <Card className="mb-6 sm:mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                            <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span>Claim a Card</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm sm:text-base text-gray-600 mb-4">
                            Enter a card UUID to claim it for yourself.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Input
                                type="text"
                                value={cardUuid}
                                onChange={(e) => setCardUuid(e.target.value)}
                                placeholder="Enter card UUID"
                                className="flex-1"
                            />
                            <Button
                                onClick={handleClaimCard}
                                disabled={claiming}
                                className="flex items-center space-x-2"
                            >
                                {claiming ? (
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Plus className="h-4 w-4" />
                                )}
                                <span>
                                    {claiming ? 'Claiming...' : 'Claim Card'}
                                </span>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Claimed Cards */}
                <div>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
                        Your Claimed Cards
                    </h2>
                    {cards.length === 0 ? (
                        <Card>
                            <CardContent className="text-center py-8">
                                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500">
                                    You haven&apos;t claimed any cards yet.
                                </p>
                                <p className="text-sm text-gray-400 mt-2">
                                    Use the form above to claim your first card!
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                            {cards.map((card) => (
                                <Card key={card.uuid} className="text-sm">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-xs font-mono break-all">
                                                {card.uuid}
                                            </CardTitle>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    window.open(
                                                        `/card/${card.uuid}`,
                                                        '_blank'
                                                    )
                                                }
                                                className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700"
                                            >
                                                <Eye className="h-3 w-3" />
                                                <span>View</span>
                                            </Button>
                                        </div>
                                        {card.contactInfo?.name && (
                                            <p className="text-sm font-medium text-gray-900">
                                                {card.contactInfo.name}
                                            </p>
                                        )}
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        {card.contactInfo?.title && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-500">
                                                    Title:
                                                </span>
                                                <span className="text-xs font-medium">
                                                    {card.contactInfo.title}
                                                </span>
                                            </div>
                                        )}
                                        {card.contactInfo?.company && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-500">
                                                    Company:
                                                </span>
                                                <span className="text-xs font-medium">
                                                    {card.contactInfo.company}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-500">
                                                Claimed:
                                            </span>
                                            <span className="text-xs">
                                                {new Date(
                                                    card.claimedAt
                                                ).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="pt-2 flex space-x-2">
                                            <Link
                                                href={`/card/${card.uuid}`}
                                                target="_blank"
                                            >
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1 flex items-center justify-center space-x-2 text-xs h-8"
                                                >
                                                    <Eye className="h-3 w-3" />
                                                    <span>View</span>
                                                </Button>
                                            </Link>
                                            <Link
                                                href={`/card/${card.uuid}/edit`}
                                            >
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700"
                                                >
                                                    <Edit className="h-3 w-3" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
