'use client';

import React from 'react';
import PageHeader from '@/components/PageHeader';
import DataTable from '@/components/DataTable';
import { bannersAPI } from '@/lib/api';
import { useApi } from '@/hooks/useApi';
import { Loader2 } from 'lucide-react';

const columns = [
  { key: 'title', label: 'Banner Title', render: (val: string) => <span className="font-bold text-gray-800">{val}</span> },
  { key: 'position', label: 'Position', render: (val: string) => <span className="capitalize">{val?.replace('_', ' ')}</span> },
  { key: 'clicks', label: 'Clicks' },
  { 
    key: 'is_active', 
    label: 'Status', 
    render: (val: boolean) => (
      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${val ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}>
        {val ? 'Active' : 'Inactive'}
      </span>
    ) 
  },
];

export default function BannersPage() {
  const { data, loading, refetch } = useApi(() => bannersAPI.list());
  const banners = data?.results || data || [];

  const handleDelete = async (item: any) => {
    if (!confirm(`Delete "${item.title}"?`)) return;
    await bannersAPI.delete(item.id);
    refetch();
  };

  return (
    <div>
      <PageHeader title="Banners" description="Manage website banners and promotional graphics." onAdd={() => alert('Upload banner modal coming soon')} addLabel="Upload Banner" />
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-gray-400" size={32} /></div>
      ) : (
        <DataTable columns={columns} data={banners} searchPlaceholder="Search banners..." onEdit={() => {}} onDelete={handleDelete} />
      )}
    </div>
  );
}
