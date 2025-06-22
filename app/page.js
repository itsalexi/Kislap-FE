'use client';

import { useAuth } from './components/AuthProvider.js';
import LoadingSpinner from './components/LoadingSpinner.js';
import { useSearchParams } from 'next/navigation';
import { Button } from './components/ui/button.jsx';
import { Alert, AlertDescription } from './components/ui/alert.jsx';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from './components/ui/card.jsx';
import { CreditCard, Shield, BarChart3 } from 'lucide-react';
import { Suspense } from 'react';

function HomeContent() {
    const { user, login, loading } = useAuth();
    const searchParams = useSearchParams();
    const error = searchParams.get('error');

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 mt-4">
                <LoadingSpinner message="Checking authentication..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
                {error && (
                    <Alert className="mb-6">
                        <AlertDescription>
                            Authentication failed. Please try again.
                        </AlertDescription>
                    </Alert>
                )}

                <div className="text-center mb-8 sm:mb-12">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
                        Welcome to <span className="text-blue-600">Kislap</span>
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-6 sm:mb-8">
                        Your digital business card platform. Claim, manage, and
                        share your professional identity with ease.
                    </p>

                    {user ? (
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button size="lg" className="text-base">
                                <a href="/dashboard">Go to Dashboard</a>
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                className="text-base"
                            >
                                <a href="/claim">Claim a Card</a>
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button
                                onClick={login}
                                size="lg"
                                className="text-base"
                            >
                                Get Started
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                className="text-base"
                            >
                                <a href="/claim">View Sample Card</a>
                            </Button>
                        </div>
                    )}
                </div>

                {/* Features Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
                    <Card className="text-center">
                        <CardHeader>
                            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                <CreditCard className="h-6 w-6 text-blue-600" />
                            </div>
                            <CardTitle className="text-lg sm:text-xl">
                                Digital Cards
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm sm:text-base text-gray-600">
                                Create and manage your digital business cards
                                with professional contact information.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="text-center">
                        <CardHeader>
                            <div className="mx-auto w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                                <Shield className="h-6 w-6 text-green-600" />
                            </div>
                            <CardTitle className="text-lg sm:text-xl">
                                Secure Sharing
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm sm:text-base text-gray-600">
                                Share your contact information securely with
                                unique card identifiers.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="text-center">
                        <CardHeader>
                            <div className="mx-auto w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                                <BarChart3 className="h-6 w-6 text-purple-600" />
                            </div>
                            <CardTitle className="text-lg sm:text-xl">
                                Easy Management
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm sm:text-base text-gray-600">
                                Track your claimed cards and manage your
                                professional network efficiently.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* How it Works */}
                <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-6 sm:mb-8">
                        How It Works
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                                1
                            </div>
                            <h3 className="text-lg font-semibold mb-2">
                                Get a Card
                            </h3>
                            <p className="text-sm sm:text-base text-gray-600">
                                Receive a unique card UUID from your
                                organization or administrator.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                                2
                            </div>
                            <h3 className="text-lg font-semibold mb-2">
                                Claim It
                            </h3>
                            <p className="text-sm sm:text-base text-gray-600">
                                Use the card UUID to claim your digital business
                                card on our platform.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                                3
                            </div>
                            <h3 className="text-lg font-semibold mb-2">
                                Share & Connect
                            </h3>
                            <p className="text-sm sm:text-base text-gray-600">
                                Share your card link with others and build your
                                professional network.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Home() {
    return (
        <Suspense fallback={<LoadingSpinner message="Loading..." />}>
            <HomeContent />
        </Suspense>
    );
}
