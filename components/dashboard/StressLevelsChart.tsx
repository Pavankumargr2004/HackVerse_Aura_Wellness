import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts';
import { useLanguage } from '../../contexts/LanguageContext';

const data = [
  { name: 'undefined', uv: 70, pv: 62 },
  { name: 'undefined', uv: 82, pv: 58 },
  { name: 'undefined', uv: 75, pv: 65 },
  { name: 'undefined', uv: 68, pv: 72 },
];


const CustomTooltip = ({ active, payload }: any) => {
    const { t } = useLanguage();
    if (active && payload && payload.length) {
        return (
            <div className="glass-card p-3 rounded-lg shadow-lg border border-border">
                {payload[0] && <p className="font-bold" style={{color: payload[0].stroke}}>{`Line 1: ${payload[0].value}`}</p>}
                {payload[1] && <p className="font-bold" style={{color: payload[1].stroke}}>{`Line 2: ${payload[1].value}`}</p>}
            </div>
        );
    }
    return null;
};

const StressLevelsChart: React.FC = () => {
    const { t } = useLanguage();

    return (
        <div className="glass-card p-6 rounded-2xl h-full flex flex-col">
            <h3 className="text-xl font-bold text-foreground mb-4">{t('dashboard_chart_stress')}</h3>
            <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={data}
                        margin={{
                            top: 5, right: 30, left: 0, bottom: 5,
                        }}
                    >
                        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                        <XAxis
                            dataKey="name"
                            tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            domain={[0, 100]}
                            tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--primary)', strokeWidth: 1, strokeDasharray: '3 3' }} />

                        <ReferenceArea y1={75} y2={100} fill="var(--destructive)" fillOpacity={0.1} label={{ value: t('label_high'), position: 'insideTopRight', fill: 'var(--destructive)', fontSize: 12, fontWeight: 'bold' }} />
                        <ReferenceArea y1={40} y2={75} fill="#F59E0B" fillOpacity={0.1} label={{ value: t('label_elevated'), position: 'insideTopRight', fill: '#F59E0B', fontSize: 12, fontWeight: 'bold' }}/>
                        <ReferenceArea y1={0} y2={40} fill="#10B981" fillOpacity={0.1} label={{ value: t('label_calm'), position: 'insideTopRight', fill: '#10B981', fontSize: 12, fontWeight: 'bold' }}/>

                        <Line type="monotone" dataKey="uv" stroke="#a78bfa" strokeWidth={3} dot={false} activeDot={{ r: 6, strokeWidth: 2, stroke: 'var(--background)' }} />
                        <Line type="monotone" dataKey="pv" stroke="#4ade80" strokeWidth={3} dot={false} activeDot={{ r: 6, strokeWidth: 2, stroke: 'var(--background)' }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default StressLevelsChart;