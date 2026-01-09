
import React from 'react';
import { Voter } from '../types';
import { Trash2, Phone, MapPin, Mail, Calendar, Users, Edit3, Heart, HandHelping } from 'lucide-react';

interface Props {
  voters: Voter[];
  onDelete: (id: string) => void;
  onEdit: (voter: Voter) => void;
  onManageHelp: (voter: Voter) => void;
}

const VoterList: React.FC<Props> = ({ voters, onDelete, onEdit, onManageHelp }) => {
  if (voters.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
        <Users className="mx-auto text-slate-300 mb-4" size={48} />
        <h3 className="text-lg font-medium text-slate-600">Nenhum registro encontrado</h3>
        <p className="text-slate-400">Tente ajustar sua busca ou cadastre um novo eleitor.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-4">Eleitor</th>
              <th className="px-6 py-4">Localidade</th>
              <th className="px-6 py-4">Contato</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {voters.map((voter) => {
              const helpCount = voter.helpRecords?.length || 0;

              return (
                <tr key={voter.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="font-bold text-slate-800">{voter.name}</div>
                      {voter.isFamilyMember && (
                        <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-pink-100 text-pink-600 text-[9px] font-black rounded-full uppercase tracking-tighter">
                          <Heart size={8} fill="currentColor" /> Família
                        </span>
                      )}
                      {helpCount > 0 && (
                        <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-100 text-emerald-600 text-[9px] font-black rounded-full uppercase tracking-tighter">
                           {helpCount} {helpCount === 1 ? 'Ajuda' : 'Ajudas'}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                      <Calendar size={12} /> {new Date(voter.birthDate).toLocaleDateString('pt-BR')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-600 flex items-center gap-1">
                      <MapPin size={14} className="text-slate-400" /> {voter.neighborhood}{voter.city ? `, ${voter.city}` : ''}
                    </div>
                    <div className="text-xs text-slate-400 mt-1 truncate max-w-[200px]">{voter.address}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-600 flex items-center gap-1">
                      <Phone size={14} className="text-slate-400" /> {voter.phone}
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                      <Mail size={12} className="text-slate-400" /> {voter.email || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end items-center gap-1">
                      <button 
                        onClick={() => onManageHelp(voter)}
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                        title="Gerenciar Ajudas"
                      >
                        <HandHelping size={18} />
                      </button>
                      <button 
                        onClick={() => onEdit(voter)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        title="Editar"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button 
                        onClick={() => onDelete(voter.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Excluir"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VoterList;
