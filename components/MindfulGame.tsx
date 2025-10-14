import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RefreshCw, ArrowLeft } from 'lucide-react';

interface MindfulGameProps {
  onBack: () => void;
}

const MindfulGame: React.FC<MindfulGameProps> = ({ onBack }) => {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'paused' | 'ended'>('idle');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60); // 60-second game
  const timerRef = useRef<number | null>(null);

  const BREATH_CYCLE_SECONDS = 8; // 3s in, 1s hold, 3s out, 1s hold

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      setGameState('ended');
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameState, timeLeft]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(60);
    setGameState('playing');
  };

  const resetGame = () => {
    setGameState('idle');
    setScore(0);
    setTimeLeft(60);
  };
  
  const handleTap = () => {
      if (gameState !== 'playing') return;

      const orb = document.getElementById('mindful-orb');
      if (!orb) return;

      const currentScale = parseFloat(window.getComputedStyle(orb).transform.split(',')[3]);
      
      // Tap is successful if near peak (scale ~1) or trough (scale ~0.5)
      const isPeak = currentScale > 0.95;
      const isTrough = currentScale < 0.55;

      if (isPeak || isTrough) {
          setScore(prev => prev + 10);
      } else {
          setScore(prev => Math.max(0, prev - 5)); // Penalty for mistimed tap
      }
  };


  const renderContent = () => {
    switch(gameState) {
      case 'ended':
        return (
          <div className="text-center animate-fadeIn">
            <h3 className="text-2xl font-bold text-white mb-2">Session Complete</h3>
            <p className="text-4xl font-bold text-emerald-400 mb-4">{score}</p>
            <p className="text-gray-400 mb-6">You completed the focus session. Well done.</p>
            <button onClick={resetGame} className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg font-semibold text-white bg-violet-600 hover:bg-violet-700 transition-colors">
              <RefreshCw className="h-5 w-5"/> Play Again
            </button>
          </div>
        );
      case 'idle':
        return (
          <div className="text-center animate-fadeIn">
            <h3 className="text-2xl font-bold text-white mb-2">Mindful Orb</h3>
            <p className="text-gray-400 mb-6">Tap the orb as it reaches its largest or smallest size. Synchronize with the rhythm to find your focus.</p>
            <button onClick={startGame} className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors">
              <Play className="h-5 w-5"/> Start Session
            </button>
          </div>
        );
      case 'playing':
      case 'paused':
        return (
            <div className="relative w-64 h-64 cursor-pointer" onClick={handleTap}>
              <div id="mindful-orb" className="absolute inset-0 bg-violet-600 rounded-full" style={{ animation: `breathe ${BREATH_CYCLE_SECONDS}s infinite ease-in-out`, animationPlayState: gameState === 'playing' ? 'running' : 'paused' }}></div>
              <style>{`
                  @keyframes breathe {
                      0% { transform: scale(0.5); opacity: 0.7; }
                      37.5% { transform: scale(1); opacity: 1; } /* 3s in */
                      50% { transform: scale(1); opacity: 1; } /* 1s hold */
                      87.5% { transform: scale(0.5); opacity: 0.7; } /* 3s out */
                      100% { transform: scale(0.5); opacity: 0.7; } /* 1s hold */
                  }
              `}</style>
               <div className="absolute inset-0 flex items-center justify-center text-white text-center font-bold">
                 Tap with the rhythm
               </div>
            </div>
        )
    }
  }

  return (
    <div className="glass-card h-full rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center animate-fadeIn">
       <button onClick={onBack} className="self-start mb-4 text-primary hover:text-violet-300 font-semibold transition-colors flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Tools
        </button>
      <div className="w-full flex justify-between items-center mb-8">
        <div>
          <span className="text-gray-400">Score</span>
          <p className="text-2xl font-bold text-emerald-400">{score}</p>
        </div>
        <div>
          <span className="text-gray-400">Time Left</span>
          <p className="text-2xl font-bold text-amber-400">{timeLeft}s</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center w-full">
        {renderContent()}
      </div>

      {(gameState === 'playing' || gameState === 'paused') && (
        <div className="mt-8">
            {gameState === 'playing' && (
            <button onClick={() => setGameState('paused')} className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                <Pause className="h-5 w-5" /> Pause
            </button>
            )}
            {gameState === 'paused' && (
            <button onClick={() => setGameState('playing')} className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                <Play className="h-5 w-5" /> Resume
            </button>
            )}
        </div>
      )}
    </div>
  );
};

export default MindfulGame;