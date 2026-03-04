'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  getConsolidationQueue,
  removeFromQueue,
  formatDestination,
  estimateContainerType,
  formatContainerType
} from '@/Api/consolidation';
import { formatDate } from '@/Api/booking';
import { 
  Loader2, Package, Search, Calendar, MapPin, User,
  ArrowLeft, ChevronRight, Globe, Weight, Box, Layers,
  Ship, Truck, Eye, Trash2, PlusCircle, Filter,
  ChevronDown, ChevronUp, X, CheckCircle, AlertCircle
} from 'lucide-react';
import { toast } from 'react-toastify';

// ==================== CONSTANTS ====================

const QUEUE_STATUS = {
  pending: { label: 'Pending', bg: 'bg-yellow-100', text: 'text-yellow-700' },
  assigned: { label: 'Assigned', bg: 'bg-blue-100', text: 'text-blue-700' },
  consolidated: { label: 'Consolidated', bg: 'bg-green-100', text: 'text-green-700' }
};

// ==================== COMPONENTS ====================

const StatCard = ({ title, value, icon: Icon, color = 'blue', subtitle }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-gray-500">{title}</p>
        <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-2 rounded-lg bg-${color}-50 text-${color}-600`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  </div>
);

const GroupCard = ({ group, onViewGroup, onSelectShipments }) => {
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
  };

  const clearAll = () => {
    setSelectedShipments({});
  };

  const getSelectedCount = () => {
    return Object.values(selectedShipments).filter(Boolean).length;
  };

  const containerSuggestion = estimateContainerType(group.totalVolume);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">
      {/* Group Header */}
      <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 border-b">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 hover:bg-orange-200 rounded-lg mt-1"
            >
              {expanded ? 
                <ChevronUp className="h-5 w-5 text-orange-600" /> : 
                <ChevronDown className="h-5 w-5 text-orange-600" />
              }
            </button>
            
            <div>
              <div className="flex items-center space-x-2">
                <Globe className="h-5 w-5 text-orange-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  {group.displayName}
                </h2>
                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">
                  {group.count} Shipments
                </span>
              </div>

              <div className="flex flex-wrap gap-4 mt-2 text-sm">
                <div className="flex items-center text-gray-600">
                  <Package className="h-4 w-4 mr-1" />
                  <span>{group.totalPackages} packages</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Weight className="h-4 w-4 mr-1" />
                  <span>{group.totalWeight.toFixed(2)} kg</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Box className="h-4 w-4 mr-1" />
                  <span>{group.totalVolume.toFixed(2)} m³</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Ship className="h-4 w-4 mr-1" />
                  <span>Suggested: {formatContainerType(containerSuggestion)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={selectAll}
              className="px-3 py-1 text-xs bg-white border rounded-lg hover:bg-gray-50"
            >
              Select All
            </button>
            <button
              onClick={clearAll}
              className="px-3 py-1 text-xs bg-white border rounded-lg hover:bg-gray-50"
            >
              Clear
            </button>
            <button
              onClick={() => onSelectShipments(group, selectedShipments)}
              className="px-4 py-1 bg-[#E67E22] text-white rounded-lg hover:bg-[#d35400] flex items-center text-sm"
            >
              <Ship className="h-4 w-4 mr-1" />
              Consolidate ({getSelectedCount()})
            </button>
          </div>
        </div>
      </div>

      {/* Shipments List */}
      {expanded && (
        <div className="divide-y">
          {group.shipments.map((shipment) => (
            <div key={shipment._id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={selectedShipments[shipment._id] || false}
                  onChange={() => toggleShipment(shipment._id)}
                  className="mt-1 h-4 w-4 text-[#E67E22] rounded border-gray-300"
                />

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">
                          {shipment.trackingNumber}
                        </span>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          QUEUE_STATUS[shipment.status]?.bg || 'bg-gray-100'
                        } ${
                          QUEUE_STATUS[shipment.status]?.text || 'text-gray-700'
                        }`}>
                          {shipment.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Customer: {shipment.customerId?.companyName || 'N/A'}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400">
                      Added: {formatDate(shipment.addedAt)}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mt-2 text-xs">
                    <div className="flex items-center text-gray-600">
                      <Package className="h-3 w-3 mr-1" />
                      {shipment.totalPackages} pkgs
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Weight className="h-3 w-3 mr-1" />
                      {shipment.totalWeight?.toFixed(1)} kg
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Box className="h-3 w-3 mr-1" />
                      {shipment.totalVolume?.toFixed(2)} m³
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-3 w-3 mr-1" />
                      {shipment.packages?.length} types
                    </div>
                  </div>

                  {/* Package Types */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {shipment.packages?.map((pkg, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                      >
                        {pkg.packagingType} x{pkg.quantity}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => onViewGroup(group)}
                  className="p-1 hover:bg-gray-100 rounded-lg"
                >
                  <Eye className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ==================== MAIN PAGE ====================

export default function ConsolidationQueuePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [queueData, setQueueData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedShipments, setSelectedShipments] = useState({});

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
      console.error('Load queue error:', error);
      toast.error('Failed to load consolidation queue');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectShipments = (group, selections) => {
    setSelectedGroup(group);
    setSelectedShipments(selections);
    setShowCreateModal(true);
  };

  const handleRemoveFromQueue = async (shipmentId) => {
    if (!confirm('Remove this shipment from queue?')) return;
    
    try {
      const result = await removeFromQueue(shipmentId);
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

  const filteredGroups = queueData?.grouped?.filter(group => 
    group.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Calculate summary stats
  const totalShipments = queueData?.totalItems || 0;
  const totalGroups = queueData?.totalGroups || 0;
  const totalVolume = queueData?.grouped?.reduce((sum, g) => sum + g.totalVolume, 0) || 0;
  const totalWeight = queueData?.grouped?.reduce((sum, g) => sum + g.totalWeight, 0) || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <Link href="/warehouse" className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Package className="h-6 w-6 mr-2 text-[#E67E22]" />
                Consolidation Queue
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Shipments ready for consolidation - grouped by destination
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Total Shipments"
              value={totalShipments}
              icon={Package}
              color="blue"
              subtitle="Ready for consolidation"
            />
            <StatCard
              title="Destination Groups"
              value={totalGroups}
              icon={Globe}
              color="green"
              subtitle="Unique routes"
            />
            <StatCard
              title="Total Volume"
              value={`${totalVolume.toFixed(2)} m³`}
              icon={Box}
              color="orange"
              subtitle="Combined volume"
            />
            <StatCard
              title="Total Weight"
              value={`${totalWeight.toFixed(2)} kg`}
              icon={Weight}
              color="purple"
              subtitle="Combined weight"
            />
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by destination..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E67E22]"
                />
              </div>
              <button
                onClick={loadQueue}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Queue Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#E67E22]" />
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Package className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <h3 className="text-sm font-medium text-gray-900">No shipments in queue</h3>
            <p className="text-xs text-gray-500 mt-1">
              Complete inspection to add shipments to consolidation queue
            </p>
            <Link
              href="/warehouse/inspection"
              className="mt-4 inline-flex items-center px-4 py-2 bg-[#E67E22] text-white text-sm rounded-lg hover:bg-[#d35400]"
            >
              Go to Inspection
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredGroups.map((group) => (
              <GroupCard
                key={group.groupKey}
                group={group}
                onViewGroup={(g) => router.push(`/warehouse/consolidation/create?group=${g.groupKey}`)}
                onSelectShipments={handleSelectShipments}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Consolidation Modal - Will be implemented in next part */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Create Consolidation</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-center py-8 text-gray-500">
              Consolidation creation form will be here (Next Part)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}