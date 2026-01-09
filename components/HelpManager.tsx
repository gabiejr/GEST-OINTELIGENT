
import React, { useState, useMemo } from 'react';
import { Voter, HelpRecord, PoliticalProfile } from '../types';
import { exportMonthlyFinancialReportPDF, exportDetailedFinancialReportPDF } from '../services/pdf';
import { HandHelping, Search, Plus, Calendar, Trash2, FileText, ChevronRight, DollarSign, PieChart, TrendingUp, Download, ListChecks, Award, BarChart3 } from 'lucide-react';

interface Props {
  voters: Voter[];
  onAddHelp: (voterId: string, record: Omit<HelpRecord, 'id'>) => void;
  onDeleteHelp: (voterId: string, recordId: string) => void;
  onExportHelp: (voter: Voter) => void;
  initialVoter: Voter | null;
}

const HelpManager: React.FC<Props> = ({ voters, onAddHelp, onDeleteHelp, onExportHelp, initialVoter }) => {
  const [selectedVoter, setSelectedVoter] = useState<Voter | null>(initialVoter);
  const [searchTerm, setSearchTerm] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Social');
  const [value, setValue] = useState<string>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const politicalProfile = useMemo(() => {
    const saved = localStorage.getItem('political_profile');
    return saved ? JSON.parse(saved) as PoliticalProfile : undefined;
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const formatMonthShort = (monthKey: string) => {
    const [, month] = monthKey.split('-');
    const date = new Date(2000, parseInt(month) - 1);
    return date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
  };

  // Lógica para encontrar o eleitor mais ajudado e sua evolução
  const topAssistedData = useMemo(() => {
    let topVoter: Voter | null = null;
    let maxTotal = 0;

    voters.forEach(v => {
      const total = (v.helpRecords || []).reduce((acc, curr) => acc + (curr.value || 0), 0);
      if (total > maxTotal && total > 0) {
        maxTotal = total;
        topVoter = v;
      }
    });

    if (!topVoter) return null;

    const evolution: Record<string, number> = {};
    (topVoter as Voter).helpRecords?.forEach(record => {
      const d = new Date(record.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      evolution[key] = (evolution[key] || 0) + (record.value || 0);
    });

    const evolutionArray = Object.entries(evolution)
      .map(([month, total]) => ({ month, total }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-5); // Últimos 5 meses de atividade

    return {
      voter: topVoter as Voter,
      total: maxTotal,
      evolution: evolutionArray
    };
  }, [voters]);

  const filteredVoters = useMemo(() => {
    if (!searchTerm) return [];
    return voters.filter(v => v.name.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 5);
  }, [voters, searchTerm]);

  const monthlyStats = useMemo(() => {
    const stats: Record<string, number> = {};
    voters.forEach(v => {
      v.helpRecords?.forEach(record => {
        const d = new Date(record.date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        stats[key] = (stats[key] || 0) + (record.value || 0);
      });
    });

    return Object.entries(stats)
      .map(([month, total]) => ({ month, total }))
      .sort((a, b) => b.month.localeCompare(a.month));
  }, [voters]);

  const currentMonthKey = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  const totalSpentThisMonth = useMemo(() => {
    return monthlyStats.find(s => s.month === currentMonthKey)?.total || 0;
  }, [monthlyStats, currentMonthKey]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVoter || !description) return;
    
    onAddHelp(selectedVoter.id, {
      description,
      category,
      date,
      value: parseFloat(value) || 0
    });

    setDescription('');
    setValue('');
    alert("Atendimento financeiro registrado!");
  };

  const currentVoter = useMemo(() => {
    if (!selectedVoter) return null;
    return voters.find(v => v.id === selectedVoter.id) || null;
  }, [voters, selectedVoter]);

  const handleExportMonthlyBalance = () => {
    if (voters.length === 0) {
      alert("Não há dados para exportar.");
      return;
    }
    exportMonthlyFinancialReportPDF(voters, politicalProfile);
  };

  const handleExportFullDetailed = () => {
    if (voters.length === 0 || !politicalProfile) {
      alert("Dados insuficientes para gerar o relatório.");
      return;
    }
    exportDetailedFinancialReportPDF(voters, politicalProfile);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Coluna Lateral de Resumo */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <TrendingUp size={80} />
          </div>
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <PieChart size={18} className="text-indigo-600" />
            Gastos do Mês Atual
          </h3>
          <p className="text-3xl font-black text-indigo-600">{formatCurrency(totalSpentThisMonth)}</p>
          <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-wider">Investimento Total Mensal</p>
        </div>

        {/* GRÁFICO DE EVOLUÇÃO DO ELEITOR MAIS AJUDADO */}
        {topAssistedData && (
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 animate-in fade-in slide-in-from-left-4 duration-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Award size={18} className="text-amber-500" />
                Destaque de Atendimento
              </h3>
              <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[9px] font-black rounded-lg uppercase">Recordista</span>
            </div>
            
            <div className="mb-6">
              <p className="text-sm font-black text-slate-800 truncate">{topAssistedData.voter.name}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Acumulado: {formatCurrency(topAssistedData.total)}</p>
            </div>

            <div className="flex items-end justify-between h-24 gap-2 mb-2 px-1">
              {topAssistedData.evolution.map((point, i) => {
                const maxVal = Math.max(...topAssistedData.evolution.map(p => p.total));
                const height = (point.total / maxVal) * 100;
                return (
                  <div key={point.month} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="w-full relative">
                      <div 
                        className="w-full bg-indigo-500 rounded-t-lg group-hover:bg-indigo-600 transition-all duration-1000"
                        style={{ height: `${height}%` }}
                      >
                         <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[8px] px-1.5 py-0.5 rounded pointer-events-none">
                            {formatCurrency(point.total)}
                         </div>
                      </div>
                    </div>
                    <span className="text-[9px] font-black text-slate-400 uppercase">{formatMonthShort(point.month)}</span>
                  </div>
                );
              })}
            </div>
            <p className="text-[9px] text-center text-slate-400 font-medium italic mt-4 border-t border-slate-50 pt-3">
              Evolução do investimento nos últimos meses
            </p>
          </div>
        )}

        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Search size={18} className="text-indigo-600" />
            Selecionar Eleitor
          </h3>
          <input 
            type="text"
            placeholder="Buscar para registrar ajuda..."
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {filteredVoters.length > 0 && (
            <div className="mt-4 border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-50 shadow-sm">
              {filteredVoters.map(v => (
                <button
                  key={v.id}
                  onClick={() => { setSelectedVoter(v); setSearchTerm(''); }}
                  className="w-full text-left p-3 hover:bg-indigo-50 flex items-center justify-between group transition-colors"
                >
                  <span className="text-sm font-medium text-slate-700">{v.name}</span>
                  <ChevronRight size={14} className="text-slate-300 group-hover:text-indigo-500" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <DollarSign size={18} className="text-emerald-600" />
              Balanço Mensal
            </h3>
            <div className="flex gap-1">
               <button 
                onClick={handleExportFullDetailed}
                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors group"
                title="Relatório Geral Detalhado"
              >
                <ListChecks size={18} />
              </button>
              <button 
                onClick={handleExportMonthlyBalance}
                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors group"
                title="Balanço Mensal PDF"
              >
                <Download size={18} />
              </button>
            </div>
          </div>
          <div className="space-y-3">
            {monthlyStats.length === 0 ? (
              <p className="text-sm text-slate-400 italic">Nenhum gasto registrado.</p>
            ) : (
              monthlyStats.slice(0, 4).map(stat => (
                <div key={stat.month} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">{stat.month}</span>
                  <span className="text-sm font-black text-slate-700">{formatCurrency(stat.total)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Coluna Principal de Atendimento */}
      <div className="lg:col-span-8 space-y-6">
        {!currentVoter ? (
          <div className="bg-white p-20 rounded-[3rem] border border-dashed border-slate-300 text-center flex flex-col items-center justify-center">
            <HandHelping size={64} className="text-slate-200 mb-4" />
            <h3 className="text-xl font-medium text-slate-400">Escolha um eleitor na busca para registrar auxílio</h3>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
                <button onClick={handleExportFullDetailed} className="px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-slate-200 transition-all active:scale-95">
                   <ListChecks size={16} /> Relatório Geral
                </button>
                <button onClick={handleExportMonthlyBalance} className="px-6 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-emerald-200 transition-all active:scale-95">
                   <BarChart3 size={16} /> Balanço PDF
                </button>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-200 animate-in slide-in-from-right-6 duration-500">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                  <h3 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                    <Plus size={24} className="text-emerald-600" />
                    Atendimento: <span className="text-indigo-600">{currentVoter.name}</span>
                  </h3>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">{currentVoter.neighborhood}{currentVoter.city ? `, ${currentVoter.city}` : ''} • {currentVoter.phone}</p>
                </div>
                <button 
                  onClick={() => onExportHelp(currentVoter)}
                  className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-100 transition-colors"
                >
                  <FileText size={14} /> Histórico Individual (PDF)
                </button>
              </div>

              <form onSubmit={handleAdd} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Categoria</label>
                    <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none font-bold text-slate-700 transition-all"
                    >
                      <option>Saúde (Remédios/Exames)</option>
                      <option>Social (Cestas/Auxílio)</option>
                      <option>Jurídico</option>
                      <option>Documentação</option>
                      <option>Infraestrutura</option>
                      <option>Outros</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Valor do Auxílio (R$)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">R$</span>
                      <input 
                        type="number"
                        step="0.01"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder="0,00"
                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none font-bold text-slate-700 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Data do Evento</label>
                    <input 
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none font-bold text-slate-700 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">O que foi ajudado financeiramente?</label>
                  <textarea 
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descreva detalhadamente o auxílio prestado..."
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none font-bold text-slate-700 transition-all resize-none"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-lg hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 flex items-center justify-center gap-3 active:scale-95"
                >
                  <Plus size={20} /> Confirmar Registro de Gasto
                </button>
              </form>
            </div>

            <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-8 flex items-center gap-2">
                <Calendar size={18} className="text-indigo-600" />
                Histórico de Investimentos neste Eleitor
              </h3>
              
              {!currentVoter.helpRecords || currentVoter.helpRecords.length === 0 ? (
                <div className="py-12 text-center text-slate-300 italic font-medium">
                  Aguardando o primeiro registro de auxílio para este eleitor.
                </div>
              ) : (
                <div className="space-y-4">
                  {currentVoter.helpRecords.slice().reverse().map(record => (
                    <div key={record.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-start gap-6 hover:border-indigo-100 transition-colors">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <span className="px-3 py-1 bg-white border border-slate-200 text-indigo-700 text-[10px] font-black rounded-lg uppercase tracking-wider">
                            {record.category}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">
                            {new Date(record.date).toLocaleDateString('pt-BR')}
                          </span>
                          <span className="ml-auto font-black text-emerald-600 text-base">
                            {formatCurrency(record.value || 0)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed font-medium">
                          {record.description}
                        </p>
                      </div>
                      <button 
                        onClick={() => onDeleteHelp(currentVoter.id, record.id)}
                        className="p-3 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all self-center"
                        title="Excluir registro"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                  
                  <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Acumulado com este eleitor:</span>
                    <span className="text-3xl font-black text-slate-800 bg-slate-50 px-6 py-2 rounded-2xl border border-slate-100">
                      {formatCurrency(currentVoter.helpRecords.reduce((acc, curr) => acc + (curr.value || 0), 0))}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HelpManager;
