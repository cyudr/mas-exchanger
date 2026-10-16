export type CurrencyRegion = 'ASEAN' | 'Major' | 'Asia' | 'Americas' | 'Europe' | 'Middle East';

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  country: string;
  region: CurrencyRegion;
  // 1 unit of foreign currency = X SGD (e.g. 1 USD = 1.3450 SGD)
  rateToSGD: number;
  // MAS official quotation unit: 100 for JPY, MYR, IDR, THB, INR, KRW, TWD, PHP, VND, HKD
  masQuotationUnit: 1 | 100;
  change24h: number; // percentage, e.g. +0.35 or -0.18
  high24h: number;
  low24h: number;
  sparkline7d: number[];
  popularForSingaporeans?: boolean;
  notes?: string;
  decimals?: number;
}

export interface ConversionResult {
  fromAmount: number;
  fromCode: string;
  toCode: string;
  toAmount: number;
  midRate: number;
  inverseRate: number;
  feeEstimate: {
    midMarket: number;
    bankTransfer: number; // ~1.2% spread
    moneyChanger: number; // ~0.6% spread
    multiCurrencyCard: number; // ~0.3% spread
  };
}

export interface MASConfig {
  apiKey: string;
  apiEndpoint: string;
  useLiveSimulation: boolean;
  refreshIntervalSeconds: number;
  customSpreadPercent: number;
}

export interface HistoricalPoint {
  date: string;
  rate: number;
}
