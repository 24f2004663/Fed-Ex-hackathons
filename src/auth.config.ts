import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            // STEP 1: FREEZE MIDDLEWARE (No Auth Logic)
            return true;

            /*
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/');
            // Allow access to login page
            if (nextUrl.pathname.startsWith('/login')) return true;

            // Protected routes
            if (isOnDashboard) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            }
            return true;
            */
        },
    },
    providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
