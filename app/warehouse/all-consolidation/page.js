// warehouse/consolidations/index.js
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import {
  Loader2, Package, Search, Calendar, MapPin, User,
  ArrowLeft, ChevronRight, Globe, Weight, Box, Layers,
  Ship, Truck, Eye, Trash2, PlusCircle, Filter,
  ChevronDown, ChevronUp, X, CheckCircle, AlertCircle,
  Anchor, Container, FileText, Download, Printer,
  Plus, Minus, Edit, Save, Clock, Hash, Map,
  Info, AlertTriangle, Check, RefreshCw, Copy,
  BarChart3, TrendingUp, PieChart, DownloadCloud,
  Filter as FilterIcon, SlidersHorizontal, Grid3x3,
  List, LayoutGrid, FolderOpen, Tag, Users,
  Phone, Mail, Building2, CalendarClock, WeightIcon,
  Ruler, PackageOpen, QrCode, Barcode, Shield,
  Sparkles, Settings, MoreVertical, ExternalLink,
  Archive, RotateCcw, Ban, Play, Pause, Send
} from 'lucide-react';
import { formatDate } from '@/Api/booking';
import {
  getConsolidations,
  getConsolidationById,
  getConsolidationStats,
  getAvailableContainerTypes,
  updateConsolidation,
  updateConsolidationStatus,
  addShipmentsToConsolidation,
  removeShipmentFromConsolidation,
  deleteConsolidation,
  getMainTypeName,
  getSubTypeName,
  formatContainerType,
  estimateContainerType,
  getConsolidationStatusColor,
  getConsolidationStatusDisplayText,
  formatDestination,
  formatVolume,
  formatWeight,
  calculateTotalVolume,
  calculateTotalWeight,
  calculateTotalPackages,
  groupConsolidationsByStatus
} from '@/Api/consolidation';

// ==================== CONSTANTS ====================

const CONSOLIDATION_STATUSES = [
  { value: 'draft', label: 'Draft', color: 'gray', icon: FileText },
  { value: 'in_progress', label: 'In Progress', color: 'blue', icon: Play },
  { value: 'loaded', label: 'Loaded', color: 'purple', icon: Package },
  { value: 'departed', label: 'Departed', color: 'orange', icon: Send },
  { value: 'arrived', label: 'Arrived', color: 'green', icon: CheckCircle },
  { value: 'completed', label: 'Completed', color: 'emerald', icon: Check },
  { value: 'cancelled', label: 'Cancelled', color: 'red', icon: Ban }
];

const CONTAINER_TYPES = [
  { value: '20ft', label: '20ft Standard Container', maxVolume: 28, icon: '📦' },
  { value: '40ft', label: '40ft Standard Container', maxVolume: 58, icon: '📦📦' },
  { value: '40ft HC', label: '40ft High Cube Container', maxVolume: 68, icon: '📦📦⬆️' },
  { value: '45ft', label: '45ft High Cube Container', maxVolume: 78, icon: '📦📦📦' },
  { value: 'LCL', label: 'LCL - Less than Container Load', maxVolume: 999, icon: '📦' },
  { value: 'ULD', label: 'ULD - Air Freight', maxVolume: 15, icon: '✈️' },
  { value: 'Truck', label: 'Full Truck Load', maxVolume: 90, icon: '🚚' },
  { value: 'LTL', label: 'Less than Truck Load', maxVolume: 30, icon: '🚚' }
];

const MAIN_TYPES = [
  { value: 'sea_freight', label: 'Sea Freight', icon: Ship },
  { value: 'air_freight', label: 'Air Freight', icon: Truck },
  { value: 'inland_trucking', label: 'Inland Trucking', icon: Truck },
  { value: 'multimodal', label: 'Multi-modal', icon: Layers }
];

const VIEW_MODES = {
  grid: { icon: LayoutGrid, label: 'Grid View' },
  list: { icon: List, label: 'List View' },
  table: { icon: Grid3x3, label: 'Table View' }
};

// ==================== HELPER FUNCTIONS ====================

const getStatusBadge = (status) => {
  const statusConfig = CONSOLIDATION_STATUSES.find(s => s.value === status) || CONSOLIDATION_STATUSES[0];
  const colors = {
    gray: 'bg-gray-100 text-gray-800',
    blue: 'bg-blue-100 text-blue-800',
    purple: 'bg-purple-100 text-purple-800',
    orange: 'bg-orange-100 text-orange-800',
    green: 'bg-green-100 text-green-800',
    emerald: 'bg-emerald-100 text-emerald-800',
    red: 'bg-red-100 text-red-800'
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[statusConfig.color]}`}>
      <statusConfig.icon className="h-3 w-3 mr-1" />
      {statusConfig.label}
    </span>
  );
};

// ==================== ডেটা প্রসেসিং হেল্পার ====================
// আপডেটেড হেল্পার ফাংশন - কনসলিডেশন থেকে ডেস্টিনেশন বের করুন
const getConsolidationDestination = (consolidation) => {
  if (!consolidation) return 'N/A';
  
  console.log('🔍 Getting destination from consolidation:', consolidation._id);
  
  // 1. কনসলিডেশনে সরাসরি destination থাকলে
  if (consolidation.destination) {
    console.log('✅ Found destination directly:', consolidation.destination);
    return consolidation.destination;
  }
  
  // 2. কনসলিডেশনে shipments অ্যারে থাকলে
  if (consolidation.shipments && Array.isArray(consolidation.shipments) && consolidation.shipments.length > 0) {
    console.log('📦 Checking shipments array:', consolidation.shipments.length);
    
    // প্রথম শিপমেন্ট থেকে destination নিন
    const firstShipment = consolidation.shipments[0];
    
    if (firstShipment.destination) {
      console.log('✅ Found destination in first shipment:', firstShipment.destination);
      return firstShipment.destination;
    }
    
    if (firstShipment.to) {
      console.log('✅ Found destination (to) in first shipment:', firstShipment.to);
      return firstShipment.to;
    }
    
    // সব শিপমেন্ট চেক করুন
    for (const shipment of consolidation.shipments) {
      if (shipment.destination) {
        console.log('✅ Found destination in a shipment:', shipment.destination);
        return shipment.destination;
      }
      if (shipment.to) {
        console.log('✅ Found destination (to) in a shipment:', shipment.to);
        return shipment.to;
      }
    }
  }
  
  // 3. কনসলিডেশনে items অ্যারে থাকলে
  if (consolidation.items && Array.isArray(consolidation.items) && consolidation.items.length > 0) {
    console.log('📦 Checking items array:', consolidation.items.length);
    
    const firstItem = consolidation.items[0];
    if (firstItem.destination) {
      console.log('✅ Found destination in first item:', firstItem.destination);
      return firstItem.destination;
    }
    if (firstItem.to) {
      console.log('✅ Found destination (to) in first item:', firstItem.to);
      return firstItem.to;
    }
  }
  
  // 4. কনসলিডেশনে route অবজেক্ট থাকলে
  if (consolidation.route) {
    if (consolidation.route.destination) {
      console.log('✅ Found destination in route:', consolidation.route.destination);
      return consolidation.route.destination;
    }
    if (consolidation.route.to) {
      console.log('✅ Found destination (to) in route:', consolidation.route.to);
      return consolidation.route.to;
    }
  }
  
  console.log('❌ No destination found in consolidation');
  return 'N/A';
};

// অরিজিনের জন্যও একইভাবে আপডেট করুন
const getConsolidationOrigin = (consolidation) => {
  if (!consolidation) return 'N/A';
  
  console.log('🔍 Getting origin from consolidation:', consolidation._id);
  
  // 1. কনসলিডেশনে সরাসরি origin থাকলে
  if (consolidation.origin) {
    console.log('✅ Found origin directly:', consolidation.origin);
    return consolidation.origin;
  }
  
  // 2. কনসলিডেশনে shipments অ্যারে থাকলে
  if (consolidation.shipments && Array.isArray(consolidation.shipments) && consolidation.shipments.length > 0) {
    console.log('📦 Checking shipments array for origin');
    
    const firstShipment = consolidation.shipments[0];
    if (firstShipment.origin) {
      console.log('✅ Found origin in first shipment:', firstShipment.origin);
      return firstShipment.origin;
    }
    if (firstShipment.from) {
      console.log('✅ Found origin (from) in first shipment:', firstShipment.from);
      return firstShipment.from;
    }
    
    for (const shipment of consolidation.shipments) {
      if (shipment.origin) {
        return shipment.origin;
      }
      if (shipment.from) {
        return shipment.from;
      }
    }
  }
  
  // 3. কনসলিডেশনে items অ্যারে থাকলে
  if (consolidation.items && Array.isArray(consolidation.items) && consolidation.items.length > 0) {
    const firstItem = consolidation.items[0];
    if (firstItem.origin) return firstItem.origin;
    if (firstItem.from) return firstItem.from;
  }
  
  // 4. কনসলিডেশনে route অবজেক্ট থাকলে
  if (consolidation.route) {
    if (consolidation.route.origin) return consolidation.route.origin;
    if (consolidation.route.from) return consolidation.route.from;
  }
  
  return 'N/A';
};  

/**
 * কনসলিডেশন থেকে শিপমেন্ট কাউন্ট বের করুন
 */
const getShipmentCount = (consolidation) => {
  if (!consolidation) return 0;
  
  // বিভিন্ন সম্ভাব্য উৎস থেকে কাউন্ট বের করা
  if (consolidation.shipmentCount) return consolidation.shipmentCount;
  if (consolidation.shipments?.length) return consolidation.shipments.length;
  if (consolidation.items?.length) return consolidation.items.length;
  if (consolidation.shipmentIds?.length) return consolidation.shipmentIds.length;
  
  // শিপমেন্ট অবজেক্ট থেকে কাউন্ট বের করা
  if (consolidation.shipments && typeof consolidation.shipments === 'object') {
    return Object.keys(consolidation.shipments).length;
  }
  
  return 0;
};

/**
 * কনসলিডেশন থেকে টোটাল প্যাকেজ বের করুন
 */
const getTotalPackages = (consolidation) => {
  if (!consolidation) return 0;
  
  // সরাসরি totalPackages থাকলে
  if (consolidation.totalPackages) return consolidation.totalPackages;
  
  // শিপমেন্ট থেকে ক্যালকুলেট করা
  const shipments = consolidation.shipments || consolidation.items || [];
  if (shipments.length > 0) {
    return shipments.reduce((total, shipment) => {
      // shipment এ totalPackages থাকলে
      if (shipment.totalPackages) return total + shipment.totalPackages;
      
      // shipment এ packages অ্যারে থাকলে
      if (shipment.packages && Array.isArray(shipment.packages)) {
        return total + shipment.packages.reduce((sum, pkg) => sum + (pkg.quantity || 1), 0);
      }
      
      // shipment এ quantity থাকলে
      if (shipment.quantity) return total + shipment.quantity;
      
      // ডিফল্ট ১
      return total + 1;
    }, 0);
  }
  
  return 0;
};

/**
 * কনসলিডেশন থেকে টোটাল ভলিউম বের করুন
 */
const getTotalVolume = (consolidation) => {
  if (!consolidation) return 0;
  
  // সরাসরি totalVolume থাকলে
  if (consolidation.totalVolume) return consolidation.totalVolume;
  
  // শিপমেন্ট থেকে ক্যালকুলেট করা
  const shipments = consolidation.shipments || consolidation.items || [];
  if (shipments.length > 0) {
    return shipments.reduce((total, shipment) => {
      if (shipment.totalVolume) return total + shipment.totalVolume;
      if (shipment.volume) return total + shipment.volume;
      
      // প্যাকেজ থেকে ভলিউম ক্যালকুলেট
      if (shipment.packages && Array.isArray(shipment.packages)) {
        return total + shipment.packages.reduce((sum, pkg) => {
          const volume = (pkg.length || 0) * (pkg.width || 0) * (pkg.height || 0) / 1000000;
          return sum + (volume * (pkg.quantity || 1));
        }, 0);
      }
      
      return total;
    }, 0);
  }
  
  return 0;
};

/**
 * কনসলিডেশন থেকে টোটাল ওয়েট বের করুন
 */
const getTotalWeight = (consolidation) => {
  if (!consolidation) return 0;
  
  // সরাসরি totalWeight থাকলে
  if (consolidation.totalWeight) return consolidation.totalWeight;
  
  // শিপমেন্ট থেকে ক্যালকুলেট করা
  const shipments = consolidation.shipments || consolidation.items || [];
  if (shipments.length > 0) {
    return shipments.reduce((total, shipment) => {
      if (shipment.totalWeight) return total + shipment.totalWeight;
      if (shipment.weight) return total + shipment.weight;
      
      // প্যাকেজ থেকে ওয়েট ক্যালকুলেট
      if (shipment.packages && Array.isArray(shipment.packages)) {
        return total + shipment.packages.reduce((sum, pkg) => {
          return sum + ((pkg.weight || 0) * (pkg.quantity || 1));
        }, 0);
      }
      
      return total;
    }, 0);
  }
  
  return 0;
};

/**
 * কনসলিডেশন থেকে কন্টেইনার টাইপ বের করুন
 */
const getContainerType = (consolidation) => {
  if (!consolidation) return 'N/A';
  
  return consolidation.containerType || 
         consolidation.container?.type || 
         'N/A';
};

/**
 * কন্টেইনার নাম্বার বের করুন
 */
const getContainerNumber = (consolidation) => {
  if (!consolidation) return 'N/A';
  
  return consolidation.containerNumber || 
         consolidation.container?.number || 
         'N/A';
};

/**
 * সিল নাম্বার বের করুন
 */
const getSealNumber = (consolidation) => {
  if (!consolidation) return 'N/A';
  
  return consolidation.sealNumber || 
         consolidation.seal?.number || 
         'N/A';
};

/**
 * মেইন টাইপ বের করুন
 */
const getMainType = (consolidation) => {
  if (!consolidation) return 'N/A';
  
  return consolidation.mainType || 
         consolidation.type?.main || 
         'N/A';
};

/**
 * সাব টাইপ বের করুন
 */
const getSubType = (consolidation) => {
  if (!consolidation) return 'N/A';
  
  return consolidation.subType || 
         consolidation.type?.sub || 
         'N/A';
};

// ==================== COMPONENTS ====================

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color = 'orange', trend, trendValue, subtitle }) => {
  const colorClasses = {
    orange: 'bg-orange-50 text-orange-600',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600'
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && (
            <p className={`text-xs mt-2 flex items-center ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
            </p>
          )}
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-4 rounded-xl ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};

// Filter Bar Component
const FilterBar = ({ filters, onFilterChange, onClearFilters, totalCount }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
      {/* Basic Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by consolidation number, container number..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="w-full pl-9 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#E67E22]"
          />
        </div>
        
        <select
          value={filters.status || ''}
          onChange={(e) => onFilterChange('status', e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#E67E22] bg-white min-w-[150px]"
        >
          <option value="">All Status</option>
          {CONSOLIDATION_STATUSES.map(status => (
            <option key={status.value} value={status.value}>{status.label}</option>
          ))}
        </select>

        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center"
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filters
          {Object.keys(filters).length > 2 && (
            <span className="ml-2 px-2 py-0.5 bg-[#E67E22] text-white text-xs rounded-full">
              {Object.keys(filters).length - 2}
            </span>
          )}
        </button>

        <button
          onClick={onClearFilters}
          className="px-4 py-2 text-gray-600 hover:text-gray-900"
        >
          Clear
        </button>

        <div className="text-sm text-gray-500">
          {totalCount} consolidations found
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="grid grid-cols-4 gap-4 pt-4 border-t">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Main Type</label>
            <select
              value={filters.mainType || ''}
              onChange={(e) => onFilterChange('mainType', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#E67E22]"
            >
              <option value="">All Types</option>
              {MAIN_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Container Type</label>
            <select
              value={filters.containerType || ''}
              onChange={(e) => onFilterChange('containerType', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#E67E22]"
            >
              <option value="">All Containers</option>
              {CONTAINER_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Origin</label>
            <input
              type="text"
              placeholder="e.g., Shanghai"
              value={filters.origin || ''}
              onChange={(e) => onFilterChange('origin', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#E67E22]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Destination</label>
            <input
              type="text"
              placeholder="e.g., Hamburg"
              value={filters.destination || ''}
              onChange={(e) => onFilterChange('destination', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#E67E22]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Date From</label>
            <input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => onFilterChange('dateFrom', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#E67E22]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Date To</label>
            <input
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => onFilterChange('dateTo', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#E67E22]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Sort By</label>
            <select
              value={filters.sortBy || 'createdAt'}
              onChange={(e) => onFilterChange('sortBy', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#E67E22]"
            >
              <option value="createdAt">Created Date</option>
              <option value="estimatedDeparture">Departure Date</option>
              <option value="totalVolume">Volume</option>
              <option value="totalWeight">Weight</option>
              <option value="shipmentCount">Shipment Count</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Sort Order</label>
            <select
              value={filters.sortOrder || 'desc'}
              onChange={(e) => onFilterChange('sortOrder', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#E67E22]"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

// Consolidation Card Component (Grid View) - ফিক্সড ভার্সন
// ConsolidationCard কম্পোনেন্ট - আপডেটেড ভার্সন
const ConsolidationCard = ({ consolidation, onView, onEdit, onStatusChange, onDelete }) => {
  const [showActions, setShowActions] = useState(false);
  
  // আপনার ডেটা স্ট্রাকচার অনুযায়ী origin/destination নিন
  const origin = consolidation.originWarehouse || 'N/A';
  const destination = consolidation.destinationPort || 'N/A';
  
  // Shipments count
  const shipmentCount = consolidation.shipments?.length || consolidation.totalShipments || 0;
  
  // Packages, Volume, Weight
  const totalPackages = consolidation.totalPackages || 0;
  const totalVolume = consolidation.totalVolume || 0;
  const totalWeight = consolidation.totalWeight || 0;
  
  // Container info
  const containerType = consolidation.containerType || 'N/A';
  const containerNumber = consolidation.containerNumber || 'N/A';
  const sealNumber = consolidation.sealNumber || 'N/A';
  
  // Main type & Sub type
  const mainType = consolidation.mainType || 'N/A';
  const subType = consolidation.subType || 'N/A';
  
  // Utilization calculations
  const volumeUtilization = (totalVolume / 100) * 100;
  const weightUtilization = (totalWeight / 28000) * 100;

  return (
    <div 
      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-orange-50 to-amber-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Container className="h-5 w-5 text-[#E67E22]" />
            <span className="font-mono text-sm font-medium">
              {consolidation.consolidationNumber || consolidation._id?.slice(-8)}
            </span>
          </div>
          {getStatusBadge(consolidation.status)}
        </div>
        <div className="flex items-center mt-2 text-xs text-gray-600">
          <Ship className="h-3 w-3 mr-1" />
          <span>{getMainTypeName(mainType)} - {getSubTypeName(subType)}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Route - এখন দেখাবে! */}
        <div className="bg-gray-50 p-3 rounded-lg mb-3">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">FROM</p>
              <p className="font-medium text-gray-800 flex items-center">
                <MapPin className="h-3 w-3 text-orange-500 mr-1" />
                {origin}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
            <div className="flex-1 text-right">
              <p className="text-xs text-gray-500 mb-1">TO</p>
              <p className="font-medium text-gray-800 flex items-center justify-end">
                {destination}
                <MapPin className="h-3 w-3 text-green-500 ml-1" />
              </p>
            </div>
          </div>
        </div>

        {/* Container Info */}
        <div className="bg-gray-50 rounded-lg p-3 mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500">Container</span>
            <span className="text-sm font-semibold">
              {formatContainerType(containerType)}
            </span>
          </div>
          <div className="text-xs text-gray-600">
            <div className="flex justify-between mb-1">
              <span>Number:</span>
              <span className="font-mono">{containerNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Seal:</span>
              <span className="font-mono">{sealNumber}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-blue-50 rounded-lg p-2">
            <Ship className="h-3 w-3 text-blue-600 mb-1" />
            <p className="text-xs text-gray-500">Shipments</p>
            <p className="text-sm font-bold">{shipmentCount}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-2">
            <Package className="h-3 w-3 text-green-600 mb-1" />
            <p className="text-xs text-gray-500">Packages</p>
            <p className="text-sm font-bold">{totalPackages}</p>
          </div>
        </div>

        {/* Volume & Weight */}
        <div className="space-y-2 mb-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-500">Volume</span>
              <span className="font-medium">{formatVolume(totalVolume)}</span>
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-orange-500 rounded-full"
                style={{ width: `${Math.min(volumeUtilization, 100)}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-500">Weight</span>
              <span className="font-medium">{formatWeight(totalWeight)}</span>
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${Math.min(weightUtilization, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="text-xs text-gray-400 space-y-1">
          <div className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            Est: {consolidation.estimatedDeparture ? formatDate(consolidation.estimatedDeparture) : 'N/A'}
          </div>
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            Created: {formatDate(consolidation.createdAt)}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className={`p-3 bg-gray-50 border-t flex justify-end space-x-2 transition-opacity ${showActions ? 'opacity-100' : 'opacity-0'}`}>
        <button
          onClick={() => onView(consolidation._id)}
          className="p-1.5 hover:bg-blue-100 rounded-lg text-blue-600"
          title="View Details"
        >
          <Eye className="h-4 w-4" />
        </button>
        <button
          onClick={() => onEdit(consolidation._id)}
          className="p-1.5 hover:bg-green-100 rounded-lg text-green-600"
          title="Edit"
        >
          <Edit className="h-4 w-4" />
        </button>
        <button
          onClick={() => onStatusChange(consolidation._id)}
          className="p-1.5 hover:bg-purple-100 rounded-lg text-purple-600"
          title="Change Status"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
        <button
          onClick={() => onDelete(consolidation._id)}
          className="p-1.5 hover:bg-red-100 rounded-lg text-red-600"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// Table Row Component (Table View)
const TableRow = ({ consolidation, onView, onEdit, onStatusChange, onDelete }) => {
  const origin = getConsolidationOrigin(consolidation);
  const destination = getConsolidationDestination(consolidation);
  const shipmentCount = getShipmentCount(consolidation);
  const totalPackages = getTotalPackages(consolidation);
  const totalVolume = getTotalVolume(consolidation);
  const totalWeight = getTotalWeight(consolidation);
  const containerType = getContainerType(consolidation);
  const containerNumber = getContainerNumber(consolidation);
  const mainType = getMainType(consolidation);
  const subType = getSubType(consolidation);

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3">
        <input type="checkbox" className="rounded border-gray-300 text-[#E67E22] focus:ring-[#E67E22]" />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center">
          <Container className="h-4 w-4 text-[#E67E22] mr-2" />
          <span className="font-mono text-sm">
            {consolidation.consolidationNumber || consolidation._id?.slice(-8)}
          </span>
        </div>
      </td>
      <td className="px-4 py-3">{getStatusBadge(consolidation.status)}</td>
      <td className="px-4 py-3">
        <div className="text-sm">
          <div className="font-medium">{getMainTypeName(mainType)}</div>
          <div className="text-xs text-gray-500">{getSubTypeName(subType)}</div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="text-sm">
          <div>{formatContainerType(containerType)}</div>
          <div className="text-xs text-gray-500">{containerNumber}</div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="text-sm">
          <div className="flex items-center">
            <MapPin className="h-3 w-3 text-gray-400 mr-1" />
            {origin}
          </div>
          <div className="flex items-center text-xs text-gray-500 mt-1">
            <ChevronRight className="h-3 w-3" />
            {destination}
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="text-sm">
          <div>{shipmentCount}</div>
          <div className="text-xs text-gray-500">{totalPackages} pkgs</div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="text-sm">
          <div>{formatVolume(totalVolume)}</div>
          <div className="text-xs text-gray-500">{formatWeight(totalWeight)}</div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="text-sm">
          <div>{formatDate(consolidation.estimatedDeparture)}</div>
          <div className="text-xs text-gray-500">{formatDate(consolidation.createdAt)}</div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onView(consolidation._id)}
            className="p-1 hover:bg-blue-100 rounded-lg text-blue-600"
            title="View"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => onEdit(consolidation._id)}
            className="p-1 hover:bg-green-100 rounded-lg text-green-600"
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onStatusChange(consolidation._id, consolidation.status)}
            className="p-1 hover:bg-purple-100 rounded-lg text-purple-600"
            title="Change Status"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to delete this consolidation?')) {
                onDelete(consolidation._id);
              }
            }}
            className="p-1 hover:bg-red-100 rounded-lg text-red-600"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

// List Item Component (List View)
const ListItem = ({ consolidation, onView, onEdit, onStatusChange, onDelete }) => {
  const origin = getConsolidationOrigin(consolidation);
  const destination = getConsolidationDestination(consolidation);
  const shipmentCount = getShipmentCount(consolidation);
  const totalPackages = getTotalPackages(consolidation);
  const totalVolume = getTotalVolume(consolidation);
  const totalWeight = getTotalWeight(consolidation);
  const containerType = getContainerType(consolidation);
  const containerNumber = getContainerNumber(consolidation);
  const mainType = getMainType(consolidation);
  const subType = getSubType(consolidation);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          <div className="p-3 bg-orange-50 rounded-xl">
            <Container className="h-6 w-6 text-[#E67E22]" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <span className="font-mono font-medium">
                {consolidation.consolidationNumber || consolidation._id?.slice(-8)}
              </span>
              {getStatusBadge(consolidation.status)}
              <span className="text-sm text-gray-500">
                {getMainTypeName(mainType)} - {getSubTypeName(subType)}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500">Container</p>
                <p className="text-sm font-medium">{formatContainerType(containerType)}</p>
                <p className="text-xs text-gray-400">{containerNumber}</p>
              </div>
              
              <div>
                <p className="text-xs text-gray-500">Route</p>
                <p className="text-sm">{origin}</p>
                <p className="text-xs text-gray-400">→ {destination}</p>
              </div>
              
              <div>
                <p className="text-xs text-gray-500">Shipments</p>
                <p className="text-sm font-medium">{shipmentCount}</p>
                <p className="text-xs text-gray-400">{totalPackages} packages</p>
              </div>
              
              <div>
                <p className="text-xs text-gray-500">Volume/Weight</p>
                <p className="text-sm">{formatVolume(totalVolume)}</p>
                <p className="text-xs text-gray-400">{formatWeight(totalWeight)}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
              <span className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                Est: {formatDate(consolidation.estimatedDeparture)}
              </span>
              <span className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                Created: {formatDate(consolidation.createdAt)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => onView(consolidation._id)}
            className="p-2 hover:bg-blue-100 rounded-lg text-blue-600"
            title="View"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => onEdit(consolidation._id)}
            className="p-2 hover:bg-green-100 rounded-lg text-green-600"
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onStatusChange(consolidation._id, consolidation.status)}
            className="p-2 hover:bg-purple-100 rounded-lg text-purple-600"
            title="Change Status"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to delete this consolidation?')) {
                onDelete(consolidation._id);
              }
            }}
            className="p-2 hover:bg-red-100 rounded-lg text-red-600"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Status Change Modal
const StatusChangeModal = ({ isOpen, onClose, consolidationId, currentStatus, onStatusUpdated }) => {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selectedStatus) {
      toast.warning('Please select a status');
      return;
    }

    setLoading(true);
    try {
      const result = await updateConsolidationStatus(consolidationId, {
        status: selectedStatus,
        notes: notes
      });

      if (result.success) {
        toast.success('Status updated successfully');
        onStatusUpdated();
        onClose();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6 border-b">
          <h3 className="text-lg font-bold">Update Consolidation Status</h3>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#E67E22]"
            >
              {CONSOLIDATION_STATUSES.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Add any notes about this status change..."
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#E67E22]"
            />
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs text-blue-700">
              <Info className="h-3 w-3 inline mr-1" />
              Status changes will be recorded in the consolidation history
            </p>
          </div>
        </div>

        <div className="p-6 border-t flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-[#E67E22] text-white rounded-lg hover:bg-[#d35400] disabled:bg-gray-300 flex items-center"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Status'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Edit Consolidation Modal
const EditConsolidationModal = ({ isOpen, onClose, consolidation, onUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    containerNumber: '',
    containerType: '',
    sealNumber: '',
    estimatedDeparture: '',
    notes: ''
  });

  useEffect(() => {
    if (consolidation) {
      setFormData({
        containerNumber: getContainerNumber(consolidation),
        containerType: getContainerType(consolidation),
        sealNumber: getSealNumber(consolidation),
        estimatedDeparture: consolidation.estimatedDeparture?.split('T')[0] || '',
        notes: consolidation.notes || ''
      });
    }
  }, [consolidation]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await updateConsolidation(consolidation._id, formData);
      
      if (result.success) {
        toast.success('Consolidation updated successfully');
        onUpdated();
        onClose();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to update consolidation');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6">
          <h3 className="text-lg font-bold">Edit Consolidation</h3>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Container Number
            </label>
            <input
              type="text"
              value={formData.containerNumber}
              onChange={(e) => setFormData({ ...formData, containerNumber: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#E67E22]"
              placeholder="e.g., MSKU1234567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Container Type
            </label>
            <select
              value={formData.containerType}
              onChange={(e) => setFormData({ ...formData, containerType: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#E67E22]"
            >
              <option value="">Select Container Type</option>
              {CONTAINER_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Seal Number
            </label>
            <input
              type="text"
              value={formData.sealNumber}
              onChange={(e) => setFormData({ ...formData, sealNumber: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#E67E22]"
              placeholder="e.g., SL123456"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estimated Departure
            </label>
            <input
              type="date"
              value={formData.estimatedDeparture}
              onChange={(e) => setFormData({ ...formData, estimatedDeparture: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#E67E22]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#E67E22]"
              placeholder="Additional notes..."
            />
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t p-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-[#E67E22] text-white rounded-lg hover:bg-[#d35400] disabled:bg-gray-300 flex items-center"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Bulk Actions Bar
const BulkActionsBar = ({ selectedCount, onClear, onBulkAction }) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 flex items-center space-x-4 z-50">
      <span className="text-sm font-medium">
        {selectedCount} consolidation{selectedCount > 1 ? 's' : ''} selected
      </span>
      <div className="h-4 w-px bg-gray-200" />
      <button
        onClick={() => onBulkAction('status')}
        className="px-3 py-1.5 text-sm bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100"
      >
        Change Status
      </button>
      <button
        onClick={() => onBulkAction('export')}
        className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
      >
        Export Selected
      </button>
      <button
        onClick={() => onBulkAction('print')}
        className="px-3 py-1.5 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100"
      >
        Print Labels
      </button>
      <button
        onClick={() => onBulkAction('delete')}
        className="px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
      >
        Delete
      </button>
      <div className="h-4 w-px bg-gray-200" />
      <button
        onClick={onClear}
        className="text-sm text-gray-500 hover:text-gray-700"
      >
        Clear
      </button>
    </div>
  );
};

// Export Modal
const ExportModal = ({ isOpen, onClose, onExport }) => {
  const [format, setFormat] = useState('csv');
  const [includeDetails, setIncludeDetails] = useState(true);
  const [dateRange, setDateRange] = useState('all');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6 border-b">
          <h3 className="text-lg font-bold">Export Consolidations</h3>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['csv', 'excel', 'pdf'].map(f => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`p-2 border rounded-lg text-sm capitalize ${
                    format === f 
                      ? 'bg-[#E67E22] text-white border-[#E67E22]' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#E67E22]"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="includeDetails"
              checked={includeDetails}
              onChange={(e) => setIncludeDetails(e.target.checked)}
              className="rounded border-gray-300 text-[#E67E22] focus:ring-[#E67E22]"
            />
            <label htmlFor="includeDetails" className="ml-2 text-sm text-gray-700">
              Include shipment details
            </label>
          </div>
        </div>

        <div className="p-6 border-t flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onExport({ format, includeDetails, dateRange })}
            className="px-4 py-2 bg-[#E67E22] text-white rounded-lg hover:bg-[#d35400]"
          >
            Export
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== MAIN PAGE ====================

export default function ConsolidationsPage() {
  const router = useRouter();
  
  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [consolidations, setConsolidations] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    status: '',
    mainType: '',
    search: '',
    origin: '',
    destination: '',
    containerType: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Modal states
  const [selectedConsolidation, setSelectedConsolidation] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  
  // Load data
  useEffect(() => {
    loadConsolidations();
    loadStats();
  }, [filters.page, filters.status, filters.mainType, filters.sortBy, filters.sortOrder]);

  // loadConsolidations ফাংশন আপডেট করুন
const loadConsolidations = async () => {
  setLoading(true);
  try {
    const result = await getConsolidations(filters);
    if (result.success) {
      // ডেটা প্রসেস করে নিন
      const processedData = result.data.map(cons => {
        console.log('🔍 Processing consolidation:', cons._id, cons.consolidationNumber);
        
        // কনসলিডেশনে সরাসরি destination আছে কিনা দেখুন
        if (cons.destination) {
          console.log('✅ Found destination directly:', cons.destination);
        } 
        // shipments অ্যারে থেকে destination বের করুন
        else if (cons.shipments && cons.shipments.length > 0) {
          console.log('📦 First shipment:', cons.shipments[0]);
          console.log('📦 Shipment destination:', cons.shipments[0]?.destination);
          
          // shipments থেকে destination নিয়ে cons-এ যোগ করুন
          const firstShipment = cons.shipments[0];
          if (firstShipment?.destination) {
            cons.destination = firstShipment.destination;
            console.log('✅ Added destination from shipment:', cons.destination);
          }
          if (firstShipment?.origin) {
            cons.origin = firstShipment.origin;
          }
        }
        
        return cons;
      });
      
      setConsolidations(processedData);
      setPagination(result.pagination);
      
      console.log('📊 Processed Consolidations:', processedData);
    } else {
      toast.error(result.message);
    }
  } catch (error) {
    toast.error('Failed to load consolidations');
  } finally {
    setLoading(false);
  }
};

  const loadStats = async () => {
    try {
      const result = await getConsolidationStats();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadConsolidations();
    await loadStats();
    setRefreshing(false);
    toast.success('Data refreshed');
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page on filter change
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
      status: '',
      mainType: '',
      search: '',
      origin: '',
      destination: '',
      containerType: '',
      dateFrom: '',
      dateTo: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleViewDetails = (id) => {
    router.push(`/warehouse/consolidations/${id}`);
  };

  const handleEdit = (id) => {
    const consolidation = consolidations.find(c => c._id === id);
    setSelectedConsolidation(consolidation);
    setShowEditModal(true);
  };

  const handleStatusChange = (id, currentStatus) => {
    const consolidation = consolidations.find(c => c._id === id);
    setSelectedConsolidation(consolidation);
    setShowStatusModal(true);
  };

  const handleDelete = async (id) => {
    try {
      const result = await deleteConsolidation(id);
      if (result.success) {
        toast.success('Consolidation deleted successfully');
        loadConsolidations();
        loadStats();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to delete consolidation');
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(consolidations.map(c => c._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const handleBulkAction = (action) => {
    if (selectedIds.length === 0) {
      toast.warning('No items selected');
      return;
    }

    switch (action) {
      case 'status':
        toast.info(`Change status for ${selectedIds.length} consolidations`);
        break;
      case 'export':
        setShowExportModal(true);
        break;
      case 'print':
        toast.info('Printing labels...');
        break;
      case 'delete':
        if (confirm(`Delete ${selectedIds.length} consolidations?`)) {
          toast.success('Bulk delete initiated');
        }
        break;
    }
  };

  // Calculate stats for display
  const groupedByStatus = groupConsolidationsByStatus(consolidations);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/warehouse" className="p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Package className="h-6 w-6 mr-2 text-[#E67E22]" />
                  Consolidations Management
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Manage all your freight consolidations in one place
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 hover:bg-gray-100 rounded-lg"
                title="Refresh"
              >
                <RefreshCw className={`h-5 w-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              
              <button
                onClick={() => setShowExportModal(true)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm flex items-center"
              >
                <DownloadCloud className="h-4 w-4 mr-2" />
                Export
              </button>
              
              <Link
                href="/warehouse/consolidation-queue"
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm flex items-center"
              >
                <Package className="h-4 w-4 mr-2" />
                Queue
              </Link>
              
              <Link
                href="/warehouse/consolidations/create"
                className="px-4 py-2 bg-[#E67E22] text-white rounded-lg hover:bg-[#d35400] text-sm flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Consolidation
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">
              <StatCard 
                title="Total Consolidations" 
                value={stats.totalConsolidations || 0} 
                icon={Package} 
                color="orange"
              />
              <StatCard 
                title="In Progress" 
                value={stats.byStatus?.in_progress || 0} 
                icon={Play} 
                color="blue"
                subtitle={`${((stats.byStatus?.in_progress / stats.totalConsolidations) * 100 || 0).toFixed(1)}% of total`}
              />
              <StatCard 
                title="Completed" 
                value={stats.byStatus?.completed || 0} 
                icon={CheckCircle} 
                color="green"
              />
              <StatCard 
                title="Total Volume" 
                value={formatVolume(stats.totalVolume)} 
                icon={Box} 
                color="purple"
              />
              <StatCard 
                title="Total Weight" 
                value={formatWeight(stats.totalWeight)} 
                icon={Weight} 
                color="red"
              />
            </div>
          )}
        </div>

        {/* Filters */}
        <FilterBar 
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          totalCount={pagination?.total || 0}
        />

        {/* View Mode Toggle */}
        <div className="flex items-center justify-between mt-4 mb-4">
          <div className="flex items-center space-x-2">
            {Object.entries(VIEW_MODES).map(([mode, { icon: Icon, label }]) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`p-2 rounded-lg ${
                  viewMode === mode 
                    ? 'bg-[#E67E22] text-white' 
                    : 'bg-white border hover:bg-gray-50'
                }`}
                title={label}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>

          {/* Results info */}
          <div className="text-sm text-gray-500">
            Showing {consolidations.length} of {pagination?.total || 0} consolidations
          </div>
        </div>

        {/* Main Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border">
            <Loader2 className="h-10 w-10 animate-spin text-[#E67E22] mb-4" />
            <p className="text-sm text-gray-500">Loading consolidations...</p>
          </div>
        ) : consolidations.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border">
            <div className="bg-orange-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="h-10 w-10 text-[#E67E22]" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No consolidations found</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
              {filters.search || filters.status || filters.mainType 
                ? 'Try adjusting your filters'
                : 'Create your first consolidation from the queue'}
            </p>
            <Link
              href="/warehouse/consolidation-queue"
              className="inline-flex items-center px-4 py-2 bg-[#E67E22] text-white rounded-lg hover:bg-[#d35400]"
            >
              <Package className="h-4 w-4 mr-2" />
              Go to Consolidation Queue
            </Link>
          </div>
        ) : (
          <>
            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {consolidations.map(consolidation => (
                  <ConsolidationCard
                    key={consolidation._id}
                    consolidation={consolidation}
                    onView={handleViewDetails}
                    onEdit={handleEdit}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <div className="space-y-3">
                {consolidations.map(consolidation => (
                  <ListItem
                    key={consolidation._id}
                    consolidation={consolidation}
                    onView={handleViewDetails}
                    onEdit={handleEdit}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}

            {/* Table View */}
            {viewMode === 'table' && (
              <div className="bg-white rounded-xl border overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3">
                        <input
                          type="checkbox"
                          onChange={handleSelectAll}
                          checked={selectedIds.length === consolidations.length && consolidations.length > 0}
                          className="rounded border-gray-300 text-[#E67E22] focus:ring-[#E67E22]"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Container
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Route
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Shipments
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Volume/Weight
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dates
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {consolidations.map(consolidation => (
                      <TableRow
                        key={consolidation._id}
                        consolidation={consolidation}
                        onView={handleViewDetails}
                        onEdit={handleEdit}
                        onStatusChange={handleStatusChange}
                        onDelete={handleDelete}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-500">
                  Page {pagination.page} of {pagination.pages}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    let pageNum;
                    if (pagination.pages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.pages - 2) {
                      pageNum = pagination.pages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1 rounded-lg ${
                          pagination.page === pageNum
                            ? 'bg-[#E67E22] text-white'
                            : 'border hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <StatusChangeModal
        isOpen={showStatusModal}
        onClose={() => {
          setShowStatusModal(false);
          setSelectedConsolidation(null);
        }}
        consolidationId={selectedConsolidation?._id}
        currentStatus={selectedConsolidation?.status}
        onStatusUpdated={() => {
          loadConsolidations();
          loadStats();
        }}
      />

      <EditConsolidationModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedConsolidation(null);
        }}
        consolidation={selectedConsolidation}
        onUpdated={() => {
          loadConsolidations();
          loadStats();
        }}
      />

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={(options) => {
          toast.success(`Exporting as ${options.format}...`);
          setShowExportModal(false);
        }}
      />

      {/* Bulk Actions */}
      <BulkActionsBar
        selectedCount={selectedIds.length}
        onClear={() => setSelectedIds([])}
        onBulkAction={handleBulkAction}
      />
    </div>
  );
}