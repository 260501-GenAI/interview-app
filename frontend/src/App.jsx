import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, XCircle } from 'lucide-react';

import { ChromeWarning } from './components/ChromeWarning';
import { StartInterviewForm } from './components/StartInterviewForm';
import { QuestionCard } from './components/QuestionCard';
import { VoiceRecorder } from './components/VoiceRecorder';
import { AssessmentReport } from './components/AssessmentReport';
import { LoadingBar } from './components/LoadingBar';
import { Button } from './components/ui/Button';
import { useSpeechToText } from './hooks/useSpeechToText';
import { useInterview } from './hooks/useInterview';

/**
 * Main Interview Prep Application
 */
function App() {
    const {
        session,
        currentQuestion,
        assessment,
        isLoading,
        error: interviewError,
        status,
        startInterview,
        submitAnswer,
        getAssessment,
        endInterview
    } = useInterview();

    const {
        transcript,
        interimTranscript,
        fullTranscript,
        isRecording,
        isSupported,
        error: speechError,
        startRecording,
        stopRecording,
        resetTranscript
    } = useSpeechToText();

    const [showEndConfirm, setShowEndConfirm] = useState(false);

    const handleStartInterview = async (topic, useMaterials) => {
        await startInterview(topic, useMaterials);
        resetTranscript();
    };

    const handleSubmitAnswer = async () => {
        if (fullTranscript.trim()) {
            await submitAnswer(fullTranscript.trim());
            resetTranscript();
        }
    };

    const handleEndInterview = async () => {
        await getAssessment();
        setShowEndConfirm(false);
    };

    const handleNewInterview = () => {
        endInterview();
        resetTranscript();
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <GraduationCap className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold">Interview Prep</h1>
                            <p className="text-xs text-muted-foreground">AI-Powered Practice</p>
                        </div>
                    </div>

                    {session && status !== 'complete' && status !== 'starting' && (
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground">
                                Topic: <span className="text-foreground font-medium">{session.topic}</span>
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowEndConfirm(true)}
                                className="text-destructive hover:text-destructive"
                            >
                                <XCircle className="h-4 w-4 mr-1" />
                                End
                            </Button>
                        </div>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8 max-w-3xl">
                <ChromeWarning className="mb-6" />

                {/* Error Display */}
                {interviewError && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive"
                    >
                        {interviewError}
                    </motion.div>
                )}

                <AnimatePresence mode="wait">
                    {/* Start Screen */}
                    {status === 'idle' && (
                        <motion.div
                            key="start"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <StartInterviewForm
                                onStart={handleStartInterview}
                                isLoading={isLoading}
                            />
                        </motion.div>
                    )}

                    {/* Loading/Generating Question */}
                    {status === 'starting' && (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="py-16"
                        >
                            <LoadingBar stage="generating" />
                        </motion.div>
                    )}

                    {/* Interview In Progress */}
                    {(status === 'questioning' || status === 'recording' || status === 'assessing') && (
                        <motion.div
                            key="interview"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            {currentQuestion && (
                                <QuestionCard
                                    question={currentQuestion.question}
                                    questionNumber={currentQuestion.question_number}
                                    isFollowup={currentQuestion.is_followup}
                                />
                            )}

                            <VoiceRecorder
                                isRecording={isRecording}
                                transcript={transcript}
                                interimTranscript={interimTranscript}
                                onStart={startRecording}
                                onStop={stopRecording}
                                onSubmit={handleSubmitAnswer}
                                isSupported={isSupported}
                                error={speechError}
                                disabled={isLoading}
                            />

                            {/* Loading State - Assessing Answer */}
                            {isLoading && status === 'assessing' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="py-6"
                                >
                                    <LoadingBar stage="thinking" />
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    {/* Assessment Complete */}
                    {status === 'complete' && (
                        <motion.div
                            key="complete"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                        >
                            <AssessmentReport
                                assessment={assessment}
                                onNewInterview={handleNewInterview}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* End Interview Confirmation */}
                <AnimatePresence>
                    {showEndConfirm && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
                            onClick={() => setShowEndConfirm(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.95 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.95 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-card border border-border rounded-lg p-6 mx-4 max-w-sm w-full shadow-xl"
                            >
                                <h3 className="text-lg font-semibold mb-2">End Interview?</h3>
                                <p className="text-muted-foreground text-sm mb-6">
                                    This will conclude your interview and generate a final assessment report.
                                </p>
                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => setShowEndConfirm(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        className="flex-1"
                                        onClick={handleEndInterview}
                                    >
                                        End & Get Report
                                    </Button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Footer */}
            <footer className="border-t border-border mt-auto py-6 text-center text-sm text-muted-foreground">
                <p>Interview Preparedness App • Powered by AI</p>
            </footer>
        </div>
    );
}

export default App;
