import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

export function TrendLine({
  data,
  height = 180,
}: {
  data: { label: string; value: number }[];
  height?: number;
}) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <XAxis dataKey="label" stroke="#8A91A3" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="#8A91A3" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#C8102E" strokeWidth={2} dot={{ r: 3, fill: "#C8102E" }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
