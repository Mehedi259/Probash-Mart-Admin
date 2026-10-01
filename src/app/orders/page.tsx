'use client';

import React, { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import { ordersAPI } from '@/lib/api';
import { useApi } from '@/hooks/useApi';
import { Loader2 } from 'lucide-react';

const getStatusNameInBengali = (status: string) => {
  switch (status.toLowerCase()) {
    case 'delivered': return 'ডেলিভার্ড';
    case 'processing': return 'প্রসেসিং';
    case 'shipped': return 'শিপড';
    case 'cancelled': return 'বাতিল';
    case 'pending': return 'পেন্ডিং';
    default: return status;
  }
};

const columns = [
  { key: 'order_number', label: 'অর্ডার আইডি', render: (val: string, item: any) => <span className="font-medium text-[#4F46E5]">{val || item.id?.slice(0, 8)}</span> },
  { key: 'created_at', label: 'তারিখ', render: (val: string) => val ? new Date(val).toLocaleString() : '-' },
  { key: 'full_name', label: 'কাস্টমার', render: (val: string, item: any) => <span className="font-medium text-gray-800">{val || item.customer_name || 'গেস্ট'}</span> },
  { key: 'total', label: 'সর্বমোট', render: (val: string) => <span className="font-medium text-gray-800">€ {Number(val || 0).toFixed(2)}</span> },
  { key: 'payment_method', label: 'পেমেন্ট মেথড' },
  { 
    key: 'status', 
    label: 'স্ট্যাটাস', 
    render: (val: string) => {
      let color = 'bg-gray-100 text-gray-700';
      if(val === 'delivered') color = 'bg-emerald-100 text-emerald-700';
      else if(val === 'processing') color = 'bg-amber-100 text-amber-700';
      else if(val === 'shipped') color = 'bg-blue-100 text-blue-700';
      else if(val === 'cancelled') color = 'bg-red-100 text-red-700';
      return <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${color}`}>{getStatusNameInBengali(val)}</span>;
    } 
  },
];

export default function OrdersPage() {
  const { data, loading, refetch } = useApi(() => ordersAPI.list());
  const orders = data?.results || data || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState('');

  const openModal = (item: any) => {
    setEditingItem(item);
    setStatus(item.status || 'pending');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setIsSubmitting(true);
    
    try {
      await ordersAPI.updateStatus(editingItem.id, status);
      closeModal();
      refetch();
    } catch (error) {
      console.error("Error updating order", error);
      alert('একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader title="অর্ডারসমূহ" description="কাস্টমারদের সমস্ত অর্ডার ম্যানেজ ও ট্র্যাক করুন।" />
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-gray-400" size={32} /></div>
      ) : (
        <DataTable columns={columns} data={orders} searchPlaceholder="অর্ডার আইডি বা কাস্টমার দিয়ে খুঁজুন..." onEdit={openModal} />
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        title="অর্ডারের স্ট্যাটাস পরিবর্তন করুন"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">অর্ডার স্ট্যাটাস</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="pending">পেন্ডিং</option>
              <option value="processing">প্রসেসিং</option>
              <option value="shipped">শিপড</option>
              <option value="delivered">ডেলিভার্ড</option>
              <option value="cancelled">বাতিল</option>
            </select>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={closeModal}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              বাতিল
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              আপডেট করুন
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
