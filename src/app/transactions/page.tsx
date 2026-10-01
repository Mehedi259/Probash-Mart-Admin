'use client';

import React from 'react';
import PageHeader from '@/components/PageHeader';
import DataTable from '@/components/DataTable';
import { transactionsAPI } from '@/lib/api';
import { useApi } from '@/hooks/useApi';
import { Loader2 } from 'lucide-react';

const columns = [
  { key: 'transaction_id', label: 'Transaction ID', render: (val: string) => <span className="font-medium text-[#4F46E5]">{val}</span> },
  { key: 'order', label: 'Order ID', render: (val: string) => val?.slice(0, 8) || '-' },
  { key: 'amount', label: 'Amount', render: (val: string) => <span className="font-bold text-gray-900">€ {Number(val || 0).toFixed(2)}</span> },
  { key: 'method', label: 'Method', render: (val: string) => <span className="capitalize">{val}</span> },
  { key: 'created_at', label: 'Date', render: (val: string) => val ? new Date(val).toLocaleString() : '-' },
  { 
    key: 'status', 
    label: 'Status', 
    render: (val: string) => {
      let color = 'bg-gray-100 text-gray-700';
      if(val === 'success') color = 'bg-emerald-100 text-emerald-700';
      else if(val === 'pending') color = 'bg-amber-100 text-amber-700';
      else if(val === 'failed') color = 'bg-red-100 text-red-700';
      return <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${color}`}>{val}</span>;
    } 
  },
];

export default function TransactionsPage() {
  const { data, loading } = useApi(() => transactionsAPI.list());
  const transactions = data?.results || data || [];

  return (
    <div>
      <PageHeader title="Transactions" description="View all payment transactions." />
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-gray-400" size={32} /></div>
      ) : (
        <DataTable columns={columns} data={transactions} searchPlaceholder="Search transactions..." />
      )}
    </div>
  );
}
