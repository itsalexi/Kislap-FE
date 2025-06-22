'use server';

import { cookies } from 'next/headers';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

async function getHeaders(body) {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    const headers = {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    // Do NOT set Content-Type for FormData, the browser does it
    if (!(body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    return headers;
}

export async function fetchWithAuth(endpoint, { ...params } = {}) {
    if (!BACKEND_URL) {
        console.error('NEXT_PUBLIC_BACKEND_URL is not configured');
        return { error: 'Backend URL not configured' };
    }

    async function getParams() {
        const defaultHeaders = await getHeaders(params.body);
        const modifiedHeaders = Object.keys(params).length
            ? { ...defaultHeaders, ...params.headers }
            : defaultHeaders;

        const fetchParams = params
            ? { ...params, headers: modifiedHeaders }
            : { headers: modifiedHeaders };

        return fetchParams;
    }

    try {
        const response = await fetch(BACKEND_URL + endpoint, await getParams());

        if (response.ok) {
            if (response.status === 204) {
                return {};
            }
            const data = await response.json();
            return data;
        } else {
            const errorData = await response.json();
            return {
                error:
                    errorData.error ||
                    'Data fetch failed. ' + response.statusText,
                details: errorData.details || null,
            };
        }
    } catch (error) {
        console.error('Fetch error:', error);
        return { error: 'Network error: ' + error.message };
    }
}

export async function getCurrentUser() {
    return await fetchWithAuth('/api/auth/me');
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete('auth_token');
    return { success: true };
}
