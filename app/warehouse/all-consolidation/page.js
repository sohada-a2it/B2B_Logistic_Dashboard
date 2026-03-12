// warehouse/consolidations/index.js
'use client';

import React, { useState, useEffect } from 'react';
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
  Archive, RotateCcw, Ban, Play, Pause, Send,
  Flag, Award
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
  groupConsolidationsByStatus,
  markAsReadyForDispatch
} from '@/Api/consolidation';

// ==================== CONSTANTS ====================

const CONSOLIDATION_STATUSES = [
  { value: 'draft', label: 'Draft', color: 'gray', icon: FileText },
  { value: 'in_progress', label: 'In Progress', color: 'blue', icon: Play },
  { value: 'consolidated', label: 'Consolidated', color: 'purple', icon: Package },
  { value: 'ready_for_dispatch', label: 'Ready for Dispatch', color: 'orange', icon: Send },
  { value: 'loaded', label: 'Loaded', color: 'indigo', icon: Package },
  { value: 'dispatched', label: 'Dispatched', color: 'amber', icon: Send },
  { value: 'in_transit', label: 'In Transit', color: 'yellow', icon: Truck },
  { value: 'arrived', label: 'Arrived', color: 'green', icon: CheckCircle },
  { value: 'customs_cleared', label: 'Customs Cleared', color: 'emerald', icon: Shield },
  { value: 'out_for_delivery', label: 'Out for Delivery', color: 'blue', icon: Truck },
  { value: 'delivered', label: 'Delivered', color: 'emerald', icon: CheckCircle },
   { value: 'completed', label: 'Completed', color: 'green', icon: Award },
  { value: 'on_hold', label: 'On Hold', color: 'orange', icon: Pause },
  { value: 'cancelled', label: 'Cancelled', color: 'red', icon: Ban },
  { value: 'returned', label: 'Returned', color: 'red', icon: RotateCcw }
];

const CONTAINER_TYPES = [
  { value: '20ft', label: '20ft Standard Container', maxVolume: 28, icon: '📦' },
  { value: '40ft', label: '40ft Standard Container', maxVolume: 58, icon: '📦📦' },
  { value: '40ft HC', label: '40ft High Cube Container', maxVolume: 68, icon: '📦📦⬆️' },
  { value: '45ft', label: '45ft High Cube Container', maxVolume: 78, icon: '📦📦📦' },
  { value: 'LCL', label: 'LCL - Less than Container Load', maxVolume: 999, icon: '📦' }
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
    indigo: 'bg-indigo-100 text-indigo-800',
    amber: 'bg-amber-100 text-amber-800',
    yellow: 'bg-yellow-100 text-yellow-800',
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

const getShipmentCount = (consolidation) => {
  if (!consolidation) return 0;
  if (consolidation.totalShipments) return consolidation.totalShipments;
  if (consolidation.shipments?.length) return consolidation.shipments.length;
  if (consolidation.items?.length) return consolidation.items.length;
  return 0;
};

const getTotalPackages = (consolidation) => {
  if (!consolidation) return 0;
  if (consolidation.totalPackages) return consolidation.totalPackages;
  
  const shipments = consolidation.shipments || consolidation.items || [];
  if (shipments.length > 0) {
    return shipments.reduce((total, shipment) => {
      if (shipment.totalPackages) return total + shipment.totalPackages;
      if (shipment.quantity) return total + shipment.quantity;
      return total + 1;
    }, 0);
  }
  return 0;
};

const getTotalVolume = (consolidation) => {
  if (!consolidation) return 0;
  return consolidation.totalVolume || 0;
};

const getTotalWeight = (consolidation) => {
  if (!consolidation) return 0;
  return consolidation.totalWeight || 0;
};

const getContainerType = (consolidation) => {
  if (!consolidation) return 'N/A';
  return consolidation.containerType || 'N/A';
};

const getContainerNumber = (consolidation) => {
  if (!consolidation) return 'N/A';
  return consolidation.containerNumber || 'N/A';
};

const getSealNumber = (consolidation) => {
  if (!consolidation) return 'N/A';
  return consolidation.sealNumber || 'N/A';
};

const getMainType = (consolidation) => {
  if (!consolidation) return 'N/A';
  return consolidation.mainType || 'N/A';
};

const getSubType = (consolidation) => {
  if (!consolidation) return 'N/A';
  return consolidation.subType || 'N/A';
};

// ==================== CUSTOMS CLEARED MODAL ====================

const CustomsClearedModal = ({ isOpen, onClose, consolidation, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    clearanceDate: new Date().toISOString().split('T')[0],
    clearanceTime: new Date().toTimeString().slice(0, 5),
    customsReference: '',
    notes: ''
  });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await updateConsolidationStatus(consolidation._id, {
        status: 'customs_cleared',
        notes: `Customs cleared on ${formData.clearanceDate} ${formData.clearanceTime}. Reference: ${formData.customsReference}. ${formData.notes}`
      });

      if (result.success) {
        toast.success('✅ Customs clearance completed');
        onSuccess();
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
          <h3 className="text-lg font-bold flex items-center">
            <Shield className="h-5 w-5 mr-2 text-emerald-600" />
            Customs Clearance
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {consolidation?.consolidationNumber}
          </p>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Clearance Date
              </label>
              <input
                type="date"
                value={formData.clearanceDate}
                onChange={(e) => setFormData({...formData, clearanceDate: e.target.value})}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-600"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Clearance Time
              </label>
              <input
                type="time"
                value={formData.clearanceTime}
                onChange={(e) => setFormData({...formData, clearanceTime: e.target.value})}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customs Reference
            </label>
            <input
              type="text"
              value={formData.customsReference}
              onChange={(e) => setFormData({...formData, customsReference: e.target.value})}
              placeholder="e.g., CUS-2025-001"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={3}
              placeholder="Any customs notes..."
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-600"
            />
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
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 flex items-center"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Confirm Customs Clearance'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== OUT FOR DELIVERY MODAL ====================

const OutForDeliveryModal = ({ isOpen, onClose, consolidation, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    deliveryDate: new Date().toISOString().split('T')[0],
    deliveryTime: new Date().toTimeString().slice(0, 5),
    carrierName: '',
    vehicleNumber: '',
    driverName: '',
    driverPhone: '',
    notes: ''
  });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await updateConsolidationStatus(consolidation._id, {
        status: 'out_for_delivery',
        notes: `Out for delivery on ${formData.deliveryDate} ${formData.deliveryTime}. Carrier: ${formData.carrierName}, Vehicle: ${formData.vehicleNumber}, Driver: ${formData.driverName}. ${formData.notes}`
      });

      if (result.success) {
        toast.success('✅ Shipment is out for delivery');
        onSuccess();
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
          <h3 className="text-lg font-bold flex items-center">
            <Truck className="h-5 w-5 mr-2 text-blue-600" />
            Out for Delivery
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {consolidation?.consolidationNumber}
          </p>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Date
              </label>
              <input
                type="date"
                value={formData.deliveryDate}
                onChange={(e) => setFormData({...formData, deliveryDate: e.target.value})}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Time
              </label>
              <input
                type="time"
                value={formData.deliveryTime}
                onChange={(e) => setFormData({...formData, deliveryTime: e.target.value})}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Carrier Name
            </label>
            <input
              type="text"
              value={formData.carrierName}
              onChange={(e) => setFormData({...formData, carrierName: e.target.value})}
              placeholder="e.g., DHL, FedEx"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vehicle Number
            </label>
            <input
              type="text"
              value={formData.vehicleNumber}
              onChange={(e) => setFormData({...formData, vehicleNumber: e.target.value})}
              placeholder="e.g., DL-01-AB-1234"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Driver Name
              </label>
              <input
                type="text"
                value={formData.driverName}
                onChange={(e) => setFormData({...formData, driverName: e.target.value})}
                placeholder="Driver name"
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Driver Phone
              </label>
              <input
                type="text"
                value={formData.driverPhone}
                onChange={(e) => setFormData({...formData, driverPhone: e.target.value})}
                placeholder="Phone number"
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={3}
              placeholder="Any delivery notes..."
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-600"
            />
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
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 flex items-center"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Confirm Out for Delivery'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== DELIVERED MODAL ====================

const DeliveredModal = ({ isOpen, onClose, consolidation, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    deliveredDate: new Date().toISOString().split('T')[0],
    deliveredTime: new Date().toTimeString().slice(0, 5),
    receivedBy: '',
    signature: false,
    notes: ''
  });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await updateConsolidationStatus(consolidation._id, {
        status: 'delivered',
        notes: `Delivered on ${formData.deliveredDate} ${formData.deliveredTime}. Received by: ${formData.receivedBy}. ${formData.notes}`
      });

      if (result.success) {
        toast.success('✅ Shipment delivered successfully');
        onSuccess();
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
          <h3 className="text-lg font-bold flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
            Mark as Delivered
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {consolidation?.consolidationNumber}
          </p>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Date
              </label>
              <input
                type="date"
                value={formData.deliveredDate}
                onChange={(e) => setFormData({...formData, deliveredDate: e.target.value})}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-600"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Time
              </label>
              <input
                type="time"
                value={formData.deliveredTime}
                onChange={(e) => setFormData({...formData, deliveredTime: e.target.value})}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Received By
            </label>
            <input
              type="text"
              value={formData.receivedBy}
              onChange={(e) => setFormData({...formData, receivedBy: e.target.value})}
              placeholder="Recipient name"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-600"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.signature}
              onChange={(e) => setFormData({...formData, signature: e.target.checked})}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Signature obtained
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Delivery Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={3}
              placeholder="Any delivery notes..."
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-600"
            />
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
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 flex items-center"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Confirm Delivery'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== START CONSOLIDATION MODAL ====================

const StartConsolidationModal = ({ isOpen, onClose, consolidation, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    notes: ''
  });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await updateConsolidationStatus(consolidation._id, {
        status: 'in_progress',
        notes: `Consolidation started. ${formData.notes}`
      });

      if (result.success) {
        toast.success('✅ Consolidation started successfully');
        onSuccess();
        onClose();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to start consolidation');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6 border-b">
          <h3 className="text-lg font-bold flex items-center">
            <Play className="h-5 w-5 mr-2 text-blue-600" />
            Start Consolidation
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {consolidation?.consolidationNumber}
          </p>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={3}
              placeholder="Any notes about starting this consolidation..."
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-start">
              <Info className="h-4 w-4 text-blue-600 mr-2 mt-0.5" />
              <p className="text-xs text-blue-700">
                This will move the consolidation from Draft to In Progress status.
                You can now start adding shipments to this consolidation.
              </p>
            </div>
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
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 flex items-center"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Starting...
              </>
            ) : (
              'Start Consolidation'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== COMPLETE CONSOLIDATION MODAL ====================

const CompleteConsolidationModal = ({ isOpen, onClose, consolidation, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [validationResults, setValidationResults] = useState(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (consolidation && isOpen) {
      const shipmentCount = consolidation.shipments?.length || consolidation.totalShipments || 0;
      
      const missing = [];
      const warnings = [];

      // 1. Shipments check
      if (shipmentCount === 0) {
        missing.push('At least one shipment is required');
      }

      // 2. Container type check
      if (!consolidation.containerType) {
        missing.push('Container type is required');
      }

      // 3. Container number check
      if (!consolidation.containerNumber) {
        missing.push('Container number is required');
      }

      // 4. Origin warehouse check
      if (!consolidation.originWarehouse) {
        missing.push('Origin warehouse is required');
      }

      // 5. Destination port check
      if (!consolidation.destinationPort) {
        missing.push('Destination port is required');
      }

      // 6. Weight check
      if (!consolidation.totalWeight || consolidation.totalWeight === 0) {
        warnings.push('Total weight is 0 kg - please verify');
      }

      // 7. Volume check
      if (!consolidation.totalVolume || consolidation.totalVolume === 0) {
        warnings.push('Total volume is 0 CBM - please verify');
      }

      setValidationResults({
        ready: missing.length === 0,
        missing,
        warnings,
        summary: {
          totalChecks: 7,
          passed: 7 - missing.length,
          warnings: warnings.length
        }
      });
    }
  }, [consolidation, isOpen]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await updateConsolidationStatus(consolidation._id, {
        status: 'consolidated',
        notes: `Consolidation completed. ${notes}`
      });

      if (result.success) {
        toast.success('✅ Consolidation completed successfully');
        onSuccess();
        onClose();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to complete consolidation');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6">
          <h3 className="text-lg font-bold flex items-center">
            <Package className="h-5 w-5 mr-2 text-purple-600" />
            Complete Consolidation
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {consolidation?.consolidationNumber}
          </p>
        </div>
        
        <div className="p-6 space-y-4">
          {/* Consolidation Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Shipments</p>
                <p className="font-medium">{consolidation.shipments?.length || 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Container Type</p>
                <p className="font-medium">{consolidation.containerType || 'Not set'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Origin</p>
                <p className="font-medium">{consolidation.originWarehouse || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Destination</p>
                <p className="font-medium">{consolidation.destinationPort || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Validation Results */}
          {validationResults && (
            <div className="space-y-4">
              {/* Summary Card */}
              <div className={`p-4 rounded-lg ${
                validationResults.ready 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-yellow-50 border border-yellow-200'
              }`}>
                <div className="flex items-start">
                  {validationResults.ready ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className={`font-medium ${
                      validationResults.ready ? 'text-green-800' : 'text-yellow-800'
                    }`}>
                      {validationResults.ready 
                        ? '✓ All checks passed! Ready to complete' 
                        : '⚠ Some checks failed'}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {validationResults.summary.passed} of {validationResults.summary.totalChecks} checks passed
                      {validationResults.warnings.length > 0 && 
                        ` • ${validationResults.warnings.length} warning(s)`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Missing Items (Errors) */}
              {validationResults.missing.length > 0 && (
                <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded">
                  <p className="font-medium text-red-800 mb-2 flex items-center">
                    <X className="h-4 w-4 mr-1" />
                    Required items missing:
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    {validationResults.missing.map((item, index) => (
                      <li key={index} className="text-sm text-red-700">{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Warnings */}
              {validationResults.warnings.length > 0 && (
                <div className="border-l-4 border-yellow-500 bg-yellow-50 p-4 rounded">
                  <p className="font-medium text-yellow-800 mb-2 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Warnings:
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    {validationResults.warnings.map((item, index) => (
                      <li key={index} className="text-sm text-yellow-700">{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Completion Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Add any notes about this consolidation..."
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-600"
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
            disabled={loading || (validationResults && !validationResults.ready)}
            className={`px-4 py-2 rounded-lg flex items-center ${
              validationResults && !validationResults.ready
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Package className="h-4 w-4 mr-2" />
                Complete Consolidation
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== LOADED MODAL ====================

const LoadedModal = ({ isOpen, onClose, consolidation, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    loadedDate: new Date().toISOString().split('T')[0],
    loadedTime: new Date().toTimeString().slice(0, 5),
    location: consolidation?.originWarehouse || 'Warehouse',
    notes: ''
  });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await updateConsolidationStatus(consolidation._id, {
        status: 'loaded',
        notes: `Container loaded at ${formData.location} on ${formData.loadedDate} ${formData.loadedTime}. ${formData.notes}`,
        location: formData.location
      });

      if (result.success) {
        toast.success('✅ Container marked as loaded');
        onSuccess();
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
          <h3 className="text-lg font-bold flex items-center">
            <Package className="h-5 w-5 mr-2 text-[#E67E22]" />
            Mark as Loaded
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {consolidation?.consolidationNumber}
          </p>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loaded Date
              </label>
              <input
                type="date"
                value={formData.loadedDate}
                onChange={(e) => setFormData({...formData, loadedDate: e.target.value})}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#E67E22]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loaded Time
              </label>
              <input
                type="time"
                value={formData.loadedTime}
                onChange={(e) => setFormData({...formData, loadedTime: e.target.value})}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#E67E22]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              placeholder="e.g., Warehouse A, Dock 3"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#E67E22]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={3}
              placeholder="Any special instructions..."
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#E67E22]"
            />
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
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 flex items-center"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              'Confirm Loaded'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== DETAILS VIEW MODAL ====================

const ConsolidationDetailsModal = ({ 
  isOpen, 
  onClose, 
  consolidation, 
  onEdit, 
  onDelete, 
  onStartConsolidation,
  onCompleteConsolidation,
  onReadyForDispatch,
  onLoadedClick,
  onDispatch,
  onArrivedClick,
  onCustomsCleared,
  onOutForDelivery,
  onDelivered,
  onComplete
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (consolidation && consolidation.shipments) {
      setShipments(consolidation.shipments);
    }
  }, [consolidation]);

  if (!isOpen || !consolidation) return null;

  const handleEdit = () => {
    onEdit(consolidation._id);
    onClose();
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this consolidation?')) {
      onDelete(consolidation._id);
      onClose();
    }
  };

  const getActionButton = () => {
    switch(consolidation.status) {
      case 'draft':
        return (
          <button
            onClick={() => {
              onStartConsolidation(consolidation);
              onClose();
            }}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Play className="h-4 w-4 mr-2" />
            Start Consolidation
          </button>
        );
      
      case 'in_progress':
        return (
          <button
            onClick={() => {
              onCompleteConsolidation(consolidation);
              onClose();
            }}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
          >
            <Package className="h-4 w-4 mr-2" />
            Complete Consolidation
          </button>
        );
      
      case 'consolidated':
        return (
          <button
            onClick={() => {
              onReadyForDispatch(consolidation);
              onClose();
            }}
            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center"
          >
            <Send className="h-4 w-4 mr-2" />
            Ready for Dispatch
          </button>
        );
      
      case 'ready_for_dispatch':
        return (
          <button
            onClick={() => {
              onLoadedClick(consolidation);
              onClose();
            }}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Package className="h-4 w-4 mr-2" />
            Mark as Loaded
          </button>
        );
      
      case 'loaded':
        return (
          <button
            onClick={() => {
              onDispatch(consolidation);
              onClose();
            }}
            className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center"
          >
            <Send className="h-4 w-4 mr-2" />
            Dispatch Now
          </button>
        );
      
      case 'in_transit':
        return (
          <button
            onClick={() => {
              onArrivedClick(consolidation);
              onClose();
            }}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark as Arrived
          </button>
        );
      
      case 'arrived':
        return (
          <button
            onClick={() => {
              onCustomsCleared(consolidation);
              onClose();
            }}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center"
          >
            <Shield className="h-4 w-4 mr-2" />
            Customs Clearance
          </button>
        );

      case 'customs_cleared':
        return (
          <button
            onClick={() => {
              onOutForDelivery(consolidation);
              onClose();
            }}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Truck className="h-4 w-4 mr-2" />
            Out for Delivery
          </button>
        );

      case 'out_for_delivery':
        return (
          <button
            onClick={() => {
              onDelivered(consolidation);
              onClose();
            }}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark as Delivered
          </button>
        );

      case 'delivered':
        return (
          <button
            onClick={() => {
              onComplete(consolidation);
              onClose();
            }}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center"
          >
            <Award className="h-4 w-4 mr-2" />
            Complete
          </button>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold flex items-center">
              <Container className="h-5 w-5 mr-2 text-[#E67E22]" />
              Consolidation Details
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {consolidation.consolidationNumber}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusBadge(consolidation.status)}
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b px-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-3 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-[#E67E22] text-[#E67E22]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('shipments')}
              className={`py-3 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'shipments'
                  ? 'border-[#E67E22] text-[#E67E22]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Shipments ({getShipmentCount(consolidation)})
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`py-3 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'documents'
                  ? 'border-[#E67E22] text-[#E67E22]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Documents
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`py-3 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'timeline'
                  ? 'border-[#E67E22] text-[#E67E22]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Timeline
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Consolidation Number</p>
                  <p className="font-mono font-medium">{consolidation.consolidationNumber}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Type</p>
                  <p className="font-medium">{getMainTypeName(consolidation.mainType)} - {getSubTypeName(consolidation.subType)}</p>
                </div>
              </div>

              {/* Route */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500 mb-2">Route</p>
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium">From: {consolidation.originWarehouse || 'N/A'}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 mx-4" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">To: {consolidation.destinationPort || 'N/A'}</p>
                    {consolidation.destinationCountry && (
                      <p className="text-xs text-gray-500">{consolidation.destinationCountry}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Container Info */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Container Type</p>
                  <p className="font-medium">{consolidation.containerType || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Container Number</p>
                  <p className="font-mono font-medium">{consolidation.containerNumber || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Seal Number</p>
                  <p className="font-mono font-medium">{consolidation.sealNumber || 'N/A'}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <Ship className="h-4 w-4 text-blue-600 mb-1" />
                  <p className="text-xs text-gray-500">Shipments</p>
                  <p className="text-xl font-bold">{getShipmentCount(consolidation)}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <Package className="h-4 w-4 text-green-600 mb-1" />
                  <p className="text-xs text-gray-500">Packages</p>
                  <p className="text-xl font-bold">{getTotalPackages(consolidation)}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <Box className="h-4 w-4 text-purple-600 mb-1" />
                  <p className="text-xs text-gray-500">Volume/Weight</p>
                  <p className="text-sm font-bold">{formatVolume(getTotalVolume(consolidation))}</p>
                  <p className="text-xs text-gray-500">{formatWeight(getTotalWeight(consolidation))}</p>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Created</p>
                  <p className="font-medium">{formatDate(consolidation.createdAt)}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Estimated Departure</p>
                  <p className="font-medium">{consolidation.estimatedDeparture ? formatDate(consolidation.estimatedDeparture) : 'N/A'}</p>
                </div>
                {consolidation.actualDeparture && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Actual Departure</p>
                    <p className="font-medium">{formatDate(consolidation.actualDeparture)}</p>
                  </div>
                )}
                {consolidation.estimatedArrival && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Estimated Arrival</p>
                    <p className="font-medium">{formatDate(consolidation.estimatedArrival)}</p>
                  </div>
                )}
              </div>

              {/* Notes */}
              {consolidation.notes && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Notes</p>
                  <p className="text-sm">{consolidation.notes}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'shipments' && (
            <div className="space-y-3">
              {shipments.length > 0 ? (
                shipments.map((shipment, index) => (
                  <div key={shipment._id || index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Shipment #{shipment.shipmentNumber || shipment._id?.slice(-8)}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {shipment.origin} → {shipment.destination}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{shipment.packages || 0} packages</p>
                        <p className="text-xs text-gray-500">{formatWeight(shipment.weight)}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No shipments in this consolidation
                </div>
              )}
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-3">
              {consolidation.documents && consolidation.documents.length > 0 ? (
                consolidation.documents.map((doc, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <FileText className="h-5 w-5 text-blue-600 mr-3" />
                      <div className="flex-1">
                        <div className="flex items-center">
                          <p className="font-medium capitalize">
                            {doc.type === 'packing_list' ? 'Packing List' : 
                             doc.type === 'container_manifest' ? 'Container Manifest' : 
                             doc.type}
                          </p>
                          {doc.autoGenerated && (
                            <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-600 rounded-full text-xs">
                              Auto-generated
                            </span>
                          )}
                        </div>
                        
                        {doc.fileName && (
                          <p className="text-xs text-gray-500 mt-1">
                            File: {doc.fileName}
                          </p>
                        )}
                        
                        <p className="text-xs text-gray-400">
                          Uploaded: {new Date(doc.uploadedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    {doc.fileData && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            const win = window.open();
                            win.document.write(`
                              <iframe src="${doc.fileData}" width="100%" height="100%" style="border: none;"></iframe>
                            `);
                          }}
                          className="p-2 hover:bg-blue-100 rounded-lg text-blue-600"
                          title="View Document"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = doc.fileData;
                            link.download = doc.fileName || `${doc.type}.pdf`;
                            link.click();
                          }}
                          className="p-2 hover:bg-green-100 rounded-lg text-green-600"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">No documents uploaded yet</p>
                  <p className="text-sm text-gray-400">
                    Documents will be auto-generated when you mark as ready for dispatch
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-3">
              {consolidation.timeline && consolidation.timeline.length > 0 ? (
                consolidation.timeline.map((event, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 mt-2 rounded-full bg-[#E67E22]"></div>
                    <div className="flex-1 bg-gray-50 p-3 rounded-lg">
                      <p className="font-medium">{event.status}</p>
                      <p className="text-xs text-gray-500">{formatDate(event.timestamp)}</p>
                      {event.description && (
                        <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                      )}
                      {event.location && (
                        <p className="text-xs text-gray-400 mt-1">📍 {event.location}</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No timeline events
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white border-t p-6 flex justify-between items-center">
          
          {/* Left side - Document count */}
          {consolidation.documents && consolidation.documents.length > 0 && (
            <div className="flex items-center text-sm text-gray-600">
              <FileText className="h-4 w-4 mr-2 text-blue-600" />
              <span>{consolidation.documents.length} Document(s)</span>
            </div>
          )}
          
          {/* Right side - Action buttons based on status */}
          <div className="flex space-x-3 ml-auto">
            
            {/* Edit/Delete buttons for draft/in_progress */}
            {(consolidation.status === 'draft' || consolidation.status === 'in_progress') && (
              <>
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 border rounded-lg hover:bg-red-50 text-red-600 flex items-center"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </button>
              </>
            )}
            
            {/* Main action button based on status */}
            {getActionButton()}
            
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== DISPATCH MODAL ====================

const DispatchModal = ({ isOpen, onClose, consolidation, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    dispatchDate: new Date().toISOString().split('T')[0],
    dispatchTime: new Date().toTimeString().slice(0, 5),
    carrierName: '',
    vehicleNumber: '',
    driverName: '',
    driverPhone: '',
    notes: ''
  });

  const handleSubmit = async () => {
    if (!formData.carrierName) {
      toast.warning('Please enter carrier name');
      return;
    }

    setLoading(true);
    try {
      // Step 1: Update to dispatched
      const dispatchResult = await updateConsolidationStatus(consolidation._id, {
        status: 'dispatched',
        notes: `Dispatched on ${formData.dispatchDate} at ${formData.dispatchTime} with ${formData.carrierName}. Vehicle: ${formData.vehicleNumber || 'N/A'}, Driver: ${formData.driverName || 'N/A'}. ${formData.notes}`
      });

      if (dispatchResult.success) {
        // Update actual departure date
        await updateConsolidation(consolidation._id, {
          actualDeparture: new Date(formData.dispatchDate + 'T' + formData.dispatchTime)
        });

        toast.success('✅ Consolidation dispatched successfully');

        // Step 2: Auto update to in transit (after 2 seconds)
        setTimeout(async () => {
          try {
            await updateConsolidationStatus(consolidation._id, {
              status: 'in_transit',
              notes: `In transit with ${formData.carrierName} - Vehicle: ${formData.vehicleNumber || 'N/A'}`
            });
            toast.info('🚚 Consolidation is now in transit');
            onSuccess(); // Refresh data
          } catch (error) {
            console.error('Auto transit update failed:', error);
          }
        }, 2000);

        onClose();
      } else {
        toast.error(dispatchResult.message);
      }
    } catch (error) {
      toast.error('Failed to dispatch consolidation');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6 border-b">
          <h3 className="text-lg font-bold flex items-center">
            <Send className="h-5 w-5 mr-2 text-[#E67E22]" />
            Dispatch Consolidation
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {consolidation?.consolidationNumber}
          </p>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dispatch Date
              </label>
              <input
                type="date"
                value={formData.dispatchDate}
                onChange={(e) => setFormData({ ...formData, dispatchDate: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#E67E22]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dispatch Time
              </label>
              <input
                type="time"
                value={formData.dispatchTime}
                onChange={(e) => setFormData({ ...formData, dispatchTime: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#E67E22]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Carrier Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.carrierName}
              onChange={(e) => setFormData({ ...formData, carrierName: e.target.value })}
              placeholder="e.g., Maersk, FedEx, etc."
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#E67E22]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vehicle/Truck Number
            </label>
            <input
              type="text"
              value={formData.vehicleNumber}
              onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
              placeholder="e.g., TR-1234"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#E67E22]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Driver Name
              </label>
              <input
                type="text"
                value={formData.driverName}
                onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                placeholder="Driver name"
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#E67E22]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Driver Phone
              </label>
              <input
                type="text"
                value={formData.driverPhone}
                onChange={(e) => setFormData({ ...formData, driverPhone: e.target.value })}
                placeholder="Phone number"
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#E67E22]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dispatch Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Any special instructions..."
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#E67E22]"
            />
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
            disabled={loading || !formData.carrierName}
            className={`px-4 py-2 rounded-lg flex items-center ${
              !formData.carrierName
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-[#E67E22] hover:bg-[#d35400] text-white'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Dispatching...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Confirm Dispatch
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== READY FOR DISPATCH MODAL ====================

const ReadyForDispatchModal = ({ isOpen, onClose, consolidation, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [validationResults, setValidationResults] = useState(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (consolidation && isOpen) {
      const shipmentCount = consolidation.shipments?.length || consolidation.totalShipments || 0;
      
      const missing = [];
      const warnings = [];

      // 1. Status check
      if (consolidation.status !== 'consolidated') {
        missing.push('Status must be "Consolidated"');
      }

      // 2. Container number check
      if (!consolidation.containerNumber) {
        missing.push('Container number is required');
      }

      // 3. Container type check
      if (!consolidation.containerType) {
        missing.push('Container type is required');
      }

      // 4. Origin warehouse check
      if (!consolidation.originWarehouse) {
        missing.push('Origin warehouse is required');
      }

      // 5. Destination port check
      if (!consolidation.destinationPort) {
        missing.push('Destination port is required');
      }

      // 6. Shipments check
      if (shipmentCount === 0) {
        missing.push('At least one shipment is required');
      }

      // 7. Weight check
      if (!consolidation.totalWeight || consolidation.totalWeight === 0) {
        warnings.push('Total weight is 0 kg - please verify');
      }

      // 8. Volume check
      if (!consolidation.totalVolume || consolidation.totalVolume === 0) {
        warnings.push('Total volume is 0 CBM - please verify');
      }

      setValidationResults({
        ready: missing.length === 0,
        missing,
        warnings,
        summary: {
          totalChecks: 8,
          passed: 8 - missing.length,
          warnings: warnings.length
        }
      });
    }
  }, [consolidation, isOpen]);
 
  const handleMarkAsReady = async () => {
    setLoading(true);
    try {
      const result = await markAsReadyForDispatch(consolidation._id, consolidation);
      
      if (result.success) {
        toast.success(
          <div>
            <div className="font-bold">✓ Ready for Dispatch</div>
            <div className="text-xs mt-1">
              Documents generated and uploaded automatically
            </div>
          </div>
        );
        onSuccess();
        onClose();
      }
    } catch (error) {
      const errorData = error.response?.data || error;
      toast.error(errorData?.message || 'Failed to mark as ready for dispatch');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6">
          <h3 className="text-lg font-bold flex items-center">
            <Send className="h-5 w-5 mr-2 text-[#E67E22]" />
            Mark as Ready for Dispatch
          </h3>
        </div>
        
        <div className="p-6 space-y-4">
          {/* Consolidation Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Consolidation #</p>
                <p className="font-mono font-medium">{consolidation.consolidationNumber}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <p className="font-medium">{getStatusBadge(consolidation.status)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Origin</p>
                <p className="font-medium">{consolidation.originWarehouse || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Destination</p>
                <p className="font-medium">{consolidation.destinationPort || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Validation Results */}
          {validationResults && (
            <div className="space-y-4">
              {/* Summary Card */}
              <div className={`p-4 rounded-lg ${
                validationResults.ready 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-yellow-50 border border-yellow-200'
              }`}>
                <div className="flex items-start">
                  {validationResults.ready ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className={`font-medium ${
                      validationResults.ready ? 'text-green-800' : 'text-yellow-800'
                    }`}>
                      {validationResults.ready 
                        ? '✓ All checks passed! Ready for dispatch' 
                        : '⚠ Some checks failed'}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {validationResults.summary.passed} of {validationResults.summary.totalChecks} checks passed
                      {validationResults.warnings.length > 0 && 
                        ` • ${validationResults.warnings.length} warning(s)`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Missing Items (Errors) */}
              {validationResults.missing.length > 0 && (
                <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded">
                  <p className="font-medium text-red-800 mb-2 flex items-center">
                    <X className="h-4 w-4 mr-1" />
                    Required items missing:
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    {validationResults.missing.map((item, index) => (
                      <li key={index} className="text-sm text-red-700">{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Warnings */}
              {validationResults.warnings.length > 0 && (
                <div className="border-l-4 border-yellow-500 bg-yellow-50 p-4 rounded">
                  <p className="font-medium text-yellow-800 mb-2 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Warnings:
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    {validationResults.warnings.map((item, index) => (
                      <li key={index} className="text-sm text-yellow-700">{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dispatch Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Add any special instructions or notes for dispatch..."
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#E67E22]"
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
            onClick={handleMarkAsReady}
            disabled={loading || (validationResults && !validationResults.ready)}
            className={`px-4 py-2 rounded-lg flex items-center ${
              validationResults && !validationResults.ready
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-[#E67E22] hover:bg-[#d35400] text-white'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Mark as Ready for Dispatch
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== COMPLETED MODAL ====================

const CompletedModal = ({ isOpen, onClose, consolidation, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    completionDate: new Date().toISOString().split('T')[0],
    completionTime: new Date().toTimeString().slice(0, 5),
    notes: ''
  });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await updateConsolidationStatus(consolidation._id, {
        status: 'completed',
        notes: `Consolidation completed on ${formData.completionDate} ${formData.completionTime}. ${formData.notes}`
      });

      if (result.success) {
        toast.success('✅ Consolidation marked as completed');
        onSuccess();
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
          <h3 className="text-lg font-bold flex items-center">
            <Award className="h-5 w-5 mr-2 text-emerald-600" />
            Mark as Completed
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {consolidation?.consolidationNumber}
          </p>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Completion Date
              </label>
              <input
                type="date"
                value={formData.completionDate}
                onChange={(e) => setFormData({...formData, completionDate: e.target.value})}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-600"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Completion Time
              </label>
              <input
                type="time"
                value={formData.completionTime}
                onChange={(e) => setFormData({...formData, completionTime: e.target.value})}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={3}
              placeholder="Any completion notes..."
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div className="bg-emerald-50 p-3 rounded-lg">
            <div className="flex items-start">
              <Info className="h-4 w-4 text-emerald-600 mr-2 mt-0.5" />
              <p className="text-xs text-emerald-700">
                This will mark the consolidation as completed. All shipments are delivered and documents are finalized.
              </p>
            </div>
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
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 flex items-center"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Confirm Completion'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== STAT CARD ====================

const StatCard = ({ title, value, icon: Icon, color = 'orange', subtitle }) => {
  const colorClasses = {
    orange: 'bg-orange-50 text-orange-600',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    amber: 'bg-amber-50 text-amber-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    emerald: 'bg-emerald-50 text-emerald-600'
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-4 rounded-xl ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};

// ==================== FILTER BAR ====================

const FilterBar = ({ filters, onFilterChange, onClearFilters, totalCount }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
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
        </button>

        <button onClick={onClearFilters} className="px-4 py-2 text-gray-600 hover:text-gray-900">
          Clear
        </button>

        <div className="text-sm text-gray-500">
          {totalCount} consolidations found
        </div>
      </div>

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
        </div>
      )}
    </div>
  );
};

// ==================== CONSOLIDATION CARD ====================

const ConsolidationCard = ({ 
  consolidation, 
  onView, 
  onEdit, 
  onDelete, 
  onStartConsolidation,
  onCompleteConsolidation,
  onReadyForDispatch, 
  onLoadedClick,
  onDispatch,
  onArrivedClick,
  onCustomsCleared,
  onOutForDelivery,
  onDelivered,
  onComplete
}) => {
  const [showActions, setShowActions] = useState(false);
  
  const origin = consolidation.originWarehouse || 'N/A';
  const destination = consolidation.destinationPort || 'N/A';
  const shipmentCount = getShipmentCount(consolidation);
  const totalPackages = getTotalPackages(consolidation);
  const totalVolume = getTotalVolume(consolidation);
  const totalWeight = getTotalWeight(consolidation);
  const containerType = getContainerType(consolidation);
  const mainType = getMainType(consolidation);
  const subType = getSubType(consolidation);

  const getActionButton = () => {
    switch(consolidation.status) {
      case 'draft':
        return (
          <button
            onClick={() => onStartConsolidation(consolidation)}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
          >
            <Play className="h-4 w-4 mr-2" />
            Start Consolidation
          </button>
        );
      
      case 'in_progress':
        return (
          <button
            onClick={() => onCompleteConsolidation(consolidation)}
            className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center"
          >
            <Package className="h-4 w-4 mr-2" />
            Complete Consolidation
          </button>
        );
      
      case 'consolidated':
        return (
          <button
            onClick={() => onReadyForDispatch(consolidation)}
            className="w-full py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center justify-center"
          >
            <Send className="h-4 w-4 mr-2" />
            Ready for Dispatch
          </button>
        );
      
      case 'ready_for_dispatch':
        return (
          <button
            onClick={() => onLoadedClick(consolidation)}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
          >
            <Package className="h-4 w-4 mr-2" />
            Mark as Loaded
          </button>
        );
      
      case 'loaded':
        return (
          <button
            onClick={() => onDispatch(consolidation)}
            className="w-full py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center justify-center"
          >
            <Send className="h-4 w-4 mr-2" />
            Dispatch Now
          </button>
        );
      
      case 'in_transit':
        return (
          <button
            onClick={() => onArrivedClick(consolidation)}
            className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark as Arrived
          </button>
        );
      
      case 'arrived':
        return (
          <button
            onClick={() => onCustomsCleared(consolidation)}
            className="w-full py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center justify-center"
          >
            <Shield className="h-4 w-4 mr-2" />
            Customs Clearance
          </button>
        );
      
      case 'customs_cleared':
        return (
          <button
            onClick={() => onOutForDelivery(consolidation)}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
          >
            <Truck className="h-4 w-4 mr-2" />
            Out for Delivery
          </button>
        );
      
      case 'out_for_delivery':
        return (
          <button
            onClick={() => onDelivered(consolidation)}
            className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark as Delivered
          </button>
        );
      
      case 'delivered':
        return (
          <button
            onClick={() => onComplete(consolidation)}
            className="w-full py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center justify-center"
          >
            <Award className="h-4 w-4 mr-2" />
            Complete
          </button>
        );
      
      default:
        return null;
    }
  };

  return (
    <div 
      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
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

      <div className="p-4">
        {/* Documents indicator */}
        {consolidation.documents && consolidation.documents.length > 0 && (
          <div className="flex items-center space-x-2 mb-2 bg-green-50 p-2 rounded-lg">
            <FileText className="h-4 w-4 text-green-600" />
            <span className="text-xs text-green-600 font-medium">
              {consolidation.documents.length} document(s)
            </span>
          </div>
        )}

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

        <div className="bg-gray-50 rounded-lg p-3 mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500">Container</span>
            <span className="text-sm font-semibold">{containerType}</span>
          </div>
          <div className="text-xs text-gray-600">
            <div className="flex justify-between mb-1">
              <span>Number:</span>
              <span className="font-mono">{consolidation.containerNumber || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span>Seal:</span>
              <span className="font-mono">{consolidation.sealNumber || 'N/A'}</span>
            </div>
          </div>
        </div>

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

        <div className="space-y-2 mb-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-500">Volume</span>
              <span className="font-medium">{formatVolume(totalVolume)}</span>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-500">Weight</span>
              <span className="font-medium">{formatWeight(totalWeight)}</span>
            </div>
          </div>
        </div>

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

      {/* Status based action button */}
      <div className="px-4 pb-4">
        {getActionButton()}
      </div>

      {/* Actions Icons */}
      <div className={`p-3 bg-gray-50 border-t flex justify-end space-x-2 transition-opacity ${showActions ? 'opacity-100' : 'opacity-0'}`}>
        <button
          onClick={() => onView(consolidation)}
          className="p-1.5 hover:bg-blue-100 rounded-lg text-blue-600"
          title="View Details"
        >
          <Eye className="h-4 w-4" />
        </button>
        {(consolidation.status === 'draft' || consolidation.status === 'in_progress') && (
          <button
            onClick={() => onEdit(consolidation._id)}
            className="p-1.5 hover:bg-green-100 rounded-lg text-green-600"
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </button>
        )}
        {(consolidation.status === 'draft' || consolidation.status === 'in_progress' || consolidation.status === 'cancelled') && (
          <button
            onClick={() => onDelete(consolidation._id)}
            className="p-1.5 hover:bg-red-100 rounded-lg text-red-600"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

// ==================== ARRIVED MODAL ====================

const ArrivedModal = ({ isOpen, onClose, consolidation, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    arrivalDate: new Date().toISOString().split('T')[0],
    arrivalTime: new Date().toTimeString().slice(0, 5),
    portName: '',
    vesselName: '',
    notes: ''
  });

  useEffect(() => {
    if (isOpen && consolidation) {
      setFetching(true);
      
      setFormData(prev => ({
        ...prev,
        portName: consolidation.destinationPort || 'Destination Port',
        vesselName: consolidation.carrier?.vesselNumber || 
                    consolidation.carrier?.flightNumber || 
                    'Not assigned'
      }));
      
      setFetching(false);
    }
  }, [isOpen, consolidation]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await updateConsolidationStatus(consolidation._id, {
        status: 'arrived',
        notes: `Arrived at ${formData.portName} on ${formData.arrivalDate} ${formData.arrivalTime}. Vessel: ${formData.vesselName}. ${formData.notes}`,
        location: formData.portName,
        actualArrival: new Date(formData.arrivalDate + 'T' + formData.arrivalTime)
      });

      if (result.success) {
        toast.success('✅ Shipment arrived at destination port');
        onSuccess();
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
          <h3 className="text-lg font-bold flex items-center">
            <Ship className="h-5 w-5 mr-2 text-green-600" />
            Mark as Arrived
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {consolidation?.consolidationNumber}
          </p>
        </div>
        
        <div className="p-6 space-y-4">
          {fetching ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-green-600 mr-2" />
              <span className="text-sm text-gray-500">Fetching vessel details...</span>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Arrival Date
                  </label>
                  <input
                    type="date"
                    value={formData.arrivalDate}
                    onChange={(e) => setFormData({...formData, arrivalDate: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Arrival Time
                  </label>
                  <input
                    type="time"
                    value={formData.arrivalTime}
                    onChange={(e) => setFormData({...formData, arrivalTime: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Port Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.portName}
                    onChange={(e) => setFormData({...formData, portName: e.target.value})}
                    placeholder="Destination port"
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-600 pr-8"
                  />
                  <MapPin className="absolute right-2 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vessel/Flight Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.vesselName}
                    onChange={(e) => setFormData({...formData, vesselName: e.target.value})}
                    placeholder="Vessel or flight number"
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-600 pr-8"
                  />
                  <Ship className="absolute right-2 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows={3}
                  placeholder="Any arrival notes..."
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-600"
                />
              </div>
            </>
          )}
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
            disabled={loading || fetching}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 flex items-center"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Confirm Arrival'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== TABLE ROW ====================

const TableRow = ({ 
  consolidation, 
  onView, 
  onEdit, 
  onDelete, 
  onStartConsolidation,
  onCompleteConsolidation,
  onReadyForDispatch,
  onLoadedClick,
  onDispatch,
  onArrivedClick,
  onCustomsCleared,
  onOutForDelivery,
  onDelivered,
  onComplete 
}) => {
  const origin = consolidation.originWarehouse || 'N/A';
  const destination = consolidation.destinationPort || 'N/A';
  const shipmentCount = getShipmentCount(consolidation);
  const totalPackages = getTotalPackages(consolidation);
  const totalVolume = getTotalVolume(consolidation);
  const totalWeight = getTotalWeight(consolidation);
  const containerType = getContainerType(consolidation);
  const mainType = getMainType(consolidation);

  const getActionButtons = () => {
    const buttons = [];
    
    // Always show view
    buttons.push(
      <button
        key="view"
        onClick={() => onView(consolidation)}
        className="p-1 hover:bg-blue-100 rounded-lg text-blue-600"
        title="View"
      >
        <Eye className="h-4 w-4" />
      </button>
    );

    // Edit only for draft/in_progress
    if (consolidation.status === 'draft' || consolidation.status === 'in_progress') {
      buttons.push(
        <button
          key="edit"
          onClick={() => onEdit(consolidation._id)}
          className="p-1 hover:bg-green-100 rounded-lg text-green-600"
          title="Edit"
        >
          <Edit className="h-4 w-4" />
        </button>
      );
    }

    // Status-specific action buttons
    if (consolidation.status === 'draft') {
      buttons.push(
        <button
          key="start"
          onClick={() => onStartConsolidation(consolidation)}
          className="p-1 hover:bg-blue-100 rounded-lg text-blue-600"
          title="Start Consolidation"
        >
          <Play className="h-4 w-4" />
        </button>
      );
    }

    if (consolidation.status === 'in_progress') {
      buttons.push(
        <button
          key="complete"
          onClick={() => onCompleteConsolidation(consolidation)}
          className="p-1 hover:bg-purple-100 rounded-lg text-purple-600"
          title="Complete Consolidation"
        >
          <Package className="h-4 w-4" />
        </button>
      );
    }

    if (consolidation.status === 'consolidated') {
      buttons.push(
        <button
          key="ready"
          onClick={() => onReadyForDispatch(consolidation)}
          className="p-1 hover:bg-orange-100 rounded-lg text-orange-600"
          title="Ready for Dispatch"
        >
          <Send className="h-4 w-4" />
        </button>
      );
    }

    if (consolidation.status === 'ready_for_dispatch') {
      buttons.push(
        <button
          key="loaded"
          onClick={() => onLoadedClick(consolidation)}
          className="p-1 hover:bg-blue-100 rounded-lg text-blue-600"
          title="Mark as Loaded"
        >
          <Package className="h-4 w-4" />
        </button>
      );
    }

    if (consolidation.status === 'loaded') {
      buttons.push(
        <button
          key="dispatch"
          onClick={() => onDispatch(consolidation)}
          className="p-1 hover:bg-amber-100 rounded-lg text-amber-600"
          title="Dispatch Now"
        >
          <Send className="h-4 w-4" />
        </button>
      );
    }

    if (consolidation.status === 'in_transit') {
      buttons.push(
        <button
          key="arrived"
          onClick={() => onArrivedClick(consolidation)}
          className="p-1 hover:bg-green-100 rounded-lg text-green-600"
          title="Mark as Arrived"
        >
          <CheckCircle className="h-4 w-4" />
        </button>
      );
    }

    if (consolidation.status === 'arrived') {
      buttons.push(
        <button
          key="customs"
          onClick={() => onCustomsCleared(consolidation)}
          className="p-1 hover:bg-emerald-100 rounded-lg text-emerald-600"
          title="Mark Customs Cleared"
        >
          <Shield className="h-4 w-4" />
        </button>
      );
    }

    if (consolidation.status === 'customs_cleared') {
      buttons.push(
        <button
          key="outForDelivery"
          onClick={() => onOutForDelivery(consolidation)}
          className="p-1 hover:bg-blue-100 rounded-lg text-blue-600"
          title="Out for Delivery"
        >
          <Truck className="h-4 w-4" />
        </button>
      );
    }

    if (consolidation.status === 'out_for_delivery') {
      buttons.push(
        <button
          key="delivered"
          onClick={() => onDelivered(consolidation)}
          className="p-1 hover:bg-green-100 rounded-lg text-green-600"
          title="Mark as Delivered"
        >
          <CheckCircle className="h-4 w-4" />
        </button>
      );
    }

    if (consolidation.status === 'delivered') {
      buttons.push(
        <button
          key="complete"
          onClick={() => onComplete(consolidation)}
          className="p-1 hover:bg-emerald-100 rounded-lg text-emerald-600"
          title="Complete"
        >
          <Award className="h-4 w-4" />
        </button>
      );
    }

    // Delete only for draft/in_progress/cancelled
    if (consolidation.status === 'draft' || consolidation.status === 'in_progress' || consolidation.status === 'cancelled') {
      buttons.push(
        <button
          key="delete"
          onClick={() => onDelete(consolidation._id)}
          className="p-1 hover:bg-red-100 rounded-lg text-red-600"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      );
    }

    return buttons;
  };

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
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="text-sm">{containerType}</div>
      </td>
      <td className="px-4 py-3">
        <div className="text-sm">
          <div>{origin}</div>
          <div className="text-xs text-gray-500">→ {destination}</div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="text-sm">{shipmentCount}</div>
      </td>
      <td className="px-4 py-3">
        <div className="text-sm">
          <div>{formatVolume(totalVolume)}</div>
          <div className="text-xs text-gray-500">{formatWeight(totalWeight)}</div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center space-x-1">
          {getActionButtons()}
        </div>
      </td>
    </tr>
  );
};

// ==================== LIST ITEM ====================

const ListItem = ({ 
  consolidation, 
  onView, 
  onEdit, 
  onDelete, 
  onStartConsolidation,
  onCompleteConsolidation,
  onReadyForDispatch,
  onLoadedClick,
  onDispatch,
  onArrivedClick,
  onCustomsCleared,
  onOutForDelivery,
  onDelivered,
  onComplete 
}) => {
  const origin = consolidation.originWarehouse || 'N/A';
  const destination = consolidation.destinationPort || 'N/A';
  const shipmentCount = getShipmentCount(consolidation);
  const totalPackages = getTotalPackages(consolidation);
  const totalVolume = getTotalVolume(consolidation);
  const totalWeight = getTotalWeight(consolidation);
  const containerType = getContainerType(consolidation);
  const mainType = getMainType(consolidation);

  const getActionButtons = () => {
    const buttons = [];
    
    // Always show view
    buttons.push(
      <button
        key="view"
        onClick={() => onView(consolidation)}
        className="p-1 hover:bg-blue-100 rounded-lg text-blue-600"
        title="View"
      >
        <Eye className="h-4 w-4" />
      </button>
    );

    // Edit only for draft/in_progress
    if (consolidation.status === 'draft' || consolidation.status === 'in_progress') {
      buttons.push(
        <button
          key="edit"
          onClick={() => onEdit(consolidation._id)}
          className="p-1 hover:bg-green-100 rounded-lg text-green-600"
          title="Edit"
        >
          <Edit className="h-4 w-4" />
        </button>
      );
    }

    // Status-specific action buttons
    if (consolidation.status === 'draft') {
      buttons.push(
        <button
          key="start"
          onClick={() => onStartConsolidation(consolidation)}
          className="p-1 hover:bg-blue-100 rounded-lg text-blue-600"
          title="Start Consolidation"
        >
          <Play className="h-4 w-4" />
        </button>
      );
    }

    if (consolidation.status === 'in_progress') {
      buttons.push(
        <button
          key="complete"
          onClick={() => onCompleteConsolidation(consolidation)}
          className="p-1 hover:bg-purple-100 rounded-lg text-purple-600"
          title="Complete Consolidation"
        >
          <Package className="h-4 w-4" />
        </button>
      );
    }

    if (consolidation.status === 'consolidated') {
      buttons.push(
        <button
          key="ready"
          onClick={() => onReadyForDispatch(consolidation)}
          className="p-1 hover:bg-orange-100 rounded-lg text-orange-600"
          title="Ready for Dispatch"
        >
          <Send className="h-4 w-4" />
        </button>
      );
    }

    if (consolidation.status === 'ready_for_dispatch') {
      buttons.push(
        <button
          key="loaded"
          onClick={() => onLoadedClick(consolidation)}
          className="p-1 hover:bg-blue-100 rounded-lg text-blue-600"
          title="Mark as Loaded"
        >
          <Package className="h-4 w-4" />
        </button>
      );
    }

    if (consolidation.status === 'loaded') {
      buttons.push(
        <button
          key="dispatch"
          onClick={() => onDispatch(consolidation)}
          className="p-1 hover:bg-amber-100 rounded-lg text-amber-600"
          title="Dispatch Now"
        >
          <Send className="h-4 w-4" />
        </button>
      );
    }

    if (consolidation.status === 'in_transit') {
      buttons.push(
        <button
          key="arrived"
          onClick={() => onArrivedClick(consolidation)}
          className="p-1 hover:bg-green-100 rounded-lg text-green-600"
          title="Mark as Arrived"
        >
          <CheckCircle className="h-4 w-4" />
        </button>
      );
    }

    if (consolidation.status === 'arrived') {
      buttons.push(
        <button
          key="customs"
          onClick={() => onCustomsCleared(consolidation)}
          className="p-1 hover:bg-emerald-100 rounded-lg text-emerald-600"
          title="Mark Customs Cleared"
        >
          <Shield className="h-4 w-4" />
        </button>
      );
    }

    if (consolidation.status === 'customs_cleared') {
      buttons.push(
        <button
          key="outForDelivery"
          onClick={() => onOutForDelivery(consolidation)}
          className="p-1 hover:bg-blue-100 rounded-lg text-blue-600"
          title="Out for Delivery"
        >
          <Truck className="h-4 w-4" />
        </button>
      );
    }

    if (consolidation.status === 'out_for_delivery') {
      buttons.push(
        <button
          key="delivered"
          onClick={() => onDelivered(consolidation)}
          className="p-1 hover:bg-green-100 rounded-lg text-green-600"
          title="Mark as Delivered"
        >
          <CheckCircle className="h-4 w-4" />
        </button>
      );
    }

    if (consolidation.status === 'delivered') {
      buttons.push(
        <button
          key="complete"
          onClick={() => onComplete(consolidation)}
          className="p-1 hover:bg-emerald-100 rounded-lg text-emerald-600"
          title="Complete"
        >
          <Award className="h-4 w-4" />
        </button>
      );
    }

    // Delete only for draft/in_progress/cancelled
    if (consolidation.status === 'draft' || consolidation.status === 'in_progress' || consolidation.status === 'cancelled') {
      buttons.push(
        <button
          key="delete"
          onClick={() => onDelete(consolidation._id)}
          className="p-1 hover:bg-red-100 rounded-lg text-red-600"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      );
    }

    return buttons;
  };

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
                {getMainTypeName(mainType)}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500">Container</p>
                <p className="text-sm font-medium">{containerType}</p>
                <p className="text-xs text-gray-400">{consolidation.containerNumber || 'N/A'}</p>
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
          </div>
        </div>

        <div className="flex items-center space-x-1">
          {getActionButtons()}
        </div>
      </div>
    </div>
  );
};

// ==================== EDIT MODAL ====================

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
      <div className="bg-white rounded-xl max-w-lg w-full">
        <div className="p-6 border-b">
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

        <div className="p-6 border-t flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
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

// ==================== BULK ACTIONS BAR ====================

const BulkActionsBar = ({ selectedCount, onClear, onBulkAction }) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 flex items-center space-x-4 z-50">
      <span className="text-sm font-medium">
        {selectedCount} consolidation{selectedCount > 1 ? 's' : ''} selected
      </span>
      <div className="h-4 w-px bg-gray-200" />
      <button
        onClick={() => onBulkAction('ready')}
        className="px-3 py-1.5 text-sm bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100"
      >
        Mark Ready
      </button>
      <button
        onClick={() => onBulkAction('dispatch')}
        className="px-3 py-1.5 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100"
      >
        Dispatch
      </button>
      <button
        onClick={() => onBulkAction('delete')}
        className="px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
      >
        Delete
      </button>
      <div className="h-4 w-px bg-gray-200" />
      <button onClick={onClear} className="text-sm text-gray-500 hover:text-gray-700">
        Clear
      </button>
    </div>
  );
};

// ==================== EXPORT MODAL ====================

const ExportModal = ({ isOpen, onClose, onExport }) => {
  const [format, setFormat] = useState('csv');

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
        </div>

        <div className="p-6 border-t flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={() => onExport({ format })}
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
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showStartConsolidationModal, setShowStartConsolidationModal] = useState(false);
  const [showCompleteConsolidationModal, setShowCompleteConsolidationModal] = useState(false);
  const [showReadyForDispatchModal, setShowReadyForDispatchModal] = useState(false);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [showLoadedModal, setShowLoadedModal] = useState(false);
  const [showArrivedModal, setShowArrivedModal] = useState(false);
  const [showCustomsClearedModal, setShowCustomsClearedModal] = useState(false);
  const [showOutForDeliveryModal, setShowOutForDeliveryModal] = useState(false);
  const [showDeliveredModal, setShowDeliveredModal] = useState(false);
  const [showCompletedModal, setShowCompletedModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  
  // Load data
  useEffect(() => {
    loadConsolidations();
    loadStats();
  }, [filters]);

  const loadConsolidations = async () => {
    setLoading(true);
    try {
      const result = await getConsolidations(filters);
      if (result.success) {
        setConsolidations(result.data);
        setPagination(result.pagination);
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
      page: 1
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

  const handleViewDetails = (consolidation) => {
    setSelectedConsolidation(consolidation);
    setShowDetailsModal(true);
  };

  const handleEdit = (id) => {
    const consolidation = consolidations.find(c => c._id === id);
    setSelectedConsolidation(consolidation);
    setShowEditModal(true);
  };

  // Status progression handlers
  const handleStartConsolidation = (consolidation) => {
    setSelectedConsolidation(consolidation);
    setShowStartConsolidationModal(true);
  };

  const handleCompleteConsolidation = (consolidation) => {
    setSelectedConsolidation(consolidation);
    setShowCompleteConsolidationModal(true);
  };

  const handleReadyForDispatch = (consolidation) => {
    setSelectedConsolidation(consolidation);
    setShowReadyForDispatchModal(true);
  };

  const handleLoadedClick = (consolidation) => {
    setSelectedConsolidation(consolidation);
    setShowLoadedModal(true);
  };

  const handleDispatch = (consolidation) => {
    setSelectedConsolidation(consolidation);
    setShowDispatchModal(true);
  };

  const handleArrivedClick = (consolidation) => {
    setSelectedConsolidation(consolidation);
    setShowArrivedModal(true);
  };

  const handleCustomsCleared = (consolidation) => {
    setSelectedConsolidation(consolidation);
    setShowCustomsClearedModal(true);
  };

  const handleOutForDelivery = (consolidation) => {
    setSelectedConsolidation(consolidation);
    setShowOutForDeliveryModal(true);
  };

  const handleDelivered = (consolidation) => {
    setSelectedConsolidation(consolidation);
    setShowDeliveredModal(true);
  };

  const handleComplete = (consolidation) => {
    setSelectedConsolidation(consolidation);
    setShowCompletedModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this consolidation?')) return;
    
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

  const handleBulkAction = (action) => {
    if (selectedIds.length === 0) {
      toast.warning('No items selected');
      return;
    }

    switch (action) {
      case 'ready':
        toast.info(`Mark ${selectedIds.length} consolidations as ready for dispatch`);
        break;
      case 'dispatch':
        toast.info(`Dispatch ${selectedIds.length} consolidations`);
        break;
      case 'export':
        setShowExportModal(true);
        break;
      case 'delete':
        if (confirm(`Delete ${selectedIds.length} consolidations?`)) {
          toast.success('Bulk delete initiated');
        }
        break;
    }
  };

  const readyForDispatchCount = consolidations.filter(c => 
    c.status === 'consolidated'
  ).length;
  
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
            <p className="text-sm text-gray-500 mb-6">
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
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {consolidations.map(consolidation => (
                  <ConsolidationCard
                    key={consolidation._id}
                    consolidation={consolidation}
                    onView={handleViewDetails}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onStartConsolidation={handleStartConsolidation}
                    onCompleteConsolidation={handleCompleteConsolidation}
                    onReadyForDispatch={handleReadyForDispatch}
                    onLoadedClick={handleLoadedClick}
                    onDispatch={handleDispatch}
                    onArrivedClick={handleArrivedClick}
                    onCustomsCleared={handleCustomsCleared}
                    onOutForDelivery={handleOutForDelivery}
                    onDelivered={handleDelivered}
                    onComplete={handleComplete}
                  />
                ))}
              </div>
            )}

            {viewMode === 'list' && (
              <div className="space-y-3">
                {consolidations.map(consolidation => (
                  <ListItem
                    key={consolidation._id}
                    consolidation={consolidation}
                    onView={handleViewDetails}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onStartConsolidation={handleStartConsolidation}
                    onCompleteConsolidation={handleCompleteConsolidation}
                    onReadyForDispatch={handleReadyForDispatch}
                    onLoadedClick={handleLoadedClick}
                    onDispatch={handleDispatch}
                    onArrivedClick={handleArrivedClick}
                    onCustomsCleared={handleCustomsCleared}
                    onOutForDelivery={handleOutForDelivery}
                    onDelivered={handleDelivered}
                    onComplete={handleComplete}
                  />
                ))}
              </div>
            )}

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
                        onDelete={handleDelete}
                        onStartConsolidation={handleStartConsolidation}
                        onCompleteConsolidation={handleCompleteConsolidation}
                        onReadyForDispatch={handleReadyForDispatch}
                        onLoadedClick={handleLoadedClick}
                        onDispatch={handleDispatch}
                        onArrivedClick={handleArrivedClick}
                        onCustomsCleared={handleCustomsCleared}
                        onOutForDelivery={handleOutForDelivery}
                        onDelivered={handleDelivered}
                        onComplete={handleComplete}
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
      <ConsolidationDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedConsolidation(null);
        }}
        consolidation={selectedConsolidation}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onStartConsolidation={handleStartConsolidation}
        onCompleteConsolidation={handleCompleteConsolidation}
        onReadyForDispatch={handleReadyForDispatch}
        onLoadedClick={handleLoadedClick}
        onDispatch={handleDispatch}
        onArrivedClick={handleArrivedClick}
        onCustomsCleared={handleCustomsCleared}
        onOutForDelivery={handleOutForDelivery}
        onDelivered={handleDelivered}
        onComplete={handleComplete}
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

      <StartConsolidationModal
        isOpen={showStartConsolidationModal}
        onClose={() => {
          setShowStartConsolidationModal(false);
          setSelectedConsolidation(null);
        }}
        consolidation={selectedConsolidation}
        onSuccess={() => {
          loadConsolidations();
          loadStats();
        }}
      />

      <CompleteConsolidationModal
        isOpen={showCompleteConsolidationModal}
        onClose={() => {
          setShowCompleteConsolidationModal(false);
          setSelectedConsolidation(null);
        }}
        consolidation={selectedConsolidation}
        onSuccess={() => {
          loadConsolidations();
          loadStats();
        }}
      />

      <ReadyForDispatchModal
        isOpen={showReadyForDispatchModal}
        onClose={() => {
          setShowReadyForDispatchModal(false);
          setSelectedConsolidation(null);
        }}
        consolidation={selectedConsolidation}
        onSuccess={() => {
          loadConsolidations();
          loadStats();
        }}
      />

      <LoadedModal
        isOpen={showLoadedModal}
        onClose={() => {
          setShowLoadedModal(false);
          setSelectedConsolidation(null);
        }}
        consolidation={selectedConsolidation}
        onSuccess={() => {
          loadConsolidations();
          loadStats();
        }}
      />

      <DispatchModal
        isOpen={showDispatchModal}
        onClose={() => {
          setShowDispatchModal(false);
          setSelectedConsolidation(null);
        }}
        consolidation={selectedConsolidation}
        onSuccess={() => {
          loadConsolidations();
          loadStats();
        }}
      />

      <ArrivedModal
        isOpen={showArrivedModal}
        onClose={() => {
          setShowArrivedModal(false);
          setSelectedConsolidation(null);
        }}
        consolidation={selectedConsolidation}
        onSuccess={() => {
          loadConsolidations();
          loadStats();
        }}
      />

      <CustomsClearedModal
        isOpen={showCustomsClearedModal}
        onClose={() => {
          setShowCustomsClearedModal(false);
          setSelectedConsolidation(null);
        }}
        consolidation={selectedConsolidation}
        onSuccess={() => {
          loadConsolidations();
          loadStats();
        }}
      />

      <OutForDeliveryModal
        isOpen={showOutForDeliveryModal}
        onClose={() => {
          setShowOutForDeliveryModal(false);
          setSelectedConsolidation(null);
        }}
        consolidation={selectedConsolidation}
        onSuccess={() => {
          loadConsolidations();
          loadStats();
        }}
      />

      <DeliveredModal
        isOpen={showDeliveredModal}
        onClose={() => {
          setShowDeliveredModal(false);
          setSelectedConsolidation(null);
        }}
        consolidation={selectedConsolidation}
        onSuccess={() => {
          loadConsolidations();
          loadStats();
        }}
      />

      <CompletedModal
        isOpen={showCompletedModal}
        onClose={() => {
          setShowCompletedModal(false);
          setSelectedConsolidation(null);
        }}
        consolidation={selectedConsolidation}
        onSuccess={() => {
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

      <BulkActionsBar
        selectedCount={selectedIds.length}
        onClear={() => setSelectedIds([])}
        onBulkAction={handleBulkAction}
      />
    </div>
  );
}