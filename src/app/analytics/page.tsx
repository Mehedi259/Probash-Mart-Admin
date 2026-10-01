'use client';

import React from 'react';
import PageHeader from '@/components/PageHeader';
import { SalesChart } from '@/components/DashboardCharts';
import { analyticsAPI } from '@/lib/api';
import { useApi } from '@/hooks/useApi';
import { Loader2 } from 'lucide-react';

export default function AnalyticsPage() {
  const { data: overview, loading } = useApi(() => analyticsAPI.getOverview());

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Deep dive into your store's performance metrics." />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Conversion Rate</h3>
          {loading ? (
            <Loader2 size={24} className="animate-spin text-gray-400 mt-2" />
          ) : (
            <>
              <p className="text-3xl font-bold text-gray-900 mt-2">{overview?.conversion_rate || '0'}%</p>
              <span className="text-xs text-gray-400 font-medium">Based on orders vs visitors</span>
            </>
          )}
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Average Order Value</h3>
          {loading ? (
            <Loader2 size={24} className="animate-spin text-gray-400 mt-2" />
          ) : (
            <>
              <p className="text-3xl font-bold text-gray-900 mt-2">€ {Number(overview?.average_order_value || 0).toFixed(2)}</p>
              <span className="text-xs text-gray-400 font-medium">Across all orders</span>
            </>
          )}
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
          {loading ? (
            <Loader2 size={24} className="animate-spin text-gray-400 mt-2" />
          ) : (
            <>
              <p className="text-3xl font-bold text-gray-900 mt-2">€ {Number(overview?.total_revenue || 0).toLocaleString()}</p>
              <span className="text-xs text-gray-400 font-medium">All time</span>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Traffic & Sales Overview</h2>
        <SalesChart />
      </div>
    </div>
  );
}
