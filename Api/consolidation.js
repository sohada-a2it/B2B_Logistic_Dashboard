import axiosInstance from '@/lib/axiosInstance'; 
export const getConsolidationQueue = async () => {
  try {
    const response = await axiosInstance.get('/queue');
    
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
 * 24. CREATE CONSOLIDATION
 * API Endpoint: POST /api/v1/consolidation/create
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
 * 25. REMOVE FROM QUEUE
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
 * 26. GET ALL CONSOLIDATIONS
 * API Endpoint: GET /api/v1/consolidation?status=&page=&limit=
 */
export const getConsolidations = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 20,
      ...(params.status && { status: params.status })
    });

    const response = await axiosInstance.get(`/consolidation?${queryParams}`);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination,
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
 * 27. GET CONSOLIDATION BY ID
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
 * 28. UPDATE CONSOLIDATION STATUS
 * API Endpoint: PUT /api/v1/consolidation/:id
 */
export const updateConsolidationStatus = async (consolidationId, updateData) => {
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

// ==================== HELPER FUNCTIONS FOR CONSOLIDATION ====================

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
    'LCL': '📦 LCL'
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

// ==================== CUSTOM HOOK FOR CONSOLIDATION ====================

/**
 * Custom hook for consolidation operations
 */
export const useConsolidation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [queue, setQueue] = useState(null);
  const [consolidations, setConsolidations] = useState([]);
  const [currentConsolidation, setCurrentConsolidation] = useState(null);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getConsolidationQueue();
      if (result.success) {
        setQueue(result.data);
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

  const fetchConsolidations = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const result = await getConsolidations(params);
      if (result.success) {
        setConsolidations(result.data);
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

  const fetchConsolidationById = async (id) => {
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
  };

  const createNewConsolidation = async (data) => {
    try {
      setLoading(true);
      setError(null);
      const result = await createConsolidation(data);
      if (result.success) {
        // Refresh queue and consolidations
        await fetchQueue();
        await fetchConsolidations();
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeItemFromQueue = async (queueId) => {
    try {
      setLoading(true);
      setError(null);
      const result = await removeFromQueue(queueId);
      if (result.success) {
        await fetchQueue();
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (consolidationId, updateData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await updateConsolidationStatus(consolidationId, updateData);
      if (result.success) {
        if (currentConsolidation?._id === consolidationId) {
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
  };

  return {
    loading,
    error,
    queue,
    consolidations,
    currentConsolidation,
    fetchQueue,
    fetchConsolidations,
    fetchConsolidationById,
    createNewConsolidation,
    removeItemFromQueue,
    updateStatus
  };
};