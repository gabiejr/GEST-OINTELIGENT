
import React, { useState, useEffect, useMemo } from 'react';
import { Appointment, Voter, PoliticalProfile } from '../types';
import { generateMeetingBriefing } from '../services/gemini';
import { Bot, X, Sparkles, Send, Loader2, MessageCircle, AlertTriangle, Lightbulb, User } from 'lucide-react';

interface Props {
  appointments: Appointment[];
  voters: Voter[];
  profile: PoliticalProfile;
}

const PoliticalBot: React.FC<Props> = ({ appointments, voters, profile }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'tips' | 'agenda' | 'chat'>('tips');
  const [loadingAptId, setLoadingAptId] = useState<string | null>(null);
  const [briefings, setBriefings] = useState<Record<string, string>>({});

  const todayAppointments = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return appointments.filter(a => a.date === today && a.status === 'pending');
  }, [appointments]);

  const birthdayToday = useMemo(() => {
    const today = new Date();
    const tMonth = today.getMonth() + 1;
    const tDay = today.getDate();
    return voters.filter(v => {
      const [, m, d] = v.birthDate.split('-').map(Number);
      return m === tMonth && d === tDay;
    });
  }, [voters]);

  const handleGetBriefing = async (apt: Appointment) => {
    setLoadingAptId(apt.id);
    const text = await generateMeetingBriefing(apt, profile);
    setBriefings(prev => ({ ...prev, [apt.id]: text }));
    setLoadingAptId(null);
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
          <div className="p-6 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                <Bot size={24} />
              </div>
              <div>
                <h4 className="font-black text-sm tracking-tight leading-none">Assistente Elias</h4>
                <span className="text-[10px] opacity-60 font-bold uppercase tracking-widest">Estratégia Online</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="flex bg-slate-50 border-b border-slate-100 p-1">
            <button onClick={() => setActiveTab('tips')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all rounded-xl ${activeTab === 'tips' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Dicas IA</button>
            <button onClick={() => setActiveTab('agenda')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all rounded-xl ${activeTab === 'agenda' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Agenda Hoje</button>
          </div>

          <div className="p-6 h-[400px] overflow-y-auto custom-scrollbar">
            {activeTab === 'tips' && (
              <div className="space-y-6">
                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
                  <h5 className="flex items-center gap-2 text-indigo-700 font-black text-xs uppercase mb-3">
                    <Sparkles size={14} /> Dica de Engajamento
                  </h5>
                  <p className="text-xs text-indigo-900 leading-relaxed font-medium italic">
                    "Eleitores valorizam respostas rápidas. Que tal dar uma olhada nas mensagens pendentes no WhatsApp hoje?"
                  </p>
                </div>

                {birthdayToday.length > 0 && (
                  <div className="p-4 bg-pink-50 border border-pink-100 rounded-2xl">
                    <h5 className="flex items-center gap-2 text-pink-700 font-black text-xs uppercase mb-3">
                      <AlertTriangle size={14} /> Alerta de Relacionamento
                    </h5>
                    <p className="text-xs text-pink-900 font-bold mb-3">Hoje é aniversário de {birthdayToday.length} eleitores!</p>
                    <div className="space-y-2">
                       {birthdayToday.slice(0, 3).map(v => (
                         <div key={v.id} className="text-[10px] font-black text-pink-800 bg-white/50 p-2 rounded-lg border border-pink-100 flex items-center gap-2">
                           <User size={12} /> {v.name}
                         </div>
                       ))}
                    </div>
                  </div>
                )}
                
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                  <h5 className="flex items-center gap-2 text-amber-700 font-black text-xs uppercase mb-3">
                    <Lightbulb size={14} /> Pauta Sugerida
                  </h5>
                  <p className="text-xs text-amber-900 leading-relaxed font-medium">
                    Considere falar sobre sustentabilidade urbana nas suas próximas postagens. É um tema em alta na região.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'agenda' && (
              <div className="space-y-4">
                {todayAppointments.length === 0 ? (
                  <div className="text-center py-12 text-slate-300">
                    <MessageCircle size={40} className="mx-auto mb-2 opacity-20" />
                    <p className="text-xs font-bold uppercase">Sem compromissos para hoje</p>
                  </div>
                ) : (
                  todayAppointments.map(apt => (
                    <div key={apt.id} className="p-4 bg-white border-2 border-slate-100 rounded-2xl shadow-sm space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="px-2 py-0.5 bg-slate-100 text-[9px] font-black uppercase text-slate-500 rounded-md">{apt.time}</span>
                        <h6 className="text-xs font-black text-slate-800 flex-1 ml-3 truncate">{apt.title}</h6>
                      </div>
                      
                      {briefings[apt.id] ? (
                        <div className="text-[10px] text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 font-medium whitespace-pre-wrap leading-relaxed animate-in fade-in duration-500">
                           {briefings[apt.id]}
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleGetBriefing(apt)}
                          disabled={loadingAptId === apt.id}
                          className="w-full py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-100 transition-all"
                        >
                          {loadingAptId === apt.id ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                          Preparar Briefing IA
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95 ${isOpen ? 'bg-slate-800 text-white' : 'bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white animate-bounce'}`}
      >
        {isOpen ? <X size={32} /> : <Bot size={32} />}
        {!isOpen && (
           <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-[10px] font-black rounded-full border-2 border-white flex items-center justify-center">
             !
           </div>
        )}
      </button>
    </div>
  );
};

export default PoliticalBot;
