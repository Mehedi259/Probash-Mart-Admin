'use client';

import React from 'react';
import { Calendar, ShoppingBag, ClipboardList, Users, Package, ChevronDown, Loader2 } from 'lucide-react';
import { SalesChart, StatusChart } from '@/components/DashboardCharts';
import Link from 'next/link';
import clsx from 'clsx';
import { analyticsAPI, ordersAPI, productsAPI } from '@/lib/api';
import { useApi } from '@/hooks/useApi';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'delivered': return 'bg-emerald-100 text-emerald-700';
    case 'processing': return 'bg-amber-100 text-amber-700';
    case 'shipped': return 'bg-blue-100 text-blue-700';
    case 'cancelled': return 'bg-red-100 text-red-700';
    case 'pending': return 'bg-purple-100 text-purple-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const getStatusNameInBengali = (status: string) => {
  switch (status) {
    case 'delivered': return 'ডেলিভার্ড';
    case 'processing': return 'প্রসেসিং';
    case 'shipped': return 'শিপড';
    case 'cancelled': return 'বাতিল';
    case 'pending': return 'পেন্ডিং';
    default: return status;
  }
};

const statusColorMap: Record<string, string> = {
  delivered: 'bg-emerald-500',
  processing: 'bg-amber-500',
  shipped: 'bg-blue-500',
  cancelled: 'bg-red-500',
  pending: 'bg-purple-500',
};

export default function Dashboard() {
  const { data: dashboard, loading: dashLoading } = useApi(() => analyticsAPI.getDashboard());
  const { data: orders, loading: ordersLoading } = useApi(() => ordersAPI.list('page_size=5'));
  const { data: topProducts } = useApi(() => analyticsAPI.getTopProducts(5));
  const { data: ordersByStatus } = useApi(() => analyticsAPI.getOrdersByStatus());

  const metricCards = [
    { title: 'মোট রেভিনিউ', value: dashboard ? `€ ${Number(dashboard.total_revenue || 0).toLocaleString()}` : '...', icon: ShoppingBag, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { title: 'মোট অর্ডার', value: dashboard?.total_orders?.toLocaleString() || '...', icon: ClipboardList, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'মোট কাস্টমার', value: dashboard?.total_customers?.toLocaleString() || '...', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'মোট প্রোডাক্ট', value: dashboard?.total_products?.toLocaleString() || '...', icon: Package, color: 'text-orange-500', bg: 'bg-orange-50' },
  ];

  const recentOrders = orders?.results || orders || [];
  const topProductsList = topProducts || [];
  const statusData = ordersByStatus || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ড্যাশবোর্ড</h1>
          <p className="text-sm text-gray-500 mt-1">স্বাগতম! আজ আপনার স্টোরের সর্বশেষ অবস্থা দেখে নিন।</p>
        </div>
        <button className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
          <Calendar size={16} className="text-gray-400" />
          গত ৩০ দিন
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((card, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className={clsx("w-12 h-12 rounded-full flex items-center justify-center", card.bg, card.color)}>
                <card.icon size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{card.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  {dashLoading ? (
                    <Loader2 size={20} className="animate-spin text-gray-400" />
                  ) : (
                    <h3 className="text-xl font-bold text-gray-900">{card.value}</h3>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Overview */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">সেলস ওভারভিউ</h2>
            <button className="flex items-center gap-1 text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
              দৈনিক <ChevronDown size={14} />
            </button>
          </div>
          <SalesChart />
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">শীর্ষ প্রোডাক্ট</h2>
            <Link href="/products" className="text-sm font-medium text-[#4F46E5] hover:underline">সবগুলো দেখুন</Link>
          </div>
          <div className="flex justify-between text-xs font-medium text-gray-400 mb-4 pb-2 border-b border-gray-100">
            <span>প্রোডাক্ট</span>
            <div className="flex gap-8">
              <span>বিক্রি</span>
              <span>রেভিনিউ</span>
            </div>
          </div>
          <div className="space-y-4">
            {topProductsList.length > 0 ? topProductsList.map((product: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400">
                    {idx + 1}
                  </div>
                  <span className="text-sm font-medium text-gray-800 truncate max-w-[120px]">{product.name}</span>
                </div>
                <div className="flex gap-8 text-sm">
                  <span className="text-gray-600 font-medium w-8 text-right">{product.sold_count || 0}</span>
                  <span className="text-gray-900 font-bold w-16 text-right">€ {Number(product.revenue || 0).toFixed(0)}</span>
                </div>
              </div>
            )) : (
              <p className="text-sm text-gray-400 text-center py-4">এখনও কোনো সেলস ডেটা নেই</p>
            )}
          </div>
        </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm lg:col-span-2 overflow-x-auto">
          <div className="flex items-center justify-between mb-6 min-w-[600px]">
            <h2 className="text-lg font-bold text-gray-900">সাম্প্রতিক অর্ডার</h2>
            <Link href="/orders" className="text-sm font-medium text-[#4F46E5] hover:underline">সবগুলো দেখুন</Link>
          </div>
          {ordersLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="animate-spin text-gray-400" size={24} /></div>
          ) : (
            <table className="w-full text-sm text-left min-w-[600px]">
              <thead className="text-xs text-gray-400 uppercase font-semibold border-b border-gray-100">
                <tr>
                  <th className="pb-3 font-medium">অর্ডার আইডি</th>
                  <th className="pb-3 font-medium">কাস্টমার</th>
                  <th className="pb-3 font-medium">পরিমাণ</th>
                  <th className="pb-3 font-medium">স্ট্যাটাস</th>
                  <th className="pb-3 font-medium text-right">তারিখ</th>
                </tr>
              </thead>
              <tbody>
                {(Array.isArray(recentOrders) ? recentOrders : []).slice(0, 5).map((order: any, idx: number) => (
                  <tr key={idx} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                    <td className="py-4 font-medium text-[#4F46E5]">{order.order_number || order.id?.slice(0, 8)}</td>
                    <td className="py-4">
                      <span className="font-medium text-gray-800">{order.customer_name || order.full_name || 'Guest'}</span>
                    </td>
                    <td className="py-4 font-medium text-gray-700">€ {Number(order.total || 0).toFixed(2)}</td>
                    <td className="py-4">
                      <span className={clsx("px-2.5 py-1 rounded-full text-xs font-bold capitalize", getStatusColor(order.status))}>
                        {getStatusNameInBengali(order.status)}
                      </span>
                    </td>
                    <td className="py-4 text-right text-gray-500">
                      {order.created_at ? new Date(order.created_at).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr><td colSpan={5} className="py-8 text-center text-gray-400">এখনও কোনো অর্ডার নেই</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Orders by Status */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-6">স্ট্যাটাস অনুযায়ী অর্ডার</h2>
          <div className="flex flex-col items-center">
            <div className="w-full max-w-[200px]">
              <StatusChart />
            </div>
            <div className="w-full mt-6 space-y-3">
              {statusData.length > 0 ? statusData.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={clsx("w-2 h-2 rounded-full", statusColorMap[item.status] || 'bg-gray-500')}></div>
                    <span className="text-gray-600 font-medium capitalize">{getStatusNameInBengali(item.status)}</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-gray-900 font-medium">{item.count}</span>
                  </div>
                </div>
              )) : (
                ['Delivered', 'Processing', 'Shipped', 'Cancelled', 'Pending'].map((name, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={clsx("w-2 h-2 rounded-full", statusColorMap[name.toLowerCase()] || 'bg-gray-500')}></div>
                      <span className="text-gray-600 font-medium">{getStatusNameInBengali(name.toLowerCase())}</span>
                    </div>
                    <span className="text-gray-900 font-medium">0</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
