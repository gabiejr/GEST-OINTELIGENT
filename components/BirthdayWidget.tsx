
import React, { useMemo, useState } from 'react';
import { Voter, PoliticalProfile } from '../types';
import { generateBirthdayMessage } from '../services/gemini';
import { Gift, Send, Loader2, Sparkles, CheckCircle, PartyPopper, Cake, Star, Heart } from 'lucide-react';

interface Props {
  voters: Voter[];
}

const BirthdayWidget: React.FC<Props> = ({ voters }) => {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [generatedMessages, setGeneratedMessages] = useState<Record<string, string>>({});
  
  const politicalProfile = useMemo(() => {
    const saved = localStorage.getItem('political_profile');
    return saved ? JSON.parse(saved) as PoliticalProfile : undefined;
  }, []);

  const birthdayData = useMemo(() => {
    const today = new Date();
    const tMonth = today.getMonth() + 1;
    const tDay = today.getDate();

    const monthVoters = voters.filter(v => {
      const [, m] = v.birthDate.split('-').map(Number);
      return m === tMonth;
    }).sort((a, b) => {
        const [, , d1] = a.birthDate.split('-').map(Number);
        const [, , d2] = b.birthDate.split('-').map(Number);
        return d1 - d2;
    });

    return monthVoters.map(v => {
      const [, , d] = v.birthDate.split('-').map(Number);
      return {
        ...v,
        isToday: d === tDay
      };
    });
  }, [voters]);

  const handleGenerateMessage = async (voter: Voter) => {
    setLoadingId(voter.id);
    const aiText = await generateBirthdayMessage(voter.name, politicalProfile);
    
    // Formata a mensagem completa com o estilo do "card" para o WhatsApp
    const signature = politicalProfile?.name ? `\n\n*Forte abraço, de seu amigo ${politicalProfile.name}*` : "\n\n*Forte abraço de seu amigo!*";
    const fullMessage = `*FELIZ ANIVERSÁRIO!* 🎂\n\n${aiText}${signature}`;
    
    setGeneratedMessages(prev => ({ ...prev, [voter.id]: fullMessage }));
    setLoadingId(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Mensagem completa com assinatura copiada!");
  };

  return (
    <div className="space-y-10">
      {/* Card de Celebração Premium - Assinatura agora é dinâmica */}
      <CelebrationCard profileName={politicalProfile?.name || 'Seu Amigo'} />

      {birthdayData.length === 0 ? (
        <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 text-center text-slate-400 italic">
          Nenhum aniversariante registrado neste mês.
        </div>
      ) : (
        <div className="space-y-6">
          <h3 className="text-xl font-black text-slate-800 px-2 flex items-center gap-2">
            <CalendarIcon size={20} className="text-indigo-600" />
            Lista de Aniversariantes do Mês
          </h3>
          {birthdayData.map(voter => (
            <div 
              key={voter.id} 
              className={`bg-white p-6 rounded-[2rem] border transition-all ${voter.isToday ? 'border-pink-200 ring-4 ring-pink-50 shadow-xl shadow-pink-100/20' : 'border-slate-100 shadow-sm'}`}
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className={`w-16 h-16 rounded-3xl flex flex-col items-center justify-center font-black ${voter.isToday ? 'bg-pink-500 text-white shadow-lg shadow-pink-200' : 'bg-slate-100 text-slate-600'}`}>
                    <span className="text-[10px] uppercase opacity-60">Dia</span>
                    <span className="text-xl leading-none">{voter.birthDate.split('-')[2]}</span>
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 flex items-center gap-2 text-xl">
                      {voter.name}
                      {voter.isToday && <PartyPopper size={20} className="text-pink-500" />}
                    </h4>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                      {voter.neighborhood} • {voter.phone}
                    </p>
                  </div>
                </div>

                {voter.isToday && (
                  <button 
                    onClick={() => handleGenerateMessage(voter)}
                    disabled={loadingId === voter.id}
                    className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-2xl hover:scale-105 disabled:opacity-50 transition-all flex items-center justify-center gap-3 font-black text-sm shadow-xl shadow-pink-200"
                  >
                    {loadingId === voter.id ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                    Gerar Card WhatsApp
                  </button>
                )}
              </div>

              {generatedMessages[voter.id] && (
                <div className="mt-6 p-6 bg-slate-50 rounded-2xl border-2 border-slate-100 relative animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="absolute -top-3 left-6 px-3 py-1 bg-white border border-slate-100 rounded-lg text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                    Texto do Card Gerado
                  </div>
                  <pre className="text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-wrap font-sans italic">
                    {generatedMessages[voter.id]}
                  </pre>
                  <div className="mt-6 flex flex-wrap justify-end gap-3">
                    <button 
                      onClick={() => copyToClipboard(generatedMessages[voter.id])}
                      className="p-3 text-slate-400 hover:text-indigo-600 bg-white border border-slate-200 rounded-xl transition-all shadow-sm flex items-center gap-2 text-xs font-bold"
                    >
                      <CheckCircle size={18} /> Copiar
                    </button>
                    <a 
                      href={`https://wa.me/${voter.phone.replace(/\D/g, '')}?text=${encodeURIComponent(generatedMessages[voter.id])}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-8 py-3 bg-emerald-500 text-white text-xs font-black rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100 uppercase tracking-widest"
                    >
                      <Send size={18} /> Enviar no WhatsApp
                    </a>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CelebrationCard: React.FC<{ profileName: string }> = ({ profileName }) => (
  <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-900 p-12 rounded-[3.5rem] shadow-2xl text-white border-4 border-white/10 group">
    <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-[100px] group-hover:bg-indigo-400/30 transition-colors"></div>
    <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-500/20 rounded-full blur-[100px]"></div>

    <div className="absolute top-10 right-10 animate-pulse text-indigo-300/30">
      <Star size={40} fill="currentColor" />
    </div>
    <div className="absolute bottom-10 left-1/4 animate-bounce text-indigo-300/20 duration-1000">
      <Heart size={30} fill="currentColor" />
    </div>

    <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10">
      <div className="w-28 h-28 bg-gradient-to-tr from-white/20 to-white/5 backdrop-blur-xl rounded-[2.5rem] flex items-center justify-center border border-white/30 shadow-2xl">
        <Gift size={56} className="text-white drop-shadow-lg" />
      </div>
      
      <div className="flex-1 text-center lg:text-left">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-4 border border-white/10">
          <Sparkles size={12} className="text-amber-400" /> Card Oficial de Aniversário
        </div>
        <h3 className="text-4xl md:text-5xl font-black tracking-tight mb-4 leading-tight">
          Feliz Aniversário!
        </h3>
        <p className="text-indigo-100/90 text-lg md:text-xl font-medium max-w-2xl leading-relaxed italic">
          "Que este novo ciclo seja repleto de conquistas, saúde e muitas alegrias. É uma honra ter você caminhando conosco!"
        </p>
        
        <div className="mt-8 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center gap-4">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-white/70">
            Forte abraço, de seu amigo <span className="text-white text-2xl block md:inline md:ml-2 underline underline-offset-8 decoration-indigo-400 decoration-4">{profileName}</span>
          </p>
        </div>
      </div>
    </div>
  </div>
);

const CalendarIcon: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
);

export default BirthdayWidget;
