import { useEffect, useState } from 'react';
import api from '../../lib/axios';

interface MonthlyData {
  month: string;
  revenue: number;
  orders: number;
}

export default function RevenueChart() {
  const [data, setData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/admin/dashboard/revenue-chart');
      setData(response.data);
    } catch (err) {
      console.error('Failed to load revenue chart data', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading chart...</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">No revenue data available</div>
      </div>
    );
  }

  const maxRevenue = Math.max(...data.map((d) => d.revenue));
  const chartHeight = 200;
  const chartWidth = 800;
  const padding = 40;

  const xStep = (chartWidth - padding * 2) / Math.max(data.length - 1, 1);
  const yScale = (chartHeight - padding * 2) / maxRevenue;

  // Create path for line chart
  const linePath = data
    .map((item, index) => {
      const x = padding + index * xStep;
      const y = chartHeight - padding - item.revenue * yScale;
      return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    })
    .join(' ');

  // Format month label (e.g., "2024-01" -> "Jan '24")
  const formatMonth = (month: string) => {
    const [year, monthNum] = month.split('-');
    const date = new Date(parseInt(year), parseInt(monthNum) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  };

  return (
    <div className="space-y-4">
      <div className="relative" style={{ height: chartHeight + 60 }}>
        <svg
          width="100%"
          height={chartHeight + 60}
          viewBox={`0 0 ${chartWidth} ${chartHeight + 60}`}
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((factor) => {
            const y = chartHeight - padding - maxRevenue * yScale * factor;
            return (
              <g key={factor}>
                <line
                  x1={padding}
                  y1={y}
                  x2={chartWidth - padding}
                  y2={y}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
                <text
                  x={padding - 10}
                  y={y + 5}
                  textAnchor="end"
                  fontSize="12"
                  fill="#6b7280"
                >
                  ${((maxRevenue * factor) / 1000).toFixed(0)}k
                </text>
              </g>
            );
          })}

          {/* Line chart */}
          <path
            d={linePath}
            fill="none"
            stroke="#7C3E26"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {data.map((item, index) => {
            const x = padding + index * xStep;
            const y = chartHeight - padding - item.revenue * yScale;
            return (
              <g key={index}>
                <circle cx={x} cy={y} r="5" fill="#7C3E26" />
                <circle cx={x} cy={y} r="3" fill="white" />
              </g>
            );
          })}

          {/* X-axis labels */}
          {data.map((item, index) => {
            const x = padding + index * xStep;
            return (
              <text
                key={index}
                x={x}
                y={chartHeight + 20}
                textAnchor="middle"
                fontSize="11"
                fill="#6b7280"
              >
                {formatMonth(item.month)}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t">
        <div>
          <div className="text-sm text-gray-600">Total Revenue</div>
          <div className="text-lg font-semibold text-coffee">
            ${data.reduce((sum, d) => sum + d.revenue, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Total Orders</div>
          <div className="text-lg font-semibold text-coffee">
            {data.reduce((sum, d) => sum + d.orders, 0)}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Average Order</div>
          <div className="text-lg font-semibold text-coffee">
            ${(
              data.reduce((sum, d) => sum + d.revenue, 0) /
              Math.max(data.reduce((sum, d) => sum + d.orders, 0), 1)
            ).toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}
