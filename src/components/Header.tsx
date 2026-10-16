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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* 3-Zone Top Bar Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('converter')}
              className="flex items-center gap-2 text-left group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-red-600 text-white font-bold flex items-center justify-center text-sm shadow-xs transition-transform group-hover:scale-105">
                🇸🇬
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-red-600 transition-colors">
                  SingaRate
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveTab('converter')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 cursor-pointer ${
                activeTab === 'converter' ? 'text-red-600 font-semibold border-b-2 border-red-600' : ''
              }`}
            >
              Converter & Calculator
            </button>
            <button
              onClick={() => setActiveTab('table')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 cursor-pointer ${
                activeTab === 'table' ? 'text-red-600 font-semibold border-b-2 border-red-600' : ''
              }`}
            >
              Rates Matrix
            </button>
            <button
              onClick={() => setActiveTab('causeway')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 cursor-pointer ${
                activeTab === 'causeway' ? 'text-red-600 font-semibold border-b-2 border-red-600' : ''
              }`}
            >
              Causeway & Travel
            </button>
          </nav>

          {/* Zone 3: 1 primary action & controls */}
          <div className="flex items-center gap-3 shrink-0">
            {/* MAS 100-Unit Quoting Toggle */}
            <button
              onClick={onToggleMas100UnitMode}
              title="Toggle MAS official 100-unit quoting (JPY, MYR, IDR, THB per 100)"
              className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                isMas100UnitMode
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>{isMas100UnitMode ? 'MAS Quoting: 100 Units' : 'Standard: 1 Unit'}</span>
            </button>

            {/* Live Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Refresh foreign exchange rates"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-red-600' : ''}`} />
            </button>

            {/* Primary Action Button: MAS API Settings */}
            <button
              onClick={onOpenMasModal}
              className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>MAS API</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Sub-bar */}
        <div className="flex md:hidden items-center justify-between gap-4 py-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('converter')}
              className={`py-1 cursor-pointer ${activeTab === 'converter' ? 'text-red-600 font-semibold border-b-2 border-red-600' : 'text-slate-600'}`}
            >
              Converter
            </button>
            <button
              onClick={() => setActiveTab('table')}
              className={`py-1 cursor-pointer ${activeTab === 'table' ? 'text-red-600 font-semibold border-b-2 border-red-600' : 'text-slate-600'}`}
            >
              All Rates
            </button>
            <button
              onClick={() => setActiveTab('causeway')}
              className={`py-1 cursor-pointer ${activeTab === 'causeway' ? 'text-red-600 font-semibold border-b-2 border-red-600' : 'text-slate-600'}`}
            >
              Causeway
            </button>
          </div>
          <div className="text-[11px] text-slate-500 tabular-nums">
            SGT {lastUpdated.toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
        </div>
      </div>
    </header>
  );
};
