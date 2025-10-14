import React from 'react';
import { Waves } from 'lucide-react';

interface LiveStressIndicatorProps {
    status: 'calibrating' | 'monitoring';
    stressLevel: number;
}

const LiveStressIndicator: React.FC<LiveStressIndicatorProps> = ({ status, stressLevel }) => {
    const getRiskInfo = () => {
        if (stressLevel < 40) return { label: 'Low', color: 'text-emerald-400', stroke: 'stroke-emerald-500' };
        if (stressLevel < 70) return { label: 'Elevated', color: 'text-amber-400', stroke: 'stroke-amber-500' };
        return { label: 'High', color: 'text-red-500', stroke: 'stroke-red-500' };
    };

    const riskInfo = getRiskInfo();
    const circumference = 2 * Math.PI * 80;
    const strokeDashoffset = circumference - (stressLevel / 100) * circumference;

    return (
        <div className="lg:col-span-1 glass-card p-6 rounded-2xl flex flex-col items-center justify-center animate-fadeIn">
            <div className="flex items-center gap-2 self-start mb-4">
                <Waves className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-bold text-foreground">Live Stress</h3>
                <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
            </div>
            
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
                    {status === 'calibrating' ? (
                        <span className="text-lg font-semibold text-gray-400 animate-pulse">Calibrating...</span>
                    ) : (
                        <>
                            <span className={`text-5xl font-bold ${riskInfo.color}`}>{Math.round(stressLevel)}</span>
                            <span className={`text-lg font-semibold ${riskInfo.color}`}>{riskInfo.label}</span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LiveStressIndicator;