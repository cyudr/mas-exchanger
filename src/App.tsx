import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Currency, MASConfig } from './types/fx';
import { RatesService } from './services/ratesService';
import { Header } from './components/Header';
import { FavoritesBar } from './components/FavoritesBar';
import { Calculator } from './components/Calculator';
import { RatesTable } from './components/RatesTable';
import { HistoricalChart } from './components/HistoricalChart';
import { TravelCard } from './components/TravelCard';
import { MasApiModal } from './components/MasApiModal';
import { 
  Building2, 
  ExternalLink, 
  ShieldCheck, 
  TrendingUp, 
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function App() {
  const [currencies, setCurrencies] = useState<Currency[]>(() => RatesService.getInitialCurrencies());
  const [favoriteCodes, setFavoriteCodes] = useState<string[]>(() => RatesService.getFavorites());
  const [fromCode, setFromCode] = useState<string>('SGD');
  const [toCode, setToCode] = useState<string>('MYR');
  const [activeTab, setActiveTab] = useState<'converter' | 'table' | 'causeway'>('converter');
  const [isMas100UnitMode, setIsMas100UnitMode] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isMasModalOpen, setIsMasModalOpen] = useState<boolean>(false);
  const [masConfig, setMasConfig] = useState<MASConfig>(() => RatesService.getMASConfig());

  // Manual refresh trigger
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setCurrencies(prev => RatesService.simulateMarketTick(prev));
      setLastUpdated(new Date());
      setIsRefreshing(false);
    }, 400);
  }, []);

  // Periodic rate simulation based on MAS config
  useEffect(() => {
    if (!masConfig.useLiveSimulation) return;
    const intervalTime = Math.max(10, masConfig.refreshIntervalSeconds) * 1000;

    const interval = setInterval(() => {
      setCurrencies(prev => RatesService.simulateMarketTick(prev));
      setLastUpdated(new Date());
    }, intervalTime);

    return () => clearInterval(interval);
  }, [masConfig.useLiveSimulation, masConfig.refreshIntervalSeconds]);

  // Toggle favorite currency
  const handleToggleFavorite = (code: string) => {
    setFavoriteCodes(prev => {
      const updated = prev.includes(code)
        ? prev.filter(c => c !== code)
        : [...prev, code];
      RatesService.saveFavorites(updated);
      return updated;
    });
  };

  // Quick swap from <-> to
  const handleSwap = () => {
    const temp = fromCode;
    setFromCode(toCode);
    setToCode(temp);
  };

  // Select currency from favorites ribbon or table to convert
  const handleSelectCurrency = (code: string) => {
    if (code === 'SGD') {
      setFromCode('SGD');
      setToCode('MYR');
    } else {
      setFromCode('SGD');
      setToCode(code);
    }
    setActiveTab('converter');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectPair = (from: string, to: string) => {
    setFromCode(from);
    setToCode(to);
    setActiveTab('converter');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Selected non-SGD currency for historical chart
  const chartCurrency = useMemo(() => {
    const target = toCode !== 'SGD' ? toCode : fromCode;
    return currencies.find(c => c.code === target) || currencies[1];
  }, [currencies, fromCode, toCode]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Navigation */}
      <Header
        lastUpdated={lastUpdated}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        isMas100UnitMode={isMas100UnitMode}
        onToggleMas100UnitMode={() => setIsMas100UnitMode(!isMas100UnitMode)}
        onOpenMasModal={() => setIsMasModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Pinned Favorite Currencies Ribbon */}
      <FavoritesBar
        currencies={currencies}
        favoriteCodes={favoriteCodes}
        onSelectCurrency={handleSelectCurrency}
        onOpenTable={() => setActiveTab('table')}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* TAB 1: Converter & Calculator View */}
        {activeTab === 'converter' && (
          <div className="space-y-8">
            {/* Currency Converter Card */}
            <Calculator
              currencies={currencies}
              fromCode={fromCode}
              toCode={toCode}
              onFromCodeChange={setFromCode}
              onToCodeChange={setToCode}
              onSwapCurrencies={handleSwap}
            />

            {/* Historical 7-Day Performance for Selected Target */}
            <HistoricalChart currency={chartCurrency} baseCode="SGD" />

            {/* Quick Rates Overview Matrix Below Calculator */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Popular Singapore Dollar Rates
                </h3>
                <button
                  onClick={() => setActiveTab('table')}
                  className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>View All 25+ Currencies</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <RatesTable
                currencies={currencies}
                favoriteCodes={favoriteCodes}
                onToggleFavorite={handleToggleFavorite}
                onSelectForConversion={handleSelectCurrency}
                isMas100UnitMode={isMas100UnitMode}
              />
            </div>
          </div>
        )}

        {/* TAB 2: Full Rates Matrix View */}
        {activeTab === 'table' && (
          <div className="space-y-6">
            <RatesTable
              currencies={currencies}
              favoriteCodes={favoriteCodes}
              onToggleFavorite={handleToggleFavorite}
              onSelectForConversion={handleSelectCurrency}
              isMas100UnitMode={isMas100UnitMode}
            />
          </div>
        )}

        {/* TAB 3: Causeway & Travel View */}
        {activeTab === 'causeway' && (
          <div className="space-y-6">
            <TravelCard currencies={currencies} onSelectPair={handleSelectPair} />
          </div>
        )}
      </main>

      {/* MAS API Settings Modal */}
      <MasApiModal
        isOpen={isMasModalOpen}
        onClose={() => setIsMasModalOpen(false)}
        config={masConfig}
        onSaveConfig={setMasConfig}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">SingaRate</span>
              <span>·</span>
              <span>Singapore Dollar (SGD) Foreign Exchange & Currency Tool</span>
              <span>·</span>
              <span className="text-slate-400">MAS Statistical API Compatible</span>
            </div>

            <div className="flex items-center gap-6">
              <button
                onClick={() => setIsMasModalOpen(true)}
                className="hover:text-red-600 transition-colors cursor-pointer"
              >
                Configure MAS API Keys
              </button>
              <a
                href="https://eservices.mas.gov.sg/statistics/api/"
                target="_blank"
                rel="noreferrer"
                className="hover:text-slate-900 flex items-center gap-1 transition-colors"
              >
                <span>Monetary Authority of Singapore (MAS)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 text-[11px] text-slate-400 text-center sm:text-left">
            Disclaimer: Rates provided are for informational and planning purposes. Brunei Dollar (BND) parity governed by the 1967 Currency Interchangeability Agreement. For transactional banking rates, verify with your authorized financial institution or licensed money changer.
          </div>
        </div>
      </footer>
    </div>
  );
}
