import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, BookOpen, Sparkles, Loader2 } from 'lucide-react';
import { Button } from './ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from './ui/Card';
import { cn } from '../lib/utils';
import * as api from '../api/client';

/**
 * Start interview form with topic input and material upload.
 */
export function StartInterviewForm({ onStart, isLoading, className }) {
    const [topic, setTopic] = useState('');
    const [useMaterials, setUseMaterials] = useState(true);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['.pdf', '.txt', '.md'];
        const ext = file.name.substring(file.name.lastIndexOf('.'));
        if (!validTypes.includes(ext.toLowerCase())) {
            setUploadError('Please upload a PDF, TXT, or MD file.');
            return;
        }

        setIsUploading(true);
        setUploadError(null);

        try {
            await api.uploadMaterial(file);
            setUploadedFile(file.name);
        } catch (err) {
            setUploadError(err.message || 'Failed to upload file');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (topic.trim()) {
            onStart(topic.trim(), useMaterials);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={className}
        >
            <Card glass className="max-w-lg mx-auto">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-2">
                        <div className="p-3 rounded-full bg-primary/10">
                            <Sparkles className="h-8 w-8 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl">Start Your Interview</CardTitle>
                    <CardDescription>
                        Enter a topic and optionally upload study materials
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Topic Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                                Interview Topic
                            </label>
                            <input
                                type="text"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="e.g., React Hooks, System Design, Machine Learning"
                                className={cn(
                                    'w-full px-4 py-3 rounded-lg',
                                    'bg-secondary border border-input',
                                    'text-foreground placeholder:text-muted-foreground',
                                    'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background',
                                    'transition-all duration-200'
                                )}
                            />
                        </div>

                        {/* Material Upload */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground flex items-center gap-2">
                                <BookOpen className="h-4 w-4" />
                                Study Materials (Optional)
                            </label>

                            <div className="relative">
                                <input
                                    type="file"
                                    accept=".pdf,.txt,.md"
                                    onChange={handleFileUpload}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    disabled={isUploading}
                                />
                                <div className={cn(
                                    'flex items-center justify-center gap-2 px-4 py-8',
                                    'border-2 border-dashed border-input rounded-lg',
                                    'text-muted-foreground hover:border-primary/50 hover:bg-secondary/50',
                                    'transition-all duration-200 cursor-pointer'
                                )}>
                                    {isUploading ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            <span>Uploading...</span>
                                        </>
                                    ) : uploadedFile ? (
                                        <>
                                            <BookOpen className="h-5 w-5 text-primary" />
                                            <span className="text-foreground">{uploadedFile}</span>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="h-5 w-5" />
                                            <span>Drop a file or click to upload</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {uploadError && (
                                <p className="text-sm text-destructive">{uploadError}</p>
                            )}

                            <p className="text-xs text-muted-foreground">
                                Supports PDF, TXT, and Markdown files
                            </p>
                        </div>

                        {/* Use Materials Toggle */}
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={useMaterials}
                                onChange={(e) => setUseMaterials(e.target.checked)}
                                className="w-4 h-4 rounded border-input bg-secondary text-primary focus:ring-ring"
                            />
                            <span className="text-sm text-muted-foreground">
                                Use uploaded materials for context
                            </span>
                        </label>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={!topic.trim() || isLoading}
                            className="w-full h-12 text-base gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Starting Interview...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-5 w-5" />
                                    Begin Interview
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </motion.div>
    );
}
