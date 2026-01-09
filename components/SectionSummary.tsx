
import React, { useMemo } from 'react';
import { Voter } from '../types';
import { Hash } from 'lucide-react';

interface Props {
  voters: Voter[];
}

const SectionSummary: React.FC<Props> = ({ voters }) => {
  const sectionStats = useMemo(() => {
    const stats: Record<string, { zone: string; section: string; count: number }> = {};
    
    voters.forEach(v => {
      const key = `${v.votingZone}-${v.votingSection}`;
      if (!stats[key]) {
        stats[key] = { zone: v.votingZone, section: v.votingSection, count: 0 };
      }
      stats[key].count++;
    });

    return Object.values(stats).sort((a, b) => b.count - a.count);
  }, [voters]);

  if (voters.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
        <Hash size={18} className="text-indigo-600" />
        Eleitores por Seção
      </h3>
      
      <div className="grid grid-cols-2 gap-3">
        {sectionStats.slice(0, 6).map((stat) => (
          <div key={`${stat.zone}-${stat.section}`} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center justify-center">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
              Z: {stat.zone} | S: {stat.section}
            </div>
            <div className="text-2xl font-black text-indigo-600">
              {stat.count}
            </div>
            <div className="text-[9px] text-slate-400 font-medium">Eleitores</div>
          </div>
        ))}
      </div>
      
      {sectionStats.length > 6 && (
        <div className="mt-4 pt-4 border-t border-slate-50 text-center">
          <p className="text-xs text-slate-400 italic">Total de {sectionStats.length} seções cadastradas</p>
        </div>
      )}
    </div>
  );
};

export default SectionSummary;
