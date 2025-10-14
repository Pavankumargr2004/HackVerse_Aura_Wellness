import React, { useState, useEffect } from 'react';
import { getIntervention } from '../services/geminiService';
import { Wind, BrainCircuit, HeartPulse, Loader2 } from 'lucide-react';
import SoundPlayer from './sound/SoundPlayer';
import { sounds } from './sound/sounds';
import { useLanguage } from '../contexts/LanguageContext';

type InterventionType = 'breathing' | 'mindfulness';

const BreathingExercise: React.FC<{ content: string }> = ({ content }) => {
    const [step, setStep] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const { t } = useLanguage();

    const instructions = content.split('\n').filter(line => line.trim() !== '' && /^\d/.test(line));

    useEffect(() => {
        if(instructions.length === 0) return;
        if (step < instructions.length) {
            const timer = setTimeout(() => {
                setStep(s => s + 1);
            }, 5000); 
            return () => clearTimeout(timer);
        } else {
            setIsComplete(true);
        }
    }, [step, instructions.length]);

    if (instructions.length === 0) {
        return <p className="text-gray-300">{content}</p>;
    }

    return (
        <div className="text-center flex flex-col items-center justify-center h-full">
            <div className="relative h-48 w-48 flex items-center justify-center mb-6">
                <div className="absolute inset-0 bg-violet-900/50 rounded-full animate-pulse-slow"></div>
                <div className={`absolute inset-0 bg-violet-600 rounded-full transition-transform duration-[5000ms] ease-in-out ${step % 2 === 0 ? 'scale-100' : 'scale-50'}`}></div>
                <span className="relative text-white font-bold text-lg z-10">{step % 2 === 0 ? t('interventions_breathing_in') : t('interventions_breathing_out')}</span>
            </div>
            {isComplete ? (
                <p className="text-2xl font-semibold text-emerald-400">{t('interventions_breathing_complete')}</p>
            ) : (
                <p className="text-xl font-medium text-gray-200">{instructions[step] || 'Starting...'}</p>
            )}
        </div>
    );
};


const Interventions: React.FC = () => {
    const [activeIntervention, setActiveIntervention] = useState<InterventionType | null>(null);
    const [content, setContent] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const { t } = useLanguage();

    const fetchContent = async (type: InterventionType) => {
        setIsLoading(true);
        setActiveIntervention(type);
        const result = await getIntervention(type);
        setContent(result);
        setIsLoading(false);
    };

    const InterventionCard = ({ type, title, description, icon: Icon, color }: { type: InterventionType, title: string, description: string, icon: React.ElementType, color: string }) => (
        <button onClick={() => fetchContent(type)} className={`glass-card p-6 rounded-2xl text-left w-full h-full flex flex-col`}>
            <div className={`mb-4 rounded-full p-3 w-max ${color}`}>
                <Icon className="h-6 w-6 text-white"/>
            </div>
            <h3 className="text-xl font-bold text-gray-50 mb-2">{title}</h3>
            <p className="text-gray-400 flex-1">{description}</p>
        </button>
    );
    
    if (activeIntervention) {
        return (
            <div className="glass-card h-full rounded-2xl p-4 sm:p-8 flex flex-col animate-fadeIn">
                 <button onClick={() => setActiveIntervention(null)} className="self-start mb-4 text-violet-400 hover:text-violet-300 font-semibold transition-colors">
                    &larr; {t('interventions_back')}
                </button>
                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="h-12 w-12 text-violet-500 animate-spin"/>
                    </div>
                ) : (
                    <div className="flex-1">
                        {activeIntervention === 'breathing' ? <BreathingExercise content={content} /> : <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{content}</p>}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn">
            <h2 className="text-3xl font-bold text-white">{t('interventions_title')}</h2>
            <p className="text-gray-400">{t('interventions_description')}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InterventionCard 
                    type="breathing" 
                    title={t('interventions_breathing_title')}
                    description={t('interventions_breathing_desc')}
                    icon={Wind}
                    color="bg-violet-600"
                />
                <InterventionCard 
                    type="mindfulness" 
                    title={t('interventions_mindfulness_title')}
                    description={t('interventions_mindfulness_desc')}
                    icon={BrainCircuit}
                    color="bg-sky-600"
                />
            </div>
             <div className="glass-card p-6 rounded-2xl mt-6">
                <h3 className="text-xl font-bold text-gray-200 mb-2 flex items-center"><HeartPulse className="mr-2 text-red-500"/>{t('interventions_soundscapes_title')}</h3>
                <p className="text-gray-400 mb-4">{t('interventions_soundscapes_desc')}</p>
                <SoundPlayer sounds={sounds} />
            </div>
        </div>
    );
};

export default Interventions;
