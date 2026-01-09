
import React, { useState, useEffect } from 'react';
import { Voter, VoterFormData, CaboEleitoral } from '../types';
import { Save, X, User, MapPin, Archive, Edit3, Heart, Users2, Venus, Mars, UserCheck } from 'lucide-react';

interface Props {
  onSubmit: (data: VoterFormData) => void;
  onCancel: () => void;
  initialData?: Voter;
  cabos: CaboEleitoral[];
}

const VoterForm: React.FC<Props> = ({ onSubmit, onCancel, initialData, cabos }) => {
  const [formData, setFormData] = useState<VoterFormData>({
    name: '',
    birthDate: '',
    gender: 'Masculino',
    phone: '',
    email: '',
    address: '',
    neighborhood: '',
    city: '',
    observations: '',
    isFamilyMember: false,
    caboId: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        birthDate: initialData.birthDate,
        gender: initialData.gender || 'Masculino',
        phone: initialData.phone,
        email: initialData.email,
        address: initialData.address,
        neighborhood: initialData.neighborhood,
        city: initialData.city || '',
        observations: initialData.observations,
        isFamilyMember: initialData.isFamilyMember || false,
        caboId: initialData.caboId || '',
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const toggleFamily = () => {
    setFormData(prev => ({ ...prev, isFamilyMember: !prev.isFamilyMember }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.birthDate || !formData.phone) {
      alert("Por favor, preencha os campos obrigatórios (Nome, Nascimento e Telefone)");
      return;
    }
    onSubmit(formData);
  };

  const isEditing = !!initialData;

  return (
    <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden mb-10">
      <div className={`p-8 text-white flex justify-between items-center ${isEditing ? (formData.isFamilyMember ? 'bg-pink-600' : 'bg-amber-600') : 'bg-indigo-600'}`}>
        <div>
          <h2 className="text-2xl font-black flex items-center gap-3">
            {isEditing ? <Edit3 size={28} /> : <User size={28} />} 
            {isEditing ? `Editando: ${initialData.name}` : 'Novo Cadastro de Eleitor'}
          </h2>
          <p className="text-white/60 text-sm font-medium mt-1">Preencha as informações detalhadas do eleitor.</p>
        </div>
        <button onClick={onCancel} className="bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-colors">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-10 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div 
            onClick={toggleFamily}
            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${formData.isFamilyMember ? 'border-pink-500 bg-pink-50' : 'border-slate-100 bg-slate-50'}`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${formData.isFamilyMember ? 'bg-pink-100 text-pink-600' : 'bg-white text-slate-400 shadow-sm'}`}>
                <Heart size={24} fill={formData.isFamilyMember ? "currentColor" : "none"} />
              </div>
              <div>
                <p className={`font-black text-sm ${formData.isFamilyMember ? 'text-pink-700' : 'text-slate-700'}`}>Membro da Família</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Acesso direto ao candidato</p>
              </div>
            </div>
            <div className={`w-12 h-6 rounded-full relative transition-colors ${formData.isFamilyMember ? 'bg-pink-500' : 'bg-slate-300'}`}>
               <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.isFamilyMember ? 'right-1' : 'left-1'}`} />
            </div>
          </div>

          <div className="p-5 rounded-2xl border-2 border-slate-100 bg-slate-50 flex flex-col gap-2 relative">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Liderança Responsável</label>
            <div className="flex items-center gap-3">
              <UserCheck size={20} className="text-orange-500" />
              <select 
                name="caboId" 
                value={formData.caboId} 
                onChange={handleChange}
                className="flex-1 bg-transparent font-bold text-slate-700 outline-none"
              >
                <option value="">Nenhuma liderança atribuída</option>
                {cabos.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <section>
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center"><Archive size={16} /></div>
            Dados Pessoais
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Nome Completo *</label>
              <input name="name" value={formData.name} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none font-bold transition-all" placeholder="Ex: João da Silva" />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Data de Nascimento *</label>
              <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none font-bold transition-all" />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Sexo / Gênero *</label>
              <div className="grid grid-cols-3 gap-3">
                <label className={`flex items-center justify-center gap-2 p-4 border-2 rounded-2xl cursor-pointer transition-all ${formData.gender === 'Masculino' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'}`}>
                  <input type="radio" name="gender" value="Masculino" checked={formData.gender === 'Masculino'} onChange={handleChange} className="hidden" />
                  <Mars size={20} /> <span className="text-[10px] font-black uppercase">Masc</span>
                </label>
                <label className={`flex items-center justify-center gap-2 p-4 border-2 rounded-2xl cursor-pointer transition-all ${formData.gender === 'Feminino' ? 'border-pink-500 bg-pink-50 text-pink-700' : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'}`}>
                  <input type="radio" name="gender" value="Feminino" checked={formData.gender === 'Feminino'} onChange={handleChange} className="hidden" />
                  <Venus size={20} /> <span className="text-[10px] font-black uppercase">Fem</span>
                </label>
                <label className={`flex items-center justify-center gap-2 p-4 border-2 rounded-2xl cursor-pointer transition-all ${formData.gender === 'Outro' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'}`}>
                  <input type="radio" name="gender" value="Outro" checked={formData.gender === 'Outro'} onChange={handleChange} className="hidden" />
                  <Users2 size={20} /> <span className="text-[10px] font-black uppercase">Outro</span>
                </label>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Telefone / WhatsApp *</label>
              <input name="phone" value={formData.phone} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none font-bold transition-all" placeholder="(00) 00000-0000" />
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center"><MapPin size={16} /></div>
             Endereço e Localização
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Logradouro (Rua, Número, Complemento)</label>
              <input name="address" value={formData.address} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none font-bold transition-all" placeholder="Ex: Av. Brasil, 123 - Apto 4" />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Bairro</label>
              <input name="neighborhood" value={formData.neighborhood} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none font-bold transition-all" placeholder="Ex: Centro" />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Cidade</label>
              <input name="city" value={formData.city} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none font-bold transition-all" placeholder="Ex: São Paulo" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Observações Estratégicas</label>
              <textarea name="observations" value={formData.observations} onChange={handleChange} rows={3} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none font-bold transition-all resize-none" placeholder="Influência na comunidade, pedidos especiais, etc..." />
            </div>
          </div>
        </section>

        <div className="flex justify-end gap-6 pt-10 border-t border-slate-100">
          <button type="button" onClick={onCancel} className="px-8 py-4 text-slate-400 hover:text-slate-600 font-black uppercase text-xs tracking-widest transition-all">Cancelar</button>
          <button type="submit" className={`px-12 py-5 text-white rounded-[1.5rem] shadow-xl font-black text-lg flex items-center gap-3 transition-all hover:scale-105 active:scale-95 ${isEditing ? (formData.isFamilyMember ? 'bg-pink-600 shadow-pink-200' : 'bg-amber-600 shadow-amber-200') : 'bg-indigo-600 shadow-indigo-200'}`}>
            <Save size={24} /> {isEditing ? 'Atualizar Dados' : 'Salvar Registro'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VoterForm;
