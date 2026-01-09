
import React, { useState, useMemo } from 'react';
import { Voter, PoliticalProfile } from '../types';
import { generateBulkCampaignMessage } from '../services/gemini';
import { Send, MapPin, Sparkles, Loader2, MessageSquare, Copy, User, Search } from 'lucide-react';

interface Props {
  voters: Voter[];
  profile: PoliticalProfile;
}

const BulkMessenger: React.FC<Props> = ({ voters, profile }) => {
  const [selectionMode, setSelectionMode] = useState<'location' | 'name'>('location');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [searchName, setSearchName] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [topic, setTopic] = useState('');
  const [sentVoters, setSentVoters] = useState<Set<string>>(new Set());

  // Agrupa localizações únicas (Bairros ou Cidades conforme o scope)
  const locations = useMemo(() => {
    const locs = new Set<string>();
    voters.forEach(v => {
      if (v.neighborhood) locs.add(v.neighborhood);
    });
    return Array.from(locs).sort();
  }, [voters]);

  const filteredVoters = useMemo(() => {
    if (selectionMode === 'location') {
      if (!selectedLocation) return [];
      return voters.filter(v => v.neighborhood === selectedLocation);
    } else {
      if (!searchName.trim()) return voters.slice(0, 10); // Mostra alguns se vazio
      return voters.filter(v => v.name.toLowerCase().includes(searchName.toLowerCase()));
    }
  }, [voters, selectedLocation, searchName, selectionMode]);

  const handleGenerateIA = async () => {
    setIsGenerating(true);
    // Se estiver no modo nome e não tiver localidade, usa a localidade do primeiro eleitor filtrado ou uma genérica
    const locationContext = selectionMode === 'location' ? selectedLocation : (filteredVoters[0]?.neighborhood || 'nossa região');
    const text = await generateBulkCampaignMessage(locationContext, profile, topic);
    setMessage(text);
    setIsGenerating(false);
  };

  const markAsSent = (id: string) => {
    const newSet = new Set(sentVoters);
    newSet.add(id);
    setSentVoters(newSet);
  };

  const locationLabel = profile.scope === 'municipal' ? 'Bairro' : 'Cidade';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
      {/* Coluna de Configuração */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
            <MessageSquare className="text-emerald-500" /> Configurar Disparo
          </h3>

          <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-6">
            <button 
              onClick={() => setSelectionMode('location')}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${selectionMode === 'location' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
            >
              <MapPin size={14} /> Por {locationLabel}
            </button>
            <button 
              onClick={() => setSelectionMode('name')}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${selectionMode === 'name' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
            >
              <User size={14} /> Por Nome
            </button>
          </div>
          
          <div className="space-y-4">
            {selectionMode === 'location' ? (
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                  Filtrar por {locationLabel}
                </label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <select 
                    value={selectedLocation}
                    onChange={(e) => { setSelectedLocation(e.target.value); setSentVoters(new Set()); }}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold text-slate-700 appearance-none"
                  >
                    <option value="">Selecione a localidade...</option>
                    {locations.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                  Buscar Eleitor por Nome
                </label>
                <div className="relative">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input 
                    type="text"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    placeholder="Digite o nome..."
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold text-slate-700"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Tema da Mensagem (Opcional)</label>
              <input 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ex: Reforma da praça, saúde, convite para reunião..."
                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold"
              />
            </div>

            <button 
              onClick={handleGenerateIA}
              disabled={isGenerating || (selectionMode === 'location' && !selectedLocation)}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 disabled:bg-slate-200 transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-100"
            >
              {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
              Gerar Texto com IA
            </button>
          </div>
        </div>

        {message && (
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 animate-in zoom-in-95">
             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-1">Mensagem Preparada</label>
             <textarea 
               value={message}
               onChange={(e) => setMessage(e.target.value)}
               className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-2xl font-medium text-slate-700 text-sm resize-none h-48 focus:border-emerald-500 transition-all outline-none"
             />
             <div className="mt-4 text-[10px] text-slate-400 font-bold flex justify-between">
                <span>Caracteres: {message.length}</span>
                <button onClick={() => { navigator.clipboard.writeText(message); alert("Copiado!"); }} className="text-indigo-600 flex items-center gap-1">
                  <Copy size={12} /> Copiar Texto
                </button>
             </div>
          </div>
        )}
      </div>

      {/* Coluna de Destinatários */}
      <div className="lg:col-span-7">
        {(selectionMode === 'location' && !selectedLocation) ? (
          <div className="bg-white p-20 rounded-[2.5rem] border-2 border-dashed border-slate-200 text-center flex flex-col items-center justify-center text-slate-400">
            <Send size={64} className="mb-4 opacity-20" />
            <p className="font-bold">Selecione uma localidade para ver os eleitores.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-800">
                {selectionMode === 'location' ? `Eleitores em ${selectedLocation}` : 'Resultados da Busca'}
                <span className="ml-3 text-xs bg-slate-100 px-3 py-1 rounded-full text-slate-500">{filteredVoters.length} registros</span>
              </h3>
              <div className="flex items-center gap-2">
                 <div className="h-2 w-24 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 transition-all" style={{ width: `${filteredVoters.length > 0 ? (sentVoters.size / filteredVoters.length) * 100 : 0}%` }} />
                 </div>
                 <span className="text-[10px] font-black text-slate-400">{sentVoters.size}/{filteredVoters.length}</span>
              </div>
            </div>

            <div className="max-h-[700px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
               {filteredVoters.map(v => (
                 <div key={v.id} className={`bg-white p-5 rounded-3xl border-2 transition-all flex items-center justify-between group ${sentVoters.has(v.id) ? 'border-emerald-100 bg-emerald-50 opacity-60' : 'border-slate-100 shadow-sm hover:border-indigo-200'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${sentVoters.has(v.id) ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600'}`}>
                        {sentVoters.has(v.id) ? <CheckCircle size={20} /> : v.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 leading-none">{v.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-1">{v.neighborhood || 'Bairro N/I'}</p>
                      </div>
                    </div>
                    
                    <a 
                      href={`https://wa.me/${v.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => markAsSent(v.id)}
                      className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all ${!message ? 'bg-slate-100 text-slate-300 pointer-events-none' : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-100 active:scale-95'}`}
                    >
                      <Send size={14} /> Enviar
                    </a>
                 </div>
               ))}
               {filteredVoters.length === 0 && (
                 <p className="text-center py-10 text-slate-400 font-medium italic">Nenhum eleitor encontrado para este critério.</p>
               )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const CheckCircle: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
);

export default BulkMessenger;
