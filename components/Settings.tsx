import React from 'react';
import { type StressDataHook, type ChatHistoryHook, type ChatSettingsHook, type RemindersHook, type View } from '../types';
import { SlidersHorizontal, Trash2, Bot, BellRing, Shield, Globe, Download, Star } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface SettingsProps {
    stressDataHook: StressDataHook;
    chatHistoryHook: ChatHistoryHook;
    chatSettingsHook: ChatSettingsHook;
    remindersHook: RemindersHook;
    setActiveView: (view: View) => void;
}

const Settings: React.FC<SettingsProps> = ({ stressDataHook, chatHistoryHook, chatSettingsHook, remindersHook, setActiveView }) => {
    const { clearHistory, messages: chatHistory } = chatHistoryHook;
    const { settings, setSettings } = chatSettingsHook;
    const { settings: reminderSettings, setSettings: setReminderSettings } = remindersHook;
    const { stressLogs, sleepLogs, eventLogs, wellnessActivities, emotionJournal, peers, peerChats } = stressDataHook;
    const [isCollectiveMindEnabled, setIsCollectiveMindEnabled] = useState(false);
    const { t } = useLanguage();
    
    const reminderOptions = {
        mindfulMoment: {
            label: t('settings_reminders_moment_label'),
            description: t('settings_reminders_moment_desc'),
            options: [
                { value: 1, label: t('settings_reminders_moment_opt1') },
                { value: 2, label: t('settings_reminders_moment_opt2') },
                { value: 3, label: t('settings_reminders_moment_opt3') },
                { value: 4, label: t('settings_reminders_moment_opt4') },
            ],
        },
        hydration: {
            label: t('settings_reminders_hydration_label'),
            description: t('settings_reminders_hydration_desc'),
            options: [
                { value: 1, label: t('settings_reminders_hydration_opt1') },
                { value: 2, label: t('settings_reminders_hydration_opt2') },
                { value: 3, label: t('settings_reminders_hydration_opt3') },
            ],
        },
        endOfShift: {
            label: t('settings_reminders_shift_label'),
            description: t('settings_reminders_shift_desc'),
            options: [
                { value: 6, label: t('settings_reminders_shift_opt1') },
                { value: 8, label: t('settings_reminders_shift_opt2') },
                { value: 10, label: t('settings_reminders_shift_opt3') },
                { value: 12, label: t('settings_reminders_shift_opt4') },
            ],
        },
    };

    const handleResetHistory = () => {
        if (window.confirm(t('settings_data_reset_confirm'))) {
            clearHistory();
            alert(t('settings_data_reset_alert'));
        }
    };

    const handleExportData = () => {
        const backupData = {
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            data: {
                stressLogs,
                sleepLogs,
                eventLogs,
                wellnessActivities,
                emotionJournal,
                peers,
                peerChats,
                chatHistory,
                chatSettings: settings,
                reminderSettings,
            }
        };

        const jsonString = JSON.stringify(backupData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const date = new Date().toISOString().split('T')[0];
        link.download = `neuromind_backup_${date}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleChatSettingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value as any }));
    };

    const handleReminderToggle = (key: keyof typeof reminderSettings) => {
        setReminderSettings(prev => ({
            ...prev,
            [key]: { ...prev[key], enabled: !prev[key].enabled }
        }));
    };

    const handleReminderIntervalChange = (key: keyof typeof reminderSettings, value: string) => {
        setReminderSettings(prev => ({
            ...prev,
            [key]: { ...prev[key], interval: Number(value) }
        }));
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
            <div className="flex items-center gap-4">
                <SlidersHorizontal className="h-10 w-10 text-primary" />
                <div>
                    <h2 className="text-3xl font-bold">{t('settings_title')}</h2>
                    <p className="text-muted-foreground">{t('settings_description')}</p>
                </div>
            </div>

            <div className="glass-card p-6 rounded-2xl">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-3"><Bot className="h-6 w-6 text-primary"/> {t('settings_chatbot_title')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label htmlFor="personality" className="font-semibold text-muted-foreground">{t('chat_persona')}</label>
                        <select
                            id="personality"
                            name="personality"
                            value={settings.personality}
                            onChange={handleChatSettingChange}
                            className="w-full py-2 px-3 bg-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary border border-border"
                        >
                            <option value="empathetic">{t('chat_persona_empathetic')}</option>
                            <option value="professional">{t('chat_persona_professional')}</option>
                            <option value="friendly">{t('chat_persona_friendly')}</option>
                            <option value="stoic">{t('chat_persona_stoic')}</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="tone" className="font-semibold text-muted-foreground">{t('chat_tone')}</label>
                        <select
                            id="tone"
                            name="tone"
                            value={settings.tone}
                            onChange={handleChatSettingChange}
                             className="w-full py-2 px-3 bg-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary border border-border"
                        >
                            <option value="casual">{t('chat_tone_casual')}</option>
                            <option value="formal">{t('chat_tone_formal')}</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="verbosity" className="font-semibold text-muted-foreground">{t('chat_verbosity')}</label>
                        <select
                            id="verbosity"
                            name="verbosity"
                            value={settings.verbosity}
                            onChange={handleChatSettingChange}
                             className="w-full py-2 px-3 bg-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary border border-border"
                        >
                            <option value="concise">{t('chat_verbosity_concise')}</option>
                            <option value="balanced">{t('chat_verbosity_balanced')}</option>
                            <option value="detailed">{t('chat_verbosity_detailed')}</option>
                        </select>
                    </div>
                </div>
                 <p className="text-sm text-muted-foreground mt-4">{t('settings_chatbot_desc')}</p>
            </div>

             <div className="glass-card p-6 rounded-2xl">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-3"><BellRing className="h-6 w-6 text-primary"/> {t('settings_reminders_title')}</h3>
                <p className="text-sm text-muted-foreground mb-6">{t('settings_reminders_desc')}</p>
                
                <div className="space-y-6">
                     <ReminderControl
                        label={reminderOptions.mindfulMoment.label}
                        description={reminderOptions.mindfulMoment.description}
                        options={reminderOptions.mindfulMoment.options}
                        enabled={reminderSettings.mindfulMoment.enabled}
                        interval={reminderSettings.mindfulMoment.interval}
                        onToggle={() => handleReminderToggle('mindfulMoment')}
                        onIntervalChange={(value) => handleReminderIntervalChange('mindfulMoment', value)}
                    />
                    <ReminderControl
                        label={reminderOptions.hydration.label}
                        description={reminderOptions.hydration.description}
                        options={reminderOptions.hydration.options}
                        enabled={reminderSettings.hydration.enabled}
                        interval={reminderSettings.hydration.interval}
                        onToggle={() => handleReminderToggle('hydration')}
                        onIntervalChange={(value) => handleReminderIntervalChange('hydration', value)}
                    />
                     <ReminderControl
                        label={reminderOptions.endOfShift.label}
                        description={reminderOptions.endOfShift.description}
                        options={reminderOptions.endOfShift.options}
                        enabled={reminderSettings.endOfShift.enabled}
                        interval={reminderSettings.endOfShift.interval}
                        onToggle={() => handleReminderToggle('endOfShift')}
                        onIntervalChange={(value) => handleReminderIntervalChange('endOfShift', value)}
                    />
                </div>
            </div>

            <div className="glass-card p-6 rounded-2xl">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-3"><Globe className="h-6 w-6 text-primary"/> {t('settings_collective_title')}</h3>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                    <div>
                        <p className="font-semibold text-foreground">{t('settings_collective_label')}</p>
                        <p className="text-sm text-muted-foreground max-w-2xl">{t('settings_collective_desc')}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer mt-4 sm:mt-0 sm:ml-6">
                        <input type="checkbox" checked={isCollectiveMindEnabled} onChange={() => setIsCollectiveMindEnabled(!isCollectiveMindEnabled)} className="sr-only toggle-switch-input" />
                        <div className="toggle-switch-track">
                            <div className="toggle-switch-knob"></div>
                        </div>
                    </label>
                </div>
            </div>

            <div className="glass-card p-6 rounded-2xl">
                <h3 className="text-xl font-bold mb-2">{t('settings_data_title')}</h3>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                    <div>
                        <p className="font-semibold">{t('settings_data_reset_label')}</p>
                        <p className="text-sm text-muted-foreground">{t('settings_data_reset_desc')}</p>
                    </div>
                    <button
                        onClick={handleResetHistory}
                        className="mt-4 sm:mt-0 flex items-center gap-2 py-2 px-4 rounded-lg font-semibold text-white bg-destructive hover:bg-red-700 transition-colors"
                    >
                        <Trash2 className="h-4 w-4" /> {t('settings_data_reset_button')}
                    </button>
                </div>
                <div className="border-t border-border my-4"></div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                    <div>
                        <p className="font-semibold">{t('settings_data_backup_label')}</p>
                        <p className="text-sm text-muted-foreground">{t('settings_data_backup_desc')}</p>
                    </div>
                    <button
                        onClick={handleExportData}
                        className="mt-4 sm:mt-0 flex items-center gap-2 py-2 px-4 rounded-lg font-semibold text-white bg-secondary hover:bg-muted transition-colors"
                    >
                        <Download className="h-4 w-4" /> {t('settings_data_backup_button')}
                    </button>
                </div>
            </div>

            <div className="glass-card p-6 rounded-2xl">
                <h3 className="text-xl font-bold mb-2 flex items-center gap-3"><Shield className="h-6 w-6 text-primary"/> {t('settings_privacy_title')}</h3>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                    <div>
                        <p className="font-semibold">{t('settings_privacy_label')}</p>
                        <p className="text-sm text-muted-foreground">{t('settings_privacy_desc')}</p>
                    </div>
                    <button
                        onClick={() => setActiveView('privacy')}
                        className="mt-4 sm:mt-0 flex items-center gap-2 py-2 px-4 rounded-lg font-semibold text-white bg-secondary hover:bg-muted transition-colors"
                    >
                        {t('settings_privacy_button')}
                    </button>
                </div>
            </div>
        </div>
    );
};

interface ReminderControlProps {
    label: string;
    description: string;
    options: { value: number; label: string }[];
    enabled: boolean;
    interval: number;
    onToggle: () => void;
    onIntervalChange: (value: string) => void;
}

const ReminderControl: React.FC<ReminderControlProps> = ({ label, description, options, enabled, interval, onToggle, onIntervalChange }) => (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <div>
            <p className="font-semibold text-foreground">{label}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center gap-4 mt-2 sm:mt-0">
            <select
                value={interval}
                onChange={(e) => onIntervalChange(e.target.value)}
                disabled={!enabled}
                className="w-full py-2 px-3 bg-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary border border-border disabled:opacity-50"
            >
                {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={enabled} onChange={onToggle} className="sr-only toggle-switch-input" />
                <div className="toggle-switch-track">
                    <div className="toggle-switch-knob"></div>
                </div>
            </label>
        </div>
    </div>
);

export default Settings;
