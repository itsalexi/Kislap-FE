'use client';

import React from 'react';
import { Field, FieldArray, ErrorMessage } from 'formik';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
    Plus,
    Trash2,
    GripVertical,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';

export default function OtherLinksForm({
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
                <h2 className="text-lg font-semibold">Other Links</h2>
            </div>

            <FieldArray name="otherLinks">
                {({ push, remove, move }) => {
                    try {
                        return (
                            <div className="space-y-4">
                                {values.otherLinks
                                    .filter(
                                        (link) =>
                                            link &&
                                            typeof link === 'object' &&
                                            typeof link.title === 'string' &&
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
                                                    'other'
                                                )
                                            }
                                            onDragOver={handleDragOver}
                                            onDrop={(e) =>
                                                handleDrop(
                                                    e,
                                                    index,
                                                    'other',
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
                                                        as={Input}
                                                        name={`otherLinks.${index}.title`}
                                                        placeholder="Link title (e.g., My Portfolio)"
                                                    />
                                                    <ErrorMessage
                                                        name={`otherLinks.${index}.title`}
                                                        component="div"
                                                        className="text-red-500 text-sm mt-1"
                                                        render={(msg) => (
                                                            <div className="text-red-500 text-sm mt-1">
                                                                {typeof msg ===
                                                                'string'
                                                                    ? msg
                                                                    : 'Invalid title'}
                                                            </div>
                                                        )}
                                                    />
                                                </div>
                                                <div>
                                                    <Field
                                                        name={`otherLinks.${index}.url`}
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
                                                        name={`otherLinks.${index}.url`}
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
                                                            values.otherLinks
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
                                            title: '',
                                            url: '',
                                        })
                                    }
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Link
                                </Button>
                                <ErrorMessage
                                    name="otherLinks"
                                    component="div"
                                    className="text-red-500 text-sm mt-1"
                                    render={(msg) => (
                                        <div className="text-red-500 text-sm mt-1">
                                            {typeof msg === 'string'
                                                ? msg
                                                : 'Invalid links'}
                                        </div>
                                    )}
                                />
                            </div>
                        );
                    } catch (error) {
                        console.error('Error rendering otherLinks:', error);
                        return (
                            <div className="text-red-500">
                                Error rendering links. Please refresh the page.
                            </div>
                        );
                    }
                }}
            </FieldArray>
        </div>
    );
}
