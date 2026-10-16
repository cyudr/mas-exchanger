import React, { useState } from 'react';
import { Currency } from '../types/fx';
import { TrendingUp, TrendingDown, Calendar, BarChart2 } from 'lucide-react';
import { RatesService } from '../services/ratesService';

interface HistoricalChartProps {
  currency: Currency;
  baseCode?: string;
}

export const HistoricalChart: React.FC<HistoricalChartProps> = ({ currency, baseCode = 'SGD' }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const points = currency.sparkline7d;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const avg = points.reduce((a, b) => a + b, 0) / points.length;
  const range = max - min === 0 ? 0.0001 : max - min;
  const isPositive = currency.change24h >= 0;

  // Generate 7 day labels counting back from today
  const days = ['Day -6', 'Day -5', 'Day -4', 'Day -3', 'Day -2', 'Yesterday', 'Today'];

  const width = 600;
  const height = 160;
  const paddingX = 40;
  const paddingY = 24;

  const getCoordinates = () => {
    return points.map((p, i) => {
      const x = paddingX + (i / (points.length - 1)) * (width - 2 * paddingX);
      const y = height - paddingY - ((p - min) / range) * (height - 2 * paddingY);
      return { x, y, val: p, day: days[i] };
    });
  };

  const coords = getCoordinates();
  const pathD = coords.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  // Fill area under line
  const fillD = `${pathD} L ${coords[coords.length - 1].x} ${height - paddingY} L ${coords[0].x} ${height - paddingY} Z`;

  const activePoint = hoveredIndex !== null ? coords[hoveredIndex] : coords[coords.length - 1];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">{currency.flag}</span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-base">
                {currency.code} / {baseCode} 7-Day Performance
              </h3>
              <span className="text-xs text-slate-400 font-normal">{currency.name}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span>High: S$ {RatesService.formatRate(max)}</span>
              <span>·</span>
              <span>Low: S$ {RatesService.formatRate(min)}</span>
              <span>·</span>
              <span>Avg: S$ {RatesService.formatRate(avg)}</span>
            </div>
          </div>
        </div>

        <div className="text-right self-start sm:self-auto">
          <div className="text-base font-bold text-slate-900 tabular-nums">
            S$ {RatesService.formatRate(activePoint.val)}
          </div>
          <div className="text-[11px] text-slate-500">{activePoint.day}</div>
        </div>
      </div>

      {/* SVG Responsive Container */}
      <div className="w-full mt-4 overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-44 overflow-visible select-none"
        >
          {/* Subtle grid lines */}
          <line
            x1={paddingX}
            y1={paddingY}
            x2={width - paddingX}
            y2={paddingY}
            stroke="#f1f5f9"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={height / 2}
            x2={width - paddingX}
            y2={height / 2}
            stroke="#f1f5f9"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={height - paddingY}
            x2={width - paddingX}
            y2={height - paddingY}
            stroke="#f1f5f9"
          />

          {/* Area Fill */}
          <path
            d={fillD}
            fill={isPositive ? 'rgba(22, 163, 74, 0.08)' : 'rgba(225, 29, 72, 0.08)'}
          />

          {/* Main Line */}
          <path
            d={pathD}
            fill="none"
            stroke={isPositive ? '#16a34a' : '#e11d48'}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Points */}
          {coords.map((pt, i) => (
            <g key={i}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r={hoveredIndex === i ? 6 : 3.5}
                className={`transition-all cursor-pointer ${
                  hoveredIndex === i
                    ? isPositive
                      ? 'fill-emerald-600 stroke-white stroke-2'
                      : 'fill-rose-600 stroke-white stroke-2'
                    : isPositive
                    ? 'fill-emerald-500'
                    : 'fill-rose-500'
                }`}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
              <text
                x={pt.x}
                y={height - 6}
                textAnchor="middle"
                className="text-[10px] fill-slate-400 font-sans"
              >
                {pt.day.replace('Day ', 'D')}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};
