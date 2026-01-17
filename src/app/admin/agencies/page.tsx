import { getAgenciesAdmin } from '@/app/admin/actions';
import AdminAgenciesPageClient from './client_page';

export const dynamic = 'force-dynamic';

export default async function Page() {
    const result = await getAgenciesAdmin();

    if (!result.success) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50">
                <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-red-100 text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">⚠️</span>
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 mb-2">Access Denied / System Error</h1>
                    <p className="text-red-500 font-mono text-sm bg-red-50 p-3 rounded mb-6">
                        {result.error}
                    </p>
                    <a href="/login" className="text-blue-600 hover:underline text-sm font-semibold">
                        Return to Login
                    </a>
                </div>
            </div>
        );
    }

    return <AdminAgenciesPageClient agencies={result.data || []} />;
}
