import { NextResponse } from 'next/server';

export function middleware(request) {
    if (request.nextUrl.pathname.startsWith('/admin')) {
        const authToken = request.cookies.get('auth_token')?.value;

        if (!authToken) {
            return NextResponse.redirect(new URL('/', request.url));
        }

        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*'],
};
