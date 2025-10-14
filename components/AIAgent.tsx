import React, { useState } from 'react';
import { FlaskConical, Loader2, BrainCircuit, Thermometer, Footprints, Info, AlertTriangle, Languages, TrendingUp } from 'lucide-react';
import { getStressPrediction, translateMedicalText } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';

type AgentView = 'translator' | 'prediction';

const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Mandarin', 'Hindi', 'Arabic', 
  'Portuguese', 'Russian', 'Japanese', 'Kannada', 'Tamil', 'Telugu'
];

// Main Component
const AIAgent: React.FC = () => {
    const [activeView, setActiveView] = useState<AgentView>('translator');
    const { t } = useLanguage();

    const TabButton = ({ view, label, icon: Icon }: { view: AgentView; label: string; icon: React.ElementType }) => (
        <button
            onClick={() => setActiveView(view)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeView === view
                    ? 'border-b-2 border-primary text-primary'
                    : 'border-b-2 border-transparent text-muted-foreground hover:text-foreground'
            }`}
        >
            <Icon className="h-5 w-5" />
            {label}
        </button>
    );

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
            <div className="flex border-b border-border">
                <TabButton view="translator" label={t('agent_tab_translator')} icon={Languages} />
                <TabButton view="prediction" label={t('agent_tab_prediction')} icon={FlaskConical} />
            </div>

            <div className="p-1">
                {activeView === 'translator' && <MedicalTranslator />}
                {activeView === 'prediction' && <StressPredictor />}
            </div>
        </div>
    );
};


// 1. Medical Translator Component
const MedicalTranslator = () => {
    const [sourceLang, setSourceLang] = useState('English');
    const [targetLang, setTargetLang] = useState('Spanish');
    const [inputText, setInputText] = useState('');
    const [translatedText, setTranslatedText] = useState('');
    const [simplify, setSimplify] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const { t } = useLanguage();

    const handleTranslate = async () => {
        if (!inputText.trim()) return;
        setIsLoading(true);
        setTranslatedText('');
        const result = await translateMedicalText(inputText, sourceLang, targetLang, simplify);
        setTranslatedText(result);
        setIsLoading(false);
    };

    return (
        <div className="glass-card p-6 rounded-2xl">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">{t('agent_translator_title')}</h2>
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground">{t('agent_translator_simplify')}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={simplify} onChange={() => setSimplify(!simplify)} className="sr-only toggle-switch-input" />
                        <div className="toggle-switch-track">
                            <div className="toggle-switch-knob"></div>
                        </div>
                    </label>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Healthcare Worker Side */}
                <div className="bg-secondary/50 p-4 rounded-xl space-y-3 flex flex-col">
                    <label className="font-semibold text-foreground">{t('agent_translator_hcw')}</label>
                    <select value={sourceLang} onChange={(e) => setSourceLang(e.target.value)} className="w-full py-2 px-3 bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary border border-border">
                        {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                    </select>
                    <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder={t('agent_translator_placeholder')}
                        className="w-full flex-1 p-3 text-sm bg-background rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary border border-transparent min-h-[150px]"
                    />
                    <button onClick={handleTranslate} disabled={isLoading} className="w-full py-2.5 px-4 rounded-lg font-semibold text-white bg-primary hover:bg-violet-700 transition-colors disabled:bg-muted flex items-center justify-center gap-2">
                        {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : t('agent_translator_button')}
                    </button>
                </div>
                {/* Patient Side */}
                <div className="bg-secondary/50 p-4 rounded-xl space-y-3 flex flex-col">
                    <label className="font-semibold text-foreground">{t('agent_translator_patient')}</label>
                    <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)} className="w-full py-2 px-3 bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary border border-border">
                        {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                    </select>
                    <textarea
                        value={translatedText}
                        readOnly
                        placeholder={t('agent_translator_placeholder')}
                        className="w-full flex-1 p-3 text-sm bg-background rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary border border-transparent min-h-[150px]"
                    />
                     <div className="w-full py-2.5 px-4 h-[42px]"></div> {/* Placeholder to align buttons */}
                </div>
            </div>
        </div>
    );
};


// Stress Predictor Component
interface PredictionResult {
    prediction: number; // 0: low, 1: medium, 2: high, -1: error
    explanation: string;
}

const StressPredictor: React.FC = () => {
    const [formData, setFormData] = useState({ humidity: '60', temperature: '75', stepCount: '5000' });
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<PredictionResult | null>(null);
    const { t } = useLanguage();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setResult(null);
        
        const predictionResult = await getStressPrediction(
            Number(formData.humidity),
            Number(formData.temperature),
            Number(formData.stepCount)
        );

        setResult(predictionResult);
        setIsLoading(false);
    };

    const ResultCard = ({ result }: { result: PredictionResult }) => {
        const { t } = useLanguage();
        if (result.prediction === -1) {
            return (
                <div className="bg-red-900/50 border border-red-500/50 p-6 rounded-2xl text-center animate-fadeIn">
                    <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">{t('agent_prediction_error_title')}</h3>
                    <p className="text-red-300">{result.explanation}</p>
                </div>
            )
        }

        const stressLevels = [
            { label: t('stress_level_low'), color: 'emerald', icon: <TrendingUp /> },
            { label: t('stress_level_medium'), color: 'amber', icon: <TrendingUp /> },
            { label: t('stress_level_high'), color: 'red', icon: <TrendingUp /> },
        ];
        const levelInfo = stressLevels[result.prediction];

        const colorClasses = {
            emerald: { bg: 'bg-emerald-900/50', border: 'border-emerald-500/50', text: 'text-emerald-400' },
            amber: { bg: 'bg-amber-900/50', border: 'border-amber-500/50', text: 'text-amber-400' },
            red: { bg: 'bg-red-900/50', border: 'border-red-500/50', text: 'text-red-400' },
        }
        
        const classes = colorClasses[levelInfo.color as keyof typeof colorClasses];

        return (
            <div className={`${classes.bg} border ${classes.border} p-6 rounded-2xl animate-fadeIn`}>
                <h3 className="text-lg font-semibold text-gray-300 mb-4">{t('agent_prediction_result_title')}</h3>
                <div className="text-center mb-4">
                    <p className={`text-5xl font-bold ${classes.text}`}>{levelInfo.label}</p>
                </div>
                <p className="text-gray-300 leading-relaxed">{result.explanation}</p>
            </div>
        )
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6 rounded-2xl">
                <h3 className="text-xl font-bold mb-4">{t('agent_prediction_form_title')}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Thermometer className="h-4 w-4" />{t('agent_prediction_humidity')}</label>
                        <input type="number" name="humidity" value={formData.humidity} onChange={handleInputChange} className="w-full mt-1 py-2 px-3 bg-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary border border-border" />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Thermometer className="h-4 w-4" />{t('agent_prediction_temperature')}</label>
                        <input type="number" name="temperature" value={formData.temperature} onChange={handleInputChange} className="w-full mt-1 py-2 px-3 bg-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary border border-border" />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Footprints className="h-4 w-4" />{t('agent_prediction_steps')}</label>
                        <input type="number" name="stepCount" value={formData.stepCount} onChange={handleInputChange} className="w-full mt-1 py-2 px-3 bg-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary border border-border" />
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-primary hover:bg-violet-700 transition-colors disabled:bg-muted flex items-center justify-center gap-2">
                        {isLoading ? <><Loader2 className="animate-spin h-5 w-5" /> {t('agent_prediction_predicting')}</> : <><BrainCircuit className="h-5 w-5" /> {t('agent_prediction_button')}</>}
                    </button>
                </form>
            </div>

            <div className="flex flex-col gap-6">
                {result && <ResultCard result={result} />}

                <div className="glass-card p-6 rounded-2xl">
                     <h3 className="text-lg font-semibold text-gray-300 mb-2 flex items-center gap-2"><Info className="h-5 w-5 text-primary" /> {t('agent_prediction_how_it_works')}</h3>
                     <p className="text-sm text-muted-foreground">{t('agent_prediction_how_it_works_desc')}</p>
                     <ul className="text-sm text-muted-foreground list-disc list-inside mt-2 space-y-1">
                        <li><span className="font-semibold text-foreground">{t('agent_prediction_factor1')}</span> {t('agent_prediction_factor1_desc')}</li>
                        <li><span className="font-semibold text-foreground">{t('agent_prediction_factor2')}</span> {t('agent_prediction_factor2_desc')}</li>
                     </ul>
                </div>
            </div>
        </div>
    );
};


export default AIAgent;