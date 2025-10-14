import React, { useState, useRef, useEffect } from 'react';
import { type ChatMessage, type StressDataHook, type ChatHistoryHook, type ChatSettingsHook, ChatSettings, ConversationSummary } from '../types';
import { processUserPrompt, summarizeConversation } from '../services/geminiService';
import { Send, Bot, User, RefreshCw, Sparkles, FileText, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface ChatInterfaceProps {
  stressDataHook: StressDataHook;
  chatHistoryHook: ChatHistoryHook;
  chatSettingsHook: ChatSettingsHook;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ stressDataHook, chatHistoryHook, chatSettingsHook }) => {
  const {
    addStressLog,
    addWellnessActivity,
    addSleepLog,
    addEventLog,
    stressLogs,
    wellnessActivities,
    sleepLogs,
    eventLogs
  } = stressDataHook;

  const { messages, addMessage, clearHistory } = chatHistoryHook;
  const { settings, setSettings } = chatSettingsHook;
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);
  
  const handleRefresh = () => {
      if (window.confirm(t('chat_refresh_confirm'))) {
          clearHistory();
      }
  }
  
  const handleSettingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value as ChatSettings[keyof ChatSettings] }));
  };

  const handleSummarize = async () => {
    if (isLoading || isSummarizing) return;
    setIsSummarizing(true);
    try {
        const summaryResult = await summarizeConversation(messages);
        const summaryMessage: ChatMessage = {
            id: new Date().toISOString() + '-summary',
            role: 'model',
            text: t('chat_summary_title'),
            timestamp: new Date().toISOString(),
            isSummary: true,
            summary: summaryResult,
        };
        addMessage(summaryMessage);
    } catch (error) {
        console.error("Failed to summarize conversation:", error);
        const errorMessage: ChatMessage = {
            id: new Date().toISOString() + 'model-error',
            role: 'model',
            text: t('chat_summary_error'),
            timestamp: new Date().toISOString(),
        };
        addMessage(errorMessage);
    } finally {
        setIsSummarizing(false);
    }
  };

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: ChatMessage = {
      id: new Date().toISOString(),
      role: 'user',
      text: input,
      timestamp: new Date().toISOString(),
    };

    addMessage(userMessage);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
        const response = await processUserPrompt(
          currentInput,
          messages,
          settings,
          stressLogs,
          sleepLogs,
          eventLogs,
          wellnessActivities
        );
        
        if (response) {
          if (response.command === 'LOG_STRESS' && response.payload?.level) {
            addStressLog(response.payload.level);
          } else if (response.command === 'WELLNESS_ACTIVITY' && response.payload?.description) {
            addWellnessActivity(response.payload.description);
          } else if (response.command === 'LOG_SLEEP' && response.payload?.hours) {
            addSleepLog(response.payload.hours);
          } else if (response.command === 'LOG_EVENT' && response.payload?.description) {
            addEventLog(response.payload.description);
          }
          
          const modelMessage: ChatMessage = {
            id: new Date().toISOString() + 'model',
            role: 'model',
            text: response.commentary || "I'm not sure how to respond to that.",
            timestamp: new Date().toISOString(),
            isAnalysis: response.command === 'ANALYZE_BURNOUT',
          };
          addMessage(modelMessage);
        }
    } catch (error) {
        console.error("Failed to process user prompt:", error);
        const errorMessage: ChatMessage = {
        id: new Date().toISOString() + 'model-error',
        role: 'model',
        text: t('chat_error_generic'),
        timestamp: new Date().toISOString(),
        };
        addMessage(errorMessage);
    } finally {
        setIsLoading(false);
    }
  };

  const SettingSelect = ({ label, name, value, options }: { label: string; name: keyof ChatSettings; value: string; options: { value: string; label: string }[] }) => (
    <div className="flex items-center gap-2">
      <label htmlFor={name} className="text-sm font-medium text-muted-foreground whitespace-nowrap">{label}</label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={handleSettingChange}
        className="py-1 px-2 text-sm bg-secondary rounded-md focus:outline-none focus:ring-2 focus:ring-primary border border-border"
      >
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-card rounded-2xl shadow-lg">
      <header className="flex flex-col sm:flex-row items-center justify-between p-4 border-b border-border flex-shrink-0 gap-4">
          <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
              <Bot size={20} className="text-primary" />
              {t('chat_header')}
          </h3>
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-center">
            <SettingSelect
              label={t('chat_persona')}
              name="personality"
              value={settings.personality}
              options={[
                { value: 'empathetic', label: t('chat_persona_empathetic') },
                { value: 'professional', label: t('chat_persona_professional') },
                { value: 'friendly', label: t('chat_persona_friendly') },
                { value: 'stoic', label: t('chat_persona_stoic') }
              ]}
            />
            <SettingSelect
              label={t('chat_tone')}
              name="tone"
              value={settings.tone}
              options={[
                { value: 'casual', label: t('chat_tone_casual') },
                { value: 'formal', label: t('chat_tone_formal') }
              ]}
            />
             <SettingSelect
              label={t('chat_verbosity')}
              name="verbosity"
              value={settings.verbosity}
              options={[
                { value: 'concise', label: t('chat_verbosity_concise') },
                { value: 'balanced', label: t('chat_verbosity_balanced') },
                { value: 'detailed', label: t('chat_verbosity_detailed') }
              ]}
            />
            <button
                onClick={handleSummarize}
                disabled={isLoading || isSummarizing || messages.length < 3}
                className="p-2 rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={t('chat_summarize')}
                title={t('chat_summarize')}
            >
                {isSummarizing ? <Loader2 className="h-5 w-5 animate-spin"/> : <FileText className="h-5 w-5" />}
            </button>
            <button
                onClick={handleRefresh}
                className="p-2 rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                aria-label={t('chat_refresh')}
                title={t('chat_refresh')}
            >
                <RefreshCw className="h-5 w-5" />
            </button>
          </div>
      </header>
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {messages.map((msg) => {
          if (msg.isSummary && msg.summary) {
            return (
              <div key={msg.id} className="flex items-start justify-start gap-3 animate-fadeIn">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="max-w-lg w-full p-4 rounded-2xl bg-secondary text-secondary-foreground rounded-bl-none shadow-md border border-primary/50">
                    <h4 className="font-bold text-lg text-foreground mb-2">{msg.summary.title}</h4>
                    
                    {msg.summary.keyTakeaways.length > 0 && (
                        <>
                            <h5 className="font-semibold text-muted-foreground mt-3 mb-1 text-sm">{t('chat_summary_takeaways')}</h5>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                                {msg.summary.keyTakeaways.map((item, index) => <li key={`takeaway-${index}`}>{item}</li>)}
                            </ul>
                        </>
                    )}

                    {msg.summary.actionItems.length > 0 && (
                        <>
                            <h5 className="font-semibold text-muted-foreground mt-3 mb-1 text-sm">{t('chat_summary_actions')}</h5>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                                {msg.summary.actionItems.map((item, index) => <li key={`action-${index}`}>{item}</li>)}
                            </ul>
                        </>
                    )}
                </div>
              </div>
            );
          }
          if (msg.role === 'user') {
            return (
              <div key={msg.id} className="flex items-start justify-end gap-3 animate-fadeIn">
                <div className="max-w-lg p-3 rounded-2xl bg-primary text-primary-foreground rounded-br-none shadow-md">
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                </div>
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            );
          }
          if (msg.role === 'model') {
            return (
              <div key={msg.id} className="flex items-start justify-start gap-3 animate-fadeIn">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <div className="max-w-lg p-3 rounded-2xl bg-secondary text-secondary-foreground rounded-bl-none shadow-md">
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                </div>
              </div>
            );
          }
          return null;
        })}

        {isLoading && (
            <div className="flex items-end justify-start gap-3 animate-fadeIn">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <div className="max-w-lg p-3 rounded-2xl bg-secondary text-secondary-foreground rounded-bl-none shadow-md">
                     <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce"></span>
                    </div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-6 pt-0 mt-auto">
        <div className="border-t border-border mb-4"></div>
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t('chat_placeholder')}
            className="w-full py-3 pl-4 pr-12 text-sm bg-secondary rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary border border-transparent"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-primary disabled:text-gray-600 transition-colors"
            aria-label={t('chat_send_aria')}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
