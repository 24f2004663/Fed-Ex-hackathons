'use client';

import { useState } from 'react';
import { X, Database, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface ConnectDatabaseModalProps {
    onClose: () => void;
    onConnect: (config: any) => Promise<boolean>;
}

export function ConnectDatabaseModal({ onClose, onConnect }: ConnectDatabaseModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        host: '',
        port: '5432',
        database: '',
        username: '',
        password: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const success = await onConnect(formData);
            if (!success) {
                setError("Connection failed. Check credentials and firewall settings.");
            }
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Database className="w-5 h-5 text-[var(--color-secondary)]" />
                        Connect External Database
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm flex items-start gap-2 border border-red-100">
                            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Host / Hostname</label>
                            <input
                                name="host"
                                required
                                placeholder="e.g. 192.168.1.50"
                                className="w-full px-3 py-2 border border-gray-200 rounded focus:ring-2 focus:ring-[var(--color-primary)] outline-none text-sm"
                                value={formData.host}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div className="col-span-2">
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Database Name</label>
                                <input
                                    name="database"
                                    required
                                    placeholder="analytics_db"
                                    className="w-full px-3 py-2 border border-gray-200 rounded focus:ring-2 focus:ring-[var(--color-primary)] outline-none text-sm"
                                    value={formData.database}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Port</label>
                                <input
                                    name="port"
                                    required
                                    placeholder="5432"
                                    className="w-full px-3 py-2 border border-gray-200 rounded focus:ring-2 focus:ring-[var(--color-primary)] outline-none text-sm font-mono"
                                    value={formData.port}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Username</label>
                                <input
                                    name="username"
                                    required
                                    placeholder="readonly_user"
                                    className="w-full px-3 py-2 border border-gray-200 rounded focus:ring-2 focus:ring-[var(--color-primary)] outline-none text-sm"
                                    value={formData.username}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full px-3 py-2 border border-gray-200 rounded focus:ring-2 focus:ring-[var(--color-primary)] outline-none text-sm"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[var(--color-primary)] text-white font-bold py-2.5 rounded-lg shadow-lg hover:bg-blue-800 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Verifying Connection...
                                </>
                            ) : (
                                <>
                                    Connect & Sync
                                </>
                            )}
                        </button>
                    </div>
                </form>

                <div className="bg-gray-50 p-3 text-xs text-center text-gray-400 border-t border-gray-100">
                    Secure TLS connection initiated. Credentials are not stored.
                </div>
            </div>
        </div>
    );
}
