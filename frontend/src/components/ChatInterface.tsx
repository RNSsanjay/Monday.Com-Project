import React, { useState, useRef, useEffect } from 'react';
import {
    Terminal,
    Loader2,
    Copy,
    Check,
    Sparkles,
    ArrowUp,
    Mic,
    MicOff,
    Zap,
    CornerDownRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
    role: 'user' | 'agent';
    content: string;
    trace?: string[];
}

import { AgentService } from '../services/agentService';

const agent = new AgentService();

// Speech Recognition Types
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

interface ChatInterfaceProps {
    sessionId: string;
    initialMessages: Message[];
    searchTerm?: string;
    onMessagesUpdate: (messages: Message[], title?: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
    sessionId,
    initialMessages,
    searchTerm = '',
    onMessagesUpdate
}) => {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const messageRefs = useRef<(HTMLDivElement | null)[]>([]);

    const hasUserMessages = messages.some(m => m.role === 'user');

    // Voice Intelligence: Web Speech API Implementation
    const startListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Speech recognition is not supported in this browser. Please use Chrome or Safari.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = () => setIsListening(false);

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInput(prev => (prev ? `${prev} ${transcript}` : transcript));
        };

        recognition.start();
    };

    useEffect(() => {
        if (scrollRef.current && !searchTerm) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, loading]);

    useEffect(() => {
        const userMsg = messages.find(m => m.role === 'user');
        const title = userMsg ? userMsg.content.slice(0, 30) + (userMsg.content.length > 30 ? '...' : '') : undefined;
        onMessagesUpdate(messages, title);
    }, [messages]);

    useEffect(() => {
        if (searchTerm && searchTerm.length > 2) {
            const firstMatchIdx = messages.findIndex(m =>
                m.content.toLowerCase().includes(searchTerm.toLowerCase())
            );
            if (firstMatchIdx !== -1 && messageRefs.current[firstMatchIdx]) {
                messageRefs.current[firstMatchIdx]?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        }
    }, [searchTerm]);

    const handleSend = async (customQuery?: string) => {
        const query = customQuery || input;
        if (!query.trim() || loading) return;

        setInput('');
        const newMessages: Message[] = [...messages, { role: 'user', content: query }];
        setMessages(newMessages);
        setLoading(true);

        try {
            const data = await agent.chat(query);

            setMessages(prev => [...prev, {
                role: 'agent',
                content: data.response,
                trace: data.trace
            }]);
        } catch (error: any) {
            setMessages(prev => [...prev, {
                role: 'agent',
                content: `Protocol Exception: ${error.message || 'System error detected'}. Awaiting stabilization.`
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = (text: string, index: number) => {
        const cleanText = text.replace(/\*\*|\d\.\s/g, '');
        navigator.clipboard.writeText(cleanText);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const highlightText = (text: string, term: string) => {
        if (!term || term.length < 3) return text;
        const parts = text.split(new RegExp(`(${term})`, 'gi'));
        return (
            <>
                {parts.map((part, i) =>
                    part.toLowerCase() === term.toLowerCase() ?
                        <span key={i} className="search-highlight">{part}</span> : part
                )}
            </>
        );
    };

    const isStructuredResponse = (content: string) => {
        return content.includes('**Data Summary**') || content.includes('**Business Insight**');
    };

    return (
        <div className="flex flex-col h-full w-full max-w-4xl relative mx-auto">
            <AnimatePresence mode="wait">
                {!hasUserMessages ? (
                    /* STATE: START SCREEN (CENTERED) */
                    <motion.div
                        key="start-screen"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
                        className="flex-1 flex flex-col items-center justify-center -mt-32 w-full px-4"
                    >
                        <div className="text-center mb-16">
                            <h2 className="text-5xl font-bold text-[#3f3f46] tracking-tight mb-5">What are you working on?</h2>
                            <div className="flex items-center justify-center gap-3 text-neutral-400">
                                <Zap size={16} className="text-amber-500 fill-amber-500" />
                                <span className="text-[11px] font-black uppercase tracking-[0.5em]">Protocol V4.0 Active Intelligence</span>
                            </div>
                        </div>

                        <div className="w-full max-w-2xl">
                            <div className="mb-4 ml-8">
                                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.4em]">Protocol V3.2 Adaptive Executive Intelligence</span>
                            </div>
                            <form
                                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                className={`relative flex items-center bg-[#3f3f46] shadow-[0_50px_100px_rgba(0,0,0,0.18)] rounded-full p-2 pl-8 border border-white/[0.05] transition-all duration-500 focus-within:ring-[12px] focus-within:ring-[#3f3f46]/[0.02] ${isListening ? 'ring-[12px] ring-amber-500/10' : ''}`}
                            >
                                <input
                                    autoFocus
                                    autoComplete="off"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={isListening ? "Listening..." : "Input strategic query..."}
                                    className="flex-1 bg-transparent border-none py-3.5 focus:outline-none text-white font-medium text-[16px] placeholder:text-neutral-500 placeholder:text-[14px] placeholder:tracking-tight"
                                />
                                <div className="flex items-center gap-2 pr-1.5">
                                    <button
                                        type="button"
                                        onClick={startListening}
                                        className={`p-3 transition-all rounded-full hover:bg-white/5 ${isListening ? 'text-amber-500 bg-amber-500/10 animate-pulse' : 'text-neutral-400 hover:text-white'}`}
                                    >
                                        {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading || !input.trim()}
                                        className="bg-white text-[#3f3f46] hover:scale-105 disabled:opacity-30 w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-2xl"
                                    >
                                        <ArrowUp size={22} strokeWidth={2.5} />
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                ) : (
                    /* STATE: CHAT VIEW (ACTIVE FEED) */
                    <motion.div
                        key="chat-view"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex-1 flex flex-col h-full overflow-hidden"
                    >
                        {/* Feed Container */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto px-6 py-12 flex flex-col gap-16 no-scrollbar"
                        >
                            {messages.map((m, idx) => (
                                <motion.div
                                    key={idx}
                                    ref={el => messageRefs.current[idx] = el}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4 }}
                                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`group relative ${m.role === 'user' ? 'max-w-[80%]' : 'w-full'}`}>

                                        {m.role === 'agent' && (
                                            <div className="absolute -top-8 left-2 flex items-center gap-6">
                                                <button
                                                    onClick={() => handleCopy(m.content, idx)}
                                                    className="flex items-center gap-2 text-[10px] font-black text-[#3f3f46]/[0.4] hover:text-[#3f3f46] uppercase tracking-[0.2em] transition-all"
                                                >
                                                    {copiedIndex === idx ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                                                    {copiedIndex === idx ? 'Intel Copied' : 'Copy'}
                                                </button>
                                                <div className="flex items-center gap-2 text-[10px] font-black text-neutral-300 uppercase tracking-[0.2em]">
                                                    <div className="w-1.5 h-1.5 bg-[#3f3f46]/[0.1] rounded-full" />
                                                    Protocol Insight
                                                </div>
                                            </div>
                                        )}

                                        {m.role === 'user' && (
                                            <div className="bg-[#3f3f46] text-white px-8 py-5 rounded-2xl rounded-tr-sm font-semibold shadow-xl text-[16px] leading-relaxed tracking-tight">
                                                {highlightText(m.content, searchTerm)}
                                            </div>
                                        )}

                                        {m.role === 'agent' && (
                                            <div className="flex flex-col gap-10">
                                                {m.trace && m.trace.length > 0 && (
                                                    <div className="bg-neutral-50 border-l border-[#3f3f46]/[0.1] p-6 rounded-r-2xl font-mono text-[10px] leading-relaxed opacity-60 hover:opacity-100 transition-opacity">
                                                        <div className="flex items-center gap-3 text-neutral-400 font-black uppercase tracking-[0.5em] mb-3">
                                                            <Terminal size={12} />
                                                            Process Pipeline
                                                        </div>
                                                        {m.trace.map((t, i) => (
                                                            <div key={i} className="text-neutral-500 mb-1 flex items-start gap-4">
                                                                <span className="text-neutral-300 w-3 font-bold">{i + 1}</span>
                                                                <span className="tracking-tight">{highlightText(t, searchTerm)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="flex flex-col gap-12">
                                                    {isStructuredResponse(m.content) ? (
                                                        m.content.split(/\d\.\s\*\*/).map((section, si) => {
                                                            if (!section.trim()) return null;

                                                            const lines = section.split('\n');
                                                            const heading = lines[0].replace(/\*\*/g, '').trim();
                                                            const body = lines.slice(1).join('\n').trim();
                                                            const isRecommendations = heading.toLowerCase().includes('recommend');
                                                            const tableMatch = body.match(/\|(.+)\|/);
                                                            const hasTable = !!tableMatch;

                                                            return (
                                                                <motion.div
                                                                    key={si}
                                                                    className={`${isRecommendations ? 'pt-4' : 'bg-white border border-[#3f3f46]/[0.04] rounded-2xl p-10 shadow-[0_4px_20px_rgba(0,0,0,0.02)]'}`}
                                                                >
                                                                    <div className="flex justify-between items-center mb-4">
                                                                        <h3 className={`text-[11px] font-black uppercase tracking-[0.5em] ${isRecommendations ? 'text-neutral-400' : 'text-[#3f3f46]'}`}>
                                                                            {isRecommendations ? "Follow-ups" : (heading || "Analytical Insight")}
                                                                        </h3>
                                                                    </div>

                                                                    {isRecommendations ? (
                                                                        <div className="flex flex-col border-t border-[#3f3f46]/[0.05]">
                                                                            {body.split('\n').map((q, qi) => {
                                                                                const cleanQ = q.replace(/^\s*-\s*|\d\.\s*/, '').trim();
                                                                                if (!cleanQ || cleanQ.length < 5) return null;
                                                                                return (
                                                                                    <button
                                                                                        key={qi}
                                                                                        onClick={() => handleSend(cleanQ)}
                                                                                        className="group/item flex items-center gap-4 py-4 border-b border-[#3f3f46]/[0.05] text-[15px] text-[#3f3f46] hover:bg-[#3f3f46]/[0.02] transition-all duration-300 font-medium tracking-tight text-left"
                                                                                    >
                                                                                        <CornerDownRight size={16} className="text-neutral-300 group-hover/item:text-[#3f3f46] transition-colors" />
                                                                                        <span className="flex-1 opacity-80 group-hover/item:opacity-100 transition-opacity">
                                                                                            {highlightText(cleanQ, searchTerm)}
                                                                                        </span>
                                                                                    </button>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    ) : (
                                                                        <div className="text-neutral-700 text-[17px] leading-[1.8] font-medium tracking-tight whitespace-pre-wrap">
                                                                            {hasTable ? (
                                                                                <div className="overflow-x-auto my-8 border border-[#3f3f46]/[0.03] rounded-xl bg-[#fcfcfd]">
                                                                                    <table className="w-full text-left">
                                                                                        <thead>
                                                                                            <tr className="border-b border-[#3f3f46]/[0.05]">
                                                                                                {body.split('\n')[0].split('|').filter(c => c.trim()).map((h, i) => (
                                                                                                    <th key={i} className="py-4 px-6 text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400">{h.trim()}</th>
                                                                                                ))}
                                                                                            </tr>
                                                                                        </thead>
                                                                                        <tbody>
                                                                                            {body.split('\n').slice(2).filter(r => r.trim() && r.includes('|')).map((r, ri) => (
                                                                                                <tr key={ri} className="border-b border-[#3f3f46]/[0.02] hover:bg-white transition-colors">
                                                                                                    {r.split('|').filter(c => c.trim()).map((c, ci) => (
                                                                                                        <td key={ci} className="py-5 px-6 text-[14px] font-bold text-neutral-600">{highlightText(c.trim(), searchTerm)}</td>
                                                                                                    ))}
                                                                                                </tr>
                                                                                            ))}
                                                                                        </tbody>
                                                                                    </table>
                                                                                </div>
                                                                            ) : highlightText(body, searchTerm)}
                                                                        </div>
                                                                    )}
                                                                </motion.div>
                                                            );
                                                        })
                                                    ) : (
                                                        <div className="bg-white border border-[#3f3f46]/[0.04] rounded-2xl p-10 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                                                            <div className="text-neutral-700 text-[17px] leading-[1.8] font-semibold tracking-tight whitespace-pre-wrap">
                                                                {highlightText(m.content, searchTerm)}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                            {loading && (
                                <motion.div className="flex justify-start">
                                    <div className="flex items-center gap-4 py-4 px-8 bg-[#3f3f46] text-white rounded-xl text-[10px] font-black uppercase tracking-[0.6em] shadow-xl">
                                        <Loader2 size={14} className="animate-spin" />
                                        Analyzing Pipeline
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Docked Input Wrapper */}
                        <div className="w-full px-10 pb-8 pt-4">
                            <form
                                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                className={`relative flex items-center bg-[#3f3f46] shadow-[0_20px_40px_rgba(0,0,0,0.08)] rounded-full p-1.5 pl-6 border border-white/[0.05] transition-all duration-500 focus-within:ring-[8px] focus-within:ring-[#3f3f46]/[0.02] ${isListening ? 'ring-[8px] ring-amber-500/10' : ''}`}
                            >
                                <input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={isListening ? "Listening..." : "Message AstraBI..."}
                                    className="flex-1 bg-transparent border-none py-2.5 focus:outline-none text-white font-medium text-[15px] placeholder:text-neutral-500"
                                />
                                <div className="flex items-center gap-1.5 pr-1.5">
                                    <button
                                        type="button"
                                        onClick={startListening}
                                        className={`p-2.5 transition-all rounded-full hover:bg-white/5 ${isListening ? 'text-amber-500 bg-amber-500/10 animate-pulse' : 'text-neutral-400 hover:text-white'}`}
                                    >
                                        {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading || !input.trim()}
                                        className="bg-white text-[#3f3f46] w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90"
                                    >
                                        <ArrowUp size={18} />
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ChatInterface;
