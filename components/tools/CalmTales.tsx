import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ArrowLeft, BookOpen, Loader2, Heart, RefreshCw, Dices, CloudRain, Waves, Leaf } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { type CalmTale, type StoryCategory, type StoryMood } from '../../types';
import { generateCalmTales } from '../../services/geminiService';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface CalmTalesProps {
  onBack: () => void;
}

const CATEGORIES: StoryCategory[] = ['Calm Tales', 'Happy Laughs', 'Kind Hearts', 'Mini Adventures'];
const MOODS: StoryMood[] = ['Calm', 'Funny', 'Motivating', 'Wholesome'];

const ambientSounds = [
  { nameKey: 'sound_forest', url: 'https://cdn.pixabay.com/audio/2022/10/21/audio_132b132c32.mp3', icon: CloudRain },
  { nameKey: 'sound_ocean', url: 'https://cdn.pixabay.com/audio/2024/02/26/audio_49692a7a4a.mp3', icon: Waves },
  { nameKey: 'sound_jungle', url: 'https://cdn.pixabay.com/audio/2022/08/04/audio_394a20f962.mp3', icon: Leaf },
];

const StoryReaderView: React.FC<{
    story: CalmTale;
    onBack: () => void;
    onSelectStory: (story: CalmTale) => void;
    allStories: CalmTale[];
}> = ({ story, onBack, onSelectStory, allStories }) => {
    const { t } = useLanguage();
    const [favorites, setFavorites] = useLocalStorage<string[]>('tale_library_favorites', []);
    const isFavorite = useMemo(() => favorites.includes(story.id), [favorites, story.id]);
    const readerRef = useRef<HTMLDivElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlayingSound, setIsPlayingSound] = useState(false);
    const [currentSoundUrl, setCurrentSoundUrl] = useState(ambientSounds[0].url);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlayingSound) {
            audio.play().catch(e => console.error("Audio play failed", e));
        } else {
            audio.pause();
        }
        
        // Cleanup audio when component unmounts
        return () => {
            if(audio) {
                audio.pause();
            }
        }
    }, [isPlayingSound, currentSoundUrl]);
    
    useEffect(() => {
        // When story changes, scroll to top
        handleReadAgain();
    }, [story]);

    const handleToggleFavorite = () => {
        if (isFavorite) {
            setFavorites(favs => favs.filter(id => id !== story.id));
        } else {
            setFavorites(favs => [...favs, story.id]);
        }
    };
    
    const handleReadAgain = () => {
        readerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleRandomStory = () => {
        const randomStory = allStories[Math.floor(Math.random() * allStories.length)];
        onSelectStory(randomStory);
    };

    const handleSoundToggle = (soundUrl: string) => {
        if (isPlayingSound && currentSoundUrl === soundUrl) {
            setIsPlayingSound(false);
        } else {
            setCurrentSoundUrl(soundUrl);
            setIsPlayingSound(true);
        }
    };

    return (
        <div className="h-full flex flex-col animate-fadeIn">
            <audio ref={audioRef} src={currentSoundUrl} loop />
            <div className="flex items-center justify-between p-4 bg-transparent">
                <button onClick={onBack} className="flex items-center gap-2 font-semibold text-primary hover:text-violet-300 transition-colors">
                    <ArrowLeft className="h-5 w-5" /> {t('tool_back_to_library')}
                </button>
                <div className="flex items-center gap-2">
                    <button onClick={handleToggleFavorite} className={`p-2 rounded-full transition-colors ${isFavorite ? 'text-red-500 bg-red-500/20' : 'text-muted-foreground hover:bg-secondary'}`} aria-label={t('tale_library_favorite')}>
                        <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                    </button>
                    <button onClick={handleReadAgain} className="p-2 rounded-full text-muted-foreground hover:bg-secondary" aria-label={t('tale_library_read_again')}>
                        <RefreshCw className="h-5 w-5" />
                    </button>
                    <button onClick={handleRandomStory} className="p-2 rounded-full text-muted-foreground hover:bg-secondary" aria-label={t('tale_library_random')}>
                        <Dices className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <div ref={readerRef} className="flex-1 story-reader-view scroll-smooth">
                <div className="max-w-3xl mx-auto story-reader-content">
                    <p className="quote">{story.quote}</p>
                    <h1>{story.title}</h1>
                    <h2>{t('tale_library_by')} {story.author}</h2>
                    {story.content.split('\n').map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                    ))}
                </div>
            </div>

            <div className="p-4 flex items-center justify-center gap-2 bg-transparent">
                 {ambientSounds.map(sound => (
                    <button
                        key={sound.nameKey}
                        onClick={() => handleSoundToggle(sound.url)}
                        className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                            isPlayingSound && currentSoundUrl === sound.url
                                ? 'bg-emerald-500 text-white'
                                : 'bg-secondary text-muted-foreground hover:bg-muted'
                        }`}
                    >
                        <sound.icon className="h-4 w-4" />
                        {t(sound.nameKey)}
                    </button>
                ))}
            </div>
        </div>
    );
};


const CalmTales: React.FC<CalmTalesProps> = ({ onBack }) => {
    const { t } = useLanguage();
    const [selectedStory, setSelectedStory] = useState<CalmTale | null>(null);
    const [storyCache, setStoryCache] = useState<Record<StoryCategory, CalmTale[]>>({} as Record<StoryCategory, CalmTale[]>);
    const [isLoading, setIsLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState<StoryCategory>('Calm Tales');
    const [activeMood, setActiveMood] = useState<StoryMood | 'All'>('All');
    const [favorites] = useLocalStorage<string[]>('tale_library_favorites', []);
    
    useEffect(() => {
        const fetchStories = async () => {
            if (storyCache[activeCategory]) {
                return;
            }
            setIsLoading(true);
            const tales = await generateCalmTales(activeCategory);
            setStoryCache(prev => ({ ...prev, [activeCategory]: tales }));
            setIsLoading(false);
        };
        fetchStories();
    }, [activeCategory, storyCache]);

    const handleSelectStory = (story: CalmTale) => {
        setSelectedStory(story);
    };

    const handleRandomStory = () => {
        const allStories = Object.values(storyCache).flat();
        if (allStories.length > 0) {
            const randomStory = allStories[Math.floor(Math.random() * allStories.length)];
            setSelectedStory(randomStory);
        }
    };

    const currentStories = storyCache[activeCategory] || [];
    
    const filteredStories = useMemo(() => {
        const stories = activeMood === 'All'
            ? currentStories
            : currentStories.filter(story => story.moods.includes(activeMood));
        
        // Bring favorited stories to the front
        return [...stories].sort((a, b) => {
            const aIsFav = favorites.includes(a.id);
            const bIsFav = favorites.includes(b.id);
            if (aIsFav && !bIsFav) return -1;
            if (!aIsFav && bIsFav) return 1;
            return 0;
        });
    }, [activeMood, currentStories, favorites]);

    if (selectedStory) {
        return <StoryReaderView 
            story={selectedStory} 
            onBack={() => setSelectedStory(null)} 
            onSelectStory={setSelectedStory}
            allStories={Object.values(storyCache).flat()}
        />
    }

    return (
        <div className="h-full flex flex-col animate-fadeIn">
            <div className="p-4 sm:p-6">
                <button onClick={onBack} className="self-start mb-6 text-primary hover:text-violet-300 font-semibold transition-colors flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" /> {t('tool_back_to_tools')}
                </button>
                <div className="text-center">
                    <BookOpen className="h-10 w-10 text-primary mx-auto mb-2" />
                    <h2 className="text-3xl font-bold">{t('tool_tale_library_title')}</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">{t('tool_tale_library_desc')}</p>
                </div>
            </div>

            <div className="px-4 sm:px-6 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-4 overflow-x-auto">
                     {CATEGORIES.map(cat => (
                        <button key={cat} onClick={() => setActiveCategory(cat)} className={`py-3 px-1 sm:px-2 text-sm sm:text-base font-semibold whitespace-nowrap transition-colors ${activeCategory === cat ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                            {t(`tale_library_category_${cat.split(' ')[0].toLowerCase()}`)}
                        </button>
                    ))}
                </div>
                <button onClick={handleRandomStory} className="p-2 rounded-full text-muted-foreground hover:bg-secondary hidden sm:block" aria-label={t('tale_library_random')}>
                    <Dices className="h-5 w-5" />
                </button>
            </div>
             <div className="p-4 sm:p-6 flex items-center gap-2 flex-wrap">
                 <button onClick={() => setActiveMood('All')} className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${activeMood === 'All' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:bg-muted'}`}>{t('tale_library_mood_all')}</button>
                {MOODS.map(mood => (
                    <button key={mood} onClick={() => setActiveMood(mood)} className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${activeMood === mood ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:bg-muted'}`}>
                        {t(`tale_library_mood_${mood.toLowerCase()}`)}
                    </button>
                ))}
            </div>


            <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-6">
                {isLoading && currentStories.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span>{t('tale_library_loading')}</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                        {filteredStories.map(story => (
                             <button key={story.id} onClick={() => handleSelectStory(story)} className="group text-left">
                                <div className="story-book-cover" style={{ background: `linear-gradient(135deg, ${story.coverColor1}, ${story.coverColor2})`}}>
                                    <div className="story-book-cover-overlay"></div>
                                    <div className="relative text-white">
                                        {favorites.includes(story.id) && <Heart className="h-4 w-4 absolute -top-2 -right-2 text-red-400 fill-current" />}
                                        <h3 className="font-bold">{story.title}</h3>
                                        <p className="text-xs opacity-80">{t('tale_library_by')} {story.author}</p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CalmTales;