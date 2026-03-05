'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  getConsolidationQueue,
  removeFromQueue,
  createConsolidation,
  getMainTypeName,
  getSubTypeName,
  formatContainerType,
  estimateContainerType,
  getConsolidationStatusColor,
  getConsolidationStatusDisplayText,
  formatDestination
} from '@/Api/consolidation';
import { formatDate } from '@/Api/booking';
import { toast } from 'react-toastify';
import {
  Loader2, Package, Search, Calendar, MapPin, User,
  ArrowLeft, ChevronRight, Globe, Weight, Box, Layers,
  Ship, Truck, Eye, Trash2, PlusCircle, Filter,
  ChevronDown, ChevronUp, X, CheckCircle, AlertCircle,
  Anchor, Container, FileText, Download, Printer,
  Plus, Minus, Edit, Save, Clock, Hash, Map,
  Info, AlertTriangle, Check, RefreshCw
} from 'lucide-react';

// ==================== CONSTANTS ====================

const QUEUE_STATUS = {
  pending: { 
    label: 'Pending', 
    bg: 'bg-yellow-100', 
    text: 'text-yellow-800',
    border: 'border-yellow-200',
    icon: Clock
  },
  assigned: { 
    label: 'Assigned', 
    bg: 'bg-blue-100', 
    text: 'text-blue-800',
    border: 'border-blue-200',
    icon: CheckCircle
  },
  consolidated: { 
    label: 'Consolidated', 
    bg: 'bg-green-100', 
    text: 'text-green-800',
    border: 'border-green-200',
    icon: Check
  }
};

const CONTAINER_TYPES = [
  { value: '20ft', label: '20ft Standard Container', maxVolume: 28, icon: '📦' },
  { value: '40ft', label: '40ft Standard Container', maxVolume: 58, icon: '📦📦' },
  { value: '40ft HC', label: '40ft High Cube Container', maxVolume: 68, icon: '📦📦⬆️' },
  { value: '45ft', label: '45ft High Cube Container', maxVolume: 78, icon: '📦📦📦' },
  { value: 'LCL', label: 'LCL - Less than Container Load', maxVolume: 999, icon: '📦' }
];

// ==================== HELPER FUNCTIONS ====================

const getStatusInfo = (status) => {
  return QUEUE_STATUS[status] || {
    label: status || 'Unknown',
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-200',
    icon: Clock
  };
};

const formatWeight = (weight) => {
  if (!weight && weight !== 0) return '0 kg';
  return `${Number(weight).toFixed(2)} kg`;
};

const formatVolume = (volume) => {
  if (!volume && volume !== 0) return '0 m³';
  return `${Number(volume).toFixed(2)} m³`;
};

const formatDateTime = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// ==================== COMPONENTS ====================

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color = 'orange', subtitle }) => {
  const colorClasses = {
    orange: 'bg-orange-50 text-orange-600',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600'
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{title}</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};

// Package Badge Component
const PackageBadge = ({ type, quantity }) => {
  const getIcon = () => {
    const icons = {
      pallet: '📦',
      carton: '📦',
      crate: '📦',
      box: '📦',
      envelope: '✉️',
      container: '📦',
      default: '📦'
    };
    return icons[type?.toLowerCase()] || icons.default;
  };

  return (
    <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
      <span className="mr-1">{getIcon()}</span>
      {type || 'Package'} x{quantity || 1}
    </span>
  );
};

// Group Card Component
const GroupCard = ({ group, onSelectShipments, onRemoveShipment }) => {
  const [expanded, setExpanded] = useState(true);
  const [selectedShipments, setSelectedShipments] = useState({});

  const toggleShipment = (shipmentId) => {
    setSelectedShipments(prev => ({
      ...prev,
      [shipmentId]: !prev[shipmentId]
    }));
  };

  const selectAll = () => {
    const allSelected = {};
    group.shipments.forEach(s => {
      allSelected[s._id] = true;
    });
    setSelectedShipments(allSelected);
    toast.info(`${group.shipments.length} shipments selected`);
  };

  const clearAll = () => {
    setSelectedShipments({});
    toast.info('Selection cleared');
  };

  const getSelectedCount = () => Object.values(selectedShipments).filter(Boolean).length;
  
  const getSelectedWeight = () => {
    return group.shipments
      .filter(s => selectedShipments[s._id])
      .reduce((sum, s) => sum + (s.totalWeight || 0), 0);
  };

  const getSelectedVolume = () => {
    return group.shipments
      .filter(s => selectedShipments[s._id])
      .reduce((sum, s) => sum + (s.totalVolume || 0), 0);
  };

  const selectedCount = getSelectedCount();
  const selectedWeight = getSelectedWeight();
  const selectedVolume = getSelectedVolume();
  const suggestedContainer = estimateContainerType(selectedVolume || group.totalVolume);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4 hover:shadow-lg transition-all">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 border-b">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 hover:bg-orange-200 rounded-lg transition-colors"
            >
              {expanded ? 
                <ChevronUp className="h-5 w-5 text-orange-600" /> : 
                <ChevronDown className="h-5 w-5 text-orange-600" />
              }
            </button>
            
            <div className="flex-1">
              {/* Group Title */}
              <div className="flex items-center flex-wrap gap-2">
                <Globe className="h-5 w-5 text-orange-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  {getMainTypeName(group.mainType)} - {getSubTypeName(group.subType)}
                </h2>
                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">
                  {group.count} Shipments
                </span>
              </div>

              {/* Route */}
              <div className="flex items-center space-x-2 mt-1">
                <MapPin className="h-3 w-3 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {group.origin} → {group.destination}
                </span>
                {group.destinationCountry && (
                  <span className="text-xs text-gray-400">
                    ({group.destinationCountry})
                  </span>
                )}
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-4 mt-2 text-sm">
                <div className="flex items-center text-gray-600">
                  <Package className="h-4 w-4 mr-1" />
                  <span>{group.totalPackages} packages</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Weight className="h-4 w-4 mr-1" />
                  <span>{formatWeight(group.totalWeight)}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Box className="h-4 w-4 mr-1" />
                  <span>{formatVolume(group.totalVolume)}</span>
                </div>
                <div className="flex items-center bg-orange-100 px-2 py-0.5 rounded-full">
                  <Container className="h-4 w-4 mr-1 text-orange-600" />
                  <span className="text-orange-700 text-xs font-medium">
                    Suggested: {formatContainerType(suggestedContainer)}
                  </span>
                </div>
              </div>

              {/* Selected Stats */}
              {selectedCount > 0 && (
                <div className="mt-2 p-2 bg-blue-50 rounded-lg flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-blue-700 font-medium">
                      {selectedCount} selected
                    </span>
                    <span className="text-blue-600">{formatWeight(selectedWeight)}</span>
                    <span className="text-blue-600">{formatVolume(selectedVolume)}</span>
                  </div>
                  <button
                    onClick={clearAll}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={selectAll}
              className="px-3 py-1.5 text-xs bg-white border rounded-lg hover:bg-gray-50 transition-colors flex items-center"
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Select All
            </button>
            <button
              onClick={() => onSelectShipments(group, selectedShipments)}
              disabled={selectedCount === 0}
              className={`px-4 py-1.5 rounded-lg flex items-center text-sm transition-colors ${
                selectedCount > 0
                  ? 'bg-[#E67E22] text-white hover:bg-[#d35400]'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Ship className="h-4 w-4 mr-1" />
              Consolidate ({selectedCount})
            </button>
          </div>
        </div>
      </div>

      {/* Shipments List */}
      {expanded && (
        <div className="divide-y max-h-96 overflow-y-auto">
          {group.shipments.map((item) => {
            const statusInfo = getStatusInfo(item.status);
            const StatusIcon = statusInfo.icon;
            const shipment = item.shipmentId || {};
            const customer = item.customerId || {};

            return (
              <div key={item._id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedShipments[item._id] || false}
                    onChange={() => toggleShipment(item._id)}
                    className="mt-1 h-4 w-4 text-[#E67E22] rounded border-gray-300 focus:ring-[#E67E22]"
                  />

                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">
                          {shipment.trackingNumber || item.trackingNumber}
                        </span>
                        <span className={`px-2 py-0.5 text-xs rounded-full flex items-center ${statusInfo.bg} ${statusInfo.text}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusInfo.label}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDateTime(item.addedAt)}
                      </span>
                    </div>

                    {/* Customer */}
                    <p className="text-xs text-gray-500 mt-1">
                      Customer: {customer.companyName || 
                        `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'N/A'}
                      {item.addedBy && (
                        <> • Added by: {item.addedBy.firstName} {item.addedBy.lastName}</>
                      )}
                    </p>

                    {/* Package Details */}
                    <div className="grid grid-cols-4 gap-4 mt-2 text-xs">
                      <div className="flex items-center text-gray-600">
                        <Package className="h-3 w-3 mr-1" />
                        {item.totalPackages || 0} pkgs
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Weight className="h-3 w-3 mr-1" />
                        {formatWeight(item.totalWeight)}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Box className="h-3 w-3 mr-1" />
                        {formatVolume(item.totalVolume)}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Layers className="h-3 w-3 mr-1" />
                        {shipment.packages?.length || 0} types
                      </div>
                    </div>

                    {/* Package Types */}
                    {shipment.packages && shipment.packages.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {shipment.packages.slice(0, 3).map((pkg, idx) => (
                          <PackageBadge
                            key={idx}
                            type={pkg.packagingType}
                            quantity={pkg.quantity}
                          />
                        ))}
                        {shipment.packages.length > 3 && (
                          <span className="text-xs text-gray-400">
                            +{shipment.packages.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Route */}
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                      <span className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {item.origin} → {item.destination}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => window.open(`/shipments/${shipment._id}`, '_blank')}
                      className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                      title="View shipment"
                    >
                      <Eye className="h-4 w-4 text-gray-400" />
                    </button>
                    <button
                      onClick={() => onRemoveShipment(item._id)}
                      className="p-1 hover:bg-red-100 rounded-lg transition-colors"
                      title="Remove from queue"
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Create Consolidation Modal
// Create Consolidation Modal - FIXED VERSION
const CreateConsolidationModal = ({ isOpen, onClose, group, selectedShipments, onCreateSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [autoGenerate, setAutoGenerate] = useState({
    containerNumber: true,
    sealNumber: true
  });
  const [formData, setFormData] = useState({
    groupKey: group?.groupKey || '',
    containerNumber: '',
    containerType: '',
    sealNumber: '',
    estimatedDeparture: ''
  });

  // Auto-generate functions
  const generateContainerNumber = (type) => {
    const prefixes = {
      '20ft': 'MSKU',
      '40ft': 'SCXU',
      '40ft HC': 'HJCU',
      '45ft': 'TGHU',
      'LCL': 'LCL'
    };
    
    const prefix = prefixes[type] || 'CNTR';
    const year = new Date().getFullYear().toString().slice(-2);
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    
    return `${prefix}${year}${month}${random}`;
  };

  const generateSealNumber = () => {
    const year = new Date().getFullYear().toString().slice(-2);
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const day = String(new Date().getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    
    return `${year}${month}${day}${random}`;
  };

  // Auto-generate when container type changes
  useEffect(() => {
    if (formData.containerType && autoGenerate.containerNumber) {
      const generated = generateContainerNumber(formData.containerType);
      setFormData(prev => ({ ...prev, containerNumber: generated }));
    }
  }, [formData.containerType, autoGenerate.containerNumber]);

  // Auto-generate seal number on mount
  useEffect(() => {
    if (autoGenerate.sealNumber && !formData.sealNumber) {
      const generated = generateSealNumber();
      setFormData(prev => ({ ...prev, sealNumber: generated }));
    }
  }, [autoGenerate.sealNumber]);

  // Toggle auto-generate
  const toggleAutoGenerate = (field) => {
    setAutoGenerate(prev => {
      const newState = { ...prev, [field]: !prev[field] };
      
      // If turning off, clear the field
      if (!newState[field]) {
        setFormData(prev => ({ ...prev, [field]: '' }));
      } 
      // If turning on, generate new value
      else {
        if (field === 'containerNumber' && formData.containerType) {
          const generated = generateContainerNumber(formData.containerType);
          setFormData(prev => ({ ...prev, containerNumber: generated }));
        } else if (field === 'sealNumber') {
          const generated = generateSealNumber();
          setFormData(prev => ({ ...prev, sealNumber: generated }));
        }
      }
      
      return newState;
    });
  };

  // Get selected shipments list - FIXED: Extract shipment data correctly
// CreateConsolidationModal এ এই অংশটি replace করুন:

// Get selected shipments list
const selectedShipmentsList = React.useMemo(() => {
  if (!group?.shipments) return [];
  
  return group.shipments
    .filter(item => selectedShipments[item._id])
    .map(item => ({
      queueItemId: item._id, // <- এইটা important! queue item ID
      shipment: item.shipmentId || {},
      trackingNumber: item.trackingNumber || item.shipmentId?.trackingNumber,
      totalPackages: item.totalPackages || item.shipmentId?.totalPackages || 0,
      totalWeight: item.totalWeight || item.shipmentId?.totalWeight || 0,
      totalVolume: item.totalVolume || item.shipmentId?.totalVolume || 0,
      origin: item.origin || item.shipmentId?.origin,
      destination: item.destination || item.shipmentId?.destination
    }));
}, [group, selectedShipments]);

// Calculate totals
const totalVolume = selectedShipmentsList.reduce((sum, s) => sum + (s.totalVolume || 0), 0);
const totalWeight = selectedShipmentsList.reduce((sum, s) => sum + (s.totalWeight || 0), 0);
const totalPackages = selectedShipmentsList.reduce((sum, s) => sum + (s.totalPackages || 1), 0);

// IMPORTANT: Get queue item IDs for API
const selectedQueueItemIds = React.useMemo(() => {
  return selectedShipmentsList
    .map(s => s.queueItemId) // <- queue item ID
    .filter(Boolean);
}, [selectedShipmentsList]);

// handleSubmit এ ব্যবহার করুন:
const handleSubmit = async () => {
  if (step === 1) {
    if (!formData.containerType) {
      toast.warning('Please select container type');
      return;
    }
    setStep(2);
    return;
  }

  console.log('🔍 Queue Item IDs for API:', selectedQueueItemIds);

  if (selectedQueueItemIds.length === 0) {
    toast.error('No valid shipments selected');
    return;
  }

  setLoading(true);
  try {
    const consolidationData = {
      groupKey: group?.groupKey,
      selectedShipmentIds: selectedQueueItemIds, // <- queue item ID পাঠান
      containerNumber: formData.containerNumber,
      containerType: formData.containerType,
      sealNumber: formData.sealNumber,
      estimatedDeparture: formData.estimatedDeparture
    };
    
    console.log('📤 Sending to backend:', consolidationData);
    
    const result = await createConsolidation(consolidationData);
    
    if (result.success) {
      toast.success(`✅ Consolidation created: ${result.data.consolidationNumber || result.data._id}`);
      onCreateSuccess();
      onClose();
    } else {
      toast.error(`❌ ${result.message}`);
      console.error('API Error:', result.error);
    }
  } catch (error) {
    console.error('❌ Submit error:', error);
    toast.error(error.response?.data?.message || 'Failed to create consolidation');
  } finally {
    setLoading(false);
  }
};

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">Create Consolidation</h2>
              <p className="text-sm text-gray-500 mt-1">Step {step} of 2</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex mt-4">
            <div className={`flex-1 h-1 rounded-l ${step >= 1 ? 'bg-[#E67E22]' : 'bg-gray-200'}`} />
            <div className={`flex-1 h-1 rounded-r ${step >= 2 ? 'bg-[#E67E22]' : 'bg-gray-200'}`} />
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {step === 1 ? (
            <div className="space-y-4">
              {/* Summary */}
              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Selected Shipments</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Count</p>
                    <p className="text-lg font-bold">{selectedShipmentsList.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Volume</p>
                    <p className="text-lg font-bold">{formatVolume(totalVolume)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Weight</p>
                    <p className="text-lg font-bold">{formatWeight(totalWeight)}</p>
                  </div>
                </div>
              </div>

              {/* Container Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Container Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.containerType}
                  onChange={(e) => setFormData({ ...formData, containerType: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#E67E22]"
                >
                  <option value="">Select Container Type</option>
                  {CONTAINER_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label} (Max: {type.maxVolume}m³)
                    </option>
                  ))}
                </select>
              </div>

              {/* Container Number with Auto-toggle */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Container Number
                  </label>
                  <button
                    type="button"
                    onClick={() => toggleAutoGenerate('containerNumber')}
                    className={`text-xs px-2 py-1 rounded-full flex items-center ${
                      autoGenerate.containerNumber 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <RefreshCw className={`h-3 w-3 mr-1 ${autoGenerate.containerNumber ? 'animate-spin' : ''}`} />
                    {autoGenerate.containerNumber ? 'Auto' : 'Manual'}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.containerNumber}
                    onChange={(e) => {
                      setFormData({ ...formData, containerNumber: e.target.value });
                      if (autoGenerate.containerNumber) {
                        setAutoGenerate(prev => ({ ...prev, containerNumber: false }));
                      }
                    }}
                    placeholder={autoGenerate.containerNumber ? "Auto-generated..." : "e.g., MSKU1234567"}
                    className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#E67E22] ${
                      autoGenerate.containerNumber ? 'bg-gray-50' : ''
                    }`}
                    readOnly={autoGenerate.containerNumber}
                  />
                  {autoGenerate.containerNumber && (
                    <button
                      onClick={() => {
                        const generated = generateContainerNumber(formData.containerType);
                        setFormData(prev => ({ ...prev, containerNumber: generated }));
                      }}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-[#E67E22] hover:text-[#d35400]"
                      title="Generate new"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {autoGenerate.containerNumber && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ Auto-generating container number based on type
                  </p>
                )}
              </div>

              {/* Seal Number with Auto-toggle */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Seal Number
                  </label>
                  <button
                    type="button"
                    onClick={() => toggleAutoGenerate('sealNumber')}
                    className={`text-xs px-2 py-1 rounded-full flex items-center ${
                      autoGenerate.sealNumber 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <RefreshCw className={`h-3 w-3 mr-1 ${autoGenerate.sealNumber ? 'animate-spin' : ''}`} />
                    {autoGenerate.sealNumber ? 'Auto' : 'Manual'}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.sealNumber}
                    onChange={(e) => {
                      setFormData({ ...formData, sealNumber: e.target.value });
                      if (autoGenerate.sealNumber) {
                        setAutoGenerate(prev => ({ ...prev, sealNumber: false }));
                      }
                    }}
                    placeholder={autoGenerate.sealNumber ? "Auto-generated..." : "e.g., SL123456"}
                    className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#E67E22] ${
                      autoGenerate.sealNumber ? 'bg-gray-50' : ''
                    }`}
                    readOnly={autoGenerate.sealNumber}
                  />
                  {autoGenerate.sealNumber && (
                    <button
                      onClick={() => {
                        const generated = generateSealNumber();
                        setFormData(prev => ({ ...prev, sealNumber: generated }));
                      }}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-[#E67E22] hover:text-[#d35400]"
                      title="Generate new"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {autoGenerate.sealNumber && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ Auto-generating unique seal number
                  </p>
                )}
              </div>

              {/* Estimated Departure */}
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
            </div>
          ) : (
            <div className="space-y-4">
              {/* Review Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-3">Consolidation Summary</h3>
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-gray-500">Container Type</dt>
                    <dd className="font-medium">{formData.containerType}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Container Number</dt>
                    <dd className="font-medium">{formData.containerNumber || 'Auto-generated'}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Total Shipments</dt>
                    <dd className="font-medium">{selectedShipmentsList.length}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Total Packages</dt>
                    <dd className="font-medium">{totalPackages}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Total Weight</dt>
                    <dd className="font-medium">{formatWeight(totalWeight)}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Total Volume</dt>
                    <dd className="font-medium">{formatVolume(totalVolume)}</dd>
                  </div>
                </dl>
              </div>

              {/* Shipments List */}
              <div className="border rounded-lg">
                <div className="p-3 bg-gray-50 border-b">
                  <h3 className="font-medium">Selected Shipments</h3>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {selectedShipmentsList.map((item, idx) => (
                    <div key={idx} className="p-3 border-b last:border-0">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium">{item.trackingNumber || 'N/A'}</p>
                          <p className="text-xs text-gray-500">
                            {item.totalPackages} packages • {formatWeight(item.totalWeight)}
                          </p>
                        </div>
                        <span className="text-xs text-gray-400">
                          {item.origin || '?'} → {item.destination || '?'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t p-6">
          <div className="flex justify-between">
            {step === 2 ? (
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
            <button
              onClick={handleSubmit}
              disabled={loading || (step === 1 && !formData.containerType)}
              className="px-6 py-2 bg-[#E67E22] text-white rounded-lg hover:bg-[#d35400] disabled:bg-gray-300 flex items-center"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : step === 1 ? (
                'Next'
              ) : (
                'Create Consolidation'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Empty State
const EmptyQueue = ({ onRefresh }) => (
  <div className="text-center py-16 bg-white rounded-xl border">
    <div className="bg-orange-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
      <Package className="h-10 w-10 text-[#E67E22]" />
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">No shipments in queue</h3>
    <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
      Complete inspection of received shipments to add them to the consolidation queue.
    </p>
    <div className="flex items-center justify-center space-x-3">
      <Link
        href="/warehouse/inspection"
        className="inline-flex items-center px-4 py-2 bg-[#E67E22] text-white rounded-lg hover:bg-[#d35400]"
      >
        <CheckCircle className="h-4 w-4 mr-2" />
        Go to Inspection
      </Link>
      <button
        onClick={onRefresh}
        className="inline-flex items-center px-4 py-2 border rounded-lg hover:bg-gray-50"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Refresh
      </button>
    </div>
  </div>
);

// ==================== MAIN PAGE ====================

export default function ConsolidationQueuePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [queueData, setQueueData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedShipments, setSelectedShipments] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = async () => {
    setLoading(true);
    try {
      const result = await getConsolidationQueue();
      if (result.success) {
        setQueueData(result.data);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to load queue');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadQueue();
    setRefreshing(false);
    toast.success('Queue refreshed');
  };

  const handleSelectShipments = (group, selections) => {
    const hasSelections = Object.values(selections).some(Boolean);
    if (!hasSelections) {
      toast.warning('Please select at least one shipment');
      return;
    }
    setSelectedGroup(group);
    setSelectedShipments(selections);
    setShowCreateModal(true);
  };

  const handleRemoveFromQueue = async (queueId) => {
    if (!confirm('Remove this shipment from queue?')) return;
    
    try {
      const result = await removeFromQueue(queueId);
      if (result.success) {
        toast.success('Shipment removed from queue');
        loadQueue();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to remove shipment');
    }
  };

  const handleCreateSuccess = () => {
    loadQueue();
  };

  // Filter groups
  const groups = queueData?.groups || [];
  
  const filteredGroups = searchTerm
    ? groups.filter(group => 
        group.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.destination?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : groups;

  // Calculate stats
  const totalShipments = queueData?.totalItems || 0;
  const totalGroups = queueData?.totalGroups || 0;
  const totalVolume = groups.reduce((sum, g) => sum + (g.totalVolume || 0), 0);
  const totalWeight = groups.reduce((sum, g) => sum + (g.totalWeight || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Link href="/warehouse" className="p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Package className="h-6 w-6 mr-2 text-[#E67E22]" />
                  Consolidation Queue
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Shipments grouped by type and destination
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <RefreshCw className={`h-5 w-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <Link
                href="/warehouse/consolidations"
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm flex items-center"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Consolidations
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatCard title="Total Shipments" value={totalShipments} icon={Package} color="blue" />
            <StatCard title="Destination Groups" value={totalGroups} icon={Globe} color="green" />
            <StatCard title="Total Volume" value={formatVolume(totalVolume)} icon={Box} color="orange" />
            <StatCard title="Total Weight" value={formatWeight(totalWeight)} icon={Weight} color="purple" />
          </div>

          {/* Search */}
          <div className="bg-white rounded-xl border p-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by destination..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#E67E22]"
              />
            </div>
          </div>
        </div>

        {/* Queue Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border">
            <Loader2 className="h-10 w-10 animate-spin text-[#E67E22] mb-4" />
            <p className="text-sm text-gray-500">Loading consolidation queue...</p>
          </div>
        ) : filteredGroups.length === 0 ? (
          <EmptyQueue onRefresh={handleRefresh} />
        ) : (
          <div className="space-y-4">
            {filteredGroups.map((group) => (
              <GroupCard
                key={group.groupKey}
                group={group}
                onSelectShipments={handleSelectShipments}
                onRemoveShipment={handleRemoveFromQueue}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <CreateConsolidationModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setSelectedGroup(null);
          setSelectedShipments({});
        }}
        group={selectedGroup}
        selectedShipments={selectedShipments}
        onCreateSuccess={handleCreateSuccess}
      />
    </div>
  );
}