import { useEffect, useRef } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { type ReminderSettings } from '../types';

const defaultSettings: ReminderSettings = {
    mindfulMoment: { enabled: false, interval: 2 }, // default 2 hours
    hydration: { enabled: false, interval: 1 }, // default 1 hour
    endOfShift: { enabled: false, interval: 8 }, // default 8 hours
};

const REMINDER_MESSAGES = {
    mindfulMoment: {
        title: 'Mindful Moment',
        body: 'Time for a quick break. Step away and take a few deep breaths.'
    },
    hydration: {
        title: 'Hydration Reminder',
        body: 'Stay hydrated! Time to drink some water.'
    },
    endOfShift: {
        title: 'End of Shift Check-in',
        body: "How are you feeling? Don't forget to log your stress for the day."
    }
}

const showNotification = (title: string, body: string) => {
    if (!('Notification' in window)) {
        console.log("This browser does not support desktop notification");
        return;
    }

    if (Notification.permission === 'granted') {
        new Notification(title, { body, icon: '/favicon.ico' });
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                new Notification(title, { body, icon: '/favicon.ico' });
            }
        });
    }
};


export const useReminders = () => {
    const [settings, setSettings] = useLocalStorage<ReminderSettings>('reminderSettings', defaultSettings);
    const timersRef = useRef<Record<string, number | null>>({});

    useEffect(() => {
        // Clear all existing timers when settings change
        Object.values(timersRef.current).forEach(timerId => {
            if (typeof timerId === 'number') {
                clearInterval(timerId);
            }
        });
        timersRef.current = {};

        // Set new timers based on current settings
        (Object.keys(settings) as Array<keyof ReminderSettings>).forEach((key) => {
            const value = settings[key];
            if (value.enabled && value.interval > 0) {
                const intervalMs = value.interval * 60 * 60 * 1000;
                const { title, body } = REMINDER_MESSAGES[key];

                timersRef.current[key] = window.setInterval(() => {
                    showNotification(title, body);
                }, intervalMs);
            }
        });
        
        // Cleanup function to clear timers on unmount
        return () => {
            Object.values(timersRef.current).forEach(timerId => {
                if (typeof timerId === 'number') {
                    clearInterval(timerId);
                }
            });
        };

    }, [settings]);

    return { settings, setSettings };
}