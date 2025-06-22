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
    Search,
    Menu,
    X,
} from 'lucide-react';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '../components/ui/avatar.jsx';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../components/ui/table.jsx';
import Link from 'next/link.js';
import {
    Home,
    Settings,
    ChevronLeft,
    ChevronRight,
    Copy,
    MoreHorizontal,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Badge } from '../components/ui/badge';

const Sidebar = ({ activeTab, setActiveTab, isOpen, setIsOpen }) => {
    const navItems = [
        { id: 'stats', label: 'Dashboard', icon: BarChart3 },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'cards', label: 'Cards', icon: CreditCard },
    ];

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex h-16 items-center justify-between border-b px-6">
                    <Link
                        href="/admin"
                        className="flex items-center gap-2 font-semibold"
                    >
                        <Shield className="h-6 w-6" />
                        <span className="hidden sm:inline">Admin Panel</span>
                        <span className="sm:hidden">Admin</span>
                    </Link>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="lg:hidden p-2 hover:bg-gray-100 rounded-md"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <nav className="flex-1 space-y-2 p-4">
                    {navItems.map((item) => (
                        <Button
                            key={item.id}
                            variant={
                                activeTab === item.id ? 'secondary' : 'ghost'
                            }
                            className="w-full justify-start"
                            onClick={() => {
                                setActiveTab(item.id);
                                setIsOpen(false); // Close sidebar on mobile after selection
                            }}
                        >
                            <item.icon className="mr-2 h-4 w-4" />
                            {item.label}
                        </Button>
                    ))}
                </nav>
            </aside>
        </>
    );
};

export default function AdminDashboard() {
    const { user, loading: authLoading } = useAuth();
    const [stats, setStats] = useState(null);
    const [allCards, setAllCards] = useState([]);
    const [filteredCards, setFilteredCards] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('stats');
    const [cardCount, setCardCount] = useState(10);
    const [cardFilter, setCardFilter] = useState('all'); // all, claimed, unclaimed
    const [cardSearch, setCardSearch] = useState('');
    const [userSearch, setUserSearch] = useState('');
    const [creatingCards, setCreatingCards] = useState(false);
    const [deletingCard, setDeletingCard] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (!authLoading && user) {
            loadData();
        } else if (!authLoading && !user) {
            setLoading(false);
        }
    }, [authLoading, user]);

    useEffect(() => {
        // Apply client-side filtering for cards
        applyCardFilter();
    }, [allCards, cardFilter, cardSearch]);

    useEffect(() => {
        // Apply client-side filtering for users
        applyUserFilter();
    }, [allUsers, userSearch]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [statsData, cardsData, usersData] = await Promise.all([
                getAdminStats(),
                getAdminCards(1, 1000), // Get all cards for client-side filtering
                getAdminUsers(1, 1000), // Get all users for client-side filtering
            ]);

            setStats(statsData.stats || statsData);
            setAllCards(cardsData.cards || cardsData);
            setAllUsers(usersData.users || usersData);
        } catch (err) {
            handleError(err);
        } finally {
            setLoading(false);
        }
    };

    const applyCardFilter = () => {
        let filtered = [...allCards];

        // Apply status filter
        if (cardFilter === 'claimed') {
            filtered = filtered.filter((card) => card.isClaimed);
        } else if (cardFilter === 'unclaimed') {
            filtered = filtered.filter((card) => !card.isClaimed);
        }

        // Apply search filter
        if (cardSearch) {
            const searchLower = cardSearch.toLowerCase();
            filtered = filtered.filter(
                (card) =>
                    card.uuid.toLowerCase().includes(searchLower) ||
                    (card.owner?.name &&
                        card.owner.name.toLowerCase().includes(searchLower)) ||
                    (card.owner?.email &&
                        card.owner.email.toLowerCase().includes(searchLower))
            );
        }

        setFilteredCards(filtered);
    };

    const applyUserFilter = () => {
        let filtered = [...allUsers];

        // Apply search filter
        if (userSearch) {
            const searchLower = userSearch.toLowerCase();
            filtered = filtered.filter(
                (user) =>
                    user.name.toLowerCase().includes(searchLower) ||
                    user.email.toLowerCase().includes(searchLower)
            );
        }

        setFilteredUsers(filtered);
    };

    const handleError = (err) => {
        if (err.message === 'Admin access required') {
            setError('You do not have admin privileges to access this page.');
        } else {
            setError(err.message);
        }
    };

    const handleCreateCards = async () => {
        try {
            setCreatingCards(true);
            setError(null);

            await createAdminCards(parseInt(cardCount));
            await loadData(); // Refresh all data
            setCardCount(10);
            toast.success('Cards created successfully!');
        } catch (err) {
            setError(err.message);
            toast.error(err.message);
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
            await loadData(); // Refresh all data
            toast.success('Card deleted successfully.');
        } catch (err) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setDeletingCard(null);
        }
    };

    const handleCardFilterChange = (filter) => {
        setCardFilter(filter);
    };

    const handleCardSearchChange = (search) => {
        setCardSearch(search);
    };

    const handleUserSearchChange = (search) => {
        setUserSearch(search);
    };

    if (authLoading || loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <ErrorPage message={error} />;
    }

    if (!user) {
        return <ErrorPage message="Please log in to access the admin panel." />;
    }

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isOpen={sidebarOpen}
                setIsOpen={setSidebarOpen}
            />

            <main className="flex-1 overflow-y-auto">
                {/* Mobile header */}
                <div className="lg:hidden bg-white border-b px-4 py-3 flex items-center justify-between">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 hover:bg-gray-100 rounded-md"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                    <h1 className="text-lg font-semibold">Admin Dashboard</h1>
                    <div className="w-10"></div> {/* Spacer for centering */}
                </div>

                <div className="p-4 lg:p-6">
                    {activeTab === 'stats' && <AdminStats stats={stats} />}
                    {activeTab === 'cards' && (
                        <AdminCards
                            filteredCards={filteredCards}
                            cardFilter={cardFilter}
                            handleCardFilterChange={handleCardFilterChange}
                            cardSearch={cardSearch}
                            handleCardSearchChange={handleCardSearchChange}
                            cardCount={cardCount}
                            setCardCount={setCardCount}
                            creatingCards={creatingCards}
                            handleCreateCards={handleCreateCards}
                            deletingCard={deletingCard}
                            handleDeleteCard={handleDeleteCard}
                        />
                    )}
                    {activeTab === 'users' && (
                        <AdminUsers
                            filteredUsers={filteredUsers}
                            userSearch={userSearch}
                            handleUserSearchChange={handleUserSearchChange}
                        />
                    )}
                </div>
            </main>
        </div>
    );
}

const AdminStats = ({ stats }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    Total Cards
                </CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                    {stats?.totalCards || 0}
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    Claimed Cards
                </CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                    {stats?.claimedCards || 0}
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    Total Users
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                    {stats?.totalUsers || 0}
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    Claim Rate
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                    {stats?.claimRate
                        ? `${Number(stats.claimRate).toFixed(1)}%`
                        : '0%'}
                </div>
            </CardContent>
        </Card>
    </div>
);

const AdminCards = ({
    filteredCards,
    cardFilter,
    handleCardFilterChange,
    cardSearch,
    handleCardSearchChange,
    cardCount,
    setCardCount,
    creatingCards,
    handleCreateCards,
    deletingCard,
    handleDeleteCard,
}) => {
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('UUID copied to clipboard!');
    };

    return (
        <div className="space-y-6">
            {/* Card Creation */}
            <Card>
                <CardHeader>
                    <CardTitle>Create New Cards</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <Input
                            type="number"
                            min="1"
                            max="100"
                            value={cardCount}
                            onChange={(e) => setCardCount(e.target.value)}
                            className="w-full sm:w-32"
                        />
                        <Button
                            onClick={handleCreateCards}
                            disabled={creatingCards}
                            className="flex items-center space-x-2 w-full sm:w-auto"
                        >
                            <Plus className="h-4 w-4" />
                            <span>
                                {creatingCards ? 'Creating...' : 'Create Cards'}
                            </span>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Card Management */}
            <Card>
                <CardHeader>
                    <CardTitle>Manage Cards</CardTitle>
                    <div className="flex flex-col gap-4 mt-4">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search by UUID or Owner Name/Email..."
                                value={cardSearch}
                                onChange={(e) =>
                                    handleCardSearchChange(e.target.value)
                                }
                                className="pl-10"
                            />
                        </div>
                        <div className="flex items-center space-x-1 rounded-md bg-gray-100 p-1">
                            {['all', 'claimed', 'unclaimed'].map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() =>
                                        handleCardFilterChange(filter)
                                    }
                                    className={`px-3 py-1 text-sm rounded-md transition-colors flex-1 sm:flex-none ${
                                        cardFilter === filter
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    {filter.charAt(0).toUpperCase() +
                                        filter.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredCards.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No cards found matching your criteria.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>UUID</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="hidden sm:table-cell">
                                            Claimed By
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredCards.map((card) => (
                                        <TableRow key={card.uuid}>
                                            <TableCell className="font-mono text-xs sm:text-sm">
                                                <div className="flex items-center space-x-2">
                                                    <span className="truncate max-w-20 sm:max-w-32">
                                                        {card.uuid}
                                                    </span>
                                                    <button
                                                        onClick={() =>
                                                            copyToClipboard(
                                                                card.uuid
                                                            )
                                                        }
                                                        className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                                                    >
                                                        <Copy className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        card.isClaimed
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                    className="text-xs"
                                                >
                                                    {card.isClaimed
                                                        ? 'Claimed'
                                                        : 'Unclaimed'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell">
                                                {card.isClaimed &&
                                                card.owner ? (
                                                    <div className="flex items-center space-x-2">
                                                        <Avatar className="h-6 w-6">
                                                            <AvatarImage
                                                                src={
                                                                    card.owner
                                                                        .picture
                                                                }
                                                            />
                                                            <AvatarFallback>
                                                                {card.owner.name?.charAt(
                                                                    0
                                                                ) || 'U'}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span className="text-sm">
                                                            {card.owner.name}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">
                                                        -
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={`/card/${card.uuid}`}
                                                        className="text-blue-600 hover:text-blue-800"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() =>
                                                            handleDeleteCard(
                                                                card.uuid
                                                            )
                                                        }
                                                        disabled={
                                                            deletingCard ===
                                                            card.uuid
                                                        }
                                                        className="text-red-600 hover:text-red-800 disabled:opacity-50"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                    <div className="mt-4 text-sm text-gray-600">
                        Showing {filteredCards.length} of {filteredCards.length}{' '}
                        cards
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

const AdminUsers = ({ filteredUsers, userSearch, handleUserSearchChange }) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Manage Users</CardTitle>
                <div className="mt-4">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search by name or email..."
                            value={userSearch}
                            onChange={(e) =>
                                handleUserSearchChange(e.target.value)
                            }
                            className="pl-10"
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {filteredUsers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No users found matching your criteria.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead className="hidden sm:table-cell">
                                        Joined
                                    </TableHead>
                                    <TableHead>Cards</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="flex items-center space-x-3">
                                            <Avatar>
                                                <AvatarImage
                                                    src={user.picture}
                                                />
                                                <AvatarFallback>
                                                    {user.name?.charAt(0) ||
                                                        'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium truncate">
                                                    {user.name}
                                                </p>
                                                <p className="text-sm text-muted-foreground truncate">
                                                    {user.email}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    user.role === 'ADMIN'
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                                className="text-xs"
                                            >
                                                {user.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell">
                                            {new Date(
                                                user.createdAt
                                            ).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            {user._count?.claimedCards || 0}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
                <div className="mt-4 text-sm text-gray-600">
                    Showing {filteredUsers.length} of {filteredUsers.length}{' '}
                    users
                </div>
            </CardContent>
        </Card>
    );
};
