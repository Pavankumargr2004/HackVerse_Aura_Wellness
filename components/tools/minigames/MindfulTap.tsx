import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, RefreshCw, ArrowLeft, CheckCircle } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';

interface MindfulTapProps {
  onBack: () => void;
}

const GAME_DURATION = 30; // seconds
const SPAWN_RATE = 900; // ms, how often a new target appears
const TARGET_LIFESPAN = 2500; // ms, how long a target stays on screen

interface Target {
  x: number;
  y: number;
  id: number;
}

const MindfulTap: React.FC<MindfulTapProps> = ({ onBack }) => {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'ended'>('idle');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [targets, setTargets] = useState<Target[]>([]);
  const { t } = useLanguage();
  
  const gameTimerRef = useRef<number | null>(null);
  const spawnTimerRef = useRef<number | null>(null);
  const targetTimeoutsRef = useRef<Map<number, number>>(new Map());

  const cleanupTimers = useCallback(() => {
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    targetTimeoutsRef.current.forEach(timeoutId => clearTimeout(timeoutId));
    targetTimeoutsRef.current.clear();
  }, []);

  const removeTarget = useCallback((id: number) => {
    setTargets(prev => prev.filter(t => t.id !== id));
    targetTimeoutsRef.current.delete(id);
  }, []);

  const spawnTarget = useCallback(() => {
    const id = Date.now() + Math.random();
    const newTarget = {
      id,
      x: Math.floor(Math.random() * 90) + 5,
      y: Math.floor(Math.random() * 90) + 5,
    };
    setTargets(prev => [...prev, newTarget]);
    
    const timeoutId = window.setTimeout(() => {
      removeTarget(id);
    }, TARGET_LIFESPAN);
    targetTimeoutsRef.current.set(id, timeoutId);
  }, [removeTarget]);

  useEffect(() => {
    if (gameState === 'playing') {
      gameTimerRef.current = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setGameState('ended');
            setTargets([]);
            cleanupTimers();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      spawnTimerRef.current = window.setInterval(spawnTarget, SPAWN_RATE);
    }
    
    return cleanupTimers;
  }, [gameState, cleanupTimers, spawnTarget]);
  
  const startGame = () => {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setTargets([]);
    cleanupTimers();
    setGameState('playing');
  };

  const resetGame = () => {
    setGameState('idle');
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setTargets([]);
    cleanupTimers();
  };
  
  const handleTap = (tappedId: number) => {
      if (gameState !== 'playing') return;
      
      const tappedDot = document.getElementById(`target-${tappedId}`);
      if (tappedDot) {
          tappedDot.classList.add('tapped');
      }

      setScore(prev => prev + 10);
      
      const timeoutId = targetTimeoutsRef.current.get(tappedId);
      if (timeoutId) {
          clearTimeout(timeoutId);
      }
      
      // Remove after animation
      setTimeout(() => {
          removeTarget(tappedId);
      }, 200);
  };

  const renderContent = () => {
    switch(gameState) {
      case 'ended':
        return (
          <div className="text-center animate-fadeIn">
            <CheckCircle className="h-12 w-12 mx-auto text-emerald-400 mb-4"/>
            <h3 className="text-2xl font-bold text-white mb-2">{t('mindfultap_end_title')}</h3>
            <p className="text-4xl font-bold text-primary mb-4">{score}</p>
            <p className="text-muted-foreground mb-6">{t('mindfultap_end_desc')}</p>
            <button onClick={resetGame} className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg font-semibold text-white bg-primary hover:bg-violet-700 transition-colors">
              <RefreshCw className="h-5 w-5"/> {t('mindfultap_play_again')}
            </button>
          </div>
        );
      case 'idle':
        return (
          <div className="text-center animate-fadeIn">
            <h3 className="text-2xl font-bold text-white mb-2">{t('mindfultap_idle_title')}</h3>
            <p className="text-muted-foreground mb-6">{t('mindfultap_idle_desc')}</p>
            <button onClick={startGame} className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors">
              <Play className="h-5 w-5"/> {t('mindfultap_start')}
            </button>
          </div>
        );
      case 'playing':
        return (
            <div className="relative w-full h-full bg-secondary rounded-xl overflow-hidden">
                {targets.map(target => (
                    <div 
                        key={target.id}
                        id={`target-${target.id}`}
                        onClick={(e) => { e.stopPropagation(); handleTap(target.id); }}
                        className="mindful-dot"
                        style={{ left: `${target.x}%`, top: `${target.y}%`, transform: 'translate(-50%, -50%)' }}
                    />
                ))}
            </div>
        )
    }
  }

  return (
    <div className="glass-card h-full rounded-2xl p-4 sm:p-6 flex flex-col animate-fadeIn max-w-2xl mx-auto">
       <button onClick={onBack} className="self-start mb-4 text-primary hover:text-violet-300 font-semibold transition-colors flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> {t('mindfultap_back')}
        </button>
      <div className="w-full flex justify-between items-center mb-4">
        <div>
          <span className="text-muted-foreground">{t('mindfultap_score')}</span>
          <p className="text-2xl font-bold text-emerald-400">{score}</p>
        </div>
        <div>
          <span className="text-muted-foreground">{t('mindfultap_time')}</span>
          <p className="text-2xl font-bold text-amber-400">{timeLeft}s</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center w-full aspect-video">
        {renderContent()}
      </div>
    </div>
  );
};

export default MindfulTap;