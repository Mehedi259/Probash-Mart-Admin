'use client';

import React, { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import { categoriesAPI } from '@/lib/api';
import { useApi } from '@/hooks/useApi';
import { Loader2 } from 'lucide-react';

const columns = [
  { 
    key: 'image', 
    label: 'ছবি', 
    render: (val: string, item: any) => (
      val ? (
        <img src={val} alt={item.name} className="w-10 h-10 rounded object-cover border border-gray-200" />
      ) : (
        <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-[10px] text-gray-400 border border-gray-200">
          ছবি নেই
        </div>
      )
    ) 
  },
  { key: 'name', label: 'ক্যাটাগরির নাম', render: (val: string) => <span className="font-bold text-gray-800">{val}</span> },
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isActive, setIsActive] = useState(true);

  const openModal = (item?: any) => {
    if (item) {
      setEditingItem(item);
      setName(item.name || '');
      setImageFile(null); // Keep null unless new image is selected
      setIsActive(item.is_active !== undefined ? item.is_active : true);
    } else {
      setEditingItem(null);
      setName('');
      setImageFile(null);
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
    
    const formData = new FormData();
    formData.append('name', name);
    formData.append('is_active', isActive.toString());
    if (imageFile) {
      formData.append('image', imageFile);
    }
    
    try {
      if (editingItem) {
        await categoriesAPI.update(editingItem.id, formData as any);
      } else {
        await categoriesAPI.create(formData as any);
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
            <label className="block text-sm font-medium text-gray-700 mb-1">ক্যাটাগরির ছবি</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setImageFile(e.target.files[0]);
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
            {editingItem?.image && !imageFile && (
              <div className="mt-2 text-sm text-gray-500">
                বর্তমান ছবি: <a href={editingItem.image} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">দেখুন</a>
              </div>
            )}
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
