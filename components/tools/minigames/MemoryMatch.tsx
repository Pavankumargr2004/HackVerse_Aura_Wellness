import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, CheckCircle, FlaskConical, Atom, Dna, BrainCircuit, TestTube, Microscope, HeartPulse, Stethoscope } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';

interface MemoryMatchProps {
  onBack: () => void;
}

const icons = [
  FlaskConical, Atom, Dna, BrainCircuit,
  TestTube, Microscope, HeartPulse, Stethoscope
];

const createShuffledCards = () => {
  const cardPairs = icons.flatMap((Icon, index) => [
    { id: index * 2, iconId: index, Icon, isFlipped: false, isMatched: false },
    { id: index * 2 + 1, iconId: index, Icon, isFlipped: false, isMatched: false }
  ]);
  // Fisher-Yates shuffle
  for (let i = cardPairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cardPairs[i], cardPairs[j]] = [cardPairs[j], cardPairs[i]];
  }
  return cardPairs;
};

type CardType = ReturnType<typeof createShuffledCards>[0];

const MemoryMatch: React.FC<MemoryMatchProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const [cards, setCards] = useState<CardType[]>(createShuffledCards());
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (flippedIndices.length === 2) {
      setIsChecking(true);
      const [firstIndex, secondIndex] = flippedIndices;
      const firstCard = cards[firstIndex];
      const secondCard = cards[secondIndex];

      if (firstCard.iconId === secondCard.iconId) {
        // Match found
        setCards(prevCards => prevCards.map(card => 
          (card.id === firstCard.id || card.id === secondCard.id) ? { ...card, isMatched: true } : card
        ));
        setFlippedIndices([]);
        setIsChecking(false);
      } else {
        // No match
        setTimeout(() => {
          setCards(prevCards => prevCards.map((card, index) => 
            (index === firstIndex || index === secondIndex) ? { ...card, isFlipped: false } : card
          ));
          setFlippedIndices([]);
          setIsChecking(false);
        }, 1000);
      }
      setMoves(prev => prev + 1);
    }
  }, [flippedIndices, cards]);
  
  useEffect(() => {
      const allMatched = cards.every(card => card.isMatched);
      if (allMatched && cards.length > 0) {
          setIsGameOver(true);
      }
  }, [cards]);

  const handleCardClick = (index: number) => {
    if (isChecking || cards[index].isFlipped || cards[index].isMatched || flippedIndices.length >= 2) {
      return;
    }

    setCards(prevCards => prevCards.map((card, i) => i === index ? { ...card, isFlipped: true } : card));
    setFlippedIndices(prev => [...prev, index]);
  };

  const resetGame = () => {
    setCards(createShuffledCards());
    setFlippedIndices([]);
    setMoves(0);
    setIsGameOver(false);
    setIsChecking(false);
  };

  return (
    <div className="glass-card h-full rounded-2xl p-4 sm:p-6 flex flex-col animate-fadeIn max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="text-primary hover:text-violet-300 font-semibold transition-colors flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> {t('tool_back_to_games')}
        </button>
        <div className="text-right">
          <span className="text-muted-foreground">{t('memory_match_moves')}</span>
          <p className="text-2xl font-bold text-emerald-400">{moves}</p>
        </div>
      </div>
      <div className="text-center mb-4">
        <h2 className="text-3xl font-bold">{t('memory_match_title')}</h2>
      </div>

      <div className="relative flex-1 flex items-center justify-center">
        <div className="grid grid-cols-4 gap-2 sm:gap-4 aspect-square w-full max-w-md">
          {cards.map((card, index) => (
            <div key={card.id} className="[perspective:1000px]" onClick={() => handleCardClick(index)}>
              <div className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] ${card.isFlipped || card.isMatched ? '[transform:rotateY(180deg)]' : ''}`}>
                {/* Card Front */}
                <div className="absolute w-full h-full [backface-visibility:hidden] bg-secondary hover:bg-muted transition-colors rounded-lg flex items-center justify-center cursor-pointer">
                  <BrainCircuit className="h-8 w-8 text-primary" />
                </div>
                {/* Card Back */}
                <div className={`absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-lg flex items-center justify-center ${card.isMatched ? 'bg-emerald-500/20 border-2 border-emerald-500' : 'bg-primary/20'}`}>
                  <card.Icon className={`h-1/2 w-1/2 ${card.isMatched ? 'text-emerald-400' : 'text-primary'}`} />
                </div>
              </div>
            </div>
          ))}
        </div>
        {isGameOver && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-center animate-fadeIn rounded-lg z-10">
            <CheckCircle className="h-16 w-16 text-emerald-400 mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">{t('memory_match_congrats_title')}</h3>
            <p className="text-muted-foreground mb-6">{t('memory_match_congrats_desc')}</p>
            <button onClick={resetGame} className="flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-semibold text-white bg-primary hover:bg-violet-700 transition-colors">
              <RefreshCw className="h-5 w-5" /> {t('memory_match_play_again')}
            </button>
          </div>
        )}
      </div>
       <div className="mt-4 flex justify-center">
            <button onClick={resetGame} className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-semibold text-white bg-secondary hover:bg-muted transition-colors">
                <RefreshCw className="h-5 w-5"/> {t('memory_match_reset')}
            </button>
        </div>
    </div>
  );
};

export default MemoryMatch;
