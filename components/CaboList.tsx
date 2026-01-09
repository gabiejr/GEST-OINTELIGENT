
import React from 'react';
import { CaboEleitoral, Voter } from '../types';
import { Trash2, Phone, MapPin, Edit3, Target, Users } from 'lucide-react';

interface Props {
  cabos: CaboEleitoral[];
  voters: Voter[];
  onDelete: (id: string) => void;
  onEdit: (cabo: CaboEleitoral) => void;
  scope: 'municipal' | 'estadual';
}

const CaboList: React.FC<Props> = ({ cabos, voters, onDelete, onEdit, scope }) => {
  if (cabos.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
        <Target className="mx-auto text-slate-200 mb-4" size={64} />
        <h3 className="text-xl font-black text-slate-400">Nenhum Cabo Eleitoral Cadastrado</h3>
        <p className="text-slate-300">Comece a montar sua equipe de lideranças.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {cabos.map((cabo) => {
        const broughtVoters = voters.filter(v => v.caboId === cabo.id).length;
        const performance = Math.min(100, (broughtVoters / (cabo.voterGoal || 1)) * 100);

        return (
          <div key={cabo.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 font-black text-xl">
                  {cabo.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-black text-slate-800 leading-tight">{cabo.name}</h4>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <MapPin size={10} /> {cabo.location}
                  </p>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onEdit(cabo)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                  <Edit3 size={16} />
                </button>
                <button onClick={() => onDelete(cabo.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-4">
               <div className="flex items-center gap-3 text-slate-600">
                  <Phone size={14} className="text-orange-400" />
                  <span className="text-sm font-bold">{cabo.phone}</span>
               </div>
               
               <div className="pt-4 border-t border-slate-50">
                  <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase mb-2">
                    <span>Avanço Individual</span>
                    <span className="text-slate-700">{broughtVoters} / {cabo.voterGoal}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 transition-all duration-700" style={{ width: `${performance}%` }} />
                  </div>
               </div>

               <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest mt-2">
                  <div className="flex items-center gap-1 text-orange-600">
                    <Users size={12} /> {broughtVoters} Eleitores
                  </div>
                  <div className={`px-2 py-1 rounded-lg ${performance >= 80 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                    {performance.toFixed(0)}% Meta
                  </div>
               </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CaboList;
