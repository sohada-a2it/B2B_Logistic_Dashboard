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
  estimateContainerType
} from '@/Api/consolidation';
import { toast } from 'react-toastify';
import {
  Loader2, Package, Search, Calendar, MapPin, User,
  ArrowLeft, ChevronRight, Globe, Weight, Box, Layers,
  Ship, Truck, Eye, Trash2, PlusCircle, Filter,
  ChevronDown, ChevronUp, X, CheckCircle, AlertCircle,
  Anchor, Container, FileText, Download, Printer,
  Plus, Minus, Edit, Save, Clock, Hash, Map,
  Info, AlertTriangle, Check, RefreshCw, Phone, Mail,
  Home, Building2, Tag, PackageCheck, PackageOpen,
  Ruler, Scale, Palette, HashIcon, CalendarDays
  // Removed Cube as it doesn't exist
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

const PACKAGING_TYPES = {
  box: { label: 'Box', icon: '📦', color: 'blue' },
  carton: { label: 'Carton', icon: '📦', color: 'green' },
  pallet: { label: 'Pallet', icon: '⚓', color: 'orange' },
  crate: { label: 'Crate', icon: '🔲', color: 'brown' },
  drum: { label: 'Drum', icon: '🛢️', color: 'red' },
  bag: { label: 'Bag', icon: '👜', color: 'purple' },
  envelope: { label: 'Envelope', icon: '✉️', color: 'gray' },
  roll: { label: 'Roll', icon: '🧻', color: 'teal' },
  bundle: { label: 'Bundle', icon: '🎁', color: 'pink' },
  other: { label: 'Other', icon: '📦', color: 'gray' }
};

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

const formatDateOnly = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const getPackagingInfo = (type) => {
  return PACKAGING_TYPES[type?.toLowerCase()] || PACKAGING_TYPES.other;
};

const formatDimensions = (dimensions) => {
  if (!dimensions) return 'N/A';
  const { length, width, height, unit = 'cm' } = dimensions;
  if (!length && !width && !height) return 'N/A';
  return `${length || 0} × ${width || 0} × ${height || 0} ${unit}`;
};

const formatAddress = (address) => {
  if (!address) return 'N/A';
  if (typeof address === 'string') return address;
  
  const parts = [];
  if (address.street) parts.push(address.street);
  if (address.city) parts.push(address.city);
  if (address.state) parts.push(address.state);
  if (address.postalCode) parts.push(address.postalCode);
  if (address.country) parts.push(address.country);
  
  return parts.join(', ') || 'N/A';
};

const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

// ==================== COMPONENTS ====================

// Debug Component to show raw data (temporary)
const DebugInfo = ({ data, label }) => {
  const [show, setShow] = useState(false);
  
  if (!data) return null;
  
  return (
    <div className="text-xs border border-gray-200 rounded p-1 mt-1">
      <button 
        onClick={() => setShow(!show)}
        className="text-blue-500 flex items-center hover:text-blue-700"
      >
        <Info className="h-3 w-3 mr-1" />
        {label} Debug {show ? '▲' : '▼'}
      </button>
      {show && (
        <pre className="mt-1 p-1 bg-gray-100 overflow-auto max-h-40 text-[10px]">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
};

// Enhanced Package Card - Fixed: Replaced Cube with Box
const PackageCard = ({ pkg, index }) => {
  if (!pkg) return null;
  
  const packagingInfo = getPackagingInfo(pkg.packagingType);
  
  return (
    <div className="border rounded p-3 mb-2 bg-gray-50 hover:bg-gray-100 transition">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <span className="text-xl mr-2">{packagingInfo.icon}</span>
          <span className="font-medium">Package #{index + 1}</span>
        </div>
        <span className={`text-xs px-2 py-1 bg-${packagingInfo.color}-100 text-${packagingInfo.color}-800 rounded-full`}>
          {packagingInfo.label}
        </span>
      </div>
      
      <div className="grid grid-cols-3 gap-2 text-sm">
        <div className="flex items-center">
          <Hash className="h-3.5 w-3.5 mr-1 text-gray-500" />
          <span>Qty: <span className="font-medium">{pkg.quantity || 1}</span></span>
        </div>
        <div className="flex items-center">
          <Scale className="h-3.5 w-3.5 mr-1 text-gray-500" />
          <span>Weight: <span className="font-medium">{pkg.weight || 0} kg</span></span>
        </div>
        <div className="flex items-center">
          <Box className="h-3.5 w-3.5 mr-1 text-gray-500" /> {/* Changed from Cube to Box */}
          <span>Volume: <span className="font-medium">{pkg.volume || 0} m³</span></span>
        </div>
      </div>
      
      {pkg.dimensions && (pkg.dimensions.length || pkg.dimensions.width || pkg.dimensions.height) && (
        <div className="text-xs mt-2 text-gray-600 flex items-center">
          <Ruler className="h-3.5 w-3.5 mr-1" />
          Dimensions: {formatDimensions(pkg.dimensions)}
        </div>
      )}
      
      {pkg.description && (
        <div className="text-xs mt-2 text-gray-600 bg-white p-2 rounded">
          <span className="font-medium">Description:</span> {pkg.description}
        </div>
      )}
    </div>
  );
};

// Enhanced Sender Info Component
const SenderInfo = ({ customer }) => {
  if (!customer) return (
    <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
      <div className="flex items-center text-orange-800">
        <User className="h-4 w-4 mr-2" />
        <span className="font-medium">No sender information available</span>
      </div>
    </div>
  );
  
  // Log customer data for debugging
  console.log('📧 Sender Data:', customer);
  
  const companyName = customer.companyName || customer.name || customer.contactName || 'Unknown Company';
  const email = customer.email || customer.contactEmail || '';
  const phone = customer.phone || customer.contactPhone || customer.mobile || '';
  const address = customer.address || customer.location || {};
  
  return (
    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
      <div className="flex items-center mb-3">
        <Building2 className="h-5 w-5 text-orange-600 mr-2" />
        <span className="font-bold text-gray-900 text-lg">{companyName}</span>
      </div>
      
      <div className="space-y-2 ml-2">
        {email && (
          <div className="flex items-center text-sm">
            <Mail className="h-4 w-4 mr-2 text-gray-500" />
            <span className="text-gray-700">{email}</span>
          </div>
        )}
        {phone && (
          <div className="flex items-center text-sm">
            <Phone className="h-4 w-4 mr-2 text-gray-500" />
            <span className="text-gray-700">{phone}</span>
          </div>
        )}
        {address && typeof address === 'object' && Object.keys(address).length > 0 && (
          <div className="flex items-start text-sm">
            <MapPin className="h-4 w-4 mr-2 mt-0.5 text-gray-500" />
            <span className="text-gray-700">{formatAddress(address)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Enhanced Receiver Info Component
const ReceiverInfo = ({ receiver }) => {
  if (!receiver || Object.keys(receiver).length === 0) return null;
  
  return (
    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
      <div className="flex items-center mb-2">
        <User className="h-4 w-4 text-blue-600 mr-2" />
        <span className="font-medium text-blue-800">Receiver Details</span>
      </div>
      
      <div className="space-y-1 ml-2 text-sm">
        {receiver.name && (
          <div className="flex items-center">
            <span className="font-medium text-gray-600">Name:</span>
            <span className="ml-2">{receiver.name}</span>
          </div>
        )}
        {receiver.email && (
          <div className="flex items-center">
            <Mail className="h-3.5 w-3.5 mr-1 text-gray-500" />
            <span>{receiver.email}</span>
          </div>
        )}
        {receiver.phone && (
          <div className="flex items-center">
            <Phone className="h-3.5 w-3.5 mr-1 text-gray-500" />
            <span>{receiver.phone}</span>
          </div>
        )}
        {receiver.address && (
          <div className="flex items-start">
            <MapPin className="h-3.5 w-3.5 mr-1 mt-0.5 text-gray-500" />
            <span>{formatAddress(receiver.address)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Enhanced Shipment Card - Fixed: Replaced Cube with Box
const ShipmentCard = ({ item }) => {
  if (!item) return null;
  
  console.log('🚀 Full Shipment Item:', item);
  
  // Comprehensive data extraction
  const shipmentId = item.shipmentId || item.shipment || {};
  
  // Extract customer/sender info from ALL possible locations
  const customer = 
    item.customerId || 
    item.customer || 
    shipmentId.customer || 
    shipmentId.customerId || 
    item.sender || 
    shipmentId.sender || 
    {};
  
  // Extract receiver info
  const receiver = 
    item.receiverDetails || 
    shipmentId.receiverDetails || 
    item.receiver || 
    shipmentId.receiver || 
    {};
  
  // Extract packages
  const packages = item.packages || shipmentId.packages || [];
  const packagesArray = Array.isArray(packages) ? packages : [];
  
  // Tracking number
  const trackingNumber = item.trackingNumber || shipmentId.trackingNumber || 'N/A';
  
  // Status
  const statusInfo = getStatusInfo(item.status || shipmentId.status);
  const StatusIcon = statusInfo.icon;
  
  // Route information
  const origin = item.origin || shipmentId.origin || 'N/A';
  const destination = item.destination || shipmentId.destination || 'N/A';
  
  // Totals
  const totalPackages = item.totalPackages || shipmentId.totalPackages || packagesArray.length || 0;
  const totalWeight = item.totalWeight || shipmentId.totalWeight || packagesArray.reduce((sum, p) => sum + (p.weight || 0), 0);
  const totalVolume = item.totalVolume || shipmentId.totalVolume || packagesArray.reduce((sum, p) => sum + (p.volume || 0), 0);
  
  return (
    <div className="bg-white border rounded-lg p-4 mb-3 shadow-sm hover:shadow-md transition">
      {/* Header with Tracking Number */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="bg-orange-100 px-3 py-1 rounded-lg">
          <span className="font-mono font-bold text-orange-800">#{trackingNumber}</span>
        </div>
        <span className={`px-2 py-1 text-xs rounded-full inline-flex items-center ${statusInfo.bg} ${statusInfo.text}`}>
          <StatusIcon className="h-3 w-3 mr-1" />
          {statusInfo.label}
        </span>
      </div>
      
      {/* Sender Information - Highlighted as in the image */}
      <div className="mb-4">
        <SenderInfo customer={customer} />
      </div>
      
      {/* Shipment Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 bg-gray-50 p-3 rounded-lg">
        <div className="flex items-center">
          <Package className="h-4 w-4 mr-2 text-gray-500" />
          <div>
            <div className="text-xs text-gray-500">Packages</div>
            <div className="font-medium">{totalPackages}</div>
          </div>
        </div>
        <div className="flex items-center">
          <Scale className="h-4 w-4 mr-2 text-gray-500" />
          <div>
            <div className="text-xs text-gray-500">Weight</div>
            <div className="font-medium">{formatWeight(totalWeight)}</div>
          </div>
        </div>
        <div className="flex items-center">
          <Box className="h-4 w-4 mr-2 text-gray-500" /> {/* Changed from Cube to Box */}
          <div>
            <div className="text-xs text-gray-500">Volume</div>
            <div className="font-medium">{formatVolume(totalVolume)}</div>
          </div>
        </div>
        <div className="flex items-center">
          <CalendarDays className="h-4 w-4 mr-2 text-gray-500" />
          <div>
            <div className="text-xs text-gray-500">Added</div>
            <div className="font-medium">{formatDateOnly(item.addedAt || item.createdAt)}</div>
          </div>
        </div>
      </div>
      
      {/* Route */}
      <div className="flex items-center text-sm bg-blue-50 p-2 rounded-lg mb-3">
        <MapPin className="h-4 w-4 mr-2 text-blue-500" />
        <span className="font-medium">Route:</span>
        <span className="ml-2">{origin}</span>
        <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />
        <span>{destination}</span>
      </div>
      
      {/* Receiver Information */}
      <ReceiverInfo receiver={receiver} />
      
      {/* Packages List */}
      {packagesArray.length > 0 && (
        <div className="mt-3">
          <div className="font-medium text-sm mb-2 flex items-center">
            <Package className="h-4 w-4 mr-1 text-gray-600" />
            Packages ({packagesArray.length})
          </div>
          <div className="space-y-2 max-h-60 overflow-auto pr-1">
            {packagesArray.map((pkg, idx) => (
              <PackageCard key={idx} pkg={pkg} index={idx} />
            ))}
          </div>
        </div>
      )}
      
      {/* Debug Info - Remove in production */}
      {/* <DebugInfo data={item} label="Raw Data" /> */}
    </div>
  );
};

// Group Card Component
const GroupCard = ({ group, onSelectShipments, onRemoveShipment }) => {
  const [expanded, setExpanded] = useState(true);
  const [selected, setSelected] = useState({});
  
  if (!group) return null;
  
  console.log('📦 Group Data:', group);
  
  const shipments = Array.isArray(group.shipments) ? group.shipments : [];
  
  const toggleSelect = (id) => {
    if (!id) return;
    setSelected(prev => ({ ...prev, [id]: !prev[id] }));
  };
  
  const selectAll = () => {
    const all = {};
    shipments.forEach(s => { 
      if (s?._id) all[s._id] = true; 
    });
    setSelected(all);
  };
  
  const clearAll = () => setSelected({});
  
  const selectedCount = Object.values(selected).filter(Boolean).length;
  
  return (
    <div className="border rounded-xl overflow-hidden mb-4 bg-white">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 border-b">
        <div className="flex justify-between items-start">
          <div className="flex items-start space-x-2 flex-1">
            <button 
              onClick={() => setExpanded(!expanded)} 
              className="p-1 hover:bg-orange-100 rounded"
            >
              {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
            <div className="flex-1">
              <h2 className="font-semibold text-lg">
                {getMainTypeName(group.mainType)} - {getSubTypeName(group.subType)}
              </h2>
              <p className="text-sm text-gray-600 flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                {group.origin} → {group.destination}
              </p>
              <div className="flex gap-4 mt-2 text-sm">
                <span className="flex items-center">
                  <Package className="h-4 w-4 mr-1 text-gray-500" />
                  {group.totalPackages || 0} packages
                </span>
                <span className="flex items-center">
                  <Scale className="h-4 w-4 mr-1 text-gray-500" />
                  {formatWeight(group.totalWeight)}
                </span>
                <span className="flex items-center">
                  <Box className="h-4 w-4 mr-1 text-gray-500" /> {/* Changed from Cube to Box */}
                  {formatVolume(group.totalVolume)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={selectAll} 
              className="text-xs px-3 py-1 border rounded hover:bg-white"
            >
              Select All
            </button>
            <button 
              onClick={() => onSelectShipments(group, selected)}
              disabled={selectedCount === 0}
              className={`px-4 py-1 rounded text-sm transition ${
                selectedCount > 0 
                  ? 'bg-orange-500 text-white hover:bg-orange-600' 
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              Consolidate ({selectedCount})
            </button>
          </div>
        </div>
        
        {selectedCount > 0 && (
          <div className="mt-2 p-2 bg-blue-50 rounded flex justify-between items-center">
            <span className="text-sm font-medium">{selectedCount} shipment(s) selected</span>
            <button onClick={clearAll} className="text-blue-600 text-xs hover:underline">
              Clear Selection
            </button>
          </div>
        )}
      </div>
      
      {/* Shipments */}
      {expanded && (
        <div className="divide-y max-h-[600px] overflow-auto">
          {shipments.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Package className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>No shipments in this group</p>
            </div>
          ) : (
            shipments.map((item) => (
              <div key={item?._id || Math.random()} className="relative p-4 hover:bg-gray-50">
                <div className="absolute left-4 top-6">
                  <input
                    type="checkbox"
                    checked={selected[item?._id] || false}
                    onChange={() => item?._id && toggleSelect(item._id)}
                    className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                  />
                </div>
                <div className="pl-8">
                  <ShipmentCard item={item} />
                </div>
                <button
                  onClick={() => onRemoveShipment(item?._id)}
                  className="absolute right-4 top-6 text-red-400 hover:text-red-600 transition"
                  title="Remove from queue"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white p-4 rounded-xl border hover:shadow-md transition">
    <div className="flex justify-between items-center">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-xl font-bold mt-1">{value}</p>
      </div>
      <div className={`p-3 rounded-lg bg-${color}-50 text-${color}-600`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  </div>
);

// Empty State Component
const EmptyQueue = ({ onRefresh }) => (
  <div className="text-center py-16 bg-white rounded-xl border">
    <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
    <h3 className="text-lg font-medium mb-2">No shipments in queue</h3>
    <p className="text-sm text-gray-500 mb-6">Complete inspection to add shipments to the consolidation queue</p>
    <div className="flex justify-center gap-3">
      <Link 
        href="/warehouse/inspection" 
        className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
      >
        Go to Inspection
      </Link>
      <button 
        onClick={onRefresh} 
        className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition"
      >
        Refresh
      </button>
    </div>
  </div>
);

// Create Consolidation Modal
const CreateConsolidationModal = ({ group, selectedShipments, onClose, onCreate }) => {
  const [containerType, setContainerType] = useState('');
  const [loading, setLoading] = useState(false);
  
  const selectedCount = Object.values(selectedShipments).filter(Boolean).length;
  const selectedIds = Object.keys(selectedShipments).filter(id => selectedShipments[id]);
  
  const handleCreate = async () => {
    if (!containerType) {
      toast.warning('Please select container type');
      return;
    }
    
    setLoading(true);
    try {
      const result = await createConsolidation({
        groupKey: group.groupKey,
        shipmentIds: selectedIds,
        containerType
      });
      
      if (result.success) {
        toast.success('Consolidation created successfully');
        onClose(true);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to create consolidation');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">Create Consolidation</h2>
        
        <div className="mb-4 p-3 bg-orange-50 rounded-lg">
          <p className="text-sm">
            <span className="font-medium">Selected:</span> {selectedCount} shipment(s)
          </p>
          <p className="text-sm">
            <span className="font-medium">Route:</span> {group.origin} → {group.destination}
          </p>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Container Type <span className="text-red-500">*</span>
          </label>
          <select
            value={containerType}
            onChange={(e) => setContainerType(e.target.value)}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Select container type</option>
            {CONTAINER_TYPES.map(type => (
              <option key={type.value} value={type.value}>
                {type.icon} {type.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex justify-end gap-2">
          <button
            onClick={() => onClose(false)}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={loading || !containerType}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Create Consolidation
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== MAIN PAGE ====================

export default function ConsolidationQueuePage() {
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
      console.log('📡 Loading queue...');
      const result = await getConsolidationQueue();
      console.log('📊 Queue API Response:', result);
      
      if (result.success) {
        setQueueData(result.data);
        console.log('✅ Queue Data:', result.data);
      } else {
        toast.error(result.message || 'Failed to load queue');
      }
    } catch (error) {
      console.error('❌ Load error:', error);
      toast.error('Failed to load queue');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadQueue();
    setRefreshing(false);
  };

  const handleSelectShipments = (group, selections) => {
    const count = Object.values(selections).filter(Boolean).length;
    if (count === 0) {
      toast.warning('Please select at least one shipment');
      return;
    }
    setSelectedGroup(group);
    setSelectedShipments(selections);
    setShowCreateModal(true);
  };

  const handleCreateConsolidation = async (refresh) => {
    setShowCreateModal(false);
    if (refresh) {
      await loadQueue();
    }
  };

  const handleRemoveFromQueue = async (id) => {
    if (!id) return;
    
    if (!confirm('Are you sure you want to remove this shipment from the queue?')) {
      return;
    }
    
    try {
      const result = await removeFromQueue(id);
      if (result.success) {
        toast.success('Shipment removed from queue');
        loadQueue();
      } else {
        toast.error(result.message || 'Failed to remove');
      }
    } catch (error) {
      console.error('Remove error:', error);
      toast.error('Failed to remove shipment');
    }
  };

  // Safe data extraction
  const groups = queueData?.groups || [];
  const safeGroups = Array.isArray(groups) ? groups : [];
  
  const filteredGroups = searchTerm
    ? safeGroups.filter(g => 
        g?.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g?.origin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g?.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : safeGroups;

  // Stats
  const totalShipments = queueData?.totalItems || 0;
  const totalGroups = queueData?.totalGroups || 0;
  const totalVolume = safeGroups.reduce((sum, g) => sum + (g?.totalVolume || 0), 0);
  const totalWeight = safeGroups.reduce((sum, g) => sum + (g?.totalWeight || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div className="flex items-center gap-3">
              <Link 
                href="/warehouse" 
                className="p-2 hover:bg-gray-200 rounded-lg transition"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-2xl font-bold flex items-center">
                <Package className="h-6 w-6 mr-2 text-orange-500" />
                Consolidation Queue
              </h1>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handleRefresh} 
                className="p-2 hover:bg-gray-200 rounded-lg transition"
                title="Refresh"
              >
                <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <Link 
                href="/warehouse/consolidations" 
                className="px-4 py-2 border rounded-lg flex items-center hover:bg-gray-50 transition"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Consolidations
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <StatCard title="Total Shipments" value={totalShipments} icon={Package} color="blue" />
            <StatCard title="Groups" value={totalGroups} icon={Layers} color="green" />
            <StatCard title="Total Volume" value={formatVolume(totalVolume)} icon={Box} color="orange" /> {/* Changed from Cube to Box */}
            <StatCard title="Total Weight" value={formatWeight(totalWeight)} icon={Scale} color="purple" />
          </div>

          {/* Search Bar */}
          <div className="bg-white p-4 rounded-xl border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by origin, destination, or group name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl">
            <Loader2 className="h-12 w-12 animate-spin text-orange-500 mb-4" />
            <p className="text-gray-600">Loading queue...</p>
          </div>
        ) : filteredGroups.length === 0 ? (
          <EmptyQueue onRefresh={handleRefresh} />
        ) : (
          <div className="space-y-4">
            {filteredGroups.map((group) => (
              <GroupCard
                key={group?.groupKey || Math.random()}
                group={group}
                onSelectShipments={handleSelectShipments}
                onRemoveShipment={handleRemoveFromQueue}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Consolidation Modal */}
      {showCreateModal && selectedGroup && (
        <CreateConsolidationModal
          group={selectedGroup}
          selectedShipments={selectedShipments}
          onClose={handleCreateConsolidation}
          onCreate={() => {}}
        />
      )}
    </div>
  );
}