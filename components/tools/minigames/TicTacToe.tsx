import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ArrowLeft, RefreshCw, Bot, User, X, Circle, Trophy } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';

interface TicTacToeProps {
    onBack: () => void;
}

type Difficulty = 'Easy' | 'Medium' | 'Hard';
type Player = 'X' | 'O';
type SquareState = Player | null;
type BoardState = SquareState[];

const WINNING_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6]             // diagonals
];

const STRIKE_LINE_STYLES: React.CSSProperties[] = [
  { top: '16.67%', left: '5%', width: '90%' },
  { top: '50%', left: '5%', width: '90%', transform: 'translateY(-50%)' },
  { top: '83.33%', left: '5%', width: '90%', transform: 'translateY(-50%)' },
  { left: '16.67%', top: '5%', height: '90%', width: '5px' },
  { left: '50%', top: '5%', height: '90%', width: '5px', transform: 'translateX(-50%)' },
  { left: '83.33%', top: '5%', height: '90%', width: '5px', transform: 'translateX(-50%)' },
  { top: '5%', left: '5%', width: '128%', transform: 'rotate(45deg)', transformOrigin: 'top left' },
  { top: '5%', right: '5%', width: '128%', transform: 'rotate(-45deg)', transformOrigin: 'top right' }
];

const checkWinner = (board: BoardState): { winner: Player; line: number[] } | null => {
    for (let i = 0; i < WINNING_COMBOS.length; i++) {
        const [a, b, c] = WINNING_COMBOS[i];
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return { winner: board[a]!, line: WINNING_COMBOS[i] };
        }
    }
    return null;
};

const TicTacToe: React.FC<TicTacToeProps> = ({ onBack }) => {
    const { t } = useLanguage();
    const [gameState, setGameState] = useState<'settings' | 'playing' | 'ended'>('settings');
    const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
    const [playerSymbol, setPlayerSymbol] = useState<Player>('X');
    const [board, setBoard] = useState<BoardState>(Array(9).fill(null));
    const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
    const [score, setScore] = useState({ player: 0, ai: 0, draws: 0 });
    const [winnerInfo, setWinnerInfo] = useState<{ winner: Player | 'draw'; line?: number[] } | null>(null);
    const [isAiThinking, setIsAiThinking] = useState(false);

    const aiSymbol = useMemo(() => (playerSymbol === 'X' ? 'O' : 'X'), [playerSymbol]);

    const handleGameStart = () => {
        setGameState('playing');
        setCurrentPlayer('X'); // X always starts
        resetBoard();
    };

    const resetBoard = () => {
        setBoard(Array(9).fill(null));
        setWinnerInfo(null);
        setCurrentPlayer('X');
    };
    
    const handleSettingsChange = () => {
        setGameState('settings');
        setScore({ player: 0, ai: 0, draws: 0 });
    };

    const handlePlayerMove = (index: number) => {
        if (board[index] || winnerInfo || currentPlayer !== playerSymbol || isAiThinking) return;

        const newBoard = [...board];
        newBoard[index] = playerSymbol;
        setBoard(newBoard);
        setCurrentPlayer(aiSymbol);
    };

    const getEmptySquares = (currentBoard: BoardState) => {
        return currentBoard.map((sq, i) => (sq === null ? i : null)).filter(i => i !== null) as number[];
    };
    
    // AI LOGIC
    const makeAiMove = useCallback((currentBoard: BoardState) => {
        setIsAiThinking(true);
        setTimeout(() => {
            let move: number;
            const emptySquares = getEmptySquares(currentBoard);

            const findWinningMove = (b: BoardState, symbol: Player): number | null => {
                for (const square of getEmptySquares(b)) {
                    const tempBoard = [...b];
                    tempBoard[square] = symbol;
                    if (checkWinner(tempBoard)?.winner === symbol) {
                        return square;
                    }
                }
                return null;
            };

            if (difficulty === 'Easy') {
                move = emptySquares[Math.floor(Math.random() * emptySquares.length)];
            } else if (difficulty === 'Medium') {
                const aiWinMove = findWinningMove(currentBoard, aiSymbol);
                if (aiWinMove !== null) {
                    move = aiWinMove;
                } else {
                    const playerWinMove = findWinningMove(currentBoard, playerSymbol);
                    if (playerWinMove !== null) {
                        move = playerWinMove;
                    } else if (currentBoard[4] === null) {
                        move = 4;
                    } else {
                        move = emptySquares[Math.floor(Math.random() * emptySquares.length)];
                    }
                }
            } else { // Hard (Minimax)
                const minimax = (newBoard: BoardState, isMaximizing: boolean): { score: number; index?: number } => {
                    const winnerResult = checkWinner(newBoard);
                    if (winnerResult) {
                        return { score: winnerResult.winner === aiSymbol ? 1 : -1 };
                    }
                    if (getEmptySquares(newBoard).length === 0) {
                        return { score: 0 };
                    }
                
                    const moves = getEmptySquares(newBoard).map(index => {
                        const nextBoard = [...newBoard];
                        nextBoard[index] = isMaximizing ? aiSymbol : playerSymbol;
                        const score = minimax(nextBoard, !isMaximizing).score;
                        return { score, index };
                    });

                    return isMaximizing
                        ? moves.reduce((best, move) => (move.score > best.score ? move : best), { score: -Infinity })
                        : moves.reduce((best, move) => (move.score < best.score ? move : best), { score: Infinity });
                };
                move = minimax(currentBoard, true).index!;
            }

            if (move !== undefined) {
                const newBoard = [...currentBoard];
                newBoard[move] = aiSymbol;
                setBoard(newBoard);
            }
            setCurrentPlayer(playerSymbol);
            setIsAiThinking(false);
        }, 500);
    }, [aiSymbol, playerSymbol, difficulty]);

    useEffect(() => {
        const winnerResult = checkWinner(board);
        const isDraw = !winnerResult && board.every(sq => sq !== null);

        if (winnerResult) {
            setWinnerInfo({ winner: winnerResult.winner, line: winnerResult.line });
            setScore(s => winnerResult.winner === playerSymbol ? { ...s, player: s.player + 1 } : { ...s, ai: s.ai + 1 });
            setGameState('ended');
        } else if (isDraw) {
            setWinnerInfo({ winner: 'draw' });
            setScore(s => ({ ...s, draws: s.draws + 1 }));
            setGameState('ended');
        } else if (currentPlayer === aiSymbol && gameState === 'playing') {
            makeAiMove(board);
        }
    }, [board, currentPlayer, gameState, playerSymbol, aiSymbol, makeAiMove]);

    if (gameState === 'settings') {
        return (
            <div className="glass-card h-full rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center text-center animate-fadeIn max-w-md mx-auto">
                 <button onClick={onBack} className="self-start mb-4 text-primary hover:text-violet-300 font-semibold transition-colors flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" /> {t('tool_back_to_games')}
                </button>
                <h2 className="text-3xl font-bold mb-6">{t('tictactoe_title')}</h2>
                <div className="w-full space-y-6">
                    <div>
                        <h3 className="font-semibold text-muted-foreground mb-2">{t('tictactoe_choose_difficulty')}</h3>
                        <div className="flex justify-center gap-2">
                            {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map(d => (
                                <button key={d} onClick={() => setDifficulty(d)} className={`px-4 py-2 rounded-lg font-semibold transition-colors ${difficulty === d ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-muted'}`}>{t(`tictactoe_${d.toLowerCase()}`)}</button>
                            ))}
                        </div>
                    </div>
                     <div>
                        <h3 className="font-semibold text-muted-foreground mb-2">{t('tictactoe_choose_symbol')}</h3>
                        <div className="flex justify-center gap-2">
                            <button onClick={() => setPlayerSymbol('X')} className={`w-16 h-16 rounded-lg font-bold text-4xl transition-colors ${playerSymbol === 'X' ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-muted'}`}>X</button>
                            <button onClick={() => setPlayerSymbol('O')} className={`w-16 h-16 rounded-lg font-bold text-4xl transition-colors ${playerSymbol === 'O' ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-muted'}`}>O</button>
                        </div>
                    </div>
                </div>
                <button onClick={handleGameStart} className="mt-8 w-full py-3 px-4 rounded-lg font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors">{t('tictactoe_start_game')}</button>
            </div>
        );
    }
    
    return (
        <div className="glass-card h-full rounded-2xl p-4 sm:p-6 flex flex-col items-center animate-fadeIn max-w-2xl mx-auto">
            <button onClick={onBack} className="self-start mb-4 text-primary hover:text-violet-300 font-semibold transition-colors flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" /> {t('tool_back_to_games')}
            </button>
            <div className="w-full flex justify-around items-center mb-4 p-2 bg-secondary/50 rounded-lg">
                <div className="text-center font-bold">
                    {t('tictactoe_player_score')} ({playerSymbol}): <span className="text-primary">{score.player}</span>
                </div>
                <div className="text-center font-bold">
                    {t('tictactoe_draws')}: <span className="text-muted-foreground">{score.draws}</span>
                </div>
                <div className="text-center font-bold">
                    {t('tictactoe_ai_score')} ({aiSymbol}): <span className="text-destructive">{score.ai}</span>
                </div>
            </div>

            <div className="relative w-full max-w-sm aspect-square">
                <div className="grid grid-cols-3 gap-2 w-full h-full">
                    {board.map((symbol, index) => (
                        <button key={index} onClick={() => handlePlayerMove(index)} className="bg-secondary rounded-lg flex items-center justify-center text-5xl font-bold disabled:cursor-not-allowed" disabled={!!symbol || !!winnerInfo}>
                            {symbol && (
                                <span className={`tic-tac-toe-piece ${symbol === 'X' ? 'text-primary' : 'text-amber-400'}`}>
                                    {symbol}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
                 {winnerInfo?.line && (
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="strike-line" style={STRIKE_LINE_STYLES[WINNING_COMBOS.findIndex(c => c.every((v, i) => v === winnerInfo.line![i]))]}></div>
                    </div>
                )}
            </div>
            
            <div className="h-8 mt-4 text-center text-muted-foreground font-semibold">
                {isAiThinking && <p className="animate-pulse">{t('tictactoe_thinking')}</p>}
            </div>

            {gameState === 'ended' && winnerInfo && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fadeIn">
                    <div className="glass-card p-8 rounded-2xl text-center shadow-lg border border-primary/50">
                        <Trophy className={`h-16 w-16 mx-auto mb-4 ${winnerInfo.winner === playerSymbol ? 'text-amber-400' : winnerInfo.winner === aiSymbol ? 'text-destructive' : 'text-muted-foreground'}`}/>
                        <h2 className="text-3xl font-bold mb-6">
                            {winnerInfo.winner === playerSymbol ? t('tictactoe_win_message') : winnerInfo.winner === aiSymbol ? t('tictactoe_lose_message') : t('tictactoe_draw_message')}
                        </h2>
                        <div className="flex gap-4">
                            <button onClick={resetBoard} className="flex-1 py-3 px-4 rounded-lg font-semibold text-white bg-primary hover:bg-violet-700 transition-colors">{t('tictactoe_play_again')}</button>
                            <button onClick={handleSettingsChange} className="flex-1 py-3 px-4 rounded-lg font-semibold text-white bg-secondary hover:bg-muted transition-colors">{t('tictactoe_change_difficulty')}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TicTacToe;
