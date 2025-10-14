import React, { useState, useMemo } from 'react';
import { ArrowLeft, Lightbulb, Check, ChevronRight, MessageCircleQuestion, Sparkles, X, Trophy } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';

interface RiddleMeThisProps {
  onBack: () => void;
}

const RiddleMeThis: React.FC<RiddleMeThisProps> = ({ onBack }) => {
  const { t } = useLanguage();
  
  const riddleData = useMemo(() => ({
      riddles: [
        {
          id: 1,
          category: "Wordplay",
          riddle: t('riddle_1_riddle'),
          hints: [t('riddle_1_hint_1'), t('riddle_1_hint_2'), t('riddle_1_hint_3')],
          answer: t('riddle_1_answer'),
          difficulty: "Easy" as const,
          moodBoostMessage: t('riddle_1_moodboost')
        },
      ],
      gameEndMessage: t('riddle_game_end_message')
  }), [t]);

  const [currentRiddleIndex, setCurrentRiddleIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [hintsShown, setHintsShown] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | 'revealed' | null>(null);

  const totalRiddles = riddleData.riddles.length;
  const isGameEnd = currentRiddleIndex >= totalRiddles;
  const currentRiddle = !isGameEnd ? riddleData.riddles[currentRiddleIndex] : null;

  const handleShowHint = () => {
    if (currentRiddle && hintsShown < currentRiddle.hints.length) {
      setHintsShown(prev => prev + 1);
    }
  };

  const handleRevealAnswer = () => {
    if (!currentRiddle || isAnswered) return;
    setIsAnswered(true);
    setFeedback('revealed');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || !currentRiddle || isAnswered) return;

    const normalize = (str: string) => str.trim().toLowerCase().replace(/^(a|an|the)\s+/, '');

    if (normalize(userInput) === normalize(currentRiddle.answer)) {
      setFeedback('correct');
      setIsAnswered(true);
    } else {
      setFeedback('incorrect');
      setTimeout(() => setFeedback(null), 1500); // Reset feedback after 1.5s
    }
  };

  const handleNextRiddle = () => {
    if (currentRiddleIndex < totalRiddles) {
      setCurrentRiddleIndex(prev => prev + 1);
      setUserInput('');
      setHintsShown(0);
      setIsAnswered(false);
      setFeedback(null);
    }
  };

  const getDifficultyColor = (difficulty: 'Easy' | 'Medium' | 'Hard') => {
    switch(difficulty) {
        case 'Easy': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
        case 'Medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
        case 'Hard': return 'bg-red-500/20 text-red-400 border-red-500/30';
    }
  };

  if (isGameEnd) {
    return (
      <div className="glass-card h-full rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center text-center animate-fadeIn max-w-2xl mx-auto">
        <Trophy className="h-16 w-16 text-amber-400 mb-4"/>
        <h2 className="text-3xl font-bold mb-4">{t('riddle_end_title')}</h2>
        <p className="text-muted-foreground mb-6">{riddleData.gameEndMessage}</p>
        <button onClick={onBack} className="text-primary hover:text-violet-300 font-semibold transition-colors flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> {t('riddle_end_back')}
        </button>
      </div>
    );
  }

  return (
    <div className="glass-card h-full rounded-2xl p-4 sm:p-6 flex flex-col animate-fadeIn max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="text-primary hover:text-violet-300 font-semibold transition-colors flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> {t('tool_back_to_games')}
        </button>
        <div className="text-sm font-semibold text-muted-foreground">
          {t('riddle_progress').replace('{current}', String(currentRiddleIndex + 1)).replace('{total}', String(totalRiddles))}
        </div>
      </div>

      <div className="text-center">
        <MessageCircleQuestion className="h-10 w-10 text-primary mx-auto mb-2" />
        <h2 className="text-3xl font-bold">{t('riddle_title')}</h2>
      </div>
      
      {currentRiddle && (
        <div className="flex-1 flex flex-col justify-center mt-4">
          <div className="bg-secondary/50 p-6 rounded-xl text-center shadow-inner">
            <div className="flex justify-center items-center gap-4 mb-4">
                 <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${getDifficultyColor(currentRiddle.difficulty)}`}>{currentRiddle.difficulty}</span>
                 <span className="text-xs font-semibold text-muted-foreground px-2 py-1 rounded-full bg-muted/50 border border-border">{currentRiddle.category}</span>
            </div>
            <p className="text-lg font-medium text-foreground min-h-[5em] flex items-center justify-center">{currentRiddle.riddle}</p>
          </div>
          
          <div className="mt-4 min-h-[6em]">
            {hintsShown > 0 && Array.from({ length: hintsShown }).map((_, i) => (
              <div key={i} className="text-sm text-muted-foreground animate-fadeIn flex items-start gap-2 mb-1">
                <Lightbulb className="h-4 w-4 mt-0.5 text-amber-400 flex-shrink-0"/> <span>{currentRiddle.hints[i]}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-center items-center gap-6">
            <button onClick={handleShowHint} disabled={isAnswered || hintsShown >= currentRiddle.hints.length} className="text-center py-2 text-sm text-amber-400 font-semibold hover:text-amber-300 disabled:opacity-50 disabled:cursor-not-allowed">
              {hintsShown < currentRiddle.hints.length ? t('riddle_show_hint') : t('riddle_all_hints')}
            </button>
            <button onClick={handleRevealAnswer} disabled={isAnswered} className="text-center py-2 text-sm text-red-400 font-semibold hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed">
              {t('riddle_show_answer')}
            </button>
          </div>
          
          <div className="mt-4">
            {!isAnswered ? (
              <form onSubmit={handleSubmit} className="relative">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder={t('riddle_placeholder')}
                  className="w-full py-3 pl-4 pr-12 text-sm bg-secondary rounded-full text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                />
                <button
                  type="submit"
                  disabled={!userInput.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-primary text-primary-foreground hover:bg-violet-700 disabled:bg-muted transition-colors"
                  aria-label={t('riddle_submit_aria')}
                >
                  <Check className="h-5 w-5" />
                </button>
              </form>
            ) : (
                <button onClick={handleNextRiddle} className="w-full py-3 rounded-full bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 animate-fadeIn hover:bg-violet-700 transition-colors">
                    {t('riddle_next')} <ChevronRight className="h-5 w-5" />
                </button>
            )}
          </div>
          
          <div className="mt-4 h-12 flex items-center justify-center text-center">
            {feedback === 'correct' && currentRiddle && (
              <p className="text-emerald-400 font-semibold animate-fadeIn flex items-center gap-2"><Sparkles className="h-5 w-5"/>{currentRiddle.moodBoostMessage}</p>
            )}
            {feedback === 'incorrect' && (
              <p className="text-red-400 font-semibold animate-fadeIn flex items-center gap-2"><X className="h-5 w-5"/>{t('riddle_feedback_incorrect')}</p>
            )}
            {feedback === 'revealed' && currentRiddle && (
              <p className="text-amber-400 font-semibold animate-fadeIn">{t('riddle_feedback_revealed')}<span className="font-bold">{currentRiddle.answer}</span></p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RiddleMeThis;