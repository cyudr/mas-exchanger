import React from 'react';
import { Currency } from '../types/fx';
import { Star, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { RatesService } from '../services/ratesService';

interface FavoritesBarProps {
  currencies: Currency[];
  favoriteCodes: string[];
  onSelectCurrency: (code: string) => void;
  onOpenTable: () => void;
}

export const FavoritesBar: React.FC<FavoritesBarProps> = ({
  currencies,
  favoriteCodes,
  onSelectCurrency,
  onOpenTable
}) => {
  const favoriteCurrencies = favoriteCodes
    .map(code => currencies.find(c => c.code === code))
    .filter((c): c is Currency => c !== undefined && c.code !== 'SGD');

  return (
    <div className="w-full bg-white border-b border-slate-200 py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Singapore Pinned Pairs</span>
            <span className="text-slate-300">·</span>
            <span className="font-normal normal-case text-slate-400">1 SGD to Foreign Currency</span>
          </div>
          <button
            onClick={onOpenTable}
            className="text-xs font-medium text-red-600 hover:text-red-700 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Manage Favorites</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Horizontal scrollable favorites strip */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
          {favoriteCurrencies.map(curr => {
            // 1 SGD = how many units of curr?
            const unitsPerSGD = 1 / curr.rateToSGD;
            const isPositive = curr.change24h >= 0;

            return (
              <button
                key={curr.code}
                onClick={() => onSelectCurrency(curr.code)}
                className="group flex items-center gap-3 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200/80 hover:border-slate-300 transition-all text-left shrink-0 cursor-pointer shadow-2xs hover:shadow-xs"
              >
                <span className="text-xl leading-none">{curr.flag}</span>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                      SGD / {curr.code}
                    </span>
                    <span className="text-[10px] text-slate-400">{curr.symbol}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900 tabular-nums">
                      {RatesService.formatAmount(unitsPerSGD, curr.code)}
                    </span>
                    <span
                      className={`text-[11px] font-medium flex items-center tabular-nums ${
                        isPositive ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {isPositive ? (
                        <TrendingUp className="w-3 h-3 mr-0.5 inline" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-0.5 inline" />
                      )}
                      {isPositive ? '+' : ''}
                      {curr.change24h.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
