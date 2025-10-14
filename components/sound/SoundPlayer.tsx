import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface Sound {
  nameKey: string;
  url: string;
  icon: React.ElementType;
}

interface SoundPlayerProps {
  sounds: Sound[];
}

const SoundPlayer: React.FC<SoundPlayerProps> = ({ sounds }) => {
  const [currentSoundIndex, setCurrentSoundIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { t } = useLanguage();

  const currentSound = sounds[currentSoundIndex];

  // This single effect manages all audio state synchronization robustly.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;

    const playAudio = () => {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          if (error.name !== 'AbortError') {
            console.error("Audio play failed:", error);
            setIsPlaying(false);
          }
        });
      }
    };

    if (isPlaying) {
      // If the audio source is still loading (readyState < 3),
      // we wait for it to be playable before attempting to play.
      if (audio.readyState < 3) { // HAVE_FUTURE_DATA
        let aborted = false;
        const handleCanPlay = () => {
          if (!aborted) {
            playAudio();
          }
        };
        audio.addEventListener('canplay', handleCanPlay);
        
        return () => {
          aborted = true;
          audio.removeEventListener('canplay', handleCanPlay);
        };
      } else {
        // If it's already playable, play immediately.
        playAudio();
      }
    } else {
      audio.pause();
    }
  }, [isPlaying, volume, currentSound]);

  const togglePlayPause = () => {
    setIsPlaying(prev => !prev);
  };
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  const handleSoundSelect = (index: number) => {
    if (index !== currentSoundIndex) {
      setCurrentSoundIndex(index);
      // Always play when selecting a new sound
      setIsPlaying(true);
    } else {
      // If clicking the same sound, toggle playback
      togglePlayPause();
    }
  };


  return (
    <div className="bg-secondary/50 p-4 rounded-xl space-y-4">
        {/* Render the audio element and control it via its ref and props */}
        <audio ref={audioRef} src={currentSound.url} loop />
        
        <div className="flex items-center gap-4">
            <button
                onClick={togglePlayPause}
                className="p-3 rounded-full bg-primary text-primary-foreground hover:bg-violet-700 transition-colors"
                aria-label={isPlaying ? 'Pause' : 'Play'}
            >
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </button>
            <div className="flex-1">
                <h4 className="font-semibold text-foreground">{t(currentSound.nameKey)}</h4>
                <p className="text-sm text-muted-foreground">{t('interventions_sound_playing')}</p>
            </div>
             <div className="flex items-center gap-2">
                {volume > 0 ? <Volume2 className="h-5 w-5 text-muted-foreground" /> : <VolumeX className="h-5 w-5 text-muted-foreground" />}
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-24 h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
            </div>
        </div>
        <div className="flex flex-wrap gap-2">
            {sounds.map((sound, index) => (
                <button
                    key={sound.nameKey}
                    onClick={() => handleSoundSelect(index)}
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                        currentSoundIndex === index && isPlaying
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

export default SoundPlayer;