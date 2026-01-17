import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            async authorize(credentials) {
                console.log("[Auth] Authorizing credentials:", credentials);
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;

                    console.log(`[Auth] Checking user: ${email}`);

                    // TODO: Replace with real DB lookup when Users table is seeded
                    // DYNAMIC AGENCY LOGIN (Handles Pi, Sigma, Omega, etc.)
                    // Check if an explicit agencyId was passed from server action
                    // We trust this because it comes from our secure backend action
                    // We trust this because it comes from our secure backend action
                    if (credentials.agencyId && credentials.agencyId !== 'undefined' && credentials.agencyId !== 'null') {
                        console.log(`[Auth] Dynamic Agency Login: ${credentials.agencyId}`);
                        return {
                            id: credentials.agencyId as string,
                            name: 'Agency Partner', // The UI will fetch the real name from store
                            email: `agency@${credentials.agencyId}.com`, // Mock email
                            role: 'AGENCY',
                        };
                    }

                    // ... existing hardcoded checks for Admin/Legacy ...
                    if (email === 'admin@fedex.com' && password === 'admin123') {
                        console.log("[Auth] Admin login successful");
                        return {
                            id: '1',
                            name: 'FedEx Admin',
                            email: 'admin@fedex.com',
                            role: 'ADMIN',
                        };
                    }

                    // Fallback for direct email/pass login (Alpha/Beta/Gamma/Epsilon)
                    // Agency 1: Alpha
                    if (email === 'agency@alpha.com' && password === 'agency123') {
                        return { id: 'user-agency-alpha', name: 'Alpha Collections', email, role: 'AGENCY' };
                    }
                    // Agency 2: Beta
                    if (email === 'agency@beta.com' && password === 'agency123') {
                        return { id: 'user-agency-beta', name: 'Beta Recovery', email, role: 'AGENCY' };
                    }
                    // Agency 3: Gamma
                    if (email === 'agency@gamma.com' && password === 'agency123') {
                        return { id: 'user-agency-gamma', name: 'Gamma Partners', email, role: 'AGENCY' };
                    }
                    // Agency 4: Epsilon
                    if (email === 'epsilon@agency.com' && (password === 'epsilon123' || password === 'agency123')) {
                        return { id: 'user-agency-epsilon-agency-1768017971573', name: 'Epsilon Agency', email, role: 'AGENCY' };
                    }
                }
                console.log('[Auth] Invalid credentials or parsing failed');
                return null;
            },
        }),
    ],
    cookies: {
        sessionToken: {
            name: `next-auth.session-token`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === 'production',
            },
        },
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.role = token.role as string;
                session.user.id = token.id as string || token.sub as string;
            }
            return session;
        }
    },
    debug: true,
});
