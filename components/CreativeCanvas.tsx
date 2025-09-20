import React, { useState, useRef } from 'react';
import { GoogleGenAI, Modality, Type } from "@google/genai";
import UploadIcon from './icons/UploadIcon';
import SparklesIcon from './icons/SparklesIcon';
import DownloadIcon from './icons/DownloadIcon';
import BookIcon from './icons/BookIcon';
import ShareIcon from './icons/ShareIcon';
import ShareModal from './ShareModal';

const CreativeCanvas: React.FC = () => {
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [prompt, setPrompt] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedText, setGeneratedText] = useState<string | null>(null);
    const [dynamicSuggestions, setDynamicSuggestions] = useState<string[]>([]);
    const [generateStory, setGenerateStory] = useState<boolean>(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const generateSuggestions = async (imageDataUrl: string) => {
        setIsAnalyzing(true);
        setDynamicSuggestions([]);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const mimeType = imageDataUrl.split(';')[0].split(':')[1];
            const base64ImageData = imageDataUrl.split(',')[1];

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: {
                    parts: [
                        { inlineData: { data: base64ImageData, mimeType: mimeType } },
                        { text: "Based on this child's drawing, generate 4 short, fun, and imaginative suggestions for a teacher to enhance it. Phrase them as commands. Return ONLY a JSON object with a single key 'suggestions' which is an array of strings." },
                    ],
                },
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            suggestions: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING }
                            }
                        }
                    }
                },
            });

            const jsonText = response.text.trim();
            const parsed = JSON.parse(jsonText);
            if (parsed.suggestions) {
                 setDynamicSuggestions(parsed.suggestions);
            }
        } catch (e) {
            console.error("Suggestion generation failed:", e);
            // Don't show an error to the user, just fail gracefully
        } finally {
            setIsAnalyzing(false);
        }
    };


    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setOriginalImage(result);
                setGeneratedImage(null);
                setError(null);
                setGeneratedText(null);
                generateSuggestions(result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerate = async () => {
        if (!originalImage || !prompt) {
            setError("Please upload an image and enter a prompt.");
            return;
        }

        setIsLoading(true);
        setGeneratedImage(null);
        setError(null);
        setGeneratedText(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const mimeType = originalImage.split(';')[0].split(':')[1];
            const base64ImageData = originalImage.split(',')[1];

            const textPart = generateStory
                ? `${prompt}. Also, write a short, one-paragraph story starter inspired by this new image, suitable for a kindergarten classroom.`
                : prompt;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image-preview',
                contents: {
                    parts: [
                        { inlineData: { data: base64ImageData, mimeType: mimeType } },
                        { text: textPart },
                    ],
                },
                config: {
                    responseModalities: [Modality.IMAGE, Modality.TEXT],
                },
            });
            
            let foundImage = false;
            let foundText = null;
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    const imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                    setGeneratedImage(imageUrl);
                    foundImage = true;
                } else if (part.text) {
                    foundText = part.text;
                }
            }
            
            if (generateStory) {
                setGeneratedText(foundText);
            }

            if (!foundImage) {
                setError("The model didn't return an image. Try a different prompt!");
            }
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
            setError(`Something went wrong: ${errorMessage}`);
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDownload = () => {
        if (!generatedImage) return;
        const link = document.createElement('a');
        link.href = generatedImage;
        link.download = 'creation.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const handleClear = () => {
        setOriginalImage(null);
        setGeneratedImage(null);
        setPrompt('');
        setError(null);
        setGeneratedText(null);
        setDynamicSuggestions([]);
        setGenerateStory(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const ImagePanel: React.FC<{ src: string | null; title: string; children?: React.ReactNode, isLoading?: boolean }> = ({ src, title, children, isLoading }) => (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 flex flex-col items-center justify-center aspect-square w-full">
            <h3 className="text-lg font-semibold text-slate-300 mb-4">{title}</h3>
            <div className="relative w-full h-full flex items-center justify-center">
                {isLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800/50 rounded-lg z-10">
                        <SparklesIcon className="w-10 h-10 text-violet-400 animate-pulse" />
                        <p className="mt-2 text-slate-400">Imagining...</p>
                    </div>
                )}
                {src ? <img src={src} alt={title} className="max-w-full max-h-full object-contain rounded-md" /> : children}
            </div>
        </div>
    );

    if (!originalImage) {
        return (
            <div className="w-full max-w-xl mx-auto">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                    aria-hidden="true"
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full aspect-video bg-slate-800/50 border-2 border-dashed border-slate-600 rounded-xl flex flex-col items-center justify-center
                               hover:border-violet-500 hover:bg-slate-800 transition-all duration-300 text-slate-400 hover:text-slate-200"
                    aria-label="Upload a drawing"
                >
                    <UploadIcon className="w-12 h-12 mb-4" />
                    <span className="text-xl font-semibold">Upload a Drawing</span>
                    <span className="mt-1">Click here to start the magic</span>
                </button>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <ImagePanel src={originalImage} title="Original Drawing" />
                    <ImagePanel src={generatedImage} title="Magical Creation" isLoading={isLoading}>
                        {!isLoading && <div className="text-slate-500 text-center">Your new creation will appear here!</div>}
                    </ImagePanel>
                </div>

                {generatedText && (
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <BookIcon className="w-6 h-6 text-sky-400 flex-shrink-0" />
                            <h4 className="text-xl font-bold text-slate-200">Story Starter</h4>
                        </div>
                        <p className="text-slate-300 leading-relaxed font-serif">{generatedText}</p>
                    </div>
                )}
                
                {error && <p className="text-center text-red-400 bg-red-900/50 p-3 rounded-md">{error}</p>}

                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-4">
                    <div>
                        <label htmlFor="prompt-input" className="font-semibold text-slate-200">What magic should we add?</label>
                        <textarea
                            id="prompt-input"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., Make this rocket fly through space with stars and planets..."
                            className="w-full bg-slate-900 border border-slate-600 rounded-md p-3 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition mt-2"
                            rows={3}
                            aria-label="Prompt for image generation"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        id="story-checkbox"
                        checked={generateStory}
                        onChange={(e) => setGenerateStory(e.target.checked)}
                        className="w-4 h-4 rounded text-violet-500 bg-slate-700 border-slate-600 focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-violet-500 cursor-pointer"
                    />
                    <label htmlFor="story-checkbox" className="text-slate-300 select-none cursor-pointer">
                        ✍️ Also, write a short story starter
                    </label>
                    </div>

                    <div>
                        <p className="text-sm font-medium text-slate-400 mb-2">Need inspiration?</p>
                        <div className="flex flex-wrap gap-2">
                            {isAnalyzing && <p className="text-slate-400 text-sm animate-pulse">Thinking of ideas...</p>}
                            {dynamicSuggestions.map(suggestion => (
                                <button
                                    key={suggestion}
                                    onClick={() => setPrompt(prev => prev ? `${prev}. ${suggestion}` : suggestion)}
                                    className="bg-slate-700 text-slate-300 text-sm px-3 py-1 rounded-full hover:bg-slate-600 hover:text-white transition-colors"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 pt-2">
                        <button
                            onClick={handleGenerate}
                            disabled={isLoading}
                            className="flex-grow w-full bg-violet-600 text-white font-bold py-3 px-4 rounded-md flex items-center justify-center gap-2
                                    hover:bg-violet-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-200"
                        >
                            <SparklesIcon className="w-5 h-5" />
                            {isLoading ? 'Creating...' : 'Imagine!'}
                        </button>
                        {generatedImage && (
                            <>
                                <button
                                    onClick={() => setIsShareModalOpen(true)}
                                    className="w-full sm:w-auto bg-teal-600 text-white font-bold py-3 px-4 rounded-md flex items-center justify-center gap-2 hover:bg-teal-500 transition-all duration-200"
                                    aria-label="Share creation"
                                >
                                <ShareIcon className="w-5 h-5" /> Share
                                </button>
                                <button
                                    onClick={handleDownload}
                                    className="w-full sm:w-auto bg-sky-600 text-white font-bold py-3 px-4 rounded-md flex items-center justify-center gap-2 hover:bg-sky-500 transition-all duration-200"
                                    aria-label="Download generated image"
                                >
                                <DownloadIcon className="w-5 h-5" /> Download
                                </button>
                            </>
                        )}
                        <button
                            onClick={handleClear}
                            className="w-full sm:w-auto bg-slate-700 text-slate-300 font-bold py-3 px-4 rounded-md hover:bg-slate-600 transition-all duration-200"
                        >
                        Start Over
                        </button>
                    </div>
                </div>
            </div>
            <ShareModal 
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                imageSrc={generatedImage}
                userPrompt={prompt}
                storyText={generatedText}
            />
        </>
    );
};

export default CreativeCanvas;
