import React from 'react';
import { Currency } from '../types/fx';
import { RatesService } from '../services/ratesService';
import { Fuel, Utensils, ShoppingBag, ShieldCheck } from 'lucide-react';

interface TravelCardProps {
  currencies: Currency[];
  onSelectPair: (from: string, to: string) => void;
}

export const TravelCard: React.FC<TravelCardProps> = ({ currencies, onSelectPair }) => {
  const myr = currencies.find(c => c.code === 'MYR') || { rateToSGD: 0.3018 };
  const jpy = currencies.find(c => c.code === 'JPY') || { rateToSGD: 0.00892 };
  const thb = currencies.find(c => c.code === 'THB') || { rateToSGD: 0.0388 };
  const idr = currencies.find(c => c.code === 'IDR') || { rateToSGD: 0.0000832 };

  const sgdToMyrRate = 1 / myr.rateToSGD;

  const causewayPresets = [
    {
      sgd: 20,
      icon: <Utensils className="w-3.5 h-3.5 text-amber-600" />,
      note: 'JB Dim Sum / Café'
    },
    {
      sgd: 50,
      icon: <Fuel className="w-3.5 h-3.5 text-blue-600" />,
      note: 'RON97 Tank / Car Wash'
    },
    {
      sgd: 100,
      icon: <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />,
      note: 'Mid Valley Groceries'
    },
    {
      sgd: 200,
      icon: <Utensils className="w-3.5 h-3.5 text-rose-600" />,
      note: 'Seafood & Spa Day'
    },
    {
      sgd: 500,
      icon: <ShoppingBag className="w-3.5 h-3.5 text-purple-600" />,
      note: 'Weekend Shopping Trip'
    }
  ];

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Causeway Watch Showcase */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-6 lg:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🇲🇾</span>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                Causeway Watch: Singapore to Johor Bahru
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Current Live Rate: <span className="font-extrabold text-slate-800 tabular-nums">1 SGD = {sgdToMyrRate.toFixed(4)} RM</span>
            </p>
          </div>

          <button
            onClick={() => onSelectPair('SGD', 'MYR')}
            className="self-stretch sm:self-auto px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors cursor-pointer text-center min-h-[42px] flex items-center justify-center"
          >
            Open SGD / MYR Converter
          </button>
        </div>

        {/* Causeway Pre-calculated Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3 mt-4">
          {causewayPresets.map(item => {
            const myrTotal = item.sgd * sgdToMyrRate;
            return (
              <div
                key={item.sgd}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-700 tabular-nums">
                      S$ {item.sgd}
                    </span>
                    {item.icon}
                  </div>
                  <div className="mt-1.5 text-base sm:text-lg font-extrabold text-slate-900 tabular-nums">
                    RM {myrTotal.toFixed(2)}
                  </div>
                </div>
                <div className="text-[10px] sm:text-[11px] text-slate-500 mt-1.5 pt-1.5 border-t border-slate-200/60 leading-tight">
                  {item.note}
                </div>
              </div>
            );
          })}
        </div>

        {/* Singapore Commuter FX Tips */}
        <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
          <div className="font-bold text-slate-800 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Singapore Commuter FX Quick Notes:</span>
          </div>
          <p>
            • <strong>PayNow / DuitNow QR:</strong> Accepted across JB cafes and supermarkets directly via DBS, OCBC, and UOB mobile apps.
          </p>
          <p>
            • <strong>Cash Changers:</strong> Raffles Place Arcade and Jurong Point quote the tightest physical cash spreads for RM50 and RM100 notes.
          </p>
        </div>
      </div>

      {/* Top Vacation Destinations */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Japan */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🇯🇵</span>
                <span className="font-extrabold text-sm text-slate-900">Japan (JPY)</span>
              </div>
              <span className="text-xs font-extrabold text-slate-900 tabular-nums">
                1 SGD = {(1 / jpy.rateToSGD).toFixed(2)} ¥
              </span>
            </div>
            <div className="mt-2.5 text-xs text-slate-500 space-y-1">
              <div className="flex justify-between">
                <span>S$ 100</span>
                <span className="font-bold text-slate-800 tabular-nums">
                  ¥ {RatesService.formatAmount(100 / jpy.rateToSGD, 'JPY')}
                </span>
              </div>
              <div className="flex justify-between">
                <span>S$ 1,000</span>
                <span className="font-bold text-slate-800 tabular-nums">
                  ¥ {RatesService.formatAmount(1000 / jpy.rateToSGD, 'JPY')}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => onSelectPair('SGD', 'JPY')}
            className="mt-3 w-full py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-xl transition-colors cursor-pointer min-h-[38px]"
          >
            Convert JPY
          </button>
        </div>

        {/* Thailand */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🇹🇭</span>
                <span className="font-extrabold text-sm text-slate-900">Thailand (THB)</span>
              </div>
              <span className="text-xs font-extrabold text-slate-900 tabular-nums">
                1 SGD = {(1 / thb.rateToSGD).toFixed(2)} ฿
              </span>
            </div>
            <div className="mt-2.5 text-xs text-slate-500 space-y-1">
              <div className="flex justify-between">
                <span>S$ 100</span>
                <span className="font-bold text-slate-800 tabular-nums">
                  ฿ {RatesService.formatAmount(100 / thb.rateToSGD, 'THB')}
                </span>
              </div>
              <div className="flex justify-between">
                <span>S$ 500</span>
                <span className="font-bold text-slate-800 tabular-nums">
                  ฿ {RatesService.formatAmount(500 / thb.rateToSGD, 'THB')}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => onSelectPair('SGD', 'THB')}
            className="mt-3 w-full py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-xl transition-colors cursor-pointer min-h-[38px]"
          >
            Convert THB
          </button>
        </div>

        {/* Indonesia */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🇮🇩</span>
                <span className="font-extrabold text-sm text-slate-900">Indonesia (IDR)</span>
              </div>
              <span className="text-xs font-extrabold text-slate-900 tabular-nums">
                1 SGD = {(1 / idr.rateToSGD).toFixed(0)} Rp
              </span>
            </div>
            <div className="mt-2.5 text-xs text-slate-500 space-y-1">
              <div className="flex justify-between">
                <span>S$ 50 (Batam Ferry)</span>
                <span className="font-bold text-slate-800 tabular-nums">
                  Rp {RatesService.formatAmount(50 / idr.rateToSGD, 'IDR')}
                </span>
              </div>
              <div className="flex justify-between">
                <span>S$ 200</span>
                <span className="font-bold text-slate-800 tabular-nums">
                  Rp {RatesService.formatAmount(200 / idr.rateToSGD, 'IDR')}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => onSelectPair('SGD', 'IDR')}
            className="mt-3 w-full py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-xl transition-colors cursor-pointer min-h-[38px]"
          >
            Convert IDR
          </button>
        </div>
      </div>
    </div>
  );
};
