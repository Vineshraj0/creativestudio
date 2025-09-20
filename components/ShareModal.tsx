import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import FacebookIcon from './icons/FacebookIcon';
import InstagramIcon from './icons/InstagramIcon';
import ClipboardIcon from './icons/ClipboardIcon';
import SparklesIcon from './icons/SparklesIcon';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string | null;
  userPrompt: string | null;
  storyText: string | null;
}

interface SocialContent {
    facebookCaption: string;
    instagramCaption: string;
    hashtags: string[];
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, imageSrc, userPrompt, storyText }) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [socialContent, setSocialContent] = useState<SocialContent | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'facebook' | 'instagram'>('facebook');
    const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedStates({ [id]: true });
        setTimeout(() => setCopiedStates(prev => ({ ...prev, [id]: false })), 2000);
    };

    const handleDownload = () => {
        if (!imageSrc) return;
        const link = document.createElement('a');
        link.href = imageSrc;
        link.download = 'creation.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    useEffect(() => {
        if (isOpen && !socialContent && userPrompt) {
            const generateSocialContent = async () => {
                setIsLoading(true);
                setError(null);
                try {
                    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
                    const generationPrompt = `
                        You are a social media assistant for a kindergarten teacher. Based on the following context, create content to share a student's artwork.
                        Context:
                        - Original idea from teacher: "${userPrompt}"
                        - AI-generated story starter: "${storyText || 'No story was generated.'}"

                        Generate two social media posts:
                        1. A Facebook Post: A warm, descriptive caption (2-3 sentences) for a school's Facebook page to engage parents.
                        2. An Instagram Post: A shorter, punchier caption with visual language, followed by 5-7 relevant and popular hashtags.

                        Return a JSON object with keys: "facebookCaption", "instagramCaption", and "hashtags" (an array of strings).
                    `;

                    const response = await ai.models.generateContent({
                        model: 'gemini-2.5-flash',
                        contents: generationPrompt,
                        config: {
                            responseMimeType: "application/json",
                            responseSchema: {
                                type: Type.OBJECT,
                                properties: {
                                    facebookCaption: { type: Type.STRING },
                                    instagramCaption: { type: Type.STRING },
                                    hashtags: { type: Type.ARRAY, items: { type: Type.STRING } }
                                }
                            }
                        },
                    });

                    const parsed = JSON.parse(response.text.trim());
                    setSocialContent(parsed);

                } catch (e) {
                    console.error("Social content generation failed:", e);
                    setError("Could not generate sharing suggestions. Please try again.");
                } finally {
                    setIsLoading(false);
                }
            };
            generateSocialContent();
        } else if (!isOpen) {
            // Reset state on close
            setSocialContent(null);
            setError(null);
            setActiveTab('facebook');
        }
    }, [isOpen, userPrompt, storyText, socialContent]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose} role="dialog" aria-modal="true">
            <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-2xl shadow-2xl relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-3 right-3 text-slate-500 hover:text-white transition-colors" aria-label="Close share dialog">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
                
                <div className="p-6 sm:p-8">
                    <h2 className="text-2xl font-bold text-slate-100 mb-2">Share this Masterpiece!</h2>
                    <p className="text-slate-400 mb-6">Your Sharing Assistant has prepared captions for you.</p>

                    {isLoading && (
                        <div className="min-h-[250px] flex flex-col items-center justify-center text-center">
                             <SparklesIcon className="w-10 h-10 text-violet-400 animate-pulse" />
                            <p className="mt-3 text-slate-400">Generating social media captions...</p>
                        </div>
                    )}

                    {error && <p className="min-h-[250px] text-center text-red-400 flex items-center justify-center">{error}</p>}

                    {socialContent && (
                        <div>
                             <div className="flex border-b border-slate-700 mb-4">
                                <button onClick={() => setActiveTab('facebook')} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'facebook' ? 'border-b-2 border-sky-500 text-white' : 'text-slate-400 hover:text-white'}`}>
                                    <FacebookIcon className="w-5 h-5" /> Facebook
                                </button>
                                <button onClick={() => setActiveTab('instagram')} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'instagram' ? 'border-b-2 border-violet-500 text-white' : 'text-slate-400 hover:text-white'}`}>
                                    <InstagramIcon className="w-5 h-5" /> Instagram
                                </button>
                            </div>
                            
                            <div className="bg-slate-900/50 p-4 rounded-lg min-h-[200px] flex flex-col">
                                {activeTab === 'facebook' ? (
                                    <>
                                        <p className="text-slate-300 whitespace-pre-wrap flex-grow">{socialContent.facebookCaption}</p>
                                        <button onClick={() => handleCopy(socialContent.facebookCaption, 'fb_caption')} className="mt-4 self-end bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm py-2 px-3 rounded-md flex items-center gap-2 transition-colors">
                                            <ClipboardIcon className="w-4 h-4"/>{copiedStates['fb_caption'] ? 'Copied!' : 'Copy Caption'}
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-slate-300 whitespace-pre-wrap flex-grow">{socialContent.instagramCaption}</p>
                                        <div className="flex flex-wrap gap-2 mt-4">
                                            {socialContent.hashtags.map(tag => <span key={tag} className="text-xs text-violet-300 bg-violet-900/50 px-2 py-1 rounded">#{tag}</span>)}
                                        </div>
                                        <button onClick={() => handleCopy(`${socialContent.instagramCaption}\n\n${socialContent.hashtags.map(t => `#${t}`).join(' ')}`, 'ig_caption')} className="mt-4 self-end bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm py-2 px-3 rounded-md flex items-center gap-2 transition-colors">
                                           <ClipboardIcon className="w-4 h-4"/> {copiedStates['ig_caption'] ? 'Copied!' : 'Copy Caption & Hashtags'}
                                        </button>
                                    </>
                                )}
                            </div>

                            <div className="mt-6 flex flex-col sm:flex-row gap-4">
                                <button onClick={handleDownload} className="flex-1 bg-slate-600 hover:bg-slate-500 text-white font-bold py-3 px-4 rounded-md text-center transition-colors">
                                    1. Download Image
                                </button>
                                <div className="flex-1 border border-dashed border-slate-600 rounded-md py-3 px-4 text-center text-slate-400">
                                   2. Paste into your social media post!
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShareModal;
