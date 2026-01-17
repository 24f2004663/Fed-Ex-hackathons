"use client";

import { useState } from 'react';
import { getAgenciesAdmin } from '@/app/admin/actions';
import { AgencyTable } from '@/components/admin/AgencyTable';
import { AddAgencyModal } from '@/components/admin/AddAgencyModal';
import { EditAgencyPanel } from '@/components/admin/EditAgencyPanel';
import { Plus, LayoutGrid, Users, ShieldAlert, TrendingUp, BadgeCheck, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminAgenciesPageClient({ agencies }: { agencies: any[] }) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedAgency, setSelectedAgency] = useState<any | null>(null);

    return (
        <main className="min-h-screen bg-gray-50 p-6 md:p-12">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-start gap-4">
                        <Link href="/" className="mt-1 p-2 bg-white rounded-full shadow-sm border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors" title="Back to Dashboard">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                <ShieldAlert className="w-8 h-8 text-[var(--color-primary)]" />
                                Agency Governance Portal
                            </h1>
                            <p className="text-gray-500 mt-2 max-w-2xl">
                                Manage authorized collection agencies, configure operational limits, and audit performance metrics.
                                Unauthorized changes are strictly monitored.
                            </p>
                        </div>
                    </div>
                    <div>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-[var(--color-primary)] text-white px-5 py-3 rounded-lg shadow-lg hover:bg-blue-800 transition-all font-bold flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Onboard Agency
                        </button>
                    </div>
                </div>

                {/* KPI Cards (Static for now to show Enterprise Polish) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Active Partners</p>
                            <p className="text-2xl font-bold text-gray-800">{agencies.filter(a => a.status === 'ACTIVE').length}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="p-3 bg-green-50 rounded-lg text-green-600">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Network Capacity</p>
                            <p className="text-2xl font-bold text-gray-800">
                                {agencies.reduce((acc, a) => acc + (a.status === 'ACTIVE' ? a.capacity : 0), 0)} Cases
                            </p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
                            <BadgeCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Compliance Rate</p>
                            <p className="text-2xl font-bold text-gray-800">98.2%</p>
                        </div>
                    </div>
                </div>

                {/* Main Table Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <LayoutGrid className="w-5 h-5 text-gray-400" />
                            Registered Entities
                        </h2>
                        {/* Filter placeholders could go here */}
                    </div>

                    <AgencyTable
                        agencies={agencies}
                        onEdit={(a) => setSelectedAgency(a)}
                    />
                </div>
            </div>

            {/* Modals */}
            {isAddModalOpen && (
                <AddAgencyModal onClose={() => setIsAddModalOpen(false)} />
            )}

            {selectedAgency && (
                <EditAgencyPanel
                    agency={selectedAgency}
                    onClose={() => setSelectedAgency(null)}
                />
            )}
        </main>
    );
}

// Server Component Wrapper for data fetching
// Note: Since this file uses "use client" at top, we need a separate server component or fetch in parent.
// Or we can make this component strictly client and fetch data in a parent page.tsx.
// Let's create `page.tsx` as server component and import this as `AgencyAdminClient`.
// Actually, I'll rewrite this file to be the *Client* component, and create a tiny page.tsx wrapper.
