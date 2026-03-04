// app/warehouse/expected/page.jsx - সম্পূর্ণ আপডেটেড কোড

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getExpectedShipments, receiveShipment } from '@/Api/warehouse';
import { formatDate } from '@/Api/booking';
import { 
  Loader2, Package, Search, Calendar, MapPin, User, 
  X, CheckCircle, Map, AlertTriangle, Save, Boxes,
  Warehouse, Layers, Tag, Hash, Weight, Ruler, AlertOctagon
} from 'lucide-react';
import { toast } from 'react-toastify';

// ==================== CONSTANTS ====================

// Package Type wise Storage Zone Mapping
const PACKAGE_STORAGE_MAP = {
  // Pallets - Heavy items
  'pallet': { 
    zone: 'P', 
    zoneName: 'Pallet Zone', 
    default: 'P-1-1-1',
    description: 'Heavy duty pallet racking'
  },
  'crate': { 
    zone: 'C', 
    zoneName: 'Crate Zone', 
    default: 'C-1-1-1',
    description: 'Wooden crate storage'
  },
  'wooden_box': { 
    zone: 'W', 
    zoneName: 'Wooden Box Zone', 
    default: 'W-1-1-1',
    description: 'Wooden box storage area'
  },
  
  // Cartons/Boxes - General items
  'carton': { 
    zone: 'A', 
    zoneName: 'General Carton Zone', 
    default: 'A-1-1-1',
    description: 'Standard carton storage'
  },
  'box': { 
    zone: 'A', 
    zoneName: 'General Carton Zone', 
    default: 'A-1-1-1',
    description: 'Standard box storage'
  },
  
  // Containers - Large items
  'container': { 
    zone: 'L', 
    zoneName: 'Large Container Zone', 
    default: 'L-1-1-1',
    description: 'Empty container storage'
  },
  '20ft_container': { 
    zone: 'Y20', 
    zoneName: '20ft Container Yard', 
    default: 'Y20-1-1-1',
    description: '20ft container parking'
  },
  '40ft_container': { 
    zone: 'Y40', 
    zoneName: '40ft Container Yard', 
    default: 'Y40-1-1-1',
    description: '40ft container parking'
  },
  
  // Special items
  'loose_cargo': { 
    zone: 'B', 
    zoneName: 'Bulk Cargo Zone', 
    default: 'B-1-1-1',
    description: 'Bulk cargo storage'
  },
  'loose_tires': { 
    zone: 'T', 
    zoneName: 'Tire Storage Zone', 
    default: 'T-1-1-1',
    description: 'Tire storage racks'
  },
  
  // Small items
  'envelope': { 
    zone: 'S', 
    zoneName: 'Small Items Zone', 
    default: 'S-1-1-1',
    description: 'Small parcel storage'
  }
};

// 🚨 DAMAGE ZONE - আলাদা করে যোগ করা হলো
const DAMAGE_ZONE = {
  zone: 'DZ',
  zoneName: '🚨 DAMAGE ZONE - Inspection Area',
  default: 'DZ-1-1-1',
  description: 'Damaged goods - Awaiting inspection/disposal'
};

// Default storage (if package type not found)
const DEFAULT_STORAGE = { 
  zone: 'G', 
  zoneName: 'General Storage', 
  default: 'G-1-1-1',
  description: 'General purpose storage'
};

// Condition options
const CONDITION_OPTIONS = [
  { value: 'Good', label: '✅ Good - No damage', color: 'text-green-600', bg: 'bg-green-50' },
  { value: 'Damaged', label: '❌ Damaged - Send to DAMAGE ZONE', color: 'text-red-600', bg: 'bg-red-50' },
  { value: 'Partial', label: '⚠️ Partially Damaged - Send to DAMAGE ZONE', color: 'text-yellow-600', bg: 'bg-yellow-50' }
];

// Zone Colors for UI
const ZONE_COLORS = {
  'P': { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
  'C': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  'W': { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  'A': { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
  'L': { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' },
  'Y20': { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
  'Y40': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
  'B': { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-200' },
  'T': { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
  'S': { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-200' },
  'DZ': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' }, // Damage Zone Color
  'G': { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' },
};

// ==================== HELPER FUNCTIONS ====================

// Get unique package types from shipment
const getPackageTypes = (shipment) => {
  if (!shipment?.packages || shipment.packages.length === 0) {
    return ['carton']; // Default
  }
  
  // Get unique package types
  const types = [...new Set(shipment.packages.map(p => p.packagingType))];
  return types;
};

// Get suggested storage location based on package types AND condition
const getSuggestedStorage = (shipment, condition = 'Good') => {
  // If condition is Damaged or Partial, always suggest DAMAGE ZONE
  if (condition === 'Damaged' || condition === 'Partial') {
    return {
      location: DAMAGE_ZONE.default,
      zone: DAMAGE_ZONE.zoneName,
      zoneCode: DAMAGE_ZONE.zone,
      packageTypes: getPackageTypes(shipment),
      description: DAMAGE_ZONE.description,
      isDamageZone: true
    };
  }
  
  const packageTypes = getPackageTypes(shipment);
  
  if (packageTypes.length === 1) {
    // Single package type
    const map = PACKAGE_STORAGE_MAP[packageTypes[0]] || DEFAULT_STORAGE;
    return {
      location: map.default,
      zone: map.zoneName,
      zoneCode: map.zone,
      packageTypes: packageTypes,
      description: map.description,
      isDamageZone: false
    };
  } else {
    // Multiple package types - use Mixed Zone
    return {
      location: 'M-1-1-1',
      zone: 'Mixed Storage Zone',
      zoneCode: 'M',
      packageTypes: packageTypes,
      description: 'Multi-type package storage',
      isDamageZone: false
    };
  }
};

// Generate location options - শুধুমাত্র ১টি করে
const getLocationSuggestion = (packageType, condition = 'Good') => {
  // If damaged, only show damage zone
  if (condition === 'Damaged' || condition === 'Partial') {
    return [{
      value: DAMAGE_ZONE.default,
      label: `🚨 ${DAMAGE_ZONE.zoneName} - ${DAMAGE_ZONE.description}`
    }];
  }
  
  const map = PACKAGE_STORAGE_MAP[packageType] || DEFAULT_STORAGE;
  // শুধুমাত্র ১টি লোকেশন দেখাও
  return [{
    value: map.default,
    label: `${map.zoneName} - ${map.description} (Recommended)`
  }];
};

// Get zone color class
const getZoneColorClass = (zoneCode) => {
  return ZONE_COLORS[zoneCode] || ZONE_COLORS['G'];
};

// Format location for display
const formatLocationDisplay = (location) => {
  if (!location) return 'Not assigned';
  const parts = location.split('-');
  if (parts.length === 4) {
    return `${parts[0]} • Aisle ${parts[1]} • Rack ${parts[2]} • Bin ${parts[3]}`;
  }
  return location;
};

// Calculate total weight and volume
const calculateTotals = (packages) => {
  if (!packages || packages.length === 0) {
    return { totalWeight: 0, totalVolume: 0, totalItems: 0 };
  }
  
  return packages.reduce((acc, pkg) => ({
    totalWeight: acc.totalWeight + (pkg.weight * pkg.quantity),
    totalVolume: acc.totalVolume + (pkg.volume * pkg.quantity),
    totalItems: acc.totalItems + pkg.quantity
  }), { totalWeight: 0, totalVolume: 0, totalItems: 0 });
};

// ==================== MAIN COMPONENT ====================
export default function ExpectedShipmentsPage() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedZone, setSelectedZone] = useState('all');
  
  // Receive modal state
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Form states
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [condition, setCondition] = useState('Good');
  const [selectedPackages, setSelectedPackages] = useState([]);

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    setLoading(true);
    const result = await getExpectedShipments();
    if (result.success) {
      setShipments(result.data);
    }
    setLoading(false);
  };

  const handleReceiveClick = (shipment) => {
    setSelectedShipment(shipment);
    
    // Auto-suggest location based on package types (Good condition initially)
    const suggested = getSuggestedStorage(shipment, 'Good');
    setLocation(suggested.location);
    
    // Select all packages by default
    setSelectedPackages(shipment.packages?.map((_, idx) => idx) || []);
    
    // Reset other form fields
    setNotes('');
    setCondition('Good');
    setShowReceiveModal(true);
  };

  // Update location when condition changes
  useEffect(() => {
    if (selectedShipment) {
      const suggested = getSuggestedStorage(selectedShipment, condition);
      setLocation(suggested.location);
    }
  }, [condition, selectedShipment]);

// app/warehouse/expected/page.jsx - handleReceiveSubmit ফাংশন

const handleReceiveSubmit = async (e) => {
  e.preventDefault();
  
  if (!location.trim()) {
    toast.error('Please enter storage location');
    return;
  }
  
  if (selectedPackages.length === 0) {
    toast.error('Please select at least one package to receive');
    return;
  }
  
  setSubmitting(true);
  
  // Prepare data
  const receiveData = {
    location: location,
    notes: notes,
    packages: selectedPackages.map(idx => ({
      ...selectedShipment.packages[idx],
      received: true,
      receivedAt: new Date(),
      condition: condition
    })),
    condition: condition,
    receivedBy: 'warehouse_staff',
    receivedAt: new Date()
  };
  
  const result = await receiveShipment(selectedShipment._id, receiveData);
  
  // 🟢 সব কন্ডিশনে UI থেকে সরিয়ে ফেলুন (optimistic update)
  setShipments(prev => prev.filter(s => s._id !== selectedShipment._id));
  setShowReceiveModal(false);
  
  // Toast message based on result
  if (result.success) {
    if (condition === 'Damaged' || condition === 'Partial') {
      toast.warning(`⚠️ Shipment moved to DAMAGE ZONE for inspection`);
    } else {
      toast.success(`Shipment received successfully at ${formatLocationDisplay(location)}`);
    }
  } else {
    if (result.alreadyReceived) {
      toast.info('This shipment was already received');
    } else if (result.statusCode === 404) {
      toast.error('Shipment not found');
    } else if (result.statusCode === 500) {
      toast.error('Server error. Please try again.');
    } else if (result.isNetworkError) {
      toast.error('Network error. Please check your connection.');
    } else {
      toast.error(result.message || 'Failed to receive shipment');
    }
  }
  
  setSubmitting(false);
};

  const togglePackage = (index) => {
    setSelectedPackages(prev => 
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const selectAllPackages = () => {
    if (selectedShipment) {
      setSelectedPackages(selectedShipment.packages?.map((_, idx) => idx) || []);
    }
  };

  const clearAllPackages = () => {
    setSelectedPackages([]);
  };

  const filteredShipments = shipments.filter(s => {
    const matchesSearch = 
      s.trackingNumber?.toLowerCase().includes(search.toLowerCase()) ||
      s.shipmentNumber?.toLowerCase().includes(search.toLowerCase()) ||
      s.customerId?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      s.customerId?.lastName?.toLowerCase().includes(search.toLowerCase());
    
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Warehouse className="h-6 w-6 mr-2 text-[#E67E22]" />
                Expected Shipments
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {filteredShipments.length} shipment(s) waiting to be received
              </p>
            </div>
            
            {/* Damage Zone Indicator */}
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <div className="flex items-center">
                <AlertOctagon className="h-4 w-4 text-red-600 mr-2" />
                <span className="text-xs text-red-700 font-medium">Damage Zone: DZ-1-1-1</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by tracking, shipment or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E67E22] focus:border-transparent"
            />
          </div>
        </div>

        {/* Shipments List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#E67E22]" />
          </div>
        ) : filteredShipments.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Package className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <h3 className="text-sm font-medium text-gray-900">No expected shipments</h3>
            <p className="text-xs text-gray-500 mt-1">All clear! No shipments waiting to be received.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredShipments.map((shipment) => {
              const packageTypes = getPackageTypes(shipment);
              const suggested = getSuggestedStorage(shipment, 'Good');
              const zoneColor = getZoneColorClass(suggested.zoneCode);
              const totals = calculateTotals(shipment.packages);
              
              return (
                <div
                  key={shipment._id}
                  className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 ${zoneColor.bg} rounded-lg`}>
                        <Package className={`h-5 w-5 ${zoneColor.text}`} />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900">
                            {shipment.trackingNumber}
                          </p>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${zoneColor.bg} ${zoneColor.text}`}>
                            {suggested.zoneCode}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {shipment.shipmentNumber}
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                      Pending
                    </span>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    <div className="flex items-center text-xs text-gray-600">
                      <User className="h-3.5 w-3.5 mr-1 text-gray-400" />
                      {shipment.customerId?.firstName} {shipment.customerId?.lastName}
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <Calendar className="h-3.5 w-3.5 mr-1 text-gray-400" />
                      {formatDate(shipment.createdAt)}
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <MapPin className="h-3.5 w-3.5 mr-1 text-gray-400" />
                      {shipment.shipmentDetails?.origin} → {shipment.shipmentDetails?.destination}
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <Layers className="h-3.5 w-3.5 mr-1 text-gray-400" />
                      {totals.totalItems} items • {totals.totalWeight} kg
                    </div>
                  </div>

                  {/* Package Types */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {shipment.packages?.map((pkg, idx) => {
                      const storage = PACKAGE_STORAGE_MAP[pkg.packagingType] || DEFAULT_STORAGE;
                      const pkgZoneColor = getZoneColorClass(storage.zone);
                      return (
                        <span
                          key={idx}
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${pkgZoneColor.bg} ${pkgZoneColor.text}`}
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {pkg.packagingType} x{pkg.quantity}
                        </span>
                      );
                    })}
                  </div>

                  {/* Suggested Location */}
                  <div className={`p-2 rounded-lg ${zoneColor.bg} bg-opacity-50 flex items-center justify-between`}>
                    <div className="flex items-center text-xs">
                      <Map className={`h-3.5 w-3.5 mr-1.5 ${zoneColor.text}`} />
                      <span className={zoneColor.text}>
                        Suggested: <span className="font-medium">{suggested.zone}</span> • {suggested.location}
                      </span>
                    </div>
                    <button
                      onClick={() => handleReceiveClick(shipment)}
                      className="text-xs bg-[#E67E22] text-white px-4 py-1.5 rounded-lg hover:bg-[#d35400] transition-colors"
                    >
                      Receive Now →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Receive Modal */}
      {showReceiveModal && selectedShipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Receive Shipment</h2>
                <button
                  onClick={() => setShowReceiveModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Shipment Summary */}
              <div className="bg-orange-50 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500 text-xs">Tracking Number:</span>
                    <p className="font-medium">{selectedShipment.trackingNumber}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">Shipment Number:</span>
                    <p className="font-medium">{selectedShipment.shipmentNumber}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">Customer:</span>
                    <p className="font-medium">
                      {selectedShipment.customerId?.firstName} {selectedShipment.customerId?.lastName}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">Origin/Destination:</span>
                    <p className="font-medium">
                      {selectedShipment.shipmentDetails?.origin} → {selectedShipment.shipmentDetails?.destination}
                    </p>
                  </div>
                </div>
              </div>

              {/* Auto-Suggested Location - Updates based on condition */}
              {(() => {
                const suggested = getSuggestedStorage(selectedShipment, condition);
                const zoneColor = getZoneColorClass(suggested.zoneCode);
                return (
                  <div className={`${zoneColor.bg} ${zoneColor.border} border rounded-lg p-4 mb-4`}>
                    <div className="flex items-start">
                      {condition === 'Damaged' || condition === 'Partial' ? (
                        <AlertOctagon className={`h-5 w-5 ${zoneColor.text} mt-0.5 mr-3`} />
                      ) : (
                        <Map className={`h-5 w-5 ${zoneColor.text} mt-0.5 mr-3`} />
                      )}
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${zoneColor.text}`}>
                          {condition === 'Damaged' || condition === 'Partial' 
                            ? '🚨 DAMAGE ZONE - Inspection Required' 
                            : 'Suggested Storage Location'}
                        </p>
                        <p className={`text-xs ${zoneColor.text} mt-1`}>
                          {suggested.description}
                        </p>
                        <div className="mt-2">
                          <span className="text-gray-600 text-xs">Location:</span>
                          <span className={`ml-1 font-medium ${zoneColor.text}`}>{suggested.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Package Selection */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    Select Packages to Receive
                  </label>
                  <div className="space-x-2">
                    <button
                      type="button"
                      onClick={selectAllPackages}
                      className="text-xs text-[#E67E22] hover:text-[#d35400]"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={clearAllPackages}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-2">
                  {selectedShipment.packages?.map((pkg, idx) => {
                    const storage = PACKAGE_STORAGE_MAP[pkg.packagingType] || DEFAULT_STORAGE;
                    const zoneColor = getZoneColorClass(storage.zone);
                    return (
                      <label
                        key={idx}
                        className={`flex items-start p-2 rounded-lg cursor-pointer transition-colors ${
                          selectedPackages.includes(idx) ? zoneColor.bg : 'hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedPackages.includes(idx)}
                          onChange={() => togglePackage(idx)}
                          className="mt-1 h-4 w-4 text-[#E67E22] rounded border-gray-300 focus:ring-[#E67E22]"
                        />
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{pkg.description || 'Package'}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${zoneColor.bg} ${zoneColor.text}`}>
                              {pkg.packagingType}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 mt-1 text-xs text-gray-500">
                            <span>Qty: {pkg.quantity}</span>
                            <span>Wt: {pkg.weight}kg</span>
                            <span>Vol: {pkg.volume}m³</span>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Receive Form */}
              <form onSubmit={handleReceiveSubmit} className="space-y-4">
                {/* Condition - First, because location depends on it */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Package Condition
                  </label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E67E22] focus:border-transparent"
                  >
                    {CONDITION_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  {(condition === 'Damaged' || condition === 'Partial') && (
                    <p className="text-xs text-red-500 mt-1">
                      ⚠️ This package will be sent to DAMAGE ZONE for inspection
                    </p>
                  )}
                </div>

                {/* Location - Shows only 1 suggestion */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Storage Location <span className="text-red-500">*</span>
                  </label>
                  
                  {/* Single Location Display - Not a dropdown, just shows the suggested location */}
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E67E22] focus:border-transparent"
                        readOnly={condition === 'Damaged' || condition === 'Partial'} // Damage zone is readonly
                      />
                      
                      {/* Quick Select - Only if not damaged */}
                      {condition !== 'Damaged' && condition !== 'Partial' && (
                        <button
                          type="button"
                          onClick={() => {
                            const suggested = getSuggestedStorage(selectedShipment, condition);
                            setLocation(suggested.location);
                          }}
                          className="ml-2 px-3 py-2 text-xs bg-gray-100 rounded-lg hover:bg-gray-200 whitespace-nowrap"
                        >
                          Use Suggested
                        </button>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-500">
                      {condition === 'Damaged' || condition === 'Partial' 
                        ? 'Damage Zone - Fixed location for damaged goods'
                        : 'Format: Zone-Aisle-Rack-Bin (e.g., P-1-1-1)'}
                    </p>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Receiving Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder={condition === 'Damaged' || condition === 'Partial' 
                      ? 'Please describe the damage in detail...' 
                      : 'Any special notes about this receipt...'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E67E22] focus:border-transparent"
                  />
                </div>

                {/* Summary */}
                <div className={`${condition === 'Damaged' || condition === 'Partial' ? 'bg-red-50' : 'bg-gray-50'} rounded-lg p-3`}>
                  <p className="text-xs font-medium text-gray-700 mb-2">Receipt Summary</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">Packages:</span>
                      <span className="ml-1 font-medium">{selectedPackages.length} of {selectedShipment.packages?.length}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Location:</span>
                      <span className="ml-1 font-medium">{formatLocationDisplay(location)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Condition:</span>
                      <span className={`ml-1 font-medium ${
                        condition === 'Good' ? 'text-green-600' : 'text-red-600'
                      }`}>{condition}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Date:</span>
                      <span className="ml-1 font-medium">{new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowReceiveModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || selectedPackages.length === 0}
                    className={`flex-1 px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${
                      condition === 'Damaged' || condition === 'Partial'
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-[#E67E22] hover:bg-[#d35400] text-white'
                    }`}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {condition === 'Damaged' || condition === 'Partial'
                          ? 'Send to Damage Zone'
                          : `Receive ${selectedPackages.length} Package(s)`}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}