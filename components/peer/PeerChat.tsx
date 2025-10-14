import React, { useState, useEffect, useRef } from 'react';
import { type Peer, type PeerChatMessage, type StressDataHook } from '../../types';
import { getPeerReply } from '../../services/geminiService';
import { Send, ArrowLeft, Loader2, User } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface PeerChatProps {
    peer: Peer;
    stressDataHook: StressDataHook;
    onBack: () => void;
}

const PeerChat: React.FC<PeerChatProps> = ({ peer, stressDataHook, onBack }) => {
    const { peerChats, addPeerMessage } = stressDataHook;
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { t } = useLanguage();

    const chatHistory = peerChats[peer.id] || [];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [chatHistory]);

    const handleSend = async () => {
        if (input.trim() === '' || isLoading) return;
        
        const userMessageText = input;
        setInput('');

        addPeerMessage(peer.id, { role: 'user', text: userMessageText });

        setIsLoading(true);

        const aiReply = await getPeerReply(userMessageText, chatHistory);
        
        addPeerMessage(peer.id, { role: 'peer', text: aiReply });

        setIsLoading(false);
    };

    return (
        <div className="flex flex-col h-full glass-card rounded-2xl shadow-lg animate-fadeIn">
            <header className="flex items-center p-4 border-b border-border">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-secondary mr-3">
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold mr-3">
                    {peer.avatar}
                </div>
                <div>
                    <h3 className="font-bold text-foreground">{peer.name}</h3>
                    <p className="text-sm text-muted-foreground">{peer.title}</p>
                </div>
            </header>

            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                {chatHistory.map((msg) => {
                    if (msg.role === 'user') {
                        return (
                             <div key={msg.id} className="flex items-start justify-end gap-3">
                                <div className="max-w-md p-3 rounded-2xl shadow-md bg-primary text-primary-foreground rounded-br-none">
                                    <p className="text-sm leading-relaxed">{msg.text}</p>
                                </div>
                                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                                    <User className="h-5 w-5 text-muted-foreground" />
                                </div>
                            </div>
                        )
                    }
                    if (msg.role === 'peer') {
                        return (
                            <div key={msg.id} className="flex items-start gap-3">
                                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                                    {peer.avatar}
                                </div>
                                <div className="max-w-md p-3 rounded-2xl shadow-md bg-secondary text-secondary-foreground rounded-bl-none">
                                    <p className="text-sm leading-relaxed">{msg.text}</p>
                                </div>
                            </div>
                        )
                    }
                    return null;
                })}
                {isLoading && (
                    <div className="flex items-end gap-3 animate-fadeIn">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                            {peer.avatar}
                        </div>
                        <div className="max-w-md p-3 rounded-2xl shadow-md bg-secondary">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-card border-t border-border rounded-b-2xl">
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={t('peer_chat_placeholder_dynamic').replace('{peerName}', peer.name)}
                        className="w-full py-3 pl-4 pr-12 text-sm bg-background rounded-full text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-primary text-primary-foreground hover:bg-violet-700 disabled:bg-muted transition-colors"
                        aria-label={t('chat_send_aria')}
                    >
                        <Send className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PeerChat;