import React from 'react';
import { ArrowLeftRight, TableProperties, Compass, SlidersHorizontal } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'converter' | 'table' | 'causeway';
  setActiveTab: (tab: 'converter' | 'table' | 'causeway') => void;
  onOpenMasModal: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenMasModal
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-1.5 px-3 md:hidden shadow-lg safe-area-pb">
      <div className="grid grid-cols-4 gap-1 items-center">
        {/* Converter Tab */}
        <button
          onClick={() => {
            setActiveTab('converter');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-colors cursor-pointer min-h-[46px] ${
            activeTab === 'converter'
              ? 'text-red-600 bg-red-50/70 font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ArrowLeftRight className="w-4 h-4 mb-0.5" />
          <span className="text-[11px] leading-tight">Convert</span>
        </button>

        {/* Rates Table Tab */}
        <button
          onClick={() => {
            setActiveTab('table');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-colors cursor-pointer min-h-[46px] ${
            activeTab === 'table'
              ? 'text-red-600 bg-red-50/70 font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <TableProperties className="w-4 h-4 mb-0.5" />
          <span className="text-[11px] leading-tight">Rates</span>
        </button>

        {/* Causeway Tab */}
        <button
          onClick={() => {
            setActiveTab('causeway');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-colors cursor-pointer min-h-[46px] ${
            activeTab === 'causeway'
              ? 'text-red-600 bg-red-50/70 font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Compass className="w-4 h-4 mb-0.5" />
          <span className="text-[11px] leading-tight">Causeway</span>
        </button>

        {/* MAS API Modal Trigger */}
        <button
          onClick={onOpenMasModal}
          className="flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-slate-600 hover:text-slate-900 transition-colors cursor-pointer min-h-[46px]"
        >
          <SlidersHorizontal className="w-4 h-4 mb-0.5" />
          <span className="text-[11px] leading-tight">MAS API</span>
        </button>
      </div>
    </div>
  );
};
