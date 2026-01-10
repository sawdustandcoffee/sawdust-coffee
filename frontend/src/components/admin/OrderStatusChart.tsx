import { useEffect, useState } from 'react';
import api from '../../lib/axios';

interface StatusData {
  status: string;
  count: number;
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  processing: '#3b82f6',
  shipped: '#8b5cf6',
  completed: '#10b981',
  cancelled: '#ef4444',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export default function OrderStatusChart() {
  const [data, setData] = useState<StatusData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/admin/dashboard/order-status-chart');
      setData(response.data);
    } catch (err) {
      console.error('Failed to load order status chart data', err);
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
        <div className="text-gray-500">No order data available</div>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.count, 0);

  // Calculate percentages and angles for pie chart
  let currentAngle = -90; // Start from top
  const slices = data.map((item) => {
    const percentage = (item.count / total) * 100;
    const angle = (percentage / 100) * 360;
    const slice = {
      ...item,
      percentage,
      startAngle: currentAngle,
      endAngle: currentAngle + angle,
      color: STATUS_COLORS[item.status] || '#6b7280',
    };
    currentAngle += angle;
    return slice;
  });

  // Create SVG path for pie slice
  const createArc = (startAngle: number, endAngle: number, radius: number) => {
    const start = polarToCartesian(100, 100, radius, endAngle);
    const end = polarToCartesian(100, 100, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return [
      'M', 100, 100,
      'L', start.x, start.y,
      'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      'Z',
    ].join(' ');
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-center">
      {/* Pie Chart */}
      <div className="flex-shrink-0">
        <svg width="200" height="200" viewBox="0 0 200 200">
          {slices.map((slice, index) => (
            <path
              key={index}
              d={createArc(slice.startAngle, slice.endAngle, 80)}
              fill={slice.color}
              stroke="white"
              strokeWidth="2"
              className="transition-opacity hover:opacity-80 cursor-pointer"
            />
          ))}
          {/* Center circle for donut effect */}
          <circle cx="100" cy="100" r="50" fill="white" />
          <text
            x="100"
            y="95"
            textAnchor="middle"
            fontSize="24"
            fontWeight="bold"
            fill="#374151"
          >
            {total}
          </text>
          <text
            x="100"
            y="115"
            textAnchor="middle"
            fontSize="12"
            fill="#6b7280"
          >
            Total Orders
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="flex-1 space-y-3">
        {slices.map((slice, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: slice.color }}
              />
              <span className="text-sm font-medium text-gray-700">
                {STATUS_LABELS[slice.status] || slice.status}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{slice.count} orders</span>
              <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                {slice.percentage.toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
