import React from 'react';
import { type View } from '../types';
import { ArrowRight, BrainCircuit, MessageSquare, BarChart2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface HomeProps {
    setActiveView: (view: View) => void;
}

const FeatureCard = ({ icon: Icon, title, description, onClick }: { icon: React.ElementType, title: string, description: string, onClick: () => void }) => (
    <button onClick={onClick} className="glass-card p-6 rounded-2xl text-left w-full h-full flex flex-col transition-all duration-300 ease-in-out hover:scale-[1.03] hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary group">
        <div className="mb-4 rounded-full p-3 w-max bg-primary/20">
            <Icon className="h-6 w-6 text-primary"/>
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground flex-1">{description}</p>
        <div className="mt-4 text-sm font-semibold text-primary flex items-center">
            Explore <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
        </div>
    </button>
);


const Home: React.FC<HomeProps> = ({ setActiveView }) => {
    const { t } = useLanguage();

    return (
        <div className="h-full flex flex-col items-center justify-center p-4 sm:p-6 text-center animate-fadeIn space-y-8">
            <div className="max-w-4xl">
                <h1 className="text-4xl sm:text-6xl font-extrabold text-foreground tracking-tight">
                    Welcome to <span className="text-primary">AURA WELLNESS</span>
                </h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                    A next-gen AI system that understands, predicts, and optimizes mental health. It continuously learns from your neuro-behavioral patterns, predicts emotional fluctuations, and offers real-time, personalized interventions.
                </p>
                <button 
                    onClick={() => setActiveView('dashboard')}
                    className="mt-8 inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-primary-foreground bg-primary rounded-full shadow-lg hover:scale-105 hover:shadow-primary/50 transition-all duration-300 ease-in-out"
                >
                    Explore Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                </button>
            </div>

            <div className="max-w-5xl w-full pt-8 border-t border-border">
                <h2 className="text-2xl font-bold mb-6">Key Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <FeatureCard 
                        icon={BarChart2}
                        title={t('nav_dashboard')}
                        description="Visualize your wellness trends, track stress levels, and gain insights into your cognitive patterns."
                        onClick={() => setActiveView('dashboard')}
                     />
                     <FeatureCard 
                        icon={MessageSquare}
                        title={t('nav_chat')}
                        description="Engage in supportive conversations with your AI companion, log feelings, and get guidance."
                        onClick={() => setActiveView('chat')}
                     />
                     <FeatureCard 
                        icon={BrainCircuit}
                        title={t('nav_tools')}
                        description="Access a suite of cognitive tools, from reframing exercises to focus-building mini-games."
                        onClick={() => setActiveView('tools')}
                     />
                </div>
            </div>
        </div>
    );
};

export default Home;