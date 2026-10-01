'use client';

import React from 'react';
import PageHeader from '@/components/PageHeader';
import DataTable from '@/components/DataTable';
import { usersAPI } from '@/lib/api';
import { useApi } from '@/hooks/useApi';
import { Loader2 } from 'lucide-react';

const columns = [
  { key: 'username', label: 'Name', render: (val: string, item: any) => <span className="font-bold text-gray-800">{item.first_name ? `${item.first_name} ${item.last_name}` : val}</span> },
  { key: 'email', label: 'Email' },
  { 
    key: 'role', 
    label: 'Role',
    render: (val: string) => (
      <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded font-medium text-xs border border-indigo-100 capitalize">{val?.replace('_', ' ')}</span>
    )
  },
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

export default function UsersSettingsPage() {
  const { data, loading, refetch } = useApi(() => usersAPI.list());
  const users = data?.results || data || [];

  const handleDelete = async (item: any) => {
    if (!confirm(`Delete user "${item.username}"?`)) return;
    await usersAPI.delete(item.id);
    refetch();
  };

  return (
    <div>
      <PageHeader title="Users & Roles" description="Manage admin dashboard access and permissions." onAdd={() => alert('Add user modal coming soon')} addLabel="Add User" />
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-gray-400" size={32} /></div>
      ) : (
        <DataTable columns={columns} data={users} searchPlaceholder="Search users..." onEdit={() => {}} onDelete={handleDelete} />
      )}
    </div>
  );
}
