'use server';

import { fetchWithAuth } from './auth.js';

export async function getUserCards() {
    return await fetchWithAuth('/api/cards');
}

export async function getCardByUuid(uuid) {
    return await fetchWithAuth(`/api/cards/${uuid}`);
}

export async function claimCard(uuid) {
    return await fetchWithAuth(`/api/cards/${uuid}/claim`, {
        method: 'POST',
    });
}

export async function updateCard(uuid, cardData) {
    return await fetchWithAuth(`/api/cards/${uuid}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(cardData),
    });
}
