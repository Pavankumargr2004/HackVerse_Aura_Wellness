import React, { useRef, useState, useEffect } from 'react';
import { Waves, Mic, MicOff, RefreshCw, VideoOff } from 'lucide-react';
import { type RealtimeStressHook } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface RealtimeStressProps {
    realtimeStressHook: RealtimeStressHook;
    setHighStress: (isStressed: boolean) => void;
}

const RealtimeStress: React.FC<RealtimeStressProps> = ({ realtimeStressHook, setHighStress }) => {
    const { status, stressLevel, startMonitoring, stopMonitoring } = realtimeStressHook;
    const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const { t } = useLanguage();

    const getGaugeColor = () => {
        if (stressLevel < 40) return 'stroke-emerald-500'; // Low stress
        if (stressLevel < 70) return 'stroke-amber-500'; // Medium stress
        return 'stroke-red-500'; // High stress
    };
    
    const getStatusInfo = () => {
        const level = Math.round(stressLevel);
        if (level < 40) return { text: t('realtime_calm_result'), advice: t('realtime_calm_advice') };
        if (level < 70) return { text: t('realtime_moderate_result'), advice: t('realtime_moderate_advice') };
        return { text: t('realtime_high_result'), advice: t('realtime_high_advice') };
    };

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            setVideoStream(stream);
        } catch (err) {
            console.error("Video access denied:", err);
        }
    };

    const stopCamera = () => {
        if (videoStream) {
            videoStream.getTracks().forEach(track => track.stop());
            setVideoStream(null);
        }
    };

    useEffect(() => {
        if (videoRef.current && videoStream) {
            videoRef.current.srcObject = videoStream;
        }
    }, [videoStream]);
    
    useEffect(() => {
        if (status === 'analyzing') {
            startCamera();
        } else {
            stopCamera();
        }
        
        if (status === 'complete' && stressLevel >= 70) {
            setHighStress(true);
            const timer = setTimeout(() => setHighStress(false), 6000); // Glow for 6 seconds
            return () => clearTimeout(timer);
        }

    }, [status]);


    const strokeDashoffset = 502 - (502 * stressLevel) / 100;

    const renderContent = () => {
        switch (status) {
            case 'permission_denied':
                return (
                    <div className="text-center">
                        <MicOff className="h-16 w-16 text-red-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white">{t('realtime_denied_title')}</h3>
                        <p className="text-gray-400 mt-2">{t('realtime_denied_desc')}</p>
                    </div>
                );
            case 'idle':
                 return (
                    <div className="text-center">
                        <Waves className="h-16 w-16 text-primary mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white">{t('realtime_idle_title')}</h3>
                        <p className="text-gray-400 mt-2 mb-6 max-w-md mx-auto">{t('realtime_idle_desc')}</p>
                        <button onClick={startMonitoring} className="flex items-center justify-center gap-2 w-full max-w-xs mx-auto py-3 px-4 rounded-lg font-semibold text-white bg-primary hover:bg-violet-700 transition-colors">
                           <Mic className="h-5 w-5"/> {t('realtime_idle_button')}
                        </button>
                    </div>
                );
            case 'analyzing':
                return (
                     <div className="flex flex-col items-center text-center">
                        <div className="relative w-64 h-64">
                            <svg className="w-full h-full" viewBox="0 0 200 200">
                                <circle cx="100" cy="100" r="80" strokeWidth="20" className="stroke-gray-700" fill="none" />
                                <circle
                                    cx="100"
                                    cy="100"
                                    r="80"
                                    strokeWidth="20"
                                    className={`transform -rotate-90 origin-center transition-all duration-1000 ease-linear ${getGaugeColor()}`}
                                    fill="none"
                                    strokeDasharray="502.65"
                                    strokeDashoffset={strokeDashoffset}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-lg font-semibold text-gray-400 animate-pulse">{t('realtime_analyzing')}</span>
                                <span className="text-5xl font-bold text-white mt-2">{Math.round(stressLevel)}</span>
                            </div>
                        </div>
                        <div className="mt-6 w-full max-w-md h-32 flex items-center justify-center">
                             {videoStream ? (
                                <div className="w-48 h-28 rounded-lg overflow-hidden border-2 border-primary/50">
                                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]"></video>
                                </div>
                            ) : (
                                <div className="text-muted-foreground flex items-center gap-2">
                                    <VideoOff className="h-5 w-5" /> {t('realtime_no_camera')}
                                </div>
                            )}
                        </div>
                        <button onClick={stopMonitoring} className="mt-6 flex items-center justify-center gap-2 py-2 px-6 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors">
                           <MicOff className="h-5 w-5"/> {t('realtime_cancel')}
                        </button>
                    </div>
                );
            case 'complete':
                const info = getStatusInfo();
                 return (
                    <div className="flex flex-col items-center text-center">
                        <div className="relative w-64 h-64">
                            <svg className="w-full h-full" viewBox="0 0 200 200">
                                <circle cx="100" cy="100" r="80" strokeWidth="20" className="stroke-gray-700" fill="none" />
                                <circle
                                    cx="100"
                                    cy="100"
                                    r="80"
                                    strokeWidth="20"
                                    className={`transform -rotate-90 origin-center ${getGaugeColor()}`}
                                    fill="none"
                                    strokeDasharray="502.65"
                                    strokeDashoffset={strokeDashoffset}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-6xl font-bold text-white">{Math.round(stressLevel)}</span>
                                <span className="text-sm font-semibold text-gray-400">{t('realtime_stress_level')}</span>
                            </div>
                        </div>
                        <div className="mt-6 w-full max-w-md">
                            <h3 className="text-xl font-bold text-white">{info.text}</h3>
                            <p className="text-gray-400 mt-2">{info.advice}</p>
                        </div>
                        <button onClick={startMonitoring} className="mt-6 flex items-center justify-center gap-2 py-2 px-6 rounded-lg font-semibold text-white bg-primary hover:bg-violet-700 transition-colors">
                           <RefreshCw className="h-5 w-5"/> {t('realtime_analyze_again')}
                        </button>
                    </div>
                );
        }
    }
    
    return (
        <div className="glass-card h-full rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center animate-fadeIn">
            <h2 className="text-3xl font-bold text-white mb-4 self-start">{t('realtime_title')}</h2>
            <div className="flex-1 flex w-full items-center justify-center">
                {renderContent()}
            </div>
        </div>
    );
};

export default RealtimeStress;
