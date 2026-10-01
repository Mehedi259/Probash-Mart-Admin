'use client';

import React from 'react';
import PageHeader from '@/components/PageHeader';
import DataTable from '@/components/DataTable';
import { couponsAPI } from '@/lib/api';
import { useApi } from '@/hooks/useApi';
import { Loader2 } from 'lucide-react';

const columns = [
  { key: 'code', label: 'Coupon Code', render: (val: string) => <span className="px-2 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded font-mono font-bold">{val}</span> },
  { key: 'discount_type', label: 'Type', render: (val: string) => <span className="capitalize">{val}</span> },
  { key: 'discount_value', label: 'Discount', render: (val: string, item: any) => <span className="font-bold text-gray-800">{item.discount_type === 'percentage' ? `${val}%` : `€ ${val}`}</span> },
  { key: 'used_count', label: 'Used', render: (val: number, item: any) => `${val} / ${item.max_uses || '∞'}` },
  { key: 'expires_at', label: 'Expiry', render: (val: string) => val ? new Date(val).toLocaleDateString() : 'Never' },
  { 
    key: 'is_active', 
    label: 'Status', 
    render: (val: boolean) => (
      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${val ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
        {val ? 'Active' : 'Inactive'}
      </span>
    ) 
  },
];

export default function CouponsPage() {
  const { data, loading, refetch } = useApi(() => couponsAPI.list());
  const coupons = data?.results || data || [];

  const handleDelete = async (item: any) => {
    if (!confirm(`Delete coupon "${item.code}"?`)) return;
    await couponsAPI.delete(item.id);
    refetch();
  };

  return (
    <div>
      <PageHeader title="Coupons" description="Manage discount codes and promotions." onAdd={() => alert('Create coupon modal coming soon')} addLabel="Create Coupon" />
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-gray-400" size={32} /></div>
      ) : (
        <DataTable columns={columns} data={coupons} searchPlaceholder="Search coupon codes..." onEdit={() => {}} onDelete={handleDelete} />
      )}
    </div>
  );
}
