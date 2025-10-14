import React, { useState, useMemo } from 'react';
import { ArrowLeft, CheckCircle, Smile } from 'lucide-react';
import { StressDataHook } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

interface EmotionWheelProps {
  onBack: () => void;
  stressDataHook: StressDataHook;
}

type EmotionStep = 'primary' | 'secondary' | 'intensity' | 'notes' | 'complete';

const EmotionWheel: React.FC<EmotionWheelProps> = ({ onBack, stressDataHook }) => {
    const [step, setStep] = useState<EmotionStep>('primary');
    const [primaryEmotion, setPrimaryEmotion] = useState('');
    const [secondaryEmotion, setSecondaryEmotion] = useState('');
    const [intensity, setIntensity] = useState(5);
    const [notes, setNotes] = useState('');
    const { t } = useLanguage();
    
    const { addEmotionJournalEntry } = stressDataHook;

    const emotionData: { [key: string]: { key: string, emoji: string; color: string; secondary: string[] } } = useMemo(() => ({
        [t('emotion_joy')]: { key: 'joy', emoji: '😄', color: 'text-amber-400', secondary: [t('emotion_joy_secondary_1'), t('emotion_joy_secondary_2'), t('emotion_joy_secondary_3'), t('emotion_joy_secondary_4'), t('emotion_joy_secondary_5')] },
        [t('emotion_sadness')]: { key: 'sadness', emoji: '😢', color: 'text-blue-400', secondary: [t('emotion_sadness_secondary_1'), t('emotion_sadness_secondary_2'), t('emotion_sadness_secondary_3'), t('emotion_sadness_secondary_4'), t('emotion_sadness_secondary_5')] },
        [t('emotion_anger')]: { key: 'anger', emoji: '😠', color: 'text-red-400', secondary: [t('emotion_anger_secondary_1'), t('emotion_anger_secondary_2'), t('emotion_anger_secondary_3'), t('emotion_anger_secondary_4'), t('emotion_anger_secondary_5')] },
        [t('emotion_fear')]: { key: 'fear', emoji: '😨', color: 'text-purple-400', secondary: [t('emotion_fear_secondary_1'), t('emotion_fear_secondary_2'), t('emotion_fear_secondary_3'), t('emotion_fear_secondary_4'), t('emotion_fear_secondary_5')] },
        [t('emotion_surprise')]: { key: 'surprise', emoji: '😲', color: 'text-sky-400', secondary: [t('emotion_surprise_secondary_1'), t('emotion_surprise_secondary_2'), t('emotion_surprise_secondary_3'), t('emotion_surprise_secondary_4')] },
        [t('emotion_disgust')]: { key: 'disgust', emoji: '🤢', color: 'text-emerald-400', secondary: [t('emotion_disgust_secondary_1'), t('emotion_disgust_secondary_2'), t('emotion_disgust_secondary_3'), t('emotion_disgust_secondary_4')] }
    }), [t]);


    const handlePrimarySelect = (emotion: string) => {
        setPrimaryEmotion(emotion);
        setStep('secondary');
    };

    const handleSecondarySelect = (emotion: string) => {
        setSecondaryEmotion(emotion);
        setStep('intensity');
    };

    const handleLogEmotion = () => {
        // Use the original English key for storing data, but the translated name for display
        const primaryKey = emotionData[primaryEmotion]?.key || primaryEmotion;
        addEmotionJournalEntry({ primaryEmotion: primaryKey, secondaryEmotion, intensity, notes });
        setStep('complete');
    };

    const reset = () => {
        setStep('primary');
        setPrimaryEmotion('');
        setSecondaryEmotion('');
        setIntensity(5);
        setNotes('');
    };

    const renderContent = () => {
        switch (step) {
            case 'primary':
                return (
                    <div>
                        <h3 className="text-xl font-bold text-center mb-6">{t('tool_emotion_step1_q')}</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {Object.keys(emotionData).map(emotion => (
                                <button key={emotion} onClick={() => handlePrimarySelect(emotion)} className="p-4 rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground transition-all duration-200">
                                    <span className={`text-3xl ${emotionData[emotion].color}`}>{emotionData[emotion].emoji}</span>
                                    <p className="font-semibold mt-2">{emotion}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 'secondary':
                const secondaryEmotions = emotionData[primaryEmotion]?.secondary || [];
                return (
                     <div>
                        <h3 className="text-xl font-bold text-center mb-6">{t('tool_emotion_step2_q')}</h3>
                         <div className="flex flex-wrap justify-center gap-3">
                            {secondaryEmotions.map(emotion => (
                                <button key={emotion} onClick={() => handleSecondarySelect(emotion)} className="py-2 px-4 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-all duration-200 font-medium">
                                    {emotion}
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 'intensity':
                 return (
                     <div>
                        <h3 className="text-xl font-bold text-center mb-2">{t('tool_emotion_step3_q')}</h3>
                        <p className="text-center text-muted-foreground mb-6">({secondaryEmotion})</p>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground">{t('tool_emotion_step3_low')}</span>
                            <input type="range" min="1" max="10" value={intensity} onChange={e => setIntensity(Number(e.target.value))} className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary" />
                            <span className="text-sm text-muted-foreground">{t('tool_emotion_step3_high')}</span>
                        </div>
                        <p className="text-center text-4xl font-bold mt-4 text-primary">{intensity}</p>
                        <button onClick={() => setStep('notes')} className="mt-8 w-full py-3 px-4 rounded-lg font-semibold text-white bg-primary hover:bg-violet-700 transition-colors">
                            {t('tool_emotion_continue')}
                        </button>
                    </div>
                );
            case 'notes':
                return (
                    <div>
                        <h3 className="text-xl font-bold text-center mb-6">{t('tool_emotion_step4_q')}</h3>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder={t('tool_emotion_step4_placeholder')}
                            className="w-full p-3 text-sm bg-secondary rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary border-border h-28"
                        />
                         <button onClick={handleLogEmotion} className="mt-6 w-full py-3 px-4 rounded-lg font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors">
                            {t('tool_emotion_log_button')}
                        </button>
                    </div>
                );
            case 'complete':
                 return (
                    <div className="text-center">
                        <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-white mb-2">{t('tool_emotion_complete_title')}</h3>
                        <p className="text-muted-foreground mb-6">{t('tool_emotion_complete_desc')}</p>
                        <button onClick={reset} className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-primary hover:bg-violet-700 transition-colors">
                            {t('tool_emotion_log_another')}
                        </button>
                    </div>
                );
        }
    };
    
    return (
        <div className="glass-card h-full rounded-2xl p-4 sm:p-6 flex flex-col animate-fadeIn max-w-2xl mx-auto">
            <button onClick={step === 'primary' ? onBack : () => setStep('primary')} className="self-start mb-4 text-primary hover:text-violet-300 font-semibold transition-colors flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" /> {step === 'primary' ? t('tool_back_to_tools') : t('tool_emotion_start_over')}
            </button>
             <div className="text-center mb-6">
                <Smile className="h-10 w-10 text-primary mx-auto mb-2" />
                <h2 className="text-3xl font-bold">{t('tool_emotion_main_title')}</h2>
            </div>
            <div className="flex-1 flex flex-col justify-center">
                {renderContent()}
            </div>
        </div>
    );
};

export default EmotionWheel;