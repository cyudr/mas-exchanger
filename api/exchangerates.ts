import type { Request, Response } from 'express';

const MAS_BASE_URL =
  'https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610ora/exchange_rates_end_of_period_daily/views/exchange_rates_end_of_period_daily';

export interface NormalizedRate {
  code: string;
  name: string;
  rateToSGD: number; // 1 unit in SGD
  masQuotedRate: number; // Rate as officially quoted by MAS
  masQuotationUnit: 1 | 100;
  rawKey: string;
}

export interface MASApiResponse {
  success: boolean;
  source: 'mas_live' | 'fallback_offline';
  endOfDay: string;
  timestamp: string;
  recordsCount: number;
  rates: Record<string, NormalizedRate>;
  raw?: any;
  message?: string;
  error?: string;
}

/**
 * Serverless Exchange Rates handler
 * Path: /api/exchangerates
 *
 * Query params:
 *   - end_of_day: YYYY-MM-DD (defaults to latest available date)
 * Headers:
 *   - KeyId: <MAS_KEY_ID> (optional override of process.env.MAS_KEY_ID)
 */
export default async function handler(req: Request, res: Response) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, KeyId, x-api-key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Determine query date (default to today or yesterday in Singapore Time SGT / UTC+8)
  const nowSgt = new Date(Date.now() + 8 * 3600 * 1000);
  const defaultDate = nowSgt.toISOString().slice(0, 10);
  const endOfDay = (req.query.end_of_day as string) || defaultDate;

  // Retrieve KeyId from environment or incoming header without hardcoding
  const incomingKeyId =
    (req.headers['keyid'] as string) ||
    (req.headers['x-api-key'] as string) ||
    (req.query.key_id as string);

  const envKeyId = process.env.MAS_KEY_ID || process.env.MAS_API_KEY;
  const activeKeyId = (incomingKeyId || envKeyId || '').trim();

  // If no API key has been configured yet by the user
  if (!activeKeyId || activeKeyId === 'YOUR_MAS_KEY_ID') {
    return res.status(200).json({
      success: false,
      source: 'fallback_offline',
      endOfDay,
      timestamp: new Date().toISOString(),
      recordsCount: 0,
      rates: getFallbackNormalizedRates(),
      message:
        'MAS_KEY_ID is not configured in environment variables or request headers. Please add your MAS API KeyId to .env (MAS_KEY_ID=...) or pass KeyId header to activate live MAS gateway fetching.',
      instructions: {
        envVariable: 'MAS_KEY_ID',
        header: 'KeyId: <YOUR_KEY>',
        endpoint: `${MAS_BASE_URL}?end_of_day=${endOfDay}`
      }
    });
  }

  try {
    const masUrl = `${MAS_BASE_URL}?end_of_day=${encodeURIComponent(endOfDay)}`;

    const response = await fetch(masUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'KeyId': activeKeyId
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        success: false,
        source: 'mas_live',
        endOfDay,
        status: response.status,
        error: `MAS API responded with status ${response.status}`,
        details: errorText,
        rates: getFallbackNormalizedRates(),
        timestamp: new Date().toISOString()
      });
    }

    const rawData = await response.json();
    const records = rawData?.result?.records || (Array.isArray(rawData) ? rawData : []);
    const latestRecord = records[0] || {};

    const normalizedRates = parseMasRecord(latestRecord);

    const apiResponse: MASApiResponse = {
      success: true,
      source: 'mas_live',
      endOfDay,
      timestamp: new Date().toISOString(),
      recordsCount: Object.keys(normalizedRates).length,
      rates: normalizedRates,
      raw: rawData
    };

    return res.status(200).json(apiResponse);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      source: 'fallback_offline',
      endOfDay,
      error: error?.message || 'Failed to connect to MAS gateway',
      rates: getFallbackNormalizedRates(),
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Normalizes MAS field names (e.g. usd_sgd, myr_sgd_100, jpy_sgd_100)
 */
function parseMasRecord(record: Record<string, any>): Record<string, NormalizedRate> {
  const result: Record<string, NormalizedRate> = {};

  const CURRENCY_METADATA: Record<string, { name: string; is100: boolean }> = {
    usd: { name: 'United States Dollar', is100: false },
    myr: { name: 'Malaysian Ringgit', is100: true },
    eur: { name: 'Euro', is100: false },
    gbp: { name: 'British Pound', is100: false },
    jpy: { name: 'Japanese Yen', is100: true },
    aud: { name: 'Australian Dollar', is100: false },
    cad: { name: 'Canadian Dollar', is100: false },
    chf: { name: 'Swiss Franc', is100: false },
    cny: { name: 'Chinese Yuan Renminbi', is100: true },
    hkd: { name: 'Hong Kong Dollar', is100: true },
    inr: { name: 'Indian Rupee', is100: true },
    idr: { name: 'Indonesian Rupiah', is100: true },
    krw: { name: 'South Korean Won', is100: true },
    thb: { name: 'Thai Baht', is100: true },
    twd: { name: 'New Taiwan Dollar', is100: true },
    nzd: { name: 'New Zealand Dollar', is100: false },
    php: { name: 'Philippine Peso', is100: true },
    vnd: { name: 'Vietnamese Dong', is100: true },
    sek: { name: 'Swedish Krona', is100: false },
    sar: { name: 'Saudi Riyal', is100: false },
    aed: { name: 'UAE Dirham', is100: false },
    zar: { name: 'South African Rand', is100: false }
  };

  for (const [key, val] of Object.entries(record)) {
    if (key === 'end_of_day' || key === 'timestamp') continue;
    const numericVal = parseFloat(val);
    if (isNaN(numericVal)) continue;

    const lowerKey = key.toLowerCase();
    const parts = lowerKey.split('_');
    const currencyCode = parts[0]?.toUpperCase();
    if (!currencyCode) continue;

    const is100 = lowerKey.includes('_100') || CURRENCY_METADATA[parts[0]]?.is100;
    const unitRate = is100 ? numericVal / 100 : numericVal;

    result[currencyCode] = {
      code: currencyCode,
      name: CURRENCY_METADATA[parts[0]]?.name || `${currencyCode}`,
      rateToSGD: unitRate,
      masQuotedRate: numericVal,
      masQuotationUnit: is100 ? 100 : 1,
      rawKey: key
    };
  }

  // Always ensure Brunei Dollar (BND) 1:1 parity rule is preserved
  if (!result['BND']) {
    result['BND'] = {
      code: 'BND',
      name: 'Brunei Dollar',
      rateToSGD: 1.0,
      masQuotedRate: 1.0,
      masQuotationUnit: 1,
      rawKey: 'bnd_sgd'
    };
  }

  return result;
}

function getFallbackNormalizedRates(): Record<string, NormalizedRate> {
  return {
    MYR: { code: 'MYR', name: 'Malaysian Ringgit', rateToSGD: 0.3018, masQuotedRate: 30.18, masQuotationUnit: 100, rawKey: 'myr_sgd_100' },
    USD: { code: 'USD', name: 'United States Dollar', rateToSGD: 1.3440, masQuotedRate: 1.3440, masQuotationUnit: 1, rawKey: 'usd_sgd' },
    JPY: { code: 'JPY', name: 'Japanese Yen', rateToSGD: 0.00892, masQuotedRate: 0.8920, masQuotationUnit: 100, rawKey: 'jpy_sgd_100' },
    EUR: { code: 'EUR', name: 'Euro', rateToSGD: 1.4580, masQuotedRate: 1.4580, masQuotationUnit: 1, rawKey: 'eur_sgd' },
    GBP: { code: 'GBP', name: 'British Pound', rateToSGD: 1.7450, masQuotedRate: 1.7450, masQuotationUnit: 1, rawKey: 'gbp_sgd' },
    AUD: { code: 'AUD', name: 'Australian Dollar', rateToSGD: 0.8780, masQuotedRate: 0.8780, masQuotationUnit: 1, rawKey: 'aud_sgd' },
    THB: { code: 'THB', name: 'Thai Baht', rateToSGD: 0.0388, masQuotedRate: 3.88, masQuotationUnit: 100, rawKey: 'thb_sgd_100' },
    IDR: { code: 'IDR', name: 'Indonesian Rupiah', rateToSGD: 0.0000832, masQuotedRate: 0.00832, masQuotationUnit: 100, rawKey: 'idr_sgd_100' },
    CNY: { code: 'CNY', name: 'Chinese Yuan Renminbi', rateToSGD: 0.1865, masQuotedRate: 18.65, masQuotationUnit: 1, rawKey: 'cny_sgd' },
    BND: { code: 'BND', name: 'Brunei Dollar', rateToSGD: 1.0000, masQuotedRate: 1.0000, masQuotationUnit: 1, rawKey: 'bnd_sgd' },
    HKD: { code: 'HKD', name: 'Hong Kong Dollar', rateToSGD: 0.1728, masQuotedRate: 17.28, masQuotationUnit: 100, rawKey: 'hkd_sgd_100' }
  };
}

export { handler };
