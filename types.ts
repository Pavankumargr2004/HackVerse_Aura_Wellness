import { type useStressData } from './hooks/useStressData';
import { type useChatHistory } from './hooks/useChatHistory';
import { type useChatSettings } from './hooks/useChatSettings';
import { type useRealtimeStress } from './hooks/useRealtimeStress';
import { type useReminders } from './hooks/useReminders';

export interface StressLog {
  id: string;
  level: number;
  timestamp: string;
  notes?: string;
}

export interface SleepLog {
  id: string;
  hours: number;
  timestamp: string;
}

export interface StepLog {
  id: string;
  steps: number;
  timestamp: string;
}

export interface EventLog {
  id: string;
  description: string;
  timestamp: string;
}

export interface WellnessActivity {
  id:string;
  activity: string;
  points: number;
  timestamp: string;
}

export interface EmotionJournalEntry {
  id: string;
  timestamp: string;
  primaryEmotion: string;
  secondaryEmotion: string;
  intensity: number;
  notes?: string;
}

export interface ConversationSummary {
  title: string;
  keyTakeaways: string[];
  actionItems: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: string;
  isAnalysis?: boolean;
  isSummary?: boolean;
  summary?: ConversationSummary;
}

export interface ChatSettings {
    personality: 'empathetic' | 'professional' | 'friendly' | 'stoic';
    tone: 'formal' | 'casual';
    verbosity: 'concise' | 'balanced' | 'detailed';
}

export interface ReminderSettings {
    mindfulMoment: { enabled: boolean; interval: number };
    hydration: { enabled: boolean; interval: number };
    endOfShift: { enabled: boolean; interval: number };
}

export interface Peer {
  id: string;
  name: string;
  title: string;
  avatar: string; // A letter or emoji for simplicity
}

export interface PeerChatMessage {
  id: string;
  peerId: string;
  role: 'user' | 'peer';
  text: string;
  timestamp: string;
}

export interface TeamWellnessData {
  teamId: string;
  teamName: string;
  avgStress: number;
  burnoutRisk: number; // percentage
  engagementRate: number; // percentage
  topStressors: string[];
  stressTrend: { day: string; level: number }[];
}

export interface HighRiskStaff {
  employeeId: string;
  department: string;
  riskScore: number; // 0-100
}

export interface AdminDashboardData {
  overallStress: number;
  overallBurnoutRisk: number;
  overallEngagement: number;
  teams: TeamWellnessData[];
  highRiskStaff: HighRiskStaff[];
}

export interface AdminInsights {
  summary: string;
  recommendations: {
    teamId: string;
    teamName: string;
    riskLevel: 'High' | 'Medium' | 'Low';
    suggestion: string;
  }[];
}

export interface BurnoutPredictionResult {
    riskPercentage: number;
    factors: {
        name: string;
        contribution: number;
    }[];
}

export interface DetectedRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ImageAnalysisResult {
  analysis: string;
  detectedRegions: DetectedRegion[];
}

// FIX: Add ChessGame interface for the Mindful Chess mini-game.
export interface ChessGame {
  status: 'In Progress' | 'Check' | 'Checkmate' | 'Stalemate' | 'Draw';
  boardFEN: string;
  updatedBoardFEN: string;
  legalMoves: string[];
  turn: 'White' | 'Black';
  gameEndMessage: string | null;
  aiMove: string | null;
  moodBoostMessage: string;
  hint: string | null;
}

export interface CognitiveTwinAnalysis {
  personalitySummary: string;
  cognitiveTraits: { trait: string; description: string }[];
  emotionalPatterns: { pattern: string; explanation: string }[];
  anomaly: string | null;
}

export interface EmotionForecast {
  time: string;
  stress: number; // 0-100
}

export interface DreamAnalysis {
  summary: string;
  themes: { theme: string, relevance: string }[];
  interpretation: string;
}

export interface CalmSpaceImage {
    base64Image: string;
    prompt: string;
}

export type StoryCategory = 'Calm Tales' | 'Happy Laughs' | 'Kind Hearts' | 'Mini Adventures';
export type StoryMood = 'Calm' | 'Funny' | 'Motivating' | 'Wholesome';
export interface CalmTale {
    id: string;
    title: string;
    author: string;
    quote: string;
    content: string;
    coverColor1: string;
    coverColor2: string;
    moods: StoryMood[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'stress' | 'sleep' | 'activity' | 'event' | 'emotion' | 'steps';
  data: any;
}

export type StressDataHook = ReturnType<typeof useStressData>;
export type ChatHistoryHook = ReturnType<typeof useChatHistory>;
export type ChatSettingsHook = ReturnType<typeof useChatSettings>;
export type RealtimeStressHook = ReturnType<typeof useRealtimeStress>;
export type RemindersHook = ReturnType<typeof useReminders>;

export type View = 'home' | 'chat' | 'dashboard' | 'interventions' | 'gamification' | 'tools' | 'privacy' | 'live' | 'agent' | 'peerSupport' | 'settings' | 'admin' | 'feedback' | 'calendar' | 'burnout';