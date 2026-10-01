'use client';

import React, { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import { shippingAPI } from '@/lib/api';
import { useApi } from '@/hooks/useApi';
import { Loader2 } from 'lucide-react';

const columns = [
  { key: 'name', label: 'শিপিং জোন', render: (val: string) => <span className="font-bold text-gray-800">{val}</span> },
  { key: 'estimated_time', label: 'সম্ভাব্য সময়' },
  { key: 'fee', label: 'ডেলিভারি ফি', render: (val: string) => <span className="font-bold text-gray-900">€ {Number(val).toFixed(2)}</span> },
  { 
    key: 'is_active', 
    label: 'স্ট্যাটাস', 
    render: (val: boolean) => (
      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${val ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
        {val ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
      </span>
    ) 
  },
];

export default function ShippingSettingsPage() {
  const { data, loading, refetch } = useApi(() => shippingAPI.list());
  const zones = Array.isArray(data) ? data : data?.results || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [fee, setFee] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [isActive, setIsActive] = useState(true);

  const openModal = (item?: any) => {
    if (item) {
      setEditingItem(item);
      setName(item.name || '');
      setFee(item.fee || '');
      setEstimatedTime(item.estimated_time || '');
      setIsActive(item.is_active !== undefined ? item.is_active : true);
    } else {
      setEditingItem(null);
      setName('');
      setFee('');
      setEstimatedTime('');
      setIsActive(true);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const payload = { name, fee, estimated_time: estimatedTime, is_active: isActive };
    
    try {
      if (editingItem) {
        await shippingAPI.update(editingItem.id, payload);
      } else {
        await shippingAPI.create(payload);
      }
      closeModal();
      refetch();
    } catch (error) {
      console.error("Error saving shipping zone", error);
      alert('একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item: any) => {
    if (!confirm(`আপনি কি সত্যিই "${item.name}" জোনটি মুছে ফেলতে চান?`)) return;
    await shippingAPI.delete(item.id);
    refetch();
  };

  return (
    <div>
      <PageHeader 
        title="শিপিং মেথড" 
        description="ডেলিভারি জোন, ফি এবং সময় কনফিগার করুন।" 
        onAdd={() => openModal()} 
        addLabel="নতুন জোন" 
      />
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-gray-400" size={32} /></div>
      ) : (
        <DataTable columns={columns} data={zones} searchPlaceholder="শিপিং জোন খুঁজুন..." onEdit={openModal} onDelete={handleDelete} />
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        title={editingItem ? 'শিপিং জোন আপডেট করুন' : 'নতুন শিপিং জোন যোগ করুন'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">জোনের নাম *</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="যেমন: Inside Dhaka"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ডেলিভারি ফি (€) *</label>
            <input 
              type="number"
              step="0.01"
              required
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">সম্ভাব্য সময়</label>
            <input 
              type="text" 
              value={estimatedTime}
              onChange={(e) => setEstimatedTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="যেমন: 2-3 Days"
            />
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="isActiveShip" 
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="isActiveShip" className="text-sm font-medium text-gray-700">সক্রিয় রাখুন</label>
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
              {editingItem ? 'আপডেট করুন' : 'যোগ করুন'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
