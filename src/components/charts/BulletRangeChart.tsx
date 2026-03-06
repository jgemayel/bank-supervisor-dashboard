import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MetricData {
  label: string;
  value: number;
  sectorAverage: number;
  thresholdGood: number;
  thresholdCaution: number;
  thresholdDanger: number;
  higherIsBetter: boolean;
  unit: string;
  baselStandard: string;
  bestPractice: string;
}

interface BulletRangeChartProps {
  metrics: MetricData[];
  bankName: string;
}

/**
 * Calculates the display range for the bullet chart
 */
function calculateRange(metrics: MetricData[]): { min: number; max: number } {
  let maxValue = 0;
  metrics.forEach((metric) => {
    const thresholds = [
      metric.thresholdGood,
      metric.thresholdCaution,
      metric.thresholdDanger,
      metric.value,
      metric.sectorAverage,
    ];
    maxValue = Math.max(maxValue, ...thresholds);
  });
  return {
    min: 0,
    max: maxValue * 1.2,
  };
}

/**
 * Converts a value to a pixel position within the bar
 */
function getPositionPercent(value: number, min: number, max: number): number {
  if (max === min) return 50;
  return ((value - min) / (max - min)) * 100;
}

/**
 * Determines the status color based on value relative to thresholds
 */
function getStatusColor(
  value: number,
  thresholdGood: number,
  thresholdCaution: number,
  _thresholdDanger: number,
  higherIsBetter: boolean
): string {
  if (higherIsBetter) {
    if (value >= thresholdGood) return 'text-green-600';
    if (value >= thresholdCaution) return 'text-amber-600';
    return 'text-red-600';
  } else {
    if (value <= thresholdGood) return 'text-green-600';
    if (value <= thresholdCaution) return 'text-amber-600';
    return 'text-red-600';
  }
}

/**
 * Renders a single metric bullet range chart
 */
function MetricRow({
  metric,
  range,
}: {
  metric: MetricData;
  range: { min: number; max: number };
}): ReactNode {
  const valuePercent = getPositionPercent(metric.value, range.min, range.max);
  const sectorPercent = getPositionPercent(
    metric.sectorAverage,
    range.min,
    range.max
  );

  // Calculate zone positions
  let goodStart: number;
  let goodEnd: number;
  let cautionStart: number;
  let cautionEnd: number;
  let dangerStart: number;
  let dangerEnd: number;

  if (metric.higherIsBetter) {
    // For higher is better: danger (left) -> caution (middle) -> good (right)
    dangerStart = 0;
    dangerEnd = getPositionPercent(
      metric.thresholdDanger,
      range.min,
      range.max
    );
    cautionStart = dangerEnd;
    cautionEnd = getPositionPercent(
      metric.thresholdCaution,
      range.min,
      range.max
    );
    goodStart = cautionEnd;
    goodEnd = 100;
  } else {
    // For lower is better: good (left) -> caution (middle) -> danger (right)
    goodStart = 0;
    goodEnd = getPositionPercent(
      metric.thresholdGood,
      range.min,
      range.max
    );
    cautionStart = goodEnd;
    cautionEnd = getPositionPercent(
      metric.thresholdCaution,
      range.min,
      range.max
    );
    dangerStart = cautionEnd;
    dangerEnd = 100;
  }

  const statusColor = getStatusColor(
    metric.value,
    metric.thresholdGood,
    metric.thresholdCaution,
    metric.thresholdDanger,
    metric.higherIsBetter
  );

  return (
    <div key={metric.label} className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex-shrink-0">
          <p className="text-xs font-medium text-gray-700 dark:text-slate-300">{metric.label}</p>
          <p className="text-xs text-gray-500 dark:text-slate-500 mt-0.5">
            Basel: {metric.baselStandard} | Best: {metric.bestPractice}
          </p>
        </div>
        <div className="flex-shrink-0 ml-4">
          <p className={cn('text-sm font-bold', statusColor)}>
            {metric.value.toFixed(2)}
            <span className="text-gray-600 dark:text-slate-400 text-xs font-normal ml-1">
              {metric.unit}
            </span>
          </p>
        </div>
      </div>

      {/* Bullet Range Bar */}
      <div className="relative w-full bg-gray-100 dark:bg-slate-700 rounded h-8 overflow-hidden shadow-sm">
        {/* Good Zone */}
        <div
          className="absolute h-full bg-green-100 dark:bg-green-900 border-r border-green-200 dark:border-green-700"
          style={{
            left: `${goodStart}%`,
            width: `${goodEnd - goodStart}%`,
          }}
        />

        {/* Caution Zone */}
        <div
          className="absolute h-full bg-amber-100 dark:bg-amber-900 border-r border-amber-200 dark:border-amber-700"
          style={{
            left: `${cautionStart}%`,
            width: `${cautionEnd - cautionStart}%`,
          }}
        />

        {/* Danger Zone */}
        <div
          className="absolute h-full bg-red-100 dark:bg-red-900 border-r border-red-200 dark:border-red-700"
          style={{
            left: `${dangerStart}%`,
            width: `${dangerEnd - dangerStart}%`,
          }}
        />

        {/* Sector Average Dashed Line */}
        <div
          className="absolute top-0 bottom-0 w-px border-l-2 border-dashed border-gray-400 dark:border-slate-500"
          style={{
            left: `${sectorPercent}%`,
          }}
          title={`Sector Average: ${metric.sectorAverage.toFixed(2)}`}
        />

        {/* Bank Value Marker (solid dot) */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-gray-800 dark:bg-slate-200 rounded-full shadow-md border-2 border-white dark:border-slate-800 z-10"
          style={{
            left: `${valuePercent}%`,
          }}
          title={`Bank Value: ${metric.value.toFixed(2)}`}
        />
      </div>
    </div>
  );
}

/**
 * BulletRangeChart Component
 *
 * Displays banking prudential metrics using bullet range charts.
 * Each metric shows zones (danger, caution, good) with the bank's actual value
 * and sector average marked for comparison.
 */
export function BulletRangeChart({
  metrics,
  bankName,
}: BulletRangeChartProps): ReactNode {
  const range = calculateRange(metrics);

  return (
    <div className="w-full bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
          Prudential Compliance - {bankName}
        </h3>
        <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
          Regulatory metrics performance comparison with sector averages
        </p>
      </div>

      {/* Metrics */}
      <div className="space-y-6">
        {metrics.map((metric) => (
          <MetricRow key={metric.label} metric={metric} range={range} />
        ))}
      </div>

      {/* Legend */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-700">
        <p className="text-xs font-medium text-gray-700 dark:text-slate-300 mb-3">Legend:</p>
        <div className="grid grid-cols-2 gap-4 md:gap-8">
          {/* Markers */}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-800 dark:bg-slate-200 rounded-full" />
            <span className="text-xs text-gray-600 dark:text-slate-400">Bank Value</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-0.5 h-4 border-l-2 border-dashed border-gray-400 dark:border-slate-500" />
            <span className="text-xs text-gray-600 dark:text-slate-400">Sector Average</span>
          </div>

          {/* Zone Colors */}
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded" />
            <span className="text-xs text-gray-600 dark:text-slate-400">Good Zone</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-amber-100 dark:bg-amber-900 border border-amber-200 dark:border-amber-700 rounded" />
            <span className="text-xs text-gray-600 dark:text-slate-400">Caution Zone</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded" />
            <span className="text-xs text-gray-600 dark:text-slate-400">Danger Zone</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export type { BulletRangeChartProps };
