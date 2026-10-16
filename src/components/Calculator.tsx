import React, { useState, useMemo } from 'react';
import { Currency } from '../types/fx';
import { RatesService } from '../services/ratesService';
import { 
  ArrowRightLeft, 
  Calculator as CalcIcon, 
  Copy, 
  Check, 
  ChevronDown, 
  Search, 
  X,
  CreditCard,
  Building2,
  Banknote,
  Info
} from 'lucide-react';

interface CalculatorProps {
  currencies: Currency[];
  fromCode: string;
  toCode: string;
  onFromCodeChange: (code: string) => void;
  onToCodeChange: (code: string) => void;
  onSwapCurrencies: () => void;
}

export const Calculator: React.FC<CalculatorProps> = ({
  currencies,
  fromCode,
  toCode,
  onFromCodeChange,
  onToCodeChange,
  onSwapCurrencies
}) => {
  const [amountInput, setAmountInput] = useState<string>('1000');
  const [showKeypad, setShowKeypad] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [fromSearchOpen, setFromSearchOpen] = useState<boolean>(false);
  const [toSearchOpen, setToSearchOpen] = useState<boolean>(false);
  const [currencyFilterText, setCurrencyFilterText] = useState<string>('');

  const numericAmount = useMemo(() => {
    try {
      const sanitized = amountInput.replace(/[^0-9+\-*/.]/g, '');
      if (!sanitized) return 0;
      // eslint-disable-next-line no-new-func
      const result = Function(`"use strict"; return (${sanitized})`)();
      if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
        return Math.max(0, result);
      }
      return 0;
    } catch {
      const parsed = parseFloat(amountInput);
      return isNaN(parsed) ? 0 : Math.max(0, parsed);
    }
  }, [amountInput]);

  const fromCurrency = useMemo(
    () => currencies.find(c => c.code === fromCode) || currencies[0],
    [currencies, fromCode]
  );

  const toCurrency = useMemo(
    () => currencies.find(c => c.code === toCode) || currencies[1],
    [currencies, toCode]
  );

  const conversion = useMemo(() => {
    return RatesService.convert(numericAmount, fromCode, toCode, currencies);
  }, [numericAmount, fromCode, toCode, currencies]);

  const presets = [50, 100, 500, 1000, 5000];

  const handleCopy = () => {
    const formattedTarget = RatesService.formatAmount(conversion.toAmount, toCode);
    navigator.clipboard.writeText(`${numericAmount} ${fromCode} = ${formattedTarget} ${toCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleKeypadPress = (val: string) => {
    if (val === 'C') {
      setAmountInput('0');
    } else if (val === 'DEL') {
      setAmountInput(prev => (prev.length > 1 ? prev.slice(0, -1) : '0'));
    } else if (val === '+9%GST') {
      try {
        const curr = parseFloat(amountInput) || 0;
        setAmountInput((curr * 1.09).toFixed(2));
      } catch {
        // ignore
      }
    } else if (val === '+10%SVC') {
      try {
        const curr = parseFloat(amountInput) || 0;
        setAmountInput((curr * 1.10).toFixed(2));
      } catch {
        // ignore
      }
    } else {
      setAmountInput(prev => (prev === '0' && !isNaN(Number(val)) ? val : prev + val));
    }
  };

  const filteredCurrencies = useMemo(() => {
    const q = currencyFilterText.toLowerCase().trim();
    if (!q) return currencies;
    return currencies.filter(
      c =>
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q)
    );
  }, [currencies, currencyFilterText]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-6 lg:p-7">
      {/* Title & Keypad Toggle */}
      <div className="flex items-center justify-between gap-2 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
            Singapore Currency Converter
          </h2>
          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-500 mt-0.5">
            <span>MAS Benchmark</span>
            <span>·</span>
            <span>Zero Markup</span>
            <span className="hidden xs:inline">·</span>
            <span className="hidden xs:inline">Real-time Cross Rates</span>
          </div>
        </div>

        <button
          onClick={() => setShowKeypad(!showKeypad)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors cursor-pointer shrink-0 min-h-[40px] ${
            showKeypad
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
          }`}
        >
          <CalcIcon className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{showKeypad ? 'Hide Keypad' : 'Travel / Tax Keypad'}</span>
          <span className="sm:hidden">{showKeypad ? 'Close' : 'Keypad'}</span>
        </button>
      </div>

      {/* Main Conversion Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 mt-5 sm:mt-6 items-center">
        {/* FROM BOX */}
        <div className="lg:col-span-5 relative">
          <label className="block text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            You Send ({fromCurrency.code})
          </label>
          <div className="flex items-stretch rounded-xl border border-slate-200 focus-within:border-red-600 focus-within:ring-2 focus-within:ring-red-100 transition-all bg-white overflow-hidden shadow-2xs min-h-[54px]">
            {/* Currency Selector Button */}
            <button
              onClick={() => {
                setFromSearchOpen(true);
                setCurrencyFilterText('');
              }}
              className="flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border-r border-slate-200 transition-colors shrink-0 cursor-pointer text-left min-w-[100px] sm:min-w-[120px]"
            >
              <span className="text-xl sm:text-2xl leading-none">{fromCurrency.flag}</span>
              <div>
                <span className="font-extrabold text-sm text-slate-900 block leading-tight">
                  {fromCurrency.code}
                </span>
                <span className="text-[10px] text-slate-500 block leading-none font-mono">
                  {fromCurrency.symbol}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-auto" />
            </button>

            {/* Numeric Input */}
            <input
              type="text"
              inputMode="decimal"
              value={amountInput}
              onChange={e => setAmountInput(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 sm:px-4 py-2.5 text-xl sm:text-2xl font-bold text-slate-900 tabular-nums focus:outline-hidden"
            />
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[10px] sm:text-[11px] text-slate-400 mr-0.5 shrink-0">Presets:</span>
            {presets.map(val => (
              <button
                key={val}
                onClick={() => setAmountInput(val.toString())}
                className="px-2.5 py-1 text-[11px] sm:text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-md transition-colors shrink-0 cursor-pointer tabular-nums min-h-[32px]"
              >
                {val >= 1000 ? `${val / 1000}k` : val}
              </button>
            ))}
          </div>
        </div>

        {/* SWAP BUTTON */}
        <div className="lg:col-span-2 flex justify-center -my-1 lg:my-0">
          <button
            onClick={onSwapCurrencies}
            title="Swap currencies"
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-slate-100 hover:bg-red-50 active:bg-red-100 text-slate-700 hover:text-red-600 border border-slate-200 hover:border-red-200 flex items-center justify-center transition-all cursor-pointer shadow-2xs hover:scale-105"
          >
            <ArrowRightLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* TO BOX */}
        <div className="lg:col-span-5 relative">
          <label className="block text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Recipient Gets ({toCurrency.code})
          </label>
          <div className="flex items-stretch rounded-xl border border-slate-200 bg-slate-50/80 overflow-hidden shadow-2xs min-h-[54px]">
            {/* Currency Selector Button */}
            <button
              onClick={() => {
                setToSearchOpen(true);
                setCurrencyFilterText('');
              }}
              className="flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-slate-100 hover:bg-slate-200/80 active:bg-slate-300 border-r border-slate-200 transition-colors shrink-0 cursor-pointer text-left min-w-[100px] sm:min-w-[120px]"
            >
              <span className="text-xl sm:text-2xl leading-none">{toCurrency.flag}</span>
              <div>
                <span className="font-extrabold text-sm text-slate-900 block leading-tight">
                  {toCurrency.code}
                </span>
                <span className="text-[10px] text-slate-500 block leading-none font-mono">
                  {toCurrency.symbol}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-auto" />
            </button>

            {/* Converted Amount Output */}
            <div className="w-full px-3 sm:px-4 py-2.5 flex items-center justify-between overflow-hidden">
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900 tabular-nums truncate">
                {RatesService.formatAmount(conversion.toAmount, toCurrency.code)}
              </span>
              <button
                onClick={handleCopy}
                title="Copy conversion"
                className="p-2 text-slate-400 hover:text-slate-700 active:text-red-600 rounded-md transition-colors cursor-pointer shrink-0 min-w-[40px] min-h-[40px] flex items-center justify-center"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Rate Subtitle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] sm:text-xs text-slate-500 mt-2 gap-0.5">
            <span className="tabular-nums font-semibold">
              1 {fromCurrency.code} = {RatesService.formatRate(conversion.midRate)} {toCurrency.code}
            </span>
            <span className="text-slate-400 tabular-nums">
              (1 {toCurrency.code} = {RatesService.formatRate(conversion.inverseRate)} {fromCurrency.code})
            </span>
          </div>
        </div>
      </div>

      {/* Special Context Hints */}
      {fromCode === 'SGD' && toCode === 'MYR' && (
        <div className="mt-4 p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-snug">
            <strong className="font-bold">Causeway Commute: </strong>
            1 SGD = <span className="font-bold tabular-nums">{RatesService.formatRate(conversion.midRate)} RM</span>. Typical money changer cash rate at Woodlands / Kranji is approx <span className="font-bold tabular-nums">{RatesService.formatRate(conversion.midRate * 0.9935)} RM</span>.
          </div>
        </div>
      )}

      {toCode === 'BND' || fromCode === 'BND' ? (
        <div className="mt-4 p-3 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-900 text-xs flex items-start gap-2.5">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="leading-snug">
            <strong className="font-bold">1:1 Interchangeability: </strong>
            Brunei Dollar (BND) and SGD are 1:1 parity and accepted at face value by retailers and banks in both countries.
          </div>
        </div>
      ) : null}

      {/* Mobile-Friendly Calculator Keypad */}
      {showKeypad && (
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider">
              Travel Expense & SG Tax Math Keypad
            </span>
            <span className="text-[10px] sm:text-[11px] text-slate-400">Tap buttons to calculate</span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 sm:gap-2 max-w-lg">
            {['7', '8', '9', '/', '+9%GST', 'C'].map(k => (
              <button
                key={k}
                onClick={() => handleKeypadPress(k)}
                className={`min-h-[46px] text-sm font-bold rounded-xl border transition-colors cursor-pointer flex items-center justify-center active:scale-95 ${
                  k === 'C'
                    ? 'bg-rose-50 text-rose-700 border-rose-200 active:bg-rose-100'
                    : k.includes('%')
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 active:bg-emerald-100 text-xs'
                    : 'bg-white text-slate-800 border-slate-200 active:bg-slate-100'
                }`}
              >
                {k}
              </button>
            ))}
            {['4', '5', '6', '*', '+10%SVC', 'DEL'].map(k => (
              <button
                key={k}
                onClick={() => handleKeypadPress(k)}
                className={`min-h-[46px] text-sm font-bold rounded-xl border transition-colors cursor-pointer flex items-center justify-center active:scale-95 ${
                  k === 'DEL'
                    ? 'bg-amber-50 text-amber-700 border-amber-200 active:bg-amber-100 text-xs'
                    : k.includes('%')
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 active:bg-emerald-100 text-xs'
                    : 'bg-white text-slate-800 border-slate-200 active:bg-slate-100'
                }`}
              >
                {k}
              </button>
            ))}
            {['1', '2', '3', '-', '+', '.'].map(k => (
              <button
                key={k}
                onClick={() => handleKeypadPress(k)}
                className="min-h-[46px] text-sm font-bold rounded-xl bg-white text-slate-800 border border-slate-200 active:bg-slate-100 transition-colors cursor-pointer flex items-center justify-center active:scale-95"
              >
                {k}
              </button>
            ))}
            {['0', '00', '(', ')'].map(k => (
              <button
                key={k}
                onClick={() => handleKeypadPress(k)}
                className="min-h-[46px] text-sm font-bold rounded-xl bg-white text-slate-800 border border-slate-200 active:bg-slate-100 transition-colors cursor-pointer flex items-center justify-center active:scale-95"
              >
                {k}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Singapore Provider Spread Comparison */}
      <div className="mt-6 pt-5 border-t border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
          <div className="flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-slate-700" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
              Singapore Channel Cost Comparison
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">Based on {fromCode} {numericAmount.toLocaleString()}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
          {/* Multi-Currency Cards */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
              <span>Multi-Currency Cards</span>
            </div>
            <div className="text-[10px] text-slate-500">YouTrip / Wise / Revolut (~0.35%)</div>
            <div className="mt-1.5 text-base font-extrabold text-slate-900 tabular-nums">
              {RatesService.formatAmount(conversion.feeEstimate.multiCurrencyCard, toCode)} {toCode}
            </div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
              Best for travel & online retail
            </div>
          </div>

          {/* Arcade Money Changers */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <Banknote className="w-3.5 h-3.5 text-blue-600" />
              <span>Cash Money Changers</span>
            </div>
            <div className="text-[10px] text-slate-500">The Arcade / Chinatown (~0.65%)</div>
            <div className="mt-1.5 text-base font-extrabold text-slate-900 tabular-nums">
              {RatesService.formatAmount(conversion.feeEstimate.moneyChanger, toCode)} {toCode}
            </div>
            <div className="text-[10px] text-blue-600 font-semibold mt-0.5">
              Standard for physical cash notes
            </div>
          </div>

          {/* Local Retail Banks */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <Building2 className="w-3.5 h-3.5 text-slate-600" />
              <span>Local Retail Banks</span>
            </div>
            <div className="text-[10px] text-slate-500">DBS / OCBC / UOB (~1.25%)</div>
            <div className="mt-1.5 text-base font-extrabold text-slate-900 tabular-nums">
              {RatesService.formatAmount(conversion.feeEstimate.bankTransfer, toCode)} {toCode}
            </div>
            <div className="text-[10px] text-slate-500 font-medium mt-0.5">
              Standard credit card / counter rate
            </div>
          </div>
        </div>
      </div>

      {/* CURRENCY SEARCH MODAL (OPTIMIZED AS MOBILE BOTTOM SHEET / CENTERED MODAL) */}
      {(fromSearchOpen || toSearchOpen) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[80vh] animate-in slide-in-from-bottom sm:slide-in-from-bottom-0">
            {/* Sheet Handle for mobile */}
            <div className="sm:hidden w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-2" />

            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-slate-400" />
                <span className="font-bold text-sm text-slate-900">
                  Select {fromSearchOpen ? 'Source Currency' : 'Target Currency'}
                </span>
              </div>
              <button
                onClick={() => {
                  setFromSearchOpen(false);
                  setToSearchOpen(false);
                }}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 border-b border-slate-100">
              <input
                type="text"
                value={currencyFilterText}
                onChange={e => setCurrencyFilterText(e.target.value)}
                placeholder="Search code, name, or country..."
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-red-600 focus:bg-white"
                autoFocus
              />
            </div>

            <div className="overflow-y-auto p-2 divide-y divide-slate-50 flex-1">
              {filteredCurrencies.map(c => (
                <button
                  key={c.code}
                  onClick={() => {
                    if (fromSearchOpen) {
                      onFromCodeChange(c.code);
                      setFromSearchOpen(false);
                    } else {
                      onToCodeChange(c.code);
                      setToSearchOpen(false);
                    }
                  }}
                  className="w-full flex items-center justify-between p-3 hover:bg-slate-50 active:bg-slate-100 rounded-xl transition-colors text-left cursor-pointer min-h-[52px]"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl leading-none">{c.flag}</span>
                    <div>
                      <div className="font-bold text-sm text-slate-900">
                        {c.code} <span className="font-normal text-slate-500">· {c.name}</span>
                      </div>
                      <div className="text-xs text-slate-400">{c.country}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-900 tabular-nums">
                      {c.rateToSGD.toFixed(4)} SGD
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">{c.symbol}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
