import React, { useState } from 'react';
import CognitiveReframing from './tools/CognitiveReframing';
import EmotionWheel from './tools/EmotionWheel';
import MoodBooster from './tools/MoodBooster';
import MindfulTap from './tools/minigames/MindfulTap';
import Sudoku from './tools/minigames/Sudoku';
import MiniCrosswords from './tools/minigames/MiniCrosswords';
import RiddleMeThis from './tools/minigames/RiddleMeThis';
import CalmTales from './tools/CalmTales';
import MemoryMatch from './tools/minigames/MemoryMatch';
import TicTacToe from './tools/minigames/TicTacToe';
import { analyzeDream, generateCalmSpaceImage } from '@/services/geminiService';
import { type DreamAnalysis, type CalmSpaceImage } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

import { BrainCircuit, MessageSquareQuote, Smile, Sparkles, Puzzle, ArrowLeft, Hand, Calculator, FileText, Moon, Image, MessageCircleQuestion, BookOpen, Copy, Hash } from 'lucide-react';
import { StressDataHook } from '@/types';
import { Loader2 } from 'lucide-react';

type View = 'main' | 'games' | 'mood_booster' | 'reframing' | 'emotion_wheel' | 'mindful_tap' | 'sudoku' | 'crossword' | 'dream_analyzer' | 'calm_space' | 'riddle_me_this' | 'tale_library' | 'memory_match' | 'tic_tac_toe';

interface ToolsProps {
    stressDataHook: StressDataHook;
}

const DreamAnalyzer: React.FC<{onBack: () => void}> = ({onBack}) => {
    const [dreamText, setDreamText] = useState('');
    const [analysis, setAnalysis] = useState<DreamAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { t } = useLanguage();

    const handleAnalyze = async () => {
        if (!dreamText.trim()) return;
        setIsLoading(true);
        setAnalysis(null);
        const result = await analyzeDream(dreamText);
        setAnalysis(result);
        setIsLoading(false);
    };

    return (
        <div className="glass-card h-full rounded-2xl p-4 sm:p-6 flex flex-col animate-fadeIn max-w-3xl mx-auto">
            <button onClick={onBack} className="self-start mb-4 text-primary hover:text-violet-300 font-semibold transition-colors flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" /> {t('tool_back_to_tools')}
            </button>
            <div className="text-center mb-6">
                 <Moon className="h-10 w-10 text-primary mx-auto mb-2" />
                <h2 className="text-3xl font-bold">{t('tool_dream_title')}</h2>
                <p className="text-muted-foreground">{t('tool_dream_desc')}</p>
            </div>
            
            <textarea
                value={dreamText}
                onChange={e => setDreamText(e.target.value)}
                placeholder={t('tool_dream_placeholder')}
                className="w-full flex-1 p-3 text-sm bg-secondary rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary border-border min-h-[150px]"
                disabled={isLoading}
            />
            <button onClick={handleAnalyze} disabled={isLoading || !dreamText.trim()} className="mt-4 w-full py-3 px-4 rounded-lg font-semibold text-white bg-primary hover:bg-violet-700 transition-colors disabled:bg-muted flex items-center justify-center gap-2">
                {isLoading ? <><Loader2 className="animate-spin h-5 w-5"/> {t('tool_dream_analyzing')}</> : t('tool_dream_button')}
            </button>

            {analysis && (
                <div className="mt-6 space-y-4 animate-fadeIn">
                    <div>
                        <h3 className="font-bold text-lg text-primary">{t('tool_dream_summary')}</h3>
                        <p className="text-muted-foreground">{analysis.summary}</p>
                    </div>
                     <div>
                        <h3 className="font-bold text-lg text-primary">{t('tool_dream_themes')}</h3>
                        <div className="space-y-2 mt-2">
                            {analysis.themes.map(theme => (
                                <div key={theme.theme} className="p-3 bg-secondary rounded-lg">
                                    <p className="font-semibold text-foreground">{theme.theme}</p>
                                    <p className="text-sm text-muted-foreground">{theme.relevance}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-primary">{t('tool_dream_interpretation')}</h3>
                        <p className="text-muted-foreground whitespace-pre-wrap">{analysis.interpretation}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

const CalmSpace: React.FC<{onBack: () => void}> = ({onBack}) => {
    const [imageResult, setImageResult] = useState<CalmSpaceImage | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { t } = useLanguage();

    const handleGenerate = async () => {
        setIsLoading(true);
        setImageResult(null);
        const result = await generateCalmSpaceImage();
        setImageResult(result);
        setIsLoading(false);
    };

    return (
         <div className="glass-card h-full rounded-2xl p-4 sm:p-6 flex flex-col animate-fadeIn max-w-4xl mx-auto">
            <button onClick={onBack} className="self-start mb-4 text-primary hover:text-violet-300 font-semibold transition-colors flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" /> {t('tool_back_to_tools')}
            </button>
            <div className="text-center mb-6">
                 <Image className="h-10 w-10 text-primary mx-auto mb-2" />
                <h2 className="text-3xl font-bold">{t('tool_calm_title')}</h2>
                <p className="text-muted-foreground">{t('tool_calm_desc')}</p>
            </div>
            
            {!imageResult && !isLoading && (
                 <div className="flex-1 flex items-center justify-center">
                    <button onClick={handleGenerate} className="py-4 px-8 text-lg rounded-lg font-semibold text-white bg-primary hover:bg-violet-700 transition-colors flex items-center justify-center gap-3 shadow-lg shadow-primary/20">
                        <Sparkles/> {t('tool_calm_button')}
                    </button>
                </div>
            )}

            {isLoading && (
                 <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <Loader2 className="h-12 w-12 text-primary animate-spin" />
                    <p className="mt-4 text-muted-foreground">{t('tool_calm_generating')}</p>
                </div>
            )}

            {imageResult && !isLoading && (
                 <div className="flex-1 flex flex-col items-center justify-center animate-fadeIn">
                    <div className="w-full aspect-video rounded-lg overflow-hidden shadow-lg border-2 border-primary/50">
                        <img src={`data:image/jpeg;base64,${imageResult.base64Image}`} alt={imageResult.prompt} className="w-full h-full object-cover"/>
                    </div>
                    <p className="text-xs text-muted-foreground italic mt-2 text-center max-w-xl">"{imageResult.prompt}"</p>
                    <button onClick={handleGenerate} className="mt-6 py-2 px-6 rounded-lg font-semibold text-white bg-secondary hover:bg-muted transition-colors">
                        {t('tool_calm_new_button')}
                    </button>
                </div>
            )}
        </div>
    );
};

const ToolCard = ({ title, description, icon: Icon, onClick }: { title: string; description: string; icon: React.ElementType; onClick: () => void }) => (
    <button onClick={onClick} className="glass-card p-6 rounded-2xl text-left w-full h-full flex flex-col transition-transform duration-300 ease-in-out hover:scale-[1.02] focus:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary">
        <div className="mb-4 rounded-full p-3 w-max bg-primary/20">
            <Icon className="h-6 w-6 text-primary"/>
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground flex-1">{description}</p>
    </button>
);

const MiniGamesView = ({ onSelectGame, onBack }: { onSelectGame: (game: View) => void; onBack: () => void }) => {
    const { t } = useLanguage();
    return (
        <div className="space-y-6">
            <button onClick={onBack} className="self-start mb-4 text-primary hover:text-violet-300 font-semibold transition-colors flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" /> {t('tool_back_to_tools')}
            </button>
            <div className="text-center">
                <Puzzle className="h-10 w-10 text-primary mx-auto mb-2" />
                <h2 className="text-3xl font-bold">{t('games_title')}</h2>
                <p className="text-muted-foreground">{t('games_desc')}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <ToolCard 
                    title={t('games_tap_title')}
                    description={t('games_tap_desc')}
                    icon={Hand}
                    onClick={() => onSelectGame('mindful_tap')}
                />
                <ToolCard 
                    title={t('games_sudoku_title')}
                    description={t('games_sudoku_desc')}
                    icon={Calculator}
                    onClick={() => onSelectGame('sudoku')}
                />
                <ToolCard 
                    title={t('games_crossword_title')}
                    description={t('games_crossword_desc')}
                    icon={FileText}
                    onClick={() => onSelectGame('crossword')}
                />
                 <ToolCard 
                    title={t('games_riddle_title')}
                    description={t('games_riddle_desc')}
                    icon={MessageCircleQuestion}
                    onClick={() => onSelectGame('riddle_me_this')}
                />
                <ToolCard
                    title={t('games_memory_title')}
                    description={t('games_memory_desc')}
                    icon={Copy}
                    onClick={() => onSelectGame('memory_match')}
                />
                <ToolCard
                    title={t('games_tictactoe_title')}
                    description={t('games_tictactoe_desc')}
                    icon={Hash}
                    onClick={() => onSelectGame('tic_tac_toe')}
                />
            </div>
        </div>
    );
};


const Tools: React.FC<ToolsProps> = ({ stressDataHook }) => {
    const [view, setView] = useState<View>('main');

    const handleBack = () => {
        if (['mindful_tap', 'sudoku', 'crossword', 'riddle_me_this', 'memory_match', 'tic_tac_toe'].includes(view)) {
            setView('games');
        } else {
            setView('main');
        }
    };
    
    const renderContent = () => {
        switch (view) {
            case 'mood_booster':
                return <MoodBooster onBack={handleBack} />;
            case 'reframing':
                return <CognitiveReframing onBack={handleBack} />;
            case 'emotion_wheel':
                return <EmotionWheel onBack={handleBack} stressDataHook={stressDataHook} />;
            case 'dream_analyzer':
                return <DreamAnalyzer onBack={handleBack} />;
            case 'calm_space':
                return <CalmSpace onBack={handleBack} />;
            case 'tale_library':
                return <CalmTales onBack={handleBack} />;
            case 'mindful_tap':
                return <MindfulTap onBack={handleBack} />;
            case 'sudoku':
                return <Sudoku onBack={handleBack} />;
            case 'crossword':
                return <MiniCrosswords onBack={handleBack} />;
            case 'riddle_me_this':
                return <RiddleMeThis onBack={handleBack} />;
            case 'memory_match':
                return <MemoryMatch onBack={handleBack} />;
            case 'tic_tac_toe':
                return <TicTacToe onBack={handleBack} />;
            case 'games':
                return <MiniGamesView onSelectGame={(game) => setView(game as View)} onBack={() => setView('main')} />;
            default:
                return <MainView onSelect={(tool) => setView(tool as View)} />;
        }
    };

    return <div className="animate-fadeIn h-full">{renderContent()}</div>;
};

const MainView = ({ onSelect }: { onSelect: (view: View) => void }) => {
    const { t } = useLanguage();
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold">{t('tools_title')}</h2>
            <p className="text-muted-foreground">{t('tools_description')}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ToolCard 
                    title={t('tools_emotion_wheel_title')}
                    description={t('tools_emotion_wheel_desc')}
                    icon={Smile}
                    onClick={() => onSelect('emotion_wheel')}
                />
                <ToolCard 
                    title={t('tools_reframing_title')}
                    description={t('tools_reframing_desc')}
                    icon={BrainCircuit}
                    onClick={() => onSelect('reframing')}
                />
                <ToolCard 
                    title={t('tools_booster_title')}
                    description={t('tools_booster_desc')}
                    icon={Sparkles}
                    onClick={() => onSelect('mood_booster')}
                />
                 <ToolCard 
                    title={t('tools_games_title')}
                    description={t('tools_games_desc')}
                    icon={Puzzle}
                    onClick={() => onSelect('games')}
                />
                <ToolCard 
                    title={t('tools_dream_title')}
                    description={t('tools_dream_desc')}
                    icon={Moon}
                    onClick={() => onSelect('dream_analyzer')}
                />
                <ToolCard 
                    title={t('tools_calm_title')}
                    description={t('tools_calm_desc')}
                    icon={Image}
                    onClick={() => onSelect('calm_space')}
                />
                 <ToolCard 
                    title={t('tool_tale_library_title')}
                    description={t('tool_tale_library_desc')}
                    icon={BookOpen}
                    onClick={() => onSelect('tale_library')}
                />
            </div>
        </div>
    );
};

export default Tools;