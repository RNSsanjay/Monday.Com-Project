import React, { useState, useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import {
    Menu,
    X,
    Plus,
    Search,
    MessageSquare,
    Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Session {
    id: string;
    title: string;
    timestamp: number;
    messages: any[];
}

const App: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sessions, setSessions] = useState<Session[]>([]);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

    // Load sessions from sessionStorage on init
    useEffect(() => {
        const saved = sessionStorage.getItem('astra_sessions');
        if (saved) {
            const parsed = JSON.parse(saved);
            setSessions(parsed);
            if (parsed.length > 0) {
                setActiveSessionId(parsed[0].id);
            }
        } else {
            // Start fresh session if none exist
            createNewSession();
        }
    }, []);

    // Save sessions to sessionStorage whenever they change
    useEffect(() => {
        if (sessions.length > 0) {
            sessionStorage.setItem('astra_sessions', JSON.stringify(sessions));
        }
    }, [sessions]);

    const createNewSession = () => {
        const newId = Date.now().toString();
        const newSession: Session = {
            id: newId,
            title: 'New Analysis',
            timestamp: Date.now(),
            messages: [] // Will be populated by ChatInterface
        };
        setSessions(prev => [newSession, ...prev]);
        setActiveSessionId(newId);
    };

    const deleteSession = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const updated = sessions.filter(s => s.id !== id);
        setSessions(updated);
        if (activeSessionId === id) {
            if (updated.length > 0) {
                setActiveSessionId(updated[0].id);
            } else {
                createNewSession();
            }
        }
    };

    const updateSessionMessages = (id: string, messages: any[], title?: string) => {
        setSessions(prev => prev.map(s => {
            if (s.id === id) {
                return {
                    ...s,
                    messages,
                    title: title || s.title
                };
            }
            return s;
        }));
    };

    const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];

    return (
        <div className="flex h-screen w-full bg-[#ffffff] overflow-hidden font-sans">
            {/* Animated Mesh Background */}
            <div className="mesh-gradient" />

            {/* Premium Sidebar: V3 Persistent */}
            <motion.aside
                initial={false}
                animate={{
                    width: sidebarOpen ? 280 : 0,
                    opacity: sidebarOpen ? 1 : 0,
                    x: sidebarOpen ? 0 : -20
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="h-full bg-[#f8f8f8] border-r border-[#3f3f46]/[0.04] flex flex-col overflow-hidden relative z-50 shadow-2xl"
            >
                {/* Brand Header */}
                <div className="p-10 mb-2">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#3f3f46] rounded-xl flex items-center justify-center shadow-2xl">
                            <span className="text-white font-black text-lg">A</span>
                        </div>
                        <div>
                            <h1 className="text-[15px] font-black tracking-[0.2em] text-[#3f3f46]">ASTRABI</h1>
                            <p className="text-[9px] font-black text-neutral-400 uppercase tracking-[0.4em]">Protocol V4.0</p>
                        </div>
                    </div>
                </div>

                {/* New Analysis Button */}
                <div className="px-6 mb-8">
                    <button
                        onClick={createNewSession}
                        className="w-full flex items-center justify-center gap-3 bg-[#3f3f46] text-white px-4 py-4 rounded-2xl shadow-xl hover:bg-[#52525b] transition-all active:scale-[0.98] group"
                    >
                        <Plus size={18} />
                        <span className="text-[12px] font-bold uppercase tracking-widest">New Analysis</span>
                    </button>
                </div>

                {/* Session History (Real Data) */}
                <div className="flex-1 px-4 overflow-y-auto no-scrollbar pb-8">
                    <h3 className="px-4 text-[10px] font-black text-neutral-300 uppercase tracking-[0.4em] mb-4">Analysis History</h3>
                    <div className="flex flex-col gap-1.5">
                        <AnimatePresence>
                            {sessions.map(s => (
                                <motion.div
                                    key={s.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    onClick={() => setActiveSessionId(s.id)}
                                    className={`
                                        group flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl transition-all cursor-pointer
                                        ${activeSessionId === s.id ? 'bg-white shadow-xl ring-1 ring-black/5' : 'hover:bg-black/[0.02]'}
                                    `}
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <MessageSquare size={14} className={activeSessionId === s.id ? 'text-[#3f3f46]' : 'text-neutral-300'} />
                                        <div className="flex flex-col overflow-hidden">
                                            <span className={`text-[12px] font-bold truncate ${activeSessionId === s.id ? 'text-[#3f3f46]' : 'text-neutral-500'}`}>
                                                {s.title}
                                            </span>
                                            <span className="text-[9px] text-neutral-300 font-medium">
                                                {new Date(s.timestamp).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => deleteSession(e, s.id)}
                                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 hover:text-red-500 rounded-lg transition-all"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col relative overflow-hidden">
                {/* Top Navigation */}
                <header className="h-20 flex items-center justify-between px-10 z-20">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-3 hover:bg-[#3f3f46]/[0.03] rounded-2xl transition-all text-[#3f3f46] relative w-12 h-12 flex items-center justify-center overflow-hidden"
                        >
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={sidebarOpen ? 'open' : 'closed'}
                                    initial={{ y: 20, opacity: 0, rotate: 90 }}
                                    animate={{ y: 0, opacity: 1, rotate: 0 }}
                                    exit={{ y: -20, opacity: 0, rotate: -90 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
                                </motion.div>
                            </AnimatePresence>
                        </button>

                        <div className="flex items-center gap-3 px-4 py-1.5 bg-white/40 backdrop-blur-xl rounded-full border border-[#3f3f46]/[0.04] shadow-sm">
                            <div className="w-2 h-2 bg-[#3f3f46] rounded-full animate-pulse" />
                            <span className="text-[10px] font-black text-[#3f3f46] uppercase tracking-[0.3em] leading-none text-nowrap">Astra Protocol Active</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative group hidden md:block">
                            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-[#3f3f46] transition-colors" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="SEARCH PROTOCOL DATA..."
                                className="bg-white/40 border border-[#3f3f46]/[0.05] rounded-xl pl-11 pr-5 py-2.5 text-[11px] font-black focus:outline-none focus:ring-2 focus:ring-[#3f3f46]/[0.03] w-64 transition-all shadow-sm placeholder:text-neutral-300 placeholder:uppercase"
                            />
                        </div>
                    </div>
                </header>

                {/* Chat Interface Container */}
                <div className="flex-1 flex flex-col overflow-hidden relative max-w-5xl mx-auto w-full px-8 items-center">
                    {activeSessionId && (
                        <ChatInterface
                            key={activeSessionId}
                            sessionId={activeSessionId}
                            initialMessages={activeSession?.messages || []}
                            searchTerm={searchTerm}
                            onMessagesUpdate={(msgs, title) => updateSessionMessages(activeSessionId, msgs, title)}
                        />
                    )}
                </div>
            </main>
        </div>
    );
};

export default App;
