import { useMemo } from 'react';
import { type AdminDashboardData, type TeamWellnessData, type HighRiskStaff } from '../types';

const TEAMS = [
    { id: 'er', name: 'ER', baseStress: 6.5, topStressors: ['High patient load', 'Critical cases', 'Long shifts'] },
    { id: 'icu', name: 'ICU', baseStress: 7.0, topStressors: ['End-of-life care', 'Alarm fatigue', 'Complex cases'] },
    { id: 'peds', name: 'Pediatrics', baseStress: 4.5, topStressors: ['Emotional family situations', 'Challenging diagnoses'] },
    { id: 'cardio', name: 'Cardiology', baseStress: 5.0, topStressors: ['Procedure complications', 'On-call demands'] },
    { id: 'surgery', name: 'Surgery', baseStress: 6.0, topStressors: ['Long procedures', 'Post-op complications', 'High pressure'] },
];

const generateTeamData = (): TeamWellnessData[] => {
    return TEAMS.map(team => {
        const stressTrend: { day: string; level: number }[] = [];
        let currentStress = team.baseStress;
        
        for (let i = 1; i <= 30; i++) {
            // Add some noise and weekly patterns (e.g., higher stress mid-week)
            const dayOfWeekFactor = Math.sin((i % 7) * (Math.PI / 3.5)) * 0.5; // Sin wave for weekly cycle
            const randomNoise = (Math.random() - 0.5) * 1.5;
            currentStress += randomNoise * 0.2;
            currentStress = Math.max(2, Math.min(9.5, currentStress));

            stressTrend.push({
                day: `Day ${i}`,
                level: parseFloat((currentStress + dayOfWeekFactor).toFixed(2)),
            });
        }
        
        const avgStress = stressTrend.reduce((acc, curr) => acc + curr.level, 0) / stressTrend.length;
        
        let burnoutRisk;
        if (team.name === 'Pediatrics' || team.name === 'Cardiology') {
            burnoutRisk = Math.floor(15 + Math.random() * 10); // Generates a number between 15 and 24
        } else {
            burnoutRisk = Math.min(95, Math.round(avgStress * 9 + (Math.random() * 20)));
        }
        
        return {
            teamId: team.id,
            teamName: team.name,
            stressTrend,
            avgStress: avgStress,
            burnoutRisk: burnoutRisk,
            engagementRate: Math.round(60 + (Math.random() * 25) - (avgStress * 2)), // Higher stress, lower engagement
            topStressors: team.topStressors,
        };
    });
};

const generateHighRiskStaffData = (teams: TeamWellnessData[]): HighRiskStaff[] => {
    const staff: HighRiskStaff[] = [];
    const departments = teams.map(t => t.teamName);

    for (let i = 0; i < 25; i++) {
        const department = departments[Math.floor(Math.random() * departments.length)];
        const teamData = teams.find(t => t.teamName === department);
        const baseRisk = teamData ? teamData.burnoutRisk : 50;
        
        // Add more variance to the risk score to generate a mix of high, medium, and low risk staff
        const riskVariance = (Math.random() - 0.5) * 50; // Random value between -25 and 25
        const riskScore = Math.max(5, Math.min(98, Math.floor(baseRisk + riskVariance)));

        staff.push({
            employeeId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
            department: department,
            riskScore: riskScore,
        });
    }

    // Sort by risk score, descending
    return staff.sort((a, b) => b.riskScore - a.riskScore);
};


// Main hook that generates and memoizes the data
export const useAdminData = (): AdminDashboardData | null => {
    const data = useMemo(() => {
        const teams = generateTeamData();
        const highRiskStaff = generateHighRiskStaffData(teams);

        const overallStress = teams.reduce((acc, t) => acc + t.avgStress, 0) / teams.length;
        const overallBurnoutRisk = teams.reduce((acc, t) => acc + t.burnoutRisk, 0) / teams.length;
        const overallEngagement = teams.reduce((acc, t) => acc + t.engagementRate, 0) / teams.length;

        return {
            overallStress,
            overallBurnoutRisk,
            overallEngagement,
            teams,
            highRiskStaff,
        };
    }, []);

    return data;
};