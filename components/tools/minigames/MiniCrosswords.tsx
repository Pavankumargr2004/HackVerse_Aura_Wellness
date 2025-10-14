import React, { useState, useRef, useMemo } from 'react';
import { ArrowLeft, RefreshCw, Check } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';

interface MiniCrosswordsProps {
    onBack: () => void;
}

type GridState = (string | null)[][];

const MiniCrosswords: React.FC<MiniCrosswordsProps> = ({ onBack }) => {
    const { t } = useLanguage();
    
    const miniCrossword = useMemo(() => ({
      grid: [
        [1, 1, 1, 1],
        [1, 0, 1, 0],
        [1, 1, 1, 1],
        [1, 0, 1, 0],
      ],
      clues: {
        across: [
          { num: 1, row: 0, col: 0, clue: t('clue_across_1'), answer: 'CODE' },
          { num: 5, row: 2, col: 0, clue: t('clue_across_5'), answer: 'REST' },
        ],
        down: [
          { num: 1, row: 0, col: 0, clue: t('clue_down_1'), answer: 'CARE' },
          { num: 2, row: 0, col: 1, clue: t('clue_down_2'), answer: 'ORE' },
          { num: 3, row: 0, col: 2, clue: t('clue_down_3'), answer: 'STEM' },
          { num: 4, row: 0, col: 3, clue: t('clue_down_4'), answer: 'ET' },
        ],
      },
    }), [t]);

    const [grid, setGrid] = useState<GridState>(() => miniCrossword.grid.map(row => row.map(cell => (cell === 1 ? null : ''))));
    const inputRefs = useRef<(HTMLInputElement | null)[][]>([]);
    
    const initializeGrid = () => {
        setGrid(miniCrossword.grid.map(row => row.map(cell => (cell === 1 ? null : ''))));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, row: number, col: number) => {
        const { value } = e.target;
        const newGrid = grid.map(r => [...r]);
        newGrid[row][col] = value.toUpperCase().slice(0, 1);
        setGrid(newGrid);

        // Move focus automatically
        if (value && col < miniCrossword.grid[0].length - 1 && miniCrossword.grid[row][col + 1] === 1) {
            inputRefs.current[row][col + 1]?.focus();
        } else if (value && row < miniCrossword.grid.length - 1 && miniCrossword.grid[row + 1][col] === 1) {
            inputRefs.current[row + 1][col]?.focus();
        }
    };
    
    const checkSolution = () => {
        let correct = true;
        miniCrossword.clues.across.forEach(({row, col, answer}) => {
            for(let i = 0; i < answer.length; i++) {
                if(grid[row][col+i] !== answer[i]) correct = false;
            }
        });
        miniCrossword.clues.down.forEach(({row, col, answer}) => {
            for(let i = 0; i < answer.length; i++) {
                if(grid[row+i][col] !== answer[i]) correct = false;
            }
        });
        
        if (correct) {
            alert(t('crossword_alert_correct'));
        } else {
            alert(t('crossword_alert_incorrect'));
        }
    };

    return (
        <div className="glass-card h-full rounded-2xl p-4 sm:p-6 flex flex-col animate-fadeIn max-w-lg mx-auto">
            <button onClick={onBack} className="self-start mb-4 text-primary hover:text-violet-300 font-semibold transition-colors flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" /> {t('tool_back_to_games')}
            </button>
            <div className="text-center mb-4">
                <h2 className="text-3xl font-bold">{t('crossword_title')}</h2>
                <p className="text-muted-foreground">{t('crossword_desc')}</p>
            </div>

            <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${miniCrossword.grid[0].length}, 1fr)` }}>
                {miniCrossword.grid.map((row, rIdx) => {
                     if (!inputRefs.current[rIdx]) inputRefs.current[rIdx] = [];
                    return row.map((cell, cIdx) => (
                        <div key={`${rIdx}-${cIdx}`} className={`relative aspect-square ${cell === 1 ? 'bg-background' : 'bg-secondary'}`}>
                            {cell === 1 && (
                                <input
                                    ref={el => { inputRefs.current[rIdx][cIdx] = el; }}
                                    type="text"
                                    maxLength={1}
                                    value={grid[rIdx][cIdx] || ''}
                                    onChange={(e) => handleInputChange(e, rIdx, cIdx)}
                                    className="w-full h-full text-center text-xl font-bold uppercase bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-primary rounded-sm"
                                />
                            )}
                            {miniCrossword.clues.across.find(c => c.row === rIdx && c.col === cIdx)?.num && 
                                <span className="absolute top-0.5 left-1 text-xs text-muted-foreground">{miniCrossword.clues.across.find(c => c.row === rIdx && c.col === cIdx)?.num}</span>
                            }
                            {miniCrossword.clues.down.find(c => c.row === rIdx && c.col === cIdx)?.num && !miniCrossword.clues.across.find(c => c.row === rIdx && c.col === cIdx) &&
                                <span className="absolute top-0.5 left-1 text-xs text-muted-foreground">{miniCrossword.clues.down.find(c => c.row === rIdx && c.col === cIdx)?.num}</span>
                            }
                        </div>
                    ))
                })}
            </div>

            <div className="mt-4 flex-1 grid grid-cols-2 gap-6 text-sm overflow-y-auto">
                <div>
                    <h4 className="font-bold text-foreground mb-2">{t('crossword_across')}</h4>
                    <ul className="space-y-1 text-muted-foreground">
                        {miniCrossword.clues.across.map(c => <li key={c.num}>{c.num}. {c.clue}</li>)}
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-foreground mb-2">{t('crossword_down')}</h4>
                    <ul className="space-y-1 text-muted-foreground">
                        {miniCrossword.clues.down.map(c => <li key={c.num}>{c.num}. {c.clue}</li>)}
                    </ul>
                </div>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-2">
                <button onClick={checkSolution} className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors">
                    <Check className="h-5 w-5"/> {t('crossword_check')}
                </button>
                <button onClick={initializeGrid} className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-semibold text-white bg-secondary hover:bg-muted transition-colors">
                    <RefreshCw className="h-5 w-5"/> {t('crossword_reset')}
                </button>
            </div>
        </div>
    );
};

export default MiniCrosswords;