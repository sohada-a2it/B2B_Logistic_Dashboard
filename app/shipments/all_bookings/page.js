// app/bookings/page.js
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { getBookings } from '@/Api/booking';

// Icons
import {
  Package, Search, Filter, ChevronDown, ChevronLeft, ChevronRight,
  Eye, Edit, Download, Plus, Calendar, MapPin, User,
  Truck, Ship, Plane, Clock, CheckCircle, XCircle,
  AlertCircle, RefreshCw, Loader2, FileText, MoreVertical,
  ArrowUpDown, Download as ExportIcon, Filter as FilterIcon,
  X, Home, Briefcase, Globe, Hash, Tag, DollarSign,
  ChevronsLeft, ChevronsRight
} from 'lucide-react';

// Compact Button Component
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
  iconPosition = 'left'
}) => {
  const baseClasses = 'rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 inline-flex items-center justify-center';
  
  const variants = {
    primary: 'bg-[#2563eb] text-white hover:bg-[#1d4ed8] focus:ring-[#2563eb] shadow-sm',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-400 border border-gray-300',
    outline: 'border border-[#2563eb] text-[#2563eb] hover:bg-blue-50 focus:ring-[#2563eb]',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
    success: 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-500',
    warning: 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500'
  };

  const sizes = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2.5 text-base'
  };

  return (
    <button
      type={type}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className} ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      disabled={disabled || isLoading}
      onClick={onClick}
    >
      {isLoading ? (
        <div className="flex items-center">
          <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
          <span>Loading...</span>
        </div>
      ) : (
        <div className="flex items-center">
          {icon && iconPosition === 'left' && <span className="mr-1.5">{icon}</span>}
          {children}
          {icon && iconPosition === 'right' && <span className="ml-1.5">{icon}</span>}
        </div>
      )}
    </button>
  );
};

// Compact Input Component
const Input = ({
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  icon: Icon,
  className = '',
  ...props
}) => {
  return (
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
          <Icon className="h-3.5 w-3.5 text-gray-400" />
        </div>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`
          w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm
          focus:outline-none focus:ring-1 focus:ring-[#2563eb] focus:border-[#2563eb]
          ${Icon ? 'pl-8' : ''}
          ${className}
        `}
        {...props}
      />
    </div>
  );
};

// Compact Select Component
const Select = ({
  name,
  value,
  onChange,
  options,
  placeholder = 'All',
  icon: Icon,
  className = ''
}) => {
  return (
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
          <Icon className="h-3.5 w-3.5 text-gray-400" />
        </div>
      )}
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`
          w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm appearance-none
          focus:outline-none focus:ring-1 focus:ring-[#2563eb] focus:border-[#2563eb]
          ${Icon ? 'pl-8' : 'pl-3'}
          pr-8
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
      <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
        <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
      </div>
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
    confirmed: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: CheckCircle },
    processing: { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: RefreshCw },
    shipped: { color: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: Truck },
    delivered: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
    cancelled: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
    on_hold: { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: AlertCircle }
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
      <Icon className="h-3 w-3 mr-1" />
      {status ? status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ') : 'Unknown'}
    </span>
  );
};

// Shipment Type Icon
const ShipmentTypeIcon = ({ type }) => {
  const icons = {
    air_freight: { icon: Plane, color: 'text-blue-600' },
    sea_freight: { icon: Ship, color: 'text-indigo-600' },
    express_courier: { icon: Package, color: 'text-green-600' }
  };

  const config = icons[type] || { icon: Package, color: 'text-gray-600' };
  const Icon = config.icon;

  return <Icon className={`h-4 w-4 ${config.color}`} />;
};

// Main Component
export default function BookingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
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

  // Options
  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'on_hold', label: 'On Hold' }
  ];

  const shipmentTypeOptions = [
    { value: 'air_freight', label: 'Air Freight' },
    { value: 'sea_freight', label: 'Sea Freight' },
    { value: 'express_courier', label: 'Express Courier' }
  ];

  const originOptions = [
    { value: 'China Warehouse', label: 'China' },
    { value: 'Thailand Warehouse', label: 'Thailand' },
    { value: 'Vietnam Warehouse', label: 'Vietnam' }
  ];

  const destinationOptions = [
    { value: 'USA', label: 'USA' },
    { value: 'UK', label: 'UK' },
    { value: 'Canada', label: 'Canada' },
    { value: 'Germany', label: 'Germany' }
  ];

  // Fetch Bookings
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await getBookings(filters);
      if (response.success) {
        setBookings(response.data);
        setPagination(response.pagination);
      } else {
        toast.error('Failed to fetch bookings');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [filters.page, filters.limit, filters.status, filters.shipmentType, filters.origin, filters.destination, filters.startDate, filters.endDate, filters.search]);

  // Handle Filter Change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  // Handle Search
  const handleSearch = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }));
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

  // Select All
  const selectAll = () => {
    if (selectedBookings.length === bookings.length) {
      setSelectedBookings([]);
    } else {
      setSelectedBookings(bookings.map(b => b._id));
    }
  };

  // Select Single
  const selectBooking = (id) => {
    if (selectedBookings.includes(id)) {
      setSelectedBookings(selectedBookings.filter(bId => bId !== id));
    } else {
      setSelectedBookings([...selectedBookings, id]);
    }
  };

  // Export Data
  const exportBookings = () => {
    toast.info('Exporting bookings...');
    // Implement export logic
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center space-x-4">
              <h1 className="text-base font-semibold text-gray-900 flex items-center">
                <Package className="h-4 w-4 mr-1.5 text-[#2563eb]" />
                All Bookings
              </h1>
              {pagination.total > 0 && (
                <span className="text-xs text-gray-500">
                  Total: {pagination.total}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={exportBookings}
                icon={<ExportIcon className="h-3.5 w-3.5" />}
              >
                Export
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => router.push('/create-booking')}
                icon={<Plus className="h-3.5 w-3.5" />}
              >
                New Booking
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg border shadow-sm mb-4">
          <div className="p-3">
            <div className="flex items-center space-x-2">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Search by booking ID, customer, reference..."
                  value={filters.search}
                  onChange={handleSearch}
                  icon={Search}
                />
              </div>
              <Button
                variant={showFilters ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                icon={<FilterIcon className="h-3.5 w-3.5" />}
              >
                Filters
                {(filters.status || filters.shipmentType || filters.origin || filters.destination) && (
                  <span className="ml-1.5 bg-blue-100 text-blue-800 rounded-full px-1.5 py-0.5 text-xs">
                    {Object.values(filters).filter(v => v && v !== '').length - 2}
                  </span>
                )}
              </Button>
              {(filters.search || filters.status || filters.shipmentType || filters.origin || filters.destination) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  icon={<X className="h-3.5 w-3.5" />}
                >
                  Clear
                </Button>
              )}
              <Button
                variant="secondary"
                size="sm"
                onClick={fetchBookings}
                icon={<RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />}
              />
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-3 pt-3 border-t grid grid-cols-2 md:grid-cols-4 gap-2">
                <Select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  options={statusOptions}
                  placeholder="All Status"
                  icon={Clock}
                />
                
                <Select
                  name="shipmentType"
                  value={filters.shipmentType}
                  onChange={handleFilterChange}
                  options={shipmentTypeOptions}
                  placeholder="All Types"
                  icon={Package}
                />

                <Select
                  name="origin"
                  value={filters.origin}
                  onChange={handleFilterChange}
                  options={originOptions}
                  placeholder="All Origins"
                  icon={MapPin}
                />

                <Select
                  name="destination"
                  value={filters.destination}
                  onChange={handleFilterChange}
                  options={destinationOptions}
                  placeholder="All Destinations"
                  icon={Globe}
                />

                <Input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  placeholder="Start Date"
                  icon={Calendar}
                />

                <Input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  placeholder="End Date"
                  icon={Calendar}
                />
              </div>
            )}
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedBookings.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg mb-4 p-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-blue-700">
                {selectedBookings.length} booking(s) selected
              </span>
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline" icon={<Download className="h-3.5 w-3.5" />}>
                  Export
                </Button>
                <Button size="sm" variant="danger" icon={<X className="h-3.5 w-3.5" />}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Bookings Table */}
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-8 px-3 py-2">
                    <input
                      type="checkbox"
                      checked={selectedBookings.length === bookings.length && bookings.length > 0}
                      onChange={selectAll}
                      className="h-3.5 w-3.5 text-[#2563eb] focus:ring-[#2563eb] border-gray-300 rounded"
                    />
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort('bookingId')}>
                      Booking ID
                      <ArrowUpDown className="h-3.5 w-3.5 ml-1" />
                    </div>
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort('departureDate')}>
                      Dates
                      <ArrowUpDown className="h-3.5 w-3.5 ml-1" />
                    </div>
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cargo
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="9" className="px-3 py-8 text-center">
                      <div className="flex items-center justify-center">
                        <Loader2 className="h-5 w-5 text-[#2563eb] animate-spin" />
                        <span className="ml-2 text-sm text-gray-500">Loading bookings...</span>
                      </div>
                    </td>
                  </tr>
                ) : bookings.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-3 py-8 text-center">
                      <div className="flex flex-col items-center">
                        <Package className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">No bookings found</p>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => router.push('/create-booking')}
                          className="mt-2"
                          icon={<Plus className="h-3.5 w-3.5" />}
                        >
                          Create First Booking
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  bookings.map((booking) => (
                    <tr key={booking._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          checked={selectedBookings.includes(booking._id)}
                          onChange={() => selectBooking(booking._id)}
                          className="h-3.5 w-3.5 text-[#2563eb] focus:ring-[#2563eb] border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <div>
                          <div className="text-sm font-medium text-[#2563eb]">
                            #{booking.bookingId || booking._id.slice(-6).toUpperCase()}
                          </div>
                          {booking.customerReference && (
                            <div className="text-xs text-gray-500">
                              Ref: {booking.customerReference}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-sm font-medium text-gray-900">
                          {booking.deliveryAddress?.consigneeName || 'N/A'}
                        </div>
                        {booking.deliveryAddress?.companyName && (
                          <div className="text-xs text-gray-500">
                            {booking.deliveryAddress.companyName}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center text-xs">
                          <span className="font-medium text-gray-900">{booking.shipmentDetails?.origin}</span>
                          <ChevronRight className="h-3 w-3 mx-1 text-gray-400" />
                          <span className="font-medium text-gray-900">{booking.shipmentDetails?.destination}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center">
                          <ShipmentTypeIcon type={booking.shipmentDetails?.shipmentType} />
                          <span className="ml-1.5 text-xs text-gray-600">
                            {booking.shipmentDetails?.shippingMode || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-xs">
                          <div className="flex items-center text-gray-600">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(booking.estimatedDepartureDate)}
                          </div>
                          <div className="flex items-center text-gray-600 mt-0.5">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDate(booking.estimatedArrivalDate)}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-xs">
                          <div className="text-gray-900">
                            {booking.shipmentDetails?.totalCartons || 0} ctns
                          </div>
                          <div className="text-gray-500">
                            {booking.shipmentDetails?.totalWeight?.toFixed(1) || 0} kg
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <StatusBadge status={booking.status} />
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => router.push(`/bookings/${booking._id}`)}
                            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                            title="View"
                          >
                            <Eye className="h-3.5 w-3.5 text-gray-600" />
                          </button>
                          <button
                            onClick={() => router.push(`/bookings/${booking._id}/edit`)}
                            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                            title="Edit"
                          >
                            <Edit className="h-3.5 w-3.5 text-gray-600" />
                          </button>
                          <button
                            onClick={() => {/* Handle download */}}
                            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                            title="Download"
                          >
                            <Download className="h-3.5 w-3.5 text-gray-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="border-t px-3 py-2 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-600">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
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
                    size="sm"
                    variant="secondary"
                    onClick={() => setFilters(prev => ({ ...prev, page: 1 }))}
                    disabled={filters.page === 1}
                    icon={<ChevronsLeft className="h-3.5 w-3.5" />}
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={filters.page === 1}
                    icon={<ChevronLeft className="h-3.5 w-3.5" />}
                  />
                  
                  <span className="text-xs text-gray-600 px-2">
                    Page {filters.page} of {pagination.pages}
                  </span>

                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={filters.page === pagination.pages}
                    icon={<ChevronRight className="h-3.5 w-3.5" />}
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setFilters(prev => ({ ...prev, page: pagination.pages }))}
                    disabled={filters.page === pagination.pages}
                    icon={<ChevronsRight className="h-3.5 w-3.5" />}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-lg border shadow-sm p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Total Bookings</p>
                <p className="text-lg font-semibold text-gray-900">{pagination.total}</p>
              </div>
              <div className="bg-blue-100 p-2 rounded-lg">
                <Package className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border shadow-sm p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">In Transit</p>
                <p className="text-lg font-semibold text-yellow-600">
                  {bookings.filter(b => b.status === 'shipped' || b.status === 'processing').length}
                </p>
              </div>
              <div className="bg-yellow-100 p-2 rounded-lg">
                <Truck className="h-4 w-4 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border shadow-sm p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Delivered</p>
                <p className="text-lg font-semibold text-green-600">
                  {bookings.filter(b => b.status === 'delivered').length}
                </p>
              </div>
              <div className="bg-green-100 p-2 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border shadow-sm p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Pending</p>
                <p className="text-lg font-semibold text-orange-600">
                  {bookings.filter(b => b.status === 'pending').length}
                </p>
              </div>
              <div className="bg-orange-100 p-2 rounded-lg">
                <Clock className="h-4 w-4 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}