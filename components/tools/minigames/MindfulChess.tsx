import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Trophy, BrainCircuit, Loader2, Undo } from 'lucide-react';
import { getChessMove } from '../../../services/geminiService';
import { type ChessGame } from '../../../types';
import { useLanguage } from '../../../contexts/LanguageContext';

interface MindfulChessProps {
  onBack: () => void;
}

const fenToBoard = (fen: string): (string | null)[][] => {
    const board: (string | null)[][] = [];
    const [position] = fen.split(' ');
    const rows = position.split('/');

    for (const row of rows) {
        const boardRow: (string | null)[] = [];
        for (const char of row) {
            if (isNaN(parseInt(char))) {
                boardRow.push(char);
            } else {
                for (let i = 0; i < parseInt(char, 10); i++) {
                    boardRow.push(null);
                }
            }
        }
        board.push(boardRow);
    }
    return board;
};

const pieceMap: { [key: string]: string } = {
    'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚', 'p': '♟︎',
    'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔', 'P': '♙',
};

const pieceOrderValue: { [key: string]: number } = { 'q': 1, 'r': 2, 'b': 3, 'n': 4, 'p': 5 };

const CapturedPieces = ({ fen, playerColor }: { fen: string; playerColor: 'White' | 'Black' }) => {
    const initialPieceCount: { [key: string]: number } = { p: 8, n: 2, b: 2, r: 2, q: 1, P: 8, N: 2, B: 2, R: 2, Q: 1 };
    
    const currentCounts: { [key: string]: number } = {};
    fen.split(' ')[0].replace(/\//g, '').split('').forEach(char => {
        if (isNaN(parseInt(char))) {
            currentCounts[char] = (currentCounts[char] || 0) + 1;
        }
    });

    const captured: string[] = [];
    for (const piece in initialPieceCount) {
        // Show white pieces if black captured them, and black pieces if white captured them.
        if ((playerColor === 'Black' && piece === piece.toUpperCase()) || (playerColor === 'White' && piece === piece.toLowerCase())) {
            const numCaptured = initialPieceCount[piece] - (currentCounts[piece] || 0);
            for (let i = 0; i < numCaptured; i++) {
                captured.push(piece);
            }
        }
    }

    captured.sort((a, b) => pieceOrderValue[a.toLowerCase() as keyof typeof pieceOrderValue] - pieceOrderValue[b.toLowerCase() as keyof typeof pieceOrderValue]);

    return (
        <div className="flex items-center gap-1 h-8 w-full max-w-lg px-2">
            <div className="flex-1 flex items-center gap-0.5">
                {captured.map((p, i) => {
                    const pieceIsWhite = p === p.toUpperCase();
                    const pieceColor = pieceIsWhite ? 'text-gray-200' : 'text-gray-800';
                     const shadowStyle = pieceIsWhite 
                        ? { textShadow: '1px 1px 2px rgba(0,0,0,0.5)' } 
                        : { textShadow: '1px 1px 2px rgba(255,255,255,0.4)' };
                    return <span key={i} className={`text-xl ${pieceColor}`} style={shadowStyle}>{pieceMap[p]}</span>;
                })}
            </div>
        </div>
    );
};


const PromotionModal = ({ color, onSelect }: { color: 'White' | 'Black', onSelect: (piece: 'q' | 'r' | 'b' | 'n') => void }) => {
    const promotionPieces = color === 'White' ? ['Q', 'R', 'B', 'N'] : ['q', 'r', 'b', 'n'];
    
    return (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-20 rounded-lg">
            <div className="bg-card p-4 rounded-lg flex gap-2">
                {promotionPieces.map(p => (
                    <button key={p} onClick={() => onSelect(p.toLowerCase() as 'q' | 'r' | 'b' | 'n')} className="w-16 h-16 bg-secondary hover:bg-muted transition-colors rounded-md text-5xl flex items-center justify-center">
                        {pieceMap[p]}
                    </button>
                ))}
            </div>
        </div>
    );
};


const ChessBoard = ({ fen, onSquareClick, selectedSquare, legalMoves, isLoading }: { fen: string; onSquareClick: (row: number, col: number) => void; selectedSquare: { row: number; col: number } | null; legalMoves: string[]; isLoading: boolean; }) => {
    const board = fenToBoard(fen);
    const { t } = useLanguage();
    const selectedSquareName = selectedSquare ? `${String.fromCharCode(97 + selectedSquare.col)}${8 - selectedSquare.row}` : null;
    
    const possibleMoveSquares = selectedSquareName 
        ? legalMoves.filter(move => move.startsWith(selectedSquareName!)).map(move => move.substring(2, 4))
        : [];

    const lightSquareColor = "bg-[#E1EBF5]";
    const darkSquareColor = "bg-[#6B8EAD]";

    return (
        <div className="relative aspect-square w-full max-w-lg shadow-inner">
            <div className="grid grid-cols-8 grid-rows-8 gap-0">
                {board.map((row, rIdx) => 
                    row.map((piece, cIdx) => {
                        const isLight = (rIdx + cIdx) % 2 !== 0;
                        const squareName = `${String.fromCharCode(97 + cIdx)}${8 - rIdx}`;
                        const isSelected = selectedSquare && selectedSquare.row === rIdx && selectedSquare.col === cIdx;
                        const isPossibleMove = possibleMoveSquares.includes(squareName);
                        const isCaptureMove = isPossibleMove && piece !== null;
                        const isEmptyMove = isPossibleMove && piece === null;

                        const pieceIsWhite = piece && piece === piece.toUpperCase();
                        const pieceColor = pieceIsWhite ? 'text-gray-100' : 'text-gray-800';
                        const shadowStyle = pieceIsWhite 
                            ? { textShadow: '1px 1px 3px rgba(0,0,0,0.6)' } 
                            : { textShadow: '1px 1px 3px rgba(255,255,255,0.4)' };

                        return (
                            <div 
                                key={`${rIdx}-${cIdx}`} 
                                className={`relative flex items-center justify-center aspect-square cursor-pointer ${isLight ? lightSquareColor : darkSquareColor}`}
                                onClick={() => onSquareClick(rIdx, cIdx)}
                            >
                                {piece && <span className={`text-4xl md:text-5xl font-bold pointer-events-none ${pieceColor}`} style={shadowStyle}>{pieceMap[piece]}</span>}
                                {isSelected && <div className="absolute inset-0 bg-yellow-500/50 pointer-events-none"></div>}
                                {isEmptyMove && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="h-1/3 w-1/3 bg-slate-500/50 rounded-full"></div>
                                    </div>
                                )}
                                {isCaptureMove && (
                                    <div className="absolute inset-0 border-4 border-slate-500/50 rounded-full pointer-events-none"></div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
            {isLoading && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-center animate-fadeIn z-10 rounded-lg">
                    <Loader2 className="h-12 w-12 text-primary animate-spin" />
                    <p className="mt-4 text-white font-semibold">{t('chess_thinking')}</p>
                </div>
            )}
        </div>
    );
};


const MindfulChess: React.FC<MindfulChessProps> = ({ onBack }) => {
    const [game, setGame] = useState<ChessGame | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedSquare, setSelectedSquare] = useState<{ row: number; col: number } | null>(null);
    const [history, setHistory] = useState<ChessGame[]>([]);
    const [promotionMove, setPromotionMove] = useState<{ from: string; to: string } | null>(null);
    const { t } = useLanguage();


    useEffect(() => {
        startNewGame();
    }, []);

    const startNewGame = async () => {
        setIsLoading(true);
        setGame(null);
        setSelectedSquare(null);
        setHistory([]);
        const response = await getChessMove('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', null);
        setGame(response.chessGame);
        setIsLoading(false);
    };

    const makeMove = async (moveUci: string) => {
        if (!game) return;
        setHistory(prev => [...prev, game]);
        setIsLoading(true);
        setSelectedSquare(null);
        setPromotionMove(null);
        
        const currentFen = game.status === 'In Progress' ? game.boardFEN : game.updatedBoardFEN;
        const response = await getChessMove(currentFen, moveUci);
        
        setGame(response.chessGame);
        setIsLoading(false);
    };

    const handleUndo = () => {
        if (history.length === 0) return;
        const lastState = history[history.length - 1];
        setGame(lastState);
        setHistory(prev => prev.slice(0, -1));
        setSelectedSquare(null);
        setIsLoading(false);
    };
    
    const handlePromotionSelect = (piece: 'q' | 'r' | 'b' | 'n') => {
        if (promotionMove) {
            const moveUci = `${promotionMove.from}${promotionMove.to}${piece}`;
            makeMove(moveUci);
        }
    };

    const handleSquareClick = async (row: number, col: number) => {
        if (isLoading || !game || game.status !== 'In Progress' && game.status !== 'Check' || game.turn !== 'White') return;

        const squareName = `${String.fromCharCode(97 + col)}${8 - row}`;

        if (selectedSquare) {
            const fromSquare = `${String.fromCharCode(97 + selectedSquare.col)}${8 - selectedSquare.row}`;
            if (fromSquare === squareName) {
                setSelectedSquare(null);
                return;
            }
            
            const moveUci = `${fromSquare}${squareName}`;
            const board = fenToBoard(game.boardFEN);
            const piece = board[selectedSquare.row][selectedSquare.col];

            // Check for pawn promotion
            if (piece === 'P' && selectedSquare.row === 1 && row === 0) {
                if (game.legalMoves.some(m => m.startsWith(moveUci))) {
                    setPromotionMove({ from: fromSquare, to: squareName });
                    return; // Wait for user to select promotion piece
                }
            }
            
            if (game.legalMoves.some(m => m.startsWith(moveUci))) {
                await makeMove(moveUci);
            } else {
                setSelectedSquare(null);
            }
        } else {
            const board = fenToBoard(game.boardFEN);
            const piece = board[row][col];
            if (piece && piece === piece.toUpperCase()) {
                setSelectedSquare({ row, col });
            }
        }
    };
    
    if (isLoading && !game) {
        return (
            <div className="glass-card h-full rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center text-center animate-fadeIn max-w-2xl mx-auto">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
                <p className="mt-4 text-muted-foreground">{t('chess_loading')}</p>
            </div>
        );
    }
    
    if (!game) return null;

    if (game.gameEndMessage) {
        return (
          <div className="glass-card h-full rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center text-center animate-fadeIn max-w-2xl mx-auto">
            <Trophy className="h-16 w-16 text-amber-400 mb-4"/>
            <h2 className="text-3xl font-bold mb-4">{game.status}!</h2>
            <p className="text-muted-foreground mb-6">{game.gameEndMessage}</p>
            <div className="flex items-center gap-4">
                <button onClick={startNewGame} className="text-primary hover:text-violet-300 font-semibold transition-colors flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" /> {t('chess_play_again')}
                </button>
                 <button onClick={onBack} className="text-muted-foreground hover:text-foreground font-semibold transition-colors flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" /> {t('chess_end_back')}
                </button>
            </div>
          </div>
        );
    }

    const currentFenForDisplay = game.updatedBoardFEN;

    return (
        <div className="glass-card h-full rounded-2xl p-4 sm:p-6 flex flex-col animate-fadeIn max-w-5xl mx-auto">
             <div className="flex items-center justify-between mb-4">
                <button onClick={onBack} className="text-primary hover:text-violet-300 font-semibold transition-colors flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" /> {t('tool_back_to_games')}
                </button>
                <div className="flex items-center gap-4">
                     <button onClick={handleUndo} disabled={history.length === 0} className="text-muted-foreground hover:text-foreground font-semibold transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                        <Undo className="h-4 w-4" /> {t('chess_undo')}
                    </button>
                    <button onClick={startNewGame} className="text-muted-foreground hover:text-foreground font-semibold transition-colors flex items-center gap-2">
                        <RefreshCw className="h-4 w-4" /> {t('chess_new_game')}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 flex-1">
                <div className="lg:col-span-3 flex flex-col items-center justify-center">
                    <CapturedPieces fen={currentFenForDisplay} playerColor="Black" />
                    <div className="relative w-full max-w-lg">
                        <ChessBoard 
                            fen={currentFenForDisplay}
                            onSquareClick={handleSquareClick}
                            selectedSquare={selectedSquare}
                            legalMoves={game.legalMoves}
                            isLoading={isLoading}
                        />
                         {promotionMove && <PromotionModal color="White" onSelect={handlePromotionSelect} />}
                    </div>
                    <CapturedPieces fen={currentFenForDisplay} playerColor="White" />
                </div>
                
                <div className="lg:col-span-2 flex flex-col bg-secondary/50 p-4 rounded-xl">
                    <div className="text-center mb-4">
                        <BrainCircuit className="h-8 w-8 text-primary mx-auto mb-2" />
                        <h2 className="text-2xl font-bold">{t('chess_title')}</h2>
                    </div>

                    <div className="space-y-3 flex-1">
                        <div className="p-3 bg-background rounded-lg text-center">
                            <p className="text-sm font-semibold text-muted-foreground">{t('chess_status')}</p>
                            <p className={`font-bold text-lg ${game.status === 'Check' ? 'text-destructive' : 'text-primary'}`}>{game.status}</p>
                        </div>
                         <div className="p-3 bg-background rounded-lg text-center">
                            <p className="text-sm font-semibold text-muted-foreground">{t('chess_last_move')}</p>
                            <p className="font-bold text-lg text-foreground">{game.aiMove || 'N/A'}</p>
                        </div>
                         <div className="p-3 bg-background rounded-lg">
                            <p className="text-sm font-semibold text-muted-foreground text-center">{t('chess_thought')}</p>
                            <p className="text-center text-sm italic text-muted-foreground mt-1">"{game.moodBoostMessage}"</p>
                        </div>
                        {game.hint && (
                             <div className="p-3 bg-amber-900/50 border border-amber-500/50 rounded-lg">
                                <p className="text-sm font-semibold text-amber-400">{t('chess_hint_for_white')}</p>
                                <p className="text-sm text-amber-300">{game.hint}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MindfulChess;