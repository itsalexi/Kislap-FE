'use client';

import React from 'react';
import {
    getPlatformData,
    getContactIcon,
    renderSocialIcon,
} from '../lib/socialIcons';
import { ExternalLink } from 'lucide-react';

const CardPreview = ({ cardData }) => {
    if (!cardData) {
        return null;
    }

    // Use default values for preview if data is not yet available
    const contactInfo = cardData.contactInfo || {};
    const socialLinks = cardData.socialLinks || [];
    const otherLinks = cardData.otherLinks || [];
    const bio = cardData.bio || '';
    const bannerPicture = cardData.bannerPicture;
    const profilePicture = cardData.profilePicture;

    return (
        <div className="w-full bg-white rounded-lg shadow-md border overflow-hidden">
            {/* Banner Image */}
            {bannerPicture ? (
                <div className="h-32 sm:h-40 bg-gray-200">
                    <img
                        src={bannerPicture}
                        alt="Card Banner"
                        className="w-full h-full object-cover"
                    />
                </div>
            ) : (
                <div className="h-32 sm:h-40 bg-gradient-to-r from-gray-200 to-gray-300"></div>
            )}

            {/* Profile Section */}
            <div className={`px-6 pb-6 ${bannerPicture ? 'relative' : ''}`}>
                {/* Profile Picture */}
                <div
                    className={`flex justify-center mb-4 ${
                        bannerPicture ? '-mt-16' : 'pt-8'
                    }`}
                >
                    <div className="relative">
                        {profilePicture ? (
                            <img
                                src={profilePicture}
                                alt="Profile"
                                className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-lg object-cover"
                            />
                        ) : (
                            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-100 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                                {React.createElement(getContactIcon('user'), {
                                    className:
                                        'h-12 w-12 sm:h-16 sm:w-16 text-gray-400',
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Name and Title */}
                <div className="text-center mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                        {contactInfo.name || 'Your Name'}
                    </h2>
                    {(contactInfo.title || contactInfo.company) && (
                        <p className="text-sm sm:text-base text-gray-600">
                            {contactInfo.title || 'Your Title'}
                            {contactInfo.company &&
                                ` at ${contactInfo.company}`}
                        </p>
                    )}
                </div>

                {/* Bio */}
                {bio && (
                    <div className="mb-6">
                        <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                            {bio}
                        </p>
                    </div>
                )}

                {/* Contact Information */}
                {(contactInfo.email ||
                    contactInfo.phone ||
                    contactInfo.website ||
                    contactInfo.address) && (
                    <div className="space-y-3 mb-6">
                        {contactInfo.email && (
                            <div className="flex items-center space-x-3">
                                {React.createElement(getContactIcon('email'), {
                                    className:
                                        'h-4 w-4 text-gray-400 flex-shrink-0',
                                })}
                                <a
                                    href={`mailto:${contactInfo.email}`}
                                    className="text-sm sm:text-base text-blue-600 hover:text-blue-800 break-all"
                                >
                                    {contactInfo.email}
                                </a>
                            </div>
                        )}
                        {contactInfo.phone && (
                            <div className="flex items-center space-x-3">
                                {React.createElement(getContactIcon('phone'), {
                                    className:
                                        'h-4 w-4 text-gray-400 flex-shrink-0',
                                })}
                                <a
                                    href={`tel:${contactInfo.phone}`}
                                    className="text-sm sm:text-base text-blue-600 hover:text-blue-800"
                                >
                                    {contactInfo.phone}
                                </a>
                            </div>
                        )}
                        {contactInfo.website && (
                            <div className="flex items-center space-x-3">
                                {React.createElement(
                                    getContactIcon('website'),
                                    {
                                        className:
                                            'h-4 w-4 text-gray-400 flex-shrink-0',
                                    }
                                )}
                                <a
                                    href={contactInfo.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm sm:text-base text-blue-600 hover:text-blue-800 break-all"
                                >
                                    {contactInfo.website}
                                </a>
                            </div>
                        )}
                        {contactInfo.address && (
                            <div className="flex items-start space-x-3">
                                {React.createElement(
                                    getContactIcon('address'),
                                    {
                                        className:
                                            'h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5',
                                    }
                                )}
                                <p className="text-sm sm:text-base text-gray-700">
                                    {contactInfo.address}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Social Links */}
                {socialLinks.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">
                            Social Links
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {socialLinks.map((link, index) => {
                                if (!link.platform) return null;
                                const platformData = getPlatformData(
                                    link.platform
                                );
                                return (
                                    <a
                                        key={index}
                                        href={link.url || '#'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors border hover:shadow-md h-8 px-3"
                                        style={{
                                            backgroundColor: platformData.color,
                                            borderColor: platformData.color,
                                            color: 'white',
                                        }}
                                    >
                                        {renderSocialIcon(link.platform, {
                                            className: 'h-4 w-4',
                                        })}
                                        {platformData.label}
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Other Links */}
                {otherLinks.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">
                            Links
                        </h3>
                        <div className="space-y-2">
                            {otherLinks
                                .filter(
                                    (link) =>
                                        link &&
                                        typeof link === 'object' &&
                                        typeof link.title === 'string' &&
                                        typeof link.url === 'string'
                                )
                                .map((link, index) => (
                                    <a
                                        key={index}
                                        href={link.url || '#'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 h-8 px-3 w-full"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                        {link.title || 'Link Title'}
                                    </a>
                                ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CardPreview;
