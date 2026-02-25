import axiosInstance from '@/lib/axiosInstance';
import Cookies from 'js-cookie';

// ==================== BOOKING API FUNCTIONS ====================

// Create new booking
export const createBooking = async (bookingData) => {
  try {
    const response = await axiosInstance.post('/create-bookings', bookingData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create booking' };
  }
};

// Get all bookings with filters and pagination
export const getBookings = async (queryParams = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      customer,
      origin,
      destination,
      shipmentType,
      startDate,
      endDate,
      search
    } = queryParams;

    // Build query string
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    if (status) params.append('status', status);
    if (customer) params.append('customer', customer);
    if (origin) params.append('origin', origin);
    if (destination) params.append('destination', destination);
    if (shipmentType) params.append('shipmentType', shipmentType);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (search) params.append('search', search);

    const response = await axiosInstance.get(`/bookings?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch bookings' };
  }
};

// Get single booking by ID
export const getBookingById = async (bookingId) => {
  try {
    const response = await axiosInstance.get(`/bookings/${bookingId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch booking' };
  }
};

// Update booking
export const updateBooking = async (bookingId, bookingData) => {
  try {
    const response = await axiosInstance.put(`/bookings/${bookingId}`, bookingData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update booking' };
  }
};

// Update booking status
export const updateBookingStatus = async (bookingId, statusData) => {
  try {
    const response = await axiosInstance.patch(`/bookings/${bookingId}/status`, statusData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update booking status' };
  }
};

// Assign booking to staff or container
export const assignBooking = async (bookingId, assignmentData) => {
  try {
    const response = await axiosInstance.post(`/bookings/${bookingId}/assign`, assignmentData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to assign booking' };
  }
};

// Add note to booking
export const addBookingNote = async (bookingId, noteData) => {
  try {
    const response = await axiosInstance.post(`/bookings/${bookingId}/notes`, noteData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to add note' };
  }
};

// Cancel booking
export const cancelBooking = async (bookingId, cancelData) => {
  try {
    const response = await axiosInstance.post(`/bookings/${bookingId}/cancel`, cancelData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to cancel booking' };
  }
};

// Get booking timeline
export const getBookingTimeline = async (bookingId) => {
  try {
    const response = await axiosInstance.get(`/bookings/${bookingId}/timeline`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch timeline' };
  }
};

// Get booking statistics for dashboard
export const getBookingStats = async () => {
  try {
    const response = await axiosInstance.get('/bookings/stats/dashboard');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch booking statistics' };
  }
};

// Bulk update bookings
export const bulkUpdateBookings = async (bulkUpdateData) => {
  try {
    const response = await axiosInstance.post('/bookings/bulk-update', bulkUpdateData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to bulk update bookings' };
  }
};

// Track booking by tracking number (Public)
export const trackBooking = async (trackingNumber) => {
  try {
    const response = await axiosInstance.get(`/bookings/track/${trackingNumber}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to track booking' };
  }
};

// ==================== BOOKING HELPER FUNCTIONS ====================

// Get status color for UI
export const getStatusColor = (status) => {
  const statusColors = {
    'booking_requested': 'info',
    'booking_confirmed': 'primary',
    'pickup_scheduled': 'warning',
    'received_at_warehouse': 'info',
    'consolidation_in_progress': 'warning',
    'loaded_in_container': 'primary',
    'loaded_on_flight': 'primary',
    'in_transit': 'info',
    'arrived_at_destination': 'success',
    'customs_clearance': 'warning',
    'out_for_delivery': 'info',
    'delivered': 'success',
    'cancelled': 'error',
    'returned': 'warning'
  };
  
  return statusColors[status] || 'default';
};

// Get status display text
export const getStatusDisplayText = (status) => {
  const statusTexts = {
    'booking_requested': 'Booking Requested',
    'booking_confirmed': 'Booking Confirmed',
    'pickup_scheduled': 'Pickup Scheduled',
    'received_at_warehouse': 'Received at Warehouse',
    'consolidation_in_progress': 'Consolidation in Progress',
    'loaded_in_container': 'Loaded in Container',
    'loaded_on_flight': 'Loaded on Flight',
    'in_transit': 'In Transit',
    'arrived_at_destination': 'Arrived at Destination',
    'customs_clearance': 'Customs Clearance',
    'out_for_delivery': 'Out for Delivery',
    'delivered': 'Delivered',
    'cancelled': 'Cancelled',
    'returned': 'Returned'
  };
  
  return statusTexts[status] || status;
};

// Format date for display
export const formatBookingDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Calculate progress percentage
export const calculateProgressPercentage = (status) => {
  const progressMap = {
    'booking_requested': 10,
    'booking_confirmed': 20,
    'pickup_scheduled': 30,
    'received_at_warehouse': 40,
    'consolidation_in_progress': 50,
    'loaded_in_container': 60,
    'loaded_on_flight': 60,
    'in_transit': 70,
    'arrived_at_destination': 80,
    'customs_clearance': 85,
    'out_for_delivery': 90,
    'delivered': 100,
    'cancelled': 0,
    'returned': 0
  };
  
  return progressMap[status] || 0;
};

// Check if status is active (not delivered or cancelled)
export const isActiveBooking = (status) => {
  const activeStatuses = [
    'booking_requested',
    'booking_confirmed',
    'pickup_scheduled',
    'received_at_warehouse',
    'consolidation_in_progress',
    'loaded_in_container',
    'loaded_on_flight',
    'in_transit',
    'arrived_at_destination',
    'customs_clearance',
    'out_for_delivery'
  ];
  
  return activeStatuses.includes(status);
};

// Check if booking can be cancelled
export const canCancelBooking = (status) => {
  const cancellableStatuses = [
    'booking_requested',
    'booking_confirmed',
    'pickup_scheduled'
  ];
  
  return cancellableStatuses.includes(status);
};

// Check if booking can be edited
export const canEditBooking = (status) => {
  const editableStatuses = [
    'booking_requested',
    'booking_confirmed',
    'pickup_scheduled',
    'received_at_warehouse'
  ];
  
  return editableStatuses.includes(status);
};

// Get shipment type display
export const getShipmentTypeDisplay = (type) => {
  const types = {
    'air_freight': 'Air Freight',
    'sea_freight': 'Sea Freight',
    'road_freight': 'Road Freight',
    'rail_freight': 'Rail Freight'
  };
  
  return types[type] || type;
};

// Format currency
export const formatCurrency = (amount, currency = 'USD') => {
  if (!amount && amount !== 0) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

// Format weight with unit
export const formatWeight = (weight, unit = 'kg') => {
  if (!weight && weight !== 0) return 'N/A';
  return `${weight.toFixed(2)} ${unit}`;
};

// Format volume with unit
export const formatVolume = (volume, unit = 'cbm') => {
  if (!volume && volume !== 0) return 'N/A';
  return `${volume.toFixed(3)} ${unit}`;
};

// ==================== BOOKING EXPORT FUNCTIONS ====================

// Export bookings as CSV
export const exportBookingsToCSV = (bookings) => {
  if (!bookings || !bookings.length) return null;

  const headers = [
    'Booking Number',
    'Tracking Number',
    'Customer',
    'Status',
    'Origin',
    'Destination',
    'Shipment Type',
    'Total Cartons',
    'Total Weight (kg)',
    'Total Volume (cbm)',
    'Quoted Amount',
    'Created Date',
    'Estimated Arrival'
  ];

  const csvData = bookings.map(booking => [
    booking.bookingNumber,
    booking.trackingNumber,
    booking.customer?.companyName || 'N/A',
    getStatusDisplayText(booking.status),
    booking.shipmentDetails?.origin || 'N/A',
    booking.shipmentDetails?.destination || 'N/A',
    getShipmentTypeDisplay(booking.shipmentDetails?.shipmentType),
    booking.shipmentDetails?.totalCartons || 0,
    booking.shipmentDetails?.totalWeight || 0,
    booking.shipmentDetails?.totalVolume || 0,
    booking.quotedAmount || 0,
    formatBookingDate(booking.createdAt),
    formatBookingDate(booking.estimatedArrivalDate)
  ]);

  const csvContent = [
    headers.join(','),
    ...csvData.map(row => row.join(','))
  ].join('\n');

  return csvContent;
};

// Download bookings as CSV file
export const downloadBookingsAsCSV = (bookings, filename = 'bookings.csv') => {
  const csvContent = exportBookingsToCSV(bookings);
  if (!csvContent) return;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};