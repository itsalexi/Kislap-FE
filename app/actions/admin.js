'use server';

import { fetchWithAuth } from '../lib/auth.js';

export async function getAdminStats() {
    const result = await fetchWithAuth('/api/admin/stats');
    console.log(result);
    if (result.error) {
        if (
            result.error.includes('403') ||
            result.error.includes('Admin access required')
        ) {
            throw new Error('Admin access required');
        }
        throw new Error(result.error);
    }

    return result;
}

export async function getAdminCards(page = 1, limit = 20, claimed = null) {
    const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
    });

    if (claimed !== null) {
        params.append('claimed', claimed.toString());
    }

    const result = await fetchWithAuth(`/api/admin/cards?${params}`);

    if (result.error) {
        if (
            result.error.includes('403') ||
            result.error.includes('Admin access required')
        ) {
            throw new Error('Admin access required');
        }
        throw new Error(result.error);
    }

    return result;
}

export async function getAdminUsers(page = 1, limit = 20) {
    const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
    });

    const result = await fetchWithAuth(`/api/admin/users?${params}`);

    if (result.error) {
        if (
            result.error.includes('403') ||
            result.error.includes('Admin access required')
        ) {
            throw new Error('Admin access required');
        }
        throw new Error(result.error);
    }

    return result;
}

export async function createAdminCards(count) {
    const result = await fetchWithAuth('/api/admin/cards', {
        method: 'POST',
        body: JSON.stringify({ count }),
    });

    if (result.error) {
        if (
            result.error.includes('403') ||
            result.error.includes('Admin access required')
        ) {
            throw new Error('Admin access required');
        }
        throw new Error(result.error);
    }

    return result;
}

export async function deleteAdminCard(uuid) {
    const result = await fetchWithAuth(`/api/admin/cards/${uuid}`, {
        method: 'DELETE',
    });

    if (result.error) {
        if (
            result.error.includes('403') ||
            result.error.includes('Admin access required')
        ) {
            throw new Error('Admin access required');
        }
        if (
            result.error.includes('404') ||
            result.error.includes('Card not found')
        ) {
            throw new Error('Card not found');
        }
        throw new Error(result.error);
    }

    return result;
}
