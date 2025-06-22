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
import {
    Plus,
    CreditCard,
    BarChart3,
    Eye,
    Edit,
    PlusCircle,
    Pencil,
    User,
    Image as ImageIcon,
} from 'lucide-react';
import { Input } from '../components/ui/input.jsx';
import { RefreshCw } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorPage, { ErrorTypes } from '../components/ErrorPage';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Image from 'next/image';
import { FileText } from 'lucide-react';

export default function Dashboard() {
    const { user, loading: authLoading } = useAuth();
    const [cards, setCards] = useState([]);
    const [loadingCards, setLoadingCards] = useState(true);
    const [error, setError] = useState(null);
    const [cardUuid, setCardUuid] = useState('');
    const [claiming, setClaiming] = useState(false);
    const [claimUuid, setClaimUuid] = useState('');
    const [claimSuccess, setClaimSuccess] = useState('');
    const [claimError, setClaimError] = useState('');
    const router = useRouter();
    const [stats, setStats] = useState({ claimedCards: 0 });

    useEffect(() => {
        if (!authLoading && user) {
            loadCards();
        } else if (!authLoading && !user) {
            setLoadingCards(false);
        }
    }, [authLoading, user]);

    const loadCards = async () => {
        if (!user) return;
        setLoadingCards(true);
        try {
            const userCards = await getUserCards();
            if (userCards.error) {
                setError(userCards.error);
            } else {
                setCards(userCards);
                setStats({
                    claimedCards: userCards.length,
                });
            }
        } catch (err) {
            setError('Failed to load cards.');
        } finally {
            setLoadingCards(false);
        }
    };

    const handleClaimSubmit = async (e) => {
        e.preventDefault();
        if (!claimUuid.trim()) {
            toast.error('Please enter a card UUID before claiming.');
            return;
        }

        setClaiming(true);
        setClaimError('');
        setClaimSuccess('');

        const promise = () =>
            new Promise(async (resolve, reject) => {
                try {
                    const result = await claimCard(claimUuid.trim());
                    if (result.error) {
                        reject(new Error(result.error));
                    } else {
                        resolve(result);
                    }
                } catch (err) {
                    reject(new Error('An unexpected error occurred.'));
                } finally {
                    setClaiming(false);
                }
            });

        toast.promise(promise, {
            loading: 'Claiming card...',
            success: (data) => {
                setTimeout(() => {
                    router.push(`/onboarding/${claimUuid.trim()}`);
                }, 1000);
                return 'Card claimed! Redirecting to setup...';
            },
            error: (err) => {
                setClaimError(err.message); // Keep state for inline error
                return err.message; // Toast message
            },
        });
    };

    if (authLoading || loadingCards) {
        return <LoadingSpinner />;
    }

    if (!user) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <ErrorPage type={ErrorTypes.AUTH_REQUIRED} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Dashboard
                        </h1>
                        <p className="text-lg text-gray-600 mt-1">
                            Welcome back, {user.name || 'User'}! Manage your
                            cards below.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                            My Cards
                        </h2>
                        {loadingCards ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <CardSkeleton />
                                <CardSkeleton />
                            </div>
                        ) : cards.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {cards.map((card) => (
                                    <DashboardCard
                                        key={card.uuid}
                                        card={card}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 px-6 bg-white rounded-lg border-2 border-dashed">
                                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-lg font-medium text-gray-900">
                                    No cards yet
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Claim your first card to get started.
                                </p>
                            </div>
                        )}
                    </div>
                    <div className="md:col-span-1">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                            Actions
                        </h2>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <PlusCircle className="h-5 w-5" />
                                    <span>Claim a New Card</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <p>
                                        Enter the UUID of a card to claim it and
                                        add it to your collection.
                                    </p>
                                    <form
                                        onSubmit={handleClaimSubmit}
                                        className="flex flex-col sm:flex-row gap-2"
                                    >
                                        <Input
                                            type="text"
                                            value={claimUuid}
                                            onChange={(e) =>
                                                setClaimUuid(e.target.value)
                                            }
                                            placeholder="Enter card UUID"
                                        />
                                        <Button
                                            type="submit"
                                            disabled={claiming}
                                        >
                                            {claiming ? (
                                                <>
                                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                                    Claiming...
                                                </>
                                            ) : (
                                                'Claim Card'
                                            )}
                                        </Button>
                                    </form>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

const DashboardCard = ({ card }) => {
    return (
        <div className="group relative rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
            <Link href={`/card/${card.uuid}`} className="block">
                <div className="h-32 bg-gray-200 relative">
                    {card.bannerPicture ? (
                        <Image
                            src={card.bannerPicture}
                            alt={`${card.contactInfo?.name}'s banner`}
                            fill
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="h-8 w-8 text-gray-400" />
                        </div>
                    )}
                </div>
                <div className="p-4 bg-white">
                    <div className="relative">
                        <div className="absolute -top-16 left-1/2 -translate-x-1/2">
                            <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-200 flex items-center justify-center">
                                {card.profilePicture ? (
                                    <Image
                                        src={card.profilePicture}
                                        alt={`${card.contactInfo?.name}'s profile`}
                                        width={96}
                                        height={96}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <User className="h-12 w-12 text-gray-400" />
                                )}
                            </div>
                        </div>
                        <div className="pt-10 text-center">
                            <h3 className="text-xl font-bold text-gray-800 truncate">
                                {card.contactInfo?.name || 'Unnamed Card'}
                            </h3>
                            <p className="text-sm text-gray-500 truncate">
                                {card.contactInfo?.title || 'No title provided'}
                            </p>
                        </div>
                    </div>
                </div>
            </Link>
            <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Link href={`/card/${card.uuid}/edit`}>
                    <Button
                        size="sm"
                        className="bg-black/60 hover:bg-black/90 text-white"
                    >
                        <Pencil className="h-4 w-4 mr-1" />
                        Edit
                    </Button>
                </Link>
            </div>
        </div>
    );
};

const CardSkeleton = () => (
    <div className="rounded-lg shadow-lg overflow-hidden bg-white">
        <div className="h-32 bg-gray-200 animate-pulse"></div>
        <div className="p-4">
            <div className="relative">
                <div className="absolute -top-16 left-1/2 -translate-x-1/2">
                    <div className="w-24 h-24 rounded-full border-4 border-white shadow-md bg-gray-300 animate-pulse"></div>
                </div>
                <div className="pt-10 text-center space-y-2">
                    <div className="h-6 w-3/4 bg-gray-300 animate-pulse mx-auto rounded"></div>
                    <div className="h-4 w-1/2 bg-gray-300 animate-pulse mx-auto rounded"></div>
                </div>
            </div>
        </div>
    </div>
);
