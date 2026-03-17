
import React, { useState, useEffect, useMemo } from 'react';
import { Voter, VoterFormData, HelpRecord, PoliticalProfile, CaboEleitoral, Appointment, Expense } from './types';
import VoterList from './components/VoterList';
import VoterForm from './components/VoterForm';
import CaboForm from './components/CaboForm';
import CaboList from './components/CaboList';
import BirthdayWidget from './components/BirthdayWidget';
import Dashboard from './components/Dashboard';
import NeighborhoodChart from './components/NeighborhoodChart';
import HelpManager from './components/HelpManager';
import BulkMessenger from './components/BulkMessenger';
import AIAdvisor from './components/AIAdvisor';
import ReportsCenter from './components/ReportsCenter';
import AgendaManager from './components/AgendaManager';
import PoliticalBot from './components/PoliticalBot';
import CommemorativeCalendar from './components/CommemorativeCalendar';
import ExpenseManager from './components/ExpenseManager';
import { exportVotersToPDF, exportVoterHistoryPDF } from './services/pdf';
import { 
  Users, 
  UserPlus, 
  LayoutDashboard, 
  Search,
  Heart,
  HandHelping,
  Trophy,
  ArrowRight,
  Settings,
  X,
  ShieldCheck,
  UserCheck,
  MessageSquare,
  Home,
  Eye,
  EyeOff,
  Lock,
  Gift,
  BrainCircuit,
  FileBarChart,
  Save,
  Flag,
  Target,
  CalendarDays,
  Phone,
  DollarSign
} from 'lucide-react';

const ADMIN_PASSWORD = '123';

const DEFAULT_PROFILE: PoliticalProfile = {
  name: 'Elias da Fonte',
  party: 'Independente',
  office: 'Candidato',
  scope: 'municipal',
  slogan: 'Trabalhando pela comunidade',
  voteGoal: 1000,
  phone: ''
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState(false);
  
  const [politicalProfile, setPoliticalProfile] = useState<PoliticalProfile>(DEFAULT_PROFILE);
  const [voters, setVoters] = useState<Voter[]>([]);
  const [cabos, setCabos] = useState<CaboEleitoral[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'list' | 'family' | 'add' | 'edit' | 'help' | 'profile' | 'cabos' | 'bulk' | 'birthdays' | 'advisor' | 'reports' | 'agenda' | 'calendar' | 'expenses'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingVoter, setEditingVoter] = useState<Voter | null>(null);
  const [editingCabo, setEditingCabo] = useState<CaboEleitoral | null>(null);
  const [isAddingCabo, setIsAddingCabo] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Carregar dados do servidor (baseado no IP) ao iniciar
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/data');
        const data = await response.json();
        if (data) {
          if (data.voters) setVoters(data.voters);
          if (data.cabos) setCabos(data.cabos);
          if (data.appointments) setAppointments(data.appointments);
          if (data.expenses) setExpenses(data.expenses);
          if (data.politicalProfile) setPoliticalProfile(data.politicalProfile);
        }
      } catch (error) {
        console.error("Erro ao carregar dados do servidor:", error);
        // Fallback para localStorage se o servidor falhar
        const savedVoters = localStorage.getItem('voters_data');
        if (savedVoters) setVoters(JSON.parse(savedVoters));
        const savedCabos = localStorage.getItem('cabos_data');
        if (savedCabos) setCabos(JSON.parse(savedCabos));
        const savedAppointments = localStorage.getItem('appointments_data');
        if (savedAppointments) setAppointments(JSON.parse(savedAppointments));
        const savedExpenses = localStorage.getItem('expenses_data');
        if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
        const savedProfile = localStorage.getItem('political_profile');
        if (savedProfile) setPoliticalProfile(JSON.parse(savedProfile));
      } finally {
        setIsLoaded(true);
      }
    };

    fetchData();

    const sessionAuth = sessionStorage.getItem('admin_auth');
    if (sessionAuth === 'true') setIsAuthenticated(true);
  }, []);

  // Salvar dados no servidor e no localStorage sempre que houver mudanças
  useEffect(() => {
    if (!isLoaded) return;

    const saveData = async () => {
      const dataToSave = {
        voters,
        cabos,
        appointments,
        expenses,
        politicalProfile
      };

      // Salvar no localStorage como backup
      localStorage.setItem('voters_data', JSON.stringify(voters));
      localStorage.setItem('cabos_data', JSON.stringify(cabos));
      localStorage.setItem('appointments_data', JSON.stringify(appointments));
      localStorage.setItem('expenses_data', JSON.stringify(expenses));
      localStorage.setItem('political_profile', JSON.stringify(politicalProfile));

      // Salvar no servidor (baseado no IP)
      try {
        await fetch('/api/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataToSave)
        });
      } catch (error) {
        console.error("Erro ao salvar dados no servidor:", error);
      }
    };

    const timeoutId = setTimeout(saveData, 1000); // Debounce de 1 segundo
    return () => clearTimeout(timeoutId);
  }, [voters, cabos, appointments, expenses, politicalProfile, isLoaded]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_auth', 'true');
      setLoginError(false);
      setPasswordInput('');
      setActiveTab('dashboard');
    } else {
      setLoginError(true);
      setPasswordInput('');
      setTimeout(() => setLoginError(false), 3000);
    }
  };

  const handleLogoutLogic = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_auth');
    setActiveTab('dashboard');
  };

  const addVoter = (data: VoterFormData) => {
    const newVoter: Voter = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString(), helpRecords: [] };
    setVoters(prev => [newVoter, ...prev]);
    setActiveTab(newVoter.isFamilyMember ? 'family' : 'list');
  };

  const updateVoter = (data: VoterFormData) => {
    if (!editingVoter) return;
    setVoters(prev => prev.map(v => v.id === editingVoter.id ? { ...v, ...data } : v));
    setEditingVoter(null);
    setActiveTab('list');
  };

  // Funções de Cabos
  const addCabo = (data: Omit<CaboEleitoral, 'id' | 'hiredAt'>) => {
    const newCabo: CaboEleitoral = { 
      ...data, 
      id: crypto.randomUUID(), 
      hiredAt: new Date().toISOString() 
    };
    setCabos(prev => [newCabo, ...prev]);
    setIsAddingCabo(false);
  };

  const updateCabo = (data: Omit<CaboEleitoral, 'id' | 'hiredAt'>) => {
    if (!editingCabo) return;
    setCabos(prev => prev.map(c => c.id === editingCabo.id ? { ...c, ...data } : c));
    setEditingCabo(null);
  };

  const deleteCabo = (id: string) => {
    if (confirm("Deseja realmente excluir esta liderança? Todos os eleitores vinculados ficarão sem cabo eleitoral.")) {
      setCabos(prev => prev.filter(c => c.id !== id));
      setVoters(prev => prev.map(v => v.caboId === id ? { ...v, caboId: undefined } : v));
    }
  };

  // Funções de Agenda
  const addAppointment = (data: Omit<Appointment, 'id'>) => {
    const newApt: Appointment = { ...data, id: crypto.randomUUID() };
    setAppointments(prev => [newApt, ...prev]);
  };

  const updateAppointment = (id: string, data: Omit<Appointment, 'id'>) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, ...data } : a));
  };

  const deleteAppointment = (id: string) => {
    if(confirm("Deseja realmente excluir este compromisso?")) {
      setAppointments(prev => prev.filter(a => a.id !== id));
    }
  };

  // Funções de Gastos
  const addExpense = (data: Omit<Expense, 'id'>) => {
    const newExpense: Expense = { ...data, id: crypto.randomUUID() };
    setExpenses(prev => [newExpense, ...prev]);
  };

  const deleteExpense = (id: string) => {
    if (confirm("Deseja realmente excluir este registro de gasto?")) {
      setExpenses(prev => prev.filter(e => e.id !== id));
    }
  };

  const updateAppointmentStatus = (id: string, status: Appointment['status']) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  const handleProfileSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const profile: PoliticalProfile = {
      name: formData.get('name') as string,
      party: formData.get('party') as string,
      office: formData.get('office') as string,
      scope: formData.get('scope') as 'municipal' | 'estadual',
      slogan: formData.get('slogan') as string,
      voteGoal: parseInt(formData.get('voteGoal') as string) || 0,
      phone: formData.get('phone') as string
    };
    setPoliticalProfile(profile);
    alert("Perfil da campanha salvo com sucesso!");
    setActiveTab('dashboard');
  };

  const filteredVotersList = useMemo(() => {
    let list = voters;
    if (activeTab === 'family') list = list.filter(v => v.isFamilyMember);
    return list.filter(v => 
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.neighborhood.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [voters, searchTerm, activeTab]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black">
        <div className="bg-white/10 backdrop-blur-xl w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden p-12 border border-white/10 animate-in fade-in zoom-in-95 duration-500">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-2xl mx-auto mb-6">
              <ShieldCheck size={40} />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">Gestor Eleitoral</h2>
            <p className="text-slate-400 font-medium mt-2">Acesso Administrativo Restrito</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
              <input type={showPassword ? "text" : "password"} value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className={`w-full pl-12 pr-14 py-5 bg-white/5 border-2 ${loginError ? 'border-red-500 animate-pulse' : 'border-white/10 focus:border-indigo-500'} rounded-2xl outline-none text-white text-xl font-bold transition-all text-center tracking-widest`} placeholder="SENHA" autoFocus />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white p-2">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {loginError && <p className="text-red-400 text-xs text-center font-bold">Acesso Negado.</p>}
            <button type="submit" className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-lg transition-all shadow-xl shadow-indigo-900/20 active:scale-95 flex items-center justify-center gap-3">
              Entrar no Sistema <ArrowRight size={20} />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative">
      <nav className="w-full md:w-72 bg-slate-900 text-white flex-shrink-0 shadow-2xl flex flex-col relative z-20">
        <div className="p-8 pb-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg"><Trophy className="text-white" size={32} /></div>
            <div className="overflow-hidden">
              <h1 className="text-xl font-black truncate leading-tight">{politicalProfile.name}</h1>
              <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><ShieldCheck size={12} /> Painel Administrativo</p>
            </div>
          </div>
          <div className="h-px bg-white/10 w-full mb-6"></div>
        </div>
        <div className="flex-1 px-4 space-y-2">
          <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={20}/>} label="Dashboard" />
          <NavButton active={activeTab === 'agenda'} onClick={() => setActiveTab('agenda')} icon={<CalendarDays size={20}/>} label="Minhas Agendas" color="indigo-glow" />
          <NavButton active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} icon={<CalendarDays size={20}/>} label="Datas Comemorativas" color="pink" />
          <NavButton active={activeTab === 'expenses'} onClick={() => setActiveTab('expenses')} icon={<DollarSign size={20}/>} label="Controle de Gastos" color="red" />
          <NavButton active={activeTab === 'advisor'} onClick={() => setActiveTab('advisor')} icon={<BrainCircuit size={20}/>} label="Consultoria IA" />
          <NavButton active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} icon={<FileBarChart size={20}/>} label="Relatórios PDF" color="emerald" />
          <NavButton active={activeTab === 'bulk'} onClick={() => setActiveTab('bulk')} icon={<MessageSquare size={20}/>} label="Envios em Massa" color="emerald" />
          <NavButton active={activeTab === 'birthdays'} onClick={() => setActiveTab('birthdays')} icon={<Gift size={20}/>} label="Aniversariantes" color="orange" />
          <NavButton active={activeTab === 'list'} onClick={() => setActiveTab('list')} icon={<Users size={20}/>} label="Lista de Eleitores" />
          <NavButton active={activeTab === 'cabos'} onClick={() => setActiveTab('cabos')} icon={<UserCheck size={20}/>} label="Minha Equipe" color="orange" />
          <NavButton active={activeTab === 'family'} onClick={() => setActiveTab('family')} icon={<Heart size={20}/>} label="Família" color="pink" />
          <NavButton active={activeTab === 'help'} onClick={() => setActiveTab('help')} icon={<HandHelping size={20}/>} label="Assistência Social" color="emerald" />
          <NavButton active={activeTab === 'add'} onClick={() => setActiveTab('add')} icon={<UserPlus size={20}/>} label="Novo Registro" />
          <NavButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<Settings size={20}/>} label="Ajustes Perfil" color="slate" />
        </div>
        <div className="p-6 mt-auto">
          <button onClick={handleLogoutLogic} className="w-full py-4 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-2xl text-[11px] font-black uppercase transition-all flex items-center justify-center gap-3 border border-white/10 group active:scale-95"><Home size={16} /> Sair do Painel</button>
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto bg-slate-50">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-5 flex justify-between items-center shadow-sm">
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Gestor Estratégico</h2>
          <div className="flex items-center gap-6">
            <div className="relative w-full max-w-[300px] hidden lg:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Pesquisar..." className="w-full pl-12 pr-6 py-3 bg-slate-100 rounded-2xl outline-none font-medium transition-all focus:bg-white shadow-inner" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>
        </header>

        <div className="p-10">
          {activeTab === 'dashboard' && (
            <div className="space-y-10 animate-in fade-in duration-700">
              <Dashboard voters={voters} cabos={cabos} voteGoal={politicalProfile.voteGoal || 0} scope={politicalProfile.scope} onEditGoal={() => setActiveTab('profile')} />
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-7"><NeighborhoodChart voters={voters} /></div>
                <div className="lg:col-span-5"><BirthdayWidget voters={voters} /></div>
              </div>
            </div>
          )}

          {activeTab === 'agenda' && (
            <AgendaManager 
              appointments={appointments}
              voters={voters}
              profile={politicalProfile}
              onAdd={addAppointment}
              onUpdate={updateAppointment}
              onUpdateStatus={updateAppointmentStatus}
              onDelete={deleteAppointment}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsCenter voters={voters} cabos={cabos} profile={politicalProfile} />
          )}
          
          {activeTab === 'advisor' && <AIAdvisor profile={politicalProfile} />}
          {activeTab === 'calendar' && <CommemorativeCalendar voters={voters} profile={politicalProfile} />}
          {activeTab === 'expenses' && <ExpenseManager expenses={expenses} onAdd={addExpense} onDelete={deleteExpense} />}
          {activeTab === 'bulk' && <BulkMessenger voters={voters} profile={politicalProfile} />}
          
          {activeTab === 'cabos' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-4xl font-black text-slate-800">Minha Equipe</h2>
                  <p className="text-slate-400 font-medium mt-1">Lideranças e cabos eleitorais estratégicos</p>
                </div>
                {!isAddingCabo && !editingCabo && (
                  <button 
                    onClick={() => setIsAddingCabo(true)}
                    className="px-6 py-4 bg-orange-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg shadow-orange-200 flex items-center gap-3 active:scale-95"
                  >
                    <UserPlus size={18} /> Nova Liderança
                  </button>
                )}
              </div>

              {(isAddingCabo || editingCabo) ? (
                <div className="max-w-2xl mx-auto bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100">
                  <CaboForm 
                    scope={politicalProfile.scope} 
                    onSubmit={editingCabo ? updateCabo : addCabo} 
                    onCancel={() => { setIsAddingCabo(false); setEditingCabo(null); }} 
                    initialData={editingCabo || undefined} 
                  />
                </div>
              ) : (
                <CaboList 
                  cabos={cabos} 
                  voters={voters} 
                  onDelete={deleteCabo} 
                  onEdit={(c) => setEditingCabo(c)} 
                  scope={politicalProfile.scope} 
                />
              )}
            </div>
          )}

          {activeTab === 'list' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="flex justify-between items-center"><h2 className="text-4xl font-black text-slate-800">Eleitores Cadastrados</h2></div>
              <VoterList voters={filteredVotersList} onDelete={(id) => setVoters(prev => prev.filter(v => v.id !== id))} onEdit={(v) => { setEditingVoter(v); setActiveTab('edit'); }} onManageHelp={(v) => { setEditingVoter(v); setActiveTab('help'); }} />
            </div>
          )}
          {(activeTab === 'add' || activeTab === 'edit') && <VoterForm cabos={cabos} onSubmit={activeTab === 'edit' ? updateVoter : addVoter} onCancel={() => setActiveTab('list')} initialData={editingVoter || undefined} />}
          {activeTab === 'help' && <HelpManager voters={voters} onAddHelp={(vid, rec) => setVoters(prev => prev.map(v => v.id === vid ? { ...v, helpRecords: [...(v.helpRecords || []), { ...rec, id: crypto.randomUUID() }] } : v))} onDeleteHelp={(vid, rid) => setVoters(prev => prev.map(v => v.id === vid ? { ...v, helpRecords: (v.helpRecords || []).filter(r => r.id !== rid) } : v))} onExportHelp={(v) => exportVoterHistoryPDF(v, politicalProfile)} initialVoter={editingVoter} />}
          
          {activeTab === 'profile' && (
             <div className="max-w-2xl mx-auto bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-500">
                <h2 className="text-3xl font-black mb-10 flex items-center gap-4 text-slate-800"><Settings className="text-indigo-600" /> Perfil Político</h2>
                <form onSubmit={handleProfileSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Nome Político</label>
                      <input name="name" required defaultValue={politicalProfile.name} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none font-bold" />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">WhatsApp para Lembretes</label>
                      <div className="relative">
                         <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" />
                         <input name="phone" required defaultValue={politicalProfile.phone} className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none font-bold" placeholder="(00) 00000-0000" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Partido</label>
                        <input name="party" required defaultValue={politicalProfile.party} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none font-bold" />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Cargo</label>
                        <input name="office" required defaultValue={politicalProfile.office} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none font-bold" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Meta Geral (Votos)</label>
                      <div className="relative">
                         <Target size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                         <input type="number" name="voteGoal" required defaultValue={politicalProfile.voteGoal} className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none font-bold" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Âmbito da Campanha</label>
                      <div className="relative">
                         <Flag size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                         <select name="scope" defaultValue={politicalProfile.scope} className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none font-bold appearance-none">
                            <option value="municipal">Municipal (Foco em Bairros)</option>
                            <option value="estadual">Estadual (Foco em Cidades)</option>
                         </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Slogan de Campanha</label>
                      <input name="slogan" defaultValue={politicalProfile.slogan} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none font-bold" placeholder="Frase que define seu compromisso" />
                    </div>
                  </div>
                  <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-700 shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3">
                    <Save size={20} /> Salvar Alterações de Perfil
                  </button>
                </form>
             </div>
          )}
        </div>
      </main>

      {/* Bot Assistente Elias */}
      <PoliticalBot appointments={appointments} voters={voters} profile={politicalProfile} />
    </div>
  );
};

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string; color?: string }> = ({ active, onClick, icon, label, color = 'indigo' }) => {
  let activeClass = 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20';
  if (color === 'emerald') activeClass = 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20';
  if (color === 'orange') activeClass = 'bg-orange-500 text-white shadow-lg shadow-orange-500/20';
  if (color === 'pink') activeClass = 'bg-pink-600 text-white shadow-lg shadow-pink-500/20';
  if (color === 'indigo-glow') activeClass = 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl ring-2 ring-white/20 scale-[1.02]';
  if (color === 'slate') activeClass = 'bg-slate-700 text-white shadow-lg shadow-slate-500/20';
  
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold ${active ? activeClass : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
      {icon} <span className="text-sm tracking-tight">{label}</span>
    </button>
  );
};

export default App;
