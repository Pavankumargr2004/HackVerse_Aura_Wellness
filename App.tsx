import React, { useState, useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import Dashboard from './components/Dashboard';
import Interventions from './components/Interventions';
import Gamification from './components/Gamification';
import Tools from './components/Tools';
import RealtimeStress from './components/RealtimeStress';
import AuthPage from './components/AuthPage';
import AIAgent from './components/AIAgent';
import PeerSupport from './components/PeerSupport';
import Settings from './components/Settings';
import AdminDashboard from './components/AdminDashboard';
import Feedback from './components/Feedback';
import CalendarView from './components/CalendarView';
import LanguageSelector from './components/LanguageSelector';
import Home from './components/Home';
import BurnoutPredictorPage from './components/BurnoutPredictorPage';
import Footer from './components/Footer';
import { useLanguage } from './contexts/LanguageContext';
import { useStressData } from './hooks/useStressData';
import { useChatHistory } from './hooks/useChatHistory';
import { useChatSettings } from './hooks/useChatSettings';
import { useRealtimeStress } from './hooks/useRealtimeStress';
import { useReminders } from './hooks/useReminders';
import { LayoutDashboard, MessageSquare, HeartPulse, Trophy, Shield, Waves, BrainCircuit, Sparkles, FlaskConical, Users, SlidersHorizontal, Briefcase, Star, LogOut, CalendarDays, Home as HomeIcon, AlertTriangle } from 'lucide-react';
import { type View } from './types';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('home');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isHighStress, setIsHighStress] = useState(false);

  const { t } = useLanguage();
  const stressDataHook = useStressData();
  const chatHistoryHook = useChatHistory();
  const chatSettingsHook = useChatSettings();
  const realtimeStressHook = useRealtimeStress();
  const remindersHook = useReminders();

  const viewTitles: Record<View, string> = {
    home: 'view_home',
    dashboard: 'view_dashboard',
    live: 'view_live',
    agent: 'view_agent',
    peerSupport: 'view_peerSupport',
    gamification: 'view_gamification',
    calendar: 'view_calendar',
    chat: 'view_chat',
    interventions: 'view_interventions',
    tools: 'view_tools',
    settings: 'view_settings',
    privacy: 'view_privacy',
    admin: 'view_admin',
    feedback: 'view_feedback',
    burnout: 'view_burnout',
  };

  useEffect(() => {
    const token = localStorage.getItem('auraAuthToken');
    if (token) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  // Emotion-Driven UI Effect
  useEffect(() => {
    const { emotionJournal } = stressDataHook;
    if (emotionJournal.length > 0) {
      const latestEntry = emotionJournal.slice().sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
      if (latestEntry.intensity >= 6) {
        document.documentElement.setAttribute('data-mood', latestEntry.primaryEmotion);
      } else {
        document.documentElement.removeAttribute('data-mood');
      }
    } else {
      document.documentElement.removeAttribute('data-mood');
    }
  }, [stressDataHook.emotionJournal]);


  const handleLogin = () => {
    localStorage.setItem('auraAuthToken', 'dummy-auth-token');
    setIsAuthenticated(true);
  };
  
  const handleLogout = () => {
    localStorage.removeItem('auraAuthToken');
    setIsAuthenticated(false);
    setActiveView('home');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <HeartPulse className="h-12 w-12 text-primary animate-pulse" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage onLoginSuccess={handleLogin} />;
  }

  const renderView = () => {
    switch (activeView) {
      case 'home':
        return <Home setActiveView={setActiveView} />;
      case 'chat':
        return <ChatInterface stressDataHook={stressDataHook} chatHistoryHook={chatHistoryHook} chatSettingsHook={chatSettingsHook} />;
      case 'dashboard':
        return <Dashboard stressDataHook={stressDataHook} realtimeStressHook={realtimeStressHook} />;
      case 'interventions':
        return <Interventions />;
      case 'live':
        return <RealtimeStress realtimeStressHook={realtimeStressHook} setHighStress={setIsHighStress}/>;
      case 'agent':
        return <AIAgent />;
      case 'peerSupport':
        return <PeerSupport />;
      case 'gamification':
        return <Gamification stressDataHook={stressDataHook} />;
      case 'calendar':
        return <CalendarView stressDataHook={stressDataHook} />;
      case 'tools':
        return <Tools stressDataHook={stressDataHook} />;
      case 'settings':
        return <Settings stressDataHook={stressDataHook} chatHistoryHook={chatHistoryHook} chatSettingsHook={chatSettingsHook} remindersHook={remindersHook} setActiveView={setActiveView} />;
      case 'admin':
        return <AdminDashboard />;
      case 'privacy':
        return <PrivacyView />;
      case 'feedback':
        return <Feedback />;
      case 'burnout':
        return <BurnoutPredictorPage />;
      default:
        return <Home setActiveView={setActiveView} />;
    }
  };

  const NavItem = ({ view, icon: Icon, label, mobileLabel }: { view: View; icon: React.ElementType; label: string; mobileLabel?: string }) => (
    <button
      onClick={() => setActiveView(view)}
      className={`group flex flex-col sm:flex-row items-center justify-center sm:justify-start w-full sm:w-auto text-sm sm:text-base px-3 py-2 rounded-lg transition-all duration-200 sm:hover:scale-105 sm:origin-left ${
        activeView === view
          ? 'bg-primary text-primary-foreground shadow-lg sm:scale-105'
          : 'text-muted-foreground hover:bg-primary/20 hover:text-primary'
      }`}
      aria-current={activeView === view ? 'page' : undefined}
    >
      <Icon className={`h-6 w-6 sm:h-5 sm:w-5 mb-1 sm:mb-0 sm:mr-3 transition-colors duration-200 ${activeView === view ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-primary'}`} />
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden text-xs">{mobileLabel || label}</span>
    </button>
  );

  return (
    <div className={`flex flex-col sm:flex-row h-screen bg-background font-sans text-foreground transition-all duration-1000 ${isHighStress ? 'biofeedback-glow' : ''}`}>
      {/* Sidebar Navigation for Desktop */}
      <aside className="hidden sm:flex flex-col w-64 bg-card p-4 border-r border-border">
        <div className="flex items-center mb-10">
          <HeartPulse className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-bold ml-2">AURA WELLNESS</h1>
        </div>
        <nav className="flex flex-col space-y-2 flex-1">
          {/* Reordered Navigation */}
          <NavItem view="home" icon={HomeIcon} label={t('nav_home')} />
          <NavItem view="dashboard" icon={LayoutDashboard} label={t('nav_dashboard')} />
          <NavItem view="chat" icon={MessageSquare} label={t('nav_chat')} />
          <NavItem view="burnout" icon={AlertTriangle} label={t('nav_burnout')} />
          
          <div className="pt-2"></div>
          
          <NavItem view="live" icon={Waves} label={t('nav_live')} />
          <NavItem view="interventions" icon={Sparkles} label={t('nav_interventions')} />
          <NavItem view="tools" icon={BrainCircuit} label={t('nav_tools')} />
          <NavItem view="gamification" icon={Trophy} label={t('nav_gamification')} />

          <div className="pt-2"></div>

          <NavItem view="calendar" icon={CalendarDays} label={t('nav_calendar')} />
          <NavItem view="peerSupport" icon={Users} label={t('nav_peerSupport')}/>
          <NavItem view="agent" icon={FlaskConical} label={t('nav_agent')} />
          
          <div className="pt-2"></div>
          
          <NavItem view="settings" icon={SlidersHorizontal} label={t('nav_settings')} />
          <NavItem view="privacy" icon={Shield} label={t('nav_privacy')} />
          <NavItem view="feedback" icon={Star} label={t('nav_feedback')} />
        </nav>

        {/* Admin and User Controls */}
        <div className="flex flex-col space-y-2 pt-4 border-t border-border">
            <NavItem view="admin" icon={Briefcase} label={t('adminView')} />
            <button
                onClick={handleLogout}
                className="group flex items-center w-full px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-primary transition-colors"
                aria-label={t('logout')}
            >
                <LogOut className="h-5 w-5 mr-3 text-muted-foreground group-hover:text-primary transition-colors" />
                <span>{t('logout')}</span>
            </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between p-4 bg-card border-b border-border shrink-0">
            <h2 className="text-xl sm:text-2xl font-bold">{t(viewTitles[activeView])}</h2>
            <LanguageSelector />
        </header>
        
        <main className="flex-1 overflow-y-auto p-2 sm:p-6 pb-20 sm:pb-6">
          {renderView()}
          <Footer setActiveView={setActiveView} />
        </main>
      </div>

      {/* Bottom navigation for mobile */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border p-1 grid grid-cols-5 z-10">
        <NavItem view="home" icon={HomeIcon} label={t('mobile_nav_home')} />
        <NavItem view="dashboard" icon={LayoutDashboard} label={t('mobile_nav_dashboard')} />
        <NavItem view="chat" icon={MessageSquare} label={t('mobile_nav_chat')} />
        <NavItem view="burnout" icon={AlertTriangle} label={t('mobile_nav_burnout')} />
        <NavItem view="settings" icon={SlidersHorizontal} label={t('mobile_nav_settings')} />
      </nav>
      {/* This div is a placeholder for the mobile nav bar, but it's outside the scrolling content */}
    </div>
  );
};

const PrivacyView: React.FC = () => {
    const { t } = useLanguage();
    return (
    <div className="glass-card h-full rounded-2xl p-6 max-w-4xl mx-auto animate-fadeIn">
        <h2 className="text-3xl font-bold mb-4 flex items-center">
            <Shield className="h-8 w-8 text-primary mr-3"/>
            {t('privacy_title')}
        </h2>
        <div className="space-y-6 text-muted-foreground">
            <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{t('privacy_commitment_title')}</h3>
                <p>{t('privacy_commitment_text')}</p>
            </div>
            <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{t('privacy_architecture_title')}</h3>
                <p>{t('privacy_architecture_text')}</p>
                <ul className="list-disc list-inside space-y-2 mt-2">
                    <li><span className="font-semibold text-primary">{t('privacy_on_device_title')}:</span> {t('privacy_on_device_text')}</li>
                    <li><span className="font-semibold text-primary">{t('privacy_anonymized_title')}:</span> {t('privacy_anonymized_text')}</li>
                    <li><span className="font-semibold text-primary">{t('privacy_control_title')}:</span> {t('privacy_control_text')}</li>
                </ul>
            </div>
            <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{t('privacy_demo_title')}</h3>
                <ul className="list-disc list-inside space-y-2">
                    <li><span className="font-semibold text-primary">{t('privacy_local_storage_title')}:</span> {t('privacy_local_storage_text')}</li>
                    <li><span className="font-semibold text-primary">{t('privacy_api_calls_title')}:</span> {t('privacy_api_calls_text')}</li>
                </ul>
            </div>
        </div>
    </div>
)};

export default App;
