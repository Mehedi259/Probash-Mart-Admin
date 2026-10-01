'use client';

import React from 'react';
import PageHeader from '@/components/PageHeader';
import DataTable from '@/components/DataTable';
import { reviewsAPI } from '@/lib/api';
import { useApi } from '@/hooks/useApi';
import { Loader2 } from 'lucide-react';

const columns = [
  { key: 'product_name', label: 'Product', render: (val: string, item: any) => <span className="font-medium text-gray-800">{val || item.product?.name || '-'}</span> },
  { key: 'user_name', label: 'Customer', render: (val: string, item: any) => val || item.user?.username || '-' },
  { 
    key: 'rating', 
    label: 'Rating',
    render: (val: number) => (
      <div className="flex text-amber-400">
        {[...Array(5)].map((_, i) => <span key={i}>{i < val ? '★' : '☆'}</span>)}
      </div>
    )
  },
  { key: 'comment', label: 'Comment', render: (val: string) => <span className="text-gray-500 italic truncate max-w-[200px] block">&quot;{val}&quot;</span> },
  { 
    key: 'status', 
    label: 'Status', 
    render: (val: string) => (
      <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${val === 'published' ? 'bg-emerald-100 text-emerald-700' : val === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
        {val}
      </span>
    ) 
  },
];

export default function ReviewsPage() {
  const { data, loading, refetch } = useApi(() => reviewsAPI.list());
  const reviews = data?.results || data || [];

  const handleDelete = async (item: any) => {
    if (!confirm('Delete this review?')) return;
    await reviewsAPI.delete(item.id);
    refetch();
  };

  return (
    <div>
      <PageHeader title="Reviews" description="Moderate customer reviews." />
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-gray-400" size={32} /></div>
      ) : (
        <DataTable columns={columns} data={reviews} searchPlaceholder="Search reviews..." onEdit={() => {}} onDelete={handleDelete} />
      )}
    </div>
  );
}
