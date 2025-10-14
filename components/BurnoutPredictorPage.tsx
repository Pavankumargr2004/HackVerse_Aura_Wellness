import React, { useState } from 'react';
import { Clock, Heart, Users, Bed, BrainCircuit, Loader2, ArrowLeft, AlertTriangle, Lightbulb } from 'lucide-react';
import { getBurnoutPrediction } from '../services/geminiService';
import { type BurnoutPredictionResult } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';


interface SliderProps {
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  icon: React.ElementType;
}

const SliderInput: React.FC<SliderProps> = ({ label, unit, value, min, max, onChange, icon: Icon }) => (
    <div className="flex flex-col">
        <div className="flex justify-between items-center mb-3">
            <label className="text-lg font-medium text-muted-foreground flex items-center gap-3">
                <Icon className="h-6 w-6" />{label}
            </label>
            <span className="text-2xl font-semibold text-foreground">{value} {unit}</span>
        </div>
        <input
            type="range"
            min={min}
            max={max}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full h-4 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
        />
    </div>
);

const FACTOR_COLORS: { [key: string]: string } = {
    'High Workload': '#EF4444', // red-500
    'Patient Load': '#F97316', // orange-500
    'Physiological Strain': '#F59E0B', // amber-500
    'Poor Recovery': '#3B82F6', // blue-500
};

const BurnoutPredictorPage: React.FC = () => {
    const [view, setView] = useState<'form' | 'result'>('form');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<BurnoutPredictionResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        workHours: 8,
        patientsSeen: 15,
        heartRate: 80,
        sleepHours: 7,
    });
    const { t } = useLanguage();

    const handleInputChange = (field: keyof typeof formData, value: number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setResult(null);
        setError(null);

        const predictionResult = await getBurnoutPrediction(
            formData.workHours,
            formData.heartRate,
            formData.patientsSeen,
            formData.sleepHours
        );
        
        if (predictionResult.riskPercentage === -1) {
            setError(t('dashboard_predictor_error'));
        } else {
            // Ensure factors exist and have names before sorting
            if (predictionResult.factors && predictionResult.factors.every(f => f.name)) {
                 setResult(predictionResult);
                 setView('result');
            } else {
                // Handle case where factors are missing or malformed
                const fallbackResult = {
                    ...predictionResult,
                    factors: [
                        { name: 'High Workload', contribution: 25 },
                        { name: 'Patient Load', contribution: 25 },
                        { name: 'Physiological Strain', contribution: 25 },
                        { name: 'Poor Recovery', contribution: 25 },
                    ]
                };
                setResult(fallbackResult);
                setView('result');
            }
        }

        setIsLoading(false);
    };

    const handleReset = () => {
        setView('form');
        setResult(null);
        setError(null);
    }
    
    if (view === 'result' && result) {
        const riskColor = result.riskPercentage > 70 ? 'text-red-400' : result.riskPercentage > 35 ? 'text-amber-400' : 'text-emerald-400';
        
        const sortedFactors = [...result.factors].sort((a, b) => a.contribution - b.contribution);

        const CustomTooltip = ({ active, payload, label }: any) => {
            if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                    <div className="glass-card p-3 rounded-lg shadow-lg border border-border">
                        <p className="text-sm font-bold text-foreground">{data.name}</p>
                        <p className="text-sm" style={{ color: payload[0].fill }}>
                            Contribution: {data.contribution}%
                        </p>
                    </div>
                );
            }
            return null;
        };
        
        const topFactor = result.factors.reduce((max, factor) => factor.contribution > max.contribution ? factor : max, result.factors[0]);
        let recommendationText = '';
        switch (topFactor.name) {
            case 'High Workload':
                recommendationText = t('burnout_recommendation_workload');
                break;
            case 'Physiological Strain':
                recommendationText = t('burnout_recommendation_strain');
                break;
            case 'Patient Load':
                recommendationText = t('burnout_recommendation_load');
                break;
            case 'Poor Recovery':
                recommendationText = t('burnout_recommendation_recovery');
                break;
        }


        return (
            <div className="animate-fadeIn w-full max-w-7xl mx-auto space-y-8 p-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-2xl sm:text-3xl font-bold text-foreground">{t('dashboard_predictor_result_title')}</h3>
                    <button onClick={handleReset} className="flex items-center gap-2 text-md sm:text-lg font-semibold text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" /> {t('dashboard_predictor_result_back')}
                    </button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-3 glass-card p-8 sm:p-12 rounded-2xl flex flex-col">
                        <div className="text-center mb-8">
                            <p className={`text-8xl sm:text-[10rem] font-bold ${riskColor}`}>{result.riskPercentage}%</p>
                        </div>
                        <div>
                            <h4 className="font-bold text-xl sm:text-2xl text-foreground mb-4">{t('dashboard_predictor_result_factors')}</h4>
                             <div className="flex-1 min-h-[300px] mt-8">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={sortedFactors} layout="vertical" margin={{ top: 5, right: 40, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                        <XAxis type="number" domain={[0, 100]} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} />
                                        <YAxis type="category" dataKey="name" tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} width={150} interval={0} axisLine={false} tickLine={false} />
                                        <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(var(--primary-rgb), 0.1)'}}/>
                                        <Bar dataKey="contribution" barSize={35}>
                                            <LabelList dataKey="contribution" position="right" formatter={(value: number) => `${value}%`} style={{ fill: 'var(--foreground)', fontSize: 12 }} />
                                            {sortedFactors.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={FACTOR_COLORS[entry.name] || '#8884d8'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-2 glass-card p-8 sm:p-12 rounded-2xl flex flex-col justify-center bg-secondary/50">
                        <h4 className="font-bold text-xl sm:text-2xl text-foreground mb-4 flex items-center gap-3">
                           <Lightbulb className="h-8 w-8 text-primary"/>
                           {t('burnout_recommendation_title')}
                        </h4>
                        <p className="text-lg text-muted-foreground leading-relaxed">{recommendationText}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col items-center justify-center p-4 space-y-10 animate-fadeIn">
             <div className="text-center">
                <AlertTriangle className="h-20 w-20 text-primary mx-auto mb-4" />
                <h2 className="text-5xl sm:text-6xl font-bold">{t('dashboard_predictor_title')}</h2>
                <p className="text-xl text-muted-foreground mt-4 max-w-4xl">{t('dashboard_predictor_desc')}</p>
            </div>
            <div className="glass-card p-12 sm:p-16 rounded-2xl w-full max-w-6xl">
                {error && (
                     <div className="bg-red-900/50 border border-red-500/50 p-3 rounded-lg text-center mb-6">
                        <p className="text-sm text-red-300">{error}</p>
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
                        <SliderInput label={t('dashboard_predictor_form_work')} unit={t('dashboard_predictor_form_work_unit')} value={formData.workHours} min={4} max={18} onChange={(v) => handleInputChange('workHours', v)} icon={Clock} />
                        <SliderInput label={t('dashboard_predictor_form_hr')} unit={t('dashboard_predictor_form_hr_unit')} value={formData.heartRate} min={50} max={120} onChange={(v) => handleInputChange('heartRate', v)} icon={Heart} />
                        <SliderInput label={t('dashboard_predictor_form_patients')} unit={t('dashboard_predictor_form_patients_unit')} value={formData.patientsSeen} min={5} max={40} onChange={(v) => handleInputChange('patientsSeen', v)} icon={Users} />
                        <SliderInput label={t('dashboard_predictor_form_sleep')} unit={t('dashboard_predictor_form_sleep_unit')} value={formData.sleepHours} min={3} max={12} onChange={(v) => handleInputChange('sleepHours', v)} icon={Bed} />
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full mt-10 py-5 px-4 rounded-lg font-semibold text-xl text-white bg-primary hover:bg-violet-700 transition-colors disabled:bg-muted flex items-center justify-center gap-3">
                        {isLoading ? <><Loader2 className="animate-spin h-7 w-7" /> {t('dashboard_predictor_predicting')}</> : <><BrainCircuit className="h-7 w-7" /> {t('dashboard_predictor_button')}</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default BurnoutPredictorPage;