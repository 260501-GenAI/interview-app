import { motion } from 'framer-motion';
import { MessageCircle, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { cn } from '../lib/utils';

/**
 * Question display card with number badge and follow-up indicator.
 */
export function QuestionCard({
    question,
    questionNumber,
    isFollowup = false,
    className
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className={className}
        >
            <Card glass className="relative overflow-hidden">
                {/* Gradient accent */}
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

                <CardHeader className="space-y-4">
                    <div className="flex items-center gap-3">
                        {/* Question number badge */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.1, type: 'spring' }}
                            className={cn(
                                'flex items-center justify-center w-10 h-10 rounded-full',
                                'text-sm font-bold',
                                isFollowup
                                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                    : 'bg-primary text-primary-foreground'
                            )}
                        >
                            {isFollowup ? (
                                <ArrowRight className="h-5 w-5" />
                            ) : (
                                `Q${questionNumber}`
                            )}
                        </motion.div>

                        <div>
                            <CardTitle className="text-lg">
                                {isFollowup ? 'Follow-up Question' : `Question ${questionNumber}`}
                            </CardTitle>
                            {isFollowup && (
                                <p className="text-xs text-purple-400 mt-0.5">
                                    Based on your previous answer
                                </p>
                            )}
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex gap-3"
                    >
                        <MessageCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <p className="text-lg leading-relaxed">{question}</p>
                    </motion.div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
