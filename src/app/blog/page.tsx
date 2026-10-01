'use client';

import React from 'react';
import PageHeader from '@/components/PageHeader';
import DataTable from '@/components/DataTable';
import { blogAPI } from '@/lib/api';
import { useApi } from '@/hooks/useApi';
import { Loader2 } from 'lucide-react';

const columns = [
  { key: 'title', label: 'Post Title', render: (val: string) => <span className="font-bold text-gray-800">{val}</span> },
  { key: 'author_name', label: 'Author', render: (val: string, item: any) => val || item.author?.username || '-' },
  { key: 'category', label: 'Category' },
  { key: 'views', label: 'Views' },
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

export default function BlogPage() {
  const { data, loading, refetch } = useApi(() => blogAPI.list());
  const posts = data?.results || data || [];

  const handleDelete = async (item: any) => {
    if (!confirm(`Delete "${item.title}"?`)) return;
    await blogAPI.delete(item.id);
    refetch();
  };

  return (
    <div>
      <PageHeader title="Blog" description="Manage blog posts and articles." onAdd={() => alert('Write post modal coming soon')} addLabel="Write Post" />
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-gray-400" size={32} /></div>
      ) : (
        <DataTable columns={columns} data={posts} searchPlaceholder="Search posts..." onEdit={() => {}} onDelete={handleDelete} />
      )}
    </div>
  );
}
