import { useState, useCallback } from 'react';
import * as api from '../api/client';

/**
 * Custom hook for managing interview session state.
 * Handles API calls and local state management.
 */
export function useInterview() {
    const [session, setSession] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [assessment, setAssessment] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [status, setStatus] = useState('idle'); // idle, starting, questioning, recording, assessing, complete

    const startInterview = useCallback(async (topic, useMaterials = true) => {
        setIsLoading(true);
        setError(null);
        setStatus('starting');

        try {
            const response = await api.startInterview(topic, useMaterials);
            setSession(response);

            // Get first question
            const questionData = await api.getQuestion(response.thread_id);
            setCurrentQuestion(questionData);
            setStatus('questioning');

            return response;
        } catch (err) {
            console.error('Start interview error:', err);
            setError(err.message || 'Failed to start interview');
            setStatus('idle');
            // Don't re-throw - handle gracefully
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const submitAnswer = useCallback(async (transcript) => {
        if (!session?.thread_id) {
            setError('No active session. Please start a new interview.');
            return null;
        }

        if (!transcript?.trim()) {
            setError('Please provide an answer before submitting.');
            return null;
        }

        setIsLoading(true);
        setError(null);
        setStatus('assessing');

        try {
            const response = await api.submitAnswer(session.thread_id, transcript);

            // Always try to get the next question after submitting
            try {
                const questionData = await api.getQuestion(session.thread_id);
                setCurrentQuestion(prev => ({
                    ...questionData,
                    // Increment question number if not a follow-up
                    question_number: questionData.is_followup
                        ? prev?.question_number || 1
                        : (prev?.question_number || 0) + 1
                }));
            } catch (questionErr) {
                console.log('No more questions or error getting next:', questionErr);
                // Keep current question if we can't get a new one
            }

            setStatus('questioning');
            return response;
        } catch (err) {
            console.error('Submit answer error:', err);
            setError(err.message || 'Failed to submit answer. Please try again.');
            // Stay in questioning state so user can retry
            setStatus('questioning');
            // Don't re-throw - handle gracefully
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [session]);

    const approveAssessment = useCallback(async (action = 'approve') => {
        if (!session?.thread_id) {
            setError('No active session');
            return null;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await api.approveAssessment(session.thread_id, action);

            if (action === 'end_interview') {
                setStatus('complete');
            } else if (response.next_question) {
                setCurrentQuestion({
                    question: response.next_question,
                    question_number: (currentQuestion?.question_number || 0) + 1,
                    is_followup: response.has_followup
                });
                setStatus('questioning');
            }

            return response;
        } catch (err) {
            console.error('Approve assessment error:', err);
            setError(err.message || 'Failed to process approval');
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [session, currentQuestion]);

    const getAssessment = useCallback(async () => {
        if (!session?.thread_id) {
            setError('No active session');
            return null;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await api.getAssessment(session.thread_id);
            setAssessment(response);
            setStatus('complete');
            return response;
        } catch (err) {
            console.error('Get assessment error:', err);
            setError(err.message || 'Failed to get assessment');
            // Don't change status on error
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [session]);

    const endInterview = useCallback(async () => {
        if (session?.thread_id) {
            try {
                await api.endSession(session.thread_id);
            } catch (e) {
                console.error('Error ending session:', e);
            }
        }

        setSession(null);
        setCurrentQuestion(null);
        setAssessment(null);
        setStatus('idle');
        setError(null);
    }, [session]);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        session,
        currentQuestion,
        assessment,
        isLoading,
        error,
        status,
        startInterview,
        submitAnswer,
        approveAssessment,
        getAssessment,
        endInterview,
        clearError
    };
}
