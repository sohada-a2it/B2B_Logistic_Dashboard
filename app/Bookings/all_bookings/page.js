// app/bookings/page.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import {
  getBookings,
  updateBookingStatus,
  updateBooking, 
  cancelBooking,
  addBookingNote,
  assignBooking,
  bulkUpdateBookings,
  hardDeleteBooking, 
  getBookingStats,
  downloadBookingsAsCSV,
  getStatusColor,
  getStatusDisplayText,
  formatBookingDate,
  calculateProgressPercentage,
  canCancelBooking,
  canEditBooking,
  getShipmentTypeDisplay,
  formatCurrency,
  formatWeight,
  formatVolume,
  isActiveBooking
} from '@/Api/booking';

// Icons
import {
  Package, Search, Filter, ChevronDown, ChevronLeft, ChevronRight,
  Eye, Edit, Download, Plus, Calendar, MapPin, User,
  Truck, Ship, Plane, Clock, CheckCircle, XCircle,
  AlertCircle, RefreshCw, Loader2, MoreVertical,
  ArrowUpDown, Download as ExportIcon, Filter as FilterIcon,
  X, Globe, Hash, DollarSign,
  ChevronsLeft, ChevronsRight, Trash2, Check,
  Phone, Mail, BarChart3, Activity, FileText,
  Home, Briefcase, Tag, Calendar as CalendarIcon,
  Save, Printer, Share2, Link, Copy, Star,
  MessageSquare, Paperclip, Camera, Upload,
  Users, Box, Map, TrendingUp, PieChart,
  Sun, Moon, Settings, Bell, HelpCircle,
  Maximize2, Minimize2, Grid, List,
  AlertTriangle, Info, CheckCircle as CheckCircleSolid,
  XCircle as XCircleSolid, Clock as ClockSolid
} from 'lucide-react';

// ==================== COLOR CONSTANTS ====================
const COLORS = {
  primary: '#E67E22',
  secondary: '#3C719D',
  primaryLight: '#fef2e6',
  secondaryLight: '#e8edf3',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  purple: '#8b5cf6',
  pink: '#ec4899',
  indigo: '#6366f1'
};

// ==================== STATUS CONFIGURATION ====================
const STATUS_CONFIG = {
  booking_requested: {
    label: 'Booking Requested',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: Clock,
    progress: 10,
    editable: true,
    cancellable: true,
    nextStatus: ['booking_confirmed', 'cancelled']
  },
  booking_confirmed: {
    label: 'Booking Confirmed',
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    icon: CheckCircle,
    progress: 20,
    editable: true,
    cancellable: true,
    nextStatus: ['pickup_scheduled', 'cancelled']
  },
  pickup_scheduled: {
    label: 'Pickup Scheduled',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: Calendar,
    progress: 30,
    editable: true,
    cancellable: true,
    nextStatus: ['received_at_warehouse', 'cancelled']
  },
  received_at_warehouse: {
    label: 'Received at Warehouse',
    color: 'bg-orange-50 text-orange-700 border-orange-200',
    icon: Package,
    progress: 40,
    editable: true,
    cancellable: false,
    nextStatus: ['consolidation_in_progress']
  },
  consolidation_in_progress: {
    label: 'Consolidation in Progress',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Box,
    progress: 50,
    editable: false,
    cancellable: false,
    nextStatus: ['loaded_in_container', 'loaded_on_flight']
  },
  loaded_in_container: {
    label: 'Loaded in Container',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: Ship,
    progress: 60,
    editable: false,
    cancellable: false,
    nextStatus: ['loaded_on_flight']
  },
  loaded_on_flight: {
    label: 'Loaded on Flight',
    color: 'bg-sky-50 text-sky-700 border-sky-200',
    icon: Plane,
    progress: 60,
    editable: false,
    cancellable: false,
    nextStatus: ['in_transit']
  },
  in_transit: {
    label: 'In Transit',
    color: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    icon: Truck,
    progress: 70,
    editable: false,
    cancellable: false,
    nextStatus: ['arrived_at_destination']
  },
  arrived_at_destination: {
    label: 'Arrived at Destination',
    color: 'bg-teal-50 text-teal-700 border-teal-200',
    icon: MapPin,
    progress: 80,
    editable: false,
    cancellable: false,
    nextStatus: ['customs_clearance']
  },
  customs_clearance: {
    label: 'Customs Clearance',
    color: 'bg-lime-50 text-lime-700 border-lime-200',
    icon: FileText,
    progress: 85,
    editable: false,
    cancellable: false,
    nextStatus: ['out_for_delivery']
  },
  out_for_delivery: {
    label: 'Out for Delivery',
    color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    icon: Truck,
    progress: 90,
    editable: false,
    cancellable: false,
    nextStatus: ['delivered']
  },
  delivered: {
    label: 'Delivered',
    color: 'bg-green-50 text-green-700 border-green-200',
    icon: CheckCircleSolid,
    progress: 100,
    editable: false,
    cancellable: false,
    nextStatus: []
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-50 text-red-700 border-red-200',
    icon: XCircleSolid,
    progress: 0,
    editable: false,
    cancellable: false,
    nextStatus: []
  },
  returned: {
    label: 'Returned',
    color: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: AlertTriangle,
    progress: 0,
    editable: false,
    cancellable: false,
    nextStatus: []
  }
};

// ==================== SHIPMENT TYPE ICONS ====================
const SHIPMENT_TYPE_ICONS = {
  air_freight: Plane,
  sea_freight: Ship,
  road_freight: Truck,
  rail_freight: Package
};

const SHIPMENT_TYPE_COLORS = {
  air_freight: COLORS.primary,
  sea_freight: COLORS.secondary,
  road_freight: COLORS.success,
  rail_freight: COLORS.purple
};

// ==================== COMPONENTS ====================

// Button Component
const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  onClick,
  className = '',
  icon = null,
  iconPosition = 'left',
  fullWidth = false
}) => {
  const baseClasses = 'rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 inline-flex items-center justify-center';
  
  const variants = {
    primary: `bg-[${COLORS.primary}] text-white hover:bg-[#d35400] focus:ring-[${COLORS.primary}] shadow-sm`,
    secondary: `bg-[${COLORS.secondary}] text-white hover:bg-[#2c5a8c] focus:ring-[${COLORS.secondary}]`,
    outline: `border-2 border-[${COLORS.primary}] text-[${COLORS.primary}] hover:bg-[${COLORS.primaryLight}] focus:ring-[${COLORS.primary}]`,
    light: `bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500`,
    success: `bg-[${COLORS.success}] text-white hover:bg-[#0d9488] focus:ring-[${COLORS.success}]`,
    danger: `bg-[${COLORS.danger}] text-white hover:bg-[#dc2626] focus:ring-[${COLORS.danger}]`,
    warning: `bg-[${COLORS.warning}] text-white hover:bg-[#d97706] focus:ring-[${COLORS.warning}]`,
    ghost: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-500'
  };

  const sizes = {
    xs: 'px-2.5 py-1.5 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-base'
  };

  return (
    <button
      type={type}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className} ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''} ${fullWidth ? 'w-full' : ''}`}
      disabled={disabled || isLoading}
      onClick={onClick}
    >
      {isLoading ? (
        <div className="flex items-center">
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          <span>Loading...</span>
        </div>
      ) : (
        <div className="flex items-center">
          {icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
          {children}
          {icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
        </div>
      )}
    </button>
  );
};

// Input Component
const Input = ({
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  label,
  error,
  icon: Icon,
  required = false,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-4 w-4 text-gray-400" />
          </div>
        )}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-3 py-2 text-sm border rounded-lg shadow-sm
            focus:outline-none focus:ring-2 focus:ring-[${COLORS.primary}] focus:border-transparent
            ${Icon ? 'pl-10' : ''}
            ${error ? 'border-red-300' : 'border-gray-300'}
            ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

// Select Component
const Select = ({
  name,
  value,
  onChange,
  options,
  placeholder = 'Select option',
  label,
  error,
  icon: Icon,
  required = false,
  disabled = false,
  className = ''
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-4 w-4 text-gray-400" />
          </div>
        )}
        <select
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`
            w-full px-3 py-2 text-sm border rounded-lg shadow-sm appearance-none
            focus:outline-none focus:ring-2 focus:ring-[${COLORS.primary}] focus:border-transparent
            ${Icon ? 'pl-10' : 'pl-3'}
            pr-10
            ${error ? 'border-red-300' : 'border-gray-300'}
            ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}
            ${className}
          `}
        >
          <option value="">{placeholder}</option>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </div>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

// TextArea Component
const TextArea = ({
  name,
  value,
  onChange,
  placeholder,
  label,
  error,
  rows = 3,
  required = false,
  disabled = false,
  className = ''
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className={`
          w-full px-3 py-2 text-sm border rounded-lg shadow-sm
          focus:outline-none focus:ring-2 focus:ring-[${COLORS.primary}] focus:border-transparent
          ${error ? 'border-red-300' : 'border-gray-300'}
          ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}
          ${className}
        `}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ status, onClick, clickable = false, size = 'md' }) => {
  const config = STATUS_CONFIG[status] || {
    label: status,
    color: 'bg-gray-50 text-gray-700 border-gray-200',
    icon: Clock
  };
  
  const Icon = config.icon;
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  };

  return (
    <span 
      onClick={onClick}
      className={`inline-flex items-center rounded-full font-medium border ${config.color} ${sizes[size]} ${clickable ? 'cursor-pointer hover:opacity-80' : ''}`}
    >
      <Icon className={`${size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} mr-1`} />
      {config.label}
    </span>
  );
};

// Shipment Type Badge
const ShipmentTypeBadge = ({ type }) => {
  const Icon = SHIPMENT_TYPE_ICONS[type] || Package;
  const color = SHIPMENT_TYPE_COLORS[type] || COLORS.secondary;
  
  return (
    <span 
      className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium"
      style={{ backgroundColor: `${color}15`, color: color }}
    >
      <Icon className="h-3.5 w-3.5 mr-1" />
      {getShipmentTypeDisplay(type)}
    </span>
  );
};

// Action Menu Component
const ActionMenu = ({ booking, onAction }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = React.useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const actions = [
    { 
      label: 'View Details', 
      icon: Eye, 
      action: 'view', 
      color: 'text-blue-600',
      show: true
    },
    { 
      label: 'Edit Booking', 
      icon: Edit, 
      action: 'edit', 
      color: `text-[${COLORS.primary}]`,
      show: canEditBooking(booking.status)
    },
    { 
      label: 'Update Status', 
      icon: RefreshCw, 
      action: 'status', 
      color: 'text-purple-600',
      show: isActiveBooking(booking.status)
    },
    { 
      label: 'Add Note', 
      icon: MessageSquare, 
      action: 'note', 
      color: 'text-indigo-600',
      show: true
    },
    { 
      label: 'Assign Staff/Container', 
      icon: Users, 
      action: 'assign', 
      color: 'text-teal-600',
      show: isActiveBooking(booking.status)
    },
    { 
      label: 'Cancel Booking', 
      icon: XCircle, 
      action: 'cancel', 
      color: 'text-red-600',
      show: canCancelBooking(booking.status)
    },
    { 
      label: 'Delete', 
      icon: Trash2, 
      action: 'delete', 
      color: 'text-red-600',
      show: booking.status === 'booking_requested'
    },
    { 
      label: 'Download', 
      icon: Download, 
      action: 'download', 
      color: 'text-gray-600',
      show: true
    },
    { 
      label: 'Copy Tracking Link', 
      icon: Link, 
      action: 'share', 
      color: 'text-green-600',
      show: true
    }
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <MoreVertical className="h-4 w-4 text-gray-500" />
      </button>
      
      {showMenu && (
        <div className="absolute right-0 mt-1 w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-50 py-1">
          {actions.filter(a => a.show).map((action) => (
            <button
              key={action.action}
              onClick={() => {
                onAction(action.action, booking);
                setShowMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
            >
              <action.icon className={`h-4 w-4 mr-3 ${action.color}`} />
              <span className="text-gray-700">{action.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color, trend, onClick, active }) => {
  return (
    <div 
      onClick={onClick}
      className={`
        bg-white rounded-xl border shadow-sm p-4 cursor-pointer transition-all
        hover:shadow-md hover:border-[${COLORS.primary}]/30
        ${active ? `border-[${COLORS.primary}] ring-2 ring-[${COLORS.primary}]/20` : 'border-gray-200'}
      `}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 mb-1">{title}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className={`text-xs ${trend > 0 ? 'text-green-600' : 'text-red-600'} mt-1`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};

// Progress Bar Component
const ProgressBar = ({ progress, height = 'h-2', showLabel = false }) => {
  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-500">Progress</span>
          <span className="text-xs font-medium" style={{ color: COLORS.primary }}>{progress}%</span>
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full ${height}`}>
        <div 
          className="rounded-full transition-all duration-500"
          style={{ 
            width: `${progress}%`, 
            backgroundColor: progress === 100 ? COLORS.success : COLORS.primary,
            height: '100%'
          }}
        />
      </div>
    </div>
  );
};

// Modal Component
const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-6xl'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div className={`inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle ${sizes[size]} w-full`}>
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          <div className="px-6 py-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// Edit Booking Modal
const EditBookingModal = ({ isOpen, onClose, booking, onSave }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    origin: '',
    destination: '',
    shipmentType: '',
    totalCartons: '',
    totalWeight: '',
    totalVolume: '',
    quotedAmount: '',
    currency: 'USD',
    specialInstructions: '',
    estimatedDepartureDate: '',
    estimatedArrivalDate: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (booking) {
      setFormData({
        customerName: booking.customer?.companyName || booking.deliveryAddress?.consigneeName || '',
        customerEmail: booking.customer?.email || '',
        customerPhone: booking.customer?.phone || '',
        origin: booking.shipmentDetails?.origin || '',
        destination: booking.shipmentDetails?.destination || '',
        shipmentType: booking.shipmentDetails?.shipmentType || '',
        totalCartons: booking.shipmentDetails?.totalCartons || '',
        totalWeight: booking.shipmentDetails?.totalWeight || '',
        totalVolume: booking.shipmentDetails?.totalVolume || '',
        quotedAmount: booking.quotedAmount || '',
        currency: booking.currency || 'USD',
        specialInstructions: booking.specialInstructions || '',
        estimatedDepartureDate: booking.estimatedDepartureDate?.split('T')[0] || '',
        estimatedArrivalDate: booking.estimatedArrivalDate?.split('T')[0] || ''
      });
    }
  }, [booking]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(booking._id, formData);
      onClose();
      toast.success('Booking updated successfully!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      toast.error('Failed to update booking', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Booking" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Customer Name"
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            icon={User}
            required
          />
          <Input
            label="Customer Email"
            name="customerEmail"
            type="email"
            value={formData.customerEmail}
            onChange={handleChange}
            icon={Mail}
          />
          <Input
            label="Customer Phone"
            name="customerPhone"
            value={formData.customerPhone}
            onChange={handleChange}
            icon={Phone}
          />
          <Select
            label="Shipment Type"
            name="shipmentType"
            value={formData.shipmentType}
            onChange={handleChange}
            options={[
              { value: 'air_freight', label: 'Air Freight' },
              { value: 'sea_freight', label: 'Sea Freight' },
              { value: 'road_freight', label: 'Road Freight' },
              { value: 'rail_freight', label: 'Rail Freight' }
            ]}
            icon={Package}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Origin"
            name="origin"
            value={formData.origin}
            onChange={handleChange}
            icon={MapPin}
            required
          />
          <Input
            label="Destination"
            name="destination"
            value={formData.destination}
            onChange={handleChange}
            icon={Globe}
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Total Cartons"
            name="totalCartons"
            type="number"
            value={formData.totalCartons}
            onChange={handleChange}
            icon={Box}
          />
          <Input
            label="Total Weight (kg)"
            name="totalWeight"
            type="number"
            step="0.01"
            value={formData.totalWeight}
            onChange={handleChange}
            icon={Package}
          />
          <Input
            label="Total Volume (cbm)"
            name="totalVolume"
            type="number"
            step="0.001"
            value={formData.totalVolume}
            onChange={handleChange}
            icon={Box}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Quoted Amount"
            name="quotedAmount"
            type="number"
            step="0.01"
            value={formData.quotedAmount}
            onChange={handleChange}
            icon={DollarSign}
          />
          <Select
            label="Currency"
            name="currency"
            value={formData.currency}
            onChange={handleChange}
            options={[
              { value: 'USD', label: 'USD' },
              { value: 'EUR', label: 'EUR' },
              { value: 'GBP', label: 'GBP' },
              { value: 'BDT', label: 'BDT' }
            ]}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Est. Departure Date"
            name="estimatedDepartureDate"
            type="date"
            value={formData.estimatedDepartureDate}
            onChange={handleChange}
            icon={Calendar}
          />
          <Input
            label="Est. Arrival Date"
            name="estimatedArrivalDate"
            type="date"
            value={formData.estimatedArrivalDate}
            onChange={handleChange}
            icon={Calendar}
          />
        </div>

        <TextArea
          label="Special Instructions"
          name="specialInstructions"
          value={formData.specialInstructions}
          onChange={handleChange}
          rows={3}
        />

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={loading}
            icon={<Save className="h-4 w-4" />}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Status Update Modal
const StatusUpdateModal = ({ isOpen, onClose, booking, onUpdate }) => {
  const [status, setStatus] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const config = STATUS_CONFIG[booking?.status];
  const nextStatuses = config?.nextStatus || [];

  const statusOptions = nextStatuses.map(s => ({
    value: s,
    label: STATUS_CONFIG[s]?.label || s
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!status) {
      toast.warning('Please select a status', {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
    setLoading(true);
    try {
      await onUpdate(booking._id, status, reason);
      onClose();
      toast.success(`Status updated to ${STATUS_CONFIG[status]?.label} successfully!`, {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      toast.error('Failed to update status', {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Update Booking Status" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-700">
            Current Status: <span className="font-semibold">{STATUS_CONFIG[booking?.status]?.label}</span>
          </p>
        </div>

        <Select
          label="New Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={statusOptions}
          placeholder="Select new status"
          required
          icon={RefreshCw}
        />

        <TextArea
          label="Reason / Notes (Optional)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Add any notes about this status change..."
          rows={3}
        />

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={loading}
            icon={<Check className="h-4 w-4" />}
          >
            Update Status
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Add Note Modal
const AddNoteModal = ({ isOpen, onClose, booking, onAdd }) => {
  const [note, setNote] = useState('');
  const [type, setType] = useState('general');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!note.trim()) {
      toast.warning('Please enter a note', {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
    setLoading(true);
    try {
      await onAdd(booking._id, { note, type });
      onClose();
      toast.success('Note added successfully!', {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      toast.error('Failed to add note', {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Note" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Note Type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          options={[
            { value: 'general', label: 'General Note' },
            { value: 'customer', label: 'Customer Communication' },
            { value: 'internal', label: 'Internal Note' },
            { value: 'issue', label: 'Issue / Problem' },
            { value: 'update', label: 'Status Update' }
          ]}
          icon={MessageSquare}
        />

        <TextArea
          label="Note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Enter your note here..."
          rows={4}
          required
        />

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={loading}
            icon={<Save className="h-4 w-4" />}
          >
            Add Note
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Assign Modal
const AssignModal = ({ isOpen, onClose, booking, onAssign }) => {
  const [assignType, setAssignType] = useState('staff');
  const [assigneeId, setAssigneeId] = useState('');
  const [loading, setLoading] = useState(false);

  // Mock staff and container data - replace with actual API calls
  const staffOptions = [
    { value: 'staff1', label: 'John Doe - Operations' },
    { value: 'staff2', label: 'Jane Smith - Warehouse' },
    { value: 'staff3', label: 'Mike Johnson - Driver' }
  ];

  const containerOptions = [
    { value: 'cont1', label: 'Container #CONT001 - 40ft' },
    { value: 'cont2', label: 'Container #CONT002 - 20ft' },
    { value: 'cont3', label: 'Container #CONT003 - 40ft HC' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!assigneeId) {
      toast.warning(`Please select a ${assignType}`, {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
    setLoading(true);
    try {
      await onAssign(booking._id, {
        type: assignType,
        id: assigneeId
      });
      onClose();
      toast.success(`Booking assigned to ${assignType} successfully!`, {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      toast.error('Failed to assign booking', {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Booking" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="staff"
              checked={assignType === 'staff'}
              onChange={(e) => setAssignType(e.target.value)}
              className="mr-2"
            />
            <span>Assign to Staff</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="container"
              checked={assignType === 'container'}
              onChange={(e) => setAssignType(e.target.value)}
              className="mr-2"
            />
            <span>Assign to Container</span>
          </label>
        </div>

        <Select
          label={assignType === 'staff' ? 'Select Staff Member' : 'Select Container'}
          value={assigneeId}
          onChange={(e) => setAssigneeId(e.target.value)}
          options={assignType === 'staff' ? staffOptions : containerOptions}
          placeholder={`Select ${assignType}`}
          required
          icon={assignType === 'staff' ? Users : Box}
        />

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={loading}
            icon={<Check className="h-4 w-4" />}
          >
            Assign
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Cancel Booking Modal
const CancelModal = ({ isOpen, onClose, booking, onCancel }) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.warning('Please provide a cancellation reason', {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
    setLoading(true);
    try {
      await onCancel(booking._id, { reason });
      onClose();
      toast.success('Booking cancelled successfully!', {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      toast.error('Failed to cancel booking', {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cancel Booking" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">
                Are you sure you want to cancel this booking?
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                This action cannot be undone. The booking status will be changed to cancelled.
              </p>
            </div>
          </div>
        </div>

        <TextArea
          label="Cancellation Reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Please provide a reason for cancellation..."
          rows={3}
          required
        />

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
          >
            No, Keep Booking
          </Button>
          <Button
            type="submit"
            variant="danger"
            isLoading={loading}
            icon={<XCircle className="h-4 w-4" />}
          >
            Yes, Cancel Booking
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Delete Confirmation Modal
const DeleteModal = ({ isOpen, onClose, booking, onDelete }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onDelete(booking._id);
      onClose();
      toast.success('Booking deleted successfully!', {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      toast.error('Failed to delete booking', {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Booking" size="sm">
      <div className="space-y-4">
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">
                Are you sure you want to delete this booking?
              </p>
              <p className="text-xs text-red-700 mt-1">
                This action cannot be undone. All data associated with this booking will be permanently removed.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm font-medium">Booking: #{booking?.bookingNumber || booking?._id?.slice(-8).toUpperCase()}</p>
          <p className="text-xs text-gray-500 mt-1">Customer: {booking?.customer?.companyName || booking?.deliveryAddress?.consigneeName || 'N/A'}</p>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            isLoading={loading}
            onClick={handleDelete}
            icon={<Trash2 className="h-4 w-4" />}
          >
            Delete Permanently
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// Booking Details Modal
const BookingDetailsModal = ({ isOpen, onClose, booking }) => {
  if (!booking) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Booking Details" size="lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-semibold text-gray-900">
              #{booking.bookingNumber || booking._id.slice(-8).toUpperCase()}
            </h4>
            <p className="text-sm text-gray-500">
              Created on {formatBookingDate(booking.createdAt)}
            </p>
          </div>
          <StatusBadge status={booking.status} size="lg" />
        </div>

        {/* Progress */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <ProgressBar progress={calculateProgressPercentage(booking.status)} showLabel />
        </div>

        {/* Customer Info */}
        <div className="border rounded-lg p-4">
          <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <User className="h-4 w-4 mr-2" style={{ color: COLORS.primary }} />
            Customer Information
          </h5>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Company Name</p>
              <p className="text-sm font-medium">
                {booking.customer?.companyName || booking.deliveryAddress?.consigneeName || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Contact Person</p>
              <p className="text-sm font-medium">{booking.customer?.contactPerson || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="text-sm font-medium">{booking.customer?.email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Phone</p>
              <p className="text-sm font-medium">{booking.customer?.phone || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Shipment Details */}
        <div className="border rounded-lg p-4">
          <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <Package className="h-4 w-4 mr-2" style={{ color: COLORS.primary }} />
            Shipment Details
          </h5>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Shipment Type</p>
              <ShipmentTypeBadge type={booking.shipmentDetails?.shipmentType} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Tracking Number</p>
              <p className="text-sm font-medium">{booking.trackingNumber || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Origin</p>
              <p className="text-sm font-medium">{booking.shipmentDetails?.origin || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Destination</p>
              <p className="text-sm font-medium">{booking.shipmentDetails?.destination || 'N/A'}</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <p className="text-xs text-gray-500">Cartons</p>
              <p className="text-lg font-semibold" style={{ color: COLORS.primary }}>
                {booking.shipmentDetails?.totalCartons || 0}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <p className="text-xs text-gray-500">Weight (kg)</p>
              <p className="text-lg font-semibold" style={{ color: COLORS.secondary }}>
                {booking.shipmentDetails?.totalWeight?.toFixed(1) || 0}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <p className="text-xs text-gray-500">Volume (cbm)</p>
              <p className="text-lg font-semibold" style={{ color: COLORS.success }}>
                {booking.shipmentDetails?.totalVolume?.toFixed(2) || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="border rounded-lg p-4">
          <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <Calendar className="h-4 w-4 mr-2" style={{ color: COLORS.primary }} />
            Important Dates
          </h5>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Booking Date</p>
              <p className="text-sm font-medium">{formatBookingDate(booking.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Pickup Date</p>
              <p className="text-sm font-medium">
                {booking.pickupDate ? formatBookingDate(booking.pickupDate) : 'Not Scheduled'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Est. Departure</p>
              <p className="text-sm font-medium">
                {booking.estimatedDepartureDate ? formatBookingDate(booking.estimatedDepartureDate) : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Est. Arrival</p>
              <p className="text-sm font-medium">
                {booking.estimatedArrivalDate ? formatBookingDate(booking.estimatedArrivalDate) : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Financial */}
        {booking.quotedAmount && (
          <div className="border rounded-lg p-4">
            <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <DollarSign className="h-4 w-4 mr-2" style={{ color: COLORS.primary }} />
              Financial Information
            </h5>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Quoted Amount</p>
                <p className="text-lg font-semibold" style={{ color: COLORS.success }}>
                  {formatCurrency(booking.quotedAmount, booking.currency)}
                </p>
              </div>
              {booking.finalAmount && (
                <div>
                  <p className="text-xs text-gray-500">Final Amount</p>
                  <p className="text-lg font-semibold" style={{ color: COLORS.primary }}>
                    {formatCurrency(booking.finalAmount, booking.currency)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Special Instructions */}
        {booking.specialInstructions && (
          <div className="border rounded-lg p-4">
            <h5 className="text-sm font-medium text-gray-700 mb-2">Special Instructions</h5>
            <p className="text-sm text-gray-600">{booking.specialInstructions}</p>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <Button
            type="button"
            variant="primary"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// ==================== MAIN COMPONENT ====================
export default function BookingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 1
  });

  // Filter State
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: '',
    customer: '',
    origin: '',
    destination: '',
    shipmentType: '',
    startDate: '',
    endDate: '',
    search: ''
  });

  const [showFilters, setShowFilters] = useState(false);
  const [selectedBookings, setSelectedBookings] = useState([]);
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [activeStat, setActiveStat] = useState('all');

  // Modal States
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    booking_requested: 0,
    booking_confirmed: 0,
    pickup_scheduled: 0,
    received_at_warehouse: 0,
    consolidation_in_progress: 0,
    loaded_in_container: 0,
    loaded_on_flight: 0,
    in_transit: 0,
    arrived_at_destination: 0,
    customs_clearance: 0,
    out_for_delivery: 0,
    delivered: 0,
    cancelled: 0,
    returned: 0
  });

  // Options
  const statusOptions = Object.entries(STATUS_CONFIG).map(([value, config]) => ({
    value,
    label: config.label
  }));

  const shipmentTypeOptions = [
    { value: 'air_freight', label: 'Air Freight' },
    { value: 'sea_freight', label: 'Sea Freight' },
    { value: 'road_freight', label: 'Road Freight' },
    { value: 'rail_freight', label: 'Rail Freight' }
  ];

  // Fetch Bookings
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await getBookings();
      if (response.success) {
        setBookings(response.data);
        setFilteredBookings(response.data);
        setPagination(response.pagination);
        
        // Calculate stats
        const newStats = { ...stats };
        Object.keys(newStats).forEach(key => newStats[key] = 0);
        
        response.data.forEach(booking => {
          if (newStats.hasOwnProperty(booking.status)) {
            newStats[booking.status]++;
          }
          newStats.total++;
        });
        
        setStats(newStats);
      } else {
        toast.error('Failed to fetch bookings', {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to fetch bookings', {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...bookings];

    // Apply search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(booking => 
        booking.bookingNumber?.toLowerCase().includes(searchLower) ||
        booking.trackingNumber?.toLowerCase().includes(searchLower) ||
        booking.customer?.companyName?.toLowerCase().includes(searchLower) ||
        booking.customer?.contactPerson?.toLowerCase().includes(searchLower) ||
        booking.shipmentDetails?.origin?.toLowerCase().includes(searchLower) ||
        booking.shipmentDetails?.destination?.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(booking => booking.status === filters.status);
    } else if (activeStat !== 'all') {
      filtered = filtered.filter(booking => booking.status === activeStat);
    }

    // Apply shipment type filter
    if (filters.shipmentType) {
      filtered = filtered.filter(booking => booking.shipmentDetails?.shipmentType === filters.shipmentType);
    }

    // Apply origin filter
    if (filters.origin) {
      filtered = filtered.filter(booking => 
        booking.shipmentDetails?.origin?.toLowerCase().includes(filters.origin.toLowerCase())
      );
    }

    // Apply destination filter
    if (filters.destination) {
      filtered = filtered.filter(booking => 
        booking.shipmentDetails?.destination?.toLowerCase().includes(filters.destination.toLowerCase())
      );
    }

    // Apply date filters
    if (filters.startDate) {
      filtered = filtered.filter(booking => 
        new Date(booking.createdAt) >= new Date(filters.startDate)
      );
    }
    if (filters.endDate) {
      filtered = filtered.filter(booking => 
        new Date(booking.createdAt) <= new Date(filters.endDate)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === 'createdAt' || sortField === 'estimatedDepartureDate' || sortField === 'estimatedArrivalDate') {
        aValue = aValue ? new Date(aValue) : new Date(0);
        bValue = bValue ? new Date(bValue) : new Date(0);
      } else if (sortField === 'customer') {
        aValue = a.customer?.companyName || '';
        bValue = b.customer?.companyName || '';
      } else if (sortField === 'bookingNumber') {
        aValue = a.bookingNumber || '';
        bValue = b.bookingNumber || '';
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    // Apply pagination
    const start = (filters.page - 1) * filters.limit;
    const end = start + filters.limit;
    setFilteredBookings(filtered.slice(start, end));
    setPagination(prev => ({
      ...prev,
      total: filtered.length,
      pages: Math.ceil(filtered.length / filters.limit)
    }));
  }, [bookings, filters, sortField, sortOrder, activeStat]);

  // Handle Filter Change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
    if (name === 'status' && value) {
      setActiveStat('all');
    }
  };

  // Handle Search
  const handleSearch = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }));
  };

  // Handle Sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Clear Filters
  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      status: '',
      customer: '',
      origin: '',
      destination: '',
      shipmentType: '',
      startDate: '',
      endDate: '',
      search: ''
    });
    setSelectedBookings([]);
    setActiveStat('all');
    
    toast.info('Filters cleared', {
      position: "top-right",
      autoClose: 2000,
    });
  };

  // Handle Actions
  const handleAction = async (action, booking) => {
    setSelectedBooking(booking);
    
    switch (action) {
      case 'view':
        setShowDetailsModal(true);
        break;
      case 'edit':
        if (!canEditBooking(booking.status)) {
          toast.warning('This booking cannot be edited in its current status', {
            position: "top-right",
            autoClose: 3000,
          });
          return;
        }
        setShowEditModal(true);
        break;
      case 'status':
        setShowStatusModal(true);
        break;
      case 'note':
        setShowNoteModal(true);
        break;
      case 'assign':
        setShowAssignModal(true);
        break;
      case 'cancel':
        if (!canCancelBooking(booking.status)) {
          toast.warning('This booking cannot be cancelled in its current status', {
            position: "top-right",
            autoClose: 3000,
          });
          return;
        }
        setShowCancelModal(true);
        break;
      case 'delete':
        if (booking.status !== 'booking_requested') {
          toast.warning('Only requested bookings can be deleted', {
            position: "top-right",
            autoClose: 3000,
          });
          return;
        }
        setShowDeleteModal(true);
        break;
      case 'download':
        downloadBookingsAsCSV([booking], `booking-${booking.bookingNumber || booking._id}.csv`);
        toast.success('Booking downloaded successfully', {
          position: "top-right",
          autoClose: 3000,
        });
        break;
      case 'share':
        const trackingLink = `${window.location.origin}/bookings/track/${booking.trackingNumber || booking._id}`;
        navigator.clipboard.writeText(trackingLink);
        toast.success('Tracking link copied to clipboard!', {
          position: "top-right",
          autoClose: 3000,
        });
        break;
      default:
        break;
    }
  };

  // Handle Save Edit
  const handleSaveEdit = async (bookingId, formData) => {
    try {
      // Implement update booking API call
      await updateBooking(bookingId, formData);
      toast.success('Booking updated successfully!', {
        position: "top-right",
        autoClose: 3000,
      });
      fetchBookings();
    } catch (error) {
      toast.error('Failed to update booking', {
        position: "top-right",
        autoClose: 3000,
      });
      throw error;
    }
  };

  // Handle Status Update
  // app/bookings/page.jsx - Update the handleStatusUpdate function

// Handle Status Update
const handleStatusUpdate = async (bookingId, status, reason) => {
  try {
    // First, get the current booking to check its type
    const currentBooking = bookings.find(b => b._id === bookingId);
    
    // Prepare update data
    const updateData = { 
      status, 
      reason // Use 'reason' instead of 'statusUpdateReason' to match your API
    };
    
    // If updating to 'booking_confirmed' and no tracking number exists, request one from backend
    if (status === 'booking_confirmed' && !currentBooking.trackingNumber) {
      updateData.generateTrackingNumber = true; // Add flag for backend to generate tracking number
    }
    
    // Call your API
    await updateBookingStatus(bookingId, updateData);
    
    toast.success(`Status updated to ${STATUS_CONFIG[status]?.label} successfully!`, {
      position: "top-right",
      autoClose: 3000,
    });
    
    fetchBookings(); // Refresh the list
  } catch (error) {
    toast.error('Failed to update status', {
      position: "top-right",
      autoClose: 3000,
    });
    throw error;
  }
};

  // Handle Add Note
  const handleAddNote = async (bookingId, noteData) => {
    try {
      await addBookingNote(bookingId, noteData);
      toast.success('Note added successfully!', {
        position: "top-right",
        autoClose: 3000,
      });
      fetchBookings();
    } catch (error) {
      toast.error('Failed to add note', {
        position: "top-right",
        autoClose: 3000,
      });
      throw error;
    }
  };

  // Handle Assign
  const handleAssign = async (bookingId, assignmentData) => {
    try {
      await assignBooking(bookingId, assignmentData);
      toast.success('Booking assigned successfully!', {
        position: "top-right",
        autoClose: 3000,
      });
      fetchBookings();
    } catch (error) {
      toast.error('Failed to assign booking', {
        position: "top-right",
        autoClose: 3000,
      });
      throw error;
    }
  };

  // Handle Cancel
  const handleCancel = async (bookingId, cancelData) => {
    try {
      await cancelBooking(bookingId, cancelData);
      toast.success('Booking cancelled successfully!', {
        position: "top-right",
        autoClose: 3000,
      });
      fetchBookings();
    } catch (error) {
      toast.error('Failed to cancel booking', {
        position: "top-right",
        autoClose: 3000,
      });
      throw error;
    }
  };

  // Handle Delete
  const handleDelete = async (bookingId) => {
    try {
      await hardDeleteBooking(bookingId);
      toast.success('Booking deleted successfully!', {
        position: "top-right",
        autoClose: 3000,
      });
      fetchBookings();
    } catch (error) {
      toast.error('Failed to delete booking', {
        position: "top-right",
        autoClose: 3000,
      });
      throw error;
    }
  };

  // Handle Bulk Actions
  const handleBulkAction = async (action) => {
    if (selectedBookings.length === 0) {
      toast.warning('Please select bookings first', {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    const actionLabels = {
      accept: 'accept',
      cancel: 'cancel',
      delete: 'delete'
    };

    if (!window.confirm(`Are you sure you want to ${actionLabels[action]} ${selectedBookings.length} booking(s)?`)) {
      return;
    }

    try {
      await bulkUpdateBookings({
        bookingIds: selectedBookings,
        action: action
      });
      toast.success(`${selectedBookings.length} booking(s) ${action}ed successfully!`, {
        position: "top-right",
        autoClose: 3000,
      });
      setSelectedBookings([]);
      fetchBookings();
    } catch (error) {
      toast.error(`Failed to ${action} bookings`, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // Handle Export
  const handleExport = () => {
    if (bookings.length === 0) {
      toast.warning('No bookings to export', {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
    downloadBookingsAsCSV(bookings);
    toast.success(`${bookings.length} bookings exported successfully!`, {
      position: "top-right",
      autoClose: 3000,
    });
  };

  // Handle Select All
  const handleSelectAll = () => {
    if (selectedBookings.length === filteredBookings.length) {
      setSelectedBookings([]);
    } else {
      setSelectedBookings(filteredBookings.map(b => b._id));
    }
  };

  // Format Date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Filter by status
  const filterByStatus = (status) => {
    setActiveStat(status);
    setFilters(prev => ({ ...prev, page: 1, status: status === 'all' ? '' : status }));
  };

  // Get visible stats
  const visibleStats = [
    { key: 'all', label: 'All', count: stats.total, icon: Package, color: 'bg-gray-100 text-gray-600' },
    { key: 'booking_requested', label: 'Requested', count: stats.booking_requested, icon: Clock, color: 'bg-blue-100 text-blue-600' },
    { key: 'booking_confirmed', label: 'Confirmed', count: stats.booking_confirmed, icon: CheckCircle, color: 'bg-indigo-100 text-indigo-600' },
    { key: 'pickup_scheduled', label: 'Pickup', count: stats.pickup_scheduled, icon: Calendar, color: 'bg-purple-100 text-purple-600' },
    { key: 'in_transit', label: 'In Transit', count: stats.in_transit, icon: Truck, color: 'bg-cyan-100 text-cyan-600' },
    { key: 'delivered', label: 'Delivered', count: stats.delivered, icon: CheckCircleSolid, color: 'bg-green-100 text-green-600' },
    { key: 'cancelled', label: 'Cancelled', count: stats.cancelled, icon: XCircleSolid, color: 'bg-red-100 text-red-600' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b   shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: COLORS.primaryLight }}
                >
                  <Package className="h-4 w-4" style={{ color: COLORS.primary }} />
                </div>
                <h1 className="ml-2 text-lg font-semibold text-gray-900">Bookings Management</h1>
              </div>
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                {stats.total} Total
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="light"
                size="sm"
                onClick={handleExport}
                icon={<ExportIcon className="h-4 w-4" />}
              >
                Export
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => router.push('/bookings/new')}
                icon={<Plus className="h-4 w-4" />}
              >
                New Booking
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
          {visibleStats.map((stat) => (
            <StatCard
              key={stat.key}
              title={stat.label}
              value={stat.count}
              icon={stat.icon}
              color={stat.color}
              active={activeStat === stat.key}
              onClick={() => filterByStatus(stat.key)}
            />
          ))}
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
          <div className="p-4">
            <div className="flex items-center space-x-2">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Search by booking ID, customer, tracking number..."
                  value={filters.search}
                  onChange={handleSearch}
                  icon={Search}
                />
              </div>
              <Button
                variant={showFilters ? 'primary' : 'light'}
                size="md"
                onClick={() => setShowFilters(!showFilters)}
                icon={<FilterIcon className="h-4 w-4" />}
              >
                Filters
                {(filters.status || filters.shipmentType || filters.origin || filters.destination || filters.startDate || filters.endDate) && (
                  <span className="ml-2 bg-white text-[${COLORS.primary}] rounded-full px-2 py-0.5 text-xs">
                    {Object.values(filters).filter(v => v && v !== '' && v !== 10 && v !== 1).length}
                  </span>
                )}
              </Button>
              {(filters.search || filters.status || filters.shipmentType || filters.origin || filters.destination || filters.startDate || filters.endDate || activeStat !== 'all') && (
                <Button
                  variant="light"
                  size="md"
                  onClick={clearFilters}
                  icon={<X className="h-4 w-4" />}
                >
                  Clear
                </Button>
              )}
              <Button
                variant="light"
                size="md"
                onClick={fetchBookings}
                icon={<RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />}
              />
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-4 gap-4">
                <Select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  options={statusOptions}
                  placeholder="All Statuses"
                  label="Status"
                  icon={Activity}
                />
                
                <Select
                  name="shipmentType"
                  value={filters.shipmentType}
                  onChange={handleFilterChange}
                  options={shipmentTypeOptions}
                  placeholder="All Types"
                  label="Shipment Type"
                  icon={Package}
                />

                <Input
                  type="text"
                  name="origin"
                  value={filters.origin}
                  onChange={handleFilterChange}
                  placeholder="e.g., New York"
                  label="Origin"
                  icon={MapPin}
                />

                <Input
                  type="text"
                  name="destination"
                  value={filters.destination}
                  onChange={handleFilterChange}
                  placeholder="e.g., London"
                  label="Destination"
                  icon={Globe}
                />

                <Input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  label="From Date"
                  icon={Calendar}
                />

                <Input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  label="To Date"
                  icon={Calendar}
                />
              </div>
            )}
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedBookings.length > 0 && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl mb-4 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-sm font-medium text-indigo-700">
                  {selectedBookings.length} booking(s) selected
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  size="sm" 
                  variant="success" 
                  onClick={() => handleBulkAction('accept')}
                  icon={<Check className="h-4 w-4" />}
                >
                  Accept
                </Button>
                <Button 
                  size="sm" 
                  variant="warning" 
                  onClick={() => handleBulkAction('cancel')}
                  icon={<XCircle className="h-4 w-4" />}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  variant="danger" 
                  onClick={() => handleBulkAction('delete')}
                  icon={<Trash2 className="h-4 w-4" />}
                >
                  Delete
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => setSelectedBookings([])}
                  icon={<X className="h-4 w-4" />}
                />
              </div>
            </div>
          </div>
        )}

        {/* Bookings Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedBookings.length === filteredBookings.length && filteredBookings.length > 0}
                      onChange={handleSelectAll}
                      className="h-4 w-4 rounded border-gray-300 focus:ring-[${COLORS.primary}]"
                      style={{ accentColor: COLORS.primary }}
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div 
                      className="flex items-center cursor-pointer hover:text-gray-700"
                      onClick={() => handleSort('bookingNumber')}
                    >
                      Booking ID
                      <ArrowUpDown className="h-4 w-4 ml-1" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div 
                      className="flex items-center cursor-pointer hover:text-gray-700"
                      onClick={() => handleSort('customer')}
                    >
                      Customer
                      <ArrowUpDown className="h-4 w-4 ml-1" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div 
                      className="flex items-center cursor-pointer hover:text-gray-700"
                      onClick={() => handleSort('createdAt')}
                    >
                      Created
                      <ArrowUpDown className="h-4 w-4 ml-1" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cargo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="9" className="px-4 py-8 text-center">
                      <div className="flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin" style={{ color: COLORS.primary }} />
                        <span className="ml-2 text-sm text-gray-500">Loading bookings...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-4 py-8 text-center">
                      <div className="flex flex-col items-center">
                        <Package className="h-12 w-12 text-gray-400 mb-3" />
                        <p className="text-sm text-gray-500">No bookings found</p>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => router.push('/bookings/new')}
                          className="mt-3"
                          icon={<Plus className="h-4 w-4" />}
                        >
                          Create New Booking
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => {
                    const ShipmentIcon = SHIPMENT_TYPE_ICONS[booking.shipmentDetails?.shipmentType] || Package;
                    const progress = calculateProgressPercentage(booking.status);
                    
                    return (
                      <tr 
                        key={booking._id} 
                        className="hover:bg-gray-50 transition-colors group"
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedBookings.includes(booking._id)}
                            onChange={() => {
                              if (selectedBookings.includes(booking._id)) {
                                setSelectedBookings(selectedBookings.filter(id => id !== booking._id));
                              } else {
                                setSelectedBookings([...selectedBookings, booking._id]);
                              }
                            }}
                            className="h-4 w-4 rounded border-gray-300 focus:ring-[${COLORS.primary}]"
                            style={{ accentColor: COLORS.primary }}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <div 
                              className="text-sm font-medium cursor-pointer hover:underline"
                              style={{ color: COLORS.primary }}
                              onClick={() => {
                                setSelectedBooking(booking);
                                setShowDetailsModal(true);
                              }}
                            >
                              #{booking.bookingNumber || booking._id.slice(-8).toUpperCase()}
                            </div>
                            {booking.trackingNumber && (
                              <div className="text-xs text-gray-500 flex items-center mt-1">
                                <Hash className="h-3 w-3 mr-1" />
                                {booking.trackingNumber}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900">
                            {booking.customer?.companyName || booking.deliveryAddress?.consigneeName || 'N/A'}
                          </div>
                          {booking.customer?.contactPerson && (
                            <div className="text-xs text-gray-500">
                              {booking.customer.contactPerson}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center text-xs">
                            <span className="font-medium text-gray-900">{booking.shipmentDetails?.origin || 'N/A'}</span>
                            <ChevronRight className="h-3 w-3 mx-1 text-gray-400" />
                            <span className="font-medium text-gray-900">{booking.shipmentDetails?.destination || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <ShipmentIcon 
                              className="h-4 w-4 mr-1.5" 
                              style={{ color: SHIPMENT_TYPE_COLORS[booking.shipmentDetails?.shipmentType] || COLORS.secondary }}
                            />
                            <span className="text-xs text-gray-600">
                              {getShipmentTypeDisplay(booking.shipmentDetails?.shipmentType)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs text-gray-500">
                            {formatDate(booking.createdAt)}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs">
                            <div className="text-gray-900">
                              {booking.shipmentDetails?.totalCartons || 0} ctns
                            </div>
                            <div className="text-gray-500">
                              {formatWeight(booking.shipmentDetails?.totalWeight)}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-2">
                            <StatusBadge status={booking.status} size="sm" />
                            <ProgressBar progress={progress} height="h-1" />
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <ActionMenu booking={booking} onAction={handleAction} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="border-t px-4 py-3 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-xs text-gray-600">
                    Showing {(pagination.page - 1) * filters.limit + 1} to{' '}
                    {Math.min(pagination.page * filters.limit, pagination.total)} of{' '}
                    {pagination.total} results
                  </span>
                  <Select
                    name="limit"
                    value={filters.limit}
                    onChange={handleFilterChange}
                    options={[
                      { value: 10, label: '10 / page' },
                      { value: 25, label: '25 / page' },
                      { value: 50, label: '50 / page' },
                      { value: 100, label: '100 / page' }
                    ]}
                    className="w-24"
                  />
                </div>

                <div className="flex items-center space-x-1">
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => setFilters(prev => ({ ...prev, page: 1 }))}
                    disabled={filters.page === 1}
                    icon={<ChevronsLeft className="h-4 w-4" />}
                  />
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={filters.page === 1}
                    icon={<ChevronLeft className="h-4 w-4" />}
                  />
                  
                  <span className="text-sm text-gray-600 px-3">
                    Page {filters.page} of {pagination.pages}
                  </span>

                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={filters.page === pagination.pages}
                    icon={<ChevronRight className="h-4 w-4" />}
                  />
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => setFilters(prev => ({ ...prev, page: pagination.pages }))}
                    disabled={filters.page === pagination.pages}
                    icon={<ChevronsRight className="h-4 w-4" />}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <EditBookingModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        booking={selectedBooking}
        onSave={handleSaveEdit}
      />

      <StatusUpdateModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        booking={selectedBooking}
        onUpdate={handleStatusUpdate}
      />

      <AddNoteModal
        isOpen={showNoteModal}
        onClose={() => setShowNoteModal(false)}
        booking={selectedBooking}
        onAdd={handleAddNote}
      />

      <AssignModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        booking={selectedBooking}
        onAssign={handleAssign}
      />

      <CancelModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        booking={selectedBooking}
        onCancel={handleCancel}
      />

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        booking={selectedBooking}
        onDelete={handleDelete}
      />

      <BookingDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        booking={selectedBooking}
      />
    </div>
  );
}