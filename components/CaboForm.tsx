
import React, { useState, useEffect } from 'react';
import { CaboEleitoral } from '../types';
import { UserCheck, Save, X, MapPin, Phone, Target } from 'lucide-react';

interface Props {
  scope: 'municipal' | 'estadual';
  onSubmit: (data: Omit<CaboEleitoral, 'id' | 'hiredAt'>) => void;
  onCancel: () => void;
  initialData?: CaboEleitoral;
}

const CaboForm: React.FC<Props> = ({ scope, onSubmit, onCancel, initialData }) => {
  const [formData, setFormData] = useState<Omit<CaboEleitoral, 'id' | 'hiredAt'>>({
    name: '',
    phone: '',
    location: '',
    voterGoal: 100
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        phone: initialData.phone,
        location: initialData.location,
        voterGoal: initialData.voterGoal
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.location.trim() || !formData.phone.trim()) {
      alert("Por favor, preencha todos os campos obrigatórios para o cabo eleitoral.");
      return;
    }
    
    // Garantir que voterGoal seja um número
    const dataToSubmit = {
      ...formData,
      voterGoal: Number(formData.voterGoal) || 0
    };

    onSubmit(dataToSubmit);
    // Note: onCancel() is called within the onSubmit handler in App.tsx or here
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
          <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center shadow-inner">
            <UserCheck size={28} />
          </div>
          {initialData ? 'Editar Liderança' : 'Nova Liderança'}
        </h3>
        <p className="text-slate-400 text-sm mt-2 font-medium">Cadastre cabos eleitorais para expandir sua rede.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Nome Completo</label>
          <input 
            required
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-orange-500 outline-none font-bold transition-all text-slate-700"
            placeholder="Ex: Roberto Mendes"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Telefone / WhatsApp</label>
            <input 
              required
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-orange-500 outline-none font-bold transition-all text-slate-700"
              placeholder="(00) 00000-0000"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Meta Individual</label>
            <div className="relative">
              <Target size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
              <input 
                type="number"
                value={formData.voterGoal}
                onChange={(e) => setFormData({...formData, voterGoal: parseInt(e.target.value) || 0})}
                className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-orange-500 outline-none font-bold transition-all text-slate-700"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
            {scope === 'municipal' ? 'Bairro de Atuação' : 'Cidade de Atuação'}
          </label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
            <input 
              required
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-orange-500 outline-none font-bold transition-all text-slate-700"
              placeholder={scope === 'municipal' ? "Ex: Centro" : "Ex: São Paulo"}
            />
          </div>
        </div>

        <div className="pt-4 flex gap-4">
          <button type="button" onClick={onCancel} className="flex-1 py-5 bg-slate-100 text-slate-400 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-200 transition-all">Cancelar</button>
          <button type="submit" className="flex-[2] py-5 bg-orange-500 text-white rounded-2xl font-black text-lg hover:bg-orange-600 shadow-xl shadow-orange-100 transition-all flex items-center justify-center gap-3 active:scale-95">
            <Save size={20} /> Salvar Liderança
          </button>
        </div>
      </form>
    </div>
  );
};

export default CaboForm;
