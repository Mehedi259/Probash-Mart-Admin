'use client';

import React from 'react';
import PageHeader from '@/components/PageHeader';
import { paymentMethodsAPI } from '@/lib/api';
import { useApi } from '@/hooks/useApi';
import { Loader2 } from 'lucide-react';

export default function PaymentSettingsPage() {
  const { data, loading, refetch } = useApi(() => paymentMethodsAPI.list());
  const methods = data?.results || data || [];

  const toggleMethod = async (method: any) => {
    await paymentMethodsAPI.update(method.id, { ...method, is_active: !method.is_active });
    refetch();
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader title="পেমেন্ট মেথড" description="আপনার স্টোর কীভাবে পেমেন্ট গ্রহণ করবে তা কনফিগার করুন।" />
      
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-gray-400" size={32} /></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-100">
          {methods.map((method: any) => (
            <div key={method.id} className="p-6 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">{method.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{method.description}</p>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={method.is_active} 
                  onChange={() => toggleMethod(method)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4F46E5]"></div>
              </label>
            </div>
          ))}
          {methods.length === 0 && (
            <div className="p-8 text-center text-gray-400">কোনো পেমেন্ট মেথড কনফিগার করা নেই</div>
          )}
        </div>
      )}
    </div>
  );
}
