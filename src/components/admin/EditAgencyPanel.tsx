"use client";
// Force refresh

import { useState } from "react";
// import { Agency, AgencyPerformance } from "@prisma/client";
import { updateAgencyAdmin, updateAgencyPerformance } from "@/app/admin/actions";
import { useRouter } from "next/navigation";
import { X, Save, AlertTriangle, History } from "lucide-react";

// Local definition to avoid IDE errors with Prisma generation
interface Agency {
    id: string;
    name: string;
    status: string;
    capacity: number;
}

interface AgencyPerformance {
    id: string;
    month: string;
    recoveryRate: number;
    slaAdherence: number;
}

// Extended type (needs to match what we passed)
type AgencyWithPerf = Agency & { performance: AgencyPerformance[] };

interface EditAgencyPanelProps {
    agency: AgencyWithPerf;
    onClose: () => void;
}

export function EditAgencyPanel({ agency, onClose }: EditAgencyPanelProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    // Config State
    const [capacity, setCapacity] = useState(agency.capacity);
    const [status, setStatus] = useState(agency.status);

    // Perf Edit State
    // We only allow editing the "current" or "last" month row if exists, or adding new.
    // For simplicity, let's just show a small form to "Add/Update Performance Record" for a specific month.
    const [editMonth, setEditMonth] = useState(new Date().toISOString().slice(0, 7)); // Current Month YYYY-MM
    const [recoveryRate, setRecoveryRate] = useState(0);
    const [slaAdherence, setSlaAdherence] = useState(0);

    const handleSaveConfig = async () => {
        setIsLoading(true);
        const res = await updateAgencyAdmin(agency.id, { capacity, status });
        if (res.success) {
            router.refresh();
            alert("Operational configuration updated.");
        } else {
            alert(res.error);
        }
        setIsLoading(false);
    };

    const handleSavePerf = async () => {
        if (!confirm(`AUDIT WARNING:\n\nYou are about to modify performance metrics for ${editMonth}.\nThis action will be logged in the immutable audit trail.\n\nProceed?`)) return;

        setIsLoading(true);
        const res = await updateAgencyPerformance(agency.id, editMonth, { recoveryRate, slaAdherence });
        if (res.success) {
            router.refresh(); // Should re-fetch and show new history in a real app, assuming parent refreshes
            alert("Performance record updated.");
            // Hack: refresh parent data? The parent passed `agency` prop might be stale until page refresh.
            // In a real app we'd fetch details here. For now, we rely on page refresh.
            // We'll close panel to force re-open with fresh data if user wants to see it? Or better, just alert.
        } else {
            alert(res.error);
        }
        setIsLoading(false);
    };

    return (
        <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl z-50 border-l border-gray-100 transform transition-transform duration-300 overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur z-10">
                <div>
                    <h3 className="text-lg font-bold text-gray-800">{agency.name}</h3>
                    <p className="text-xs text-gray-400 font-mono">{agency.id}</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                    <X className="w-5 h-5 text-gray-500" />
                </button>
            </div>

            <div className="p-6 space-y-8">

                {/* 1. Operational Controls */}
                <section className="space-y-4">
                    <h4 className="text-sm font-bold text-[var(--color-primary)] uppercase tracking-wider flex items-center gap-2">
                        Operational Controls
                    </h4>

                    <div className="space-y-3">
                        <div>
                            <label className="text-xs font-semibold text-gray-500">Status</label>
                            <select
                                className="w-full px-3 py-2 border border-gray-200 rounded text-sm bg-white"
                                value={status}
                                onChange={e => setStatus(e.target.value)}
                            >
                                <option value="ACTIVE">ACTIVE</option>
                                <option value="INACTIVE">INACTIVE (Legacy)</option>
                                <option value="SUSPENDED">SUSPENDED (Risk)</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-500">Max Capacity (Cases)</label>
                            <input
                                type="number"
                                className="w-full px-3 py-2 border border-gray-200 rounded text-sm"
                                value={isNaN(capacity) ? '' : capacity}
                                onChange={e => setCapacity(parseInt(e.target.value) || 0)}
                            />
                        </div>
                        <button
                            onClick={handleSaveConfig}
                            disabled={isLoading}
                            className="w-full py-2 bg-gray-800 text-white text-xs font-bold rounded hover:bg-gray-700 transition"
                        >
                            Save Configuration
                        </button>
                    </div>
                </section>

                <hr className="border-gray-100" />

                {/* 2. Performance Correction */}
                <section className="space-y-4">
                    <h4 className="text-sm font-bold text-[var(--color-secondary)] uppercase tracking-wider flex items-center gap-2">
                        <History className="w-4 h-4" />
                        Performance Correction
                    </h4>

                    <div className="bg-orange-50 border border-orange-100 p-3 rounded-lg flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-orange-800">
                            Updates to recovery metrics affect derived AI scores immediately. All changes are auditable.
                        </p>
                    </div>

                    <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div>
                            <label className="text-xs font-semibold text-gray-500">Target Month</label>
                            <input
                                type="month"
                                className="w-full px-3 py-2 border border-gray-200 rounded text-sm bg-white"
                                value={editMonth}
                                onChange={e => setEditMonth(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-semibold text-gray-500">Recovery Rate</label>
                                <input
                                    type="number"
                                    className="w-full px-3 py-2 border border-gray-200 rounded text-sm"
                                    placeholder="0-100"
                                    value={isNaN(recoveryRate) ? '' : recoveryRate}
                                    onChange={e => setRecoveryRate(parseFloat(e.target.value) || 0)}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500">SLA Adherence</label>
                                <input
                                    type="number"
                                    className="w-full px-3 py-2 border border-gray-200 rounded text-sm"
                                    placeholder="0-100"
                                    value={isNaN(slaAdherence) ? '' : slaAdherence}
                                    onChange={e => setSlaAdherence(parseFloat(e.target.value) || 0)}
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleSavePerf}
                            disabled={isLoading}
                            className="w-full py-2 bg-[var(--color-secondary)] text-white text-xs font-bold rounded hover:opacity-90 transition shadow-sm"
                        >
                            Update & Log Audit
                        </button>
                    </div>
                </section>

                {/* 3. Recent History Table */}
                <section className="space-y-2">
                    <h4 className="text-xs font-bold text-gray-400 uppercase">Recorded History</h4>
                    <div className="border border-gray-100 rounded overflow-hidden">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-gray-50 font-semibold text-gray-500">
                                <tr>
                                    <th className="p-2">Month</th>
                                    <th className="p-2">Rec %</th>
                                    <th className="p-2">SLA %</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {agency.performance.length === 0 && (
                                    <tr><td colSpan={3} className="p-2 text-center italic text-gray-400">No data</td></tr>
                                )}
                                {agency.performance.map((p: AgencyPerformance) => (
                                    <tr key={p.id}>
                                        <td className="p-2 font-mono">{p.month}</td>
                                        <td className="p-2">{p.recoveryRate.toFixed(1)}%</td>
                                        <td className="p-2">{p.slaAdherence.toFixed(1)}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

            </div>
        </div>
    );
}
