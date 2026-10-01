'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, ShoppingCart, Package, Layers, Users, Ticket, Star, 
  BarChart2, FileText, CreditCard, Image as ImageIcon, File, 
  Edit3, Settings, UserCheck, Wallet, Truck, LogOut 
} from 'lucide-react';
import clsx from 'clsx';

const menuGroups = [
  {
    title: 'ম্যানেজ করুন',
    items: [
      { name: 'অর্ডারসমূহ', icon: ShoppingCart, path: '/orders' },
      { name: 'প্রোডাক্টস', icon: Package, path: '/products' },
      { name: 'ক্যাটাগরি', icon: Layers, path: '/categories' },
      { name: 'কাস্টমারস', icon: Users, path: '/customers' },
      { name: 'কুপন', icon: Ticket, path: '/coupons' },
      { name: 'রিভিউ', icon: Star, path: '/reviews' },
    ]
  },
  {
    title: 'সেলস ও রিপোর্ট',
    items: [
      { name: 'অ্যানালিটিক্স', icon: BarChart2, path: '/analytics' },
      { name: 'রিপোর্টস', icon: FileText, path: '/reports' },
      { name: 'লেনদেন', icon: CreditCard, path: '/transactions' },
    ]
  },
  {
    title: 'কন্টেন্ট',
    items: [
      { name: 'ব্যানার', icon: ImageIcon, path: '/banners' },
      { name: 'পেইজসমূহ', icon: File, path: '/pages' },
      { name: 'ব্লগ', icon: Edit3, path: '/blog' },
    ]
  },
  {
    title: 'সেটিংস',
    items: [
      { name: 'স্টোর সেটিংস', icon: Settings, path: '/settings/store' },
      { name: 'ইউজার ও রোলস', icon: UserCheck, path: '/settings/users' },
      { name: 'পেমেন্ট মেথড', icon: Wallet, path: '/settings/payment' },
      { name: 'শিপিং মেথড', icon: Truck, path: '/settings/shipping' },
    ]
  }
];

export default function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (val: boolean) => void }) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <aside className={clsx(
        "fixed top-0 left-0 h-screen w-64 bg-[#1e1e2d] text-[#9899ac] flex flex-col transition-transform duration-300 z-50 overflow-y-auto",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center px-6 shrink-0 bg-[#1a1a27] border-b border-gray-800">
          <Link href="/" className="flex items-center gap-3">
            <div className="bg-red-500 text-white p-1.5 rounded-lg flex items-center justify-center">
              <ShoppingCart size={20} />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-tight">Probash Mart</h1>
              <p className="text-[10px] uppercase tracking-wider text-gray-400">অ্যাডমিন প্যানেল</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 py-6 px-4 flex flex-col gap-6">
          
          <Link href="/" className={clsx(
            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
            pathname === '/' ? "bg-[#4F46E5] text-white shadow-lg shadow-indigo-500/30" : "hover:text-white hover:bg-white/5"
          )}>
            <Home size={20} />
            <span className="font-medium text-sm">ড্যাশবোর্ড</span>
          </Link>

          {menuGroups.map((group, idx) => (
            <div key={idx}>
              <h3 className="px-4 text-[11px] font-bold text-[#565674] uppercase tracking-wider mb-2">
                {group.title}
              </h3>
              <ul className="flex flex-col gap-1">
                {group.items.map((item, itemIdx) => {
                  const isActive = pathname.startsWith(item.path);
                  return (
                    <li key={itemIdx}>
                      <Link href={item.path} className={clsx(
                        "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm",
                        isActive ? "bg-[#4F46E5] text-white shadow-lg shadow-indigo-500/30" : "hover:text-white hover:bg-white/5"
                      )}>
                        <item.icon size={18} className={isActive ? "text-white" : "text-[#76768e]"} />
                        <span className="font-medium">{item.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

        </div>

        {/* Logout */}
        <div className="p-4 shrink-0 mt-auto border-t border-gray-800">
          <button 
            onClick={() => {
              if(confirm('আপনি কি সত্যিই লগআউট করতে চান?')) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.reload();
              }
            }}
            className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-lg text-sm font-medium hover:text-white hover:bg-white/5 transition-all duration-200"
          >
            <LogOut size={18} className="text-[#76768e]" />
            লগআউট
          </button>
        </div>
      </aside>
    </>
  );
}

