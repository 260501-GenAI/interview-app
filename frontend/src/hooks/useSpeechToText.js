import { useState, useCallback, useRef } from 'react';

/**
 * Technical vocabulary for AI/ML interview speech recognition.
 * These terms help the Web Speech API recognize technical terminology.
 */
const TECHNICAL_VOCABULARY = [
    // AI/ML Frameworks
    'LangChain', 'LangGraph', 'LangSmith', 'OpenAI', 'GPT', 'GPT-4', 'GPT-4o',
    'TensorFlow', 'PyTorch', 'Keras', 'scikit-learn', 'sklearn', 'Hugging Face',
    'transformers', 'BERT', 'RoBERTa', 'LLAMA', 'Claude', 'Anthropic', 'Gemini',

    // Vector Databases
    'ChromaDB', 'Chroma', 'Pinecone', 'Weaviate', 'Milvus', 'FAISS', 'Qdrant',
    'embeddings', 'vector store', 'vector database', 'similarity search',

    // LangChain/LangGraph specific
    'StateGraph', 'TypedDict', 'checkpointer', 'HITL', 'human-in-the-loop',
    'tool calling', 'function calling', 'agent', 'multi-agent', 'supervisor',
    'RAG', 'retrieval augmented generation', 'agentic', 'workflow',

    // Python/Programming
    'FastAPI', 'Pydantic', 'asyncio', 'async', 'await', 'uvicorn', 'ASGI',
    'API', 'REST', 'GraphQL', 'WebSocket', 'HTTP', 'endpoint', 'middleware',
    'dependency injection', 'decorator', 'generator', 'iterator',

    // React/Frontend
    'React', 'Vite', 'useState', 'useEffect', 'useCallback', 'useMemo',
    'component', 'props', 'state', 'hooks', 'JSX', 'TypeScript', 'JavaScript',
    'Tailwind', 'CSS', 'Framer Motion', 'shadcn',

    // General Tech
    'machine learning', 'deep learning', 'neural network', 'NLP',
    'natural language processing', 'large language model', 'LLM',
    'fine-tuning', 'prompt engineering', 'context window', 'tokens',
    'inference', 'training', 'backpropagation', 'gradient descent'
];

/**
 * Custom hook for Web Speech API voice-to-text recording.
 * REQUIRES Google Chrome for best compatibility.
 * 
 * Features:
 * - Continuous recognition for uninterrupted recording
 * - Real-time interim results
 * - Technical vocabulary hints for better accuracy
 * - Post-processing to correct common technical terms
 */
export function useSpeechToText() {
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [error, setError] = useState(null);
    const recognitionRef = useRef(null);

    // Check browser support
    const isSupported = typeof window !== 'undefined' &&
        ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);

    /**
     * Post-process transcript to correct technical terminology.
     * Maps common misrecognitions to correct spellings.
     */
    const correctTechnicalTerms = useCallback((text) => {
        const corrections = {
            // Common misrecognitions -> correct spelling
            'lang chain': 'LangChain',
            'langchain': 'LangChain',
            'lang graph': 'LangGraph',
            'langgraph': 'LangGraph',
            'lang smith': 'LangSmith',
            'langsmith': 'LangSmith',
            'chroma db': 'ChromaDB',
            'chromadb': 'ChromaDB',
            'chroma': 'Chroma',
            'pine cone': 'Pinecone',
            'pinecone': 'Pinecone',
            'open ai': 'OpenAI',
            'openai': 'OpenAI',
            'gpt 4': 'GPT-4',
            'gpt4': 'GPT-4',
            'gpt 4 oh': 'GPT-4o',
            'gpt for oh': 'GPT-4o',
            'fast api': 'FastAPI',
            'fastapi': 'FastAPI',
            'pi dantic': 'Pydantic',
            'pydantic': 'Pydantic',
            'state graph': 'StateGraph',
            'stategraph': 'StateGraph',
            'type dict': 'TypedDict',
            'typeddict': 'TypedDict',
            'hit l': 'HITL',
            'hitl': 'HITL',
            'human in the loop': 'human-in-the-loop',
            'rag': 'RAG',
            'r a g': 'RAG',
            'llm': 'LLM',
            'l l m': 'LLM',
            'nlp': 'NLP',
            'n l p': 'NLP',
            'api': 'API',
            'a p i': 'API',
            'hugging face': 'Hugging Face',
            'huggingface': 'Hugging Face',
            'tensor flow': 'TensorFlow',
            'tensorflow': 'TensorFlow',
            'pie torch': 'PyTorch',
            'pytorch': 'PyTorch',
            'scikit learn': 'scikit-learn',
            'sklearn': 'scikit-learn',
        };

        let corrected = text;
        for (const [wrong, right] of Object.entries(corrections)) {
            // Case-insensitive replacement
            const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
            corrected = corrected.replace(regex, right);
        }
        return corrected;
    }, []);

    const startRecording = useCallback(() => {
        if (!isSupported) {
            setError('Speech recognition not supported. Please use Google Chrome.');
            return;
        }

        setError(null);
        setTranscript('');
        setInterimTranscript('');

        // Create recognition instance
        const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = true;          // Keep recording until manually stopped
        recognition.interimResults = true;      // Show results as user speaks
        recognition.lang = 'en-US';
        recognition.maxAlternatives = 3;        // Get multiple alternatives for better accuracy

        // Try to add grammar hints if supported
        if ('webkitSpeechGrammarList' in window || 'SpeechGrammarList' in window) {
            try {
                const SpeechGrammarList = window.webkitSpeechGrammarList || window.SpeechGrammarList;
                const grammarList = new SpeechGrammarList();

                // JSGF grammar format with technical terms
                const grammar = '#JSGF V1.0; grammar techterms; public <term> = ' +
                    TECHNICAL_VOCABULARY.join(' | ') + ';';

                grammarList.addFromString(grammar, 1);
                recognition.grammars = grammarList;
            } catch (e) {
                // Grammar not supported in all browsers, continue without it
                console.log('Speech grammar hints not available, using post-processing');
            }
        }

        recognition.onstart = () => {
            setIsRecording(true);
        };

        recognition.onresult = (event) => {
            let finalTranscript = '';
            let interim = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    // Apply technical term corrections to final results
                    finalTranscript += correctTechnicalTerms(result[0].transcript) + ' ';
                } else {
                    interim += result[0].transcript;
                }
            }

            if (finalTranscript) {
                setTranscript(prev => prev + finalTranscript);
            }
            setInterimTranscript(interim);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            if (event.error === 'not-allowed') {
                setError('Microphone access denied. Please allow microphone access.');
            } else if (event.error === 'no-speech') {
                // Don't show error for no-speech, just continue listening
                console.log('No speech detected, continuing...');
                return;
            } else if (event.error === 'aborted') {
                // User stopped recording, not an error
                return;
            } else {
                setError(`Error: ${event.error}`);
            }
            setIsRecording(false);
        };

        recognition.onend = () => {
            setIsRecording(false);
            setInterimTranscript('');
        };

        recognitionRef.current = recognition;
        recognition.start();
    }, [isSupported, correctTechnicalTerms]);

    const stopRecording = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsRecording(false);
        }
    }, []);

    const resetTranscript = useCallback(() => {
        setTranscript('');
        setInterimTranscript('');
        setError(null);
    }, []);

    return {
        transcript,
        interimTranscript,
        fullTranscript: transcript + interimTranscript,
        isRecording,
        isSupported,
        error,
        startRecording,
        stopRecording,
        resetTranscript
    };
}
