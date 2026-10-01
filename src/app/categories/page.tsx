'use client';

import React, { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import { categoriesAPI } from '@/lib/api';
import { useApi } from '@/hooks/useApi';
import { Loader2 } from 'lucide-react';

const columns = [
  { key: 'name', label: 'ক্যাটাগরির নাম', render: (val: string) => <span className="font-bold text-gray-800">{val}</span> },
  { key: 'icon', label: 'আইকন', render: (val: string) => <span className="text-gray-500">{val || '-'}</span> },
  { key: 'product_count', label: 'মোট প্রোডাক্ট' },
  { key: 'sort_order', label: 'সর্ট অর্ডার' },
  { 
    key: 'is_active', 
    label: 'স্ট্যাটাস', 
    render: (val: boolean) => (
      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${val ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}>
        {val ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
      </span>
    ) 
  },
];

export default function CategoriesPage() {
  const { data, loading, refetch } = useApi(() => categoriesAPI.list());
  const categories = Array.isArray(data) ? data : data?.results || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [isActive, setIsActive] = useState(true);

  const openModal = (item?: any) => {
    if (item) {
      setEditingItem(item);
      setName(item.name || '');
      setIcon(item.icon || '');
      setIsActive(item.is_active !== undefined ? item.is_active : true);
    } else {
      setEditingItem(null);
      setName('');
      setIcon('');
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
    
    const payload = { name, icon, is_active: isActive };
    
    try {
      if (editingItem) {
        await categoriesAPI.update(editingItem.id, payload);
      } else {
        await categoriesAPI.create(payload);
      }
      closeModal();
      refetch();
    } catch (error) {
      console.error("Error saving category", error);
      alert('একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item: any) => {
    if (!confirm(`আপনি কি সত্যিই "${item.name}" ক্যাটাগরিটি মুছে ফেলতে চান?`)) return;
    await categoriesAPI.delete(item.id);
    refetch();
  };

  return (
    <div>
      <PageHeader 
        title="ক্যাটাগরি" 
        description="প্রোডাক্ট ক্যাটাগরি তৈরি ও ম্যানেজ করুন।" 
        onAdd={() => openModal()} 
        addLabel="নতুন ক্যাটাগরি" 
      />
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-gray-400" size={32} /></div>
      ) : (
        <DataTable 
          columns={columns} 
          data={categories} 
          searchPlaceholder="ক্যাটাগরি খুঁজুন..." 
          onEdit={openModal} 
          onDelete={handleDelete} 
        />
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        title={editingItem ? 'ক্যাটাগরি আপডেট করুন' : 'নতুন ক্যাটাগরি যোগ করুন'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ক্যাটাগরির নাম *</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="যেমন: Fresh Vegetables"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">আইকন</label>
            <input 
              type="text" 
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="আইকন নাম বা ইউআরএল"
            />
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="isActive" 
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">সক্রিয় রাখুন</label>
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
