import React, { useState, useMemo } from 'react';
import { type StressDataHook, type CalendarEvent } from '../types';
import { ChevronLeft, ChevronRight, X, HeartPulse, Bed, Footprints, Activity, Smile, MessageSquare } from 'lucide-react';

interface CalendarViewProps {
    stressDataHook: StressDataHook;
}

const EVENT_TYPE_CONFIG = {
    stress: { icon: HeartPulse, color: 'text-red-400' },
    sleep: { icon: Bed, color: 'text-blue-400' },
    steps: { icon: Footprints, color: 'text-emerald-400' },
    activity: { icon: Activity, color: 'text-yellow-400' },
    emotion: { icon: Smile, color: 'text-amber-400' },
    event: { icon: MessageSquare, color: 'text-purple-400' },
};


const CalendarView: React.FC<CalendarViewProps> = ({ stressDataHook }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const eventsByDate = useMemo(() => {
        const events: CalendarEvent[] = [
            ...stressDataHook.stressLogs.map(log => ({ id: log.id, title: `Stress: ${log.level}/10`, date: new Date(log.timestamp), type: 'stress' as const, data: log })),
            ...stressDataHook.sleepLogs.map(log => ({ id: log.id, title: `Sleep: ${log.hours}h`, date: new Date(log.timestamp), type: 'sleep' as const, data: log })),
            ...stressDataHook.stepLogs.map(log => ({ id: log.id, title: `Steps: ${log.steps.toLocaleString()}`, date: new Date(log.timestamp), type: 'steps' as const, data: log })),
            ...stressDataHook.wellnessActivities.map(act => ({ id: act.id, title: act.activity, date: new Date(act.timestamp), type: 'activity' as const, data: act })),
            ...stressDataHook.emotionJournal.map(entry => ({ id: entry.id, title: `Felt ${entry.primaryEmotion}`, date: new Date(entry.timestamp), type: 'emotion' as const, data: entry })),
            ...stressDataHook.eventLogs.map(log => ({ id: log.id, title: log.description, date: new Date(log.timestamp), type: 'event' as const, data: log })),
        ];

        const grouped = new Map<string, CalendarEvent[]>();
        events.forEach(event => {
            const dateKey = event.date.toISOString().split('T')[0];
            if (!grouped.has(dateKey)) {
                grouped.set(dateKey, []);
            }
            grouped.get(dateKey)?.push(event);
        });
        return grouped;
    }, [stressDataHook]);

    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = new Date(startOfMonth);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    const endDate = new Date(endOfMonth);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

    const days = [];
    let day = startDate;
    while (day <= endDate) {
        days.push(new Date(day));
        day.setDate(day.getDate() + 1);
    }
    
    const changeMonth = (amount: number) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + amount, 1));
    };

    const isSameDay = (d1: Date, d2: Date) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();

    const renderEventDetails = (event: CalendarEvent) => {
        const config = EVENT_TYPE_CONFIG[event.type];
        const Icon = config.icon;
        return (
            <div key={event.id} className="flex items-start gap-3 p-2 bg-background rounded-md">
                <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${config.color}`} />
                <div>
                    <p className="text-sm font-semibold text-foreground">{event.title}</p>
                    <p className="text-xs text-muted-foreground">{event.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
            </div>
        )
    };

    return (
        <div className="flex flex-col h-full animate-fadeIn">
            <div className="glass-card p-4 rounded-t-2xl flex items-center justify-between">
                <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-secondary"><ChevronLeft /></button>
                <h2 className="text-xl font-bold text-foreground">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
                <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-secondary"><ChevronRight /></button>
            </div>

            <div className="grid grid-cols-7 text-center font-semibold text-muted-foreground p-2 bg-secondary/30">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day}>{day}</div>)}
            </div>
            
            <div className="grid grid-cols-7 flex-1 bg-card rounded-b-2xl">
                {days.map((d, i) => {
                    const dateKey = d.toISOString().split('T')[0];
                    const dayEvents = eventsByDate.get(dateKey) || [];
                    const isCurrentMonth = d.getMonth() === currentDate.getMonth();
                    const isToday = isSameDay(d, new Date());
                    return (
                        <div
                            key={i}
                            className={`p-1.5 border-t border-l border-border flex flex-col cursor-pointer transition-colors ${isCurrentMonth ? 'hover:bg-secondary' : 'bg-secondary/20 hover:bg-secondary/50'}`}
                            onClick={() => setSelectedDate(d)}
                        >
                            <span className={`self-end text-xs font-semibold p-1 rounded-full w-6 h-6 flex items-center justify-center ${isToday ? 'bg-primary text-primary-foreground' : isCurrentMonth ? 'text-foreground' : 'text-muted-foreground/50'}`}>
                                {d.getDate()}
                            </span>
                             <div className="flex-1 overflow-y-auto space-y-1 mt-1">
                                {dayEvents.slice(0, 3).map(event => {
                                    const config = EVENT_TYPE_CONFIG[event.type];
                                    const Icon = config.icon;
                                    return (
                                        <div key={event.id} className="flex items-center gap-1.5 text-xs p-1 bg-background rounded">
                                           <Icon className={`h-3 w-3 ${config.color}`} />
                                           <span className="truncate text-muted-foreground">{event.title}</span>
                                        </div>
                                    )
                                })}
                                {dayEvents.length > 3 && (
                                    <div className="text-xs text-center text-primary font-semibold">
                                        +{dayEvents.length - 3} more
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            
            {selectedDate && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn" onClick={() => setSelectedDate(null)}>
                    <div className="glass-card w-full max-w-md m-4 rounded-2xl shadow-lg border border-primary/50" onClick={e => e.stopPropagation()}>
                        <div className="p-4 flex items-center justify-between border-b border-border">
                            <h3 className="font-bold text-lg text-foreground">{selectedDate.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
                            <button onClick={() => setSelectedDate(null)} className="p-2 rounded-full hover:bg-secondary"><X/></button>
                        </div>
                        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2">
                           {eventsByDate.get(selectedDate.toISOString().split('T')[0])?.length > 0 ? (
                               eventsByDate.get(selectedDate.toISOString().split('T')[0])?.sort((a,b) => a.date.getTime() - b.date.getTime()).map(renderEventDetails)
                           ) : (
                               <p className="text-center text-muted-foreground py-8">No activities logged for this day.</p>
                           )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CalendarView;
