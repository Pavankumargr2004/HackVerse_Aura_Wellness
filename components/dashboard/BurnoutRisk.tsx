import React from 'react';
import { type StressLog, type SleepLog, type EventLog } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

interface BurnoutRiskProps {
    stressLogs: StressLog[];
    sleepLogs: SleepLog[];
    eventLogs: EventLog[];
}

const BurnoutRisk: React.FC<BurnoutRiskProps> = ({ stressLogs, sleepLogs, eventLogs }) => {
    const { t } = useLanguage();
    
    const calculateBurnoutScore = (): number => {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentStressLogs = stressLogs.filter(log => new Date(log.timestamp) > sevenDaysAgo);
        const recentSleepLogs = sleepLogs.filter(log => new Date(log.timestamp) > sevenDaysAgo);
        const recentEventLogs = eventLogs.filter(log => new Date(log.timestamp) > sevenDaysAgo);
        
        if (recentStressLogs.length === 0) return 0;

        // 1. Average Stress Component (50%)
        const avgStress = recentStressLogs.reduce((sum, log) => sum + log.level, 0) / recentStressLogs.length;
        const stressComponent = (avgStress / 10) * 50;
        
        // 2. Low Sleep Component (30%)
        const lowSleepDays = recentSleepLogs.filter(log => log.hours < 6).length;
        const sleepComponent = Math.min(30, (lowSleepDays / 7) * 30);

        // 3. Stressful Events Component (20%)
        const eventComponent = Math.min(20, recentEventLogs.length * 5);
        
        const totalScore = Math.round(stressComponent + sleepComponent + eventComponent);
        return Math.min(100, totalScore);
    };

    const score = calculateBurnoutScore();

    const getRiskInfo = () => {
        if (score < 30) return { label: t('burnout_risk_low'), color: 'text-emerald-400', stroke: 'stroke-emerald-500' };
        if (score < 60) return { label: t('burnout_risk_elevated'), color: 'text-amber-400', stroke: 'stroke-amber-500' };
        if (score < 80) return { label: t('burnout_risk_high'), color: 'text-orange-400', stroke: 'stroke-orange-500' };
        return { label: t('burnout_risk_severe'), color: 'text-red-500', stroke: 'stroke-red-500' };
    };

    const riskInfo = getRiskInfo();
    const circumference = 2 * Math.PI * 80;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
        <div className="relative w-48 h-48 sm:w-56 sm:h-56">
            <svg className="w-full h-full" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="80" strokeWidth="15" className="stroke-secondary" fill="none" />
                <circle
                    cx="100"
                    cy="100"
                    r="80"
                    strokeWidth="15"
                    className={`transform -rotate-90 origin-center transition-all duration-1000 ease-out ${riskInfo.stroke}`}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-5xl font-bold ${riskInfo.color}`}>{score}</span>
                <span className={`text-lg font-semibold ${riskInfo.color}`}>{riskInfo.label}</span>
            </div>
        </div>
    );
};

export default BurnoutRisk;