import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
  Legend,
} from "recharts";
import type { BankData } from "../../types";
import { getBankTypeColor, formatNumber, calculatePercentile } from "../../lib/utils";

interface ScatterPlotProps {
  banks: BankData[];
  xMetric: keyof BankData;
  yMetric: keyof BankData;
  title: string;
  xLabel: string;
  yLabel: string;
  xUnit?: string;
  yUnit?: string;
}

export function ScatterPlotChart({
  banks,
  xMetric,
  yMetric,
  title,
  xLabel,
  yLabel,
  xUnit = "%",
  yUnit = "%",
}: ScatterPlotProps) {
  const groupedData = {
    Conventional: banks
      .filter((b) => b.type === "Conventional")
      .map((b) => ({
        x: b[xMetric] as number,
        y: b[yMetric] as number,
        name: b.shortName,
        assets: b.totalAssets,
      })),
    Islamic: banks
      .filter((b) => b.type === "Islamic")
      .map((b) => ({
        x: b[xMetric] as number,
        y: b[yMetric] as number,
        name: b.shortName,
        assets: b.totalAssets,
      })),
    Microfinance: banks
      .filter((b) => b.type === "Microfinance")
      .map((b) => ({
        x: b[xMetric] as number,
        y: b[yMetric] as number,
        name: b.shortName,
        assets: b.totalAssets,
      })),
  };

  // Calculate axis domains using 95th percentile to handle outliers
  const allData = [
    ...groupedData.Conventional,
    ...groupedData.Islamic,
    ...groupedData.Microfinance,
  ];

  const xValues = allData.map((d) => d.x).filter((v) => !isNaN(v) && isFinite(v));
  const yValues = allData.map((d) => d.y).filter((v) => !isNaN(v) && isFinite(v));

  const xPercentile95 = calculatePercentile(xValues, 95);
  const yPercentile95 = calculatePercentile(yValues, 95);

  const xDomain = [Math.min(0, Math.min(...xValues)), xPercentile95 * 1.1];
  const yDomain = [Math.min(0, Math.min(...yValues)), yPercentile95 * 1.1];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="text-sm font-semibold text-slate-900 mb-4">{title}</h3>
      <div className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="x"
              name={xLabel}
              unit={xUnit}
              domain={xDomain}
              tick={{ fontSize: 11, fill: "#64748b" }}
              label={{
                value: xLabel,
                position: "bottom",
                style: { fontSize: 11, fill: "#64748b" },
              }}
            />
            <YAxis
              dataKey="y"
              name={yLabel}
              unit={yUnit}
              domain={yDomain}
              tick={{ fontSize: 11, fill: "#64748b" }}
              label={{
                value: yLabel,
                angle: -90,
                position: "insideLeft",
                style: { fontSize: 11, fill: "#64748b" },
              }}
            />
            <ZAxis dataKey="assets" range={[40, 400]} />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                fontSize: "12px",
              }}
              formatter={(value: any, name: any) => [
                `${value.toFixed(1)}`,
                name,
              ]}
              labelFormatter={() => ""}
              content={({ payload }) => {
                if (!payload || payload.length === 0) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-lg text-xs">
                    <p className="font-semibold text-slate-900">{d.name}</p>
                    <p className="text-slate-600">
                      {xLabel}: {d.x?.toFixed(1)}{xUnit}
                    </p>
                    <p className="text-slate-600">
                      {yLabel}: {d.y?.toFixed(1)}{yUnit}
                    </p>
                    <p className="text-slate-500">
                      Assets: {formatNumber(d.assets)}
                    </p>
                  </div>
                );
              }}
            />
            <Legend wrapperStyle={{ fontSize: "11px" }} />
            {Object.entries(groupedData).map(([type, data]) => (
              <Scatter
                key={type}
                name={type}
                data={data}
                fill={getBankTypeColor(type)}
                opacity={0.8}
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
