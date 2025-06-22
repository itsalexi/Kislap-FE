'use client';

import React from 'react';
import { Field, ErrorMessage } from 'formik';
import { Input } from '../ui/input';

export default function ContactInfoForm() {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Name
                    </label>
                    <Field
                        as={Input}
                        name="contactInfo.name"
                        placeholder="Your full name"
                    />
                    <ErrorMessage
                        name="contactInfo.name"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                    />
                </div>
                <div>
                    <label
                        htmlFor="title"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Job Title
                    </label>
                    <Field
                        as={Input}
                        name="contactInfo.title"
                        placeholder="e.g., Software Engineer"
                    />
                    <ErrorMessage
                        name="contactInfo.title"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                    />
                </div>
                <div>
                    <label
                        htmlFor="company"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Company
                    </label>
                    <Field
                        as={Input}
                        name="contactInfo.company"
                        placeholder="e.g., Tech Corp"
                    />
                    <ErrorMessage
                        name="contactInfo.company"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                    />
                </div>
                <div>
                    <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Email
                    </label>
                    <Field
                        as={Input}
                        name="contactInfo.email"
                        placeholder="your.email@example.com"
                    />
                    <ErrorMessage
                        name="contactInfo.email"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                    />
                </div>
                <div>
                    <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Phone
                    </label>
                    <Field
                        as={Input}
                        name="contactInfo.phone"
                        placeholder="+1234567890"
                    />
                    <ErrorMessage
                        name="contactInfo.phone"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                    />
                </div>
                <div>
                    <label
                        htmlFor="website"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Website
                    </label>
                    <Field
                        as={Input}
                        name="contactInfo.website"
                        placeholder="https://yourwebsite.com"
                    />
                    <ErrorMessage
                        name="contactInfo.website"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                    />
                </div>
                <div className="sm:col-span-2">
                    <label
                        htmlFor="address"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Address
                    </label>
                    <Field
                        as={Input}
                        name="contactInfo.address"
                        placeholder="123 Main St, City, State"
                    />
                    <ErrorMessage
                        name="contactInfo.address"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                    />
                </div>
            </div>
        </div>
    );
}
