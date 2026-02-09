import { motion } from 'framer-motion';
import { Mic, MicOff, Square } from 'lucide-react';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';

/**
 * Voice recorder component with animated recording indicator.
 * Uses Web Speech API via useSpeechToText hook.
 */
export function VoiceRecorder({
    isRecording,
    transcript,
    interimTranscript,
    onStart,
    onStop,
    onSubmit,
    isSupported,
    error,
    disabled = false,
    className
}) {
    const hasTranscript = transcript.trim().length > 0;

    return (
        <div className={cn('space-y-4', className)}>
            {/* Recording controls */}
            <div className="flex items-center gap-4">
                {!isRecording ? (
                    <Button
                        onClick={onStart}
                        disabled={disabled || !isSupported}
                        size="lg"
                        className="gap-2 bg-red-500 hover:bg-red-600 text-white"
                    >
                        <Mic className="h-5 w-5" />
                        Start Recording
                    </Button>
                ) : (
                    <Button
                        onClick={onStop}
                        size="lg"
                        variant="outline"
                        className="gap-2 border-red-500 text-red-500 hover:bg-red-500/10"
                    >
                        <Square className="h-5 w-5" />
                        Stop Recording
                    </Button>
                )}

                {hasTranscript && !isRecording && (
                    <Button onClick={onSubmit} disabled={disabled}>
                        Submit Answer
                    </Button>
                )}
            </div>

            {/* Recording indicator */}
            {isRecording && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3 text-red-400"
                >
                    <span className="relative flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
                    </span>
                    <span className="text-sm font-medium">Recording...</span>
                </motion.div>
            )}

            {/* Transcript display */}
            {(transcript || interimTranscript) && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-lg bg-secondary/50 border border-border"
                >
                    <p className="text-sm text-muted-foreground mb-2">Your Answer:</p>
                    <p className="text-foreground">
                        {transcript}
                        <span className="text-muted-foreground italic">{interimTranscript}</span>
                    </p>
                </motion.div>
            )}

            {/* Error display */}
            {error && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive"
                >
                    <div className="flex items-center gap-2">
                        <MicOff className="h-4 w-4" />
                        <span className="text-sm">{error}</span>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
