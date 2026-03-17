
import React, { useState, useMemo } from 'react';
import { Expense } from '../types';
import { 
  Plus, 
  Trash2, 
  DollarSign, 
  Calendar, 
  Tag, 
  CreditCard, 
  TrendingDown, 
  PieChart, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  Search,
  X
} from 'lucide-react';

interface Props {
  expenses: Expense[];
  onAdd: (expense: Omit<Expense, 'id'>) => void;
  onDelete: (id: string) => void;
}

const CATEGORIES = {
  alimentacao: { label: 'Alimentação', color: 'bg-orange-100 text-orange-600', type: 'saida' },
  transporte: { label: 'Transporte', color: 'bg-blue-100 text-blue-600', type: 'saida' },
  marketing: { label: 'Marketing/Publicidade', color: 'bg-purple-100 text-purple-600', type: 'saida' },
  pessoal: { label: 'Pessoal', color: 'bg-pink-100 text-pink-600', type: 'saida' },
  eventos: { label: 'Eventos/Reuniões', color: 'bg-indigo-100 text-indigo-600', type: 'saida' },
  doacao: { label: 'Doação Recebida', color: 'bg-emerald-100 text-emerald-600', type: 'entrada' },
  recurso_proprio: { label: 'Recurso Próprio', color: 'bg-teal-100 text-teal-600', type: 'entrada' },
  partidario: { label: 'Fundo Partidário', color: 'bg-cyan-100 text-cyan-600', type: 'entrada' },
  outros: { label: 'Outros', color: 'bg-slate-100 text-slate-600', type: 'both' },
};

const PAYMENT_METHODS = {
  dinheiro: 'Dinheiro',
  cartao: 'Cartão',
  pix: 'PIX',
  transferencia: 'Transferência',
};

const ExpenseManager: React.FC<Props> = ({ expenses, onAdd, onDelete }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterType, setFilterType] = useState<'all' | 'entrada' | 'saida'>('all');
  
  const [formData, setFormData] = useState<Omit<Expense, 'id'>>({
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    type: 'saida',
    category: 'outros',
    paymentMethod: 'pix',
  });

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter(e => {
        const matchesSearch = e.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || e.category === filterCategory;
        const matchesType = filterType === 'all' || e.type === filterType;
        return matchesSearch && matchesCategory && matchesType;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, searchTerm, filterCategory, filterType]);

  const stats = useMemo(() => {
    const totalIn = expenses.filter(e => e.type === 'entrada').reduce((acc, curr) => acc + curr.amount, 0);
    const totalOut = expenses.filter(e => e.type === 'saida').reduce((acc, curr) => acc + curr.amount, 0);
    const balance = totalIn - totalOut;
    
    const thisMonthIn = expenses
      .filter(e => e.type === 'entrada' && new Date(e.date).getMonth() === new Date().getMonth())
      .reduce((acc, curr) => acc + curr.amount, 0);
    
    const thisMonthOut = expenses
      .filter(e => e.type === 'saida' && new Date(e.date).getMonth() === new Date().getMonth())
      .reduce((acc, curr) => acc + curr.amount, 0);
    
    const byCategory = expenses.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>);

    return { totalIn, totalOut, balance, thisMonthIn, thisMonthOut, byCategory };
  }, [expenses]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || formData.amount <= 0) return;
    onAdd(formData);
    setFormData({
      description: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      type: 'saida',
      category: 'outros',
      paymentMethod: 'pix',
    });
    setIsAdding(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-800">Fluxo de Caixa</h2>
          <p className="text-slate-400 font-medium mt-1">Gestão completa de entradas e saídas</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="px-6 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-3 active:scale-95"
        >
          <Plus size={18} /> Novo Lançamento
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-6">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center shadow-inner">
            <ArrowUpRight size={32} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Entradas</p>
            <h3 className="text-3xl font-black text-emerald-600">R$ {stats.totalIn.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-6">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center shadow-inner">
            <ArrowDownRight size={32} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Saídas</p>
            <h3 className="text-3xl font-black text-red-500">R$ {stats.totalOut.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
          </div>
        </div>

        <div className={`p-8 rounded-[2.5rem] shadow-xl border flex items-center gap-6 ${stats.balance >= 0 ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-red-600 border-red-500 text-white'}`}>
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shadow-inner">
            <DollarSign size={32} />
          </div>
          <div>
            <p className="text-[10px] font-black text-white/70 uppercase tracking-widest">Saldo Atual</p>
            <h3 className="text-3xl font-black">R$ {stats.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main List */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="text"
                  placeholder="Buscar lançamentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-6 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none font-bold text-slate-700 focus:border-indigo-500 transition-all"
                />
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <select 
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none font-bold text-slate-700 focus:border-indigo-500 transition-all text-xs"
                >
                  <option value="all">Todos Tipos</option>
                  <option value="entrada">Entradas</option>
                  <option value="saida">Saídas</option>
                </select>
                <select 
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none font-bold text-slate-700 focus:border-indigo-500 transition-all text-xs"
                >
                  <option value="all">Todas Categorias</option>
                  {Object.entries(CATEGORIES).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="divide-y divide-slate-50">
              {filteredExpenses.length === 0 ? (
                <div className="p-20 text-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="text-slate-200" size={40} />
                  </div>
                  <h4 className="text-xl font-black text-slate-400">Nenhum lançamento encontrado</h4>
                  <p className="text-slate-300">Registre suas movimentações para ter controle total.</p>
                </div>
              ) : (
                filteredExpenses.map((expense) => (
                  <div key={expense.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-all group">
                    <div className="flex items-center gap-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${CATEGORIES[expense.category]?.color || 'bg-slate-100 text-slate-600'}`}>
                        {expense.type === 'entrada' ? <ArrowUpRight size={24} /> : <ArrowDownRight size={24} />}
                      </div>
                      <div>
                        <h4 className="font-black text-slate-800">{expense.description}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                            <Calendar size={10} /> {new Date(expense.date).toLocaleDateString('pt-BR')}
                          </span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                            <CreditCard size={10} /> {PAYMENT_METHODS[expense.paymentMethod]}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className={`text-lg font-black ${expense.type === 'entrada' ? 'text-emerald-500' : 'text-red-500'}`}>
                          {expense.type === 'entrada' ? '+' : '-'} R$ {expense.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${CATEGORIES[expense.category]?.color || 'bg-slate-100 text-slate-600'}`}>
                          {CATEGORIES[expense.category]?.label || 'Outros'}
                        </span>
                      </div>
                      <button 
                        onClick={() => onDelete(expense.id)}
                        className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar / Form */}
        <div className="lg:col-span-4 space-y-6">
          {isAdding ? (
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 animate-in slide-in-from-right-4 duration-300">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black text-slate-800">Novo Lançamento</h3>
                <button onClick={() => setIsAdding(false)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex p-1 bg-slate-100 rounded-2xl">
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, type: 'entrada', category: 'doacao'})}
                    className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${formData.type === 'entrada' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
                  >
                    Entrada
                  </button>
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, type: 'saida', category: 'outros'})}
                    className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${formData.type === 'saida' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-400'}`}
                  >
                    Saída
                  </button>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Descrição</label>
                  <input 
                    required
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder={formData.type === 'entrada' ? 'Ex: Doação de apoiador' : 'Ex: Almoço com lideranças'}
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold text-slate-700 focus:border-indigo-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Valor (R$)</label>
                  <input 
                    required
                    type="number"
                    step="0.01"
                    value={formData.amount || ''}
                    onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
                    placeholder="0,00"
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold text-slate-700 focus:border-indigo-500 transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Data</label>
                    <input 
                      required
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold text-slate-700 focus:border-indigo-500 transition-all text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Categoria</label>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value as any})}
                      className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold text-slate-700 focus:border-indigo-500 transition-all text-xs"
                    >
                      {Object.entries(CATEGORIES)
                        .filter(([_, val]) => val.type === formData.type || val.type === 'both')
                        .map(([key, val]) => (
                        <option key={key} value={key}>{val.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Forma de Pagamento</label>
                  <select 
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({...formData, paymentMethod: e.target.value as any})}
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold text-slate-700 focus:border-indigo-500 transition-all"
                  >
                    {Object.entries(PAYMENT_METHODS).map(([key, val]) => (
                      <option key={key} value={key}>{val}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className={`w-full py-5 text-white rounded-2xl font-black text-lg transition-all active:scale-95 shadow-xl ${formData.type === 'entrada' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-100' : 'bg-red-500 hover:bg-red-600 shadow-red-100'}`}>
                  Salvar {formData.type === 'entrada' ? 'Receita' : 'Despesa'}
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
              <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                <PieChart className="text-indigo-500" /> Resumo do Mês
              </h3>
              <div className="space-y-6">
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Entradas</span>
                    <span className="text-xs font-black text-emerald-700">R$ {stats.thisMonthIn.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="h-1.5 w-full bg-emerald-200/30 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: '100%' }} />
                  </div>
                </div>

                <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Saídas</span>
                    <span className="text-xs font-black text-red-700">R$ {stats.thisMonthOut.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="h-1.5 w-full bg-red-200/30 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500" style={{ width: `${stats.thisMonthIn > 0 ? (stats.thisMonthOut / stats.thisMonthIn) * 100 : 100}%` }} />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Maiores Gastos</p>
                  <div className="space-y-3">
                    {Object.entries(CATEGORIES)
                      .filter(([_, val]) => val.type === 'saida')
                      .sort((a, b) => (stats.byCategory[b[0]] || 0) - (stats.byCategory[a[0]] || 0))
                      .slice(0, 3)
                      .map(([key, val]) => (
                        <div key={key} className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-600">{val.label}</span>
                          <span className="text-xs font-black text-slate-800">R$ {(stats.byCategory[key] || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseManager;
