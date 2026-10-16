import React, { useState } from 'react';
import { Currency } from '../types/fx';
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

  const days = ['D-6', 'D-5', 'D-4', 'D-3', 'D-2', 'Yest', 'Today'];

  const width = 600;
  const height = 160;
  const paddingX = 35;
  const paddingY = 24;

  const coords = points.map((p, i) => {
    const x = paddingX + (i / (points.length - 1)) * (width - 2 * paddingX);
    const y = height - paddingY - ((p - min) / range) * (height - 2 * paddingY);
    return { x, y, val: p, day: days[i] };
  });

  const pathD = coords.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const fillD = `${pathD} L ${coords[coords.length - 1].x} ${height - paddingY} L ${coords[0].x} ${height - paddingY} Z`;
  const activePoint = hoveredIndex !== null ? coords[hoveredIndex] : coords[coords.length - 1];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-6">
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-2xl shrink-0">{currency.flag}</span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base truncate">
                {currency.code}/{baseCode} 7-Day Trend
              </h3>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-slate-500 mt-0.5">
              <span>Hi: {RatesService.formatRate(max)}</span>
              <span>·</span>
              <span>Lo: {RatesService.formatRate(min)}</span>
              <span className="hidden xs:inline">·</span>
              <span className="hidden xs:inline">Avg: {RatesService.formatRate(avg)}</span>
            </div>
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="text-sm sm:text-base font-extrabold text-slate-900 tabular-nums">
            S$ {RatesService.formatRate(activePoint.val)}
          </div>
          <div className="text-[10px] text-slate-400 font-medium">{activePoint.day}</div>
        </div>
      </div>

      {/* Responsive SVG Chart */}
      <div className="w-full mt-3 overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-32 sm:h-40 overflow-visible select-none touch-pan-x"
        >
          {/* Subtle horizontal grid lines */}
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

          {/* Area fill */}
          <path
            d={fillD}
            fill={isPositive ? 'rgba(22, 163, 74, 0.08)' : 'rgba(225, 29, 72, 0.08)'}
          />

          {/* Line */}
          <path
            d={pathD}
            fill="none"
            stroke={isPositive ? '#16a34a' : '#e11d48'}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Touch interactive data points */}
          {coords.map((pt, i) => (
            <g key={i}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r={hoveredIndex === i ? 6 : 4}
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
                onTouchStart={() => setHoveredIndex(i)}
              />
              <text
                x={pt.x}
                y={height - 6}
                textAnchor="middle"
                className="text-[10px] fill-slate-400 font-sans"
              >
                {pt.day}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};
