'use client';

import React, { useState } from 'react';
import { Field, FieldArray, ErrorMessage } from 'formik';
import { SOCIAL_PLATFORMS, renderSocialIcon } from '../../lib/socialIcons.js';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
    Plus,
    Trash2,
    GripVertical,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';

// Custom dropdown component for platform selection
const PlatformDropdown = ({ field, form, ...props }) => {
    const { name, value, onBlur } = field;
    const { errors, touched } = form;
    const error = errors.socialLinks?.[name.split('.')[1]]?.platform;
    const isTouched = touched.socialLinks?.[name.split('.')[1]]?.platform;

    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const selectedPlatform = SOCIAL_PLATFORMS.find((p) => p.value === value);
    const filteredPlatforms = SOCIAL_PLATFORMS.filter((p) =>
        p.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="relative">
            <div
                className={`flex items-center justify-between w-full px-3 py-2 border rounded-md cursor-pointer ${
                    error && isTouched ? 'border-red-500' : 'border-gray-300'
                } hover:border-gray-400 focus:border-blue-500 focus:outline-none`}
                onClick={() => setIsOpen(!isOpen)}
                onBlur={onBlur}
            >
                <div className="flex items-center space-x-2">
                    {selectedPlatform ? (
                        <>
                            {renderSocialIcon(selectedPlatform.value, {
                                className: 'h-4 w-4',
                            })}
                            <span>{selectedPlatform.label}</span>
                        </>
                    ) : (
                        <span className="text-gray-500">
                            Select platform...
                        </span>
                    )}
                </div>
                <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                        isOpen ? 'rotate-180' : ''
                    }`}
                />
            </div>

            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    <div className="p-2 border-b">
                        <input
                            type="text"
                            placeholder="Search platforms..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                    <div className="py-1">
                        {filteredPlatforms.map((platform) => (
                            <div
                                key={platform.value}
                                className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => {
                                    form.setFieldValue(name, platform.value);
                                    setIsOpen(false);
                                    setSearchTerm('');
                                }}
                            >
                                {renderSocialIcon(platform.value, {
                                    className: 'h-4 w-4',
                                })}
                                <span className="text-sm">
                                    {platform.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default function SocialLinksForm({
    values,
    setFieldValue,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
}) {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Social Links</h2>
                <span className="text-sm text-gray-500">
                    ({values.socialLinks.length} / 5)
                </span>
            </div>

            <FieldArray name="socialLinks">
                {({ push, remove, move }) => {
                    try {
                        return (
                            <div className="space-y-4">
                                {values.socialLinks
                                    .filter(
                                        (link) =>
                                            link &&
                                            typeof link === 'object' &&
                                            typeof link.platform === 'string' &&
                                            typeof link.url === 'string'
                                    )
                                    .map((link, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center space-x-2"
                                            draggable
                                            onDragStart={(e) =>
                                                handleDragStart(
                                                    e,
                                                    index,
                                                    'social'
                                                )
                                            }
                                            onDragOver={handleDragOver}
                                            onDrop={(e) =>
                                                handleDrop(
                                                    e,
                                                    index,
                                                    'social',
                                                    values,
                                                    setFieldValue
                                                )
                                            }
                                            onDragEnd={handleDragEnd}
                                        >
                                            <GripVertical className="h-5 w-5 text-gray-400 cursor-grab hidden sm:block" />
                                            <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                <div>
                                                    <Field
                                                        name={`socialLinks.${index}.platform`}
                                                        component={
                                                            PlatformDropdown
                                                        }
                                                    />
                                                    <ErrorMessage
                                                        name={`socialLinks.${index}.platform`}
                                                        component="div"
                                                        className="text-red-500 text-sm mt-1"
                                                        render={(msg) => (
                                                            <div className="text-red-500 text-sm mt-1">
                                                                {typeof msg ===
                                                                'string'
                                                                    ? msg
                                                                    : 'Invalid platform'}
                                                            </div>
                                                        )}
                                                    />
                                                </div>
                                                <div>
                                                    <Field
                                                        name={`socialLinks.${index}.url`}
                                                    >
                                                        {({ field }) => (
                                                            <Input
                                                                {...field}
                                                                placeholder="https://example.com"
                                                                value={
                                                                    typeof field.value ===
                                                                    'string'
                                                                        ? field.value
                                                                        : ''
                                                                }
                                                            />
                                                        )}
                                                    </Field>
                                                    <ErrorMessage
                                                        name={`socialLinks.${index}.url`}
                                                        component="div"
                                                        className="text-red-500 text-sm mt-1"
                                                        render={(msg) => (
                                                            <div className="text-red-500 text-sm mt-1">
                                                                {typeof msg ===
                                                                'string'
                                                                    ? msg
                                                                    : 'Invalid URL'}
                                                            </div>
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <div className="sm:hidden flex flex-col -space-y-1">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            move(
                                                                index,
                                                                index - 1
                                                            )
                                                        }
                                                        disabled={index === 0}
                                                        className="p-1 rounded-md text-gray-400 hover:text-gray-800 disabled:opacity-30"
                                                    >
                                                        <ChevronUp className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            move(
                                                                index,
                                                                index + 1
                                                            )
                                                        }
                                                        disabled={
                                                            index ===
                                                            values.socialLinks
                                                                .length -
                                                                1
                                                        }
                                                        className="p-1 rounded-md text-gray-400 hover:text-gray-800 disabled:opacity-30"
                                                    >
                                                        <ChevronDown className="h-5 w-5" />
                                                    </button>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    onClick={() =>
                                                        remove(index)
                                                    }
                                                    className="text-gray-500 hover:text-red-500"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        push({
                                            platform: '',
                                            url: '',
                                        })
                                    }
                                    disabled={values.socialLinks.length >= 5}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Social Link
                                </Button>
                                <ErrorMessage
                                    name="socialLinks"
                                    component="div"
                                    className="text-red-500 text-sm mt-1"
                                    render={(msg) => (
                                        <div className="text-red-500 text-sm mt-1">
                                            {typeof msg === 'string'
                                                ? msg
                                                : 'Invalid social links'}
                                        </div>
                                    )}
                                />
                            </div>
                        );
                    } catch (error) {
                        console.error('Error rendering socialLinks:', error);
                        return (
                            <div className="text-red-500">
                                Error rendering social links. Please refresh the
                                page.
                            </div>
                        );
                    }
                }}
            </FieldArray>
        </div>
    );
}
