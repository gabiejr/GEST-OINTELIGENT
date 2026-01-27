
import React, { useState, useMemo } from 'react';
import { Appointment, Voter, PoliticalProfile } from '../types';
import { exportAgendaPDF } from '../services/pdf';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  X, 
  Save, 
  Edit3, 
  FileDown,
  Loader2,
  CheckCircle,
  Search,
  MessageSquare,
  Send,
  Bell,
  Sparkles,
  Phone
} from 'lucide-react';

interface Props {
  appointments: Appointment[];
  voters: Voter[];
  profile: PoliticalProfile;
  onAdd: (appointment: Omit<Appointment, 'id'>) => void;
  onUpdate: (id: string, appointment: Omit<Appointment, 'id'>) => void;
  onUpdateStatus: (id: string, status: Appointment['status']) => void;
  onDelete: (id: string) => void;
}

const AgendaManager: React.FC<Props> = ({ appointments, voters, profile, onAdd, onUpdate, onUpdateStatus, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [lastSavedApt, setLastSavedApt] = useState<Appointment | null>(null);
  
  const [formData, setFormData] = useState<Omit<Appointment, 'id'>>({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    location: '',
    voterId: '',
    status: 'pending',
    type: 'visita'
  });

  const groupedAppointments = useMemo<Record<string, Appointment[]>>(() => {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    const filtered = appointments.filter(a => {
      const matchesStatus = filterStatus === 'all' ? true : a.status === filterStatus;
      const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           a.location.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    }).sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA.getTime() - dateB.getTime();
    });

    return {
      hoje: filtered.filter(a => a.date === today),
      amanha: filtered.filter(a => a.date === tomorrow),
      futuro: filtered.filter(a => a.date > tomorrow),
      passado: filtered.filter(a => a.date < today)
    };
  }, [appointments, filterStatus, searchTerm]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setSaveSuccess(false);
    setIsSaving(false);
    setLastSavedApt(null);
    setFormData({
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      location: '',
      voterId: '',
      status: 'pending',
      type: 'visita'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (apt: Appointment) => {
    setEditingId(apt.id);
    setSaveSuccess(false);
    setIsSaving(false);
    setLastSavedApt(null);
    setFormData({
      title: apt.title,
      description: apt.description,
      date: apt.date,
      time: apt.time,
      location: apt.location,
      voterId: apt.voterId || '',
      status: apt.status,
      type: apt.type
    });
    setIsModalOpen(true);
  };

  const handleSendReminder = (apt: Appointment | Omit<Appointment, 'id'>) => {
    if (!profile.phone) {
      alert("ATENÇÃO: Você precisa configurar o número de WhatsApp do Político nas configurações de Perfil para enviar avisos.");
      return;
    }

    const dateFormatted = new Date(apt.date).toLocaleDateString('pt-BR');
    const message = `🔔 *AVISO DE AGENDA*\n\nOlá, *${profile.name}*!\n\nEste é um aviso do seu sistema de gestão sobre um compromisso agendado:\n\n📌 *ATIVIDADE:* ${apt.title}\n📅 *DATA:* ${dateFormatted}\n⏰ *HORA:* ${apt.time}\n📍 *LOCAL:* ${apt.location}\n\n📝 *NOTAS:* ${apt.description || 'Nenhuma observação extra.'}\n\n_Favor confirmar recebimento deste aviso._`;
    
    const whatsappUrl = `https://wa.me/${profile.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleSubmit = (e: React.FormEvent, notify: boolean = false) => {
    e.preventDefault();
    if (!formData.title || !formData.date) return;

    setIsSaving(true);
    
    // Simulação de delay para feedback visual
    setTimeout(() => {
      let savedData: Appointment;
      if (editingId) {
        onUpdate(editingId, formData);
        savedData = { ...formData, id: editingId };
      } else {
        const id = crypto.randomUUID();
        onAdd(formData);
        savedData = { ...formData, id };
      }
      
      setLastSavedApt(savedData);
      setIsSaving(false);
      setSaveSuccess(true);

      if (notify) {
        handleSendReminder(savedData);
      }

      setTimeout(() => {
        if (!notify) {
          setIsModalOpen(false);
          setSaveSuccess(false);
        }
      }, 1500);
    }, 600);
  };

  const getVoter = (id?: string) => {
    if (!id) return null;
    return voters.find(v => v.id === id);
  };

  const getTypeStyle = (type: Appointment['type']) => {
    switch (type) {
      case 'visita': return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100', icon: 'bg-blue-500' };
      case 'reuniao': return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-100', icon: 'bg-purple-500' };
      case 'evento': return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-100', icon: 'bg-orange-500' };
      default: return { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-100', icon: 'bg-slate-500' };
    }
  };

  const AppointmentCard: React.FC<{ apt: Appointment }> = ({ apt }) => {
    const style = getTypeStyle(apt.type);
    const voter = getVoter(apt.voterId);

    return (
      <div className={`bg-white p-6 rounded-[2rem] border-2 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-xl hover:shadow-indigo-500/5 ${apt.status === 'completed' ? 'opacity-60 grayscale border-slate-100' : 'border-white shadow-sm'}`}>
        <div className="flex items-start md:items-center gap-6 flex-1">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${style.icon} shrink-0`}>
            {apt.type === 'visita' && <User size={24} />}
            {apt.type === 'reuniao' && <Calendar size={24} />}
            {apt.type === 'evento' && <SparklesIcon size={24} />}
            {apt.type === 'outro' && <AlertCircle size={24} />}
          </div>
          
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${style.bg} ${style.text}`}>
                {apt.type}
              </span>
              <h4 className="font-black text-slate-800 text-lg truncate">{apt.title}</h4>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md"><Clock size={12} className="text-indigo-500" /> {apt.time}</span>
              <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md"><MapPin size={12} className="text-indigo-500" /> {apt.location}</span>
              {voter && (
                <div className="flex items-center gap-2 text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                  <User size={12} /> {voter.name}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto shrink-0 flex-wrap">
          <button 
            onClick={() => handleSendReminder(apt)}
            title="Enviar aviso direto para o WhatsApp do Político"
            className="flex-1 md:flex-none px-4 py-3 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-xl transition-all flex items-center justify-center gap-2 font-black text-[10px] uppercase border border-emerald-100 shadow-sm"
          >
            <Phone size={16} /> Aviso WhatsApp
          </button>

          <button 
            onClick={() => handleOpenEdit(apt)}
            className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
          >
            <Edit3 size={18} />
          </button>

          {apt.status === 'pending' ? (
            <button 
              onClick={() => onUpdateStatus(apt.id, 'completed')}
              className="px-5 py-3 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl transition-all flex items-center justify-center gap-2 font-black text-[10px] uppercase border border-indigo-100"
            >
              <CheckCircle2 size={16} /> Concluir
            </button>
          ) : (
            <button 
              onClick={() => onUpdateStatus(apt.id, 'pending')}
              className="px-5 py-3 bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white rounded-xl transition-all flex items-center justify-center gap-2 font-black text-[10px] uppercase border border-amber-100"
            >
              <AlertCircle size={16} /> Reabrir
            </button>
          )}
          
          <button 
            onClick={() => onDelete(apt.id)}
            className="p-3 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    );
  };

  const AppointmentSection: React.FC<{ title: string; appointments: Appointment[]; color: string }> = ({ title, appointments, color }) => {
    if (appointments.length === 0) return null;
    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-3 px-4">
          <div className={`w-2 h-8 rounded-full ${color}`} />
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">{title}</h3>
          <span className="text-xs font-bold text-slate-300 ml-auto">{appointments.length} compromissos</span>
        </div>
        <div className="space-y-4">
          {appointments.map(apt => <AppointmentCard key={apt.id} apt={apt} />)}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">Minhas Agendas</h2>
          <p className="text-slate-400 text-sm font-medium">Cronograma estratégico com avisos via WhatsApp do Político.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar compromisso..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none font-bold text-slate-700 focus:border-indigo-500 transition-all shadow-sm"
            />
          </div>

          <button 
            onClick={() => exportAgendaPDF(appointments, profile)}
            className="p-3 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
          >
            <FileDown size={20} />
          </button>

          <button 
            onClick={handleOpenAdd}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-indigo-500/20 transition-all active:scale-95"
          >
            <Plus size={18} /> Novo Compromisso
          </button>
        </div>
      </div>

      <div className="space-y-12">
        {appointments.length === 0 ? (
          <div className="bg-white p-24 rounded-[3rem] border border-dashed border-slate-200 text-center flex flex-col items-center justify-center text-slate-400">
            <Calendar size={80} className="mb-6 opacity-10" />
            <h3 className="text-xl font-black text-slate-600">Sua agenda está vazia</h3>
            <p className="max-w-xs mx-auto mt-2 text-sm">Adicione visitas e envie os avisos diretamente para o WhatsApp do candidato.</p>
          </div>
        ) : (
          <>
            <AppointmentSection title="Hoje" appointments={groupedAppointments.hoje} color="bg-indigo-500" />
            <AppointmentSection title="Amanhã" appointments={groupedAppointments.amanha} color="bg-blue-400" />
            <AppointmentSection title="Próximos Dias" appointments={groupedAppointments.futuro} color="bg-emerald-400" />
            <AppointmentSection title="Passados" appointments={groupedAppointments.passado} color="bg-slate-300" />
          </>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6 animate-in fade-in duration-300">
          <div className="w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl relative animate-in zoom-in-95 duration-300 overflow-hidden">
            {saveSuccess ? (
              <div className="flex flex-col items-center justify-center py-24 bg-gradient-to-br from-emerald-50 to-white text-center p-8">
                <div className="w-24 h-24 bg-emerald-500 text-white rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-200">
                  <CheckCircle size={60} className="animate-in zoom-in duration-500" />
                </div>
                <h3 className="text-3xl font-black text-slate-800">Agendado com Sucesso!</h3>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2 mb-8">Envie agora o aviso para o WhatsApp do Político</p>
                
                <div className="flex flex-col w-full gap-3">
                   <button 
                    onClick={() => { if(lastSavedApt) handleSendReminder(lastSavedApt); setIsModalOpen(false); }}
                    className="w-full py-5 bg-emerald-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-emerald-100 flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all active:scale-95"
                   >
                     <Phone size={24} /> Enviar Aviso WhatsApp
                   </button>
                   <button 
                    onClick={() => { setIsModalOpen(false); setSaveSuccess(false); }}
                    className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-200 transition-all"
                   >
                     Fechar sem enviar
                   </button>
                </div>
              </div>
            ) : (
              <div className="p-10">
                <div className="flex justify-between items-center mb-10">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
                      {editingId ? <Edit3 size={32} /> : <Calendar size={32} />}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-800 leading-tight">
                        {editingId ? 'Editar Compromisso' : 'Novo Compromisso'}
                      </h3>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Informações de Agenda</p>
                    </div>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                    <X size={28} />
                  </button>
                </div>
                
                <form className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Título do Compromisso</label>
                      <input 
                        required
                        disabled={isSaving}
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none font-bold text-slate-700"
                        placeholder="Ex: Visita ao Bairro Jardim Europa"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Data</label>
                      <input 
                        type="date"
                        required
                        disabled={isSaving}
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none font-bold text-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Horário</label>
                      <input 
                        type="time"
                        required
                        disabled={isSaving}
                        value={formData.time}
                        onChange={(e) => setFormData({...formData, time: e.target.value})}
                        className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none font-bold text-slate-700"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Localização</label>
                      <input 
                        required
                        disabled={isSaving}
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none font-bold text-slate-700"
                        placeholder="Endereço ou Local da Visita"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Observações para o Político</label>
                      <textarea 
                        rows={3}
                        disabled={isSaving}
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none font-bold text-slate-700 resize-none"
                        placeholder="Principais demandas ou nomes das pessoas que estarão presentes..."
                      />
                    </div>
                  </div>

                  <div className="pt-8 flex flex-col sm:flex-row gap-4">
                    <button 
                      type="button" 
                      onClick={(e) => handleSubmit(e, true)}
                      disabled={isSaving}
                      className="flex-1 py-5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:shadow-xl shadow-emerald-100 transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                      {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Phone size={18} />}
                      Agendar e Enviar Aviso WhatsApp
                    </button>
                    <button 
                      type="button"
                      onClick={(e) => handleSubmit(e, false)}
                      disabled={isSaving}
                      className="flex-1 py-5 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                      {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                      Apenas Agendar
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const SparklesIcon: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path><path d="M5 3v4"></path><path d="M19 17v4"></path><path d="M3 5h4"></path><path d="M17 19h4"></path></svg>
);

export default AgendaManager;
