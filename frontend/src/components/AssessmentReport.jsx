import { motion } from 'framer-motion';
import { Trophy, TrendingUp, TrendingDown, Target, BookOpen } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/Card';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';

/**
 * Score circle with animated fill.
 */
function ScoreCircle({ score, size = 120 }) {
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = (score / 100) * circumference;

    const getScoreColor = (s) => {
        if (s >= 80) return 'text-green-400';
        if (s >= 60) return 'text-yellow-400';
        return 'text-red-400';
    };

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    className="text-secondary"
                />
                {/* Progress circle */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: circumference - progress }}
                    transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
                    style={{ strokeDasharray: circumference }}
                    className={getScoreColor(score)}
                />
            </svg>
            <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute inset-0 flex items-center justify-center"
            >
                <span className={cn('text-3xl font-bold', getScoreColor(score))}>
                    {score}%
                </span>
            </motion.div>
        </div>
    );
}

/**
 * Final assessment report component with score visualization.
 */
export function AssessmentReport({
    assessment,
    onNewInterview,
    className
}) {
    if (!assessment) return null;

    const {
        overall_score,
        total_questions,
        summary,
        strengths = [],
        weaknesses = [],
        recommendations = []
    } = assessment;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn('space-y-6', className)}
        >
            {/* Score Card */}
            <Card glass className="relative overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500" />

                <CardHeader className="text-center pb-2">
                    <div className="flex items-center justify-center gap-2 text-yellow-400">
                        <Trophy className="h-6 w-6" />
                        <CardTitle>Interview Complete!</CardTitle>
                    </div>
                </CardHeader>

                <CardContent className="flex flex-col items-center py-6">
                    <ScoreCircle score={overall_score} />
                    <p className="mt-4 text-muted-foreground text-center max-w-md">
                        {summary}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {total_questions} questions answered
                    </p>
                </CardContent>
            </Card>

            {/* Strengths & Weaknesses */}
            <div className="grid md:grid-cols-2 gap-4">
                {/* Strengths */}
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2 text-green-400">
                            <TrendingUp className="h-5 w-5" />
                            <CardTitle className="text-base">Strengths</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {strengths.map((item, i) => (
                                <motion.li
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 * i }}
                                    className="flex items-start gap-2 text-sm"
                                >
                                    <span className="text-green-400 mt-1">•</span>
                                    {item}
                                </motion.li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                {/* Weaknesses */}
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2 text-orange-400">
                            <TrendingDown className="h-5 w-5" />
                            <CardTitle className="text-base">Areas to Improve</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {weaknesses.map((item, i) => (
                                <motion.li
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 * i }}
                                    className="flex items-start gap-2 text-sm"
                                >
                                    <span className="text-orange-400 mt-1">•</span>
                                    {item}
                                </motion.li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>

            {/* Recommendations */}
            {recommendations.length > 0 && (
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2 text-blue-400">
                            <BookOpen className="h-5 w-5" />
                            <CardTitle className="text-base">Study Recommendations</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {recommendations.map((item, i) => (
                                <motion.li
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 + 0.1 * i }}
                                    className="flex items-start gap-2 text-sm"
                                >
                                    <Target className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                                    {item}
                                </motion.li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

            {/* Actions */}
            <div className="flex justify-center pt-4">
                <Button onClick={onNewInterview} size="lg" className="gap-2">
                    Start New Interview
                </Button>
            </div>
        </motion.div>
    );
}
