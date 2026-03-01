// app/warehouses/page.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// API Imports - your provided warehouse service
import {
  // Warehouse APIs
  getAllWarehouses,
  createWarehouse,
  updateWarehouse,
  getWarehouseDashboard,
  getWarehouseInventory,
  getWarehouseReceipts,
  getExpectedShipments,
  receiveShipment,
  getReceiptById,
  updateInventoryLocation,
  startConsolidation,
  completeConsolidation,
  loadAndDepartConsolidation,
  getConsolidations,
  getConsolidationById,
  addConsolidationDocuments,
  inspectShipment,
  getInventoryByZone,
  getRecentReceipts,
  generateReceiptPDF,
  generatePackingListPDF,
  exportInventoryToCSV,

  // Helper functions
  getInventoryStatusColor,
  getConsolidationStatusColor,
  getInventoryStatusDisplayText,
  getConsolidationStatusDisplayText,
  getConditionDisplayText,
  getConditionColor,
  getPackageTypeDisplay,
  formatLocation,
  formatWeight,
  formatVolume,
  formatDimensions,
  calculateCapacityUsage,
  getCapacityColor,
  isAvailableForConsolidation,
  calculateInventoryValue,
  groupInventoryByZone,
  getStorageDuration,
  isLongTermStorage,

  // Hooks
  useWarehouse,
  useConsolidation
} from '@/Api/warehouse';

// React Icons
import { 
  FiPackage, 
  FiSearch, 
  FiFilter, 
  FiChevronDown, 
  FiChevronLeft, 
  FiChevronRight,
  FiEye, 
  FiEdit, 
  FiDownload, 
  FiPlus, 
  FiCalendar, 
  FiMapPin, 
  FiUser,
  FiTruck, 
  FiClock, 
  FiCheckCircle, 
  FiXCircle,
  FiAlertCircle, 
  FiRefreshCw, 
  FiLoader, 
  FiMoreVertical,
  FiArrowUp, 
  FiArrowDown,
  FiCopy,
  FiShare2,
  FiPrinter,
  FiUpload,
  FiMessageSquare,
  FiFileText,
  FiHome,
  FiBriefcase,
  FiNavigation,
  FiAnchor,
  FiBarChart2,
  FiStar,
  FiHeart,
  FiBell,
  FiSettings,
  FiHelpCircle,
  FiMaximize2,
  FiMinimize2,
  FiChevronsLeft,
  FiChevronsRight,
  FiTag,
  FiDollarSign,
  FiUsers,
  FiGrid,
  FiList,
  FiX,
  FiBox,
  FiLayers,
  FiInbox,
  FiArchive,
  FiRotateCw,
  FiTruck as FiTruckIcon,
  FiActivity,
  FiSave,
  FiShoppingBag,
  FiClipboard,
  FiTrendingUp,
  FiShield
} from 'react-icons/fi';

import { 
  BsTruck, 
  BsShip, 
  BsAirplane, 
  BsBoxSeam, 
  BsGraphUp, 
  BsPieChart,
  BsCalendarCheck,
  BsClockHistory,
  BsShieldCheck,
  BsFileEarmarkText,
  BsFolderSymlink,
  BsPeople,
  BsBuilding,
  BsGeoAlt,
  BsFlag,
  BsTelephone,
  BsEnvelope,
  BsArrowLeftRight,
  BsArrowRightShort,
  BsArrowLeftShort,
  BsBox,
  BsKanban,
  BsClipboardData,
  BsBuildingAdd,
  BsBuildingDash,
  BsHouseDoor,
  BsHouse,
  BsShop,
  BsShopWindow,
  BsCardChecklist,
  BsQrCodeScan
} from 'react-icons/bs';

import { 
  MdOutlineWarehouse, 
  MdOutlineInventory, 
  MdOutlineReceipt,
  MdOutlineAssignmentTurnedIn,
  MdOutlineCancel,
  MdOutlinePendingActions,
  MdOutlinePublishedWithChanges,
  MdOutlineInventory2,
  MdOutlineStorage,
  MdOutlineShelf,
  MdOutlineQrCodeScanner,
  MdOutlineDocumentScanner,
  MdOutlineFactCheck,
  MdOutlineTimeline,
  MdOutlineDashboard,
  MdOutlineBusinessCenter,
  MdOutlineStore,
  MdOutlineApartment,
  MdOutlineHomeWork,
  MdOutlineHouse,
  MdOutlineOtherHouses,
  MdOutlineFactory,
  MdOutlineBusiness,
  MdOutlineQrCode2,
  MdOutlineAddLocation,
  MdOutlineLocationOn,
  MdOutlineAssignment,
  MdOutlineContentPaste
} from 'react-icons/md';

import { 
  HiOutlineDocumentDownload, 
  HiOutlineDocumentReport,
  HiOutlinePhotograph,
  HiOutlineCamera,
  HiOutlineQrcode,
  HiOutlineClipboard,
  HiOutlineClipboardCheck,
  HiOutlineClipboardList,
  HiOutlineLocationMarker,
  HiOutlineCube,
  HiOutlineCubeTransparent,
  HiOutlineOfficeBuilding,
  HiOutlineHome,
  HiOutlineBuildingOffice,
  HiOutlineBuildingOffice2,
  HiOutlineDocumentText,
  HiOutlineDocumentDuplicate,
  HiOutlineDocumentReport as HiOutlineDocumentReportIcon
} from 'react-icons/hi';

import { 
  GiCargoShip, 
  GiCommercialAirplane, 
  GiCargoCrane,
  GiGoodsForklift,
  GiWeight,
  GiSpeedBoat,
  GiCargoShip as GiCargoShipIcon,
  GiConveyorBelt,
  GiPallets,
  GiCardboardBox,
  GiWarehouse,
  GiFactory,
  GiFactoryArm,
  GiCargoCrate,
  GiWoodCrate,
  GiMetalBar,
  GiCargoChain
} from 'react-icons/gi';

import { IoIosBus, IoIosTrain, IoIosAirplane, IoIosDocument, IoIosStats, IoIosBusiness, IoIosHome, IoIosPaper } from 'react-icons/io';

// ==================== COLOR CONSTANTS ====================
const COLORS = {
  primary: '#E67E22',
  secondary: '#122652',
  primaryLight: '#fef2e6',
  secondaryLight: '#e8ecf3',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  purple: '#8b5cf6',
  pink: '#ec4899',
  indigo: '#6366f1',
  orange: '#f97316',
  teal: '#14b8a6',
  cyan: '#06b6d4'
};

// Toast configuration
const toastConfig = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "colored"
};

// ==================== STATUS CONFIGURATIONS ====================
const WAREHOUSE_STATUS_CONFIG = {
  active: {
    label: 'Active',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
    icon: FiCheckCircle
  },
  inactive: {
    label: 'Inactive',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-200',
    icon: FiXCircle
  },
  maintenance: {
    label: 'Maintenance',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-200',
    icon: FiAlertCircle
  }
};

const INVENTORY_STATUS_CONFIG = {
  received: {
    label: 'Received',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    icon: FiPackage
  },
  inspected: {
    label: 'Inspected',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-200',
    icon: FiEye
  },
  stored: {
    label: 'In Storage',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
    icon: FiArchive
  },
  damaged: {
    label: 'Damaged',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
    icon: FiAlertCircle
  },
  consolidated: {
    label: 'Consolidated',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200',
    icon: FiLayers
  },
  loaded: {
    label: 'Loaded',
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-700',
    borderColor: 'border-indigo-200',
    icon: FiTruck
  },
  shipped: {
    label: 'Shipped',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-200',
    icon: FiTruckIcon
  }
};

const CONSOLIDATION_STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-200',
    icon: FiClock
  },
  in_progress: {
    label: 'In Progress',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    icon: FiRotateCw
  },
  completed: {
    label: 'Completed',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
    icon: FiCheckCircle
  },
  loaded: {
    label: 'Loaded',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200',
    icon: FiTruck
  },
  departed: {
    label: 'Departed',
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-700',
    borderColor: 'border-indigo-200',
    icon: FiNavigation
  },
  cancelled: {
    label: 'Cancelled',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
    icon: FiXCircle
  }
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
  const baseClasses = 'rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 inline-flex items-center justify-center';
  
  const variants = {
    primary: `bg-[${COLORS.primary}] text-white hover:bg-[#d35400] focus:ring-[${COLORS.primary}] shadow-sm shadow-[${COLORS.primary}]/20`,
    secondary: `bg-[${COLORS.secondary}] text-white hover:bg-[#0e1e3d] focus:ring-[${COLORS.secondary}] shadow-sm shadow-[${COLORS.secondary}]/20`,
    outline: `border-2 border-[${COLORS.primary}] text-[${COLORS.primary}] hover:bg-[${COLORS.primaryLight}] focus:ring-[${COLORS.primary}]`,
    light: 'bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500 border border-gray-200',
    success: `bg-[${COLORS.success}] text-white hover:bg-[#0d9488] focus:ring-[${COLORS.success}]`,
    danger: `bg-[${COLORS.danger}] text-white hover:bg-[#dc2626] focus:ring-[${COLORS.danger}]`,
    warning: `bg-[${COLORS.warning}] text-white hover:bg-[#d97706] focus:ring-[${COLORS.warning}]`,
    ghost: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-500'
  };

  const sizes = {
    xs: 'px-2.5 py-1.5 text-xs',
    sm: 'px-3.5 py-2 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base'
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
          <FiLoader className="h-4 w-4 mr-2 animate-spin" />
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
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
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
            w-full px-3.5 py-2.5 text-sm border rounded-xl shadow-sm
            focus:outline-none focus:ring-2 focus:ring-[${COLORS.primary}] focus:border-transparent
            ${Icon ? 'pl-10' : ''}
            ${error ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'}
            ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'hover:border-gray-300'}
            transition-colors duration-200
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
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
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Icon className="h-4 w-4 text-gray-400" />
          </div>
        )}
        <select
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`
            w-full px-3.5 py-2.5 text-sm border rounded-xl shadow-sm appearance-none
            focus:outline-none focus:ring-2 focus:ring-[${COLORS.primary}] focus:border-transparent
            ${Icon ? 'pl-10' : 'pl-3.5'}
            pr-10
            ${error ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'}
            ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'hover:border-gray-300'}
            transition-colors duration-200
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
          <FiChevronDown className="h-4 w-4 text-gray-400" />
        </div>
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
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
    <div className="space-y-1.5">
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
          w-full px-3.5 py-2.5 text-sm border rounded-xl shadow-sm
          focus:outline-none focus:ring-2 focus:ring-[${COLORS.primary}] focus:border-transparent
          ${error ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'}
          ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'hover:border-gray-300'}
          transition-colors duration-200
          ${className}
        `}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ status, config, onClick, clickable = false, size = 'md' }) => {
  const statusConfig = config[status] || {
    label: status,
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-200',
    icon: FiClock
  };
  
  const Icon = statusConfig.icon;
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  };

  return (
    <span 
      onClick={onClick}
      className={`inline-flex items-center rounded-full font-medium border ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor} ${sizes[size]} ${clickable ? 'cursor-pointer hover:opacity-80 transform hover:scale-105 transition-all' : ''}`}
    >
      <Icon className={`${size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} mr-1.5`} />
      {statusConfig.label}
    </span>
  );
};

// Warehouse Status Badge
const WarehouseStatusBadge = ({ status }) => {
  return <StatusBadge status={status} config={WAREHOUSE_STATUS_CONFIG} />;
};

// Inventory Status Badge
const InventoryStatusBadge = ({ status }) => {
  return <StatusBadge status={status} config={INVENTORY_STATUS_CONFIG} />;
};

// Consolidation Status Badge
const ConsolidationStatusBadge = ({ status }) => {
  return <StatusBadge status={status} config={CONSOLIDATION_STATUS_CONFIG} />;
};

// Progress Bar Component
const ProgressBar = ({ progress, height = 'h-2', showLabel = false, size = 'md' }) => {
  const sizes = {
    sm: { bar: 'h-1.5', text: 'text-xs' },
    md: { bar: 'h-2', text: 'text-sm' },
    lg: { bar: 'h-3', text: 'text-base' }
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1.5">
          <span className={`${sizes[size].text} text-gray-500`}>Capacity Usage</span>
          <span className={`${sizes[size].text} font-medium`} style={{ color: COLORS.primary }}>
            {progress}%
          </span>
        </div>
      )}
      <div className={`w-full bg-gray-100 rounded-full overflow-hidden ${sizes[size].bar}`}>
        <div 
          className="rounded-full transition-all duration-700 ease-out"
          style={{ 
            width: `${progress}%`, 
            background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.secondary})`,
            height: '100%'
          }}
        />
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color, trend, onClick, active }) => {
  return (
    <div 
      onClick={onClick}
      className={`
        bg-white rounded-2xl border p-5 cursor-pointer transition-all duration-300
        hover:shadow-lg hover:-translate-y-0.5
        ${active ? `border-[${COLORS.primary}] ring-2 ring-[${COLORS.primary}]/20 shadow-md` : 'border-gray-100 hover:border-gray-200'}
      `}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 mb-1 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
          {trend && (
            <p className={`text-xs ${trend > 0 ? 'text-green-600' : 'text-red-600'} mt-1 font-medium`}>
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

// Action Menu Component
const ActionMenu = ({ warehouse, onAction }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = React.useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const actions = [
    { label: 'View Details', icon: FiEye, action: 'view', color: 'text-blue-600' },
    { label: 'Edit Warehouse', icon: FiEdit, action: 'edit', color: 'text-green-600' },
    { label: 'View Inventory', icon: FiBox, action: 'inventory', color: 'text-purple-600' },
    { label: 'View Receipts', icon: FiFileText, action: 'receipts', color: 'text-orange-600' },
    { label: 'View Consolidations', icon: FiLayers, action: 'consolidations', color: 'text-indigo-600' },
    { label: 'Export Data', icon: FiDownload, action: 'export', color: 'text-teal-600' },
    { label: 'Generate Report', icon: FiBarChart2, action: 'report', color: 'text-cyan-600' },
    { label: 'Deactivate', icon: FiXCircle, action: 'deactivate', color: 'text-red-600' }
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-xl transition-colors group"
      >
        <FiMoreVertical className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 py-1 animate-in fade-in slide-in-from-top-2">
          {actions.map((action) => (
            <button
              key={action.action}
              onClick={() => {
                onAction(action.action, warehouse);
                setIsOpen(false);
              }}
              className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center transition-colors group"
            >
              <action.icon className={`h-4 w-4 mr-3 ${action.color} group-hover:scale-110 transition-transform`} />
              <span className="text-gray-700">{action.label}</span>
            </button>
          ))}
        </div>
      )}
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
          <div className="absolute inset-0 bg-gray-900 opacity-50 backdrop-blur-sm"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div className={`inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle ${sizes[size]} w-full animate-in fade-in zoom-in-95`}>
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-[${COLORS.primaryLight}] to-white">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <div className="w-1 h-6 rounded-full mr-3" style={{ background: `linear-gradient(to bottom, ${COLORS.primary}, ${COLORS.secondary})` }} />
              {title}
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiX className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          <div className="px-6 py-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// Create/Edit Warehouse Modal
const WarehouseModal = ({ isOpen, onClose, warehouse, onSave }) => {
  const [formData, setFormData] = useState({
    warehouseName: '',
    warehouseCode: '',
    address: '',
    city: '',
    country: '',
    capacity: '',
    usedCapacity: '',
    zones: [],
    isActive: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (warehouse) {
      setFormData({
        warehouseName: warehouse.warehouseName || '',
        warehouseCode: warehouse.warehouseCode || '',
        address: warehouse.address || '',
        city: warehouse.city || '',
        country: warehouse.country || '',
        capacity: warehouse.capacity || '',
        usedCapacity: warehouse.usedCapacity || '',
        zones: warehouse.zones || [],
        isActive: warehouse.isActive !== undefined ? warehouse.isActive : true
      });
    } else {
      setFormData({
        warehouseName: '',
        warehouseCode: '',
        address: '',
        city: '',
        country: '',
        capacity: '',
        usedCapacity: '',
        zones: [],
        isActive: true
      });
    }
  }, [warehouse]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.warehouseName || !formData.warehouseCode || !formData.address) {
      toast.warning('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      if (warehouse) {
        await onSave(warehouse._id, formData);
      } else {
        await onSave(formData);
      }
      onClose();
    } catch (error) {
      // Error handled in parent
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={warehouse ? 'Edit Warehouse' : 'Create New Warehouse'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Warehouse Name"
            name="warehouseName"
            value={formData.warehouseName}
            onChange={handleChange}
            placeholder="e.g., Dhaka Main Warehouse"
            required
            icon={MdOutlineWarehouse}
          />

          <Input
            label="Warehouse Code"
            name="warehouseCode"
            value={formData.warehouseCode}
            onChange={handleChange}
            placeholder="e.g., DKH-MAIN-01"
            required
            icon={FiTag}
          />
        </div>

        <TextArea
          label="Address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Full address..."
          required
          rows={2}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="City"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="e.g., Dhaka"
            icon={FiMapPin}
          />

          <Input
            label="Country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            placeholder="e.g., Bangladesh"
            icon={BsFlag}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            type="number"
            label="Total Capacity (sq ft)"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
            placeholder="e.g., 50000"
            icon={FiMaximize2}
          />

          <Input
            type="number"
            label="Used Capacity (sq ft)"
            name="usedCapacity"
            value={formData.usedCapacity}
            onChange={handleChange}
            placeholder="e.g., 35000"
            icon={FiMinimize2}
          />
        </div>

        <div className="border rounded-xl p-4 bg-gray-50">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              className="h-4 w-4 rounded border-gray-300 focus:ring-[${COLORS.primary}]"
              style={{ accentColor: COLORS.primary }}
            />
            <span className="text-sm font-medium text-gray-700">Active Warehouse</span>
          </label>
          <p className="text-xs text-gray-500 mt-1 ml-7">
            Inactive warehouses won't appear in active warehouse lists
          </p>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            type="button"
            variant="light"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={loading}
            icon={<FiSave className="h-4 w-4" />}
          >
            {warehouse ? 'Update Warehouse' : 'Create Warehouse'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Warehouse Details Modal
const WarehouseDetailsModal = ({ isOpen, onClose, warehouse }) => {
  const [activeTab, setActiveTab] = useState('details');
  const [inventory, setInventory] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [consolidations, setConsolidations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && warehouse) {
      fetchWarehouseData();
    }
  }, [isOpen, warehouse, activeTab]);

  const fetchWarehouseData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'inventory') {
        const result = await getWarehouseInventory({ warehouseId: warehouse._id, limit: 10 });
        if (result.success) setInventory(result.data || []);
      } else if (activeTab === 'receipts') {
        const result = await getWarehouseReceipts({ warehouseId: warehouse._id, limit: 10 });
        if (result.success) setReceipts(result.data || []);
      } else if (activeTab === 'consolidations') {
        const result = await getConsolidations({ warehouseId: warehouse._id, limit: 10 });
        if (result.success) setConsolidations(result.data || []);
      }
    } catch (error) {
      toast.error('Failed to fetch warehouse data');
    } finally {
      setLoading(false);
    }
  };

  if (!warehouse) return null;

  const capacityPercentage = calculateCapacityUsage(warehouse.capacity, warehouse.usedCapacity);
  const capacityColor = getCapacityColor(capacityPercentage);

  const tabs = [
    { id: 'details', label: 'Details', icon: MdOutlineWarehouse },
    { id: 'inventory', label: 'Inventory', icon: FiBox },
    { id: 'receipts', label: 'Receipts', icon: FiFileText },
    { id: 'consolidations', label: 'Consolidations', icon: FiLayers }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Warehouse: ${warehouse.warehouseName}`} size="xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-[${COLORS.primaryLight}] to-white p-4 rounded-xl border border-gray-100">
          <div>
            <div className="flex items-center space-x-3">
              <h4 className="text-lg font-semibold text-gray-900">
                {warehouse.warehouseName}
              </h4>
              <WarehouseStatusBadge status={warehouse.isActive ? 'active' : 'inactive'} />
            </div>
            <p className="text-sm text-gray-500 mt-1 flex items-center">
              <FiTag className="h-3.5 w-3.5 mr-1" />
              Code: {warehouse.warehouseCode}
            </p>
          </div>
        </div>

        {/* Capacity Progress */}
        {warehouse.capacity && (
          <div className="bg-gray-50 rounded-xl p-4">
            <ProgressBar progress={capacityPercentage} showLabel size="lg" />
            <div className="flex justify-between mt-2 text-xs">
              <span className="text-gray-500">Used: {formatWeight(warehouse.usedCapacity || 0)}</span>
              <span className="text-gray-500">Total: {formatWeight(warehouse.capacity)}</span>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-100">
          <nav className="flex space-x-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all flex items-center ${
                  activeTab === tab.id
                    ? `text-[${COLORS.primary}] border-b-2 border-[${COLORS.primary}] bg-[${COLORS.primaryLight}]/30`
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
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
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <FiLoader className="h-6 w-6 animate-spin" style={{ color: COLORS.primary }} />
              <span className="ml-2 text-sm text-gray-500">Loading...</span>
            </div>
          ) : (
            <>
              {activeTab === 'details' && (
                <div className="space-y-4">
                  {/* Address */}
                  <div className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border border-gray-100">
                    <h5 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
                      <div className="w-1 h-4 rounded-full mr-2" style={{ backgroundColor: COLORS.primary }} />
                      Location Information
                    </h5>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-500">Address</p>
                        <p className="text-sm text-gray-900">{warehouse.address || 'N/A'}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">City</p>
                          <p className="text-sm font-medium">{warehouse.city || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Country</p>
                          <p className="text-sm font-medium">{warehouse.country || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Zones */}
                  {warehouse.zones && warehouse.zones.length > 0 && (
                    <div className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border border-gray-100">
                      <h5 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
                        <div className="w-1 h-4 rounded-full mr-2" style={{ backgroundColor: COLORS.secondary }} />
                        Storage Zones
                      </h5>
                      <div className="grid grid-cols-2 gap-3">
                        {warehouse.zones.map((zone, index) => (
                          <div key={index} className="border rounded-lg p-3">
                            <p className="text-sm font-medium text-gray-900">{zone.name}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Capacity: {formatWeight(zone.capacity)} • Used: {formatWeight(zone.used)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'inventory' && (
                <div className="space-y-4">
                  {inventory.length > 0 ? (
                    <div className="border rounded-xl overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Package ID</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Type</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Location</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Weight</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {inventory.map((item) => (
                            <tr key={item._id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm">{item.packageId}</td>
                              <td className="px-4 py-3 text-sm">{getPackageTypeDisplay(item.packageType)}</td>
                              <td className="px-4 py-3 text-sm">{formatLocation(item.location)}</td>
                              <td className="px-4 py-3 text-sm">{formatWeight(item.weight)}</td>
                              <td className="px-4 py-3">
                                <InventoryStatusBadge status={item.status} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No inventory items found</p>
                  )}
                </div>
              )}

              {activeTab === 'receipts' && (
                <div className="space-y-4">
                  {receipts.length > 0 ? (
                    <div className="border rounded-xl overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Receipt #</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Packages</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {receipts.map((receipt) => (
                            <tr key={receipt._id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm font-medium">{receipt.receiptNumber}</td>
                              <td className="px-4 py-3 text-sm">{formatDate(receipt.receivedDate)}</td>
                              <td className="px-4 py-3 text-sm">{receipt.receivedPackages?.length || 0}</td>
                              <td className="px-4 py-3">
                                <InventoryStatusBadge status={receipt.status} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No receipts found</p>
                  )}
                </div>
              )}

              {activeTab === 'consolidations' && (
                <div className="space-y-4">
                  {consolidations.length > 0 ? (
                    <div className="border rounded-xl overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Consolidation #</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Container</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Shipments</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {consolidations.map((cons) => (
                            <tr key={cons._id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm font-medium">{cons.consolidationNumber}</td>
                              <td className="px-4 py-3 text-sm">{cons.containerNumber || 'N/A'}</td>
                              <td className="px-4 py-3 text-sm">{cons.shipments?.length || 0}</td>
                              <td className="px-4 py-3">
                                <ConsolidationStatusBadge status={cons.status} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No consolidations found</p>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
          <Button variant="light" onClick={onClose}>
            Close
          </Button>
          <Button 
            variant="primary"
            onClick={() => {
              onClose();
              // Open edit modal
            }}
            icon={<FiEdit className="h-4 w-4" />}
          >
            Edit Warehouse
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// Receive Shipment Modal
const ReceiveShipmentModal = ({ isOpen, onClose, shipment, onReceive }) => {
  const [formData, setFormData] = useState({
    receivedPackages: [],
    storageLocation: {
      zone: 'A',
      aisle: '1',
      rack: '1',
      bin: '1'
    },
    condition: 'Good',
    notes: '',
    warehouseId: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (shipment) {
      setFormData({
        receivedPackages: shipment.packages || [],
        storageLocation: {
          zone: 'A',
          aisle: '1',
          rack: '1',
          bin: '1'
        },
        condition: 'Good',
        notes: '',
        warehouseId: ''
      });
    }
  }, [shipment]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onReceive(shipment._id, formData);
      onClose();
    } catch (error) {
      // Error handled in parent
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Receive Shipment" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Zone"
            value={formData.storageLocation.zone}
            onChange={(e) => setFormData({
              ...formData,
              storageLocation: { ...formData.storageLocation, zone: e.target.value }
            })}
            placeholder="e.g., A"
            icon={MdOutlineLocationOn}
          />
          <Input
            label="Aisle"
            value={formData.storageLocation.aisle}
            onChange={(e) => setFormData({
              ...formData,
              storageLocation: { ...formData.storageLocation, aisle: e.target.value }
            })}
            placeholder="e.g., 1"
          />
          <Input
            label="Rack"
            value={formData.storageLocation.rack}
            onChange={(e) => setFormData({
              ...formData,
              storageLocation: { ...formData.storageLocation, rack: e.target.value }
            })}
            placeholder="e.g., 1"
          />
          <Input
            label="Bin"
            value={formData.storageLocation.bin}
            onChange={(e) => setFormData({
              ...formData,
              storageLocation: { ...formData.storageLocation, bin: e.target.value }
            })}
            placeholder="e.g., 1"
          />
        </div>

        <Select
          label="Condition"
          value={formData.condition}
          onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
          options={[
            { value: 'Good', label: 'Good' },
            { value: 'Damaged', label: 'Damaged' },
            { value: 'Partial', label: 'Partially Damaged' },
            { value: 'Missing', label: 'Missing Items' }
          ]}
          icon={FiShield}
        />

        <TextArea
          label="Notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Additional notes about the shipment..."
          rows={3}
        />

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="light" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={loading}>
            Receive Shipment
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Inspect Shipment Modal
const InspectShipmentModal = ({ isOpen, onClose, receipt, onInspect }) => {
  const [formData, setFormData] = useState({
    condition: 'Good',
    findings: '',
    photos: []
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onInspect(receipt._id, formData);
      onClose();
    } catch (error) {
      // Error handled in parent
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Inspect Shipment" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Condition"
          value={formData.condition}
          onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
          options={[
            { value: 'Good', label: 'Good' },
            { value: 'Damaged', label: 'Damaged' },
            { value: 'Partial', label: 'Partially Damaged' },
            { value: 'Missing', label: 'Missing Items' }
          ]}
          icon={FiEye}
        />

        <TextArea
          label="Findings"
          value={formData.findings}
          onChange={(e) => setFormData({ ...formData, findings: e.target.value })}
          placeholder="Describe the condition and any findings..."
          rows={4}
          required
        />

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="light" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={loading}>
            Complete Inspection
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Start Consolidation Modal
const StartConsolidationModal = ({ isOpen, onClose, onStart }) => {
  const [formData, setFormData] = useState({
    shipmentIds: [],
    containerType: '20ft',
    containerNumber: '',
    sealNumber: '',
    destinationPort: '',
    estimatedDeparture: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onStart(formData);
      onClose();
    } catch (error) {
      // Error handled in parent
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Start Consolidation" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Container Type"
            value={formData.containerType}
            onChange={(e) => setFormData({ ...formData, containerType: e.target.value })}
            options={[
              { value: '20ft', label: '20ft Container' },
              { value: '40ft', label: '40ft Container' },
              { value: '40ft_hc', label: '40ft High Cube' },
              { value: '45ft', label: '45ft Container' }
            ]}
            icon={GiCargoShip}
          />

          <Input
            label="Container Number"
            value={formData.containerNumber}
            onChange={(e) => setFormData({ ...formData, containerNumber: e.target.value })}
            placeholder="e.g., MSCU1234567"
            icon={FiTag}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Seal Number"
            value={formData.sealNumber}
            onChange={(e) => setFormData({ ...formData, sealNumber: e.target.value })}
            placeholder="e.g., SL123456"
            icon={FiShield}
          />

          <Input
            label="Destination Port"
            value={formData.destinationPort}
            onChange={(e) => setFormData({ ...formData, destinationPort: e.target.value })}
            placeholder="e.g., Los Angeles"
            icon={FiNavigation}
          />
        </div>

        <Input
          type="date"
          label="Estimated Departure"
          value={formData.estimatedDeparture}
          onChange={(e) => setFormData({ ...formData, estimatedDeparture: e.target.value })}
          icon={FiCalendar}
        />

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="light" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={loading}>
            Start Consolidation
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Update Location Modal
const UpdateLocationModal = ({ isOpen, onClose, inventory, onUpdate }) => {
  const [formData, setFormData] = useState({
    zone: '',
    aisle: '',
    rack: '',
    bin: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (inventory) {
      setFormData({
        zone: inventory.location?.zone || '',
        aisle: inventory.location?.aisle || '',
        rack: inventory.location?.rack || '',
        bin: inventory.location?.bin || ''
      });
    }
  }, [inventory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onUpdate(inventory._id, formData);
      onClose();
    } catch (error) {
      // Error handled in parent
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Update Inventory Location" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Zone"
            value={formData.zone}
            onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
            placeholder="e.g., A"
            required
          />
          <Input
            label="Aisle"
            value={formData.aisle}
            onChange={(e) => setFormData({ ...formData, aisle: e.target.value })}
            placeholder="e.g., 1"
            required
          />
          <Input
            label="Rack"
            value={formData.rack}
            onChange={(e) => setFormData({ ...formData, rack: e.target.value })}
            placeholder="e.g., 1"
            required
          />
          <Input
            label="Bin"
            value={formData.bin}
            onChange={(e) => setFormData({ ...formData, bin: e.target.value })}
            placeholder="e.g., 1"
            required
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="light" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={loading}>
            Update Location
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Helper function for date formatting
const formatDate = (dateString, format = 'short') => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  
  if (format === 'short') {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  
  if (format === 'long') {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// ==================== MAIN COMPONENT ====================
export default function WarehousesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [warehouses, setWarehouses] = useState([]);
  const [filteredWarehouses, setFilteredWarehouses] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [expectedShipments, setExpectedShipments] = useState([]);
  const [recentReceipts, setRecentReceipts] = useState([]);
  const [inventoryByZone, setInventoryByZone] = useState([]);
  const [consolidations, setConsolidations] = useState([]);

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    totalCapacity: 0,
    usedCapacity: 0,
    expectedToday: 0,
    receivedToday: 0,
    pendingReceipt: 0,
    inWarehouse: 0,
    readyForConsolidation: 0,
    inConsolidation: 0
  });

  // Filter State
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    country: '',
    zone: '',
    inventoryStatus: ''
  });

  const [showFilters, setShowFilters] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [selectedConsolidation, setSelectedConsolidation] = useState(null);

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showInspectModal, setShowInspectModal] = useState(false);
  const [showConsolidationModal, setShowConsolidationModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [activeTab, setActiveTab] = useState('warehouses'); // warehouses, inventory, receipts, consolidations, dashboard

  // Fetch all data
  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch warehouses
      const warehousesRes = await getAllWarehouses();
      if (warehousesRes.success) {
        setWarehouses(warehousesRes.data || []);
        setFilteredWarehouses(warehousesRes.data || []);
      }

      // Fetch dashboard data
      const dashboardRes = await getWarehouseDashboard();
      if (dashboardRes.success) {
        setDashboardData(dashboardRes.data);
        setStats(prev => ({
          ...prev,
          expectedToday: dashboardRes.data?.summary?.expectedToday || 0,
          receivedToday: dashboardRes.data?.summary?.receivedToday || 0,
          pendingReceipt: dashboardRes.data?.summary?.pendingReceipt || 0,
          inWarehouse: dashboardRes.data?.summary?.inWarehouse || 0,
          readyForConsolidation: dashboardRes.data?.summary?.readyForConsolidation || 0,
          inConsolidation: dashboardRes.data?.summary?.inConsolidation || 0
        }));
        setRecentReceipts(dashboardRes.data?.recentReceipts || []);
        setInventoryByZone(dashboardRes.data?.inventoryByZone || []);
      }

      // Fetch expected shipments
      const expectedRes = await getExpectedShipments({ limit: 5 });
      if (expectedRes.success) {
        setExpectedShipments(expectedRes.data || []);
      }

      // Fetch consolidations
      const consRes = await getConsolidations({ limit: 5 });
      if (consRes.success) {
        setConsolidations(consRes.data || []);
      }

      // Calculate warehouse stats
      if (warehousesRes.success && warehousesRes.data) {
        const newStats = {
          total: warehousesRes.data.length || 0,
          active: 0,
          inactive: 0,
          totalCapacity: 0,
          usedCapacity: 0
        };
        
        warehousesRes.data.forEach(warehouse => {
          if (warehouse.isActive) {
            newStats.active++;
          } else {
            newStats.inactive++;
          }
          newStats.totalCapacity += warehouse.capacity || 0;
          newStats.usedCapacity += warehouse.usedCapacity || 0;
        });
        
        setStats(prev => ({ ...prev, ...newStats }));
      }

    } catch (error) {
      toast.error('Failed to fetch warehouse data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Handle Search and Filters
  useEffect(() => {
    let filtered = [...warehouses];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(w => 
        w.warehouseName?.toLowerCase().includes(searchLower) ||
        w.warehouseCode?.toLowerCase().includes(searchLower) ||
        w.city?.toLowerCase().includes(searchLower) ||
        w.country?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.status) {
      filtered = filtered.filter(w => 
        filters.status === 'active' ? w.isActive : !w.isActive
      );
    }

    if (filters.country) {
      filtered = filtered.filter(w => w.country === filters.country);
    }

    setFilteredWarehouses(filtered);
  }, [filters, warehouses]);

  // Handle Filter Change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Clear Filters
  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      country: '',
      zone: '',
      inventoryStatus: ''
    });
    toast.info('Filters cleared');
  };

  // Handle Actions
  const handleAction = (action, warehouse) => {
    setSelectedWarehouse(warehouse);
    
    switch (action) {
      case 'view':
        setShowDetailsModal(true);
        break;
      case 'edit':
        setShowEditModal(true);
        break;
      case 'inventory':
        router.push(`/warehouses/${warehouse._id}/inventory`);
        break;
      case 'receipts':
        router.push(`/warehouses/${warehouse._id}/receipts`);
        break;
      case 'consolidations':
        router.push(`/warehouses/${warehouse._id}/consolidations`);
        break;
      case 'export':
        handleExportWarehouse(warehouse);
        break;
      case 'report':
        handleGenerateReport(warehouse);
        break;
      case 'deactivate':
        handleDeactivateWarehouse(warehouse);
        break;
      default:
        break;
    }
  };

  // Handle Create Warehouse
  const handleCreateWarehouse = async (warehouseData) => {
    try {
      const result = await createWarehouse(warehouseData);
      if (result.success) {
        toast.success('Warehouse created successfully!');
        fetchAllData();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to create warehouse');
    }
  };

  // Handle Update Warehouse
  const handleUpdateWarehouse = async (warehouseId, updateData) => {
    try {
      const result = await updateWarehouse(warehouseId, updateData);
      if (result.success) {
        toast.success('Warehouse updated successfully!');
        fetchAllData();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to update warehouse');
    }
  };

  // Handle Receive Shipment
  const handleReceiveShipment = async (shipmentId, receiptData) => {
    try {
      const result = await receiveShipment(shipmentId, receiptData);
      if (result.success) {
        toast.success('Shipment received successfully!');
        fetchAllData();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to receive shipment');
    }
  };

  // Handle Inspect Shipment
  const handleInspectShipment = async (receiptId, inspectionData) => {
    try {
      const result = await inspectShipment(receiptId, inspectionData);
      if (result.success) {
        toast.success('Shipment inspected successfully!');
        fetchAllData();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to inspect shipment');
    }
  };

  // Handle Start Consolidation
  const handleStartConsolidation = async (consolidationData) => {
    try {
      const result = await startConsolidation(consolidationData);
      if (result.success) {
        toast.success('Consolidation started successfully!');
        fetchAllData();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to start consolidation');
    }
  };

  // Handle Update Location
  const handleUpdateLocation = async (inventoryId, locationData) => {
    try {
      const result = await updateInventoryLocation(inventoryId, locationData);
      if (result.success) {
        toast.success('Location updated successfully!');
        fetchAllData();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to update location');
    }
  };

  // Handle Complete Consolidation
  const handleCompleteConsolidation = async (consolidationId, completionData) => {
    try {
      const result = await completeConsolidation(consolidationId, completionData);
      if (result.success) {
        toast.success('Consolidation completed successfully!');
        fetchAllData();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to complete consolidation');
    }
  };

  // Handle Load and Depart
  const handleLoadAndDepart = async (consolidationId, departureData) => {
    try {
      const result = await loadAndDepartConsolidation(consolidationId, departureData);
      if (result.success) {
        toast.success('Consolidation departed successfully!');
        fetchAllData();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to depart consolidation');
    }
  };

  // Handle Export Warehouse Data
  const handleExportWarehouse = async (warehouse) => {
    try {
      await exportInventoryToCSV({ warehouseId: warehouse._id });
      toast.success('Warehouse data exported successfully!');
    } catch (error) {
      toast.error('Failed to export warehouse data');
    }
  };

  // Handle Generate Report
  const handleGenerateReport = (warehouse) => {
    toast.info('Report generation feature coming soon');
  };

  // Handle Deactivate Warehouse
  const handleDeactivateWarehouse = async (warehouse) => {
    if (!confirm(`Are you sure you want to deactivate ${warehouse.warehouseName}?`)) {
      return;
    }

    try {
      const result = await updateWarehouse(warehouse._id, { isActive: false });
      if (result.success) {
        toast.success('Warehouse deactivated successfully!');
        fetchAllData();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to deactivate warehouse');
    }
  };

  // Handle Generate Receipt PDF
  const handleGenerateReceiptPDF = async (receiptId) => {
    try {
      await generateReceiptPDF(receiptId);
      toast.success('Receipt PDF generated successfully!');
    } catch (error) {
      toast.error('Failed to generate receipt PDF');
    }
  };

  // Handle Generate Packing List
  const handleGeneratePackingList = async (consolidationId) => {
    try {
      await generatePackingListPDF(consolidationId);
      toast.success('Packing list generated successfully!');
    } catch (error) {
      toast.error('Failed to generate packing list');
    }
  };

  // Get unique countries for filter
  const countries = [...new Set(warehouses.map(w => w.country).filter(Boolean))];

  // Stat Cards
  const statCards = [
    { 
      key: 'total', 
      label: 'Total Warehouses', 
      value: stats.total, 
      icon: MdOutlineWarehouse, 
      color: 'bg-blue-100 text-blue-600' 
    },
    { 
      key: 'active', 
      label: 'Active', 
      value: stats.active, 
      icon: FiCheckCircle, 
      color: 'bg-green-100 text-green-600' 
    },
    { 
      key: 'inactive', 
      label: 'Inactive', 
      value: stats.inactive, 
      icon: FiXCircle, 
      color: 'bg-gray-100 text-gray-600' 
    },
    { 
      key: 'capacity', 
      label: 'Total Capacity', 
      value: formatWeight(stats.totalCapacity), 
      icon: FiMaximize2, 
      color: 'bg-purple-100 text-purple-600' 
    },
    { 
      key: 'used', 
      label: 'Used Capacity', 
      value: formatWeight(stats.usedCapacity), 
      icon: FiMinimize2, 
      color: 'bg-orange-100 text-orange-600' 
    }
  ];

  // Dashboard Stats Cards
  const dashboardStats = [
    { label: 'Expected Today', value: stats.expectedToday, icon: FiTruck, color: 'bg-blue-100 text-blue-600' },
    { label: 'Received Today', value: stats.receivedToday, icon: FiPackage, color: 'bg-green-100 text-green-600' },
    { label: 'Pending Receipt', value: stats.pendingReceipt, icon: FiClock, color: 'bg-yellow-100 text-yellow-600' },
    { label: 'In Warehouse', value: stats.inWarehouse, icon: FiArchive, color: 'bg-purple-100 text-purple-600' },
    { label: 'Ready for Consolidation', value: stats.readyForConsolidation, icon: FiLayers, color: 'bg-indigo-100 text-indigo-600' },
    { label: 'In Consolidation', value: stats.inConsolidation, icon: GiCargoShip, color: 'bg-cyan-100 text-cyan-600' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ 
                  background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
                  boxShadow: `0 10px 15px -3px ${COLORS.primary}30`
                }}
              >
                <MdOutlineWarehouse className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Warehouse Management</h1>
                <p className="text-sm text-gray-500">Manage warehouses, inventory, receipts and consolidations</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              <Button
                variant="light"
                size="md"
                icon={<FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />}
                onClick={fetchAllData}
              >
                Refresh
              </Button>
              <Button
                variant="primary"
                size="md"
                icon={<FiPlus className="h-4 w-4" />}
                onClick={() => setShowCreateModal(true)}
              >
                Add Warehouse
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 -mb-px">
            {[
              { id: 'warehouses', label: 'Warehouses', icon: MdOutlineWarehouse },
              { id: 'dashboard', label: 'Dashboard', icon: FiTrendingUp },
              { id: 'inventory', label: 'Inventory', icon: FiBox },
              { id: 'receipts', label: 'Receipts', icon: FiFileText },
              { id: 'consolidations', label: 'Consolidations', icon: FiLayers },
              { id: 'expected', label: 'Expected Shipments', icon: FiTruck }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all flex items-center ${
                  activeTab === tab.id
                    ? `text-[${COLORS.primary}] border-b-2 border-[${COLORS.primary}] bg-[${COLORS.primaryLight}]/30`
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12">
            <div className="flex flex-col items-center justify-center">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
                <div 
                  className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin absolute top-0 left-0"
                  style={{ borderColor: `${COLORS.primary} transparent transparent transparent` }}
                ></div>
              </div>
              <p className="mt-4 text-sm text-gray-500">Loading warehouse data...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Cards - Show different stats based on active tab */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              {activeTab === 'warehouses' && statCards.map((stat) => (
                <StatCard
                  key={stat.key}
                  title={stat.label}
                  value={stat.value}
                  icon={stat.icon}
                  color={stat.color}
                />
              ))}
              {activeTab === 'dashboard' && dashboardStats.map((stat, index) => (
                <StatCard
                  key={index}
                  title={stat.label}
                  value={stat.value}
                  icon={stat.icon}
                  color={stat.color}
                />
              ))}
            </div>

            {/* Search and Filters - Only show for warehouses tab */}
            {activeTab === 'warehouses' && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-6">
                <div className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-1">
                      <Input
                        type="text"
                        placeholder="Search by name, code, city, country..."
                        value={filters.search}
                        onChange={handleFilterChange}
                        icon={FiSearch}
                      />
                    </div>
                    <Button
                      variant={showFilters ? 'primary' : 'light'}
                      size="md"
                      onClick={() => setShowFilters(!showFilters)}
                      icon={<FiFilter className="h-4 w-4" />}
                    >
                      Filters
                      {(filters.status || filters.country) && (
                        <span className="ml-2 bg-white text-[${COLORS.primary}] rounded-full px-2 py-0.5 text-xs font-medium">
                          {Object.values(filters).filter(Boolean).length}
                        </span>
                      )}
                    </Button>
                    {(filters.search || filters.status || filters.country) && (
                      <Button
                        variant="light"
                        size="md"
                        onClick={clearFilters}
                        icon={<FiX className="h-4 w-4" />}
                      >
                        Clear
                      </Button>
                    )}
                  </div>

                  {/* Advanced Filters */}
                  {showFilters && (
                    <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Select
                        name="status"
                        value={filters.status}
                        onChange={handleFilterChange}
                        options={[
                          { value: 'active', label: 'Active' },
                          { value: 'inactive', label: 'Inactive' }
                        ]}
                        placeholder="All Statuses"
                        label="Status"
                        icon={FiActivity}
                      />

                      <Select
                        name="country"
                        value={filters.country}
                        onChange={handleFilterChange}
                        options={countries.map(c => ({ value: c, label: c }))}
                        placeholder="All Countries"
                        label="Country"
                        icon={BsFlag}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab Content */}
            {activeTab === 'warehouses' && (
              <>
                {filteredWarehouses.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                    <MdOutlineWarehouse className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No warehouses found</h3>
                    <p className="text-sm text-gray-500 mb-6">Get started by creating your first warehouse</p>
                    <Button
                      variant="primary"
                      onClick={() => setShowCreateModal(true)}
                      icon={<FiPlus className="h-4 w-4" />}
                    >
                      Add Warehouse
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredWarehouses.map((warehouse) => {
                      const capacityPercentage = calculateCapacityUsage(warehouse.capacity, warehouse.usedCapacity);

                      return (
                        <div
                          key={warehouse._id}
                          className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                          onClick={() => {
                            setSelectedWarehouse(warehouse);
                            setShowDetailsModal(true);
                          }}
                        >
                          <div className="p-5">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <div 
                                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                                  style={{ 
                                    background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
                                  }}
                                >
                                  <MdOutlineWarehouse className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                  <h3 className="text-sm font-semibold text-gray-900">{warehouse.warehouseName}</h3>
                                  <p className="text-xs text-gray-500">{warehouse.warehouseCode}</p>
                                </div>
                              </div>
                              <WarehouseStatusBadge status={warehouse.isActive ? 'active' : 'inactive'} />
                            </div>

                            {/* Location */}
                            <div className="flex items-center space-x-2 mb-3 p-2 bg-gray-50 rounded-xl">
                              <FiMapPin className="h-3.5 w-3.5 text-gray-400" />
                              <span className="text-xs text-gray-600">
                                {[warehouse.city, warehouse.country].filter(Boolean).join(', ') || 'Location not set'}
                              </span>
                            </div>

                            {/* Capacity */}
                            {warehouse.capacity && (
                              <div className="mb-3">
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-gray-500">Capacity Usage</span>
                                  <span className="font-medium" style={{ color: COLORS.primary }}>
                                    {capacityPercentage}%
                                  </span>
                                </div>
                                <ProgressBar progress={capacityPercentage} />
                              </div>
                            )}

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-2 mb-3">
                              <div className="bg-gray-50 rounded-xl p-2">
                                <p className="text-xs text-gray-500">Total Capacity</p>
                                <p className="text-sm font-medium text-gray-900">{formatWeight(warehouse.capacity || 0)}</p>
                              </div>
                              <div className="bg-gray-50 rounded-xl p-2">
                                <p className="text-xs text-gray-500">Used</p>
                                <p className="text-sm font-medium text-gray-900">{formatWeight(warehouse.usedCapacity || 0)}</p>
                              </div>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                              <div className="flex items-center space-x-2">
                                <FiBox className="h-3.5 w-3.5 text-gray-400" />
                                <span className="text-xs text-gray-500">Inventory</span>
                              </div>
                              <div onClick={(e) => e.stopPropagation()}>
                                <ActionMenu warehouse={warehouse} onAction={handleAction} />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Recent Receipts */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FiFileText className="h-5 w-5 mr-2" style={{ color: COLORS.primary }} />
                    Recent Receipts
                  </h3>
                  {recentReceipts.length > 0 ? (
                    <div className="space-y-3">
                      {recentReceipts.map((receipt) => (
                        <div key={receipt._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                          <div className="flex items-center space-x-3">
                            <FiPackage className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{receipt.receiptNumber}</p>
                              <p className="text-xs text-gray-500">{formatDate(receipt.receivedDate)}</p>
                            </div>
                          </div>
                          <InventoryStatusBadge status={receipt.status} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No recent receipts</p>
                  )}
                </div>

                {/* Inventory by Zone */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FiBox className="h-5 w-5 mr-2" style={{ color: COLORS.primary }} />
                    Inventory by Zone
                  </h3>
                  {inventoryByZone.length > 0 ? (
                    <div className="space-y-3">
                      {inventoryByZone.map((zone, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Zone {zone._id}</p>
                            <p className="text-xs text-gray-500">{zone.count} items • {formatWeight(zone.totalWeight)}</p>
                          </div>
                          <span className="text-sm font-medium" style={{ color: COLORS.primary }}>
                            {zone.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No inventory data</p>
                  )}
                </div>

                {/* Expected Shipments */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FiTruck className="h-5 w-5 mr-2" style={{ color: COLORS.primary }} />
                    Expected Shipments
                  </h3>
                  {expectedShipments.length > 0 ? (
                    <div className="space-y-3">
                      {expectedShipments.map((shipment) => (
                        <div key={shipment._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{shipment.trackingNumber}</p>
                            <p className="text-xs text-gray-500">{shipment.customerId?.companyName}</p>
                          </div>
                          <Button
                            size="xs"
                            variant="primary"
                            onClick={() => {
                              setSelectedShipment(shipment);
                              setShowReceiveModal(true);
                            }}
                          >
                            Receive
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No expected shipments</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'inventory' && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory Management</h3>
                <p className="text-sm text-gray-500 text-center py-8">Select a warehouse to view inventory</p>
              </div>
            )}

            {activeTab === 'receipts' && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Receipts Management</h3>
                <p className="text-sm text-gray-500 text-center py-8">Select a warehouse to view receipts</p>
              </div>
            )}

            {activeTab === 'consolidations' && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Consolidations Management</h3>
                <p className="text-sm text-gray-500 text-center py-8">Select a warehouse to view consolidations</p>
              </div>
            )}

            {activeTab === 'expected' && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Expected Shipments</h3>
                {expectedShipments.length > 0 ? (
                  <div className="space-y-3">
                    {expectedShipments.map((shipment) => (
                      <div key={shipment._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center space-x-4">
                          <FiPackage className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{shipment.trackingNumber}</p>
                            <p className="text-xs text-gray-500">{shipment.customerId?.companyName}</p>
                            <p className="text-xs text-gray-400 mt-1">{shipment.packages?.length} packages</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <StatusBadge status={shipment.status} config={INVENTORY_STATUS_CONFIG} />
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => {
                              setSelectedShipment(shipment);
                              setShowReceiveModal(true);
                            }}
                          >
                            Receive
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-8">No expected shipments</p>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <WarehouseModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateWarehouse}
      />

      <WarehouseModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        warehouse={selectedWarehouse}
        onSave={handleUpdateWarehouse}
      />

      <WarehouseDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        warehouse={selectedWarehouse}
      />

      <ReceiveShipmentModal
        isOpen={showReceiveModal}
        onClose={() => setShowReceiveModal(false)}
        shipment={selectedShipment}
        onReceive={handleReceiveShipment}
      />

      <InspectShipmentModal
        isOpen={showInspectModal}
        onClose={() => setShowInspectModal(false)}
        receipt={selectedReceipt}
        onInspect={handleInspectShipment}
      />

      <StartConsolidationModal
        isOpen={showConsolidationModal}
        onClose={() => setShowConsolidationModal(false)}
        onStart={handleStartConsolidation}
      />

      <UpdateLocationModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        inventory={selectedInventory}
        onUpdate={handleUpdateLocation}
      />
    </div>
  );
}