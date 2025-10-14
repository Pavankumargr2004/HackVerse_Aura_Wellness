import { useLocalStorage } from './useLocalStorage';
import { type ChatMessage } from '../types';

const getInitialMessages = (): ChatMessage[] => [
    {
      id: 'init-1',
      role: 'model',
      text: "Hello! I'm Aura. I can understand many Indian languages like Kannada, Hindi, and Tamil. How can I support you today?",
      timestamp: new Date().toISOString(),
    },
    {
      id: 'init-2',
      role: 'model',
      text: "Hi there! How are you doing today? I'm here to help you keep an eye on your well-being.",
      timestamp: new Date(new Date().getTime() + 1000).toISOString(),
    },
];

export const useChatHistory = () => {
    const [messages, setMessages] = useLocalStorage<ChatMessage[]>('chatHistory', getInitialMessages());

    const addMessage = (message: ChatMessage) => {
        setMessages(prev => [...prev, message]);
    };

    const clearHistory = () => {
        setMessages(getInitialMessages());
    };

    return { messages, addMessage, clearHistory };
}