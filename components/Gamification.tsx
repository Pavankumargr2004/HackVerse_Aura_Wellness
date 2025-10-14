import React, { useState, useEffect, useMemo } from 'react';
import { type StressDataHook } from '../types';
import { getIntervention } from '../services/geminiService';
import { Trophy, CheckCircle, Gift, Loader2, Sparkles, Shield, Footprints, Star, Medal, Wind, Lock, BrainCircuit } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const isToday = (someDate: string) => {
    const today = new Date();
    const dateToCompare = new Date(someDate);
    return dateToCompare.getDate() === today.getDate() &&
        dateToCompare.getMonth() === today.getMonth() &&
        dateToCompare.getFullYear() === today.getFullYear();
};

const StatCard = ({ icon: Icon, title, value, unit }: { icon: React.ElementType, title: string, value: string | number, unit?: string }) => (
    <div className="glass-card p-4 rounded-xl flex items-center gap-4">
        <div className="p-3 rounded-full bg-primary/20">
            <Icon className="h-6 w-6 text-primary" />
        </div>
        <div>
            <p className="text-sm font-semibold text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">
                {value} <span className="text-base font-medium text-muted-foreground">{unit}</span>
            </p>
        </div>
    </div>
);


const Gamification: React.FC<{ stressDataHook: StressDataHook }> = ({ stressDataHook }) => {
    const { wellnessActivities, addWellnessActivity, wellnessPoints, stepLogs, addStepLog } = stressDataHook;
    const [challenge, setChallenge] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [isCompleted, setIsCompleted] = useState(false);
    const [stepsToAdd, setStepsToAdd] = useState('');
    const { t } = useLanguage();

    const ALL_REWARDS = useMemo(() => [
        { points: 10, name: t('reward_1_name'), icon: <Footprints className="h-6 w-6"/> },
        { points: 50, name: t('reward_2_name'), icon: <Trophy className="h-6 w-6 text-yellow-500"/> },
        { points: 100, name: t('reward_3_name'), icon: <Sparkles className="h-6 w-6 text-sky-400"/> },
        { points: 150, name: t('reward_4_name'), icon: <Star className="h-6 w-6 text-yellow-300"/> },
        { points: 200, name: t('reward_5_name'), icon: <Shield className="h-6 w-6 text-emerald-500"/> },
        { points: 300, name: t('reward_6_name'), icon: <Trophy className="h-6 w-6 text-gray-300"/> },
        { points: 500, name: t('reward_7_name'), icon: <Medal className="h-6 w-6 text-blue-400"/> },
        { points: 750, name: t('reward_8_name'), icon: <Wind className="h-6 w-6 text-indigo-400"/> },
    ], [t]);

    const dailyStats = useMemo(() => {
        const todaysActivities = wellnessActivities.filter(activity => isToday(activity.timestamp));
        const todaysSteps = stepLogs
            .filter(log => isToday(log.timestamp))
            .reduce((total, log) => total + log.steps, 0);
        
        const challengesCompleted = todaysActivities.filter(activity => 
            activity.activity.startsWith('Completed Challenge')
        ).length;

        const mindfulMinutes = todaysActivities.reduce((total, activity) => {
            if (activity.activity.toLowerCase().includes('meditation')) {
                const match = activity.activity.match(/(\d+)-minute/);
                if (match && match[1]) {
                    return total + parseInt(match[1], 10);
                }
                return total + 5; // Default 5 mins for generic meditation activities
            }
            return total;
        }, 0);

        return { challengesCompleted, mindfulMinutes, dailySteps: todaysSteps };
    }, [wellnessActivities, stepLogs]);

    useEffect(() => {
        const fetchChallenge = async () => {
            const storedChallenge = localStorage.getItem('dailyChallenge');
            const storedDate = localStorage.getItem('challengeDate');
            const today = new Date().toLocaleDateString();

            if (storedChallenge && storedDate === today) {
                setChallenge(storedChallenge);
                const completed = localStorage.getItem('challengeCompleted');
                if(completed === 'true') setIsCompleted(true);
            } else {
                const newChallenge = await getIntervention('challenge');
                setChallenge(newChallenge);
                localStorage.setItem('dailyChallenge', newChallenge);
                localStorage.setItem('challengeDate', today);
                localStorage.setItem('challengeCompleted', 'false');
                setIsCompleted(false);
            }
            setIsLoading(false);
        };

        fetchChallenge();
    }, []);

    const handleCompleteChallenge = () => {
        if (isCompleted) return;
        addWellnessActivity(`Completed Challenge: ${challenge.substring(0, 50)}...`);
        setIsCompleted(true);
        localStorage.setItem('challengeCompleted', 'true');
    };

    const handleLogSteps = () => {
        const steps = parseInt(stepsToAdd, 10);
        if (!isNaN(steps) && steps > 0) {
            addStepLog(steps);
            addWellnessActivity(`Logged ${steps.toLocaleString()} steps`);
            setStepsToAdd('');
        }
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <h2 className="text-3xl font-bold">{t('gamification_title')}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-6 rounded-2xl">
                    <h3 className="font-semibold text-muted-foreground mb-2 flex items-center"><Trophy className="mr-2 text-amber-400" /> {t('gamification_points')}</h3>
                    <p className="text-5xl font-bold text-amber-400">{wellnessPoints}</p>
                </div>
                 <div className="glass-card p-6 rounded-2xl">
                    <h3 className="font-semibold text-muted-foreground mb-2 flex items-center"><CheckCircle className="mr-2 text-emerald-400" /> {t('gamification_activities')}</h3>
                    <p className="text-5xl font-bold text-emerald-400">{wellnessActivities.length}</p>
                </div>
            </div>

            <div className="glass-card p-6 rounded-2xl">
                <h3 className="text-xl font-bold text-foreground mb-4">{t('gamification_today')}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard icon={Footprints} title={t('gamification_steps_today')} value={dailyStats.dailySteps.toLocaleString()} />
                    <StatCard icon={BrainCircuit} title={t('gamification_mindful_minutes')} value={dailyStats.mindfulMinutes} unit={t('unit_min')} />
                    <StatCard icon={CheckCircle} title={t('gamification_challenges_done')} value={dailyStats.challengesCompleted} />
                </div>
                <div className="mt-4 pt-4 border-t border-border">
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2">{t('gamification_log_steps_label')}</h4>
                    <div className="flex items-center gap-2">
                        <input 
                            type="number"
                            value={stepsToAdd}
                            onChange={(e) => setStepsToAdd(e.target.value)}
                            placeholder={t('gamification_log_steps_placeholder')}
                            className="w-full py-2 px-3 text-sm bg-secondary rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary border border-border"
                        />
                        <button 
                            onClick={handleLogSteps}
                            disabled={!stepsToAdd || parseInt(stepsToAdd, 10) <= 0}
                            className="py-2 px-4 rounded-lg font-semibold text-white bg-primary hover:bg-violet-700 transition-colors disabled:bg-muted disabled:cursor-not-allowed"
                        >
                            {t('gamification_log_steps_button')}
                        </button>
                    </div>
                </div>
            </div>

            <div className="glass-card p-6 rounded-2xl">
                <h3 className="text-xl font-bold text-foreground mb-4">{t('gamification_challenge_title')}</h3>
                {isLoading ? (
                     <div className="flex items-center justify-center h-24">
                        <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    </div>
                ) : (
                    <div className="bg-primary/20 border-l-4 border-primary p-4 rounded-r-lg">
                        <p className="text-primary-foreground font-medium">"{challenge}"</p>
                    </div>
                )}
                <button
                    onClick={handleCompleteChallenge}
                    disabled={isCompleted}
                    className="mt-4 w-full py-2 px-4 rounded-lg font-semibold text-white transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-muted"
                >
                    {isCompleted ? <><CheckCircle /> {t('gamification_challenge_completed')}</> : t('gamification_challenge_button')}
                </button>
            </div>

            <div className="glass-card p-6 rounded-2xl">
                <h3 className="text-xl font-bold text-foreground mb-4 flex items-center"><Gift className="mr-2 text-red-500"/>{t('gamification_rewards_title')}</h3>
                <div className="space-y-3">
                   {ALL_REWARDS.map(reward => {
                        const isUnlocked = wellnessPoints >= reward.points;
                        return (
                            <div key={reward.name} className={`flex items-center p-3 rounded-lg transition-all duration-300 ${isUnlocked ? 'bg-secondary' : 'bg-secondary/40'}`}>
                                <div className={`flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full ${isUnlocked ? 'bg-primary/20' : 'bg-muted/20'}`}>
                                    {isUnlocked ? reward.icon : <Lock className="h-6 w-6 text-muted-foreground"/>}
                                </div>
                                <div className="ml-4">
                                    <p className={`font-semibold ${isUnlocked ? 'text-foreground' : 'text-muted-foreground'}`}>{reward.name}</p>
                                     {!isUnlocked && <p className="text-xs text-muted-foreground">{t('gamification_reward_unlocked_desc')}</p>}
                                </div>
                                <span className={`ml-auto text-xs font-bold ${isUnlocked ? 'text-amber-400' : 'text-muted-foreground'}`}>{reward.points} pts</span>
                            </div>
                        )
                   })}
                </div>
            </div>
        </div>
    );
};

export default Gamification;