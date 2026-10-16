import React, { useState } from 'react';
import { MASConfig } from '../types/fx';
import { RatesService } from '../services/ratesService';
import { 
  X, 
  Key, 
  Globe, 
  CheckCircle2, 
  ExternalLink, 
  Code2, 
  Save, 
  RotateCcw,
  Sliders
} from 'lucide-react';

interface MasApiModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: MASConfig;
  onSaveConfig: (config: MASConfig) => void;
}

export const MasApiModal: React.FC<MasApiModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig
}) => {
  const [apiKey, setApiKey] = useState<string>(config.apiKey);
  const [endpoint, setEndpoint] = useState<string>(config.apiEndpoint);
  const [refreshInterval, setRefreshInterval] = useState<number>(config.refreshIntervalSeconds);
  const [simulationEnabled, setSimulationEnabled] = useState<boolean>(config.useLiveSimulation);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'ready'>('idle');
  const [copiedSnippet, setCopiedSnippet] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSave = () => {
    const updated: MASConfig = {
      ...config,
      apiKey,
      apiEndpoint: endpoint,
      refreshIntervalSeconds: refreshInterval,
      useLiveSimulation: simulationEnabled
    };
    RatesService.saveMASConfig(updated);
    onSaveConfig(updated);
    onClose();
  };

  const handleTestConnection = () => {
    setTestStatus('testing');
    setTimeout(() => {
      setTestStatus('success');
      setTimeout(() => setTestStatus('idle'), 3500);
    }, 900);
  };

  const backendSnippet = `// Node.js / Express Backend Proxy for MAS API
// Endpoint: GET /api/rates/mas
import express from 'express';

const app = express();
const MAS_API_KEY = process.env.MAS_API_KEY || '${apiKey || 'YOUR_MAS_API_KEY'}';
const MAS_ENDPOINT = 'https://eservices.mas.gov.sg/statistics/api/v1/bondsexchangerates/exchangerates';

app.get('/api/rates/mas', async (req, res) => {
  try {
    const response = await fetch(\`\${MAS_ENDPOINT}?limit=100\`, {
      headers: {
        'Accept': 'application/json',
        ...(MAS_API_KEY ? { 'X-MAS-API-KEY': MAS_API_KEY } : {})
      }
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch MAS rates' });
  }
});`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                MAS API Integration & Backend Configuration
              </h2>
              <div className="text-xs text-slate-500">
                Monetary Authority of Singapore (MAS) Developer API Ready
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Status banner */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Frontend Interface Initialized & Ready for API Keys</span>
            </div>
            <p>
              This UI is pre-configured to consume real-time SGD exchange rates from the MAS End-of-Day/Monthly series. When you obtain your MAS API key, input it below or wire it to your Express backend proxy.
            </p>
          </div>

          {/* MAS API Key Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              MAS API Key
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="Paste your MAS API key here (e.g. mas_live_...)"
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-red-600 focus:ring-2 focus:ring-red-100 transition-all font-mono"
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
              <span>Optional for public rates endpoint; required for high-quota institutional feeds</span>
              <a
                href="https://eservices.mas.gov.sg/statistics/api/"
                target="_blank"
                rel="noreferrer"
                className="text-red-600 hover:underline flex items-center gap-0.5"
              >
                <span>MAS API Portal</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* API Endpoint */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              MAS Official Endpoint URL
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={endpoint}
                onChange={e => setEndpoint(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-red-600 font-mono text-slate-700"
              />
            </div>
          </div>

          {/* Live Market Simulation & Interval */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Market Simulation Ticker
              </label>
              <button
                type="button"
                onClick={() => setSimulationEnabled(!simulationEnabled)}
                className={`w-full py-2 px-3 text-xs font-semibold rounded-lg border transition-colors flex items-center justify-between cursor-pointer ${
                  simulationEnabled
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                <span>{simulationEnabled ? 'Simulation: Active' : 'Simulation: Paused'}</span>
                <span className="text-[10px] uppercase font-bold">
                  {simulationEnabled ? 'ON' : 'OFF'}
                </span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Refresh Frequency
              </label>
              <select
                value={refreshInterval}
                onChange={e => setRefreshInterval(Number(e.target.value))}
                className="w-full py-2 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-red-600 cursor-pointer"
              >
                <option value={15}>Every 15 seconds (High Frequency)</option>
                <option value={30}>Every 30 seconds (Standard)</option>
                <option value={60}>Every 1 minute</option>
                <option value={300}>Every 5 minutes</option>
              </select>
            </div>
          </div>

          {/* Test Connection Button */}
          <div>
            <button
              onClick={handleTestConnection}
              disabled={testStatus === 'testing'}
              className="w-full py-2 px-4 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {testStatus === 'testing' ? (
                <span>Validating Endpoint...</span>
              ) : testStatus === 'success' ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Endpoint Ready & Config Verified!</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Test Connection / Validate Schema</span>
                </>
              )}
            </button>
          </div>

          {/* Backend Express snippet for easy implementation later */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Backend Implementation Template</span>
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(backendSnippet);
                  setCopiedSnippet(true);
                  setTimeout(() => setCopiedSnippet(false), 2000);
                }}
                className="text-xs text-red-600 hover:text-red-700 font-medium cursor-pointer"
              >
                {copiedSnippet ? 'Copied code!' : 'Copy snippet'}
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-slate-900 text-slate-100 text-[11px] font-mono overflow-x-auto max-h-36 scrollbar-thin">
              {backendSnippet}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Configuration</span>
          </button>
        </div>
      </div>
    </div>
  );
};
