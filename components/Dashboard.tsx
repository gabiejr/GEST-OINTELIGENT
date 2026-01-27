
import React, { useMemo } from 'react';
import { Voter, CaboEleitoral, PoliticalProfile } from '../types';
import { exportFullCampaignOverviewPDF, exportDetailedFinancialReportPDF } from '../services/pdf';
import { Users, Target, DollarSign, Trophy, Flag, CalendarClock } from 'lucide-react';

interface Props {
  voters: Voter[];
  cabos: CaboEleitoral[];
  voteGoal: number;
  scope: 'municipal' | 'estadual';
  onEditGoal: () => void;
}

const Dashboard: React.FC<Props> = ({ voters, cabos, voteGoal, scope, onEditGoal }) => {
  const politicalProfile = useMemo(() => {
    const saved = localStorage.getItem('political_profile');
    return saved ? JSON.parse(saved) as PoliticalProfile : null;
  }, []);

  const stats = useMemo(() => {
    const totalPotentialVotes = voters.length + cabos.length;
    
    const localDistribution: Record<string, { voters: number; cabos: number }> = {};
    
    voters.forEach(v => {
      const loc = (scope === 'estadual' ? v.city : v.neighborhood) || 'Não Informado';
      if (!localDistribution[loc]) localDistribution[loc] = { voters: 0, cabos: 0 };
      localDistribution[loc].voters++;
    });

    cabos.forEach(c => {
      const loc = c.location || 'Não Informado';
      if (!localDistribution[loc]) localDistribution[loc] = { voters: 0, cabos: 0 };
      localDistribution[loc].cabos++;
    });

    const progress = voteGoal > 0 ? (totalPotentialVotes / voteGoal) * 100 : 0;
    const remaining = Math.max(0, voteGoal - totalPotentialVotes);

    return {
      total: totalPotentialVotes,
      votersOnly: voters.length,
      cabosTotal: cabos.length,
      goal: { progress, remaining, goal: voteGoal },
      localDistribution: Object.entries(localDistribution)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => (b.voters + b.cabos) - (a.voters + a.cabos))
        .slice(0, 8)
    };
  }, [voters, cabos, voteGoal, scope]);

  const handleDownloadReport = () => {
    if (!politicalProfile) return;
    exportFullCampaignOverviewPDF(voters, cabos, politicalProfile);
  };

  const handleDownloadFinancialDetail = () => {
    if (!politicalProfile) return;
    exportDetailedFinancialReportPDF(voters, politicalProfile);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
         <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Visão Geral</h2>
            <p className="text-slate-400 text-sm font-medium">Acompanhamento em tempo real da sua base.</p>
         </div>
         <div className="flex flex-wrap gap-3">
            <button 
              onClick={handleDownloadFinancialDetail}
              className="px-6 py-3 bg-white border border-emerald-200 text-emerald-600 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-50 transition-all shadow-sm active:scale-95"
            >
              <DollarSign size={16} />
              Gasto Detalhado
            </button>
            <button 
              onClick={handleDownloadReport}
              className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
            >
              <CalendarClock size={16} className="text-indigo-600" />
              Relatório Completo
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Apoios Totais" value={stats.total.toString()} icon={<Users className="text-blue-600" />} bgColor="bg-blue-50" />
        <StatCard label="Lideranças" value={stats.cabosTotal.toString()} icon={<Flag className="text-orange-600" />} bgColor="bg-orange-50" />
        <StatCard label="Meta Atingida" value={`${stats.goal.progress.toFixed(1)}%`} icon={<Trophy className="text-amber-600" />} bgColor="bg-amber-50" />
        <StatCard label="Faltam para Meta" value={stats.goal.remaining.toString()} icon={<Target className="text-red-600" />} bgColor="bg-red-50" />
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="flex justify-between mb-6">
          <h3 className="font-black text-slate-800 flex items-center gap-2 text-xl">
            <Target size={24} className="text-indigo-600" /> 
            Progresso Consolidado da Meta
          </h3>
          <button onClick={onEditGoal} className="text-xs font-black text-indigo-600 uppercase">Ajustar Meta</button>
        </div>
        
        <div className="space-y-8">
          <div>
            <div className="flex justify-between text-sm font-bold mb-2">
              <span className="text-slate-500">Base Ativa (Votos Reais)</span>
              <span className="text-indigo-600">{stats.total} / {voteGoal}</span>
            </div>
            <div className="h-6 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 transition-all duration-1000" style={{ width: `${Math.min(100, stats.goal.progress)}%` }} />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">
              Concentração Estratégica por {scope === 'municipal' ? 'Bairros' : 'Cidades'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-12 gap-y-6">
              {stats.localDistribution.map(loc => {
                const totalInLoc = loc.voters + loc.cabos;
                return (
                  <div key={loc.name} className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-500 uppercase truncate">{loc.name}</span>
                      <span className="text-[10px] font-black text-slate-700">{totalInLoc}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-400" style={{ width: `${(totalInLoc / (stats.total || 1)) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string; icon: React.ReactNode; bgColor: string }> = ({ label, value, icon, bgColor }) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-start justify-between">
    <div>
      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-black mt-1 text-slate-800">{value}</p>
    </div>
    <div className={`${bgColor} p-3 rounded-2xl`}>{icon}</div>
  </div>
);

export default Dashboard;
