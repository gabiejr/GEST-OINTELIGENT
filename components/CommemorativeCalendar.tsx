
import React, { useState, useMemo } from 'react';
import { CommemorativeDate, Voter, PoliticalProfile } from '../types';
import { Calendar, Share2, MessageSquare, Download, Heart, Star, Gift, Users, Image as ImageIcon, Loader2, Filter, X } from 'lucide-react';
import { generateCommemorativeImage } from '../services/gemini';

const COMMEMORATIVE_DATES: CommemorativeDate[] = [
  { id: '1', day: 1, month: 1, title: 'Ano Novo', message: 'Que este novo ano traga muita saúde, paz e prosperidade para você e sua família!', category: 'feriado' },
  { id: '2', day: 8, month: 3, title: 'Dia Internacional da Mulher', message: 'Homenagem a todas as mulheres que com força e sensibilidade transformam o mundo todos os dias.', category: 'social' },
  { id: '3', day: 1, month: 5, title: 'Dia do Trabalho', message: 'Parabéns a todos os trabalhadores que constroem o futuro da nossa nação com dedicação e suor.', category: 'feriado' },
  { id: '4', day: 12, month: 6, title: 'Dia dos Namorados', message: 'O amor é o que nos move. Feliz Dia dos Namorados!', category: 'social' },
  { id: '5', day: 7, month: 9, title: 'Independência do Brasil', message: 'Orgulho de ser brasileiro. Vamos juntos construir um país cada vez melhor!', category: 'feriado' },
  { id: '6', day: 12, month: 10, title: 'Dia das Crianças', message: 'Que a alegria e a pureza das crianças iluminem sempre o nosso caminho.', category: 'social' },
  { id: '7', day: 15, month: 11, title: 'Proclamação da República', message: 'Pela democracia e pelo fortalecimento das nossas instituições. Viva a República!', category: 'feriado' },
  { id: '8', day: 20, month: 11, title: 'Consciência Negra', message: 'Dia de reflexão e luta por igualdade e respeito. A diversidade é nossa maior riqueza.', category: 'social' },
  { id: '9', day: 25, month: 12, title: 'Natal', message: 'Que o espírito natalino encha seu coração de amor, esperança e fraternidade. Feliz Natal!', category: 'feriado' },
  { id: '10', day: 31, month: 12, title: 'Véspera de Ano Novo', message: 'Momento de agradecer pelo ano que passou e renovar as esperanças para o ciclo que se inicia.', category: 'feriado' },
];

interface Props {
  voters: Voter[];
  profile: PoliticalProfile;
}

const CommemorativeCalendar: React.FC<Props> = ({ voters, profile }) => {
  const [selectedDate, setSelectedDate] = useState<CommemorativeDate | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [filterGender, setFilterGender] = useState<string>('all');
  const [filterNeighborhood, setFilterNeighborhood] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const neighborhoods = useMemo(() => {
    const set = new Set(voters.map(v => v.neighborhood));
    return Array.from(set).sort();
  }, [voters]);

  const filteredVoters = useMemo(() => {
    return voters.filter(v => {
      const matchGender = filterGender === 'all' || v.gender === filterGender;
      const matchNeighborhood = filterNeighborhood === 'all' || v.neighborhood === filterNeighborhood;
      return matchGender && matchNeighborhood;
    });
  }, [voters, filterGender, filterNeighborhood]);

  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth() + 1;

  const todayCelebration = useMemo(() => {
    return COMMEMORATIVE_DATES.find(d => d.day === currentDay && d.month === currentMonth);
  }, [currentDay, currentMonth]);

  const handleGenerateImage = async () => {
    if (!selectedDate) return;
    setIsGenerating(true);
    const img = await generateCommemorativeImage(selectedDate.title, profile);
    setGeneratedImage(img);
    setIsGenerating(false);
  };

  const handleBulkSend = (date: CommemorativeDate) => {
    const message = `*${date.title}*\n\n${date.message}\n\n— *${profile.name}*\n${profile.party} ${profile.office}`;
    const encodedMessage = encodeURIComponent(message);
    
    // In a real scenario, we'd loop through voters or use a broadcast list
    // For this demo, we'll open a multi-send link or just explain the process
    const win = window.open(`https://web.whatsapp.com/send?text=${encodedMessage}`, '_blank');
    if (win) win.focus();
  };

  const selectDate = (date: CommemorativeDate) => {
    setSelectedDate(date);
    setGeneratedImage(null); // Reset image when changing date
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-800">Calendário Comemorativo</h2>
          <p className="text-slate-400 font-medium mt-1">Datas estratégicas para engajamento com a comunidade</p>
        </div>
        
        {todayCelebration && (
          <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex items-center gap-4 animate-pulse">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Star size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Hoje é dia de:</p>
              <h4 className="font-black text-indigo-900">{todayCelebration.title}</h4>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Lista de Datas */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                <Calendar className="text-indigo-600" /> Datas Principais
              </h3>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">Brasil</span>
            </div>
            <div className="divide-y divide-slate-50 max-h-[600px] overflow-y-auto">
              {COMMEMORATIVE_DATES.map((date) => (
                <div 
                  key={date.id} 
                  className={`p-6 flex items-center justify-between hover:bg-slate-50 transition-all cursor-pointer group ${selectedDate?.id === date.id ? 'bg-indigo-50/50' : ''}`}
                  onClick={() => selectDate(date)}
                >
                  <div className="flex items-center gap-6">
                    <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-black shadow-sm transition-transform group-hover:scale-110 ${date.month === currentMonth && date.day === currentDay ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                      <span className="text-lg leading-none">{date.day}</span>
                      <span className="text-[10px] uppercase">{new Date(2024, date.month - 1).toLocaleString('pt-BR', { month: 'short' })}</span>
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{date.title}</h4>
                      <p className="text-xs text-slate-400 font-medium line-clamp-1">{date.message}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleBulkSend(date); }}
                      className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                      title="Enviar em Massa"
                    >
                      <MessageSquare size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Visualização do Card */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 space-y-6">
            <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
              <div className="p-8 border-b border-slate-50">
                <h3 className="text-xl font-black text-slate-800">Prévia do Card</h3>
                <p className="text-slate-400 text-xs font-medium">Como seus eleitores receberão a mensagem</p>
              </div>
              
              <div className="p-8 bg-slate-50">
                {selectedDate ? (
                  <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 aspect-[4/5] flex flex-col relative group">
                    {/* Background Decorativo ou Imagem Gerada */}
                    {generatedImage ? (
                      <div className="absolute inset-0 z-0">
                        <img src={generatedImage} alt={selectedDate.title} className="w-full h-full object-cover opacity-30" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/40 to-white/90"></div>
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10 pointer-events-none"></div>
                    )}
                    
                    <div className="p-10 flex-1 flex flex-col items-center justify-center text-center relative z-10">
                      {!generatedImage && (
                        <div className="w-24 h-24 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl mb-8 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                          {selectedDate.category === 'feriado' ? <Star size={48} /> : 
                           selectedDate.category === 'social' ? <Heart size={48} /> : <Gift size={48} />}
                        </div>
                      )}
                      
                      <h2 className="text-3xl font-black text-slate-900 mb-6 leading-tight uppercase tracking-tight">{selectedDate.title}</h2>
                      
                      <div className="w-12 h-1 bg-indigo-600 rounded-full mb-8"></div>
                      
                      <p className="text-lg font-medium text-slate-600 leading-relaxed italic">
                        "{selectedDate.message}"
                      </p>
                    </div>
                    
                    <div className="p-8 bg-slate-900 text-white flex flex-col items-center text-center relative z-10">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center"><Star size={16} /></div>
                        <span className="font-black text-sm tracking-widest uppercase">{profile.name}</span>
                      </div>
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{profile.party} • {profile.office}</p>
                      <p className="text-[9px] text-slate-500 mt-4 italic">"{profile.slogan}"</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-100 rounded-3xl border-2 border-dashed border-slate-200 aspect-[4/5] flex flex-col items-center justify-center text-center p-10">
                    <Calendar className="text-slate-300 mb-4" size={64} />
                    <h4 className="font-black text-slate-400">Selecione uma data</h4>
                    <p className="text-slate-300 text-sm">Clique em uma data ao lado para visualizar o card comemorativo personalizado.</p>
                  </div>
                )}
              </div>

              <div className="p-8 bg-white border-t border-slate-50 space-y-4">
                <div className="flex gap-4">
                  <button 
                    disabled={!selectedDate || isGenerating}
                    onClick={handleGenerateImage}
                    className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
                  >
                    {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <ImageIcon size={18} />}
                    {generatedImage ? 'Regerar Imagem' : 'Gerar Imagem IA'}
                  </button>
                  <button 
                    disabled={!selectedDate}
                    className="p-4 bg-slate-100 text-slate-400 rounded-2xl hover:bg-slate-200 transition-all active:scale-95 disabled:opacity-50"
                    title="Baixar Card (Imagem)"
                    onClick={() => alert('Funcionalidade de exportação de imagem em desenvolvimento.')}
                  >
                    <Download size={20} />
                  </button>
                </div>

                <div className="h-px bg-slate-100 w-full"></div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Filter size={14} /> Filtro de Público
                    </h4>
                    <button 
                      onClick={() => setShowFilters(!showFilters)}
                      className="text-[10px] font-black text-indigo-600 uppercase hover:underline"
                    >
                      {showFilters ? 'Ocultar' : 'Ajustar'}
                    </button>
                  </div>

                  {showFilters && (
                    <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Gênero</label>
                        <select 
                          value={filterGender}
                          onChange={(e) => setFilterGender(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-indigo-500"
                        >
                          <option value="all">Todos</option>
                          <option value="Masculino">Masculino</option>
                          <option value="Feminino">Feminino</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Bairro</label>
                        <select 
                          value={filterNeighborhood}
                          onChange={(e) => setFilterNeighborhood(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-indigo-500"
                        >
                          <option value="all">Todos</option>
                          {neighborhoods.map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>
                    </div>
                  )}

                  <button 
                    disabled={!selectedDate || filteredVoters.length === 0}
                    onClick={() => selectedDate && handleBulkSend(selectedDate)}
                    className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                  >
                    <MessageSquare size={18} /> Enviar para {filteredVoters.length} Eleitores
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden group">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <Users size={20} className="text-indigo-200" />
                  <h4 className="font-black uppercase tracking-widest text-xs">Público Selecionado</h4>
                </div>
                <div className="text-4xl font-black mb-2">{filteredVoters.length}</div>
                <p className="text-indigo-100 text-sm font-medium">Eleitores que atendem aos filtros atuais.</p>
                <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Engajamento Sugerido</span>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(i => <Heart key={i} size={12} className="fill-white text-white" />)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommemorativeCalendar;
