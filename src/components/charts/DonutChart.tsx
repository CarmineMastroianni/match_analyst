import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export interface DonutSlice {
  name: string;
  value: number;
  color: string;
}

export function DonutChart({
  data,
  height = 220,
  centerLabel,
  centerValue,
}: {
  data: DonutSlice[];
  height?: number;
  centerLabel?: string;
  centerValue?: string | number;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const safe = total === 0 ? [{ name: "Nessun dato", value: 1, color: "#E3E5EC" }] : data;
  return (
    <div className="relative w-full" style={{ height }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={safe}
            innerRadius="60%"
            outerRadius="90%"
            dataKey="value"
            stroke="none"
            paddingAngle={2}
          >
            {safe.map((d, i) => (
              <Cell key={i} fill={d.color} />
            ))}
          </Pie>
          {total > 0 && <Tooltip />}
        </PieChart>
      </ResponsiveContainer>
      {(centerLabel !== undefined || centerValue !== undefined) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {centerValue !== undefined && (
            <div className="font-cond font-bold text-3xl leading-none">{centerValue}</div>
          )}
          {centerLabel && (
            <div className="text-[11px] uppercase tracking-widest2 text-text-dark-dim mt-1 font-cond font-semibold">
              {centerLabel}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
