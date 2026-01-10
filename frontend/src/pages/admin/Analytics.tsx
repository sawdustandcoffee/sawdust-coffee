import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { Card, Spinner } from '../../components/ui';
import AdminLayout from '../../layouts/AdminLayout';

export default function Analytics() {
  const [activeTab, setActiveTab] = useState('sales');
  const [period, setPeriod] = useState('30');
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState<any>(null);
  const [productsData, setProductsData] = useState<any>(null);
  const [engagementData, setEngagementData] = useState<any>(null);
  const [summaryData, setSummaryData] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = `?period=${period}`;

      const [sales, products, engagement, summary] = await Promise.all([
        api.get(`/admin/analytics/sales${params}`),
        api.get(`/admin/analytics/products${params}`),
        api.get(`/admin/analytics/engagement${params}`),
        api.get(`/admin/analytics/summary${params}`),
      ]);

      setSalesData(sales.data);
      setProductsData(products.data);
      setEngagementData(engagement.data);
      setSummaryData(summary.data);
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value}%`;
  };

  const tabs = [
    { id: 'sales', label: 'Sales', icon: '💰' },
    { id: 'products', label: 'Products', icon: '📦' },
    { id: 'engagement', label: 'Engagement', icon: '💬' },
  ];

  if (loading && !salesData) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center min-h-screen">
          <Spinner size="lg" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
            <p className="text-gray-600 mt-1">Insights and performance metrics</p>
          </div>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>

        {/* Summary Cards */}
        {summaryData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Sales</p>
                  <p className="text-3xl font-bold text-coffee mt-2">
                    {formatCurrency(summaryData.current_period.sales)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    vs {formatCurrency(summaryData.previous_period.sales)} previous period
                  </p>
                </div>
                <span
                  className={`text-lg font-semibold ${
                    summaryData.changes.sales_percent >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {formatPercent(summaryData.changes.sales_percent)}
                </span>
              </div>
            </Card>

            <Card>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-3xl font-bold text-coffee mt-2">
                    {summaryData.current_period.orders}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    vs {summaryData.previous_period.orders} previous period
                  </p>
                </div>
                <span
                  className={`text-lg font-semibold ${
                    summaryData.changes.orders_percent >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {formatPercent(summaryData.changes.orders_percent)}
                </span>
              </div>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex gap-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 border-b-2 font-medium transition ${
                  activeTab === tab.id
                    ? 'border-coffee text-coffee'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'sales' && salesData && (
          <div className="space-y-6">
            {/* Sales Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <p className="text-sm font-medium text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold text-coffee mt-2">
                  {formatCurrency(salesData.summary.total_sales)}
                </p>
              </Card>
              <Card>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-coffee mt-2">
                  {salesData.summary.total_orders}
                </p>
              </Card>
              <Card>
                <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-bold text-coffee mt-2">
                  {formatCurrency(salesData.summary.avg_order_value)}
                </p>
              </Card>
            </div>

            {/* Orders by Status */}
            <Card>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Orders by Status</h3>
              <div className="space-y-3">
                {salesData.orders_by_status.map((item: any) => (
                  <div key={item.status} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="capitalize font-medium text-gray-700">{item.status}</span>
                    </div>
                    <span className="text-gray-900 font-semibold">{item.count}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Daily Sales Chart */}
            {salesData.daily_sales.length > 0 && (
              <Card>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Daily Sales</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-2 px-3">Date</th>
                        <th className="text-right py-2 px-3">Revenue</th>
                        <th className="text-right py-2 px-3">Orders</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesData.daily_sales.slice().reverse().map((item: any) => (
                        <tr key={item.date} className="border-t">
                          <td className="py-2 px-3">{new Date(item.date).toLocaleDateString()}</td>
                          <td className="py-2 px-3 text-right font-semibold">
                            {formatCurrency(parseFloat(item.revenue))}
                          </td>
                          <td className="py-2 px-3 text-right">{item.orders}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'products' && productsData && (
          <div className="space-y-6">
            {/* Top Products */}
            <Card>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Top Selling Products</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-2 px-3">Product</th>
                      <th className="text-right py-2 px-3">Units Sold</th>
                      <th className="text-right py-2 px-3">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productsData.top_products.map((product: any, index: number) => (
                      <tr key={product.id} className="border-t">
                        <td className="py-2 px-3">
                          <span className="font-medium">#{index + 1}</span> {product.name}
                        </td>
                        <td className="py-2 px-3 text-right">{product.total_sold}</td>
                        <td className="py-2 px-3 text-right font-semibold">
                          {formatCurrency(parseFloat(product.total_revenue))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Category Performance */}
            {productsData.category_performance.length > 0 && (
              <Card>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Category Performance</h3>
                <div className="space-y-3">
                  {productsData.category_performance.map((cat: any) => (
                    <div key={cat.name} className="flex items-center justify-between">
                      <span className="font-medium text-gray-700">{cat.name}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">{cat.total_sold} sold</span>
                        <span className="font-semibold text-coffee">
                          {formatCurrency(parseFloat(cat.total_revenue))}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Inventory Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {productsData.low_stock.length > 0 && (
                <Card>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Low Stock Alert</h3>
                  <div className="space-y-2">
                    {productsData.low_stock.map((product: any) => (
                      <div key={product.id} className="flex items-center justify-between py-2">
                        <span className="text-sm text-gray-700">{product.name}</span>
                        <span className="text-sm font-semibold text-orange-600">
                          {product.inventory} left
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {productsData.out_of_stock.length > 0 && (
                <Card>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Out of Stock</h3>
                  <div className="space-y-2">
                    {productsData.out_of_stock.map((product: any) => (
                      <div key={product.id} className="py-2">
                        <span className="text-sm text-gray-700">{product.name}</span>
                        {product.sku && (
                          <span className="text-xs text-gray-500 ml-2">SKU: {product.sku}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}

        {activeTab === 'engagement' && engagementData && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <p className="text-sm font-medium text-gray-600">Quote Requests</p>
                <p className="text-2xl font-bold text-coffee mt-2">
                  {engagementData.summary.total_quotes}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {engagementData.response_rates.quotes}% response rate
                </p>
              </Card>
              <Card>
                <p className="text-sm font-medium text-gray-600">Contact Submissions</p>
                <p className="text-2xl font-bold text-coffee mt-2">
                  {engagementData.summary.total_contacts}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {engagementData.response_rates.contacts}% response rate
                </p>
              </Card>
            </div>

            {/* Quotes by Status */}
            <Card>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quote Requests by Status</h3>
              <div className="space-y-3">
                {engagementData.quotes_by_status.map((item: any) => (
                  <div key={item.status} className="flex items-center justify-between">
                    <span className="capitalize font-medium text-gray-700">{item.status}</span>
                    <span className="text-gray-900 font-semibold">{item.count}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Daily Activity */}
            {engagementData.quotes_by_day.length > 0 && (
              <Card>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Quote Requests Over Time</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-2 px-3">Date</th>
                        <th className="text-right py-2 px-3">Requests</th>
                      </tr>
                    </thead>
                    <tbody>
                      {engagementData.quotes_by_day.slice().reverse().map((item: any) => (
                        <tr key={item.date} className="border-t">
                          <td className="py-2 px-3">{new Date(item.date).toLocaleDateString()}</td>
                          <td className="py-2 px-3 text-right">{item.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
