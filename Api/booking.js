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
export const getBookings = async () => {
    try {
        const response = await axiosInstance.get('/all-bookings');
        
        if (response.data.success) {
            return {
                success: true,
                data: response.data.data,
                pagination: response.data.pagination,
                statistics: response.data.statistics,
                message: response.data.message
            };
        }
        
        throw new Error(response.data.message || 'Failed to fetch bookings');
        
    } catch (error) {
        console.error('Get bookings error:', error);
        return {
            success: false,
            message: error.response?.data?.message || error.message || 'Failed to fetch bookings',
            error: error.response?.data?.error || error
        };
    }
};

// Get single booking by ID
export const getBookingById = async (bookingId) => {
  try {
    const response = await axiosInstance.get(`/getBooking-by-id/${bookingId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch booking' };
  }
};

// Update booking
export const updateBooking = async (bookingId, bookingData) => {
  try {
    const response = await axiosInstance.put(`/updateBooking-by-id/${bookingId}`, bookingData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update booking' };
  }
};

// Update booking status
export const updateBookingStatus = async (bookingId, statusData) => {
  try {
    const response = await axiosInstance.patch(`/booking/${bookingId}/status`, statusData);
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
    const response = await axiosInstance.get('/stats/dashboard');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch booking statistics' };
  }
};

// Bulk update bookings
export const bulkUpdateBookings = async (bulkUpdateData) => {
  try {
    const response = await axiosInstance.post('/bulk-booking-update', bulkUpdateData);
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
// ==================== DELETE OPERATIONS ====================

// Soft delete booking (Move to trash)
export const deleteBooking = async (bookingId, reason = '') => {
  try {
    const response = await axiosInstance.delete(`/delete-booking/${bookingId}`, {
      data: { reason } // For deletion reason
    });
    return response.data;
  } catch (error) {
    console.error('Delete booking error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to delete booking',
      error: error.response?.data?.error || error
    };
  }
};

// Hard delete booking (Permanent deletion - Admin only)
export const hardDeleteBooking = async (bookingId) => {
  try {
    const response = await axiosInstance.delete(`/booking/${bookingId}/hard-delete`);
    return response.data;
  } catch (error) {
    console.error('Hard delete booking error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to permanently delete booking',
      error: error.response?.data?.error || error
    };
  }
};

// Bulk soft delete bookings
export const bulkDeleteBookings = async (bookingIds, reason = '') => {
  try {
    const response = await axiosInstance.post('/bookings/bulk-delete', {
      bookingIds,
      reason
    });
    return response.data;
  } catch (error) {
    console.error('Bulk delete bookings error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to bulk delete bookings',
      error: error.response?.data?.error || error
    };
  }
};

// Bulk hard delete bookings (Admin only)
export const bulkHardDeleteBookings = async (bookingIds, confirm = true) => {
  try {
    const response = await axiosInstance.delete('/bookings/bulk-hard-delete', {
      data: { bookingIds },
      params: { confirm }
    });
    return response.data;
  } catch (error) {
    console.error('Bulk hard delete bookings error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to bulk hard delete bookings',
      error: error.response?.data?.error || error
    };
  }
};

// Restore soft-deleted booking
export const restoreBooking = async (bookingId) => {
  try {
    const response = await axiosInstance.post(`/bookings/${bookingId}/restore`);
    return response.data;
  } catch (error) {
    console.error('Restore booking error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to restore booking',
      error: error.response?.data?.error || error
    };
  }
};

// Bulk restore bookings
export const bulkRestoreBookings = async (bookingIds) => {
  try {
    const response = await axiosInstance.post('/bookings/bulk-restore', { bookingIds });
    return response.data;
  } catch (error) {
    console.error('Bulk restore bookings error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to bulk restore bookings',
      error: error.response?.data?.error || error
    };
  }
};

// Get deleted bookings (Trash)
export const getDeletedBookings = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 10,
      ...(params.startDate && { startDate: params.startDate }),
      ...(params.endDate && { endDate: params.endDate }),
      ...(params.search && { search: params.search }),
      ...(params.sortBy && { sortBy: params.sortBy }),
      ...(params.sortOrder && { sortOrder: params.sortOrder })
    });

    const response = await axiosInstance.get(`/bookings/deleted/trash?${queryParams}`);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination,
        stats: response.data.stats,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to fetch deleted bookings');
    
  } catch (error) {
    console.error('Get deleted bookings error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch deleted bookings',
      error: error.response?.data?.error || error
    };
  }
};

// Empty trash (Permanently delete all soft-deleted bookings - Admin only)
export const emptyTrash = async (confirm = true) => {
  try {
    const response = await axiosInstance.delete('/bookings/empty-trash', {
      params: { confirm }
    });
    return response.data;
  } catch (error) {
    console.error('Empty trash error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to empty trash',
      error: error.response?.data?.error || error
    };
  }
};

// ==================== DELETE HELPER FUNCTIONS ====================

// Check if booking can be soft deleted
export const canDeleteBooking = (status, userRole) => {
  // Admin can delete any booking
  if (userRole === 'admin') return true;
  
  // Operations staff can only delete certain statuses
  const deletableStatuses = [
    'booking_requested',
    'booking_confirmed',
    'cancelled'
  ];
  
  return deletableStatuses.includes(status);
};

// Check if booking can be hard deleted (Admin only)
export const canHardDeleteBooking = (userRole) => {
  return userRole === 'admin';
};

// Check if booking can be restored
export const canRestoreBooking = (booking, userRole) => {
  if (!booking.isDeleted) return false;
  
  // Admin can restore any deleted booking
  if (userRole === 'admin') return true;
  
  // Operations staff can only restore their own deleted bookings
  return booking.deletedBy?._id === userRole; // Assuming userRole contains user ID for non-admins
};

// Get deletion type badge color
export const getDeletionTypeColor = (deletedByRole) => {
  return deletedByRole === 'admin' ? 'error' : 'warning';
};

// Format deletion reason for display
export const formatDeletionReason = (reason, defaultText = 'No reason provided') => {
  return reason || defaultText;
};

// Get days in trash
export const getDaysInTrash = (deletedAt) => {
  if (!deletedAt) return 0;
  
  const deletedDate = new Date(deletedAt);
  const currentDate = new Date();
  const diffTime = Math.abs(currentDate - deletedDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

// Check if booking is auto-deletable (in trash for more than X days)
export const isAutoDeletable = (deletedAt, maxDays = 30) => {
  const daysInTrash = getDaysInTrash(deletedAt);
  return daysInTrash > maxDays;
};

// Get deletion confirmation message
export const getDeletionConfirmationMessage = (booking, isHardDelete = false) => {
  if (isHardDelete) {
    return `Are you sure you want to permanently delete booking ${booking.bookingNumber}? This action cannot be undone!`;
  }
  return `Are you sure you want to move booking ${booking.bookingNumber} to trash?`;
};

// Get bulk deletion confirmation message
export const getBulkDeletionConfirmationMessage = (count, isHardDelete = false) => {
  if (isHardDelete) {
    return `Are you sure you want to permanently delete ${count} booking(s)? This action cannot be undone!`;
  }
  return `Are you sure you want to move ${count} booking(s) to trash?`;
};

// ==================== DELETE HOOKS (for React) ====================

// Custom hook for delete operations (to be used in React components)
export const useBookingDeletion = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const performSoftDelete = async (bookingId, reason) => {
    try {
      setLoading(true);
      setError(null);
      const result = await deleteBooking(bookingId, reason);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const performHardDelete = async (bookingId) => {
    try {
      setLoading(true);
      setError(null);
      const result = await hardDeleteBooking(bookingId);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const performRestore = async (bookingId) => {
    try {
      setLoading(true);
      setError(null);
      const result = await restoreBooking(bookingId);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    softDelete: performSoftDelete,
    hardDelete: performHardDelete,
    restore: performRestore
  };
};

// ==================== DELETE BATCH OPERATIONS ====================

// Export deleted bookings report
export const exportDeletedBookingsReport = async (params = {}) => {
  try {
    const response = await getDeletedBookings({ ...params, limit: 1000 }); // Get up to 1000 records
    
    if (!response.success || !response.data) {
      throw new Error('Failed to fetch deleted bookings data');
    }

    const headers = [
      'Booking Number',
      'Tracking Number',
      'Customer',
      'Original Status',
      'Deleted By',
      'Deleted At',
      'Days in Trash',
      'Deletion Reason',
      'Restored'
    ];

    const csvData = response.data.map(booking => [
      booking.bookingNumber,
      booking.trackingNumber || 'N/A',
      booking.customer?.companyName || 'N/A',
      getStatusDisplayText(booking.status),
      booking.deletedBy?.name || 'N/A',
      formatBookingDate(booking.deletedAt),
      getDaysInTrash(booking.deletedAt),
      formatDeletionReason(booking.deletionReason),
      booking.restoredAt ? 'Yes' : 'No'
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `deleted-bookings-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return { success: true, message: 'Report exported successfully' };

  } catch (error) {
    console.error('Export deleted bookings report error:', error);
    return {
      success: false,
      message: error.message || 'Failed to export report'
    };
  }
};

// Clean up old deleted bookings (to be called periodically)
export const cleanupOldDeletedBookings = async (daysOld = 30) => {
  try {
    const response = await axiosInstance.delete('/bookings/cleanup-old', {
      params: { days: daysOld }
    });
    return response.data;
  } catch (error) {
    console.error('Cleanup old deleted bookings error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to cleanup old bookings'
    };
  }
};