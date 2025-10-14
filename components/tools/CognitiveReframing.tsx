import React, { useState, useMemo } from 'react';
import { ArrowLeft, RefreshCw, Lightbulb } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface CognitiveReframingProps {
  onBack: () => void;
}

const CognitiveReframing: React.FC<CognitiveReframingProps> = ({ onBack }) => {
    const [cardIndex, setCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [userReframe, setUserReframe] = useState('');
    const { t } = useLanguage();

    const reframingCards = useMemo(() => [
        {
          negativeThought: t('reframing_1_thought'),
          prompt: t('reframing_1_prompt'),
        },
        {
          negativeThought: t('reframing_2_thought'),
          prompt: t('reframing_2_prompt'),
        },
        {
          negativeThought: t('reframing_3_thought'),
          prompt: t('reframing_3_prompt'),
        },
        {
          negativeThought: t('reframing_4_thought'),
          prompt: t('reframing_4_prompt'),
        },
        {
          negativeThought: t('reframing_5_thought'),
          prompt: t('reframing_5_prompt'),
        },
    ], [t]);

    const currentCard = reframingCards[cardIndex];

    const drawNewCard = () => {
        setIsFlipped(false);
        setUserReframe('');
        setCardIndex((prevIndex) => (prevIndex + 1) % reframingCards.length);
    };

    return (
        <div className="glass-card h-full rounded-2xl p-4 sm:p-6 flex flex-col animate-fadeIn max-w-2xl mx-auto">
            <button onClick={onBack} className="self-start mb-4 text-primary hover:text-violet-300 font-semibold transition-colors flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" /> {t('tool_back_to_tools')}
            </button>
            <div className="text-center mb-6">
                <h2 className="text-3xl font-bold">{t('tool_reframing_main_title')}</h2>
                <p className="text-muted-foreground">{t('tool_reframing_main_desc')}</p>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center">
                <div className="w-full h-64 sm:h-72 perspective-1000">
                    <div className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                        {/* Front of the card */}
                        <div className="absolute w-full h-full backface-hidden bg-secondary rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-lg border border-border">
                            <p className="text-sm text-muted-foreground mb-2">{t('tool_reframing_card_thought')}</p>
                            <p className="text-xl sm:text-2xl font-semibold text-foreground">"{currentCard.negativeThought}"</p>
                            <button onClick={() => setIsFlipped(true)} className="mt-6 py-2 px-4 rounded-lg font-semibold text-white bg-primary hover:bg-violet-700 transition-colors">
                                {t('tool_reframing_card_button')}
                            </button>
                        </div>
                        {/* Back of the card */}
                        <div className="absolute w-full h-full backface-hidden bg-card rounded-2xl p-6 flex flex-col justify-between shadow-lg border border-border rotate-y-180">
                            <div>
                                <h4 className="font-bold text-primary mb-2 flex items-center gap-2"><Lightbulb /> {t('tool_reframing_card_prompt')}</h4>
                                <p className="text-muted-foreground text-sm sm:text-base">{currentCard.prompt}</p>
                            </div>
                            <textarea
                                value={userReframe}
                                onChange={(e) => setUserReframe(e.target.value)}
                                placeholder={t('tool_reframing_card_placeholder')}
                                className="w-full mt-2 p-2 text-sm bg-secondary rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary border-border h-20"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-6 text-center">
                 <button onClick={drawNewCard} className="flex items-center justify-center gap-2 w-full max-w-xs mx-auto py-3 px-4 rounded-lg font-semibold text-white bg-secondary hover:bg-muted transition-colors">
                    <RefreshCw className="h-5 w-5"/> {t('tool_reframing_new_card')}
                </button>
            </div>
        </div>
    );
};

export default CognitiveReframing;