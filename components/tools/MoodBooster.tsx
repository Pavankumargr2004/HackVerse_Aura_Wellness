import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Lightbulb, Sparkles, Loader2 } from 'lucide-react';
import { getPositivePrompt } from '../../services/geminiService';
import { useLanguage } from '../../contexts/LanguageContext';

interface MoodBoosterProps {
  onBack: () => void;
}

const MoodBooster: React.FC<MoodBoosterProps> = ({ onBack }) => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const { t } = useLanguage();

    const fetchPrompt = async (type: 'quote' | 'gratitude') => {
        setIsLoading(true);
        const newPrompt = await getPositivePrompt(type);
        setPrompt(newPrompt);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchPrompt('quote');
    }, []);

    return (
        <div className="glass-card h-full rounded-2xl p-4 sm:p-6 flex flex-col animate-fadeIn max-w-2xl mx-auto">
            <button onClick={onBack} className="self-start mb-4 text-primary hover:text-violet-300 font-semibold transition-colors flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" /> {t('tool_back_to_tools')}
            </button>
            <div className="text-center mb-6">
                 <Sparkles className="h-10 w-10 text-primary mx-auto mb-2" />
                <h2 className="text-3xl font-bold">{t('tool_booster_main_title')}</h2>
                <p className="text-muted-foreground">{t('tool_booster_main_desc')}</p>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center bg-secondary rounded-2xl p-8 text-center">
                {isLoading ? (
                    <Loader2 className="h-12 w-12 text-primary animate-spin" />
                ) : (
                    <p className="text-xl sm:text-2xl font-semibold text-foreground animate-fadeIn">
                        "{prompt}"
                    </p>
                )}
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <button onClick={() => fetchPrompt('quote')} disabled={isLoading} className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg font-semibold text-white bg-primary hover:bg-violet-700 transition-colors disabled:bg-muted">
                    <Lightbulb className="h-5 w-5"/> {t('tool_booster_new_quote')}
                </button>
                 <button onClick={() => fetchPrompt('gratitude')} disabled={isLoading} className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:bg-muted">
                    <Sparkles className="h-5 w-5"/> {t('tool_booster_new_prompt')}
                </button>
            </div>
        </div>
    );
};

export default MoodBooster;
