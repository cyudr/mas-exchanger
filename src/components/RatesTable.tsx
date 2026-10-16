import React, { useState, useMemo } from 'react';
import { Currency, CurrencyRegion } from '../types/fx';
import { RatesService } from '../services/ratesService';
import { 
  Search, 
  Star, 
  ArrowUpDown, 
  TrendingUp, 
  TrendingDown, 
  ArrowRight,
  Filter,
  Sparkles
} from 'lucide-react';

interface RatesTableProps {
  currencies: Currency[];
  favoriteCodes: string[];
  onToggleFavorite: (code: string) => void;
  onSelectForConversion: (code: string) => void;
  isMas100UnitMode: boolean;
}

type SortField = 'code' | 'name' | 'rate' | 'change';
type SortOrder = 'asc' | 'desc';

export const RatesTable: React.FC<RatesTableProps> = ({
  currencies,
  favoriteCodes,
  onToggleFavorite,
  onSelectForConversion,
  isMas100UnitMode
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [onlyFavorites, setOnlyFavorites] = useState<boolean>(false);
  const [sortField, setSortField] = useState<SortField>('change');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const regions: { id: string; label: string }[] = [
    { id: 'all', label: 'All Currencies' },
    { id: 'ASEAN', label: 'ASEAN' },
    { id: 'Major', label: 'Major G10' },
    { id: 'Asia', label: 'Asia-Pacific' },
    { id: 'Europe', label: 'Europe' },
    { id: 'Middle East', label: 'Middle East' }
  ];

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const filteredCurrencies = useMemo(() => {
    let list = currencies.filter(c => c.code !== 'SGD'); // SGD is base

    if (onlyFavorites) {
      list = list.filter(c => favoriteCodes.includes(c.code));
    }

    if (selectedRegion !== 'all') {
      list = list.filter(c => c.region === selectedRegion);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        c =>
          c.code.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q) ||
          c.country.toLowerCase().includes(q)
      );
    }

    // Sort
    return [...list].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'code') {
        comparison = a.code.localeCompare(b.code);
      } else if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === 'rate') {
        comparison = a.rateToSGD - b.rateToSGD;
      } else if (sortField === 'change') {
        comparison = a.change24h - b.change24h;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [currencies, favoriteCodes, onlyFavorites, selectedRegion, searchQuery, sortField, sortOrder]);

  // Render SVG Sparkline
  const renderSparkline = (points: number[], isPositive: boolean) => {
    if (!points || points.length < 2) return null;
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min === 0 ? 1 : max - min;
    const width = 80;
    const height = 24;

    const coords = points.map((p, idx) => {
      const x = (idx / (points.length - 1)) * width;
      const y = height - ((p - min) / range) * (height - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    const strokeColor = isPositive ? '#16a34a' : '#e11d48';

    return (
      <svg width={width} height={height} className="overflow-visible inline-block">
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={coords.join(' ')}
        />
      </svg>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Singapore Foreign Exchange Rates
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span>MAS End-of-Day / Live Benchmark</span>
              <span>·</span>
              <span>All rates quoted relative to Singapore Dollar (SGD)</span>
            </div>
          </div>

          {/* Quick Filter: Favorites Only */}
          <button
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors self-start sm:self-auto cursor-pointer ${
              onlyFavorites
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
            <span>Favorites ({favoriteCodes.length})</span>
          </button>
        </div>

        {/* Search & Region Segmented Tabs */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2">
          {/* Search Box */}
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search code, name, or country..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-red-600 focus:bg-white transition-colors"
            />
          </div>

          {/* Region Tabs (Functional Buttons) */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto scrollbar-none">
            {regions.map(r => (
              <button
                key={r.id}
                onClick={() => setSelectedRegion(r.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                  selectedRegion === r.id
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* High-Density Data Grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4 w-10 text-center">⭐</th>
              <th className="py-3 px-4">
                <button
                  onClick={() => handleSort('code')}
                  className="flex items-center gap-1 hover:text-slate-900 cursor-pointer"
                >
                  <span>Currency</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </button>
              </th>
              <th className="py-3 px-4 text-right">
                <button
                  onClick={() => handleSort('rate')}
                  className="flex items-center gap-1 ml-auto hover:text-slate-900 cursor-pointer"
                >
                  <span>{isMas100UnitMode ? 'MAS Quoted Rate (SGD)' : 'SGD per 1 Unit'}</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </button>
              </th>
              <th className="py-3 px-4 text-right">
                <span>Foreign per 1 SGD</span>
              </th>
              <th className="py-3 px-4 text-right">
                <button
                  onClick={() => handleSort('change')}
                  className="flex items-center gap-1 ml-auto hover:text-slate-900 cursor-pointer"
                >
                  <span>24h Change</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </button>
              </th>
              <th className="py-3 px-4 text-center hidden md:table-cell">7D Trend</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filteredCurrencies.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500">
                  <div className="max-w-xs mx-auto">
                    <p className="font-semibold text-slate-700">No matching currencies found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Try searching with different keywords or reset your filters.
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedRegion('all');
                        setOnlyFavorites(false);
                      }}
                      className="mt-3 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                    >
                      Reset Filters
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredCurrencies.map(curr => {
                const isFav = favoriteCodes.includes(curr.code);
                const isPositive = curr.change24h >= 0;

                // If MAS 100-unit mode is active AND currency is normally quoted per 100 (like JPY, MYR, THB, IDR)
                const displayRate =
                  isMas100UnitMode && curr.masQuotationUnit === 100
                    ? curr.rateToSGD * 100
                    : curr.rateToSGD;

                const displayUnitLabel =
                  isMas100UnitMode && curr.masQuotationUnit === 100
                    ? `per 100 ${curr.code}`
                    : `per 1 ${curr.code}`;

                const unitsPerSGD = 1 / curr.rateToSGD;

                return (
                  <tr
                    key={curr.code}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Star Favorite */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onToggleFavorite(curr.code)}
                        title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                        className="text-slate-300 hover:text-amber-500 transition-colors cursor-pointer"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            isFav ? 'text-amber-500 fill-amber-500' : 'text-slate-300'
                          }`}
                        />
                      </button>
                    </td>

                    {/* Currency & Country */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl leading-none">{curr.flag}</span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900">{curr.code}</span>
                            <span className="text-xs text-slate-400 font-mono">({curr.symbol})</span>
                            {curr.code === 'BND' && (
                              <span className="text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-medium">
                                1:1 Peg
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500">
                            {curr.name} <span className="text-slate-300">·</span> {curr.country}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* SGD Quoted Rate */}
                    <td className="py-3 px-4 text-right">
                      <div className="font-bold text-slate-900 tabular-nums">
                        S$ {RatesService.formatRate(displayRate)}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        {displayUnitLabel}
                      </div>
                    </td>

                    {/* Units per 1 SGD */}
                    <td className="py-3 px-4 text-right font-medium text-slate-800 tabular-nums">
                      {RatesService.formatAmount(unitsPerSGD, curr.code)} {curr.code}
                    </td>

                    {/* 24h Change */}
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`inline-flex items-center font-bold text-xs tabular-nums ${
                          isPositive ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {isPositive ? (
                          <TrendingUp className="w-3.5 h-3.5 mr-0.5 inline" />
                        ) : (
                          <TrendingDown className="w-3.5 h-3.5 mr-0.5 inline" />
                        )}
                        {isPositive ? '+' : ''}
                        {curr.change24h.toFixed(2)}%
                      </span>
                    </td>

                    {/* 7D Sparkline */}
                    <td className="py-3 px-4 text-center hidden md:table-cell">
                      {renderSparkline(curr.sparkline7d, isPositive)}
                    </td>

                    {/* Action: Convert */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onSelectForConversion(curr.code)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-red-600 bg-slate-100 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <span>Convert</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer info */}
      <div className="p-4 bg-slate-50/50 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div>
          Showing <span className="font-semibold text-slate-700">{filteredCurrencies.length}</span> currencies traded against the Singapore Dollar.
        </div>
        <div className="flex items-center gap-2">
          <span>Official MAS banking convention:</span>
          <span className="font-mono text-[11px] text-slate-700">JPY, MYR, IDR, THB, INR, KRW, TWD quoted per 100 units</span>
        </div>
      </div>
    </div>
  );
};
