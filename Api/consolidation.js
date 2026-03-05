import axiosInstance from '@/lib/axiosInstance';

// ==================== MAIN API FUNCTIONS ====================

/**
 * 1. ADD TO QUEUE
 * API Endpoint: POST /api/v1/consolidation/queue/add
 */
export const addToQueue = async (shipmentId) => {
  try {
    console.log('📦 Adding shipment to queue:', shipmentId);
    
    const response = await axiosInstance.post('/queue/add', { shipmentId });
    
    if (response.data.success) {
      console.log('✅ Shipment added to queue:', response.data.data);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to add to queue');
    
  } catch (error) {
    console.error('❌ Add to queue error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to add to queue',
      error: error.response?.data
    };
  }
};

/**
 * 2. ADD MULTIPLE TO QUEUE
 * API Endpoint: POST /api/v1/consolidation/queue/add-multiple
 */
export const addMultipleToQueue = async (shipmentIds) => {
  try {
    console.log('📦 Adding multiple shipments to queue:', shipmentIds);
    
    const response = await axiosInstance.post('/queue/add-multiple', { shipmentIds });
    
    if (response.data.success) {
      console.log('✅ Multiple shipments added to queue:', response.data.data);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to add multiple to queue');
    
  } catch (error) {
    console.error('❌ Add multiple to queue error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to add multiple to queue',
      error: error.response?.data
    };
  }
};

/**
 * 3. GET CONSOLIDATION QUEUE (Grouped by MainType + SubType + Origin + Destination)
 * API Endpoint: GET /api/v1/consolidation/queue
 */
export const getConsolidationQueue = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters.groupBy) queryParams.append('groupBy', filters.groupBy);
    if (filters.origin) queryParams.append('origin', filters.origin);
    if (filters.destination) queryParams.append('destination', filters.destination);
    if (filters.mainType) queryParams.append('mainType', filters.mainType);
    if (filters.subType) queryParams.append('subType', filters.subType);
    
    const url = `/queue${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    
    const response = await axiosInstance.get(url);
    
    if (response.data.success) {
      console.log('✅ Consolidation queue fetched:', response.data.data);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to fetch consolidation queue');
    
  } catch (error) {
    console.error('❌ Get consolidation queue error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch consolidation queue',
      error: error.response?.data
    };
  }
};

/**
 * 4. GET QUEUE SUMMARY
 * API Endpoint: GET /api/v1/consolidation/queue/summary
 */
export const getQueueSummary = async () => {
  try {
    const response = await axiosInstance.get('/queue/summary');
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to fetch queue summary');
    
  } catch (error) {
    console.error('❌ Get queue summary error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch queue summary',
      error: error.response?.data
    };
  }
};

/**
 * 5. CREATE CONSOLIDATION
 * API Endpoint: POST /api/v1/consolidation
 */
export const createConsolidation = async (consolidationData) => {
  try {
    console.log('📦 Creating consolidation with data:', consolidationData);
    
    const response = await axiosInstance.post('/consolidation/create', consolidationData);
    
    if (response.data.success) {
      console.log('✅ Consolidation created:', response.data.data);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to create consolidation');
    
  } catch (error) {
    console.error('❌ Create consolidation error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to create consolidation',
      error: error.response?.data
    };
  }
};

/**
 * 6. GET ALL CONSOLIDATIONS
 * API Endpoint: GET /api/v1/consolidation
 */
export const getConsolidations = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 20,
      ...(params.status && { status: params.status }),
      ...(params.mainType && { mainType: params.mainType }),
      ...(params.subType && { subType: params.subType }),
      ...(params.origin && { origin: params.origin }),
      ...(params.destination && { destination: params.destination }),
      ...(params.sortBy && { sortBy: params.sortBy }),
      ...(params.sortOrder && { sortOrder: params.sortOrder })
    });

    const response = await axiosInstance.get(`/all/consolidations?${queryParams}`);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination,
        summary: response.data.summary,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to fetch consolidations');
    
  } catch (error) {
    console.error('❌ Get consolidations error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch consolidations',
      error: error.response?.data
    };
  }
};

/**
 * 7. GET CONSOLIDATION BY ID
 * API Endpoint: GET /api/v1/consolidation/:id
 */
export const getConsolidationById = async (consolidationId) => {
  try {
    const response = await axiosInstance.get(`/consolidation/${consolidationId}`);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to fetch consolidation');
    
  } catch (error) {
    console.error('❌ Get consolidation by id error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch consolidation',
      error: error.response?.data
    };
  }
};

/**
 * 8. UPDATE CONSOLIDATION
 * API Endpoint: PUT /api/v1/consolidation/:id
 */
export const updateConsolidation = async (consolidationId, updateData) => {
  try {
    const response = await axiosInstance.put(`/consolidation/${consolidationId}`, updateData);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to update consolidation');
    
  } catch (error) {
    console.error('❌ Update consolidation error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to update consolidation',
      error: error.response?.data
    };
  }
};

/**
 * 9. UPDATE CONSOLIDATION STATUS
 * API Endpoint: PUT /api/v1/consolidation/:id/status
 */
export const updateConsolidationStatus = async (consolidationId, statusData) => {
  try {
    const response = await axiosInstance.put(`/consolidation/${consolidationId}/status`, statusData);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to update consolidation status');
    
  } catch (error) {
    console.error('❌ Update consolidation status error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to update consolidation status',
      error: error.response?.data
    };
  }
};

/**
 * 10. ADD SHIPMENTS TO CONSOLIDATION
 * API Endpoint: POST /api/v1/consolidation/:id/add-shipments
 */
export const addShipmentsToConsolidation = async (consolidationId, shipmentIds) => {
  try {
    const response = await axiosInstance.post(`/consolidation/${consolidationId}/add-shipments`, { shipmentIds });
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to add shipments to consolidation');
    
  } catch (error) {
    console.error('❌ Add shipments to consolidation error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to add shipments to consolidation',
      error: error.response?.data
    };
  }
};

/**
 * 11. REMOVE SHIPMENT FROM CONSOLIDATION
 * API Endpoint: DELETE /api/v1/consolidation/:id/shipment/:shipmentId
 */
export const removeShipmentFromConsolidation = async (consolidationId, shipmentId) => {
  try {
    const response = await axiosInstance.delete(`/consolidation/${consolidationId}/shipment/${shipmentId}`);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to remove shipment from consolidation');
    
  } catch (error) {
    console.error('❌ Remove shipment from consolidation error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to remove shipment from consolidation',
      error: error.response?.data
    };
  }
};

/**
 * 12. DELETE CONSOLIDATION
 * API Endpoint: DELETE /api/v1/consolidation/:id
 */
export const deleteConsolidation = async (consolidationId) => {
  try {
    const response = await axiosInstance.delete(`/consolidation/${consolidationId}`);
    
    if (response.data.success) {
      return {
        success: true,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to delete consolidation');
    
  } catch (error) {
    console.error('❌ Delete consolidation error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to delete consolidation',
      error: error.response?.data
    };
  }
};

/**
 * 13. REMOVE FROM QUEUE (Single)
 * API Endpoint: DELETE /api/v1/consolidation/queue/:id
 */
export const removeFromQueue = async (queueId) => {
  try {
    const response = await axiosInstance.delete(`/consolidation/queue/${queueId}`);
    
    if (response.data.success) {
      console.log('✅ Removed from queue:', queueId);
      return {
        success: true,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to remove from queue');
    
  } catch (error) {
    console.error('❌ Remove from queue error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to remove from queue',
      error: error.response?.data
    };
  }
};

/**
 * 14. BULK REMOVE FROM QUEUE
 * API Endpoint: POST /api/v1/consolidation/queue/bulk-remove
 */
export const bulkRemoveFromQueue = async (queueItemIds) => {
  try {
    const response = await axiosInstance.post('/consolidation/queue/bulk-remove', { queueItemIds });
    
    if (response.data.success) {
      return {
        success: true,
        message: response.data.message,
        data: response.data.data
      };
    }
    
    throw new Error(response.data.message || 'Failed to bulk remove from queue');
    
  } catch (error) {
    console.error('❌ Bulk remove from queue error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to bulk remove from queue',
      error: error.response?.data
    };
  }
};

/**
 * 15. GET CONSOLIDATION STATISTICS
 * API Endpoint: GET /api/v1/consolidation/stats
 */
export const getConsolidationStats = async (dateRange = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (dateRange.startDate) queryParams.append('startDate', dateRange.startDate);
    if (dateRange.endDate) queryParams.append('endDate', dateRange.endDate);
    
    const url = `/consolidation/stats${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    
    const response = await axiosInstance.get(url);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to fetch consolidation statistics');
    
  } catch (error) {
    console.error('❌ Get consolidation stats error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch consolidation statistics',
      error: error.response?.data
    };
  }
};

/**
 * 16. GET AVAILABLE CONTAINER TYPES
 * API Endpoint: GET /api/v1/consolidation/container-types
 */
export const getAvailableContainerTypes = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.totalVolume) queryParams.append('totalVolume', params.totalVolume);
    if (params.mainType) queryParams.append('mainType', params.mainType);
    
    const url = `/consolidation/container-types${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    
    const response = await axiosInstance.get(url);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to fetch container types');
    
  } catch (error) {
    console.error('❌ Get container types error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch container types',
      error: error.response?.data
    };
  }
};

// ==================== HELPER FUNCTIONS FOR CONSOLIDATION ====================

/**
 * Get main type display name
 */
export const getMainTypeName = (type) => {
  const names = {
    'sea_freight': 'Sea Freight',
    'air_freight': 'Air Freight',
    'inland_trucking': 'Inland Trucking',
    'multimodal': 'Multi-modal'
  };
  return names[type] || type;
};

/**
 * Get sub type display name
 */
export const getSubTypeName = (type) => {
  const names = {
    'sea_freight_fcl': 'FCL',
    'sea_freight_lcl': 'LCL',
    'air_freight': 'Air Freight',
    'rail_freight': 'Rail',
    'express_delivery': 'Express',
    'inland_transport': 'Inland',
    'door_to_door': 'Door to Door'
  };
  return names[type] || type;
};

/**
 * Get consolidation status color for UI
 */
export const getConsolidationStatusColor = (status) => {
  const statusColors = {
    'draft': 'default',
    'in_progress': 'warning',
    'completed': 'success',
    'loaded': 'info',
    'departed': 'primary',
    'arrived': 'success',
    'cancelled': 'error'
  };
  
  return statusColors[status] || 'default';
};

/**
 * Get consolidation status display text
 */
export const getConsolidationStatusDisplayText = (status) => {
  const statusTexts = {
    'draft': 'Draft',
    'in_progress': 'In Progress',
    'completed': 'Completed',
    'loaded': 'Loaded',
    'departed': 'Departed',
    'arrived': 'Arrived',
    'cancelled': 'Cancelled'
  };
  
  return statusTexts[status] || status;
};

/**
 * Format container type with icon
 */
export const formatContainerType = (type) => {
  const containerIcons = {
    '20ft': '📦 20ft',
    '40ft': '📦📦 40ft',
    '40ft HC': '📦📦⬆️ 40ft HC',
    '45ft': '📦📦📦 45ft',
    'LCL': '📦 LCL',
    'ULD': '✈️ ULD',
    'Truck': '🚚 Truck',
    'LTL': '🚚 LTL'
  };
  
  return containerIcons[type] || type;
};

/**
 * Estimate required container type based on volume
 */
export const estimateContainerType = (totalVolume) => {
  if (!totalVolume) return '20ft';
  if (totalVolume <= 28) return '20ft';
  if (totalVolume <= 58) return '40ft';
  if (totalVolume <= 68) return '40ft HC';
  return 'Multiple Containers';
};

/**
 * Format destination display
 */
export const formatDestination = (origin, destination) => {
  return `${origin || 'Unknown'} → ${destination || 'Unknown'}`;
};

/**
 * Format group display name
 */
export const formatGroupDisplayName = (group) => {
  if (!group) return '';
  
  const mainTypeName = getMainTypeName(group.mainType);
  const subTypeName = getSubTypeName(group.subType);
  
  return `${mainTypeName} (${subTypeName}) - ${group.origin || '?'} → ${group.destination || '?'}`;
};

/**
 * Group consolidations by status for dashboard
 */
export const groupConsolidationsByStatus = (consolidations) => {
  if (!consolidations || !consolidations.length) return {};
  
  return consolidations.reduce((groups, item) => {
    const status = item.status || 'unknown';
    if (!groups[status]) {
      groups[status] = [];
    }
    groups[status].push(item);
    return groups;
  }, {});
};

/**
 * Calculate total volume from consolidation items
 */
export const calculateTotalVolume = (items) => {
  if (!items || !items.length) return 0;
  return items.reduce((total, item) => total + (item.volume || 0), 0);
};

/**
 * Calculate total weight from consolidation items
 */
export const calculateTotalWeight = (items) => {
  if (!items || !items.length) return 0;
  return items.reduce((total, item) => total + (item.weight || 0), 0);
};

/**
 * Calculate total packages from consolidation items
 */
export const calculateTotalPackages = (items) => {
  if (!items || !items.length) return 0;
  return items.reduce((total, item) => total + (item.quantity || 1), 0);
};

/**
 * Format volume display
 */
export const formatVolume = (volume) => {
  if (!volume) return '0 m³';
  return `${volume.toFixed(2)} m³`;
};

/**
 * Format weight display
 */
export const formatWeight = (weight) => {
  if (!weight) return '0 kg';
  return `${weight.toFixed(2)} kg`;
};

// ==================== CUSTOM HOOK FOR CONSOLIDATION ====================

import { useState, useCallback } from 'react';

/**
 * Custom hook for consolidation operations
 */
export const useConsolidation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [queueData, setQueueData] = useState(null);
  const [queueSummary, setQueueSummary] = useState(null);
  const [consolidations, setConsolidations] = useState([]);
  const [currentConsolidation, setCurrentConsolidation] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [stats, setStats] = useState(null);

  // Fetch queue with grouping
  const fetchQueue = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const result = await getConsolidationQueue(filters);
      if (result.success) {
        setQueueData(result.data);
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
  }, []);

  // Fetch queue summary
  const fetchQueueSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getQueueSummary();
      if (result.success) {
        setQueueSummary(result.data);
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch consolidations with pagination
  const fetchConsolidations = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const result = await getConsolidations(params);
      if (result.success) {
        setConsolidations(result.data);
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
  }, []);

  // Fetch single consolidation by ID
  const fetchConsolidationById = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const result = await getConsolidationById(id);
      if (result.success) {
        setCurrentConsolidation(result.data);
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
  }, []);

  // Create new consolidation
  const createNewConsolidation = useCallback(async (data) => {
    try {
      setLoading(true);
      setError(null);
      const result = await createConsolidation(data);
      if (result.success) {
        // Refresh queue and consolidations
        await fetchQueue();
        await fetchConsolidations();
        await fetchQueueSummary();
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchQueue, fetchConsolidations, fetchQueueSummary]);

  // Update consolidation
  const updateExistingConsolidation = useCallback(async (id, data) => {
    try {
      setLoading(true);
      setError(null);
      const result = await updateConsolidation(id, data);
      if (result.success) {
        if (currentConsolidation?._id === id) {
          setCurrentConsolidation(result.data);
        }
        await fetchConsolidations();
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentConsolidation, fetchConsolidations]);

  // Update consolidation status
  const updateStatus = useCallback(async (id, statusData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await updateConsolidationStatus(id, statusData);
      if (result.success) {
        if (currentConsolidation?._id === id) {
          setCurrentConsolidation(result.data);
        }
        await fetchConsolidations();
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentConsolidation, fetchConsolidations]);

  // Add to queue
  const addShipmentToQueue = useCallback(async (shipmentId) => {
    try {
      setLoading(true);
      setError(null);
      const result = await addToQueue(shipmentId);
      if (result.success) {
        await fetchQueue();
        await fetchQueueSummary();
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchQueue, fetchQueueSummary]);

  // Add multiple to queue
  const addMultipleToQueue = useCallback(async (shipmentIds) => {
    try {
      setLoading(true);
      setError(null);
      const result = await addMultipleToQueue(shipmentIds);
      if (result.success) {
        await fetchQueue();
        await fetchQueueSummary();
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchQueue, fetchQueueSummary]);

  // Remove single from queue
  const removeItemFromQueue = useCallback(async (queueId) => {
    try {
      setLoading(true);
      setError(null);
      const result = await removeFromQueue(queueId);
      if (result.success) {
        await fetchQueue();
        await fetchQueueSummary();
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchQueue, fetchQueueSummary]);

  // Bulk remove from queue
  const bulkRemoveFromQueue = useCallback(async (queueItemIds) => {
    try {
      setLoading(true);
      setError(null);
      const result = await bulkRemoveFromQueue(queueItemIds);
      if (result.success) {
        await fetchQueue();
        await fetchQueueSummary();
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchQueue, fetchQueueSummary]);

  // Add shipments to existing consolidation
  const addToExistingConsolidation = useCallback(async (consolidationId, shipmentIds) => {
    try {
      setLoading(true);
      setError(null);
      const result = await addShipmentsToConsolidation(consolidationId, shipmentIds);
      if (result.success) {
        if (currentConsolidation?._id === consolidationId) {
          setCurrentConsolidation(result.data);
        }
        await fetchConsolidations();
        await fetchQueue();
        await fetchQueueSummary();
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentConsolidation, fetchConsolidations, fetchQueue, fetchQueueSummary]);

  // Remove shipment from consolidation
  const removeShipment = useCallback(async (consolidationId, shipmentId) => {
    try {
      setLoading(true);
      setError(null);
      const result = await removeShipmentFromConsolidation(consolidationId, shipmentId);
      if (result.success) {
        if (currentConsolidation?._id === consolidationId) {
          setCurrentConsolidation(result.data);
        }
        await fetchConsolidations();
        await fetchQueue();
        await fetchQueueSummary();
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentConsolidation, fetchConsolidations, fetchQueue, fetchQueueSummary]);

  // Delete consolidation
  const removeConsolidation = useCallback(async (consolidationId) => {
    try {
      setLoading(true);
      setError(null);
      const result = await deleteConsolidation(consolidationId);
      if (result.success) {
        if (currentConsolidation?._id === consolidationId) {
          setCurrentConsolidation(null);
        }
        await fetchConsolidations();
        await fetchQueue();
        await fetchQueueSummary();
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentConsolidation, fetchConsolidations, fetchQueue, fetchQueueSummary]);

  // Fetch statistics
  const fetchStats = useCallback(async (dateRange = {}) => {
    try {
      setLoading(true);
      setError(null);
      const result = await getConsolidationStats(dateRange);
      if (result.success) {
        setStats(result.data);
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get available container types
  const getContainerTypes = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const result = await getAvailableContainerTypes(params);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear current consolidation
  const clearCurrentConsolidation = useCallback(() => {
    setCurrentConsolidation(null);
  }, []);

  // Clear errors
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    loading,
    error,
    queueData,
    queueSummary,
    consolidations,
    currentConsolidation,
    pagination,
    stats,
    
    // Queue operations
    fetchQueue,
    fetchQueueSummary,
    addShipmentToQueue,
    addMultipleToQueue,
    removeItemFromQueue,
    bulkRemoveFromQueue,
    
    // Consolidation operations
    fetchConsolidations,
    fetchConsolidationById,
    createNewConsolidation,
    updateExistingConsolidation,
    updateStatus,
    addToExistingConsolidation,
    removeShipment,
    removeConsolidation,
    clearCurrentConsolidation,
    
    // Stats and utilities
    fetchStats,
    getContainerTypes,
    clearError
  };
};