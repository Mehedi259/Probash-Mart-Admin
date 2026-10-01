'use client';

import React from 'react';
import PageHeader from '@/components/PageHeader';
import DataTable from '@/components/DataTable';
import { pagesAPI } from '@/lib/api';
import { useApi } from '@/hooks/useApi';
import { Loader2 } from 'lucide-react';

const columns = [
  { key: 'title', label: 'Page Title', render: (val: string) => <span className="font-bold text-gray-800">{val}</span> },
  { key: 'slug', label: 'URL Slug', render: (val: string) => <span className="text-[#4F46E5] underline">/{val}</span> },
  { key: 'updated_at', label: 'Last Updated', render: (val: string) => val ? new Date(val).toLocaleDateString() : '-' },
  { 
    key: 'status', 
    label: 'Status', 
    render: (val: string) => (
      <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${val === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
        {val}
      </span>
    ) 
  },
];

export default function PagesPage() {
  const { data, loading, refetch } = useApi(() => pagesAPI.list());
  const pages = data?.results || data || [];

  const handleDelete = async (item: any) => {
    if (!confirm(`Delete "${item.title}"?`)) return;
    await pagesAPI.delete(item.id);
    refetch();
  };

  return (
    <div>
      <PageHeader title="Pages" description="Manage static content pages (About, Privacy, etc.)." onAdd={() => alert('Create page modal coming soon')} addLabel="Create Page" />
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-gray-400" size={32} /></div>
      ) : (
        <DataTable columns={columns} data={pages} searchPlaceholder="Search pages..." onEdit={() => {}} onDelete={handleDelete} />
      )}
    </div>
  );
}
