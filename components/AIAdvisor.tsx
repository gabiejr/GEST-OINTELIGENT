
import React, { useState } from 'react';
import { PoliticalProfile } from '../types';
import { performStrategicResearch } from '../services/gemini';
import { Sparkles, Send, Globe, ExternalLink, Loader2, Lightbulb, TrendingUp, Mic, History } from 'lucide-react';

interface Props {
  profile: PoliticalProfile;
}

const AIAdvisor: React.FC<Props> = ({ profile }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ text: string, sources: { uri: string, title: string }[] } | null>(null);

  const handleResearch = async (e?: React.FormEvent, customQuery?: string) => {
    e?.preventDefault();
    const finalQuery = customQuery || query;
    if (!finalQuery.trim()) return;

    setLoading(true);
    const data = await performStrategicResearch(finalQuery, profile);
    setResult(data);
    setLoading(false);
    if (!customQuery) setQuery('');
  };

  const suggestions = [
    { icon: <TrendingUp size={14} />, label: "Tendências eleitorais 2024", text: "Quais são as principais tendências e preocupações do eleitorado brasileiro para as eleições municipais de 2024?" },
    { icon: <Globe size={14} />, label: "Notícias da região", text: `Quais são as últimas notícias e problemas relatados na região de atuação para o cargo de ${profile.office}?` },
    { icon: <Lightbulb size={14} />, label: "Dicas de discurso", text: "Me dê 5 pontos chave para um discurso impactante sobre renovação política e compromisso social." }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-gradient-to-br from-indigo-700 via-indigo-600 to-indigo-800 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden text-white border-4 border-white/10">
        <div className="absolute top-0 right-0 p-8 opacity-10 animate-pulse">
          <Sparkles size={120} />
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-4 border border-white/10">
            <Sparkles size={12} className="text-amber-400" /> Consultor Estratégico IA
          </div>
          <h2 className="text-4xl font-black mb-4">Inteligência de Campanha</h2>
          <p className="text-indigo-100/80 font-medium max-w-xl leading-relaxed">
            Realize pesquisas em tempo real sobre tendências, notícias locais e estratégias de comunicação para potencializar sua presença política.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200">
            <h3 className="font-black text-slate-800 text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
              <Lightbulb size={16} className="text-amber-500" /> Sugestões Rápidas
            </h3>
            <div className="space-y-3">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleResearch(undefined, s.text)}
                  className="w-full text-left p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-indigo-50 hover:border-indigo-100 transition-all group flex items-start gap-3"
                >
                  <div className="mt-1 text-slate-400 group-hover:text-indigo-600 transition-colors">
                    {s.icon}
                  </div>
                  <span className="text-xs font-bold text-slate-600 group-hover:text-indigo-700">{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200">
            <form onSubmit={handleResearch} className="relative">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Pergunte qualquer coisa sobre política, tendências ou sua região..."
                className="w-full pl-6 pr-16 py-5 bg-slate-100 border-2 border-slate-100 rounded-[2rem] outline-none font-bold text-slate-700 focus:border-indigo-500 focus:bg-white transition-all shadow-inner"
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="absolute right-2 top-2 p-4 bg-indigo-600 text-white rounded-[1.5rem] shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:bg-slate-300 active:scale-95"
              >
                {loading ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} />}
              </button>
            </form>
          </div>

          {result && (
            <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-200 animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-2 text-indigo-600 mb-6">
                <Sparkles size={20} />
                <h4 className="font-black uppercase text-xs tracking-[0.2em]">Análise Estratégica</h4>
              </div>
              
              <div className="prose prose-slate max-w-none">
                <p className="text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">
                  {result.text}
                </p>
              </div>

              {result.sources.length > 0 && (
                <div className="mt-10 pt-8 border-t border-slate-100">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Globe size={14} /> Fontes Pesquisadas
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {result.sources.map((source, i) => (
                      <a
                        key={i}
                        href={source.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all truncate max-w-[200px]"
                      >
                        <ExternalLink size={12} /> {source.title || 'Ver Fonte'}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAdvisor;
