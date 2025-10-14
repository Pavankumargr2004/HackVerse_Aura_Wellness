import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Check, Lightbulb } from 'lucide-react';
import { sudokuPuzzle } from './gameData';
import { useLanguage } from '../../../contexts/LanguageContext';

interface SudokuProps {
    onBack: () => void;
}

type Board = (number | null)[][];

const Sudoku: React.FC<SudokuProps> = ({ onBack }) => {
    const [board, setBoard] = useState<Board>([]);
    const [isSolved, setIsSolved] = useState(false);
    const { t } = useLanguage();

    const initializeBoard = () => {
        setIsSolved(false);
        setBoard(sudokuPuzzle.problem.map(row => row.map(cell => cell === 0 ? null : cell)));
    };

    useEffect(() => {
        initializeBoard();
    }, []);

    const handleInputChange = (row: number, col: number, value: string) => {
        if (isSolved) return;
        const num = parseInt(value, 10);
        if (value === '' || (num >= 1 && num <= 9)) {
            const newBoard = board.map(r => [...r]);
            newBoard[row][col] = value === '' ? null : num;
            setBoard(newBoard);
        }
    };
    
    const checkSolution = () => {
        for(let i = 0; i < 9; i++) {
            for(let j = 0; j < 9; j++) {
                if(board[i][j] !== sudokuPuzzle.solution[i][j]) {
                    alert(t('sudoku_alert_incorrect'));
                    return;
                }
            }
        }
        alert(t('sudoku_alert_correct'));
        setIsSolved(true);
    };
    
    const showHint = () => {
        if (isSolved) return;
        const emptyCells: {row: number, col: number}[] = [];
        board.forEach((row, rIdx) => {
            row.forEach((cell, cIdx) => {
                if(cell === null) {
                    emptyCells.push({row: rIdx, col: cIdx});
                }
            });
        });

        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            const newBoard = board.map(r => [...r]);
            newBoard[randomCell.row][randomCell.col] = sudokuPuzzle.solution[randomCell.row][randomCell.col];
            setBoard(newBoard);
        }
    };

    return (
        <div className="glass-card h-full rounded-2xl p-4 sm:p-6 flex flex-col animate-fadeIn max-w-lg mx-auto">
            <button onClick={onBack} className="self-start mb-4 text-primary hover:text-violet-300 font-semibold transition-colors flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" /> {t('tool_back_to_games')}
            </button>
            <div className="text-center mb-4">
                <h2 className="text-3xl font-bold">{t('sudoku_title')}</h2>
                <p className="text-muted-foreground">{t('sudoku_desc')}</p>
            </div>

            <div className="aspect-square w-full bg-secondary p-2 rounded-lg grid grid-cols-9 gap-0.5">
                {board.map((row, rIdx) =>
                    row.map((cell, cIdx) => {
                        const isGiven = sudokuPuzzle.problem[rIdx][cIdx] !== 0;
                        const isCorrect = isSolved || cell === sudokuPuzzle.solution[rIdx][cIdx];
                        const borderRight = (cIdx + 1) % 3 === 0 && cIdx < 8;
                        const borderBottom = (rIdx + 1) % 3 === 0 && rIdx < 8;
                        return (
                            <input
                                key={`${rIdx}-${cIdx}`}
                                type="text"
                                maxLength={1}
                                value={cell || ''}
                                disabled={isGiven || isSolved}
                                onChange={(e) => handleInputChange(rIdx, cIdx, e.target.value)}
                                className={`
                                    w-full h-full aspect-square text-center text-xl font-bold rounded-sm
                                    ${isGiven ? 'bg-muted text-foreground' : 'bg-background text-primary'}
                                    ${borderRight ? 'border-r-2 border-r-primary/50' : ''}
                                    ${borderBottom ? 'border-b-2 border-b-primary/50' : ''}
                                    focus:outline-none focus:ring-2 focus:ring-primary focus:z-10
                                    ${!isGiven && cell !== null && !isCorrect ? 'text-red-500' : ''}
                                `}
                            />
                        );
                    })
                )}
            </div>
            
            <div className="mt-4 grid grid-cols-3 gap-2">
                <button onClick={showHint} className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-semibold text-white bg-amber-600 hover:bg-amber-700 transition-colors">
                    <Lightbulb className="h-5 w-5"/> {t('sudoku_hint')}
                </button>
                <button onClick={checkSolution} className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors">
                    <Check className="h-5 w-5"/> {t('sudoku_check')}
                </button>
                <button onClick={initializeBoard} className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-semibold text-white bg-secondary hover:bg-muted transition-colors">
                    <RefreshCw className="h-5 w-5"/> {t('sudoku_reset')}
                </button>
            </div>
        </div>
    );
};

export default Sudoku;