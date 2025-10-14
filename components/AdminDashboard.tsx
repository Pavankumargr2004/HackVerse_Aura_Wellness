import React from 'react';
import { useAdminData } from '../hooks/useAdminData';
import { Briefcase, TrendingUp, Activity, Loader2, AlertTriangle, BarChart2 } from 'lucide-react';
import { BarChart, Bar, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';

const TEAM_COLORS: { [key: string]: string } = {
    'ER': '#EF4444', // red-500
    'ICU': '#8B5CF6', // violet-500
    'Pediatrics': '#3B82F6', // blue-500
    'Cardiology': '#10B981', // emerald-500
    'Surgery': '#F59E0B', // amber-500
};

const KPICard = ({ title, value, icon: Icon, color = 'text-primary' }: { title: string; value: string; icon: React.ElementType; color?: string }) => (
    <div className="glass-card p-6 rounded-2xl flex items-center gap-4 transition-transform duration-300 ease-in-out hover:scale-[1.02]">
        <div className={`p-3 rounded-lg bg-primary/20 ${color}`}>
            <Icon className="h-8 w-8" />
        </div>
        <div>
            <p className="text-muted-foreground font-semibold">{title}</p>
            <p className="text-3xl font-bold text-foreground">{value}</p>
        </div>
    </div>
);

const getRiskColorClasses = (score: number) => {
    if (score >= 85) return { text: 'text-red-400', bg: 'bg-red-500' };
    if (score >= 45) return { text: 'text-amber-400', bg: 'bg-amber-500' };
    return { text: 'text-emerald-400', bg: 'bg-emerald-500' };
};


const AdminDashboard: React.FC = () => {
    const adminData = useAdminData();
    const { t } = useLanguage();
    
    if (!adminData) {
        return (
             <div className="flex items-center justify-center h-full">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
            </div>
        )
    }

    const { overallStress, overallBurnoutRisk, overallEngagement, teams, highRiskStaff } = adminData;

    // Prepare data for the multi-line chart
    const lineChartData = teams[0]?.stressTrend.map((_, index) => {
        const entry: { day: string; [key: string]: number | string } = {
            day: `Day ${index + 1}`
        };
        teams.forEach(team => {
            entry[team.teamName] = team.stressTrend[index].level;
        });
        return entry;
    });
    
    // Prepare data for the burnout bar chart, sorting it for better visualization
    const burnoutChartData = [...teams].sort((a, b) => a.burnoutRisk - b.burnoutRisk);

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center gap-4">
                <Briefcase className="h-10 w-10 text-primary" />
                <div>
                    <h2 className="text-3xl font-bold">{t('admin_title')}</h2>
                    <p className="text-muted-foreground">{t('admin_description')}</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KPICard title={t('admin_kpi_stress')} value={`${overallStress.toFixed(1)}/10`} icon={TrendingUp} />
                <KPICard title={t('admin_kpi_burnout')} value={`${overallBurnoutRisk.toFixed(0)}%`} icon={AlertTriangle} color="text-amber-400"/>
                <KPICard title={t('admin_kpi_engagement')} value={`${overallEngagement.toFixed(0)}%`} icon={Activity} color="text-emerald-400"/>
            </div>

            {/* Team Stress Trends Chart */}
            <div className="glass-card p-6 rounded-2xl">
                <h3 className="text-xl font-bold text-foreground mb-4">{t('admin_chart_stress_trends')}</h3>
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={lineChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="day" tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} />
                        <YAxis domain={[0, 10]} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} />
                        <Tooltip contentStyle={{backgroundColor: 'var(--card)', border: '1px solid var(--border)'}}/>
                        <Legend />
                        {teams.map(team => (
                            <Line key={team.teamId} type="monotone" dataKey={team.teamName} stroke={TEAM_COLORS[team.teamName] || '#8884d8'} strokeWidth={2} dot={false} />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
            
            {/* New Layout: Burnout Chart and High-Risk Staff Table */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Burnout Risk by Department Chart */}
                <div className="lg:col-span-3 glass-card p-6 rounded-2xl">
                    <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                        <BarChart2 className="text-primary"/> {t('admin_chart_burnout_risk')}
                    </h3>
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart
                            layout="vertical"
                            data={burnoutChartData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <XAxis type="number" domain={[0, 100]} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} />
                            <YAxis type="category" dataKey="teamName" tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} width={80} axisLine={false} tickLine={false}/>
                            <Tooltip 
                                cursor={{ fill: 'var(--accent)' }}
                                contentStyle={{backgroundColor: 'var(--card)', border: '1px solid var(--border)'}}
                            />
                            <Bar dataKey="burnoutRisk" barSize={20}>
                                {burnoutChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.burnoutRisk < 25 ? '#10B981' : entry.burnoutRisk < 75 ? '#F59E0B' : '#EF4444'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* High-Risk Staff Overview Table */}
                <div className="lg:col-span-2 glass-card p-6 rounded-2xl">
                    <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                        <AlertTriangle className="text-primary"/> {t('admin_table_risk_overview')}
                    </h3>
                    <div className="overflow-y-auto max-h-[350px]">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-border text-muted-foreground">
                                    <th className="p-3 font-semibold">{t('admin_table_employee_id')}</th>
                                    <th className="p-3 font-semibold">{t('admin_table_department')}</th>
                                    <th className="p-3 font-semibold">{t('admin_table_risk_score')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {highRiskStaff.slice(0, 15).map(staff => {
                                    const riskColor = getRiskColorClasses(staff.riskScore);
                                    return (
                                        <tr key={staff.employeeId} className="border-b border-border last:border-0 hover:bg-secondary/50">
                                            <td className="p-3 font-mono">{staff.employeeId}</td>
                                            <td className="p-3">{staff.department}</td>
                                            <td className="p-3">
                                                <div className="flex items-center gap-3">
                                                    <span className={`font-bold ${riskColor.text} w-8`}>{staff.riskScore}</span>
                                                    <div className="w-full bg-secondary rounded-full h-2">
                                                        <div 
                                                            className={`${riskColor.bg} h-2 rounded-full`} 
                                                            style={{ width: `${staff.riskScore}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
