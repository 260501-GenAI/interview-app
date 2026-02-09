import { motion } from 'framer-motion';
import { Sparkles, Brain, MessageSquare, CheckCircle } from 'lucide-react';
import { cn } from '../lib/utils';

/**
 * Animated loading bar with AI-themed steps.
 */
export function LoadingBar({ stage = 'thinking', className }) {
    const stages = [
        { id: 'thinking', label: 'AI is thinking...', icon: Brain },
        { id: 'generating', label: 'Generating question...', icon: MessageSquare },
        { id: 'ready', label: 'Ready!', icon: CheckCircle },
    ];

    const currentIndex = stages.findIndex(s => s.id === stage);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn('w-full max-w-md mx-auto', className)}
        >
            {/* Progress bar container */}
            <div className="relative mb-4">
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
                        initial={{ width: '0%' }}
                        animate={{ width: stage === 'ready' ? '100%' : '66%' }}
                        transition={{
                            duration: stage === 'ready' ? 0.3 : 2,
                            ease: stage === 'ready' ? 'easeOut' : 'linear'
                        }}
                    />
                </div>

                {/* Shimmer effect */}
                {stage !== 'ready' && (
                    <motion.div
                        className="absolute inset-0 h-2"
                        initial={{ x: '-100%' }}
                        animate={{ x: '200%' }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: 'linear'
                        }}
                    >
                        <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                    </motion.div>
                )}
            </div>

            {/* Current stage indicator */}
            <div className="flex items-center justify-center gap-3 text-muted-foreground">
                {stages.map((s, i) => {
                    const Icon = s.icon;
                    const isActive = s.id === stage;
                    const isPast = i < currentIndex;

                    return (
                        <motion.div
                            key={s.id}
                            initial={{ opacity: 0.5, scale: 0.9 }}
                            animate={{
                                opacity: isActive || isPast ? 1 : 0.5,
                                scale: isActive ? 1.1 : 1
                            }}
                            className={cn(
                                'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors',
                                isActive && 'bg-primary/10 text-primary',
                                isPast && 'text-green-400'
                            )}
                        >
                            <Icon className={cn(
                                'h-4 w-4',
                                isActive && 'animate-pulse'
                            )} />
                            {isActive && <span>{s.label}</span>}
                        </motion.div>
                    );
                })}
            </div>

            {/* Decorative sparkles */}
            {stage !== 'ready' && (
                <motion.div
                    className="flex justify-center mt-4"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                >
                    <Sparkles className="h-6 w-6 text-purple-400/50" />
                </motion.div>
            )}
        </motion.div>
    );
}
