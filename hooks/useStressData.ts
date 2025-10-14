import { useLocalStorage } from './useLocalStorage';
import { type StressLog, type WellnessActivity, type SleepLog, type EventLog, type Peer, type PeerChatMessage, type EmotionJournalEntry, type StepLog } from '../types';
import { generateInitialData } from './initialData';

const PEER_PROFILES = [
  { name: 'Dr. Alex Chen', title: 'ER Physician', avatar: 'AC' },
  { name: 'Nurse Maya Singh', title: 'ICU Nurse', avatar: 'MS' },
  { name: 'Dr. Emily Carter', title: 'Pediatrician', avatar: 'EC' },
  { name: 'Leo Martinez', title: 'Paramedic', avatar: 'LM' },
  { name: 'Dr. Sofia Rossi', title: 'Cardiologist', avatar: 'SR' },
];

const { 
    stressLogs: initialStressLogs, 
    sleepLogs: initialSleepLogs,
    eventLogs: initialEventLogs,
    emotionJournal: initialEmotionJournal,
    wellnessActivities: initialWellnessActivities,
    stepLogs: initialStepLogs,
} = generateInitialData();


export const useStressData = () => {
  const [stressLogs, setStressLogs] = useLocalStorage<StressLog[]>('stressLogs', initialStressLogs);
  const [wellnessActivities, setWellnessActivities] = useLocalStorage<WellnessActivity[]>('wellnessActivities', initialWellnessActivities);
  const [sleepLogs, setSleepLogs] = useLocalStorage<SleepLog[]>('sleepLogs', initialSleepLogs);
  const [stepLogs, setStepLogs] = useLocalStorage<StepLog[]>('stepLogs', initialStepLogs);
  const [eventLogs, setEventLogs] = useLocalStorage<EventLog[]>('eventLogs', initialEventLogs);
  const [emotionJournal, setEmotionJournal] = useLocalStorage<EmotionJournalEntry[]>('emotionJournal', initialEmotionJournal);
  const [peers, setPeers] = useLocalStorage<Peer[]>('peers', []);
  const [peerChats, setPeerChats] = useLocalStorage<Record<string, PeerChatMessage[]>>('peerChats', {});

  const addStressLog = (level: number, notes?: string) => {
    const newLog: StressLog = {
      id: new Date().toISOString(),
      level,
      timestamp: new Date().toISOString(),
      notes,
    };
    setStressLogs(prevLogs => [...prevLogs, newLog]);
  };

  const addSleepLog = (hours: number) => {
    const newLog: SleepLog = {
      id: new Date().toISOString(),
      hours,
      timestamp: new Date().toISOString(),
    };
    setSleepLogs(prev => [...prev, newLog]);
  };

  const addStepLog = (steps: number) => {
    const newLog: StepLog = {
      id: new Date().toISOString(),
      steps,
      timestamp: new Date().toISOString(),
    };
    setStepLogs(prev => [...prev, newLog]);
  };

  const addEventLog = (description: string) => {
    const newLog: EventLog = {
      id: new Date().toISOString(),
      description,
      timestamp: new Date().toISOString(),
    };
    setEventLogs(prev => [...prev, newLog]);
  };

  const addWellnessActivity = (activity: string) => {
    const newActivity: WellnessActivity = {
      id: new Date().toISOString(),
      activity,
      points: 10,
      timestamp: new Date().toISOString(),
    };
    setWellnessActivities(prev => [...prev, newActivity]);
  };
  
  const addEmotionJournalEntry = (entry: Omit<EmotionJournalEntry, 'id' | 'timestamp'>) => {
    const newEntry: EmotionJournalEntry = {
      ...entry,
      id: new Date().toISOString(),
      timestamp: new Date().toISOString(),
    };
    setEmotionJournal(prev => [...prev, newEntry]);
  };

  const wellnessPoints = wellnessActivities.reduce((total, activity) => total + activity.points, 0);

  const addPeer = () => {
    const existingPeerNames = new Set(peers.map(p => p.name));
    const availablePeers = PEER_PROFILES.filter(p => !existingPeerNames.has(p.name));

    if (availablePeers.length === 0) {
      console.log("All available peers have been added.");
      return;
    }
    
    const newPeerProfile = availablePeers[Math.floor(Math.random() * availablePeers.length)];
    const newPeer: Peer = {
      id: new Date().toISOString(),
      ...newPeerProfile,
    };

    setPeers(prev => [...prev, newPeer]);
    setPeerChats(prev => ({
      ...prev,
      [newPeer.id]: [{
        id: `initial-${newPeer.id}`,
        peerId: newPeer.id,
        role: 'peer',
        text: `Hey, I'm ${newPeer.name}. Glad to connect. How has your week been?`,
        timestamp: new Date().toISOString(),
      }]
    }));
  };

  const addPeerMessage = (peerId: string, message: Omit<PeerChatMessage, 'id' | 'peerId' | 'timestamp'>) => {
    const newMessage: PeerChatMessage = {
      ...message,
      id: new Date().toISOString(),
      peerId,
      timestamp: new Date().toISOString(),
    };
    
    setPeerChats(prev => {
      const currentChat = prev[peerId] || [];
      return {
        ...prev,
        [peerId]: [...currentChat, newMessage],
      };
    });
  };

  return {
    stressLogs,
    addStressLog,
    sleepLogs,
    addSleepLog,
    stepLogs,
    addStepLog,
    eventLogs,
    addEventLog,
    wellnessActivities,
    addWellnessActivity,
    wellnessPoints,
    emotionJournal,
    addEmotionJournalEntry,
    peers,
    peerChats,
    addPeer,
    addPeerMessage,
  };
};