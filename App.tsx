
import React, { useState, useEffect, useMemo } from 'react';
import { Voter, VoterFormData, HelpRecord, PoliticalProfile, CaboEleitoral } from './types';
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
import { exportVotersToPDF, exportVoterHistoryPDF } from './services/pdf';
import { 
  Users, 
  UserPlus, 
  LayoutDashboard, 
  Search,
  Bell,
  Heart,
  HandHelping,
  Trophy,
  ArrowRight,
  LogOut,
  Settings,
  X,
  ShieldCheck,
  UserCheck,
  Sparkles,
  MessageSquare,
  FileDown,
  Home,
  Eye,
  EyeOff,
  Lock,
  Gift,
  BrainCircuit,
  FileBarChart
} from 'lucide-react';

// Senha de acesso administrativo conforme solicitado
const ADMIN_PASSWORD = '123';

// Perfil padrão atualizado para Elias da Fonte
const DEFAULT_PROFILE: PoliticalProfile = {
  name: 'Elias da Fonte',
  party: 'Independente',
  office: 'Candidato',
  scope: 'municipal',
  slogan: 'Trabalhando pela comunidade',
  voteGoal: 1000
};

const App: React.FC = () => {
  // Estado de Autenticação
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState(false);
  
  const [politicalProfile, setPoliticalProfile] = useState<PoliticalProfile>(DEFAULT_PROFILE);
  const [voters, setVoters] = useState<Voter[]>([]);
  const [cabos, setCabos] = useState<CaboEleitoral[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'list' | 'family' | 'add' | 'edit' | 'help' | 'profile' | 'cabos' | 'bulk' | 'birthdays' | 'advisor' | 'reports'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingVoter, setEditingVoter] = useState<Voter | null>(null);
  const [editingCabo, setEditingCabo] = useState<CaboEleitoral | null>(null);
  const [isCaboModalOpen, setIsCaboModalOpen] = useState(false);

  // Carregar dados iniciais e verificar sessão
  useEffect(() => {
    const savedVoters = localStorage.getItem('voters_data');
    if (savedVoters) setVoters(JSON.parse(savedVoters));
    
    const savedCabos = localStorage.getItem('cabos_data');
    if (savedCabos) setCabos(JSON.parse(savedCabos));

    const savedProfile = localStorage.getItem('political_profile');
    if (savedProfile) {
      setPoliticalProfile(JSON.parse(savedProfile));
    } else {
      localStorage.setItem('political_profile', JSON.stringify(DEFAULT_PROFILE));
    }

    const sessionAuth = sessionStorage.getItem('admin_auth');
    if (sessionAuth === 'true') setIsAuthenticated(true);
  }, []);

  // Persistência automática no localStorage
  useEffect(() => {
    localStorage.setItem('voters_data', JSON.stringify(voters));
  }, [voters]);

  useEffect(() => {
    localStorage.setItem('cabos_data', JSON.stringify(cabos));
  }, [cabos]);

  useEffect(() => {
    localStorage.setItem('political_profile', JSON.stringify(politicalProfile));
  }, [politicalProfile]);

  // Lógica de Login (Acesso Principal)
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

  /**
   * FUNÇÃO: VOLTAR AO INÍCIO
   * Redireciona o usuário para a tela de login inicial.
   */
  const handleLogoutLogic = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_auth');
    setActiveTab('dashboard'); // Resetar aba para quando logar novamente
  };

  // Botão "Voltar ao Início" direciona para o Login limpando a sessão
  const handleBackToStart = () => {
    handleLogoutLogic();
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
      voteGoal: parseInt(formData.get('voteGoal') as string) || 0
    };
    setPoliticalProfile(profile);
    setActiveTab('dashboard');
  };

  const addVoter = (data: VoterFormData) => {
    const newVoter: Voter = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      helpRecords: []
    };
    setVoters(prev => [newVoter, ...prev]);
    setActiveTab(newVoter.isFamilyMember ? 'family' : 'list');
  };

  const updateVoter = (data: VoterFormData) => {
    if (!editingVoter) return;
    setVoters(prev => prev.map(v => v.id === editingVoter.id ? { ...v, ...data } : v));
    setEditingVoter(null);
    setActiveTab('list');
  };

  const deleteVoter = (id: string) => {
    if (window.confirm('Excluir este eleitor permanentemente?')) {
      setVoters(prev => prev.filter(v => v.id !== id));
    }
  };

  const addCabo = (data: Omit<CaboEleitoral, 'id' | 'hiredAt'>) => {
    const newCabo: CaboEleitoral = {
      ...data,
      id: crypto.randomUUID(),
      hiredAt: new Date().toISOString()
    };
    setCabos(prev => [newCabo, ...prev]);
    setEditingCabo(null);
    setIsCaboModalOpen(false);
  };

  const updateCabo = (data: Omit<CaboEleitoral, 'id' | 'hiredAt'>) => {
    if (!editingCabo) return;
    setCabos(prev => prev.map(c => c.id === editingCabo.id ? { ...c, ...data } : c));
    setEditingCabo(null);
    setIsCaboModalOpen(false);
  };

  const deleteCabo = (id: string) => {
    if (window.confirm('Remover esta liderança da equipe?')) {
      setCabos(prev => prev.filter(c => c.id !== id));
    }
  };

  const addHelpRecord = (voterId: string, record: Omit<HelpRecord, 'id'>) => {
    const newRecord = { ...record, id: crypto.randomUUID() };
    setVoters(prev => prev.map(v => v.id === voterId ? { ...v, helpRecords: [...(v.helpRecords || []), newRecord] } : v));
  };

  const deleteHelpRecord = (voterId: string, recordId: string) => {
    setVoters(prev => prev.map(v => v.id === voterId ? { ...v, helpRecords: (v.helpRecords || []).filter(r => r.id !== recordId) } : v));
  };

  const filteredVotersList = useMemo(() => {
    let list = voters;
    if (activeTab === 'family') list = list.filter(v => v.isFamilyMember);
    return list.filter(v => 
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.neighborhood.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [voters, searchTerm, activeTab]);

  const birthdayVoters = useMemo(() => {
    const today = new Date();
    return voters.filter(v => {
      const parts = v.birthDate.split('-').map(Number);
      return parts[1] === (today.getMonth() + 1) && parts[2] === today.getDate();
    });
  }, [voters]);

  const handleExportVoters = () => {
    if (!politicalProfile) return;
    exportVotersToPDF(filteredVotersList, politicalProfile);
  };

  // TELA DE ACESSO PRINCIPAL (LOGIN)
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
              <input 
                type={showPassword ? "text" : "password"} 
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className={`w-full pl-12 pr-14 py-5 bg-white/5 border-2 ${loginError ? 'border-red-500 animate-pulse' : 'border-white/10 focus:border-indigo-500'} rounded-2xl outline-none text-white text-xl font-bold transition-all text-center tracking-widest`}
                placeholder="SENHA"
                autoFocus
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white p-2"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            
            {loginError && (
              <p className="text-red-400 text-xs text-center font-bold animate-in fade-in slide-in-from-top-1">
                Acesso Negado: Senha Incorreta.
              </p>
            )}
            
            <button 
              type="submit" 
              className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-lg transition-all shadow-xl shadow-indigo-900/20 active:scale-95 flex items-center justify-center gap-3"
            >
              Entrar no Sistema <ArrowRight size={20} />
            </button>
          </form>
          
          <div className="mt-12 flex items-center justify-center gap-2 opacity-30">
            <ShieldCheck size={14} className="text-white" />
            <p className="text-[10px] text-white font-bold uppercase tracking-widest">Segurança de Dados Ativada</p>
          </div>
        </div>
      </div>
    );
  }

  // INTERFACE DO PAINEL DE CONTROLE
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <nav className="w-full md:w-72 bg-slate-900 text-white flex-shrink-0 shadow-2xl flex flex-col relative z-20">
        <div className="p-8 pb-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Trophy className="text-white" size={32} />
            </div>
            <div className="overflow-hidden">
              <h1 className="text-xl font-black truncate leading-tight">{politicalProfile.name}</h1>
              <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck size={12} /> Painel Administrativo
              </p>
            </div>
          </div>
          <div className="h-px bg-white/10 w-full mb-6"></div>
        </div>

        <div className="flex-1 px-4 space-y-2">
          <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={20}/>} label="Dashboard" />
          <NavButton active={activeTab === 'advisor'} onClick={() => setActiveTab('advisor')} icon={<BrainCircuit size={20}/>} label="Consultoria IA" color="indigo-glow" />
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
          <div className="bg-white/5 rounded-3xl p-5 border border-white/10 mb-4 backdrop-blur-sm">
            <p className="text-indigo-400 text-[9px] font-black uppercase mb-1">Base Consolidada</p>
            <p className="text-3xl font-black">{voters.length + cabos.length}</p>
          </div>
          
          <div className="space-y-2">
            <button 
              onClick={handleBackToStart} 
              className="w-full py-4 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-2xl text-[11px] font-black uppercase transition-all flex items-center justify-center gap-3 border border-white/10 group active:scale-95 shadow-lg"
            >
              <Home size={16} className="group-hover:scale-110 transition-transform" /> 
              Voltar ao Início
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto bg-slate-50">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-5 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-4">
             <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Gestor Estratégico</h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative w-full max-w-[300px] hidden lg:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Pesquisar..."
                className="w-full pl-12 pr-6 py-3 bg-slate-100 rounded-2xl outline-none font-medium transition-all focus:bg-white shadow-inner"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative group p-3 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-colors cursor-pointer">
              <Bell className="text-slate-600" size={22} />
              {birthdayVoters.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black animate-pulse border-2 border-white">{birthdayVoters.length}</span>}
            </div>
          </div>
        </header>

        <div className="p-10">
          {activeTab === 'dashboard' && (
            <div className="space-y-10 animate-in fade-in duration-700">
              <Dashboard 
                voters={voters} 
                cabos={cabos} 
                voteGoal={politicalProfile.voteGoal || 0} 
                scope={politicalProfile.scope} 
                onEditGoal={() => setActiveTab('profile')} 
              />
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-7"><NeighborhoodChart voters={voters} /></div>
                <div className="lg:col-span-5"><BirthdayWidget voters={voters} /></div>
              </div>
            </div>
          )}

          {activeTab === 'advisor' && (
            <AIAdvisor profile={politicalProfile} />
          )}

          {activeTab === 'reports' && (
            <ReportsCenter voters={voters} cabos={cabos} profile={politicalProfile} />
          )}

          {activeTab === 'bulk' && (
            <BulkMessenger voters={voters} profile={politicalProfile} />
          )}

          {activeTab === 'birthdays' && (
            <div className="animate-in fade-in duration-500 space-y-8">
              <h2 className="text-4xl font-black text-slate-800">Aniversariantes do Mês</h2>
              <BirthdayWidget voters={voters} />
            </div>
          )}

          {activeTab === 'cabos' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="flex justify-between items-center">
                <h2 className="text-4xl font-black text-slate-800 tracking-tight">Equipe de Lideranças</h2>
                <button onClick={() => { setEditingCabo(null); setIsCaboModalOpen(true); }} className="px-8 py-4 bg-orange-500 text-white rounded-2xl font-black shadow-lg hover:bg-orange-600 transition-all flex items-center gap-2">
                  <UserPlus size={20} /> Adicionar Cabo
                </button>
              </div>
              <CaboList cabos={cabos} voters={voters} onDelete={deleteCabo} onEdit={(c) => { setEditingCabo(c); setIsCaboModalOpen(true); }} scope={politicalProfile.scope} />
              {isCaboModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-6 animate-in fade-in duration-200">
                  <div className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl relative">
                    <button onClick={() => setIsCaboModalOpen(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600">
                      <X size={24} />
                    </button>
                    <CaboForm scope={politicalProfile.scope} onSubmit={editingCabo ? updateCabo : addCabo} onCancel={() => setIsCaboModalOpen(false)} initialData={editingCabo || undefined} />
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'list' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="flex justify-between items-center">
                <h2 className="text-4xl font-black text-slate-800">Eleitores Cadastrados</h2>
                <button 
                  onClick={() => setActiveTab('reports')}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg active:scale-95"
                >
                  <FileBarChart size={18} /> Ver Todos os Relatórios
                </button>
              </div>
              <VoterList voters={filteredVotersList} onDelete={deleteVoter} onEdit={(v) => { setEditingVoter(v); setActiveTab('edit'); }} onManageHelp={(v) => { setEditingVoter(v); setActiveTab('help'); }} />
            </div>
          )}

          {(activeTab === 'add' || activeTab === 'edit') && (
            <div className="animate-in slide-in-from-right-4 duration-500">
              <VoterForm cabos={cabos} onSubmit={activeTab === 'edit' ? updateVoter : addVoter} onCancel={() => setActiveTab('list')} initialData={editingVoter || undefined} />
            </div>
          )}

          {activeTab === 'help' && (
            <div className="animate-in slide-in-from-right-4 duration-500">
              <HelpManager voters={voters} onAddHelp={addHelpRecord} onDeleteHelp={deleteHelpRecord} onExportHelp={(v) => exportVoterHistoryPDF(v, politicalProfile)} initialVoter={editingVoter} />
            </div>
          )}

          {activeTab === 'profile' && (
             <div className="max-w-2xl mx-auto bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-500">
                <h2 className="text-3xl font-black mb-10 flex items-center gap-4 text-slate-800"><Settings className="text-indigo-600" /> Perfil Político</h2>
                <form onSubmit={handleProfileSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Nome Político</label>
                      <input name="name" defaultValue={politicalProfile.name} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none font-bold" />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Cargo</label>
                      <input name="office" defaultValue={politicalProfile.office} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none font-bold" />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Meta Geral (Votos)</label>
                      <input type="number" name="voteGoal" defaultValue={politicalProfile.voteGoal} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none font-bold" />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Âmbito</label>
                      <select name="scope" defaultValue={politicalProfile.scope} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none font-bold">
                        <option value="municipal">Municipal</option>
                        <option value="estadual">Estadual</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-700 shadow-xl transition-all active:scale-95">Salvar Alterações</button>
                </form>
             </div>
          )}
        </div>
      </main>
    </div>
  );
};

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string; color?: string }> = ({ active, onClick, icon, label, color = 'indigo' }) => {
  let activeClass = 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 scale-[1.02]';
  if (color === 'pink') activeClass = 'bg-pink-600 text-white shadow-lg shadow-pink-500/20 scale-[1.02]';
  if (color === 'emerald') activeClass = 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 scale-[1.02]';
  if (color === 'orange') activeClass = 'bg-orange-500 text-white shadow-lg shadow-orange-500/20 scale-[1.02]';
  if (color === 'slate') activeClass = 'bg-slate-700 text-white shadow-lg shadow-slate-500/20 scale-[1.02]';
  if (color === 'indigo-glow') activeClass = 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 scale-[1.05] border border-white/20 ring-2 ring-indigo-500/20';
  
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold ${active ? activeClass : 'text-slate-400 hover:bg-white/5 hover:text-white active:scale-95'}`}>
      <span className={`${active ? 'scale-110' : ''} transition-transform`}>{icon}</span> 
      <span className="text-sm tracking-tight">{label}</span>
    </button>
  );
};

export default App;
