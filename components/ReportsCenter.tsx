
import React from 'react';
import { Voter, CaboEleitoral, PoliticalProfile } from '../types';
import { 
  exportVotersToPDF, 
  exportDetailedFinancialReportPDF, 
  exportFullCampaignOverviewPDF, 
  exportMonthlyFinancialReportPDF 
} from '../services/pdf';
import { 
  FileText, 
  Users, 
  DollarSign, 
  BarChart3, 
  Download, 
  ShieldCheck, 
  PieChart, 
  Briefcase,
  ChevronRight
} from 'lucide-react';

interface Props {
  voters: Voter[];
  cabos: CaboEleitoral[];
  profile: PoliticalProfile;
}

const ReportsCenter: React.FC<Props> = ({ voters, cabos, profile }) => {
  const reports = [
    {
      title: "Relatório Geral de Eleitores",
      description: "Lista completa de todos os eleitores cadastrados com dados de contato, localização e status.",
      icon: <Users className="text-blue-600" />,
      color: "bg-blue-50",
      action: () => exportVotersToPDF(voters, profile)
    },
    {
      title: "Detalhamento de Gastos",
      description: "Documento analítico de todos os auxílios prestados, organizado por eleitor, data e categoria.",
      icon: <DollarSign className="text-emerald-600" />,
      color: "bg-emerald-50",
      action: () => exportDetailedFinancialReportPDF(voters, profile)
    },
    {
      title: "Resumo Estratégico",
      description: "Visão geral da campanha: metas de votos, desempenho por cidade/bairro e eficiência da equipe.",
      icon: <BarChart3 className="text-indigo-600" />,
      color: "bg-indigo-50",
      action: () => exportFullCampaignOverviewPDF(voters, cabos, profile)
    },
    {
      title: "Balanço Financeiro Mensal",
      description: "Consolidado de investimentos mensais para acompanhamento de evolução de caixa e gastos fixos.",
      icon: <PieChart className="text-purple-600" />,
      color: "bg-purple-50",
      action: () => exportMonthlyFinancialReportPDF(voters, profile)
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">
      {/* Header da Central */}
      <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-indigo-600">
            <ShieldCheck size={12} /> Inteligência de Dados
          </div>
          <h2 className="text-4xl font-black text-slate-800 mb-4">Central de Relatórios</h2>
          <p className="text-slate-500 font-medium leading-relaxed max-w-xl">
            Gere documentos oficiais e estratégicos para auxiliar na sua tomada de decisão e prestação de contas. Todos os dados são exportados em formato PDF de alta qualidade.
          </p>
        </div>
        <div className="w-full md:w-auto grid grid-cols-2 gap-4">
           <div className="bg-slate-50 p-6 rounded-3xl text-center border border-slate-100">
              <p className="text-3xl font-black text-slate-800">{voters.length}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Eleitores</p>
           </div>
           <div className="bg-slate-50 p-6 rounded-3xl text-center border border-slate-100">
              <p className="text-3xl font-black text-slate-800">{cabos.length}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Lideranças</p>
           </div>
        </div>
      </div>

      {/* Grid de Relatórios */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {reports.map((report, index) => (
          <div 
            key={index} 
            className="group bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/20 transition-all cursor-pointer flex flex-col justify-between"
            onClick={report.action}
          >
            <div className="space-y-6">
              <div className={`w-16 h-16 ${report.color} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}>
                {React.cloneElement(report.icon as React.ReactElement, { size: 32 })}
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 mb-3 group-hover:text-indigo-600 transition-colors">
                  {report.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">
                  {report.description}
                </p>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Documento PDF Oficial</span>
              <button className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest group-hover:gap-3 transition-all">
                Gerar Agora <ChevronRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Informativo */}
      <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-indigo-200">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-2xl">
            <Briefcase size={24} />
          </div>
          <div>
            <p className="font-black text-lg">Precisa de um relatório personalizado?</p>
            <p className="text-indigo-100 text-sm opacity-80">Use a Consultoria IA para extrair insights específicos da sua base.</p>
          </div>
        </div>
        <button className="px-8 py-4 bg-white text-indigo-600 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg hover:bg-indigo-50 transition-all active:scale-95">
          Falar com a IA
        </button>
      </div>
    </div>
  );
};

export default ReportsCenter;
