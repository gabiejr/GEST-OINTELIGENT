
import React, { useMemo } from 'react';
import { Voter } from '../types';
import { MapPin } from 'lucide-react';

interface Props {
  voters: Voter[];
}

const NeighborhoodChart: React.FC<Props> = ({ voters }) => {
  const chartData = useMemo(() => {
    const counts: Record<string, number> = {};
    voters.forEach(v => {
      const neighborhood = v.neighborhood || 'Não Informado';
      counts[neighborhood] = (counts[neighborhood] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: voters.length > 0 ? (count / voters.length) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count);
  }, [voters]);

  if (voters.length === 0) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-100 text-center text-slate-400 italic">
        Cadastre eleitores para visualizar a distribuição por bairro.
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <MapPin size={18} className="text-indigo-600" />
          Distribuição por Bairro
        </h3>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Total: {voters.length}
        </span>
      </div>

      <div className="space-y-5">
        {chartData.map((item, index) => (
          <div key={item.name} className="group">
            <div className="flex justify-between items-end mb-1">
              <span className="text-sm font-medium text-slate-700 truncate pr-4">
                {item.name}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-bold text-indigo-600">{item.count}</span>
                <span className="text-[10px] text-slate-400 font-medium">({item.percentage.toFixed(1)}%)</span>
              </div>
            </div>
            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 rounded-full transition-all duration-1000 ease-out"
                style={{ 
                  width: `${item.percentage}%`,
                  transitionDelay: `${index * 100}ms`
                }}
              />
            </div>
          </div>
        ))}
      </div>
      
      {chartData.length > 5 && (
        <p className="mt-6 text-center text-xs text-slate-400">
          Exibindo os bairros com maior concentração de eleitores.
        </p>
      )}
    </div>
  );
};

export default NeighborhoodChart;
