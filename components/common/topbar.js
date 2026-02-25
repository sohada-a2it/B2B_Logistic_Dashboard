// components/common/Topbar.jsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  HiOutlineBell,
  HiOutlineMail,
  HiOutlineCalendar,
  HiOutlineGlobeAlt,
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineSearch,
  HiOutlineRefresh,
} from 'react-icons/hi';

export default function Topbar() {
  const [isDark, setIsDark] = useState(false);
  const [notifications] = useState([
    { id: 1, text: 'New shipment booking', time: '5 min ago' },
    { id: 2, text: 'Payment received', time: '1 hour ago' },
  ]);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left Section - Page Title/Breadcrumbs */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Link href="/admin" className="text-sm text-gray-500 hover:text-[#E67E22]">
              Dashboard
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-sm text-gray-800 font-medium">Overview</span>
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center space-x-3">
          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:block relative">
            <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Quick search..."
              className="pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E67E22] focus:ring-1 focus:ring-[#E67E22] transition-colors w-64"
            />
          </div>

          {/* Weather/Time Widget */}
          <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 bg-gray-50 rounded-lg">
            <HiOutlineGlobeAlt className="w-4 h-4" style={{ color: '#3C719D' }} />
            <span className="text-sm text-gray-600">Dhaka, 25°C</span>
          </div>

          {/* Currency Selector */}
          <div className="hidden lg:flex items-center space-x-1 px-2 py-1 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium" style={{ color: '#E67E22' }}>USD</span>
            <span className="text-gray-300">|</span>
            <span className="text-sm text-gray-600">GBP</span>
            <span className="text-gray-300">|</span>
            <span className="text-sm text-gray-600">CAD</span>
          </div>

          {/* Refresh Button */}
          <button className="p-2 text-gray-600 hover:text-[#3C719D] hover:bg-blue-50 rounded-lg transition-colors">
            <HiOutlineRefresh className="w-5 h-5" />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button className="relative p-2 text-gray-600 hover:text-[#E67E22] hover:bg-orange-50 rounded-lg transition-colors">
              <HiOutlineBell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>

          {/* Messages */}
          <button className="relative p-2 text-gray-600 hover:text-[#3C719D] hover:bg-blue-50 rounded-lg transition-colors">
            <HiOutlineMail className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#E67E22] rounded-full"></span>
          </button>

          {/* Calendar */}
          <button className="hidden lg:block p-2 text-gray-600 hover:text-[#3C719D] hover:bg-blue-50 rounded-lg transition-colors">
            <HiOutlineCalendar className="w-5 h-5" />
          </button>

          {/* Theme Toggle */}
          <button 
            onClick={() => setIsDark(!isDark)}
            className="p-2 text-gray-600 hover:text-[#E67E22] hover:bg-orange-50 rounded-lg transition-colors"
          >
            {isDark ? (
              <HiOutlineSun className="w-5 h-5" />
            ) : (
              <HiOutlineMoon className="w-5 h-5" />
            )}
          </button>

          {/* User Avatar - Mobile */}
          <div className="lg:hidden">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ 
                background: 'linear-gradient(135deg, #E67E22 0%, #3C719D 100%)'
              }}
            >
              A
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search - Show on mobile only */}
      <div className="md:hidden px-4 pb-3">
        <div className="relative">
          <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E67E22] focus:ring-1 focus:ring-[#E67E22] transition-colors"
          />
        </div>
      </div>
    </header>
  );
}