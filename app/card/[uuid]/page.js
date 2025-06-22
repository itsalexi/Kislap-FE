'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import { getCardByUuid, claimCard } from '../../lib/cards.js';
import {
    getSocialIcon,
    getPlatformData,
    getContactIcon,
    renderSocialIcon,
} from '../../lib/socialIcons.js';
import { useAuth } from '../../components/AuthProvider.js';
import LoadingSpinner from '../../components/LoadingSpinner.js';
import ErrorPage, { ErrorTypes } from '../../components/ErrorPage';
import { Button } from '../../components/ui/button';
import { CreditCard, RefreshCw, ExternalLink, UserPlus } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import CardView from '../../components/CardView.js';

export default function CardPage({ params }) {
    const { uuid } = use(params);
    const { user, loading: authLoading, login } = useAuth();
    const [cardData, setCardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [claiming, setClaiming] = useState(false);
    const [fullCardData, setFullCardData] = useState(null);

    useEffect(() => {
        loadCard();
    }, [uuid]);

    const loadCard = async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await getCardByUuid(uuid);

            if (result.error) {
                setError(result.error);
            } else {
                setCardData(result);
                if (result.claimed) {
                    setFullCardData(result.card);
                }
            }
        } catch (err) {
            setError('Failed to load card');
        } finally {
            setLoading(false);
        }
    };

    const handleClaim = async (cardUuid) => {
        if (!user) {
            setError('Please log in to claim this card');
            return;
        }

        try {
            setClaiming(true);
            const result = await claimCard(cardUuid);
            if (result.error) {
                setError(result.error);
            } else {
                await loadCard();
            }
        } catch (err) {
            setError('Failed to claim card');
        } finally {
            setClaiming(false);
        }
    };

    const generateVCard = () => {
        if (!fullCardData || !fullCardData.contactInfo) {
            return;
        }

        const contact = fullCardData.contactInfo;
        const socialLinks = fullCardData.socialLinks || [];
        const otherLinks = fullCardData.otherLinks || [];

        // Build vCard content
        let vcard = 'BEGIN:VCARD\n';
        vcard += 'VERSION:3.0\n';

        // Name
        if (contact.name) {
            vcard += `FN:${contact.name}\n`;
            vcard += `N:${contact.name};;;;\n`;
        }

        // Title and organization
        if (contact.title || contact.company) {
            vcard += `TITLE:${contact.title || ''}\n`;
            vcard += `ORG:${contact.company || ''}\n`;
        }

        // Email
        if (contact.email) {
            vcard += `EMAIL:${contact.email}\n`;
        }

        // Phone
        if (contact.phone) {
            vcard += `TEL:${contact.phone}\n`;
        }

        // Address
        if (contact.address) {
            vcard += `ADR:;;${contact.address};;;;\n`;
        }

        // Website
        if (contact.website) {
            vcard += `URL:${contact.website}\n`;
        }

        // Social media URLs
        socialLinks.forEach((link, index) => {
            if (link.url) {
                vcard += `URL;type=${link.platform || 'social'}:${link.url}\n`;
            }
        });

        // Other links
        otherLinks.forEach((link, index) => {
            if (link.url) {
                vcard += `URL;type=${link.title || 'link'}:${link.url}\n`;
            }
        });

        // Bio as note
        if (fullCardData.bio) {
            vcard += `NOTE:${fullCardData.bio.replace(/\n/g, '\\n')}\n`;
        }

        vcard += 'END:VCARD';

        // Create and download file
        const blob = new Blob([vcard], { type: 'text/vcard' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${contact.name || 'contact'}.vcf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    if (loading || authLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        let errorType = ErrorTypes.GENERIC;
        if (error.includes('not found')) errorType = ErrorTypes.NOT_FOUND;
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-2xl w-full">
                    <ErrorPage
                        type={errorType}
                        message={error}
                        onRetry={loadCard}
                    />
                </div>
            </div>
        );
    }

    if (!cardData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-2xl w-full">
                    <ErrorPage type={ErrorTypes.NOT_FOUND} onRetry={loadCard} />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 sm:py-8">
            <div className="max-w-4xl mx-auto px-0 sm:px-6 lg:px-8">
                <div className="space-y-6 sm:space-y-8">
                    <div className="max-w-2xl mx-auto">
                        {cardData.claimed ? (
                            <CardView cardData={fullCardData} />
                        ) : (
                            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    Unclaimed Card
                                </h2>
                                <p className="text-gray-600 mb-6">
                                    {cardData.message}
                                </p>
                                <div className="border-t pt-4 mt-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500">
                                            Status:
                                        </span>
                                        <span className="text-sm font-medium px-2 py-1 rounded-full bg-orange-100 text-orange-800">
                                            Unclaimed
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    {user && !cardData.claimed && (
                        <div className="flex justify-center">
                            <Button
                                onClick={() => handleClaim(cardData.uuid)}
                                disabled={claiming}
                                className="flex items-center space-x-2"
                            >
                                {claiming ? (
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : (
                                    <CreditCard className="h-4 w-4" />
                                )}
                                <span>
                                    {claiming
                                        ? 'Claiming...'
                                        : 'Claim This Card'}
                                </span>
                            </Button>
                        </div>
                    )}

                    {/* Show Login to Claim button if user is not logged in and card is unclaimed */}
                    {!user && !cardData.claimed && (
                        <div className="flex justify-center">
                            <Button
                                onClick={login}
                                className="flex items-center space-x-2"
                            >
                                <CreditCard className="h-4 w-4" />
                                <span>Log in to Claim Card</span>
                            </Button>
                        </div>
                    )}

                    {/* vCard Export Button - Show for all claimed cards */}
                    {cardData.claimed && fullCardData && (
                        <div className="flex justify-center">
                            <Button
                                onClick={generateVCard}
                                variant="outline"
                                className="flex items-center space-x-2"
                            >
                                <UserPlus className="h-4 w-4" />
                                <span>Add to Contacts</span>
                            </Button>
                        </div>
                    )}

                    {/* Edit Button - Show only for card owner */}
                    {user &&
                        cardData.claimed &&
                        ((fullCardData?.owner?.id &&
                            fullCardData.owner.id === user.id) ||
                            (fullCardData?.ownerId &&
                                fullCardData.ownerId === user.id)) && (
                            <div className="flex justify-center">
                                <Link href={`/card/${uuid}/edit`}>
                                    <Button>Edit Your Card</Button>
                                </Link>
                            </div>
                        )}
                </div>
            </div>
        </div>
    );
}
