import { AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';

/**
 * Chrome browser requirement warning component.
 * Displays prominently if user is not on Chrome.
 */
export function ChromeWarning({ className }) {
    // Check if running in Chrome
    const isChrome = typeof window !== 'undefined' &&
        /Chrome/.test(navigator.userAgent) &&
        !/Edg/.test(navigator.userAgent);

    if (isChrome) return null;

    return (
        <div
            className={cn(
                'flex items-center gap-3 p-4 rounded-lg',
                'bg-yellow-500/10 border border-yellow-500/30 text-yellow-200',
                'animate-fade-in',
                className
            )}
        >
            <AlertTriangle className="h-5 w-5 text-yellow-400 flex-shrink-0" />
            <div>
                <p className="font-medium">Google Chrome Required</p>
                <p className="text-sm text-yellow-200/80">
                    Voice recording uses the Web Speech API which works best in Chrome.
                    Please switch to Chrome for the full experience.
                </p>
            </div>
        </div>
    );
}
