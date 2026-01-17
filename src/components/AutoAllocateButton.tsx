'use client';

import { useState } from 'react';
import { triggerAllocation } from '@/app/actions';
import { Wand2, Loader2 } from 'lucide-react';

interface AutoAllocateButtonProps {
    show: boolean;
}

export default function AutoAllocateButton({ show }: AutoAllocateButtonProps) {
    const [isAllocating, setIsAllocating] = useState(false);

    if (!show) return null;

    const handleAllocate = async () => {
        setIsAllocating(true);
        try {
            await triggerAllocation();
        } catch (error) {
            console.error("Allocation failed", error);
        } finally {
            setIsAllocating(false);
        }
    };

    return (
        <button
            onClick={handleAllocate}
            disabled={isAllocating}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
            {isAllocating ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Allocating...
                </>
            ) : (
                <>
                    <Wand2 className="w-4 h-4" />
                    Auto-Allocate
                </>
            )}
        </button>
    );
}
