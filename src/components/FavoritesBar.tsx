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
    <div className="w-full bg-white border-b border-slate-200/80 py-2.5 sm:py-3">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
            <span className="truncate">Singapore Pinned Pairs</span>
            <span className="text-slate-300 hidden xs:inline">·</span>
            <span className="font-normal normal-case text-slate-400 hidden sm:inline">
              1 SGD relative rate
            </span>
          </div>
          <button
            onClick={onOpenTable}
            className="text-[11px] sm:text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 transition-colors cursor-pointer shrink-0 min-h-[36px]"
          >
            <span>All Rates</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Horizontal touch scroll ribbon with smooth snap */}
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1.5 pt-0.5 scrollbar-none snap-x snap-mandatory -mx-3 px-3 sm:mx-0 sm:px-0">
          {favoriteCurrencies.map(curr => {
            const unitsPerSGD = 1 / curr.rateToSGD;
            const isPositive = curr.change24h >= 0;

            return (
              <button
                key={curr.code}
                onClick={() => onSelectCurrency(curr.code)}
                className="group flex items-center gap-2.5 sm:gap-3 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100/90 active:bg-slate-200/80 border border-slate-200/80 hover:border-slate-300 transition-all text-left shrink-0 cursor-pointer shadow-2xs snap-start min-h-[48px]"
              >
                <span className="text-xl sm:text-2xl leading-none">{curr.flag}</span>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                      SGD/{curr.code}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {curr.symbol}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs sm:text-sm font-bold text-slate-900 tabular-nums">
                      {RatesService.formatAmount(unitsPerSGD, curr.code)}
                    </span>
                    <span
                      className={`text-[10px] sm:text-[11px] font-bold flex items-center tabular-nums ${
                        isPositive ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {isPositive ? (
                        <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 inline" />
                      ) : (
                        <TrendingDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 inline" />
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
