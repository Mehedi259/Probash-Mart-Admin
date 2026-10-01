'use client';

import React from 'react';
import PageHeader from '@/components/PageHeader';
import DataTable from '@/components/DataTable';
import { customersAPI } from '@/lib/api';
import { useApi } from '@/hooks/useApi';
import { Loader2 } from 'lucide-react';

const columns = [
  { 
    key: 'username', 
    label: 'কাস্টমার', 
    render: (val: string, item: any) => (
      <div>
        <div className="font-bold text-gray-800">{item.first_name && item.last_name ? `${item.first_name} ${item.last_name}` : val}</div>
        <div className="text-xs text-gray-500">{item.email}</div>
      </div>
    ) 
  },
  { key: 'email', label: 'ইমেইল' },
  { key: 'phone', label: 'ফোন নম্বর', render: (val: string) => val || '-' },
  { key: 'date_joined', label: 'যোগদানের তারিখ', render: (val: string) => val ? new Date(val).toLocaleDateString() : '-' },
];

export default function CustomersPage() {
  const { data, loading } = useApi(() => customersAPI.list());
  const customers = data?.results || data || [];

  return (
    <div>
      <PageHeader title="কাস্টমারসমূহ" description="কাস্টমারদের ডেটা দেখুন ও ম্যানেজ করুন।" />
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-gray-400" size={32} /></div>
      ) : (
        <DataTable columns={columns} data={customers} searchPlaceholder="নাম বা ইমেইল দিয়ে খুঁজুন..." onEdit={() => {}} />
      )}
    </div>
  );
}
