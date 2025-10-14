import { type StressLog, type WellnessActivity, type SleepLog, type EventLog, type EmotionJournalEntry, type StepLog } from '../types';

export const generateInitialData = () => {
    const now = new Date();
    const stressLogs: StressLog[] = [];
    const sleepLogs: SleepLog[] = [];
    const stepLogs: StepLog[] = [];
    const eventLogs: EventLog[] = [];
    const emotionJournal: EmotionJournalEntry[] = [];
    const wellnessActivities: WellnessActivity[] = [];

    for (let i = 7; i > 0; i--) {
        const date = new Date();
        date.setDate(now.getDate() - i);
        
        // Add 2-3 stress logs per day
        for (let j = 0; j < Math.floor(Math.random() * 2) + 2; j++) {
            const hour = 8 + Math.floor(Math.random() * 12); // between 8am and 8pm
            date.setHours(hour, 0, 0, 0);
            stressLogs.push({
                id: `stress-${i}-${j}`,
                level: Math.floor(Math.random() * 6) + 3, // 3 to 8
                timestamp: date.toISOString(),
            });
        }

        // Add 1 sleep log per night
        date.setHours(23, 0, 0, 0); // pretend they logged sleep before midnight
        sleepLogs.push({
            id: `sleep-${i}`,
            hours: Math.floor(Math.random() * 4) + 4.5, // 4.5 to 7.5 hours
            timestamp: date.toISOString(),
        });

        // Add 1-2 step logs per day
        for (let j = 0; j < Math.floor(Math.random() * 2) + 1; j++) {
            const hour = 10 + Math.floor(Math.random() * 10); // between 10am and 8pm
            date.setHours(hour, 0, 0, 0);
            stepLogs.push({
                id: `steps-${i}-${j}`,
                steps: Math.floor(Math.random() * 4000) + 1000, // 1000 to 5000 steps
                timestamp: date.toISOString(),
            });
        }
    }
    
    // Use a fresh `now` for more predictable relative dates
    const day = (offset: number) => new Date(new Date().setDate(new Date().getDate() - offset));


    // Add some recent events
    eventLogs.push({ id: 'event-1', description: 'Handled a cardiac arrest case', timestamp: day(2).toISOString() });
    eventLogs.push({ id: 'event-2', description: 'Dealt with a difficult patient family', timestamp: day(4).toISOString() });

    // Add some emotions to make the pie chart more interesting
    emotionJournal.push({ id: 'emo-1', primaryEmotion: 'Fear', secondaryEmotion: 'Stressed', intensity: 7, timestamp: day(2).toISOString() });
    emotionJournal.push({ id: 'emo-2', primaryEmotion: 'Sadness', secondaryEmotion: 'Disappointed', intensity: 5, timestamp: day(4).toISOString() });
    emotionJournal.push({ id: 'emo-3', primaryEmotion: 'Joy', secondaryEmotion: 'Relieved', intensity: 8, timestamp: day(1).toISOString() });
    emotionJournal.push({ id: 'emo-4', primaryEmotion: 'Fear', secondaryEmotion: 'Anxious', intensity: 6, timestamp: day(5).toISOString() });
    emotionJournal.push({ id: 'emo-5', primaryEmotion: 'Anger', secondaryEmotion: 'Frustrated', intensity: 8, timestamp: day(3).toISOString() });
    emotionJournal.push({ id: 'emo-6', primaryEmotion: 'Sadness', secondaryEmotion: 'Hurt', intensity: 7, timestamp: day(6).toISOString() });
    emotionJournal.push({ id: 'emo-7', primaryEmotion: 'Fear', secondaryEmotion: 'Overwhelmed', intensity: 9, timestamp: day(1).toISOString() });
    emotionJournal.push({ id: 'emo-8', primaryEmotion: 'Fear', secondaryEmotion: 'Worried', intensity: 5, timestamp: day(0).toISOString() });


    // Add some wellness activities
    wellnessActivities.push({ id: 'well-1', activity: '5-minute meditation', points: 10, timestamp: day(1).toISOString() });
    wellnessActivities.push({ id: 'well-2', activity: 'Completed Challenge: Drink a full glass of water every 2 hours', points: 10, timestamp: day(3).toISOString() });
    wellnessActivities.push({ id: 'well-3', activity: 'Logged 7,823 steps', points: 10, timestamp: day(1).toISOString() });


    return { stressLogs, sleepLogs, eventLogs, emotionJournal, wellnessActivities, stepLogs };
};