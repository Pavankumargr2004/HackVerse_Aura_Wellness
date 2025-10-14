import React from 'react';
import { HeartPulse, Twitter, Linkedin, Facebook, Mail, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { type View } from '../types';

interface FooterProps {
    setActiveView: (view: View) => void;
}

const Footer: React.FC<FooterProps> = ({ setActiveView }) => {
    const { t } = useLanguage();

    const QuickLink = ({ view, label }: { view: View; label: string }) => (
        <li>
            <button
                onClick={() => setActiveView(view)}
                className="text-muted-foreground hover:text-primary transition-colors"
            >
                {label}
            </button>
        </li>
    );

    return (
        <footer className="bg-card border-t border-border p-8 sm:p-12 text-sm mt-12">
            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Column 1: Brand */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <HeartPulse className="h-7 w-7 text-primary" />
                        <h3 className="text-lg font-bold text-foreground">AURA WELLNESS</h3>
                    </div>
                    <p className="text-muted-foreground">
                        {t('footer_tagline')}
                    </p>
                    <div className="flex items-center gap-4">
                        <a href="#" className="text-muted-foreground hover:text-primary"><Twitter /></a>
                        <a href="#" className="text-muted-foreground hover:text-primary"><Linkedin /></a>
                        <a href="#" className="text-muted-foreground hover:text-primary"><Facebook /></a>
                    </div>
                </div>

                {/* Empty column for spacing on larger screens */}
                <div className="hidden lg:block"></div>

                {/* Column 2: Quick Links */}
                <div className="space-y-4">
                    <h4 className="font-semibold text-foreground tracking-wider uppercase">{t('footer_quick_links')}</h4>
                    <ul className="space-y-2">
                        <QuickLink view="home" label={t('nav_home')} />
                        <QuickLink view="dashboard" label={t('nav_dashboard')} />
                        <QuickLink view="tools" label={t('nav_tools')} />
                        <QuickLink view="privacy" label={t('nav_privacy')} />
                        <QuickLink view="feedback" label={t('nav_feedback')} />
                    </ul>
                </div>

                {/* Column 3: Contact */}
                <div className="space-y-4">
                    <h4 className="font-semibold text-foreground tracking-wider uppercase">{t('footer_contact')}</h4>
                    <ul className="space-y-3 text-muted-foreground">
                        <li className="flex items-start gap-3">
                            <Mail className="h-5 w-5 mt-0.5 flex-shrink-0" />
                            <a href="mailto:pavankumargr1904@gmail.com" className="hover:text-primary">pavankumargr1904@gmail.com</a>
                        </li>
                        <li className="flex items-start gap-3">
                            <Phone className="h-5 w-5 mt-0.5 flex-shrink-0" />
                            <span>+1 (800) 555-AURA</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0" />
                            <span>123 ,Malleswarm, Bengaluru ,45678</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="mt-12 pt-8 border-t border-border text-center text-muted-foreground">
                <p>&copy; {new Date().getFullYear()} AURA WELLNESS. {t('footer_copyright')}</p>
            </div>
        </footer>
    );
};

export default Footer;
