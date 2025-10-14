import React, { useState, useEffect, useRef } from 'react';
import { LogOut, Edit, X } from 'lucide-react';

interface UserProfilePanelProps {
  user: {
    name: string;
    age: number;
    gender: string;
    occupation: string;
    email: string;
    avatar: string; // Initials for the avatar
  };
  wellnessPoints: number;
  handleLogout: () => void;
}

const UserProfilePanel: React.FC<UserProfilePanelProps> = ({ user, wellnessPoints, handleLogout }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    // Close panel on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                setIsExpanded(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [panelRef]);

    // Wellness score calculation
    const maxPoints = 500;
    const wellnessScore = Math.min(100, Math.round((wellnessPoints / maxPoints) * 100));

    // Progress ring calculation
    const radius = 28;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (wellnessScore / 100) * circumference;

    const scoreColor = wellnessScore > 75 ? 'text-emerald-400' : wellnessScore > 40 ? 'text-amber-400' : 'text-red-400';
    const ringColor = wellnessScore > 75 ? 'stroke-emerald-500' : wellnessScore > 40 ? 'stroke-amber-500' : 'stroke-red-500';

    return (
        <div ref={panelRef} className="hidden sm:block fixed bottom-4 right-4 z-50">
            {!isExpanded ? (
                <button
                    onClick={() => setIsExpanded(true)}
                    className="h-14 w-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg hover:scale-110 hover:shadow-primary/50 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-primary/50"
                    aria-label="Open user profile"
                >
                    {user.avatar}
                </button>
            ) : (
                <div className="w-80 max-w-[calc(100vw-2rem)] glass-card rounded-2xl shadow-2xl animate-fadeIn">
                    <div className="p-4">
                        <div className="flex items-start justify-between mb-4">
                             <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                                    {user.avatar}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-foreground">{user.name}</h3>
                                    <p className="text-sm text-muted-foreground">{user.occupation}</p>
                                </div>
                            </div>
                             <button onClick={() => setIsExpanded(false)} className="p-2 -mt-1 -mr-1 rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors" aria-label="Close profile panel">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        
                        <div className="flex items-center justify-between gap-4">
                            <div className="space-y-2 text-sm flex-1">
                                <div className="flex items-center group justify-between">
                                    <p className="text-muted-foreground">Age: <span className="font-semibold text-foreground">{user.age}</span></p>
                                    <button className="ml-2 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Edit Age">
                                        <Edit className="h-3 w-3" />
                                    </button>
                                </div>
                                <div className="flex items-center group justify-between">
                                    <p className="text-muted-foreground">Gender: <span className="font-semibold text-foreground">{user.gender}</span></p>
                                    <button className="ml-2 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Edit Gender">
                                        <Edit className="h-3 w-3" />
                                    </button>
                                </div>
                                <div className="flex items-center group justify-between">
                                    <p className="text-muted-foreground">Email: <span className="font-semibold text-foreground">{user.email}</span></p>
                                    <button className="ml-2 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Edit Email">
                                        <Edit className="h-3 w-3" />
                                    </button>
                                </div>
                            </div>
                            <div className="relative w-20 h-20 flex-shrink-0">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 70 70">
                                    <circle className="stroke-secondary" strokeWidth="6" fill="transparent" r={radius} cx="35" cy="35" />
                                    <circle
                                        className={`transition-all duration-1000 ease-out ${ringColor}`}
                                        strokeWidth="6"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={offset}
                                        strokeLinecap="round"
                                        fill="transparent"
                                        r={radius}
                                        cx="35"
                                        cy="35"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className={`text-xl font-bold ${scoreColor}`}>{wellnessScore}</span>
                                    <span className="text-[10px] text-muted-foreground -mt-1">Score</span>
                                </div>
                            </div>
                        </div>

                         <div className="border-t border-border my-3"></div>

                         <div className="space-y-2">
                            <button onClick={handleLogout} className="flex items-center w-full px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors" aria-label="Logout">
                                <LogOut className="h-5 w-5 mr-3" />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserProfilePanel;