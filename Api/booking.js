import axiosInstance from '@/lib/axiosInstance';

// ==================== BOOKING API FUNCTIONS ====================

// 1. CREATE BOOKING (Customer)
export const createBooking = async (bookingData) => {
  try {
    const response = await axiosInstance.post('/createBooking', bookingData);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message
    };
  } catch (error) {
    console.error('Create booking error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to create booking',
      error: error.response?.data
    };
  }
};

// 2. GET ALL BOOKINGS (Admin/Staff)
export const getAllBookings = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 20,
      ...(params.status && { status: params.status }),
      ...(params.search && { search: params.search }),
      ...(params.startDate && { startDate: params.startDate }),
      ...(params.endDate && { endDate: params.endDate }),
      ...(params.sortBy && { sortBy: params.sortBy }),
      ...(params.sortOrder && { sortOrder: params.sortOrder })
    });

    const response = await axiosInstance.get(`/getAllBooking?${queryParams}`);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to fetch bookings');
    
  } catch (error) {
    console.error('Get all bookings error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to fetch bookings',
      error: error.response?.data
    };
  }
};

// 3. GET SINGLE BOOKING BY ID
export const getBookingById = async (bookingId) => {
  try {
    const response = await axiosInstance.get(`/bookings/${bookingId}`);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to fetch booking');
    
  } catch (error) {
    console.error('Get booking by id error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to fetch booking',
      error: error.response?.data
    };
  }
};

// 4. UPDATE PRICE QUOTE (Admin)
export const updatePriceQuote = async (bookingId, quoteData) => {
  try {
    const response = await axiosInstance.put(`/booking/${bookingId}/price-quote`, quoteData);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to update price quote');
    
  } catch (error) {
    console.error('Update price quote error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to update price quote',
      error: error.response?.data
    };
  }
};

// 5. CUSTOMER ACCEPT QUOTE
export const acceptQuote = async (bookingId, notes = '') => {
  try {
    const response = await axiosInstance.put(`/booking/${bookingId}/accept`, { notes });
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to accept quote');
    
  } catch (error) {
    console.error('Accept quote error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to accept quote',
      error: error.response?.data
    };
  }
};

// 6. CUSTOMER REJECT QUOTE
export const rejectQuote = async (bookingId, reason = '') => {
  try {
    const response = await axiosInstance.post(`/bookings/${bookingId}/reject-quote`, { reason });
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to reject quote');
    
  } catch (error) {
    console.error('Reject quote error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to reject quote',
      error: error.response?.data
    };
  }
};

// 7. CANCEL BOOKING
export const cancelBooking = async (bookingId, reason = '') => {
  try {
    const response = await axiosInstance.post(`/bookings/${bookingId}/cancel`, { reason });
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to cancel booking');
    
  } catch (error) {
    console.error('Cancel booking error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to cancel booking',
      error: error.response?.data
    };
  }
};

// 8. GET MY BOOKINGS (Customer)
export const getMyBookings = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 10,
      ...(params.status && { status: params.status }),
      ...(params.sort && { sort: params.sort || '-createdAt' })
    });

    const response = await axiosInstance.get(`/bookings/my-bookings?${queryParams}`);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        summary: response.data.summary,
        pagination: response.data.pagination,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to fetch my bookings');
    
  } catch (error) {
    console.error('Get my bookings error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to fetch bookings',
      error: error.response?.data
    };
  }
};

// 9. GET MY BOOKING BY ID (Customer)
export const getMyBookingById = async (bookingId) => {
  try {
    const response = await axiosInstance.get(`/bookings/my-bookings/${bookingId}`);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to fetch booking');
    
  } catch (error) {
    console.error('Get my booking by id error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to fetch booking',
      error: error.response?.data
    };
  }
};

// 10. GET MY BOOKING TIMELINE (Customer)
export const getMyBookingTimeline = async (bookingId) => {
  try {
    const response = await axiosInstance.get(`/bookings/my-bookings/${bookingId}/timeline`);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to fetch timeline');
    
  } catch (error) {
    console.error('Get booking timeline error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to fetch timeline',
      error: error.response?.data
    };
  }
};

// 11. GET MY BOOKING INVOICES (Customer)
export const getMyBookingInvoices = async (bookingId) => {
  try {
    const response = await axiosInstance.get(`/bookings/my-bookings/${bookingId}/invoices`);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to fetch invoices');
    
  } catch (error) {
    console.error('Get booking invoices error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to fetch invoices',
      error: error.response?.data
    };
  }
};

// 12. GET MY BOOKING QUOTE DETAILS (Customer)
export const getMyBookingQuote = async (bookingId) => {
  try {
    const response = await axiosInstance.get(`/bookings/my-bookings/${bookingId}/quote`);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to fetch quote details');
    
  } catch (error) {
    console.error('Get booking quote error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to fetch quote details',
      error: error.response?.data
    };
  }
};

// 13. GET MY BOOKINGS SUMMARY (Customer Dashboard)
export const getMyBookingsSummary = async () => {
  try {
    const response = await axiosInstance.get('/my-bookings/summary');
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to fetch summary');
    
  } catch (error) {
    console.error('Get bookings summary error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to fetch summary',
      error: error.response?.data
    };
  }
};

// 14. DOWNLOAD BOOKING DOCUMENT
export const downloadBookingDocument = async (bookingId, documentId) => {
  try {
    const response = await axiosInstance.get(`/bookings/${bookingId}/documents/${documentId}/download`, {
      responseType: 'blob'
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    // Get filename from content-disposition header or use default
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'document.pdf';
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '');
      }
    }
    
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return {
      success: true,
      message: 'Document downloaded successfully'
    };
    
  } catch (error) {
    console.error('Download document error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to download document',
      error: error.response?.data
    };
  }
};

// 15. TRACK BY NUMBER (Public)
export const trackByNumber = async (trackingNumber) => {
  try {
    const response = await axiosInstance.get(`/bookings/track/${trackingNumber}`);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Tracking number not found');
    
  } catch (error) {
    console.error('Track by number error:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to track shipment',
      error: error.response?.data
    };
  }
};

// ==================== HELPER FUNCTIONS ====================

// Get status color for UI
export const getStatusColor = (status) => {
  const statusColors = {
    'booking_requested': 'info',
    'price_quoted': 'warning',
    'booking_confirmed': 'primary',
    'cancelled': 'error',
    'rejected': 'error',
    'delivered': 'success'
  };
  
  return statusColors[status] || 'default';
};

// Get pricing status color
export const getPricingStatusColor = (status) => {
  const pricingColors = {
    'pending': 'default',
    'quoted': 'warning',
    'accepted': 'success',
    'rejected': 'error',
    'expired': 'default'
  };
  
  return pricingColors[status] || 'default';
};

// Get status display text
export const getStatusDisplayText = (status) => {
  const statusTexts = {
    'booking_requested': 'Booking Requested',
    'price_quoted': 'Price Quoted',
    'booking_confirmed': 'Booking Confirmed',
    'cancelled': 'Cancelled',
    'rejected': 'Rejected',
    'delivered': 'Delivered'
  };
  
  return statusTexts[status] || status;
};

// Get pricing status display text
export const getPricingStatusDisplayText = (status) => {
  const pricingTexts = {
    'pending': 'Pending',
    'quoted': 'Quoted',
    'accepted': 'Accepted',
    'rejected': 'Rejected',
    'expired': 'Expired'
  };
  
  return pricingTexts[status] || status;
};

// Get shipment type display
export const getShipmentTypeDisplay = (type) => {
  const types = {
    'air_freight': 'Air Freight',
    'sea_freight': 'Sea Freight',
    'express_courier': 'Express Courier'
  };
  
  return types[type] || type;
};

// Get origin display
export const getOriginDisplay = (origin) => {
  const origins = {
    'China Warehouse': 'China Warehouse',
    'Thailand Warehouse': 'Thailand Warehouse'
  };
  
  return origins[origin] || origin;
};

// Get destination display
export const getDestinationDisplay = (destination) => {
  const destinations = {
    'USA': 'United States',
    'UK': 'United Kingdom',
    'Canada': 'Canada'
  };
  
  return destinations[destination] || destination;
};

// Get shipping mode display
export const getShippingModeDisplay = (mode) => {
  const modes = {
    'DDP': 'Delivered Duty Paid',
    'DDU': 'Delivered Duty Unpaid',
    'FOB': 'Free on Board',
    'CIF': 'Cost, Insurance & Freight'
  };
  
  return modes[mode] || mode;
};

// Format date
export const formatDate = (dateString, format = 'medium') => {
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
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Format currency
export const formatCurrency = (amount, currency = 'USD') => {
  if (!amount && amount !== 0) return 'N/A';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Check if quote is valid
export const isQuoteValid = (quote) => {
  if (!quote || !quote.validUntil) return false;
  return new Date() <= new Date(quote.validUntil);
};

// Calculate days remaining for quote
export const getQuoteDaysRemaining = (validUntil) => {
  if (!validUntil) return 0;
  
  const now = new Date();
  const validDate = new Date(validUntil);
  const diffTime = validDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
};

// Check if booking can be cancelled
export const canCancelBooking = (status) => {
  const cancellableStatuses = ['booking_requested', 'price_quoted'];
  return cancellableStatuses.includes(status);
};

// Check if booking can be quoted (Admin)
export const canQuoteBooking = (status, pricingStatus) => {
  return status === 'booking_requested' && pricingStatus === 'pending';
};

// Check if customer can respond to quote
export const canRespondToQuote = (status, pricingStatus, quoteValid) => {
  return status === 'price_quoted' && 
         pricingStatus === 'quoted' && 
         quoteValid === true;
};

// Calculate total from cargo details
export const calculateCargoTotals = (cargoDetails) => {
  if (!cargoDetails || !cargoDetails.length) {
    return { totalCartons: 0, totalWeight: 0, totalVolume: 0 };
  }
  
  return cargoDetails.reduce((totals, item) => {
    return {
      totalCartons: totals.totalCartons + (item.cartons || 0),
      totalWeight: totals.totalWeight + ((item.weight || 0) * (item.cartons || 0)),
      totalVolume: totals.totalVolume + ((item.volume || 0) * (item.cartons || 0))
    };
  }, { totalCartons: 0, totalWeight: 0, totalVolume: 0 });
};

// Format cargo details for display
export const formatCargoDetails = (cargoDetails) => {
  if (!cargoDetails || !cargoDetails.length) return [];
  
  return cargoDetails.map((item, index) => ({
    ...item,
    displayName: `${item.description} (${item.cartons} ctns, ${item.weight} kg, ${item.volume} cbm)`
  }));
};

// Export bookings to CSV
export const exportBookingsToCSV = (bookings, filename = 'bookings.csv') => {
  if (!bookings || !bookings.length) return;

  const headers = [
    'Booking Number',
    'Tracking Number',
    'Customer',
    'Status',
    'Pricing Status',
    'Origin',
    'Destination',
    'Shipment Type',
    'Shipping Mode',
    'Total Cartons',
    'Total Weight (kg)',
    'Total Volume (cbm)',
    'Quoted Amount',
    'Quoted Currency',
    'Created Date',
    'Confirmed Date'
  ];

  const csvData = bookings.map(booking => [
    booking.bookingNumber,
    booking.trackingNumber || 'N/A',
    booking.customer?.companyName || `${booking.customer?.firstName || ''} ${booking.customer?.lastName || ''}`.trim() || 'N/A',
    getStatusDisplayText(booking.status),
    getPricingStatusDisplayText(booking.pricingStatus),
    getOriginDisplay(booking.shipmentDetails?.origin),
    getDestinationDisplay(booking.shipmentDetails?.destination),
    getShipmentTypeDisplay(booking.shipmentDetails?.shipmentType),
    getShippingModeDisplay(booking.shipmentDetails?.shippingMode),
    booking.shipmentDetails?.totalCartons || 0,
    booking.shipmentDetails?.totalWeight || 0,
    booking.shipmentDetails?.totalVolume || 0,
    booking.quotedPrice?.amount || '',
    booking.quotedPrice?.currency || '',
    formatDate(booking.createdAt, 'short'),
    booking.confirmedAt ? formatDate(booking.confirmedAt, 'short') : 'N/A'
  ]);

  const csvContent = [
    headers.join(','),
    ...csvData.map(row => row.map(cell => 
      typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell
    ).join(','))
  ].join('\n');

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

// ==================== REACT HOOKS ====================

// Custom hook for booking operations
export const useBooking = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [booking, setBooking] = useState(null);

  const fetchBooking = async (bookingId) => {
    try {
      setLoading(true);
      setError(null);
      const result = await getBookingById(bookingId);
      if (result.success) {
        setBooking(result.data);
      } else {
        setError(result.message);
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateQuote = async (bookingId, quoteData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await updatePriceQuote(bookingId, quoteData);
      if (result.success && result.data) {
        setBooking(result.data);
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const accept = async (bookingId, notes) => {
    try {
      setLoading(true);
      setError(null);
      const result = await acceptQuote(bookingId, notes);
      if (result.success && result.data?.booking) {
        setBooking(result.data.booking);
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reject = async (bookingId, reason) => {
    try {
      setLoading(true);
      setError(null);
      const result = await rejectQuote(bookingId, reason);
      if (result.success) {
        setBooking(result.data);
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancel = async (bookingId, reason) => {
    try {
      setLoading(true);
      setError(null);
      const result = await cancelBooking(bookingId, reason);
      if (result.success) {
        setBooking(result.data);
      }
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
    booking,
    fetchBooking,
    updateQuote,
    accept,
    reject,
    cancel
  };
};

// Custom hook for customer bookings
export const useCustomerBookings = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [summary, setSummary] = useState(null);
  const [pagination, setPagination] = useState(null);

  const fetchMyBookings = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const result = await getMyBookings(params);
      if (result.success) {
        setBookings(result.data);
        setSummary(result.summary);
        setPagination(result.pagination);
      } else {
        setError(result.message);
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getMyBookingsSummary();
      if (result.success) {
        setSummary(result.data);
      }
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
    bookings,
    summary,
    pagination,
    fetchMyBookings,
    fetchSummary
  };
};