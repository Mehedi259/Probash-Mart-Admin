'use client';

import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/PageHeader';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import { productsAPI, categoriesAPI } from '@/lib/api';
import { useApi } from '@/hooks/useApi';
import { Loader2 } from 'lucide-react';

const columns = [
  { 
    key: 'name', 
    label: 'প্রোডাক্ট', 
    render: (val: string, item: any) => (
      <div className="flex items-center gap-3">
        {item.image ? (
          <img src={item.image} className="w-10 h-10 rounded-lg object-cover border border-gray-100" alt={val} />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-400">ছবি নেই</div>
        )}
        <div>
          <span className="font-medium text-gray-800">{val}</span>
          <div className="text-xs text-gray-400">{item.weight || '-'}</div>
        </div>
      </div>
    ) 
  },
  { key: 'category_name', label: 'ক্যাটাগরি', render: (val: string) => <span className="px-2.5 py-1 bg-gray-100 rounded-lg text-xs font-medium text-gray-600">{val || '-'}</span> },
  { key: 'price', label: 'দাম', render: (val: string) => <span className="font-bold text-gray-800">€ {Number(val).toFixed(2)}</span> },
  { key: 'stock', label: 'স্টক' },
  { 
    key: 'stock_status', 
    label: 'স্ট্যাটাস', 
    render: (val: string) => {
      let color = 'bg-gray-100 text-gray-700';
      let text = val;
      if(val === 'Active') { color = 'bg-emerald-100 text-emerald-700'; text = 'সক্রিয়'; }
      else if(val === 'Low Stock') { color = 'bg-amber-100 text-amber-700'; text = 'স্টক কম'; }
      else if(val === 'Out of Stock') { color = 'bg-red-100 text-red-700'; text = 'স্টক আউট'; }
      return <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${color}`}>{text}</span>;
    } 
  },
];

export default function ProductsPage() {
  const { data, loading, refetch } = useApi(() => productsAPI.list());
  const products = data?.results || data || [];
  
  const [categories, setCategories] = useState<any[]>([]);
  useEffect(() => {
    categoriesAPI.list().then(res => setCategories(Array.isArray(res) ? res : res.results || []));
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('0');
  const [weight, setWeight] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const openModal = (item?: any) => {
    if (item) {
      setEditingItem(item);
      setName(item.name || '');
      setCategoryId(item.category || item.category_id || '');
      setPrice(item.price || '');
      setStock(item.stock?.toString() || '0');
      setWeight(item.weight || '');
      setIsActive(item.is_active !== undefined ? item.is_active : true);
      setImageFile(null);
    } else {
      setEditingItem(null);
      setName('');
      setCategoryId('');
      setPrice('');
      setStock('0');
      setWeight('');
      setIsActive(true);
      setImageFile(null);
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
    formData.append('category', categoryId);
    formData.append('price', price);
    formData.append('stock', stock);
    formData.append('weight', weight);
    formData.append('is_active', isActive.toString());
    if (imageFile) {
      formData.append('image', imageFile);
    }
    
    try {
      if (editingItem) {
        await productsAPI.update(editingItem.id, formData as any);
      } else {
        await productsAPI.create(formData as any);
      }
      closeModal();
      refetch();
    } catch (error) {
      console.error("Error saving product", error);
      alert('একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item: any) => {
    if (!confirm(`আপনি কি সত্যিই "${item.name}" প্রোডাক্টটি মুছে ফেলতে চান?`)) return;
    await productsAPI.delete(item.id);
    refetch();
  };

  return (
    <div>
      <PageHeader 
        title="প্রোডাক্টস" 
        description="আপনার স্টোরের প্রোডাক্ট ও ইনভেন্টরি ম্যানেজ করুন।" 
        onAdd={() => openModal()} 
        addLabel="নতুন প্রোডাক্ট" 
      />
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-gray-400" size={32} /></div>
      ) : (
        <DataTable 
          columns={columns} 
          data={products} 
          searchPlaceholder="প্রোডাক্ট খুঁজুন..." 
          onEdit={openModal} 
          onDelete={handleDelete} 
        />
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        title={editingItem ? 'প্রোডাক্ট আপডেট করুন' : 'নতুন প্রোডাক্ট যোগ করুন'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">প্রোডাক্টের নাম *</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="যেমন: Fresh Hilsa Fish"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ক্যাটাগরি *</label>
            <select
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">ক্যাটাগরি নির্বাচন করুন</option>
              {categories.map((cat: any) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">প্রোডাক্টের ছবি</label>
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">দাম (€) *</label>
              <input 
                type="number"
                step="0.01"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">স্টক *</label>
              <input 
                type="number" 
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ওজন / পরিমাণ</label>
            <input 
              type="text" 
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="যেমন: 1 KG"
            />
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="isActiveProd" 
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="isActiveProd" className="text-sm font-medium text-gray-700">সক্রিয় রাখুন</label>
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
