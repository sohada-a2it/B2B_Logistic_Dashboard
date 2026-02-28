// components/bookings/allBookins.js
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import {
  getAllBookings,
  getBookingById,
  updatePriceQuote,
  acceptQuote,
  rejectQuote,
  cancelBooking,
  getMyBookings,
  getMyBookingById,
  getMyBookingTimeline,
  getMyBookingInvoices,
  getMyBookingQuote,
  getMyBookingsSummary,
  downloadBookingDocument,
  trackByNumber,
  getStatusColor,
  getPricingStatusColor,
  getStatusDisplayText,
  getPricingStatusDisplayText,
  getShipmentTypeDisplay,
  getOriginDisplay,
  getDestinationDisplay,
  getShippingModeDisplay,
  formatDate,
  formatCurrency,
  isQuoteValid,
  getQuoteDaysRemaining,
  canCancelBooking,
  canQuoteBooking,
  canRespondToQuote,
  calculateCargoTotals,
  formatCargoDetails,
  exportBookingsToCSV,
  useBooking,
  useCustomerBookings
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
  XCircle as XCircleSolid, Clock as ClockSolid,
  Receipt, FileSpreadsheet, CreditCard
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
    nextStatus: ['price_quoted', 'cancelled']
  },
  price_quoted: {
    label: 'Price Quoted',
    color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    icon: Tag,
    progress: 30,
    editable: true,
    cancellable: true,
    nextStatus: ['booking_confirmed', 'rejected', 'cancelled']
  },
  booking_confirmed: {
    label: 'Booking Confirmed',
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    icon: CheckCircle,
    progress: 40,
    editable: true,
    cancellable: true,
    nextStatus: ['pickup_scheduled', 'cancelled']
  },
  pickup_scheduled: {
    label: 'Pickup Scheduled',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: Calendar,
    progress: 50,
    editable: true,
    cancellable: true,
    nextStatus: ['received_at_warehouse', 'cancelled']
  },
  received_at_warehouse: {
    label: 'Received at Warehouse',
    color: 'bg-orange-50 text-orange-700 border-orange-200',
    icon: Package,
    progress: 60,
    editable: true,
    cancellable: false,
    nextStatus: ['consolidation_in_progress']
  },
  consolidation_in_progress: {
    label: 'Consolidation in Progress',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Box,
    progress: 70,
    editable: false,
    cancellable: false,
    nextStatus: ['loaded_in_container', 'loaded_on_flight']
  },
  loaded_in_container: {
    label: 'Loaded in Container',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: Ship,
    progress: 75,
    editable: false,
    cancellable: false,
    nextStatus: ['loaded_on_flight']
  },
  loaded_on_flight: {
    label: 'Loaded on Flight',
    color: 'bg-sky-50 text-sky-700 border-sky-200',
    icon: Plane,
    progress: 75,
    editable: false,
    cancellable: false,
    nextStatus: ['in_transit']
  },
  in_transit: {
    label: 'In Transit',
    color: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    icon: Truck,
    progress: 80,
    editable: false,
    cancellable: false,
    nextStatus: ['arrived_at_destination']
  },
  arrived_at_destination: {
    label: 'Arrived at Destination',
    color: 'bg-teal-50 text-teal-700 border-teal-200',
    icon: MapPin,
    progress: 85,
    editable: false,
    cancellable: false,
    nextStatus: ['customs_clearance']
  },
  customs_clearance: {
    label: 'Customs Clearance',
    color: 'bg-lime-50 text-lime-700 border-lime-200',
    icon: FileText,
    progress: 90,
    editable: false,
    cancellable: false,
    nextStatus: ['out_for_delivery']
  },
  out_for_delivery: {
    label: 'Out for Delivery',
    color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    icon: Truck,
    progress: 95,
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
  rejected: {
    label: 'Rejected',
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
  express_courier: Package
};

const SHIPMENT_TYPE_COLORS = {
  air_freight: COLORS.primary,
  sea_freight: COLORS.secondary,
  express_courier: COLORS.success
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
    label: getStatusDisplayText(status),
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

// Pricing Status Badge
const PricingStatusBadge = ({ status }) => {
  const colors = {
    pending: 'bg-gray-50 text-gray-700 border-gray-200',
    quoted: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    accepted: 'bg-green-50 text-green-700 border-green-200',
    rejected: 'bg-red-50 text-red-700 border-red-200',
    expired: 'bg-gray-50 text-gray-700 border-gray-200'
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium border ${colors[status] || colors.pending}`}>
      {getPricingStatusDisplayText(status)}
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

  if (!booking) return null;

  const quoteValid = booking.quotedPrice ? isQuoteValid(booking.quotedPrice) : false;

  const actions = [
    { 
      label: 'View Details', 
      icon: Eye, 
      action: 'view', 
      color: 'text-blue-600',
      show: true
    },
    { 
      label: 'View Timeline', 
      icon: Clock, 
      action: 'timeline', 
      color: 'text-purple-600',
      show: true
    },
    { 
      label: 'View Invoices', 
      icon: Receipt, 
      action: 'invoices', 
      color: 'text-green-600',
      show: true
    },
    { 
      label: 'View Quote', 
      icon: Tag, 
      action: 'quote', 
      color: 'text-orange-600',
      show: booking.pricingStatus === 'quoted' && booking.quotedPrice
    },
    { 
      label: 'Update Price Quote', 
      icon: DollarSign, 
      action: 'price-quote', 
      color: `text-[${COLORS.primary}]`,
      show: canQuoteBooking(booking.status, booking.pricingStatus)
    },
    { 
      label: 'Accept Quote', 
      icon: CheckCircle, 
      action: 'accept', 
      color: 'text-green-600',
      show: canRespondToQuote(booking.status, booking.pricingStatus, quoteValid) && booking.quotedPrice
    },
    { 
      label: 'Reject Quote', 
      icon: XCircle, 
      action: 'reject', 
      color: 'text-red-600',
      show: canRespondToQuote(booking.status, booking.pricingStatus, quoteValid) && booking.quotedPrice
    },
    { 
      label: 'Cancel Booking', 
      icon: XCircle, 
      action: 'cancel', 
      color: 'text-red-600',
      show: canCancelBooking(booking.status)
    },
    { 
      label: 'Download Documents', 
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
      show: !!booking.trackingNumber
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

// Price Quote Modal - Backend structure অনুযায়ী
const PriceQuoteModal = ({ isOpen, onClose, booking, onSave }) => {
    const [formData, setFormData] = useState({
        amount: '',
        currency: 'USD',
        validUntil: '',
        notes: '',
        breakdown: {
            freightCost: 0,
            handlingFee: 0,
            warehouseFee: 0,
            customsFee: 0,
            insurance: 0,
            otherCharges: 0
        }
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (booking) {
            // Set default valid until date (7 days from now)
            const defaultValidUntil = new Date();
            defaultValidUntil.setDate(defaultValidUntil.getDate() + 7);
            
            // Format as DD-MM-YYYY
            const day = String(defaultValidUntil.getDate()).padStart(2, '0');
            const month = String(defaultValidUntil.getMonth() + 1).padStart(2, '0');
            const year = defaultValidUntil.getFullYear();
            const formattedDate = `${day}-${month}-${year}`;
            
            setFormData({
                amount: booking.quotedPrice?.amount || '',
                currency: booking.quotedPrice?.currency || 'USD',
                validUntil: booking.quotedPrice?.validUntil 
                    ? formatDateForInput(booking.quotedPrice.validUntil)
                    : formattedDate,
                notes: booking.quotedPrice?.notes || '',
                breakdown: booking.quotedPrice?.breakdown || {
                    freightCost: 0,
                    handlingFee: 0,
                    warehouseFee: 0,
                    customsFee: 0,
                    insurance: 0,
                    otherCharges: 0
                }
            });
        }
    }, [booking]);

    // Helper function to format date for input
    const formatDateForInput = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    // Parse DD-MM-YYYY to ISO string for backend
    const parseDateToISO = (dateString) => {
        const [day, month, year] = dateString.split('-');
        return new Date(`${year}-${month}-${day}`).toISOString();
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleBreakdownChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            breakdown: {
                ...prev.breakdown,
                [field]: parseFloat(value) || 0
            }
        }));
    };

    // In your frontend PriceQuoteModal handleSubmit function
const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.validUntil) {
        toast.warning('Please fill in all required fields');
        return;
    }

    setLoading(true);
    try {
        // Parse date from DD-MM-YYYY format
        const [day, month, year] = formData.validUntil.split('-');
        const validUntilDate = new Date(`${year}-${month}-${day}`);
        
        const quoteData = {
            amount: parseFloat(formData.amount),
            currency: formData.currency,
            validUntil: validUntilDate.toISOString(),
            notes: formData.notes,
            breakdown: {
                freightCost: parseFloat(formData.freightCost) || 0,
                handlingFee: parseFloat(formData.handlingFee) || 0,
                warehouseFee: parseFloat(formData.warehouseFee) || 0,
                customsFee: parseFloat(formData.customsFee) || 0,
                insurance: parseFloat(formData.insurance) || 0,
                otherCharges: parseFloat(formData.otherCharges) || 0
            }
        };
        
        await onSave(booking._id, quoteData);
        onClose();
        toast.success('Price quote updated successfully!');
    } catch (error) {
        toast.error(error.message || 'Failed to update price quote');
    } finally {
        setLoading(false);
    }
};

    if (!isOpen || !booking) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Update Price Quote" size="lg">
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Amount and Currency row */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Amount <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center space-x-2">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500">$</span>
                            </div>
                            <input
                                type="number"
                                name="amount"
                                value={formData.amount}
                                onChange={handleChange}
                                step="0.01"
                                min="0"
                                className="w-full pl-8 pr-3 py-2 text-sm border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E67E22] focus:border-transparent"
                                placeholder="0.00"
                                required
                            />
                        </div>
                        <select
                            name="currency"
                            value={formData.currency}
                            onChange={handleChange}
                            className="w-24 px-3 py-2 text-sm border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E67E22] focus:border-transparent bg-white"
                        >
                            <option value="USD">USD</option>
                            <option value="GBP">GBP</option>
                            <option value="CAD">CAD</option>
                            <option value="THB">THB</option>
                            <option value="CNY">CNY</option>
                        </select>
                    </div>
                </div>

                {/* Valid Until - DD-MM-YYYY format */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Valid Until <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="validUntil"
                        value={formData.validUntil}
                        onChange={handleChange}
                        placeholder="DD-MM-YYYY"
                        pattern="\d{2}-\d{2}-\d{4}"
                        className="w-full px-3 py-2 text-sm border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E67E22] focus:border-transparent"
                        required
                    />
                    <p className="text-xs text-gray-500 mt-1">Format: DD-MM-YYYY (e.g., 07-03-2026)</p>
                </div>

                {/* Price Breakdown Section - Optional but good to have */}
                <div className="border rounded-lg p-4 bg-gray-50">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Price Breakdown (Optional)</h4>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Freight Cost</label>
                            <input
                                type="number"
                                value={formData.breakdown.freightCost}
                                onChange={(e) => handleBreakdownChange('freightCost', e.target.value)}
                                className="w-full px-3 py-1 text-sm border rounded-lg"
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Handling Fee</label>
                            <input
                                type="number"
                                value={formData.breakdown.handlingFee}
                                onChange={(e) => handleBreakdownChange('handlingFee', e.target.value)}
                                className="w-full px-3 py-1 text-sm border rounded-lg"
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Warehouse Fee</label>
                            <input
                                type="number"
                                value={formData.breakdown.warehouseFee}
                                onChange={(e) => handleBreakdownChange('warehouseFee', e.target.value)}
                                className="w-full px-3 py-1 text-sm border rounded-lg"
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Customs Fee</label>
                            <input
                                type="number"
                                value={formData.breakdown.customsFee}
                                onChange={(e) => handleBreakdownChange('customsFee', e.target.value)}
                                className="w-full px-3 py-1 text-sm border rounded-lg"
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Insurance</label>
                            <input
                                type="number"
                                value={formData.breakdown.insurance}
                                onChange={(e) => handleBreakdownChange('insurance', e.target.value)}
                                className="w-full px-3 py-1 text-sm border rounded-lg"
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Other Charges</label>
                            <input
                                type="number"
                                value={formData.breakdown.otherCharges}
                                onChange={(e) => handleBreakdownChange('otherCharges', e.target.value)}
                                className="w-full px-3 py-1 text-sm border rounded-lg"
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                </div>

                {/* Notes */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes (Optional)
                    </label>
                    <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Add any notes about this quote..."
                        className="w-full px-3 py-2 text-sm border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E67E22] focus:border-transparent"
                    />
                </div>

                {/* Action buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-white bg-[#E67E22] rounded-lg hover:bg-[#d35400] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E67E22] disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            'Save Quote'
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

// Accept/Reject Quote Modal - FIXED VERSION with null checks 
const QuoteResponseModal = ({ isOpen, onClose, booking, type, onRespond }) => {
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen || !booking) return null;

    // Safely access quote data
    const quoteAmount = booking.quotedPrice?.amount;
    const quoteCurrency = booking.quotedPrice?.currency || 'USD';
    const quoteValidUntil = booking.quotedPrice?.validUntil;

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // For reject, reason is required
        if (type === 'reject' && !notes.trim()) {
            toast.warning('Please provide a reason for rejection');
            return;
        }
        
        setLoading(true);
        try {
            // Backend expects just the reason/notes
            await onRespond(booking._id, notes);
            onClose();
        } catch (error) {
            toast.error(error.message || `Failed to ${type} quote`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={type === 'accept' ? 'Accept Quote' : 'Reject Quote'} size="md">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className={`p-4 rounded-lg ${type === 'accept' ? 'bg-green-50' : 'bg-red-50'}`}>
                    <div className="flex items-start">
                        {type === 'accept' ? (
                            <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                        ) : (
                            <AlertTriangle className="h-5 w-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
                        )}
                        <div>
                            <p className={`text-sm font-medium ${type === 'accept' ? 'text-green-800' : 'text-red-800'}`}>
                                {type === 'accept' 
                                    ? 'Are you sure you want to accept this quote?' 
                                    : 'Are you sure you want to reject this quote?'}
                            </p>
                            {quoteAmount && (
                                <p className="text-xs text-gray-600 mt-1">
                                    Amount: {formatCurrency(quoteAmount, quoteCurrency)}
                                    {quoteValidUntil && ` • Valid until: ${formatDate(quoteValidUntil)}`}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <TextArea
                    label={type === 'accept' ? 'Notes (Optional)' : 'Reason for rejection'}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={type === 'accept' ? 'Add any notes...' : 'Please provide a reason for rejection...'}
                    rows={3}
                    required={type === 'reject'}
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
                        variant={type === 'accept' ? 'success' : 'danger'}
                        isLoading={loading}
                        icon={type === 'accept' ? <Check className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                    >
                        {type === 'accept' ? 'Yes, Accept' : 'Yes, Reject'}
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

  if (!isOpen || !booking) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.warning('Please provide a cancellation reason');
      return;
    }
    setLoading(true);
    try {
      await onCancel(booking._id, reason);
      onClose();
    } catch (error) {
      // Error handled in parent
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

// Booking Details Modal
const BookingDetailsModal = ({ isOpen, onClose, booking }) => {
  const [activeTab, setActiveTab] = useState('details');
  
  if (!isOpen || !booking) return null;

  const cargoTotals = calculateCargoTotals(booking.cargoDetails);
  const quoteValid = booking.quotedPrice ? isQuoteValid(booking.quotedPrice) : false;
  const daysRemaining = booking.quotedPrice ? getQuoteDaysRemaining(booking.quotedPrice.validUntil) : 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Booking Details" size="xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-semibold text-gray-900">
              #{booking.bookingNumber || booking._id?.slice(-8).toUpperCase()}
            </h4>
            <p className="text-sm text-gray-500">
              Created on {formatDate(booking.createdAt)}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <StatusBadge status={booking.status} size="lg" />
            <PricingStatusBadge status={booking.pricingStatus} />
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-4">
            {[
              { id: 'details', label: 'Details', icon: Package },
              { id: 'cargo', label: 'Cargo', icon: Box },
              { id: 'pricing', label: 'Pricing', icon: DollarSign },
              { id: 'tracking', label: 'Tracking', icon: Hash }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors flex items-center ${
                  activeTab === tab.id
                    ? `border-[${COLORS.primary}] text-[${COLORS.primary}]`
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-[300px]">
          {activeTab === 'details' && (
            <div className="space-y-4">
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
                      {booking.customer?.companyName || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Contact Person</p>
                    <p className="text-sm font-medium">
                      {booking.customer?.firstName} {booking.customer?.lastName}
                    </p>
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
                    <p className="text-xs text-gray-500">Shipping Mode</p>
                    <p className="text-sm font-medium">{getShippingModeDisplay(booking.shipmentDetails?.shippingMode)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Origin</p>
                    <p className="text-sm font-medium">{getOriginDisplay(booking.shipmentDetails?.origin)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Destination</p>
                    <p className="text-sm font-medium">{getDestinationDisplay(booking.shipmentDetails?.destination)}</p>
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
                    <p className="text-sm font-medium">{formatDate(booking.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Confirmed Date</p>
                    <p className="text-sm font-medium">{booking.confirmedAt ? formatDate(booking.confirmedAt) : 'Not Confirmed'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Est. Departure</p>
                    <p className="text-sm font-medium">
                      {booking.estimatedDepartureDate ? formatDate(booking.estimatedDepartureDate) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Est. Arrival</p>
                    <p className="text-sm font-medium">
                      {booking.estimatedArrivalDate ? formatDate(booking.estimatedArrivalDate) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cargo' && (
            <div className="space-y-4">
              {/* Cargo Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-xs text-gray-500">Total Cartons</p>
                  <p className="text-2xl font-semibold" style={{ color: COLORS.primary }}>
                    {cargoTotals.totalCartons}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-xs text-gray-500">Total Weight (kg)</p>
                  <p className="text-2xl font-semibold" style={{ color: COLORS.secondary }}>
                    {cargoTotals.totalWeight.toFixed(1)}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-xs text-gray-500">Total Volume (cbm)</p>
                  <p className="text-2xl font-semibold" style={{ color: COLORS.success }}>
                    {cargoTotals.totalVolume.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Cargo Details Table */}
              {booking.cargoDetails && booking.cargoDetails.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Description</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Cartons</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Weight/Unit</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Volume/Unit</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Total Weight</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Total Volume</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {booking.cargoDetails.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm">{item.description}</td>
                          <td className="px-4 py-2 text-sm">{item.cartons}</td>
                          <td className="px-4 py-2 text-sm">{item.weight} kg</td>
                          <td className="px-4 py-2 text-sm">{item.volume} cbm</td>
                          <td className="px-4 py-2 text-sm">{(item.weight * item.cartons).toFixed(1)} kg</td>
                          <td className="px-4 py-2 text-sm">{(item.volume * item.cartons).toFixed(2)} cbm</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No cargo details available</p>
              )}
            </div>
          )}

          {activeTab === 'pricing' && (
            <div className="space-y-4">
              {booking.quotedPrice ? (
                <>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-green-600 mb-1">Quoted Amount</p>
                        <p className="text-2xl font-bold" style={{ color: COLORS.success }}>
                          {formatCurrency(booking.quotedPrice.amount, booking.quotedPrice.currency)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-green-600 mb-1">Valid Until</p>
                        <p className="text-sm font-medium">{formatDate(booking.quotedPrice.validUntil)}</p>
                        {booking.quotedPrice.validUntil && (
                          <p className="text-xs text-green-600 mt-1">
                            {quoteValid 
                              ? `${daysRemaining} days remaining` 
                              : 'Quote expired'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {booking.finalAmount && (
                    <div className="border rounded-lg p-4">
                      <p className="text-xs text-gray-500 mb-1">Final Amount</p>
                      <p className="text-lg font-semibold" style={{ color: COLORS.primary }}>
                        {formatCurrency(booking.finalAmount, booking.currency)}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No price quote available</p>
              )}
            </div>
          )}

          {activeTab === 'tracking' && (
            <div className="space-y-4">
              {booking.trackingNumber ? (
                <>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-xs text-blue-600 mb-1">Tracking Number</p>
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-semibold text-blue-700">{booking.trackingNumber}</p>
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => {
                          navigator.clipboard.writeText(booking.trackingNumber);
                          toast.success('Tracking number copied!');
                        }}
                        icon={<Copy className="h-3 w-3" />}
                      >
                        Copy
                      </Button>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-2">Public Tracking Link</p>
                    <div className="flex items-center space-x-2">
                      <Input
                        value={`${window.location.origin}/track/${booking.trackingNumber}`}
                        readOnly
                        className="text-sm"
                      />
                      <Button
                        size="sm"
                        variant="light"
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/track/${booking.trackingNumber}`);
                          toast.success('Tracking link copied!');
                        }}
                        icon={<Copy className="h-4 w-4" />}
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No tracking number assigned yet</p>
              )}
            </div>
          )}
        </div>

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

// Timeline Modal
const TimelineModal = ({ isOpen, onClose, bookingId }) => {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && bookingId) {
      fetchTimeline();
    }
  }, [isOpen, bookingId]);

  const fetchTimeline = async () => {
    setLoading(true);
    try {
      const result = await getMyBookingTimeline(bookingId);
      if (result.success) {
        setTimeline(result.data || []);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to fetch timeline');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Booking Timeline" size="lg">
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: COLORS.primary }} />
          <span className="ml-2 text-sm text-gray-500">Loading timeline...</span>
        </div>
      ) : timeline.length > 0 ? (
        <div className="space-y-4">
          {timeline.map((event, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  event.type === 'status' ? 'bg-blue-100' :
                  event.type === 'note' ? 'bg-purple-100' :
                  event.type === 'document' ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  {event.type === 'status' && <Activity className="h-4 w-4 text-blue-600" />}
                  {event.type === 'note' && <MessageSquare className="h-4 w-4 text-purple-600" />}
                  {event.type === 'document' && <FileText className="h-4 w-4 text-green-600" />}
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{event.title}</p>
                <p className="text-xs text-gray-500">{event.description}</p>
                <p className="text-xs text-gray-400 mt-1">{formatDate(event.createdAt, 'long')}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 text-center py-4">No timeline events found</p>
      )}
    </Modal>
  );
};

// Invoices Modal
const InvoicesModal = ({ isOpen, onClose, bookingId }) => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && bookingId) {
      fetchInvoices();
    }
  }, [isOpen, bookingId]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const result = await getMyBookingInvoices(bookingId);
      if (result.success) {
        setInvoices(result.data || []);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (documentId) => {
    try {
      await downloadBookingDocument(bookingId, documentId);
      toast.success('Document downloaded successfully');
    } catch (error) {
      toast.error('Failed to download document');
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invoices & Documents" size="lg">
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: COLORS.primary }} />
          <span className="ml-2 text-sm text-gray-500">Loading invoices...</span>
        </div>
      ) : invoices.length > 0 ? (
        <div className="space-y-3">
          {invoices.map((invoice) => (
            <div key={invoice._id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{invoice.title}</p>
                    <p className="text-xs text-gray-500">
                      {invoice.type} • {formatDate(invoice.createdAt)}
                    </p>
                  </div>
                </div>
                <Button
                  size="xs"
                  variant="light"
                  onClick={() => handleDownload(invoice._id)}
                  icon={<Download className="h-3 w-3" />}
                >
                  Download
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 text-center py-4">No invoices found</p>
      )}
    </Modal>
  );
};

// Quote Details Modal
const QuoteDetailsModal = ({ isOpen, onClose, bookingId }) => {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && bookingId) {
      fetchQuote();
    }
  }, [isOpen, bookingId]);

  const fetchQuote = async () => {
    setLoading(true);
    try {
      const result = await getMyBookingQuote(bookingId);
      if (result.success) {
        setQuote(result.data);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to fetch quote details');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Quote Details" size="md">
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: COLORS.primary }} />
          <span className="ml-2 text-sm text-gray-500">Loading quote...</span>
        </div>
      ) : quote ? (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <p className="text-xs text-green-600 mb-1">Quote Amount</p>
            <p className="text-3xl font-bold" style={{ color: COLORS.success }}>
              {formatCurrency(quote.amount, quote.currency)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="border rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Valid Until</p>
              <p className="text-sm font-medium">{formatDate(quote.validUntil)}</p>
            </div>
            <div className="border rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Status</p>
              <PricingStatusBadge status={quote.status} />
            </div>
          </div>

          {quote.notes && (
            <div className="border rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Notes</p>
              <p className="text-sm">{quote.notes}</p>
            </div>
          )}

          {quote.items && quote.items.length > 0 && (
            <div className="border rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-2">Quote Items</p>
              <div className="space-y-2">
                {quote.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.description}</span>
                    <span className="font-medium">{formatCurrency(item.amount, quote.currency)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-gray-500 text-center py-4">No quote details found</p>
      )}
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
    limit: 20,
    pages: 1
  });

  // Filter State
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    status: '',
    search: '',
    startDate: '',
    endDate: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const [showFilters, setShowFilters] = useState(false);
  const [selectedBookings, setSelectedBookings] = useState([]);
  const [activeStat, setActiveStat] = useState('all');

  // Modal States
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showPriceQuoteModal, setShowPriceQuoteModal] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [showInvoicesModal, setShowInvoicesModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    booking_requested: 0,
    price_quoted: 0,
    booking_confirmed: 0,
    cancelled: 0,
    rejected: 0,
    delivered: 0
  });

  // Options
  const statusOptions = Object.entries(STATUS_CONFIG).map(([value, config]) => ({
    value,
    label: config.label
  }));

  // Fetch Bookings
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await getAllBookings(filters);
      if (response.success) {
        setBookings(response.data || []);
        setFilteredBookings(response.data || []);
        setPagination(response.pagination || {
          total: 0,
          page: 1,
          limit: 20,
          pages: 1
        });
        
        // Calculate stats
        const newStats = {
          total: response.data?.length || 0,
          booking_requested: 0,
          price_quoted: 0,
          booking_confirmed: 0,
          cancelled: 0,
          rejected: 0,
          delivered: 0
        };
        
        if (response.data && response.data.length > 0) {
          response.data.forEach(booking => {
            if (newStats.hasOwnProperty(booking.status)) {
              newStats[booking.status]++;
            }
          });
        }
        
        setStats(newStats);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [filters.page, filters.limit, filters.sortBy, filters.sortOrder]);

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
    const sortOrder = filters.sortBy === field && filters.sortOrder === 'asc' ? 'desc' : 'asc';
    setFilters(prev => ({ ...prev, sortBy: field, sortOrder }));
  };

  // Clear Filters
  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
      status: '',
      search: '',
      startDate: '',
      endDate: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setSelectedBookings([]);
    setActiveStat('all');
    toast.info('Filters cleared');
  };

  // Handle Actions
  const handleAction = async (action, booking) => {
    setSelectedBooking(booking);
    
    switch (action) {
      case 'view':
        setShowDetailsModal(true);
        break;
      case 'timeline':
        setShowTimelineModal(true);
        break;
      case 'invoices':
        setShowInvoicesModal(true);
        break;
      case 'quote':
        setShowQuoteModal(true);
        break;
      case 'price-quote':
        setShowPriceQuoteModal(true);
        break;
      case 'accept':
        setShowAcceptModal(true);
        break;
      case 'reject':
        setShowRejectModal(true);
        break;
      case 'cancel':
        setShowCancelModal(true);
        break;
      case 'download':
        try {
          // Download all documents for this booking
          if (booking.documents && booking.documents.length > 0) {
            for (const doc of booking.documents) {
              await downloadBookingDocument(booking._id, doc._id);
            }
            toast.success('Documents downloaded successfully');
          } else {
            toast.info('No documents to download');
          }
        } catch (error) {
          toast.error('Failed to download documents');
        }
        break;
      case 'share':
        if (booking.trackingNumber) {
          const trackingLink = `${window.location.origin}/track/${booking.trackingNumber}`;
          navigator.clipboard.writeText(trackingLink);
          toast.success('Tracking link copied to clipboard!');
        } else {
          toast.warning('No tracking number available');
        }
        break;
      default:
        break;
    }
  };

  // Handle Save Price Quote
  const handleSavePriceQuote = async (bookingId, quoteData) => {
    try {
      const result = await updatePriceQuote(bookingId, quoteData);
      if (result.success) {
        toast.success('Price quote updated successfully!');
        fetchBookings();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to update price quote');
    }
  };

  // Handle Accept Quote
  const handleAcceptQuote = async (bookingId, notes) => {
    try {
      const result = await acceptQuote(bookingId, notes);
      if (result.success) {
        toast.success('Quote accepted successfully!');
        fetchBookings();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to accept quote');
    }
  };

  // Handle Reject Quote
  const handleRejectQuote = async (bookingId, reason) => {
    try {
      const result = await rejectQuote(bookingId, reason);
      if (result.success) {
        toast.success('Quote rejected successfully!');
        fetchBookings();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to reject quote');
    }
  };

  // Handle Cancel Booking
  const handleCancelBooking = async (bookingId, reason) => {
    try {
      const result = await cancelBooking(bookingId, reason);
      if (result.success) {
        toast.success('Booking cancelled successfully!');
        fetchBookings();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to cancel booking');
    }
  };

  // Handle Export
  const handleExport = () => {
    if (bookings.length === 0) {
      toast.warning('No bookings to export');
      return;
    }
    exportBookingsToCSV(bookings);
    toast.success(`${bookings.length} bookings exported successfully!`);
  };

  // Handle Select All
  const handleSelectAll = () => {
    if (selectedBookings.length === filteredBookings.length) {
      setSelectedBookings([]);
    } else {
      setSelectedBookings(filteredBookings.map(b => b._id));
    }
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
    { key: 'price_quoted', label: 'Price Quoted', count: stats.price_quoted, icon: Tag, color: 'bg-yellow-100 text-yellow-600' },
    { key: 'booking_confirmed', label: 'Confirmed', count: stats.booking_confirmed, icon: CheckCircle, color: 'bg-indigo-100 text-indigo-600' },
    { key: 'delivered', label: 'Delivered', count: stats.delivered, icon: CheckCircleSolid, color: 'bg-green-100 text-green-600' },
    { key: 'cancelled', label: 'Cancelled', count: stats.cancelled, icon: XCircleSolid, color: 'bg-red-100 text-red-600' },
    { key: 'rejected', label: 'Rejected', count: stats.rejected, icon: AlertTriangle, color: 'bg-rose-100 text-rose-600' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
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
                  placeholder="Search by booking number, customer, tracking number..."
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
                {(filters.status || filters.startDate || filters.endDate) && (
                  <span className="ml-2 bg-white text-[${COLORS.primary}] rounded-full px-2 py-0.5 text-xs">
                    {Object.values(filters).filter(v => v && v !== '' && v !== 20 && v !== 1).length}
                  </span>
                )}
              </Button>
              {(filters.search || filters.status || filters.startDate || filters.endDate || activeStat !== 'all') && (
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
              <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  options={statusOptions}
                  placeholder="All Statuses"
                  label="Status"
                  icon={Activity}
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
                    Pricing
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="10" className="px-4 py-8 text-center">
                      <div className="flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin" style={{ color: COLORS.primary }} />
                        <span className="ml-2 text-sm text-gray-500">Loading bookings...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="px-4 py-8 text-center">
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
                    const cargoTotals = calculateCargoTotals(booking.cargoDetails);
                    const quoteValid = booking.quotedPrice ? isQuoteValid(booking.quotedPrice) : false;
                    
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
                              #{booking.bookingNumber || booking._id?.slice(-8).toUpperCase()}
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
                            {booking.customer?.companyName || `${booking.customer?.firstName || ''} ${booking.customer?.lastName || ''}`.trim() || 'N/A'}
                          </div>
                          {booking.customer?.email && (
                            <div className="text-xs text-gray-500">
                              {booking.customer.email}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center text-xs">
                            <span className="font-medium text-gray-900">{getOriginDisplay(booking.shipmentDetails?.origin) || 'N/A'}</span>
                            <ChevronRight className="h-3 w-3 mx-1 text-gray-400" />
                            <span className="font-medium text-gray-900">{getDestinationDisplay(booking.shipmentDetails?.destination) || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            {booking.shipmentDetails?.shipmentType && (
                              <ShipmentTypeBadge type={booking.shipmentDetails.shipmentType} />
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs text-gray-500">
                            {formatDate(booking.createdAt, 'short')}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs">
                            <div className="text-gray-900">
                              {cargoTotals.totalCartons} ctns
                            </div>
                            <div className="text-gray-500">
                              {cargoTotals.totalWeight.toFixed(1)} kg
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={booking.status} size="sm" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            <PricingStatusBadge status={booking.pricingStatus} />
                            {booking.pricingStatus === 'quoted' && booking.quotedPrice && (
                              <div className="text-xs">
                                {quoteValid ? (
                                  <span className="text-green-600">
                                    {getQuoteDaysRemaining(booking.quotedPrice.validUntil)} days left
                                  </span>
                                ) : (
                                  <span className="text-red-600">Expired</span>
                                )}
                              </div>
                            )}
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
                      { value: 20, label: '20 / page' },
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
      <PriceQuoteModal
        isOpen={showPriceQuoteModal}
        onClose={() => setShowPriceQuoteModal(false)}
        booking={selectedBooking}
        onSave={handleSavePriceQuote}
      />

      <QuoteResponseModal
        isOpen={showAcceptModal}
        onClose={() => setShowAcceptModal(false)}
        booking={selectedBooking}
        type="accept"
        onRespond={handleAcceptQuote}
      />

      <QuoteResponseModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        booking={selectedBooking}
        type="reject"
        onRespond={handleRejectQuote}
      />

      <CancelModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        booking={selectedBooking}
        onCancel={handleCancelBooking}
      />

      <BookingDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        booking={selectedBooking}
      />

      <TimelineModal
        isOpen={showTimelineModal}
        onClose={() => setShowTimelineModal(false)}
        bookingId={selectedBooking?._id}
      />

      <InvoicesModal
        isOpen={showInvoicesModal}
        onClose={() => setShowInvoicesModal(false)}
        bookingId={selectedBooking?._id}
      />

      <QuoteDetailsModal
        isOpen={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
        bookingId={selectedBooking?._id}
      />
    </div>
  );
}