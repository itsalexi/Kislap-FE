'use client';

import React from 'react';
import { Field, ErrorMessage } from 'formik';

export default function BioForm() {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold mb-4">Bio</h2>
            <div>
                <label
                    htmlFor="bio"
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                    About You
                </label>
                <Field
                    as="textarea"
                    name="bio"
                    placeholder="Tell people about yourself, your expertise, or what you do..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    rows={4}
                />
                <ErrorMessage
                    name="bio"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                />
            </div>
        </div>
    );
}
