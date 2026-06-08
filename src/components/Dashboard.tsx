import { useState } from 'react';
import { FootprintData, CarbonSummary } from '../types';
import {
  Trees,
  Car,
  Zap,
  Utensils,
  ShoppingBag,
  Sparkles,
  Info,
  TrendingDown,
  LineChart,
} from 'lucide-react';

interface DashboardProps {
  footprintData: FootprintData;
  summary: CarbonSummary;
  greenPoints: number;
  totalSavedCo2: number;
}

export default function Dashboard({
  footprintData,
  summary,
  greenPoints,
  totalSavedCo2,
}: DashboardProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Equivalencies calculations
  const forestPlantedYearly = Math.round(summary.totalYearlyTons * 40); // 1 ton co2 ≈ 40 trees/yr absorption
  const gasolineMilesDaily = Math.round(summary.totalDailyKg * 2.5); // 1 kg co2 ≈ 2.5 miles driven

  // Benchmark metrics
  const targetYearlyTons = 2.0; // Global 1.5C stabilization goals per capita
  const usAverageYearlyTons = 16.0;

  // Percentage compared to target
  const pctOfTarget = Math.min(Math.round((summary.totalYearlyTons / targetYearlyTons) * 100), 500);

  const categories = [
    {
      id: 'transport',
      name: 'Mobility & Travel',
      value: summary.transportDailyKg,
      icon: Car,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600',
      borderColor: 'border-indigo-100',
      description: `Based on driving ${footprintData.carKmWeekly}km/week using ${footprintData.carType} fuel.`,
    },
    {
      id: 'energy',
      name: 'Home Utilities',
      value: summary.energyDailyKg,
      icon: Zap,
      color: 'bg-amber-500',
      textColor: 'text-amber-600',
      borderColor: 'border-amber-100',
      description: `Grid consumption of ${footprintData.electricityMonthlyKwh} kWh/mo with ${footprintData.cleanEnergyPercentage}% renewable energy.`,
    },
    {
      id: 'food',
      name: 'Sustainable Diet',
      value: summary.foodDailyKg,
      icon: Utensils,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-600',
      borderColor: 'border-emerald-100',
      description: `Identified as a daily ${footprintData.dietType} diet with ${footprintData.foodWasteLevel} household scrap level.`,
    },
    {
      id: 'waste',
      name: 'Services & Goods',
      value: summary.wasteDailyKg,
      icon: ShoppingBag,
      color: 'bg-rose-500',
      textColor: 'text-rose-600',
      borderColor: 'border-rose-100',
      description: `Evaluates purchasing clothing, devices, and recycling rating of ${footprintData.recyclingRating}/5.`,
    },
  ];

  return (
    <div id="dashboard-view" className="space-y-6">
      {/* Prime Analytics Stats Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 text-white rounded-2xl p-6 relative overflow-hidden shadow-sm">
          <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4">
            <Trees size={160} />
          </div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-300">Annual Footprint</h3>
            <span className="bg-white/15 px-2.5 py-1 rounded-full text-xs font-semibold text-emerald-300 flex items-center gap-1">
              <TrendingDown size={12} /> CO₂e
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-display text-4xl font-extrabold text-white">
              {summary.totalYearlyTons}
            </span>
            <span className="text-slate-300 text-sm font-medium">Metric Tons / yr</span>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Global Goal per person: 2.0 t</span>
            <span className={summary.totalYearlyTons < 6.5 ? 'text-emerald-300' : 'text-amber-300'}>
              {pctOfTarget}% of climate target
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500">Green Streak Reward</h3>
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Sparkles size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-display text-4xl font-extrabold text-slate-900">
              {greenPoints}
            </span>
            <span className="text-slate-400 text-xs font-mono ml-1">COACH POINTS</span>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 leading-relaxed">
            Accumulated by logging eco-actions today. Use points to measure your real habit consistency!
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500">Total Offsets Logged</h3>
            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Trees size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-display text-4xl font-extrabold text-slate-900">
              {totalSavedCo2.toFixed(1)}
            </span>
            <span className="text-slate-400 text-sm font-medium ml-1">kg CO₂e</span>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 leading-relaxed">
            Total verified emissions eliminated through active eco-challenges logged so far.
          </div>
        </div>
      </div>

      {/* Benchmarking Comparison */}
      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
        <h4 className="font-display font-semibold text-slate-800 text-sm mb-4 flex items-center gap-2">
          <span>🎯 Environmental Benchmark Analysis</span>
        </h4>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs mb-1 text-slate-600">
              <span>Your Current Level ({summary.totalYearlyTons} Metric Tons)</span>
              <span className="font-semibold text-slate-700">Annual Target ({targetYearlyTons} Tons)</span>
            </div>
            <div className="w-full bg-slate-200 h-6.5 rounded-full overflow-hidden flex relative">
              <div
                className="bg-emerald-500 h-full transition-all duration-500"
                style={{ width: `${Math.max(10, Math.min(100, (targetYearlyTons / usAverageYearlyTons) * 100))}%` }}
                title="Sustainable climate target (2 Tons)"
              />
              <div
                className="bg-indigo-500/50 h-full absolute top-0 left-0 transition-all duration-500 border-r border-indigo-600"
                style={{ width: `${Math.max(5, Math.min(100, (summary.totalYearlyTons / usAverageYearlyTons) * 100))}%` }}
                title="Your individual level"
              />
              {/* Target Line marker */}
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-emerald-600 pointer-events-none"
                style={{ left: `${(targetYearlyTons / usAverageYearlyTons) * 100}%` }}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-center text-xs">
            <div className="bg-white p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 block mb-1">US Annual Average</span>
              <strong className="text-slate-700 text-sm">~16.0 Tons</strong>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 block mb-1">European Average</span>
              <strong className="text-slate-700 text-sm">~7.0 Tons</strong>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 block mb-1">Global Target Rate</span>
              <strong className="text-emerald-600 text-sm">≤ 2.0 Tons</strong>
            </div>
          </div>
          <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-100/40 text-xs text-indigo-900 flex items-start gap-2.5">
            <Info size={16} className="text-indigo-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Your carbon status is classified as <span className="font-semibold">{summary.percentileText}</span>.
            </p>
          </div>
        </div>
      </div>

      {/* Circular & SVG Visual Chart Segment */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Custom SVG Graph */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs lg:col-span-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
            <div>
              <h3 className="font-display font-semibold text-slate-900 text-base flex items-center gap-2">
                <LineChart className="text-emerald-500" size={18} />
                <span>Sector Emissions Breakdown (Daily Contribution)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Hover over sectors and bars to see exact values. Log today's actions to see values drop!
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-xs">
              <span className="flex items-center gap-1.5"><button className="w-3 h-3 bg-indigo-500 rounded-sm" />Mobility</span>
              <span className="flex items-center gap-1.5"><button className="w-3 h-3 bg-amber-500 rounded-sm" />Energy</span>
              <span className="flex items-center gap-1.5"><button className="w-3 h-3 bg-emerald-500 rounded-sm" />Food</span>
              <span className="flex items-center gap-1.5"><button className="w-3 h-3 bg-rose-500 rounded-sm" />Goods</span>
            </div>
          </div>

          <div className="relative aspect-video max-h-72 w-full flex items-center justify-center">
            {/* Elegant Custom Intersecting SVG Bar chart with grids */}
            <svg viewBox="0 0 600 240" className="w-full h-full text-slate-200">
              {/* Grids lines */}
              <line x1="40" y1="20" x2="580" y2="20" stroke="currentColor" strokeDasharray="3,3" strokeWidth="0.8" />
              <line x1="40" y1="70" x2="580" y2="70" stroke="currentColor" strokeDasharray="3,3" strokeWidth="0.8" />
              <line x1="40" y1="120" x2="580" y2="120" stroke="currentColor" strokeDasharray="3,3" strokeWidth="0.8" />
              <line x1="40" y1="170" x2="580" y2="170" stroke="currentColor" strokeDasharray="3,3" strokeWidth="0.8" />
              <line x1="40" y1="220" x2="580" y2="220" stroke="currentColor" strokeWidth="1" />

              {/* Grid Labels */}
              <text x="12" y="24" className="fill-slate-400 font-mono text-[10px]" textAnchor="start">20 kg</text>
              <text x="12" y="74" className="fill-slate-400 font-mono text-[10px]" textAnchor="start">15 kg</text>
              <text x="12" y="124" className="fill-slate-400 font-mono text-[10px]" textAnchor="start">10 kg</text>
              <text x="12" y="174" className="fill-slate-400 font-mono text-[10px]" textAnchor="start">5 kg</text>
              <text x="12" y="224" className="fill-slate-400 font-mono text-[10px]" textAnchor="start">0 kg</text>

              {/* Stacked Chart calculation */}
              {(() => {
                const maxEmissions = 20; // baseline height ceiling
                const scaleY = (val: number) => {
                  const safeVal = Math.min(val, maxEmissions);
                  return 220 - (safeVal / maxEmissions) * 200;
                };

                const labels = ['Commute / Air', 'Utility Grids', 'Diet Structure', 'Goods & Waste'];
                const values = [summary.transportDailyKg, summary.energyDailyKg, summary.foodDailyKg, summary.wasteDailyKg];
                const colors = ['#6366f1', '#f59e0b', '#10b981', '#f43f5e'];

                return values.map((val, idx) => {
                  const width = 64;
                  const x = 70 + idx * 135;
                  const y = scaleY(val);
                  const height = Math.max(2, 220 - y);
                  const isHovered = hoveredCategory === categories[idx].id;

                  return (
                    <g
                      key={idx}
                      className="cursor-pointer group"
                      onMouseEnter={() => setHoveredCategory(categories[idx].id)}
                      onMouseLeave={() => setHoveredCategory(null)}
                    >
                      {/* Interactive block hover */}
                      <rect
                        x={x - 12}
                        y="10"
                        width={width + 24}
                        height="215"
                        fill="transparent"
                        className="group-hover:fill-slate-50/20 transition-all duration-200"
                        rx="8"
                      />
                      {/* Gradient definition within bars */}
                      <rect
                        x={x}
                        y={y}
                        width={width}
                        height={height}
                        fill={colors[idx]}
                        opacity={hoveredCategory ? (isHovered ? '1.0' : '0.4') : '0.8'}
                        className="transition-all duration-300"
                        rx="6"
                      />
                      {/* Value labeling on top */}
                      <text
                        x={x + width / 2}
                        y={y - 8}
                        className={`font-mono text-xs font-semibold fill-slate-700 transition-opacity duration-200 text-center ${
                          isHovered ? 'opacity-100' : 'opacity-0 sm:opacity-100'
                        }`}
                        textAnchor="middle"
                      >
                        {val} kg
                      </text>
                      {/* Category Labeling under axis */}
                      <text
                        x={x + width / 2}
                        y="236"
                        className={`fill-slate-500 font-sans text-[11px] transition-all duration-200 ${
                          isHovered ? 'fill-slate-900 font-medium' : ''
                        }`}
                        textAnchor="middle"
                      >
                        {labels[idx]}
                      </text>
                    </g>
                  );
                });
              })()}
            </svg>
          </div>
        </div>

        {/* Dynamic Category Card Blocks */}
        <div className="lg:col-span-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((c) => {
            const IconComponent = c.icon;
            const isHovered = hoveredCategory === c.id;
            return (
              <div
                id={`card-cat-${c.id}`}
                key={c.id}
                className={`flex flex-col p-5 rounded-2xl border transition-all duration-200 ${
                  isHovered
                    ? `${c.borderColor} bg-slate-50/50 shadow-xs translate-y-[-2px]`
                    : 'border-slate-100 bg-white'
                }`}
                onMouseEnter={() => setHoveredCategory(c.id)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2.5 rounded-xl ${c.color} text-white`}>
                    <IconComponent size={18} />
                  </div>
                  <span className="text-xs font-semibold font-mono text-slate-400 uppercase tracking-wider">
                    {c.id}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-slate-800 leading-tight mb-1">
                  {c.name}
                </h4>
                <div className="mt-auto pt-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-mono font-extrabold text-slate-900">
                      {c.value.toFixed(1)}
                    </span>
                    <span className="text-slate-400 text-xs">kg / day</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal mt-1.5 min-h-[32px] line-clamp-2">
                    {c.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Translation Equivalency Widgets */}
        <div className="lg:col-span-12 bg-white rounded-2xl p-6 border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6 relative shadow-xs">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <Trees size={20} />
              </div>
              <strong className="text-slate-800 text-sm font-semibold font-display">
                Equivalent Tree Absorption Requirement
              </strong>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-3">
              To neutralize your yearly carbon discharge, a baseline of mature trees must actively filter environmental parameters on your behalf.
            </p>
            <div className="bg-slate-50 rounded-xl p-4 flex items-baseline gap-2">
              <span className="text-3xl font-mono font-extrabold text-emerald-600">
                {forestPlantedYearly}
              </span>
              <span className="text-xs font-medium text-slate-600 font-sans">
                mature trees planting required
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <Car size={20} />
              </div>
              <strong className="text-slate-800 text-sm font-semibold font-display">
                Equal Gasoline Commute Distance
              </strong>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-3">
              Your daily routine generates greenhouse gases equivalent to driving a standard passenger car a specific set of highway miles.
            </p>
            <div className="bg-slate-50 rounded-xl p-4 flex items-baseline gap-2">
              <span className="text-3xl font-mono font-extrabold text-indigo-600">
                {gasolineMilesDaily}
              </span>
              <span className="text-xs font-medium text-slate-600 font-sans">
                daily highway miles equivalent
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
