import React, { useState, useRef, useEffect } from 'react';
import { Camera, ScanLine, X, Loader2, RefreshCw } from 'lucide-react';
import { analyzeImageContent } from '../services/geminiService';
import { type ImageAnalysisResult, type DetectedRegion } from '../types';

type Status = 'idle' | 'permission_denied' | 'streaming' | 'captured' | 'analyzing' | 'complete' | 'error';

const ScanTranslate: React.FC = () => {
    const [status, setStatus] = useState<Status>('idle');
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [result, setResult] = useState<ImageAnalysisResult | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } 
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setStatus('streaming');
        } catch (err) {
            console.error("Camera access denied:", err);
            setStatus('permission_denied');
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };
    
    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, []);

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            if(context) {
                context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                const imageDataUrl = canvas.toDataURL('image/jpeg');
                setCapturedImage(imageDataUrl);
                setStatus('captured');
                stopCamera();
                handleAnalyze(imageDataUrl);
            }
        }
    };

    const handleAnalyze = async (imageDataUrl: string) => {
        setStatus('analyzing');
        const base64Data = imageDataUrl.split(',')[1];
        const analysisResult = await analyzeImageContent(base64Data);

        if (analysisResult.analysis.includes("Sorry, I couldn't")) {
             setStatus('error');
             setResult(analysisResult);
        } else {
             // Simulate analysis delay to show detected regions
            setResult({ analysis: '', detectedRegions: analysisResult.detectedRegions });
            setTimeout(() => {
                setResult(analysisResult);
                setStatus('complete');
            }, 1500);
        }
    };

    const handleReset = () => {
        setCapturedImage(null);
        setResult(null);
        setStatus('idle');
    };

    const renderContent = () => {
        switch(status) {
            case 'idle':
                return (
                    <div className="text-center">
                        <ScanLine className="h-16 w-16 text-primary mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-foreground">Scan & Analyze</h3>
                        <p className="text-muted-foreground mt-2 mb-6">Point your camera at a product label or document to get AI-powered insights.</p>
                        <button onClick={startCamera} className="flex items-center justify-center gap-2 w-full max-w-xs mx-auto py-3 px-4 rounded-lg font-semibold text-white bg-primary hover:bg-violet-700 transition-colors">
                           <Camera className="h-5 w-5"/> Start Camera
                        </button>
                    </div>
                );
            case 'permission_denied':
                 return (
                    <div className="text-center">
                        <Camera className="h-16 w-16 text-destructive mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-foreground">Camera Access Denied</h3>
                        <p className="text-muted-foreground mt-2 max-w-md mx-auto">Aura needs camera access to scan documents. You may have accidentally blocked permission. Please enable camera permissions for this site in your browser's settings.</p>
                         <button onClick={startCamera} className="mt-6 flex items-center justify-center gap-2 w-full max-w-xs mx-auto py-3 px-4 rounded-lg font-semibold text-white bg-primary hover:bg-violet-700 transition-colors">
                           <RefreshCw className="h-5 w-5"/> Try Again
                        </button>
                    </div>
                 );
            case 'streaming':
                return (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                        <div className="relative w-full aspect-video max-w-2xl rounded-lg overflow-hidden border-2 border-primary shadow-lg shadow-primary/20">
                            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
                             <canvas ref={canvasRef} className="hidden"></canvas>
                            <div className="absolute inset-4 border-2 border-white/50 rounded-md pointer-events-none"></div>
                        </div>
                         <button onClick={handleCapture} className="mt-6 p-4 rounded-full bg-primary text-primary-foreground focus:outline-none ring-4 ring-primary/50 hover:bg-violet-700 transition-all">
                            <Camera className="h-8 w-8"/>
                        </button>
                    </div>
                );
            case 'captured':
            case 'analyzing':
            case 'complete':
            case 'error':
                return (
                     <div className="w-full h-full flex flex-col items-center justify-center">
                        <div className="relative w-full aspect-video max-w-2xl rounded-lg overflow-hidden shadow-lg bg-black">
                           {capturedImage && <img src={capturedImage} alt="Captured" className="w-full h-full object-contain" />}
                           {status === 'analyzing' && result?.detectedRegions && (
                                <div className="absolute inset-0 transition-opacity duration-500 ease-in-out">
                                    {result.detectedRegions.map((region, index) => (
                                        <div key={index} 
                                             className="absolute border-2 border-primary/80 bg-primary/20 animate-pulse rounded-sm"
                                             style={{ 
                                                 left: `${region.x}%`, 
                                                 top: `${region.y}%`, 
                                                 width: `${region.width}%`, 
                                                 height: `${region.height}%`
                                             }}>
                                        </div>
                                    ))}
                                </div>
                           )}
                           {status === 'complete' && result && (
                               <div className="absolute inset-0 bg-black/70 p-4 flex items-center justify-center animate-fadeIn">
                                   <p className="text-white text-center font-medium">{result.analysis}</p>
                               </div>
                           )}
                           {status === 'analyzing' && (
                               <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white">
                                   <Loader2 className="h-12 w-12 animate-spin mb-4" />
                                   <p className="font-semibold">Analyzing...</p>
                               </div>
                           )}
                        </div>
                        <div className="mt-6 flex flex-col items-center gap-4 w-full max-w-2xl">
                          {(status === 'complete' || status === 'error') && (
                              <div className="w-full p-4 rounded-lg glass-card text-center transition-transform duration-300 ease-in-out hover:scale-[0.98]">
                                {status === 'error' && <p className="text-destructive">{result?.analysis || "Analysis failed. Please try again with a clearer image."}</p>}
                                {status === 'complete' && <p className="text-muted-foreground">Analysis complete.</p>}
                              </div>
                          )}
                          <button onClick={handleReset} className="flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-semibold text-white bg-secondary hover:bg-muted transition-colors">
                              <RefreshCw className="h-5 w-5"/> Scan Again
                          </button>
                        </div>
                    </div>
                );
        }
    };
    
    return (
        <div className="h-full rounded-2xl p-2 sm:p-4 flex flex-col items-center justify-center animate-fadeIn">
             {status !== 'streaming' && (
                <div className="flex items-center gap-4 self-start mb-4">
                    <ScanLine className="h-10 w-10 text-primary" />
                    <div>
                        <h2 className="text-3xl font-bold">Scan & Analyze</h2>
                    </div>
                </div>
            )}
            <div className="flex-1 w-full flex items-center justify-center">
                {renderContent()}
            </div>
        </div>
    );
};

export default ScanTranslate;