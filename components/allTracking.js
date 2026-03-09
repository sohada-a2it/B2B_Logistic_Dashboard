'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  // Main API functions
  getAllTrackings,
  getTrackingById,
  updateTrackingStatus,
  bulkUpdateTrackings,
  deleteTracking,
  bulkDeleteTrackings,
  getTrackingStats,
  searchTrackings,
  exportTrackings,
  publicTracking,
  
  // Helper functions
  getTrackingStatusColor,
  getTrackingStatusDisplay,
  getTrackingProgress,
  formatTrackingDate,
  formatTimeline,
  getTrackingTypeIcon,
  getEstimatedDeliveryStatus,
  
  // Custom hooks
  useTracking,
  useTrackingsList,
  usePublicTracking
} from '@/Api/tracking';
import { toast } from 'react-toastify';
import {
  // Navigation & Layout
  Loader2, Package, Search, Calendar, MapPin, User,
  ArrowLeft, ChevronRight, Globe, Weight, Box, Layers,
  Ship, Truck, Eye, Trash2, PlusCircle, Filter,
  ChevronDown, ChevronUp, X, CheckCircle, AlertCircle,
  Anchor, Container, FileText, Download, Printer,
  Plus, Minus, Edit, Save, Clock, Hash, Map,
  Info, AlertTriangle, Check, RefreshCw, BarChart3,
  TrendingUp, TrendingDown, Activity, Clock3,
  DownloadCloud, Upload, Filter as FilterIcon,
  MoreVertical, Phone, Mail, MapPin as MapPinIcon,
  Navigation, Home, Settings, Users, Database,
  PieChart, Target, Award, Gift, Star, Zap,
  Shield, Truck as TruckIcon, Plane, Train,
  Wifi, WifiOff, Battery, BatteryCharging,
  Copy, ExternalLink, Maximize2, Minimize2,
  Play, Pause, SkipBack, SkipForward,
  Sun, Moon, Cloud, CloudRain, Wind,
  Thermometer, Droplets, Gauge, Compass,
  Grid
} from 'lucide-react';

// ==================== CONSTANTS ====================

const TRACKING_STATUS = {
  pending: {
    label: 'Pending',
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
    hover: 'hover:bg-yellow-200',
    icon: Clock,
    progress: 0,
    color: 'yellow'
  },
  booking_requested: {
    label: 'Booking Requested',
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200',
    hover: 'hover:bg-blue-200',
    icon: FileText,
    progress: 10,
    color: 'blue'
  },
  price_quoted: {
    label: 'Price Quoted',
    bg: 'bg-indigo-100',
    text: 'text-indigo-800',
    border: 'border-indigo-200',
    hover: 'hover:bg-indigo-200',
    icon: FileText,
    progress: 20,
    color: 'indigo'
  },
  booking_confirmed: {
    label: 'Booking Confirmed',
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-200',
    hover: 'hover:bg-purple-200',
    icon: CheckCircle,
    progress: 30,
    color: 'purple'
  },
  picked_up_from_warehouse: {
    label: 'Picked Up',
    bg: 'bg-cyan-100',
    text: 'text-cyan-800',
    border: 'border-cyan-200',
    hover: 'hover:bg-cyan-200',
    icon: Truck,
    progress: 40,
    color: 'cyan'
  },
  received_at_warehouse: {
    label: 'At Warehouse',
    bg: 'bg-sky-100',
    text: 'text-sky-800',
    border: 'border-sky-200',
    hover: 'hover:bg-sky-200',
    icon: Package,
    progress: 50,
    color: 'sky'
  },
  consolidated: {
    label: 'Consolidated',
    bg: 'bg-teal-100',
    text: 'text-teal-800',
    border: 'border-teal-200',
    hover: 'hover:bg-teal-200',
    icon: Layers,
    progress: 60,
    color: 'teal'
  },
  departed_port_of_origin: {
    label: 'Departed Origin',
    bg: 'bg-emerald-100',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    hover: 'hover:bg-emerald-200',
    icon: Ship,
    progress: 70,
    color: 'emerald'
  },
  in_transit_sea_freight: {
    label: 'In Transit',
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
    hover: 'hover:bg-green-200',
    icon: Navigation,
    progress: 75,
    color: 'green'
  },
  arrived_at_destination_port: {
    label: 'Arrived Destination',
    bg: 'bg-lime-100',
    text: 'text-lime-800',
    border: 'border-lime-200',
    hover: 'hover:bg-lime-200',
    icon: Anchor,
    progress: 85,
    color: 'lime'
  },
  customs_cleared: {
    label: 'Customs Cleared',
    bg: 'bg-amber-100',
    text: 'text-amber-800',
    border: 'border-amber-200',
    hover: 'hover:bg-amber-200',
    icon: Shield,
    progress: 90,
    color: 'amber'
  },
  out_for_delivery: {
    label: 'Out for Delivery',
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    border: 'border-orange-200',
    hover: 'hover:bg-orange-200',
    icon: TruckIcon,
    progress: 95,
    color: 'orange'
  },
  delivered: {
    label: 'Delivered',
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
    hover: 'hover:bg-green-200',
    icon: Check,
    progress: 100,
    color: 'green'
  },
  on_hold: {
    label: 'On Hold',
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200',
    hover: 'hover:bg-red-200',
    icon: AlertCircle,
    progress: 0,
    color: 'red'
  },
  cancelled: {
    label: 'Cancelled',
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-200',
    hover: 'hover:bg-gray-200',
    icon: X,
    progress: 0,
    color: 'gray'
  },
  returned: {
    label: 'Returned',
    bg: 'bg-rose-100',
    text: 'text-rose-800',
    border: 'border-rose-200',
    hover: 'hover:bg-rose-200',
    icon: RefreshCw,
    progress: 0,
    color: 'rose'
  }
};

const TRACKING_TYPES = [
  { value: 'all', label: 'All Types', icon: Database, color: 'gray' },
  { value: 'shipment', label: 'Shipments', icon: Ship, color: 'blue' },
  { value: 'booking', label: 'Bookings', icon: FileText, color: 'purple' }
];

const TIME_RANGES = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'quarter', label: 'This Quarter' },
  { value: 'year', label: 'This Year' },
  { value: 'custom', label: 'Custom Range' }
];

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'createdAt', label: 'Oldest First' },
  { value: '-updatedAt', label: 'Recently Updated' },
  { value: 'updatedAt', label: 'Least Recently Updated' },
  { value: '-estimatedArrival', label: 'Estimated Arrival (Soonest)' },
  { value: 'estimatedArrival', label: 'Estimated Arrival (Latest)' }
];

const VIEW_MODES = [
  { value: 'list', label: 'List View', icon: Layers },
  { value: 'grid', label: 'Grid View', icon: Grid },
  { value: 'timeline', label: 'Timeline', icon: Activity },
  { value: 'calendar', label: 'Calendar', icon: Calendar }
];

// ==================== HELPER FUNCTIONS ====================

const getStatusInfo = (status) => {
  return TRACKING_STATUS[status] || {
    label: status || 'Unknown',
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-200',
    hover: 'hover:bg-gray-200',
    icon: Clock,
    progress: 0,
    color: 'gray'
  };
};

const formatWeight = (weight) => {
  if (!weight && weight !== 0) return '0 kg';
  if (weight > 1000) return `${(weight / 1000).toFixed(2)} t`;
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

const formatCurrency = (amount) => {
  if (!amount) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

const getDaysRemaining = (estimatedDate) => {
  if (!estimatedDate) return null;
  
  const today = new Date();
  const estimated = new Date(estimatedDate);
  const diffDays = Math.ceil((estimated - today) / (1000 * 60 * 60 * 24));
  
  return {
    days: Math.abs(diffDays),
    status: diffDays < 0 ? 'overdue' : diffDays === 0 ? 'today' : 'upcoming',
    text: diffDays < 0 ? `${Math.abs(diffDays)} days overdue` :
          diffDays === 0 ? 'Due today' :
          `${diffDays} days left`,
    color: diffDays < 0 ? 'text-red-600' :
           diffDays === 0 ? 'text-orange-600' :
           'text-green-600'
  };
};

const getInitials = (name) => {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

// ==================== COMPONENTS ====================

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color = 'orange', subtitle, trend, onClick }) => {
  const colorClasses = {
    orange: 'bg-orange-50 text-orange-600',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    teal: 'bg-teal-50 text-teal-600',
    cyan: 'bg-cyan-50 text-cyan-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    rose: 'bg-rose-50 text-rose-600',
    amber: 'bg-amber-50 text-amber-600'
  };

  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
          {trend && (
            <div className="flex items-center mt-1">
              {trend.direction === 'up' ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={`text-xs ${trend.direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {trend.value}% from last month
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};

// Progress Bar Component
const ProgressBar = ({ progress, height = 'h-2', showLabel = false, showPercentage = false }) => {
  let color = 'bg-green-500';
  if (progress < 30) color = 'bg-yellow-500';
  else if (progress < 70) color = 'bg-orange-500';
  else color = 'bg-green-500';

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-500">Progress</span>
          <span className="text-xs font-medium">{progress}%</span>
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full ${height}`}>
        <div
          className={`${color} ${height} rounded-full transition-all duration-500`}
          style={{ width: `${progress}%` }}
        />
      </div>
      {showPercentage && (
        <div className="text-right mt-1">
          <span className="text-xs font-medium text-gray-700">{progress}% Complete</span>
        </div>
      )}
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ status, size = 'md', showIcon = true }) => {
  const statusInfo = getStatusInfo(status);
  const StatusIcon = statusInfo.icon;
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  };

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${sizeClasses[size]} ${statusInfo.bg} ${statusInfo.text}`}>
      {showIcon && <StatusIcon className={`${size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} mr-1`} />}
      {statusInfo.label}
    </span>
  );
};

// Avatar Component
const Avatar = ({ name, email, src, size = 'md' }) => {
  const initials = getInitials(name);
  
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base'
  };

  return (
    <div className="flex items-center space-x-2">
      {src ? (
        <img src={src} alt={name} className={`${sizeClasses[size]} rounded-full object-cover`} />
      ) : (
        <div className={`${sizeClasses[size]} rounded-full bg-[#E67E22] bg-opacity-10 flex items-center justify-center text-[#E67E22] font-medium`}>
          {initials}
        </div>
      )}
      <div>
        <p className="text-sm font-medium text-gray-900">{name || 'Unknown'}</p>
        {email && <p className="text-xs text-gray-500">{email}</p>}
      </div>
    </div>
  );
};

// Package Card Component
const PackageCard = ({ pkg, index }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border rounded-lg overflow-hidden">
      <div 
        className="p-3 bg-gray-50 flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center space-x-2">
          <Package className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium">Package #{index + 1}</span>
          <span className="text-xs text-gray-500">{pkg.type || 'Standard'}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-600">
            {pkg.quantity || 1} × {formatWeight(pkg.weight)}
          </span>
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </div>
      
      {expanded && (
        <div className="p-3 space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-gray-500">Description</p>
              <p className="text-sm">{pkg.description || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Type</p>
              <p className="text-sm">{pkg.type || 'Standard'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Quantity</p>
              <p className="text-sm">{pkg.quantity || 1}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Weight</p>
              <p className="text-sm">{formatWeight(pkg.weight)}</p>
            </div>
            {pkg.dimensions && (
              <div className="col-span-2">
                <p className="text-xs text-gray-500">Dimensions</p>
                <p className="text-sm">
                  {pkg.dimensions.length} x {pkg.dimensions.width} x {pkg.dimensions.height} cm
                </p>
              </div>
            )}
          </div>
          {(pkg.hazardous || pkg.temperatureControlled) && (
            <div className="flex space-x-2 mt-2">
              {pkg.hazardous && (
                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Hazardous
                </span>
              )}
              {pkg.temperatureControlled && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full flex items-center">
                  <Thermometer className="h-3 w-3 mr-1" />
                  Temperature Controlled
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Timeline Entry Component
const TimelineEntry = ({ entry, isLast }) => {
  const statusInfo = getStatusInfo(entry.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="relative flex items-start space-x-3">
      {/* Timeline Line */}
      {!isLast && (
        <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-200" />
      )}
      
      {/* Icon */}
      <div className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full ${statusInfo.bg} flex items-center justify-center`}>
        <StatusIcon className={`h-4 w-4 ${statusInfo.text}`} />
      </div>
      
      {/* Content */}
      <div className="flex-1 pb-6">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-900">{statusInfo.label}</h4>
          <span className="text-xs text-gray-500">{formatDateTime(entry.date)}</span>
        </div>
        
        {entry.location && (
          <p className="text-xs text-gray-600 mt-1 flex items-center">
            <MapPin className="h-3 w-3 mr-1 text-gray-400" />
            {entry.location}
          </p>
        )}
        
        {entry.description && (
          <p className="text-xs text-gray-500 mt-1">{entry.description}</p>
        )}
        
        {entry.updatedBy && (
          <p className="text-xs text-gray-400 mt-1">
            Updated by: {entry.updatedBy.firstName} {entry.updatedBy.lastName}
          </p>
        )}
      </div>
    </div>
  );
};

// Milestone Timeline Component
const MilestoneTimeline = ({ milestones }) => {
  if (!milestones || milestones.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Activity className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <p>No timeline entries available</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {milestones.map((entry, index) => (
        <TimelineEntry 
          key={index} 
          entry={entry} 
          isLast={index === milestones.length - 1} 
        />
      ))}
    </div>
  );
};

// Tracking Card Component
const TrackingCard = ({ tracking, onView, onEdit, onDelete, onSelect, isSelected, viewMode = 'list' }) => {
  const [expanded, setExpanded] = useState(false);
  const statusInfo = getStatusInfo(tracking.status);
  const StatusIcon = statusInfo.icon;
  const daysRemaining = getDaysRemaining(tracking.estimatedArrival);
  const progress = getTrackingProgress(tracking.status);

  if (viewMode === 'grid') {
    return (
      <div className={`bg-white rounded-xl border ${isSelected ? 'border-[#E67E22] ring-2 ring-[#E67E22] ring-opacity-20' : 'border-gray-200'} overflow-hidden hover:shadow-lg transition-all`}>
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              {onSelect && (
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onSelect(tracking.id, tracking.type)}
                  className="h-4 w-4 text-[#E67E22] rounded border-gray-300 focus:ring-[#E67E22]"
                />
              )}
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                tracking.type === 'shipment' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
              }`}>
                {getTrackingTypeIcon(tracking.type)} {tracking.type}
              </span>
            </div>
            <StatusBadge status={tracking.status} size="sm" />
          </div>

          {/* Tracking Number */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{tracking.trackingNumber}</h3>

          {/* Route */}
          <div className="flex items-center text-sm mb-3">
            <MapPin className="h-3 w-3 text-gray-400 mr-1" />
            <span className="text-gray-600 truncate">{tracking.origin || 'N/A'}</span>
            <ChevronRight className="h-3 w-3 mx-1 text-gray-400 flex-shrink-0" />
            <span className="text-gray-600 truncate">{tracking.destination || 'N/A'}</span>
          </div>

          {/* Customer */}
          <div className="flex items-center mb-3">
            <User className="h-3 w-3 text-gray-400 mr-1" />
            <span className="text-xs text-gray-600 truncate">{tracking.customer?.name || 'N/A'}</span>
          </div>

          {/* Progress */}
          <ProgressBar progress={progress} height="h-1.5" />

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
            <div className="text-center">
              <Package className="h-3 w-3 mx-auto text-gray-400 mb-1" />
              <span className="text-gray-600">{tracking.totalPackages || 0}</span>
            </div>
            <div className="text-center">
              <Weight className="h-3 w-3 mx-auto text-gray-400 mb-1" />
              <span className="text-gray-600">{formatWeight(tracking.totalWeight)}</span>
            </div>
            <div className="text-center">
              <Box className="h-3 w-3 mx-auto text-gray-400 mb-1" />
              <span className="text-gray-600">{formatVolume(tracking.totalVolume)}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t">
            <div className="flex items-center text-xs text-gray-400">
              <Calendar className="h-3 w-3 mr-1" />
              {formatDateTime(tracking.lastUpdate)}
            </div>
            <div className="flex space-x-1">
              <button
                onClick={() => onView(tracking.id, tracking.type)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                title="View details"
              >
                <Eye className="h-4 w-4 text-gray-600" />
              </button>
              {onEdit && (
                <button
                  onClick={() => onEdit(tracking)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit className="h-4 w-4 text-gray-600" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border ${isSelected ? 'border-[#E67E22] ring-2 ring-[#E67E22] ring-opacity-20' : 'border-gray-200'} overflow-hidden hover:shadow-lg transition-all`}>
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-gray-50 to-white border-b">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            {onSelect && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onSelect(tracking.id, tracking.type)}
                className="mt-1 h-4 w-4 text-[#E67E22] rounded border-gray-300 focus:ring-[#E67E22]"
              />
            )}
            
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {expanded ? 
                <ChevronUp className="h-5 w-5 text-gray-600" /> : 
                <ChevronDown className="h-5 w-5 text-gray-600" />
              }
            </button>

            <div className="flex-1">
              {/* Tracking Number and Type */}
              <div className="flex items-center flex-wrap gap-2">
                <span className="text-lg font-semibold text-gray-900">
                  {tracking.trackingNumber}
                </span>
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  tracking.type === 'shipment' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-purple-100 text-purple-700'
                }`}>
                  {getTrackingTypeIcon(tracking.type)} {tracking.type === 'shipment' ? 'Shipment' : 'Booking'}
                </span>
                <StatusBadge status={tracking.status} />
              </div>

              {/* Customer */}
              <div className="flex items-center mt-1">
                <User className="h-3 w-3 text-gray-400 mr-1" />
                <span className="text-xs text-gray-600">
                  {tracking.customer?.name || 'N/A'}
                </span>
                {tracking.customer?.email && (
                  <>
                    <span className="mx-2 text-gray-300">•</span>
                    <Mail className="h-3 w-3 text-gray-400 mr-1" />
                    <span className="text-xs text-gray-500">{tracking.customer.email}</span>
                  </>
                )}
              </div>

              {/* Route */}
              <div className="flex items-center mt-1 text-sm">
                <MapPin className="h-3 w-3 text-gray-400 mr-1" />
                <span className="text-gray-600">{tracking.origin || 'N/A'}</span>
                <ChevronRight className="h-3 w-3 mx-1 text-gray-400" />
                <span className="text-gray-600">{tracking.destination || 'N/A'}</span>
                {tracking.currentLocation && tracking.currentLocation !== 'N/A' && (
                  <>
                    <span className="mx-2 text-gray-300">•</span>
                    <Navigation className="h-3 w-3 text-[#E67E22] mr-1" />
                    <span className="text-xs text-[#E67E22]">Current: {tracking.currentLocation}</span>
                  </>
                )}
              </div>

              {/* Progress Bar */}
              <div className="mt-3">
                <ProgressBar progress={progress} height="h-1.5" />
              </div>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-4 mt-2 text-xs">
                <div className="flex items-center text-gray-500">
                  <Package className="h-3 w-3 mr-1" />
                  {tracking.totalPackages || 0} pkgs
                </div>
                <div className="flex items-center text-gray-500">
                  <Weight className="h-3 w-3 mr-1" />
                  {formatWeight(tracking.totalWeight)}
                </div>
                <div className="flex items-center text-gray-500">
                  <Box className="h-3 w-3 mr-1" />
                  {formatVolume(tracking.totalVolume)}
                </div>
                <div className="flex items-center text-gray-500">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDateTime(tracking.lastUpdate)}
                </div>
                {daysRemaining && (
                  <div className={`flex items-center ${daysRemaining.color}`}>
                    <Clock3 className="h-3 w-3 mr-1" />
                    {daysRemaining.text}
                  </div>
                )}
              </div>

              {/* Reference Numbers */}
              <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400">
                {tracking.referenceNumber && (
                  <span>Ref: {tracking.referenceNumber}</span>
                )}
                {tracking.bookingNumber && (
                  <span>Booking: {tracking.bookingNumber}</span>
                )}
                {tracking.containerNumber && (
                  <span>Container: {tracking.containerNumber}</span>
                )}
                {tracking.invoiceNumber && (
                  <span>Invoice: {tracking.invoiceNumber}</span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onView(tracking.id, tracking.type)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="View details"
            >
              <Eye className="h-4 w-4 text-gray-600" />
            </button>
            {onEdit && (
              <button
                onClick={() => onEdit(tracking)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Edit"
              >
                <Edit className="h-4 w-4 text-gray-600" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(tracking.id, tracking.type)}
                className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="p-4 bg-gray-50 border-t">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Origin Details */}
            <div>
              <p className="text-xs text-gray-400 mb-1 flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                Origin
              </p>
              <p className="text-sm font-medium">{tracking.origin || 'N/A'}</p>
              {tracking.originAddress && (
                <p className="text-xs text-gray-500 mt-1">{tracking.originAddress}</p>
              )}
            </div>

            {/* Destination Details */}
            <div>
              <p className="text-xs text-gray-400 mb-1 flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                Destination
              </p>
              <p className="text-sm font-medium">{tracking.destination || 'N/A'}</p>
              {tracking.destinationAddress && (
                <p className="text-xs text-gray-500 mt-1">{tracking.destinationAddress}</p>
              )}
            </div>

            {/* Dates */}
            <div>
              <p className="text-xs text-gray-400 mb-1 flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                Important Dates
              </p>
              <div className="space-y-1">
                <p className="text-xs">
                  <span className="text-gray-500">Created:</span>{' '}
                  {formatDateTime(tracking.createdAt)}
                </p>
                {tracking.estimatedArrival && (
                  <p className="text-xs">
                    <span className="text-gray-500">Est. Arrival:</span>{' '}
                    {formatDateTime(tracking.estimatedArrival)}
                  </p>
                )}
                {tracking.actualDelivery && (
                  <p className="text-xs">
                    <span className="text-gray-500">Delivered:</span>{' '}
                    {formatDateTime(tracking.actualDelivery)}
                  </p>
                )}
              </div>
            </div>

            {/* Additional Info */}
            <div>
              <p className="text-xs text-gray-400 mb-1 flex items-center">
                <Info className="h-3 w-3 mr-1" />
                Additional Info
              </p>
              <div className="space-y-1">
                {tracking.pricingStatus && (
                  <p className="text-xs">Pricing: {tracking.pricingStatus}</p>
                )}
                {tracking.quotedPrice && (
                  <p className="text-xs">Quote: {formatCurrency(tracking.quotedPrice)}</p>
                )}
                {tracking.shipmentNumber && (
                  <p className="text-xs">Shipment #: {tracking.shipmentNumber}</p>
                )}
              </div>
            </div>
          </div>

          {/* Package Details */}
          {tracking.packages && tracking.packages.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs font-medium text-gray-500 mb-2 flex items-center">
                <Package className="h-3 w-3 mr-1" />
                Packages ({tracking.packages.length})
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {tracking.packages.slice(0, 2).map((pkg, idx) => (
                  <PackageCard key={idx} pkg={pkg} index={idx} />
                ))}
              </div>
              {tracking.packages.length > 2 && (
                <p className="text-xs text-center text-gray-400 mt-2">
                  +{tracking.packages.length - 2} more packages
                </p>
              )}
            </div>
          )}

          {/* Timeline Preview */}
          {tracking.recentMilestones && tracking.recentMilestones.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs font-medium text-gray-500 mb-2 flex items-center">
                <Activity className="h-3 w-3 mr-1" />
                Recent Activity
              </p>
              <div className="space-y-2">
                {tracking.recentMilestones.slice(0, 3).map((milestone, idx) => (
                  <div key={idx} className="flex items-start space-x-2 text-xs">
                    <div className="w-2 h-2 mt-1 rounded-full bg-[#E67E22]" />
                    <div className="flex-1">
                      <p className="text-gray-700">{milestone.description}</p>
                      <p className="text-gray-400">{formatDateTime(milestone.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Filter Panel Component
const FilterPanel = ({ filters, onFilterChange, onClose }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleChange = (key, value) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onFilterChange(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters = {
      type: 'all',
      status: '',
      timeRange: 'month',
      startDate: '',
      endDate: '',
      customerId: '',
      sort: '-createdAt'
    };
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
    onClose();
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 w-80 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium flex items-center">
          <FilterIcon className="h-4 w-4 mr-2 text-[#E67E22]" />
          Filter Trackings
        </h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Type Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
          <select
            value={localFilters.type}
            onChange={(e) => handleChange('type', e.target.value)}
            className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-[#E67E22]"
          >
            {TRACKING_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
          <select
            value={localFilters.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-[#E67E22]"
          >
            <option value="">All Statuses</option>
            {Object.entries(TRACKING_STATUS).map(([value, { label }]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {/* Time Range */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Time Range</label>
          <select
            value={localFilters.timeRange}
            onChange={(e) => handleChange('timeRange', e.target.value)}
            className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-[#E67E22]"
          >
            {TIME_RANGES.map(range => (
              <option key={range.value} value={range.value}>{range.label}</option>
            ))}
          </select>
        </div>

        {/* Custom Date Range */}
        {localFilters.timeRange === 'custom' && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={localFilters.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
                className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-[#E67E22]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={localFilters.endDate}
                onChange={(e) => handleChange('endDate', e.target.value)}
                className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-[#E67E22]"
              />
            </div>
          </>
        )}

        {/* Sort By */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Sort By</label>
          <select
            value={localFilters.sort}
            onChange={(e) => handleChange('sort', e.target.value)}
            className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-[#E67E22]"
          >
            {SORT_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        {/* Customer ID */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Customer ID</label>
          <input
            type="text"
            value={localFilters.customerId}
            onChange={(e) => handleChange('customerId', e.target.value)}
            placeholder="Enter customer ID"
            className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-[#E67E22]"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-2 mt-6">
        <button
          onClick={handleReset}
          className="flex-1 px-3 py-2 border rounded-lg text-sm hover:bg-gray-50"
        >
          Reset
        </button>
        <button
          onClick={handleApply}
          className="flex-1 px-3 py-2 bg-[#E67E22] text-white rounded-lg text-sm hover:bg-[#d35400]"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

// Bulk Actions Bar
const BulkActionsBar = ({ selectedCount, onBulkUpdate, onBulkDelete, onClear, onExport }) => {
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');

  const handleBulkUpdate = () => {
    if (!selectedStatus) {
      toast.warning('Please select a status');
      return;
    }
    onBulkUpdate(selectedStatus);
    setShowStatusMenu(false);
  };

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-slide-up">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 px-4 py-3 flex items-center space-x-4">
        <span className="text-sm font-medium">
          <span className="text-[#E67E22]">{selectedCount}</span> items selected
        </span>
        
        <div className="h-4 w-px bg-gray-200" />
        
        {/* Status Update */}
        <div className="relative">
          <button
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50 flex items-center"
          >
            <CheckCircle className="h-4 w-4 mr-2 text-gray-600" />
            Update Status
            <ChevronDown className="h-4 w-4 ml-2" />
          </button>
          
          {showStatusMenu && (
            <div className="absolute bottom-full mb-2 left-0 bg-white rounded-lg shadow-lg border p-2 w-64">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full p-2 text-sm border rounded-lg mb-2"
              >
                <option value="">Select Status</option>
                {Object.entries(TRACKING_STATUS).map(([value, { label }]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowStatusMenu(false)}
                  className="flex-1 px-2 py-1 text-xs border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkUpdate}
                  className="flex-1 px-2 py-1 text-xs bg-[#E67E22] text-white rounded hover:bg-[#d35400]"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Export */}
        <button
          onClick={onExport}
          className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50 flex items-center"
        >
          <DownloadCloud className="h-4 w-4 mr-2 text-gray-600" />
          Export
        </button>
        
        {/* Delete */}
        <button
          onClick={() => {
            if (confirm(`Delete ${selectedCount} selected items?`)) {
              onBulkDelete();
            }
          }}
          className="px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 flex items-center"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </button>
        
        <button
          onClick={onClear}
          className="p-1.5 hover:bg-gray-100 rounded-lg"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// Tracking Details Modal
const TrackingDetailsModal = ({ isOpen, onClose, trackingId, type }) => {
  const [loading, setLoading] = useState(true);
  const [tracking, setTracking] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (isOpen && trackingId) {
      loadTrackingDetails();
    }
  }, [isOpen, trackingId]);

  const loadTrackingDetails = async () => {
    setLoading(true);
    try {
      const result = await getTrackingById(trackingId, type);
      if (result.success) {
        setTracking(result.data);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to load tracking details');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">Tracking Details</h2>
              <p className="text-sm text-gray-500 mt-1">{trackingId}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex space-x-4 mt-4">
            {['overview', 'timeline', 'packages', 'documents'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 text-sm font-medium rounded-lg capitalize ${
                  activeTab === tab
                    ? 'bg-[#E67E22] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-10 w-10 animate-spin text-[#E67E22] mb-4" />
              <p className="text-sm text-gray-500">Loading tracking details...</p>
            </div>
          ) : !tracking ? (
            <div className="text-center py-16">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-gray-600">Failed to load tracking details</p>
            </div>
          ) : (
            <div>
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Status and Progress */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">Current Status</h3>
                      <StatusBadge status={tracking.status} size="lg" />
                    </div>
                    <ProgressBar progress={tracking.progress || 0} showPercentage />
                  </div>

                  {/* Basic Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Tracking Number</p>
                      <p className="text-sm font-medium">{tracking.trackingNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Type</p>
                      <p className="text-sm font-medium capitalize">{tracking.type}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Reference Number</p>
                      <p className="text-sm">{tracking.referenceNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Created</p>
                      <p className="text-sm">{formatDateTime(tracking.createdAt)}</p>
                    </div>
                  </div>

                  {/* Route */}
                  <div>
                    <h3 className="font-medium mb-2">Route</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="text-center flex-1">
                          <MapPin className="h-5 w-5 mx-auto text-gray-400 mb-1" />
                          <p className="text-sm font-medium">{tracking.origin || 'N/A'}</p>
                          <p className="text-xs text-gray-500">Origin</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                        <div className="text-center flex-1">
                          <MapPin className="h-5 w-5 mx-auto text-gray-400 mb-1" />
                          <p className="text-sm font-medium">{tracking.destination || 'N/A'}</p>
                          <p className="text-xs text-gray-500">Destination</p>
                        </div>
                      </div>
                      {tracking.currentLocation && (
                        <div className="mt-3 pt-3 border-t text-center">
                          <p className="text-xs text-gray-500">Current Location</p>
                          <p className="text-sm text-[#E67E22]">{tracking.currentLocation}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Customer Info */}
                  {tracking.customer && (
                    <div>
                      <h3 className="font-medium mb-2">Customer Information</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <Avatar 
                          name={tracking.customer.name} 
                          email={tracking.customer.email} 
                        />
                        {tracking.customer.phone && (
                          <div className="flex items-center mt-2 text-sm">
                            <Phone className="h-4 w-4 mr-2 text-gray-400" />
                            {tracking.customer.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'timeline' && (
                <MilestoneTimeline milestones={tracking.timeline || tracking.milestones} />
              )}

              {activeTab === 'packages' && (
                <div className="space-y-3">
                  {tracking.packages && tracking.packages.length > 0 ? (
                    tracking.packages.map((pkg, idx) => (
                      <PackageCard key={idx} pkg={pkg} index={idx} />
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>No package information available</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'documents' && (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No documents available</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Empty State
const EmptyTrackings = ({ onRefresh, router }) => (
  <div className="text-center py-16 bg-white rounded-xl border">
    <div className="bg-orange-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
      <Package className="h-10 w-10 text-[#E67E22]" />
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">No trackings found</h3>
    <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
      There are no tracking records matching your criteria. Try adjusting your filters or create a new shipment.
    </p>
    <div className="flex items-center justify-center space-x-3">
      <button
        onClick={() => router.push('/shipments/create')}
        className="inline-flex items-center px-4 py-2 bg-[#E67E22] text-white rounded-lg hover:bg-[#d35400]"
      >
        <PlusCircle className="h-4 w-4 mr-2" />
        Create Shipment
      </button>
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

// Loading Skeleton
const TrackingSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3].map(i => (
      <div key={i} className="bg-white rounded-xl border p-4 animate-pulse">
        <div className="flex items-start space-x-3">
          <div className="w-5 h-5 bg-gray-200 rounded" />
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <div className="h-5 w-32 bg-gray-200 rounded" />
              <div className="h-5 w-20 bg-gray-200 rounded" />
              <div className="h-5 w-20 bg-gray-200 rounded" />
            </div>
            <div className="h-4 w-48 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-64 bg-gray-200 rounded mb-3" />
            <div className="h-2 w-full bg-gray-200 rounded mb-2" />
            <div className="flex space-x-4">
              <div className="h-3 w-16 bg-gray-200 rounded" />
              <div className="h-3 w-16 bg-gray-200 rounded" />
              <div className="h-3 w-16 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// ==================== MAIN PAGE ====================

export default function AllTrackingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [trackings, setTrackings] = useState([]);
  const [summary, setSummary] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [selectedItems, setSelectedItems] = useState({});
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTracking, setSelectedTracking] = useState(null);
  const [filters, setFilters] = useState({
    type: 'all',
    status: '',
    timeRange: 'month',
    startDate: '',
    endDate: '',
    customerId: '',
    sort: '-createdAt',
    page: 1,
    limit: 20
  });

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load trackings
      const trackingsResult = await getAllTrackings({
        ...filters,
        search: searchTerm
      });
      
      if (trackingsResult.success) {
        setTrackings(trackingsResult.data || []);
        setSummary(trackingsResult.summary);
        setPagination(trackingsResult.pagination);
      } else {
        toast.error(trackingsResult.message);
      }

      // Load stats
      const statsResult = await getTrackingStats();
      if (statsResult.success) {
        setStats(statsResult.data);
      }

    } catch (error) {
      toast.error('Failed to load tracking data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
    toast.success('Data refreshed');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  const handleSelectItem = (id, type) => {
    setSelectedItems(prev => ({
      ...prev,
      [`${type}-${id}`]: !prev[`${type}-${id}`]
    }));
  };

  const handleSelectAll = () => {
    if (Object.keys(selectedItems).length === trackings.length) {
      setSelectedItems({});
    } else {
      const all = {};
      trackings.forEach(t => {
        all[`${t.type}-${t.id}`] = true;
      });
      setSelectedItems(all);
    }
  };

  const handleClearSelection = () => {
    setSelectedItems({});
  };

  const handleViewTracking = (id, type) => {
    setSelectedTracking({ id, type });
    setShowDetailsModal(true);
  };

  const handleEditTracking = (tracking) => {
    router.push(`/trackings/edit/${tracking.id}?type=${tracking.type}`);
  };

  const handleDeleteTracking = async (id, type) => {
    if (!confirm('Are you sure you want to delete this tracking?')) return;
    
    try {
      const result = await deleteTracking(id, type);
      if (result.success) {
        toast.success('Tracking deleted successfully');
        loadData();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to delete tracking');
    }
  };

  const handleBulkUpdate = async (status) => {
    const selectedIds = Object.keys(selectedItems).map(key => {
      const [type, id] = key.split('-');
      return { type, id };
    });

    if (selectedIds.length === 0) {
      toast.warning('No items selected');
      return;
    }

    try {
      const result = await bulkUpdateTrackings(selectedIds, { status });
      
      if (result.success) {
        toast.success(`Updated ${result.data.shipments.length + result.data.bookings.length} trackings`);
        setSelectedItems({});
        loadData();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to bulk update');
    }
  };

  const handleBulkDelete = async () => {
    const selectedIds = Object.keys(selectedItems).map(key => {
      const [type, id] = key.split('-');
      return { type, id };
    });

    if (selectedIds.length === 0) {
      toast.warning('No items selected');
      return;
    }

    try {
      const result = await bulkDeleteTrackings(selectedIds);
      
      if (result.success) {
        toast.success(`Deleted ${result.data.deleted.length} trackings`);
        setSelectedItems({});
        loadData();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to bulk delete');
    }
  };

  const handleExport = async () => {
    const selectedIds = Object.keys(selectedItems).length > 0
      ? Object.keys(selectedItems).map(key => {
          const [type, id] = key.split('-');
          return { type, id };
        })
      : null;

    try {
      const exportParams = {
        ...filters,
        ...(selectedIds && { ids: selectedIds.map(s => s.id) })
      };
      
      const result = await exportTrackings(exportParams, 'csv');
      
      if (result.success) {
        toast.success('Trackings exported successfully');
        if (selectedIds) {
          setSelectedItems({});
        }
      }
    } catch (error) {
      toast.error('Failed to export trackings');
    }
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectedCount = Object.keys(selectedItems).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Package className="h-6 w-6 mr-2 text-[#E67E22]" />
                  Tracking Management
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Monitor and manage all shipments and bookings
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg transition-colors ${
                  showFilters ? 'bg-[#E67E22] text-white' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <Filter className="h-5 w-5" />
              </button>
              <div className="flex border rounded-lg overflow-hidden">
                {VIEW_MODES.map(mode => (
                  <button
                    key={mode.value}
                    onClick={() => setViewMode(mode.value)}
                    className={`p-2 ${
                      viewMode === mode.value
                        ? 'bg-[#E67E22] text-white'
                        : 'hover:bg-gray-100 text-gray-600'
                    }`}
                    title={mode.label}
                  >
                    <mode.icon className="h-5 w-5" />
                  </button>
                ))}
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <RefreshCw className={`h-5 w-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => router.push('/shipments/create')}
                className="px-4 py-2 bg-[#E67E22] text-white rounded-lg hover:bg-[#d35400] text-sm flex items-center"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                New Shipment
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <StatCard 
                title="Total Trackings" 
                value={stats.summary?.totalActive || 0} 
                icon={Database} 
                color="blue"
                subtitle="Active shipments"
              />
              <StatCard 
                title="In Transit" 
                value={stats.summary?.totalInTransit || 0} 
                icon={Navigation} 
                color="orange"
              />
              <StatCard 
                title="Delivered" 
                value={stats.summary?.totalDelivered || 0} 
                icon={CheckCircle} 
                color="green"
                subtitle="This month"
              />
              <StatCard 
                title="Pending" 
                value={stats.summary?.totalPending || 0} 
                icon={Clock} 
                color="yellow"
                subtitle="Awaiting action"
              />
            </div>
          )}

          {/* Search and Actions */}
          <div className="bg-white rounded-xl border p-4 mb-4">
            <div className="flex items-center space-x-4">
              <form onSubmit={handleSearch} className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by tracking number, reference, customer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#E67E22]"
                />
              </form>
              {trackings.length > 0 && (
                <>
                  <button
                    onClick={handleSelectAll}
                    className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50"
                  >
                    {selectedCount === trackings.length ? 'Deselect All' : 'Select All'}
                  </button>
                  <button
                    onClick={handleExport}
                    className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 flex items-center"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mb-4 flex justify-end">
              <FilterPanel
                filters={filters}
                onFilterChange={setFilters}
                onClose={() => setShowFilters(false)}
              />
            </div>
          )}

          {/* Results Info */}
          {pagination && (
            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <div>
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} results
                {selectedCount > 0 && (
                  <span className="ml-2 text-[#E67E22]">({selectedCount} selected)</span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <span>Show:</span>
                <select
                  value={filters.limit}
                  onChange={(e) => setFilters(prev => ({ ...prev, limit: parseInt(e.target.value), page: 1 }))}
                  className="border rounded-lg p-1 text-sm"
                >
                  <option value="20">20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        {loading ? (
          <TrackingSkeleton />
        ) : trackings.length === 0 ? (
          <EmptyTrackings onRefresh={handleRefresh} router={router} />
        ) : (
          <>
            {viewMode === 'list' && (
              <div className="space-y-4">
                {trackings.map((tracking) => (
                  <TrackingCard
                    key={`${tracking.type}-${tracking.id}`}
                    tracking={tracking}
                    onView={handleViewTracking}
                    onEdit={handleEditTracking}
                    onDelete={handleDeleteTracking}
                    onSelect={handleSelectItem}
                    isSelected={selectedItems[`${tracking.type}-${tracking.id}`]}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}

            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trackings.map((tracking) => (
                  <TrackingCard
                    key={`${tracking.type}-${tracking.id}`}
                    tracking={tracking}
                    onView={handleViewTracking}
                    onEdit={handleEditTracking}
                    onDelete={handleDeleteTracking}
                    onSelect={handleSelectItem}
                    isSelected={selectedItems[`${tracking.type}-${tracking.id}`]}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}

            {viewMode === 'timeline' && (
              <div className="bg-white rounded-xl border p-6">
                <MilestoneTimeline 
                  milestones={trackings.flatMap(t => 
                    (t.recentMilestones || []).map(m => ({
                      ...m,
                      trackingNumber: t.trackingNumber
                    }))
                  ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))} 
                />
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-6">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-3 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
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
                      key={i}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 rounded-lg ${
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
                  className="px-3 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Details Modal */}
      <TrackingDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedTracking(null);
        }}
        trackingId={selectedTracking?.id}
        type={selectedTracking?.type}
      />

      {/* Bulk Actions Bar */}
      {selectedCount > 0 && (
        <BulkActionsBar
          selectedCount={selectedCount}
          onBulkUpdate={handleBulkUpdate}
          onBulkDelete={handleBulkDelete}
          onClear={handleClearSelection}
          onExport={handleExport}
        />
      )}
    </div>
  );
}