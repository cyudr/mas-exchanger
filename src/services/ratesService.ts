import { Currency, ConversionResult, MASConfig } from '../types/fx';
import { INITIAL_CURRENCIES, POPULAR_FAVORITE_CODES } from '../data/currencies';

const FAVORITES_STORAGE_KEY = 'singarate_favorites_v1';
const MAS_CONFIG_STORAGE_KEY = 'singarate_mas_config_v1';
const HISTORY_STORAGE_KEY = 'singarate_conversion_history_v1';

export const DEFAULT_MAS_CONFIG: MASConfig = {
  apiKey: '',
  apiEndpoint: 'https://eservices.mas.gov.sg/statistics/api/v1/bondsexchangerates/exchangerates',
  useLiveSimulation: true,
  refreshIntervalSeconds: 30,
  customSpreadPercent: 1.2
};

export class RatesService {
  private static currencies: Currency[] = [...INITIAL_CURRENCIES];

  static getInitialCurrencies(): Currency[] {
    return [...this.currencies];
  }

  static getFavorites(): string[] {
    try {
      const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return POPULAR_FAVORITE_CODES;
  }

  static saveFavorites(favorites: string[]): void {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch {
      // ignore
    }
  }

  static getMASConfig(): MASConfig {
    try {
      const saved = localStorage.getItem(MAS_CONFIG_STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_MAS_CONFIG, ...JSON.parse(saved) };
      }
    } catch {
      // ignore
    }
    return DEFAULT_MAS_CONFIG;
  }

  static saveMASConfig(config: MASConfig): void {
    try {
      localStorage.setItem(MAS_CONFIG_STORAGE_KEY, JSON.stringify(config));
    } catch {
      // ignore
    }
  }

  static getConversionHistory(): { fromAmount: number; fromCode: string; toAmount: number; toCode: string; date: string }[] {
    try {
      const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return [];
  }

  static recordConversion(fromAmount: number, fromCode: string, toAmount: number, toCode: string): void {
    try {
      const existing = this.getConversionHistory();
      const newEntry = {
        fromAmount,
        fromCode,
        toAmount,
        toCode,
        date: new Date().toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' })
      };
      const updated = [newEntry, ...existing.slice(0, 7)];
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  }

  // Cross-rate calculation via SGD
  // 1 unit of fromCurrency = rateToSGD(from) SGD
  // In toCurrency: (amount * rateToSGD(from)) / rateToSGD(to)
  static convert(
    amount: number,
    fromCode: string,
    toCode: string,
    currenciesList: Currency[]
  ): ConversionResult {
    const fromCurr = currenciesList.find(c => c.code === fromCode) || currenciesList.find(c => c.code === 'SGD')!;
    const toCurr = currenciesList.find(c => c.code === toCode) || currenciesList.find(c => c.code === 'MYR')!;

    // Amount in SGD
    const amountInSGD = amount * fromCurr.rateToSGD;
    // Converted to target currency
    const targetAmount = amountInSGD / toCurr.rateToSGD;

    // Rate: 1 fromCurr = X toCurr
    const midRate = fromCurr.rateToSGD / toCurr.rateToSGD;
    const inverseRate = 1 / midRate;

    // Realistic spreads in Singapore banking & retail money changer market
    // Multi-currency card (YouTrip / Revolut / Wise): ~0.35%
    // Money Changer cash at Arcade / Chinatown: ~0.65%
    // Traditional SG bank overseas wire/card (DBS/UOB/OCBC): ~1.25%
    const multiCardSpread = 0.0035;
    const moneyChangerSpread = 0.0065;
    const bankSpread = 0.0125;

    return {
      fromAmount: amount,
      fromCode,
      toCode,
      toAmount: targetAmount,
      midRate,
      inverseRate,
      feeEstimate: {
        midMarket: targetAmount,
        bankTransfer: targetAmount * (1 - bankSpread),
        moneyChanger: targetAmount * (1 - moneyChangerSpread),
        multiCurrencyCard: targetAmount * (1 - multiCardSpread)
      }
    };
  }

  // Simulate realistic market ticks (e.g. 0.02% to 0.08% variance for live rates)
  static simulateMarketTick(currentCurrencies: Currency[]): Currency[] {
    return currentCurrencies.map(curr => {
      if (curr.code === 'SGD' || curr.code === 'BND') {
        // SGD is base, BND is pegged 1:1 by MAS treaty
        return curr;
      }

      // Small jitter between -0.05% and +0.05%
      const jitterFactor = 1 + (Math.random() - 0.49) * 0.001;
      const newRate = Number((curr.rateToSGD * jitterFactor).toPrecision(6));

      // 24h change drift slightly
      const changeDelta = (Math.random() - 0.48) * 0.04;
      const newChange = Number((curr.change24h + changeDelta).toFixed(2));

      // Update sparkline last point
      const newSparkline = [...curr.sparkline7d.slice(1), newRate];
      const newHigh = Math.max(curr.high24h, newRate);
      const newLow = Math.min(curr.low24h, newRate);

      return {
        ...curr,
        rateToSGD: newRate,
        change24h: newChange,
        high24h: newHigh,
        low24h: newLow,
        sparkline7d: newSparkline
      };
    });
  }

  // Formatting helpers
  static formatRate(rate: number, digits?: number): string {
    if (digits !== undefined) return rate.toFixed(digits);
    if (rate >= 100) return rate.toFixed(2);
    if (rate >= 1) return rate.toFixed(4);
    if (rate >= 0.01) return rate.toFixed(4);
    if (rate >= 0.001) return rate.toFixed(6);
    return rate.toFixed(7);
  }

  static formatAmount(val: number, code?: string): string {
    if (val === 0) return '0.00';
    if (code === 'IDR' || code === 'VND' || code === 'KRW') {
      return new Intl.NumberFormat('en-SG', { maximumFractionDigits: 0 }).format(val);
    }
    if (code === 'JPY') {
      return new Intl.NumberFormat('en-SG', { maximumFractionDigits: 2 }).format(val);
    }
    return new Intl.NumberFormat('en-SG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: val < 10 ? 4 : 2
    }).format(val);
  }

  // Call serverless /api/exchangerates endpoint
  static async fetchMasRates(endOfDay?: string, customKeyId?: string): Promise<{ success: boolean; rates?: Record<string, any>; message?: string }> {
    try {
      const url = endOfDay ? `/api/exchangerates?end_of_day=${encodeURIComponent(endOfDay)}` : '/api/exchangerates';
      const headers: Record<string, string> = {
        'Accept': 'application/json'
      };
      if (customKeyId) {
        headers['KeyId'] = customKeyId;
      }

      const res = await fetch(url, { headers });
      const data = await res.json();
      return data;
    } catch (err: any) {
      return { success: false, message: err?.message || 'Network error contacting /api/exchangerates' };
    }
  }

  // Call serverless /api/health endpoint
  static async checkHealth(): Promise<{ status: string; masGateway?: { keyConfigured: boolean } }> {
    try {
      const res = await fetch('/api/health');
      return await res.json();
    } catch {
      return { status: 'offline' };
    }
  }
}

