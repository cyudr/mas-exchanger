import type { Request, Response } from 'express';

export interface HealthResponse {
  status: 'ok' | 'degraded' | 'error';
  service: string;
  timestamp: string;
  environment: string;
  masGateway: {
    endpoint: string;
    keyConfigured: boolean;
    keyIdLength?: number;
  };
  uptimeSeconds: number;
}

/**
 * Serverless health check handler
 * Path: /api/health
 */
export default async function handler(req: Request, res: Response) {
  // Support CORS if invoked externally in serverless mode
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, KeyId, x-api-key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const keyId = process.env.MAS_KEY_ID || process.env.MAS_API_KEY || (req.headers['keyid'] as string) || '';

  const healthData: HealthResponse = {
    status: 'ok',
    service: 'MAS Singapore Exchange Rates API Gateway',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    masGateway: {
      endpoint: 'https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610ora/exchange_rates_end_of_period_daily/views/exchange_rates_end_of_period_daily',
      keyConfigured: Boolean(keyId && keyId !== 'YOUR_MAS_KEY_ID'),
      ...(keyId && keyId !== 'YOUR_MAS_KEY_ID' ? { keyIdLength: keyId.length } : {})
    },
    uptimeSeconds: Math.floor(process.uptime ? process.uptime() : 0)
  };

  return res.status(200).json(healthData);
}

export { handler };
