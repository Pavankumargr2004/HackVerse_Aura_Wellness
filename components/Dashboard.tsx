import React, { useState, useEffect } from 'react';
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, ReferenceArea } from 'recharts';
import { type StressDataHook, type RealtimeStressHook, type CognitiveTwinAnalysis, type EmotionForecast } from '../types';
import { getCognitiveTwinAnalysis, getEmotionForecast } from '../services/geminiService';
import { Smile, Loader2, AlertTriangle, Brain, UserCog, Clock, BarChart2, ShieldCheck } from 'lucide-react';
import StressLevelsChart from './dashboard/StressLevelsChart';
import TaskList from './dashboard/TaskList';
import { useLanguage } from '../contexts/LanguageContext';

interface DashboardProps {
    stressDataHook: StressDataHook;
    realtimeStressHook: RealtimeStressHook;
}

const CustomForecastTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const value = payload[0].value;
        const status = value > 70 ? 'High' : value > 40 ? 'Moderate' : 'Low';
        const color = value > 70 ? 'text-red-400' : value > 40 ? 'text-amber-400' : 'text-emerald-400';
        return (
            <div className="glass-card p-3 rounded-lg shadow-lg border border-border">
                <p className="text-sm font-bold text-foreground">{`Time: ${label}`}</p>
                <p className={`text-sm font-semibold ${color}`}>{`Predicted Stress: ${value}`}</p>
                <p className="text-xs text-muted-foreground">{`Status: ${status}`}</p>
            </div>
        );
    }
    return null;
};


// Sub-component for Cognitive Twin Analysis
const CognitiveTwin: React.FC<{ stressDataHook: StressDataHook }> = ({ stressDataHook }) => {
    const { stressLogs, sleepLogs, eventLogs } = stressDataHook;
    const [analysis, setAnalysis] = useState<CognitiveTwinAnalysis | null>(null);
    const [forecast, setForecast] = useState<EmotionForecast[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { t } = useLanguage();

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const [analysisRes, forecastRes] = await Promise.all([
                getCognitiveTwinAnalysis(stressLogs, sleepLogs, eventLogs),
                getEmotionForecast({ stressLogs, sleepLogs, eventLogs }),
            ]);
            setAnalysis(analysisRes);
            setForecast(forecastRes);
            setIsLoading(false);
        };
        fetchData();
    }, [stressLogs, sleepLogs, eventLogs]);
    
    if (isLoading) {
        return (
            <div className="glass-card p-6 rounded-2xl flex items-center justify-center min-h-[300px] xl:col-span-3">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <p className="ml-4 text-muted-foreground">{t('dashboard_twin_loading')}</p>
            </div>
        )
    }

    if (!analysis || !forecast) return null;
    
    return (
        <div className="xl:col-span-3 glass-card p-6 rounded-2xl">
            <h3 className="text-xl font-bold text-foreground mb-4 flex items-center"><Brain className="mr-2 text-primary"/> {t('dashboard_twin_title')}</h3>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <div>
                        <h4 className="font-semibold text-muted-foreground flex items-center gap-2"><UserCog size={18}/> {t('dashboard_twin_personality')}</h4>
                        <p className="text-sm mt-1 text-foreground">{analysis.personalitySummary}</p>
                    </div>
                     {analysis.anomaly && (
                        <div className="bg-amber-900/50 border border-amber-500/50 p-3 rounded-lg">
                            <h4 className="font-bold text-amber-400 flex items-center gap-2"><AlertTriangle size={18}/> {t('dashboard_twin_anomaly')}</h4>
                            <p className="text-sm mt-1 text-amber-300">{analysis.anomaly}</p>
                        </div>
                    )}
                    <div>
                        <h4 className="font-semibold text-muted-foreground">{t('dashboard_twin_traits')}</h4>
                        <ul className="space-y-2 text-sm mt-2">
                            {analysis.cognitiveTraits.slice(0,2).map(trait => (
                               <li key={trait.trait} className="flex items-start gap-3">
                                  <div className="p-1.5 bg-primary/20 rounded-full mt-1"><ShieldCheck size={16} className="text-primary"/></div>
                                  <div>
                                    <h5 className="font-semibold text-foreground">{trait.trait}</h5>
                                    <p className="text-xs text-muted-foreground">{trait.description}</p>
                                  </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                     <div>
                        <h4 className="font-semibold text-muted-foreground">{t('dashboard_twin_patterns')}</h4>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {analysis.emotionalPatterns.map(p => <span key={p.pattern} className="text-xs font-medium bg-secondary text-foreground px-2 py-1 rounded-full">{p.pattern}</span>)}
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-3">
                    <h4 className="font-semibold text-muted-foreground mb-2 flex items-center gap-2"><Clock size={18}/> {t('dashboard_twin_forecast')}</h4>
                     <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={forecast} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="time" tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} />
                            <YAxis domain={[0, 100]} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} />
                            <Tooltip content={<CustomForecastTooltip />}/>
                            <ReferenceArea y1={70} y2={100} fill="var(--destructive)" fillOpacity={0.1} strokeDasharray="5 5"/>
                            <ReferenceArea y1={40} y2={70} fill="#F59E0B" fillOpacity={0.1} strokeDasharray="5 5"/>
                            <Area type="monotone" dataKey="stress" name="Predicted Stress" stroke="var(--primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorStress)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};


const Dashboard: React.FC<DashboardProps> = ({ stressDataHook, realtimeStressHook }) => {
    const { emotionJournal } = stressDataHook;
    const { t } = useLanguage();

    const emotionFrequency = emotionJournal.reduce((acc, entry) => {
        acc[entry.primaryEmotion] = (acc[entry.primaryEmotion] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const emotionChartData = Object.keys(emotionFrequency).map(emotion => ({
        name: emotion,
        value: emotionFrequency[emotion]
    }));
    
    const EMOTION_COLORS: Record<string, string> = {
        Joy: '#34D399',
        Sadness: '#3B82F6',
        Anger: '#EF4444',
        Fear: '#8B5CF6',
        Surprise: '#F59E0B',
        Disgust: '#10B981',
    };


    return (
        <div className="space-y-6 animate-fadeIn">
            <h2 className="text-3xl font-bold">{t('dashboard_title')}</h2>
            
             <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <CognitiveTwin stressDataHook={stressDataHook} />
                
                <div className="xl:col-span-3">
                     <StressLevelsChart />
                </div>

                <div className="xl:col-span-1 glass-card p-6 rounded-2xl">
                    <h3 className="text-xl font-bold text-foreground mb-4 flex items-center"><Smile className="mr-2 text-amber-500"/>{t('dashboard_emotion_title')}</h3>
                    {emotionChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie 
                                    data={emotionChartData} 
                                    dataKey="value" 
                                    nameKey="name" 
                                    cx="50%" 
                                    cy="50%" 
                                    outerRadius={100} 
                                    isAnimationActive={false}
                                    labelLine={{ stroke: 'var(--muted-foreground)' }}
                                    label={({ name, percent }) => `${name} ${(Number(percent) * 100).toFixed(0)}%`}>
                                    {emotionChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={EMOTION_COLORS[entry.name] || '#8884d8'} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{backgroundColor: 'var(--card)', border: '1px solid var(--border)'}}/>
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-72 flex items-center justify-center text-muted-foreground">
                             <BarChart2 className="w-8 h-8 mr-2"/>
                            <p>{t('dashboard_emotion_empty')}</p>
                        </div>
                    )}
                </div>
                 <div className="xl:col-span-2">
                    <TaskList />
                 </div>
            </div>
        </div>
    );
};

export default Dashboard;