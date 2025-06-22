'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
import {
    getAdminStats,
    getAdminCards,
    getAdminUsers,
    createAdminCards,
    deleteAdminCard,
} from '../actions/admin';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorPage, { ErrorTypes } from '../components/ErrorPage';
import {
    Users,
    CreditCard,
    BarChart3,
    Plus,
    Trash2,
    Eye,
    Filter,
    RefreshCw,
    Shield,
} from 'lucide-react';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '../components/ui/avatar.jsx';

export default function AdminDashboard() {
    const { user, loading: authLoading } = useAuth();
    const [stats, setStats] = useState(null);
    const [allCards, setAllCards] = useState([]);
    const [filteredCards, setFilteredCards] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cardsLoading, setCardsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('stats');
    const [cardCount, setCardCount] = useState(10);
    const [cardPage, setCardPage] = useState(1);
    const [userPage, setUserPage] = useState(1);
    const [cardFilter, setCardFilter] = useState('all'); // all, claimed, unclaimed
    const [creatingCards, setCreatingCards] = useState(false);
    const [deletingCard, setDeletingCard] = useState(null);

    useEffect(() => {
        if (!authLoading && user) {
            loadData();
        } else if (!authLoading && !user) {
            setLoading(false);
        }
    }, [authLoading, user]);

    const loadData = async (isCardFilter = false) => {
        try {
            if (isCardFilter) {
                setCardsLoading(true);
            } else {
                setLoading(true);
            }
            setError(null);

            const [statsData, cardsData, usersData] = await Promise.all([
                getAdminStats(),
                getAdminCards(cardPage, 100), // Get more cards, no filtering
                getAdminUsers(userPage, 20),
            ]);

            // Handle stats data structure
            if (statsData.stats) {
                setStats(statsData.stats);
            } else if (statsData.totalCards !== undefined) {
                // If statsData is the stats object directly
                setStats(statsData);
            } else {
                console.error('Unexpected stats data structure:', statsData);
                setError('Invalid stats data received');
                return;
            }

            const cards = cardsData.cards || cardsData;
            setAllCards(cards);
            setUsers(usersData.users || usersData);

            // Apply frontend filtering
            applyCardFilter(cards, cardFilter);
        } catch (err) {
            if (err.message === 'Admin access required') {
                setError(
                    'You do not have admin privileges to access this page.'
                );
            } else {
                setError(err.message);
            }
        } finally {
            if (isCardFilter) {
                setCardsLoading(false);
            } else {
                setLoading(false);
            }
        }
    };

    const handleCreateCards = async () => {
        try {
            setCreatingCards(true);
            setError(null);

            await createAdminCards(parseInt(cardCount));
            await loadData(true); // Refresh cards with card loading state
            setCardCount(10);
        } catch (err) {
            setError(err.message);
        } finally {
            setCreatingCards(false);
        }
    };

    const handleDeleteCard = async (uuid) => {
        if (
            !confirm(
                'Are you sure you want to delete this card? This action cannot be undone.'
            )
        ) {
            return;
        }

        try {
            setDeletingCard(uuid);
            setError(null);

            await deleteAdminCard(uuid);
            await loadData(true); // Refresh cards with card loading state
        } catch (err) {
            setError(err.message);
        } finally {
            setDeletingCard(null);
        }
    };

    const applyCardFilter = (cards, filter) => {
        let filtered;
        switch (filter) {
            case 'claimed':
                filtered = cards.filter((card) => card.isClaimed);
                break;
            case 'unclaimed':
                filtered = cards.filter((card) => !card.isClaimed);
                break;
            default: // 'all'
                filtered = cards;
                break;
        }
        setFilteredCards(filtered);
    };

    const handleCardFilterChange = (filter) => {
        setCardFilter(filter);
        setCardPage(1);
        // Apply filter to existing cards without making API call
        applyCardFilter(allCards, filter);
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

    // Check if user has admin role
    if (user.role !== 'ADMIN') {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <ErrorPage type={ErrorTypes.ADMIN_REQUIRED} />
            </div>
        );
    }

    // Show error for other admin-related issues
    if (error && error.includes('admin privileges')) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <ErrorPage type={ErrorTypes.ADMIN_REQUIRED} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        Admin Dashboard
                    </h1>
                    <p className="text-gray-600 mt-2 text-sm sm:text-base">
                        Manage cards, users, and platform statistics
                    </p>
                    <div className="mt-2 flex items-center space-x-2 text-xs sm:text-sm text-gray-500">
                        <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="truncate">
                            Logged in as: {user.name} ({user.email}) -{' '}
                            {user.role}
                        </span>
                    </div>
                </div>

                {error && (
                    <Alert className="mb-6">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Navigation Tabs */}
                <div className="flex flex-wrap gap-1 bg-white p-1 rounded-lg shadow-sm mb-6">
                    <Button
                        variant={activeTab === 'stats' ? 'default' : 'ghost'}
                        onClick={() => setActiveTab('stats')}
                        className="flex items-center space-x-2 text-xs sm:text-sm"
                    >
                        <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>Statistics</span>
                    </Button>
                    <Button
                        variant={activeTab === 'cards' ? 'default' : 'ghost'}
                        onClick={() => setActiveTab('cards')}
                        className="flex items-center space-x-2 text-xs sm:text-sm"
                    >
                        <CreditCard className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>Cards</span>
                    </Button>
                    <Button
                        variant={activeTab === 'users' ? 'default' : 'ghost'}
                        onClick={() => setActiveTab('users')}
                        className="flex items-center space-x-2 text-xs sm:text-sm"
                    >
                        <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>Users</span>
                    </Button>
                </div>

                {/* Statistics Tab */}
                {activeTab === 'stats' && stats && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-xs sm:text-sm font-medium">
                                    Total Cards
                                </CardTitle>
                                <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-lg sm:text-2xl font-bold">
                                    {stats.totalCards}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-xs sm:text-sm font-medium">
                                    Claimed
                                </CardTitle>
                                <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-lg sm:text-2xl font-bold text-green-600">
                                    {stats.claimedCards}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-xs sm:text-sm font-medium">
                                    Unclaimed
                                </CardTitle>
                                <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-lg sm:text-2xl font-bold text-orange-600">
                                    {stats.unclaimedCards}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="col-span-2 md:col-span-1">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-xs sm:text-sm font-medium">
                                    Total Users
                                </CardTitle>
                                <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-lg sm:text-2xl font-bold">
                                    {stats.totalUsers}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="col-span-2 md:col-span-1">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-xs sm:text-sm font-medium">
                                    Claim Rate
                                </CardTitle>
                                <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-lg sm:text-2xl font-bold">
                                    {typeof stats.claimRate === 'number'
                                        ? stats.claimRate.toFixed(1)
                                        : stats.claimRate || '0.0'}
                                    %
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Cards Tab */}
                {activeTab === 'cards' && (
                    <div className="space-y-6">
                        {/* Create Cards Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Plus className="h-5 w-5" />
                                    <span>Create New Cards</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center space-x-4">
                                    <Input
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={cardCount}
                                        onChange={(e) =>
                                            setCardCount(e.target.value)
                                        }
                                        placeholder="Number of cards"
                                        className="w-32"
                                    />
                                    <Button
                                        onClick={handleCreateCards}
                                        disabled={creatingCards}
                                        className="flex items-center space-x-2"
                                    >
                                        {creatingCards ? (
                                            <RefreshCw className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Plus className="h-4 w-4" />
                                        )}
                                        <span>
                                            {creatingCards
                                                ? 'Creating...'
                                                : 'Create Cards'}
                                        </span>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Cards Filter */}
                        <div className="flex items-center space-x-4">
                            <Filter className="h-4 w-4 text-gray-500" />
                            <Button
                                variant={
                                    cardFilter === 'all' ? 'default' : 'outline'
                                }
                                onClick={() => handleCardFilterChange('all')}
                            >
                                All Cards
                            </Button>
                            <Button
                                variant={
                                    cardFilter === 'claimed'
                                        ? 'default'
                                        : 'outline'
                                }
                                onClick={() =>
                                    handleCardFilterChange('claimed')
                                }
                            >
                                Claimed
                            </Button>
                            <Button
                                variant={
                                    cardFilter === 'unclaimed'
                                        ? 'default'
                                        : 'outline'
                                }
                                onClick={() =>
                                    handleCardFilterChange('unclaimed')
                                }
                            >
                                Unclaimed
                            </Button>
                        </div>

                        {/* Cards List */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                            {cardsLoading ? (
                                <div className="col-span-full flex justify-center py-8">
                                    <LoadingSpinner />
                                </div>
                            ) : (
                                filteredCards.map((card) => (
                                    <Card key={card.uuid} className="text-sm">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-xs font-mono break-all">
                                                {card.uuid}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-500">
                                                    Status:
                                                </span>
                                                <span
                                                    className={`text-xs font-medium ${
                                                        card.isClaimed
                                                            ? 'text-green-600'
                                                            : 'text-orange-600'
                                                    }`}
                                                >
                                                    {card.isClaimed
                                                        ? 'Claimed'
                                                        : 'Unclaimed'}
                                                </span>
                                            </div>

                                            {card.owner && (
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-gray-500">
                                                        Owner:
                                                    </span>
                                                    <span className="text-xs font-medium truncate">
                                                        {card.owner.name}
                                                    </span>
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-500">
                                                    Created:
                                                </span>
                                                <span className="text-xs">
                                                    {new Date(
                                                        card.createdAt
                                                    ).toLocaleDateString()}
                                                </span>
                                            </div>

                                            <div className="flex space-x-2 pt-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        window.open(
                                                            `/card/${card.uuid}`,
                                                            '_blank'
                                                        )
                                                    }
                                                    className="flex items-center space-x-1 text-xs h-7 px-2"
                                                >
                                                    <Eye className="h-3 w-3" />
                                                    <span>View</span>
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleDeleteCard(
                                                            card.uuid
                                                        )
                                                    }
                                                    disabled={
                                                        deletingCard ===
                                                        card.uuid
                                                    }
                                                    className="flex items-center space-x-1 text-red-600 hover:text-red-700 text-xs h-7 px-2"
                                                >
                                                    {deletingCard ===
                                                    card.uuid ? (
                                                        <RefreshCw className="h-3 w-3 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="h-3 w-3" />
                                                    )}
                                                    <span>Delete</span>
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                            {users.map((user) => (
                                <Card key={user.id} className="text-sm">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center space-x-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage
                                                    src={user.picture}
                                                    alt={user.name}
                                                />
                                                <AvatarFallback className="text-xs">
                                                    {user.name?.charAt(0) ||
                                                        'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <CardTitle className="text-xs font-medium truncate">
                                                    {user.name}
                                                </CardTitle>
                                                <p className="text-xs text-gray-500 truncate">
                                                    {user.email}
                                                </p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-500">
                                                Role:
                                            </span>
                                            <span
                                                className={`text-xs font-medium px-2 py-1 rounded-full ${
                                                    user.role === 'ADMIN'
                                                        ? 'bg-purple-100 text-purple-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}
                                            >
                                                {user.role}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-500">
                                                Cards:
                                            </span>
                                            <span className="text-xs font-medium">
                                                {user._count?.claimedCards || 0}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-500">
                                                Joined:
                                            </span>
                                            <span className="text-xs">
                                                {new Date(
                                                    user.createdAt
                                                ).toLocaleDateString()}
                                            </span>
                                        </div>

                                        {user.claimedCards &&
                                            user.claimedCards.length > 0 && (
                                                <div className="pt-2">
                                                    <span className="text-xs text-gray-500">
                                                        Claimed Cards:
                                                    </span>
                                                    <div className="mt-1 space-y-1">
                                                        {user.claimedCards
                                                            .slice(0, 3)
                                                            .map((card) => (
                                                                <div
                                                                    key={
                                                                        card.uuid
                                                                    }
                                                                    className="flex items-center justify-between"
                                                                >
                                                                    <span className="text-xs font-mono truncate flex-1 mr-2">
                                                                        {
                                                                            card.uuid
                                                                        }
                                                                    </span>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() =>
                                                                            window.open(
                                                                                `/card/${card.uuid}`,
                                                                                '_blank'
                                                                            )
                                                                        }
                                                                        className="h-6 px-2 flex-shrink-0"
                                                                    >
                                                                        <Eye className="h-3 w-3" />
                                                                    </Button>
                                                                </div>
                                                            ))}
                                                        {user.claimedCards
                                                            .length > 3 && (
                                                            <div className="text-xs text-gray-500 text-center">
                                                                +
                                                                {user
                                                                    .claimedCards
                                                                    .length -
                                                                    3}{' '}
                                                                more
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
