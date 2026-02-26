// services/shipmentService.js
import axiosInstance from '@/lib/axiosInstance';

// ==================== SHIPMENT API FUNCTIONS ====================

// Create new shipment from booking
export const createShipment = async (shipmentData) => {
  try {
    const response = await axiosInstance.post('/createShipment', shipmentData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create shipment' };
  }
};

// Get all shipments with filters and pagination
export const getShipments = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 10,
      ...(params.status && { status: params.status }),
      ...(params.mode && { mode: params.mode }),
      ...(params.shipmentType && { shipmentType: params.shipmentType }),
      ...(params.search && { search: params.search }),
      ...(params.sortBy && { sortBy: params.sortBy }),
      ...(params.sortOrder && { sortOrder: params.sortOrder })
    });

    const response = await axiosInstance.get(`/shipments?${queryParams}`);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to fetch shipments');
    
  } catch (error) {
    console.error('Get shipments error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch shipments',
      error: error.response?.data?.error || error
    };
  }
};

// Get single shipment by ID
export const getShipmentById = async (shipmentId) => {
  try {
    const response = await axiosInstance.get(`/shipments/${shipmentId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch shipment' };
  }
};

// Update shipment
export const updateShipment = async (shipmentId, shipmentData) => {
  try {
    const response = await axiosInstance.put(`/shipments/${shipmentId}`, shipmentData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update shipment' };
  }
};

// Update shipment status
export const updateShipmentStatus = async (shipmentId, statusData) => {
  try {
    const response = await axiosInstance.patch(`/shipments/${shipmentId}/status`, statusData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update shipment status' };
  }
};

// Add tracking update
export const addTrackingUpdate = async (shipmentId, trackingData) => {
  try {
    const response = await axiosInstance.post(`/shipments/${shipmentId}/tracking`, trackingData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to add tracking update' };
  }
};

// Add cost to shipment
export const addShipmentCost = async (shipmentId, costData) => {
  try {
    const response = await axiosInstance.post(`/shipments/${shipmentId}/costs`, costData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to add cost' };
  }
};

// Assign shipment to staff
export const assignShipment = async (shipmentId, assignmentData) => {
  try {
    const response = await axiosInstance.post(`/shipments/${shipmentId}/assign`, assignmentData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to assign shipment' };
  }
};

// Add document to shipment
export const addShipmentDocument = async (shipmentId, documentData) => {
  try {
    const response = await axiosInstance.post(`/shipments/${shipmentId}/documents`, documentData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to add document' };
  }
};

// Add internal note
export const addInternalNote = async (shipmentId, noteData) => {
  try {
    const response = await axiosInstance.post(`/shipments/${shipmentId}/notes/internal`, noteData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to add internal note' };
  }
};

// Add customer note
export const addCustomerNote = async (shipmentId, noteData) => {
  try {
    const response = await axiosInstance.post(`/shipments/${shipmentId}/notes/customer`, noteData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to add customer note' };
  }
};

// Get shipment timeline
export const getShipmentTimeline = async (shipmentId) => {
  try {
    const response = await axiosInstance.get(`/shipments/${shipmentId}/timeline`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch timeline' };
  }
};

// Track shipment by tracking number (Public)
export const trackShipment = async (trackingNumber) => {
  try {
    const response = await axiosInstance.get(`/shipments/track/${trackingNumber}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to track shipment' };
  }
};

// Get shipment statistics for dashboard
export const getShipmentStats = async () => {
  try {
    const response = await axiosInstance.get('/shipments/stats/dashboard');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch shipment statistics' };
  }
};

// Cancel shipment
export const cancelShipment = async (shipmentId, cancelData) => {
  try {
    const response = await axiosInstance.post(`/shipments/${shipmentId}/cancel`, cancelData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to cancel shipment' };
  }
};

// Delete shipment
export const deleteShipment = async (shipmentId) => {
  try {
    const response = await axiosInstance.delete(`/shipments/${shipmentId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete shipment' };
  }
};

// ==================== SHIPMENT HELPER FUNCTIONS ====================

// Get status color for UI
export const getShipmentStatusColor = (status) => {
  const statusColors = {
    'Pending': 'warning',
    'Picked Up from Warehouse': 'info',
    'Received at Warehouse': 'info',
    'Consolidation in Progress': 'warning',
    'Loaded in Container': 'primary',
    'Loaded on Vessel': 'primary',
    'Departed': 'info',
    'In Transit': 'info',
    'Arrived at Destination Port': 'success',
    'Customs Clearance': 'warning',
    'Out for Delivery': 'info',
    'Delivered': 'success',
    'Cancelled': 'error',
    'Returned': 'warning'
  };
  
  return statusColors[status] || 'default';
};

// Get status display text
export const getShipmentStatusDisplayText = (status) => {
  const statusTexts = {
    'Pending': 'Pending',
    'Picked Up from Warehouse': 'Picked Up',
    'Received at Warehouse': 'At Warehouse',
    'Consolidation in Progress': 'Consolidating',
    'Loaded in Container': 'Loaded',
    'Loaded on Vessel': 'Loaded on Vessel',
    'Departed': 'Departed',
    'In Transit': 'In Transit',
    'Arrived at Destination Port': 'Arrived',
    'Customs Clearance': 'Customs Clearance',
    'Out for Delivery': 'Out for Delivery',
    'Delivered': 'Delivered',
    'Cancelled': 'Cancelled',
    'Returned': 'Returned'
  };
  
  return statusTexts[status] || status;
};

// Get shipment mode display
export const getShipmentModeDisplay = (mode) => {
  const modes = {
    'air': 'Air Freight',
    'sea': 'Sea Freight',
    'road': 'Road Freight',
    'rail': 'Rail Freight'
  };
  
  return modes[mode] || mode;
};

// Get shipment type display
export const getShipmentTypeDisplay = (type) => {
  const types = {
    'export': 'Export',
    'import': 'Import',
    'domestic': 'Domestic'
  };
  
  return types[type] || type;
};

// Format date for display
export const formatShipmentDate = (dateString) => {
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
export const calculateShipmentProgress = (status) => {
  const progressMap = {
    'Pending': 10,
    'Picked Up from Warehouse': 20,
    'Received at Warehouse': 30,
    'Consolidation in Progress': 40,
    'Loaded in Container': 50,
    'Loaded on Vessel': 60,
    'Departed': 70,
    'In Transit': 75,
    'Arrived at Destination Port': 80,
    'Customs Clearance': 85,
    'Out for Delivery': 90,
    'Delivered': 100,
    'Cancelled': 0,
    'Returned': 0
  };
  
  return progressMap[status] || 0;
};

// Check if shipment is active (not delivered or cancelled)
export const isActiveShipment = (status) => {
  const activeStatuses = [
    'Pending',
    'Picked Up from Warehouse',
    'Received at Warehouse',
    'Consolidation in Progress',
    'Loaded in Container',
    'Loaded on Vessel',
    'Departed',
    'In Transit',
    'Arrived at Destination Port',
    'Customs Clearance',
    'Out for Delivery'
  ];
  
  return activeStatuses.includes(status);
};

// Check if shipment can be cancelled
export const canCancelShipment = (status) => {
  const cancellableStatuses = [
    'Pending',
    'Picked Up from Warehouse',
    'Received at Warehouse'
  ];
  
  return cancellableStatuses.includes(status);
};

// Check if shipment can be edited
export const canEditShipment = (status) => {
  const editableStatuses = [
    'Pending',
    'Picked Up from Warehouse',
    'Received at Warehouse'
  ];
  
  return editableStatuses.includes(status);
};

// Format currency
export const formatShipmentCurrency = (amount, currency = 'USD') => {
  if (!amount && amount !== 0) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

// Format weight with unit
export const formatShipmentWeight = (weight, unit = 'kg') => {
  if (!weight && weight !== 0) return 'N/A';
  return `${weight.toFixed(2)} ${unit}`;
};

// Format volume with unit
export const formatShipmentVolume = (volume, unit = 'cbm') => {
  if (!volume && volume !== 0) return 'N/A';
  return `${volume.toFixed(3)} ${unit}`;
};

// Check if ETA is on track
export const isShipmentOnTrack = (estimatedDelivery, actualDelivery, status) => {
  if (!estimatedDelivery || status === 'Delivered') return true;
  if (!actualDelivery) return true;
  
  const estimated = new Date(estimatedDelivery);
  const actual = new Date(actualDelivery);
  
  return actual <= estimated;
};

// Get days in transit
export const getDaysInTransit = (departureDate, currentStatus) => {
  if (!departureDate) return 0;
  
  const departure = new Date(departureDate);
  const now = new Date();
  const diffTime = Math.abs(now - departure);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return currentStatus === 'Delivered' ? 0 : diffDays;
};

// ==================== SHIPMENT EXPORT FUNCTIONS ====================

// Export shipments as CSV
export const exportShipmentsToCSV = (shipments) => {
  if (!shipments || !shipments.length) return null;

  const headers = [
    'Shipment Number',
    'Tracking Number',
    'Booking Number',
    'Status',
    'Mode',
    'Type',
    'Origin',
    'Destination',
    'Total Weight (kg)',
    'Total Volume (cbm)',
    'Total Cost',
    'Created Date',
    'Estimated Delivery',
    'Actual Delivery',
    'Assigned To'
  ];

  const csvData = shipments.map(shipment => [
    shipment.shipmentNumber,
    shipment.trackingNumber,
    shipment.bookingId?.bookingNumber || 'N/A',
    getShipmentStatusDisplayText(shipment.status),
    getShipmentModeDisplay(shipment.mode),
    getShipmentTypeDisplay(shipment.shipmentType),
    shipment.origin?.location || 'N/A',
    shipment.destination?.location || 'N/A',
    shipment.totalWeight || 0,
    shipment.totalVolume || 0,
    shipment.totalCost || 0,
    formatShipmentDate(shipment.createdDate),
    formatShipmentDate(shipment.estimatedDelivery),
    formatShipmentDate(shipment.actualDelivery),
    shipment.assignedTo?.name || 'Unassigned'
  ]);

  const csvContent = [
    headers.join(','),
    ...csvData.map(row => row.join(','))
  ].join('\n');

  return csvContent;
};

// Download shipments as CSV file
export const downloadShipmentsAsCSV = (shipments, filename = 'shipments.csv') => {
  const csvContent = exportShipmentsToCSV(shipments);
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

// ==================== SHIPMENT HOOKS (for React) ====================

// Custom hook for shipment operations
export const useShipmentOperations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const performStatusUpdate = async (shipmentId, statusData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await updateShipmentStatus(shipmentId, statusData);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const performTrackingUpdate = async (shipmentId, trackingData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await addTrackingUpdate(shipmentId, trackingData);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const performCostAddition = async (shipmentId, costData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await addShipmentCost(shipmentId, costData);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const performAssignment = async (shipmentId, assignmentData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await assignShipment(shipmentId, assignmentData);
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
    updateStatus: performStatusUpdate,
    addTracking: performTrackingUpdate,
    addCost: performCostAddition,
    assign: performAssignment
  };
};

// ==================== SHIPMENT DASHBOARD FUNCTIONS ====================

// Get shipment summary for dashboard
export const getShipmentSummary = (shipments) => {
  if (!shipments || !shipments.length) {
    return {
      total: 0,
      active: 0,
      delivered: 0,
      cancelled: 0,
      onTime: 0,
      delayed: 0
    };
  }

  const total = shipments.length;
  const active = shipments.filter(s => isActiveShipment(s.status)).length;
  const delivered = shipments.filter(s => s.status === 'Delivered').length;
  const cancelled = shipments.filter(s => s.status === 'Cancelled').length;
  const onTime = shipments.filter(s => 
    s.status === 'Delivered' && isShipmentOnTrack(s.estimatedDelivery, s.actualDelivery)
  ).length;
  const delayed = delivered - onTime;

  return {
    total,
    active,
    delivered,
    cancelled,
    onTime,
    delayed
  };
};

// Group shipments by status
export const groupShipmentsByStatus = (shipments) => {
  if (!shipments || !shipments.length) return {};

  return shipments.reduce((acc, shipment) => {
    const status = shipment.status;
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(shipment);
    return acc;
  }, {});
};

// Group shipments by mode
export const groupShipmentsByMode = (shipments) => {
  if (!shipments || !shipments.length) return {};

  return shipments.reduce((acc, shipment) => {
    const mode = shipment.mode || 'unknown';
    if (!acc[mode]) {
      acc[mode] = [];
    }
    acc[mode].push(shipment);
    return acc;
  }, {});
};

// Calculate average transit time
export const calculateAvgTransitTime = (shipments) => {
  const deliveredShipments = shipments.filter(s => 
    s.status === 'Delivered' && s.actualDelivery && s.createdDate
  );

  if (!deliveredShipments.length) return 0;

  const totalDays = deliveredShipments.reduce((sum, shipment) => {
    const created = new Date(shipment.createdDate);
    const delivered = new Date(shipment.actualDelivery);
    const days = Math.ceil((delivered - created) / (1000 * 60 * 60 * 24));
    return sum + days;
  }, 0);

  return Math.round(totalDays / deliveredShipments.length);
};

// Get top routes
export const getTopRoutes = (shipments, limit = 5) => {
  if (!shipments || !shipments.length) return [];

  const routeCount = shipments.reduce((acc, shipment) => {
    const route = `${shipment.origin?.location || 'Unknown'} → ${shipment.destination?.location || 'Unknown'}`;
    acc[route] = (acc[route] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(routeCount)
    .map(([route, count]) => ({ route, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
};

// ==================== SHIPMENT VALIDATION FUNCTIONS ====================

// Validate shipment data before creation
export const validateShipmentData = (shipmentData) => {
  const errors = [];

  if (!shipmentData.bookingId) {
    errors.push('Booking ID is required');
  }

  if (!shipmentData.mode) {
    errors.push('Shipment mode is required');
  }

  if (!shipmentData.shipmentType) {
    errors.push('Shipment type is required');
  }

  if (!shipmentData.origin?.location) {
    errors.push('Origin location is required');
  }

  if (!shipmentData.destination?.location) {
    errors.push('Destination location is required');
  }

  if (shipmentData.packages && shipmentData.packages.length) {
    shipmentData.packages.forEach((pkg, index) => {
      if (!pkg.packageType) {
        errors.push(`Package ${index + 1}: Package type is required`);
      }
      if (!pkg.quantity || pkg.quantity < 1) {
        errors.push(`Package ${index + 1}: Valid quantity is required`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Check if tracking update is valid
export const isValidTrackingUpdate = (trackingData) => {
  const requiredFields = ['location', 'status'];
  const missingFields = requiredFields.filter(field => !trackingData[field]);
  
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
};