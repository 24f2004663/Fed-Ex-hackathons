"use client";

import { useState } from "react";
import { addAgencyAdmin } from "@/app/admin/actions";
import { useRouter } from "next/navigation";
import { X, Save, Upload } from "lucide-react";

interface AddAgencyModalProps {
    onClose: () => void;
}

export function AddAgencyModal({ onClose }: AddAgencyModalProps) {
    const router = useRouter();
    const [name, setName] = useState("");
    const [region, setRegion] = useState("NA");
    const [capacity, setCapacity] = useState(3);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const res = await addAgencyAdmin(name, region, capacity);

        if (res.success) {
            router.refresh();
            onClose();
        } else {
            alert(res.error);
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-lg font-bold text-gray-800">Onboard New Agency</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Agency Name</label>
                        <input
                            required
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            placeholder="e.g. Delta Recovery"
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Region</label>
                            <select
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                                value={region}
                                onChange={e => setRegion(e.target.value)}
                            >
                                <option value="NA">North America</option>
                                <option value="EMEA">EMEA</option>
                                <option value="APAC">APAC</option>
                                <option value="LATAM">LATAM</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Initial Capacity</label>
                            <input
                                type="number"
                                min={1}
                                max={10}
                                required
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                value={capacity}
                                onChange={e => setCapacity(parseInt(e.target.value))}
                            />
                        </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg text-xs text-blue-700 leading-relaxed border border-blue-100">
                        <strong>Governance Note:</strong> New agencies start with empty performance history.
                        They will be marked as "Probationary" by the allocation engine until verified performance data is available.
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-lg shadow-indigo-200 transition-all flex items-center gap-2"
                        >
                            {isLoading ? 'Creating...' : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Confirm Onboarding
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
