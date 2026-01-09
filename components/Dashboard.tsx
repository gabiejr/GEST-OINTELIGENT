
import React, { useMemo } from 'react';
import { Voter, CaboEleitoral, PoliticalProfile } from '../types';
import { exportFullCampaignOverviewPDF, exportDetailedFinancialReportPDF } from '../services/pdf';
import { Users, UserCheck, MapPin, Target, Venus, Mars, Percent, Flag, Trophy, Download, FileText, DollarSign, Map } from 'lucide-react';

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
    const maleCount = voters.filter(v => v.gender === 'Masculino').length;
    const femaleCount = voters.filter(v => v.gender === 'Feminino').length;
    
    const localDistribution: Record<string, { voters: number; cabos: number }> = {};
    
    voters.forEach(v => {
      // Lógica dinâmica: se estadual, agrupa por Cidade. Se municipal, por Bairro.
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
      gender: {
        male: { count: maleCount, pct: voters.length > 0 ? (maleCount / voters.length) * 100 : 0 },
        female: { count: femaleCount, pct: voters.length > 0 ? (femaleCount / voters.length) * 100 : 0 },
      },
      goal: { progress, remaining, goal: voteGoal },
      localDistribution: Object.entries(localDistribution)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => (b.voters + b.cabos) - (a.voters + a.cabos))
        .slice(0, 8) // Aumentado para mostrar mais localidades
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
              Gasto Detalhado (PDF)
            </button>
            <button 
              onClick={handleDownloadReport}
              className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
            >
              <FileText size={16} className="text-indigo-600" />
              Relatório Consolidado (PDF)
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Apoios Totais" 
          value={stats.total.toString()} 
          icon={<Users className="text-blue-600" />} 
          bgColor="bg-blue-50" 
          tooltipText="Eleitores cadastrados + Cabos eleitorais"
        />
        <StatCard 
          label="Lideranças" 
          value={stats.cabosTotal.toString()} 
          icon={<Flag className="text-orange-600" />} 
          bgColor="bg-orange-50" 
        />
        <StatCard 
          label="Meta Atingida" 
          value={`${stats.goal.progress.toFixed(1)}%`} 
          icon={<Trophy className="text-amber-600" />} 
          bgColor="bg-amber-50" 
        />
        <StatCard 
          label="Faltam para Meta" 
          value={stats.goal.remaining.toString()} 
          icon={<Target className="text-red-600" />} 
          bgColor="bg-red-50" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="flex justify-between mb-6">
            <h3 className="font-black text-slate-800 flex items-center gap-2 text-xl">
              <Target size={24} className="text-indigo-600" /> 
              Progresso Consolidado
            </h3>
            <button onClick={onEditGoal} className="text-xs font-black text-indigo-600 uppercase">Ajustar Meta</button>
          </div>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm font-bold mb-2">
                <span className="text-slate-500">Base Ativa (Votos Reais)</span>
                <span className="text-indigo-600">{stats.total} / {voteGoal}</span>
              </div>
              <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 transition-all duration-1000" 
                  style={{ width: `${Math.min(100, stats.goal.progress)}%` }} 
                />
              </div>
              <p className="mt-2 text-[10px] text-slate-400 font-medium">* Inclui eleitores e equipe direta de liderança.</p>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                  Concentração por {scope === 'municipal' ? 'Bairros' : 'Cidades'}
                </h4>
                <div className="p-1.5 bg-slate-50 rounded-lg text-indigo-600">
                   <Map size={14} />
                </div>
              </div>
              <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                {stats.localDistribution.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Sem registros geográficos.</p>
                ) : (
                  stats.localDistribution.map(loc => {
                    const totalInLoc = loc.voters + loc.cabos;
                    return (
                      <div key={loc.name} className="flex items-center gap-4 group">
                        <div className="w-32 text-[10px] font-black text-slate-500 uppercase truncate group-hover:text-indigo-600 transition-colors" title={loc.name}>
                          {loc.name}
                        </div>
                        <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-400 group-hover:bg-indigo-600 transition-all" 
                            style={{ width: `${(totalInLoc / (stats.total || 1)) * 100}%` }} 
                          />
                        </div>
                        <div className="w-10 text-right text-xs font-black text-slate-700">{totalInLoc}</div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <h3 className="font-black text-slate-800 flex items-center gap-2 text-xl mb-6"><Users size={24} className="text-indigo-600" /> Perfil Demográfico</h3>
          <div className="space-y-10 py-4">
             <div className="flex items-center justify-around text-center">
                <div>
                  <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-3 border-4 border-pink-100">
                    <Venus size={32} className="text-pink-600" />
                  </div>
                  <p className="text-2xl font-black text-slate-800">{stats.gender.female.pct.toFixed(1)}%</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Público Feminino</p>
                </div>
                <div className="h-16 w-px bg-slate-100"></div>
                <div>
                  <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3 border-4 border-blue-100">
                    <Mars size={32} className="text-blue-600" />
                  </div>
                  <p className="text-2xl font-black text-slate-800">{stats.gender.male.pct.toFixed(1)}%</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Público Masculino</p>
                </div>
             </div>
             
             <div className="p-6 rounded-3xl border bg-indigo-50 border-indigo-100">
                <div className="flex items-center gap-3 mb-2">
                  <Percent size={18} className="text-indigo-600" />
                  <span className="text-sm font-black text-indigo-700">Eficiência da Equipe</span>
                </div>
                <p className="text-xs text-indigo-600/70 font-medium">
                  Em média, cada liderança cadastrada trouxe {(stats.votersOnly / (cabos.length || 1)).toFixed(1)} novos eleitores para a sua base atual.
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string; icon: React.ReactNode; bgColor: string; tooltipText?: string }> = ({ label, value, icon, bgColor, tooltipText }) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-start justify-between relative group">
    <div>
      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-black mt-1 text-slate-800">{value}</p>
      {tooltipText && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-slate-800 text-white text-[9px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
          {tooltipText}
        </div>
      )}
    </div>
    <div className={`${bgColor} p-3 rounded-2xl`}>{icon}</div>
  </div>
);

export default Dashboard;
