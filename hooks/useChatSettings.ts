import { useLocalStorage } from './useLocalStorage';
import { type ChatSettings } from '../types';

const defaultSettings: ChatSettings = {
    personality: 'empathetic',
    tone: 'casual',
    verbosity: 'balanced',
};

export const useChatSettings = () => {
    const [settings, setSettings] = useLocalStorage<ChatSettings>('chatSettings', defaultSettings);

    return { settings, setSettings };
}