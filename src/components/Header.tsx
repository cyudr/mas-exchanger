import React from 'react';
import { RefreshCw, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

interface HeaderProps {
  lastUpdated: Date;
  isRefreshing: boolean;
  onRefresh: () => void;
  isMas100UnitMode: boolean;
  onToggleMas100UnitMode: () => void;
  onOpenMasModal: () => void;
  activeTab: 'converter' | 'table' | 'causeway';
  setActiveTab: (tab: 'converter' | 'table' | 'causeway') => void;
}

export const Header: React.FC<HeaderProps> = ({
  lastUpdated,
  isRefreshing,
  onRefresh,
  isMas100UnitMode,
  onToggleMas100UnitMode,
  onOpenMasModal,
  activeTab,
  setActiveTab
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-14 sm:h-16">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setActiveTab('converter');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 group cursor-pointer text-left min-h-[44px]"
            >
              <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center text-sm shadow-2xs group-hover:scale-105 transition-transform">
                🇸🇬
              </div>
              <div>
                <span className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 group-hover:text-red-600 transition-colors">
                  SingaRate
                </span>
                <span className="hidden sm:inline-block ml-2 text-[10px] text-slate-400 font-medium">
                  SGD FX & MAS API
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links (Desktop/Tablet) */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveTab('converter')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 cursor-pointer ${
                activeTab === 'converter' ? 'text-red-600 font-bold border-b-2 border-red-600' : ''
              }`}
            >
              Converter & Calculator
            </button>
            <button
              onClick={() => setActiveTab('table')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 cursor-pointer ${
                activeTab === 'table' ? 'text-red-600 font-bold border-b-2 border-red-600' : ''
              }`}
            >
              Rates Matrix
            </button>
            <button
              onClick={() => setActiveTab('causeway')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 cursor-pointer ${
                activeTab === 'causeway' ? 'text-red-600 font-bold border-b-2 border-red-600' : ''
              }`}
            >
              Causeway Watch
            </button>
          </nav>

          {/* Zone 3: Actions & Controls */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* MAS 100-Unit Mode (Desktop/Tablet) */}
            <button
              onClick={onToggleMas100UnitMode}
              title="Toggle MAS official 100-unit quoting (JPY, MYR, IDR, THB per 100)"
              className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer min-h-[38px] ${
                isMas100UnitMode
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>{isMas100UnitMode ? 'MAS: 100 Units' : 'Std: 1 Unit'}</span>
            </button>

            {/* Refresh Button with SGT timestamp on desktop */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Refresh rates"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50 min-h-[44px] min-w-[44px] justify-center"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-red-600' : ''}`} />
              <span className="hidden sm:inline font-mono text-[11px] text-slate-400 tabular-nums">
                {lastUpdated.toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' })} SGT
              </span>
            </button>

            {/* MAS API Settings Button */}
            <button
              onClick={onOpenMasModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-2xs transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[40px]"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">MAS API</span>
              <span className="xs:hidden">API</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
