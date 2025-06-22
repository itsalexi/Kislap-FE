'use server';

import { cookies } from 'next/headers';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

async function getAuthHeader() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse(response) {
    if (response.ok) {
        if (response.status === 204) {
            return {};
        }
        return await response.json();
    } else {
        const errorData = await response.json().catch(() => ({})); // Gracefully handle if error response is not JSON
        return {
            error:
                errorData.error ||
                `Request failed with status: ${response.status}`,
            details: errorData.details || null,
        };
    }
}

export async function uploadCardProfilePicture(uuid, formData) {
    try {
        const file = formData.get('profilePicture');
        if (!file) throw new Error('No profile picture provided.');

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const uploadData = new FormData();
        uploadData.append(
            'profilePicture',
            new Blob([buffer], { type: file.type }),
            file.name
        );

        const response = await fetch(
            `${BACKEND_URL}/api/upload/card/${uuid}/profile-picture`,
            {
                method: 'POST',
                headers: await getAuthHeader(),
                body: uploadData,
            }
        );
        return await handleResponse(response);
    } catch (error) {
        console.error('Upload error:', error);
        return { error: 'A network error occurred during upload.' };
    }
}

export async function uploadCardBannerPicture(uuid, formData) {
    try {
        const file = formData.get('bannerPicture');
        if (!file) throw new Error('No banner picture provided.');

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const uploadData = new FormData();
        uploadData.append(
            'bannerPicture',
            new Blob([buffer], { type: file.type }),
            file.name
        );

        const response = await fetch(
            `${BACKEND_URL}/api/upload/card/${uuid}/banner-picture`,
            {
                method: 'POST',
                headers: await getAuthHeader(),
                body: uploadData,
            }
        );
        return await handleResponse(response);
    } catch (error) {
        console.error('Upload error:', error);
        return { error: 'A network error occurred during upload.' };
    }
}

export async function deleteCardProfilePicture(uuid) {
    try {
        const response = await fetch(
            `${BACKEND_URL}/api/upload/card/${uuid}/profile-picture`,
            {
                method: 'DELETE',
                headers: await getAuthHeader(),
            }
        );
        return await handleResponse(response);
    } catch (error) {
        console.error('Delete error:', error);
        return { error: 'A network error occurred during deletion.' };
    }
}

export async function deleteCardBannerPicture(uuid) {
    try {
        const response = await fetch(
            `${BACKEND_URL}/api/upload/card/${uuid}/banner-picture`,
            {
                method: 'DELETE',
                headers: await getAuthHeader(),
            }
        );
        return await handleResponse(response);
    } catch (error) {
        console.error('Delete error:', error);
        return { error: 'A network error occurred during deletion.' };
    }
}
