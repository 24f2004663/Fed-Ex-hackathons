'use server';

import { signOut } from '@/auth';

// loginUser REMOVED - using client-side signIn in login/page.tsx

export async function logoutUser() {
    await signOut({ redirectTo: '/login' });
}
