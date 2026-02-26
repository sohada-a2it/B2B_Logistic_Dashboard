// pages/CreateShipment.jsx
"use client"
import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Truck, 
  MapPin, 
  User, 
  FileText, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  X, 
  Plus, 
  Trash2, 
  Save, 
  AlertCircle,
  Info,
  Building2,
  Weight,
  Box,
  Search,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Calendar,
  Clock,
  Globe,
  Phone,
  Mail,
  Map,
  DollarSign,
  Shield,
  FileCheck
} from 'lucide-react';

// Import from booking service
import {
  getBookings,
  getStatusColor,
  getStatusDisplayText,
  formatBookingDate,
  formatCurrency,
  formatWeight,
  formatVolume,
  updateBookingStatus
} from '@/Api/booking';

// Import from shipment service
import { createShipment } from '@/Api/shipping';

const CreateShipment = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookingSearch, setShowBookingSearch] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdShipment, setCreatedShipment] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  
  const [formData, setFormData] = useState({
    bookingId: '',
    mode: 'Sea Freight',
    shipmentType: 'Sea Freight (FCL)',
    packages: [],
    specialInstructions: '',
    insurance: {
      required: false,
      coverageAmount: '',
      currency: 'USD'
    },
    customsInfo: {
      brokerName: '',
      brokerContact: '',
      dutiesPaid: false
    },
    paymentTerms: '',
    transport: {
      carrierName: '',
      estimatedDeparture: '',
      estimatedArrival: '',
      route: ''
    }
  });

  const steps = [
    { title: 'Select Booking', icon: FileText },
    { title: 'Shipment Details', icon: Package },
    { title: 'Package Information', icon: Box },
    { title: 'Transport & Dates', icon: Truck },
    { title: 'Additional Info', icon: FileCheck },
    { title: 'Review & Create', icon: CheckCircle2 }
  ];

  const shipmentModes = [
    'Sea Freight',
    'Air Freight', 
    'Inland Trucking',
    'Multimodal'
  ];

  const shipmentTypes = {
    'Sea Freight': ['Sea Freight (FCL)', 'Sea Freight (LCL)'],
    'Air Freight': ['Air Freight', 'Express Delivery'],
    'Inland Trucking': ['Inland Transport'],
    'Multimodal': ['Door to Door', 'Multimodal']
  };

  const packageTypes = [
    'Pallet', 'Carton', 'Crate', 'Box', 'Container',
    'Envelope', 'Loose', 'Drum', 'Bag', 'Bundle'
  ];

  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'THB'];
  const conditions = ['Excellent', 'Good', 'Fair', 'Damaged'];

  // Fetch only confirmed bookings on mount
  useEffect(() => {
    fetchConfirmedBookings();
  }, []);

  // Filter bookings based on search
  useEffect(() => {
    if (bookings.length > 0) {
      const filtered = bookings.filter(booking => 
        booking.bookingNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.customer?.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.customer?.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.shipmentDetails?.origin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.shipmentDetails?.destination?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBookings(filtered);
    }
  }, [searchTerm, bookings]);

  // ফিক্সড: ফেচ ফাংশন - শুধু কনফার্মড বুকিং দেখাবে
  const fetchConfirmedBookings = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      console.log('Fetching confirmed bookings...');
      
      // শুধু কনফার্মড বুকিং ফেচ করুন
      const response = await getBookings({ 
        status: 'confirmed', // 'confirmed' স্টেটাস ব্যবহার করুন
        limit: 50 
      });
      
      console.log('API Response:', response);
      
      let bookingsData = [];
      if (response && response.data) {
        bookingsData = response.data;
      } else if (response && Array.isArray(response)) {
        bookingsData = response;
      }
      
      console.log('All bookings:', bookingsData);
      
      // ডাবল চেক: নিশ্চিত করুন শুধু কনফার্মড বুকিং দেখাচ্ছে
      const confirmedBookings = bookingsData.filter(booking => {
        const status = booking.status?.toLowerCase?.() || '';
        return status === 'confirmed' || status === 'booking_confirmed';
      });
      
      console.log('Filtered confirmed bookings:', confirmedBookings);
      
      setBookings(confirmedBookings);
      setFilteredBookings(confirmedBookings);
      
      if (confirmedBookings.length === 0) {
        alert('No confirmed bookings found'); // অথবা toast ব্যবহার করুন
      }
      
    } catch (error) {
      console.error('Error fetching confirmed bookings:', error);
      setFetchError(error.message || 'Failed to load confirmed bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handlePackageChange = (index, field, value) => {
    const updatedPackages = [...formData.packages];
    updatedPackages[index] = {
      ...updatedPackages[index],
      [field]: value
    };

    // Auto-calculate volume if dimensions provided
    if (['length', 'width', 'height'].includes(field)) {
      const pkg = updatedPackages[index];
      if (pkg.length && pkg.width && pkg.height) {
        // Convert cm to cubic meters
        pkg.volume = Number(((pkg.length * pkg.width * pkg.height) / 1000000).toFixed(3));
      }
    }

    setFormData(prev => ({
      ...prev,
      packages: updatedPackages
    }));
  };

  const addPackage = () => {
    setFormData(prev => ({
      ...prev,
      packages: [...prev.packages, {
        packageType: 'Carton',
        quantity: 1,
        weight: 0,
        volume: 0,
        description: '',
        length: '',
        width: '',
        height: '',
        marksAndNumbers: '',
        hsCode: '',
        declaredValue: '',
        currency: 'USD',
        condition: 'Good'
      }]
    }));
  };

  const removePackage = (index) => {
    if (formData.packages.length > 1) {
      setFormData(prev => ({
        ...prev,
        packages: prev.packages.filter((_, i) => i !== index)
      }));
    }
  };

  // ফিক্সড: বুকিং সিলেক্ট ফাংশন
  const handleSelectBooking = (booking) => {
    console.log('Selected booking:', booking);
    
    // গুরুত্বপূর্ণ: MongoDB _id ব্যবহার করুন
    const bookingId = booking._id;  // শুধু _id ব্যবহার করুন
    
    console.log('Booking ID (MongoDB _id):', bookingId);
    console.log('Booking Number:', booking.bookingNumber);
    
    if (!bookingId) {
      alert('Invalid booking: No ID found');
      return;
    }
    
    setSelectedBooking(booking);
    
    // ফর্মে bookingId সেট করুন
    setFormData(prev => ({
      ...prev,
      bookingId: bookingId  // MongoDB _id সংরক্ষণ করুন
    }));
    
    // বুকিং থেকে প্যাকেজ ডাটা আনুন
    if (booking.shipmentDetails) {
      const packages = [];
      
      if (booking.shipmentDetails.cargoDetails?.length > 0) {
        booking.shipmentDetails.cargoDetails.forEach(cargo => {
          packages.push({
            packageType: cargo.packageType || 'Carton',
            quantity: cargo.quantity || 1,
            weight: cargo.weight || 0,
            volume: cargo.volume || 0,
            description: cargo.description || '',
            length: cargo.length || '',
            width: cargo.width || '',
            height: cargo.height || '',
            marksAndNumbers: '',
            hsCode: '',
            declaredValue: '',
            currency: 'USD',
            condition: 'Good'
          });
        });
      } else {
        packages.push({
          packageType: 'Carton',
          quantity: booking.shipmentDetails.totalCartons || 1,
          weight: booking.shipmentDetails.totalWeight || 0,
          volume: booking.shipmentDetails.totalVolume || 0,
          description: booking.shipmentDetails.cargoDescription || '',
          length: '',
          width: '',
          height: '',
          marksAndNumbers: '',
          hsCode: '',
          declaredValue: '',
          currency: 'USD',
          condition: 'Good'
        });
      }
      
      setFormData(prev => ({
        ...prev,
        packages: packages
      }));
    }
    
    setShowBookingSearch(false);
    alert(`Booking #${booking.bookingNumber} selected`);
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch(step) {
      case 0:
        if (!formData.bookingId) {
          newErrors.bookingId = 'Please select a confirmed booking';
        }
        break;
        
      case 1:
        if (!formData.mode) {
          newErrors.mode = 'Shipment mode is required';
        }
        if (!formData.shipmentType) {
          newErrors.shipmentType = 'Shipment type is required';
        }
        break;
        
      case 2:
        if (formData.packages.length === 0) {
          newErrors.packages = 'At least one package is required';
        } else {
          formData.packages.forEach((pkg, index) => {
            if (!pkg.packageType) {
              newErrors[`packages.${index}.packageType`] = 'Package type required';
            }
            if (!pkg.quantity || pkg.quantity < 1) {
              newErrors[`packages.${index}.quantity`] = 'Valid quantity required';
            }
            if (!pkg.weight || pkg.weight <= 0) {
              newErrors[`packages.${index}.weight`] = 'Valid weight required';
            }
          });
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const calculateTotals = () => {
    const totalPackages = formData.packages.reduce((sum, pkg) => sum + (pkg.quantity || 0), 0);
    const totalWeight = formData.packages.reduce((sum, pkg) => sum + ((pkg.weight || 0) * (pkg.quantity || 0)), 0);
    const totalVolume = formData.packages.reduce((sum, pkg) => sum + ((pkg.volume || 0) * (pkg.quantity || 0)), 0);
    
    return { totalPackages, totalWeight, totalVolume };
  };

  // ফিক্সড: সাবমিট ফাংশন
const handleSubmit = async () => {
  if (!validateStep(activeStep)) {
    return;
  }

  setSubmitting(true);
  setErrors({});
  
  try {
    console.log('========== FRONTEND DEBUG ==========');
    
    // Get the booking ID
    const bookingId = selectedBooking?._id || formData.bookingId;
    
    console.log('1. Selected booking object:', selectedBooking);
    console.log('2. Selected booking _id:', selectedBooking?._id);
    console.log('3. Selected booking bookingNumber:', selectedBooking?.bookingNumber);
    console.log('4. FormData bookingId:', formData.bookingId);
    console.log('5. Final bookingId to send:', bookingId);
    console.log('6. Type of bookingId:', typeof bookingId);
    
    if (!bookingId) {
      console.log('7. ERROR: No booking ID found');
      throw new Error('No booking selected');
    }

    // Validate that it's a valid MongoDB ObjectId format
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(bookingId);
    console.log('8. Is valid MongoDB ObjectId format:', isValidObjectId);
    
    if (!isValidObjectId) {
      console.log('9. WARNING: bookingId is not in MongoDB ObjectId format');
    }

    // Calculate totals
    const totalPackages = formData.packages.reduce((sum, pkg) => sum + pkg.quantity, 0);
    const totalWeight = formData.packages.reduce((sum, pkg) => sum + (pkg.weight * pkg.quantity), 0);
    const totalVolume = formData.packages.reduce((sum, pkg) => sum + (pkg.volume * pkg.quantity), 0);

    // Create shipment data - SIMPLE AND CLEAN
    const shipmentData = {
      // Put bookingId at the root level - this is what backend expects
      bookingId: bookingId,
      
      // Other fields
      mode: formData.mode,
      shipmentType: formData.shipmentType,
      specialInstructions: formData.specialInstructions || '',
      paymentTerms: formData.paymentTerms || '',
      
      packages: formData.packages.map(pkg => ({
        packageType: pkg.packageType,
        quantity: Number(pkg.quantity),
        weight: Number(pkg.weight),
        volume: Number(pkg.volume || 0),
        description: pkg.description || '',
        length: pkg.length ? Number(pkg.length) : undefined,
        width: pkg.width ? Number(pkg.width) : undefined,
        height: pkg.height ? Number(pkg.height) : undefined,
        marksAndNumbers: pkg.marksAndNumbers || '',
        hsCode: pkg.hsCode || '',
        condition: pkg.condition || 'Good'
      })),
      
      insurance: {
        required: formData.insurance.required,
        coverageAmount: formData.insurance.coverageAmount,
        currency: formData.insurance.currency
      },
      
      customsInfo: {
        brokerName: formData.customsInfo.brokerName,
        brokerContact: formData.customsInfo.brokerContact,
        dutiesPaid: formData.customsInfo.dutiesPaid
      },
      
      transport: {
        carrierName: formData.transport.carrierName || '',
        estimatedDeparture: formData.transport.estimatedDeparture || '',
        estimatedArrival: formData.transport.estimatedArrival || '',
        route: formData.transport.route || ''
      }
    };

    console.log('10. Final shipment data being sent:', JSON.stringify(shipmentData, null, 2));

    // Make the API call
    console.log('11. Sending request to create shipment...');
    const response = await createShipment(shipmentData);
    
    console.log('12. API Response:', response);

    if (response && response.success) {
      console.log('13. Shipment created successfully!');
      setCreatedShipment(response.data);
      setShowSuccess(true);
      
      setTimeout(() => {
        window.location.href = `/shipments/${response.data._id}`;
      }, 2000);
    } else {
      throw new Error(response?.message || 'Failed to create shipment');
    }
    
  } catch (error) {
    console.error('ERROR in handleSubmit:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });
    setErrors({ submit: error.message });
    alert('Error: ' + error.message);
  } finally {
    setSubmitting(false);
  }
};

  const { totalPackages, totalWeight, totalVolume } = calculateTotals();

  const StepIcon = ({ icon: Icon, active, completed }) => (
    <div className={`
      w-10 h-10 rounded-full flex items-center justify-center
      ${completed ? 'bg-green-500' : active ? 'bg-blue-500' : 'bg-gray-200'}
      transition-colors duration-200
    `}>
      {completed ? (
        <Check className="w-5 h-5 text-white" />
      ) : (
        <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-500'}`} />
      )}
    </div>
  );

  const BookingSearchModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Select Confirmed Booking</h2>
            <button 
              onClick={() => setShowBookingSearch(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="mt-2">
            <p className="text-sm text-green-600 flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Only confirmed bookings are shown
            </p>
          </div>
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by booking number, customer, origin, destination..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
        
        <div className="overflow-y-auto max-h-[calc(80vh-180px)] p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : fetchError ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <p className="text-red-600">{fetchError}</p>
              <button 
                onClick={fetchConfirmedBookings}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No confirmed bookings found</p>
              <p className="text-sm text-gray-400 mt-1">
                {searchTerm ? 'Try a different search term' : 'Bookings must be confirmed first'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map(booking => {
                const statusColor = getStatusColor(booking.status);
                const statusText = getStatusDisplayText(booking.status);
                
                return (
                  <div
                    key={booking._id || booking.id}
                    onClick={() => handleSelectBooking(booking)}
                    className="border border-green-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md cursor-pointer transition-all bg-green-50/30"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <span className="text-lg font-semibold text-gray-800">
                            {booking.bookingNumber}
                          </span>
                          <span className={`px-2 py-1 ${statusColor.bg} ${statusColor.text} text-xs rounded-full`}>
                            {statusText}
                          </span>
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Confirmed ✓
                          </span>
                        </div>
                        
                        <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                            <div>
                              <div className="font-medium">{booking.customer?.companyName}</div>
                              <div className="text-xs text-gray-500">{booking.customer?.contactPerson}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                            <span>{booking.shipmentDetails?.origin} → {booking.shipmentDetails?.destination}</span>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                            <span>{formatBookingDate(booking.createdAt)}</span>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-600">
                            <Package className="w-4 h-4 mr-2 text-gray-400" />
                            <span>{booking.shipmentDetails?.totalCartons || 0} pcs</span>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-600">
                            <Weight className="w-4 h-4 mr-2 text-gray-400" />
                            <span>{formatWeight(booking.shipmentDetails?.totalWeight)}</span>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-600">
                            <Box className="w-4 h-4 mr-2 text-gray-400" />
                            <span>{formatVolume(booking.shipmentDetails?.totalVolume)}</span>
                          </div>
                        </div>
                        
                        {booking.shipmentDetails?.cargoDetails?.[0] && (
                          <div className="mt-2 text-xs text-gray-500">
                            Cargo: {booking.shipmentDetails.cargoDetails[0].description}
                            {booking.shipmentDetails.cargoDetails.length > 1 && 
                              ` +${booking.shipmentDetails.cargoDetails.length - 1} more`
                            }
                          </div>
                        )}
                      </div>
                      
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Total Confirmed: {filteredBookings.length} bookings</span>
            <button
              onClick={fetchConfirmedBookings}
              className="text-blue-600 hover:text-blue-800"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const PreviewModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Preview Shipment</h2>
          <button 
            onClick={() => setShowPreview(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Selected Booking Info */}
          {selectedBooking && (
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-green-800 mb-3 flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Based on Confirmed Booking #{selectedBooking.bookingNumber}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-green-600">Customer</p>
                  <p className="font-medium text-green-900">{selectedBooking.customer?.companyName}</p>
                </div>
                <div>
                  <p className="text-xs text-green-600">Origin</p>
                  <p className="font-medium text-green-900">{selectedBooking.shipmentDetails?.origin}</p>
                </div>
                <div>
                  <p className="text-xs text-green-600">Destination</p>
                  <p className="font-medium text-green-900">{selectedBooking.shipmentDetails?.destination}</p>
                </div>
                <div>
                  <p className="text-xs text-green-600">Status</p>
                  <p className="font-medium text-green-900">{getStatusDisplayText(selectedBooking.status)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Shipment Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Packages</p>
                  <p className="text-2xl font-semibold text-gray-800">{totalPackages}</p>
                </div>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Weight className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Weight</p>
                  <p className="text-2xl font-semibold text-gray-800">{formatWeight(totalWeight)}</p>
                </div>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Box className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Volume</p>
                  <p className="text-2xl font-semibold text-gray-800">{formatVolume(totalVolume)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Packages Table */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Packages</h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Weight</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Volume</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {formData.packages.map((pkg, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 text-sm text-gray-900">{pkg.packageType}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{pkg.quantity}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{formatWeight(pkg.weight)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{formatVolume(pkg.volume)}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {pkg.description || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Shipment Details */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Shipment Information</h3>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Mode:</dt>
                  <dd className="text-sm font-medium text-gray-900">{formData.mode}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Type:</dt>
                  <dd className="text-sm font-medium text-gray-900">{formData.shipmentType}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Carrier:</dt>
                  <dd className="text-sm font-medium text-gray-900">{formData.transport.carrierName || 'Not specified'}</dd>
                </div>
                {formData.insurance.required && (
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Insurance:</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {formatCurrency(formData.insurance.coverageAmount, formData.insurance.currency)}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Dates</h3>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Est. Departure:</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {formData.transport.estimatedDeparture 
                      ? new Date(formData.transport.estimatedDeparture).toLocaleDateString() 
                      : 'Not set'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Est. Arrival:</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {formData.transport.estimatedArrival 
                      ? new Date(formData.transport.estimatedArrival).toLocaleDateString() 
                      : 'Not set'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => setShowPreview(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Edit
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Shipment
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const SuccessModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm mx-auto">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <Check className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Shipment Created!</h3>
          <p className="text-sm text-gray-500 mb-4">
            Shipment #{createdShipment?.shipmentNumber} has been created successfully from confirmed booking.
          </p>
          <p className="text-xs text-gray-400">Redirecting to shipment details...</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-semibold text-gray-900">Create Shipment from Confirmed Booking</h1>
              {selectedBooking && (
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Confirmed Booking: {selectedBooking.bookingNumber}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowPreview(true)}
                disabled={!selectedBooking}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Package className="w-4 h-4 mr-2" />
                Preview
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || activeStep !== steps.length - 1 || !selectedBooking}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Create Shipment
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center flex-1">
                <div className="flex items-center">
                  <StepIcon 
                    icon={step.icon} 
                    active={activeStep === index}
                    completed={index < activeStep}
                  />
                  <span className={`ml-2 text-sm font-medium hidden sm:block
                    ${index === activeStep ? 'text-blue-600' : 
                      index < activeStep ? 'text-green-600' : 'text-gray-500'}
                  `}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-1 mx-4">
                    <div className="h-1 bg-gray-200 rounded">
                      <div 
                        className="h-1 bg-blue-500 rounded transition-all duration-300"
                        style={{ width: activeStep > index ? '100%' : '0%' }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Step 0: Select Booking */}
          {activeStep === 0 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Confirmed Booking <span className="text-red-500">*</span>
                </label>
                {!formData.bookingId ? (
                  <button
                    onClick={() => setShowBookingSearch(true)}
                    className="w-full p-8 border-2 border-dashed border-green-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors group"
                  >
                    <FileText className="w-12 h-12 mx-auto text-gray-400 group-hover:text-blue-500 mb-3" />
                    <p className="text-gray-600 group-hover:text-blue-600 font-medium">
                      Click to select a confirmed booking
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Only confirmed bookings can be converted to shipments
                    </p>
                  </button>
                ) : (
                  <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-green-800">
                            Confirmed Booking #{selectedBooking?.bookingNumber} selected
                          </p>
                          <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-2">
                            <p className="text-sm text-green-700">
                              <span className="font-medium">Customer:</span> {selectedBooking?.customer?.companyName}
                            </p>
                            <p className="text-sm text-green-700">
                              <span className="font-medium">Contact:</span> {selectedBooking?.customer?.contactPerson}
                            </p>
                            <p className="text-sm text-green-700">
                              <span className="font-medium">Origin:</span> {selectedBooking?.shipmentDetails?.origin}
                            </p>
                            <p className="text-sm text-green-700">
                              <span className="font-medium">Destination:</span> {selectedBooking?.shipmentDetails?.destination}
                            </p>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          handleInputChange('bookingId', '');
                          setSelectedBooking(null);
                          setFormData(prev => ({ ...prev, packages: [] }));
                        }}
                        className="text-green-700 hover:text-green-900"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
                {errors.bookingId && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.bookingId}
                  </p>
                )}
              </div>

              {/* Booking Details Preview */}
              {selectedBooking && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Confirmed Booking Details</h3>
                  <dl className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-xs text-gray-500">Shipper Information</dt>
                      <dd className="text-sm font-medium text-gray-900 mt-1">
                        {selectedBooking.customer?.companyName}
                      </dd>
                      <dd className="text-xs text-gray-600">
                        {selectedBooking.customer?.contactPerson}
                      </dd>
                      <dd className="text-xs text-gray-600">
                        {selectedBooking.customer?.email}
                      </dd>
                      <dd className="text-xs text-gray-600">
                        {selectedBooking.customer?.phone}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-500">Cargo Summary</dt>
                      <dd className="text-sm text-gray-900 mt-1">
                        {selectedBooking.shipmentDetails?.totalCartons || 0} packages
                      </dd>
                      <dd className="text-xs text-gray-600">
                        Weight: {formatWeight(selectedBooking.shipmentDetails?.totalWeight)}
                      </dd>
                      <dd className="text-xs text-gray-600">
                        Volume: {formatVolume(selectedBooking.shipmentDetails?.totalVolume)}
                      </dd>
                    </div>
                  </dl>
                </div>
              )}
            </div>
          )}

          {/* Step 1: Shipment Details */}
          {activeStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shipment Mode <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.mode}
                    onChange={(e) => {
                      handleInputChange('mode', e.target.value);
                      handleInputChange('shipmentType', shipmentTypes[e.target.value][0]);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {shipmentModes.map(mode => (
                      <option key={mode} value={mode}>{mode}</option>
                    ))}
                  </select>
                  {errors.mode && (
                    <p className="mt-1 text-sm text-red-600">{errors.mode}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shipment Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.shipmentType}
                    onChange={(e) => handleInputChange('shipmentType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {shipmentTypes[formData.mode]?.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.shipmentType && (
                    <p className="mt-1 text-sm text-red-600">{errors.shipmentType}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Instructions
                </label>
                <textarea
                  value={formData.specialInstructions}
                  onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Any special handling instructions..."
                />
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-start">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-blue-800 font-medium">Shipment Information</p>
                    <p className="text-sm text-blue-600 mt-1">
                      Shipper and consignee details are populated from the confirmed booking.
                      Package details can be modified in the next step.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Package Information */}
          {activeStep === 2 && (
            <div className="space-y-6">
              {formData.packages.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No packages added yet</p>
                  <button
                    onClick={addPackage}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add First Package
                  </button>
                </div>
              ) : (
                <>
                  {formData.packages.map((pkg, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-medium text-gray-700">
                          Package {index + 1}
                        </h3>
                        {formData.packages.length > 1 && (
                          <button
                            onClick={() => removePackage(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            Package Type *
                          </label>
                          <select
                            value={pkg.packageType}
                            onChange={(e) => handlePackageChange(index, 'packageType', e.target.value)}
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          >
                            {packageTypes.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                          {errors[`packages.${index}.packageType`] && (
                            <p className="mt-1 text-xs text-red-600">{errors[`packages.${index}.packageType`]}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            Quantity *
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={pkg.quantity}
                            onChange={(e) => handlePackageChange(index, 'quantity', parseInt(e.target.value) || 1)}
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          {errors[`packages.${index}.quantity`] && (
                            <p className="mt-1 text-xs text-red-600">{errors[`packages.${index}.quantity`]}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            Weight (kg) *
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={pkg.weight}
                            onChange={(e) => handlePackageChange(index, 'weight', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          {errors[`packages.${index}.weight`] && (
                            <p className="mt-1 text-xs text-red-600">{errors[`packages.${index}.weight`]}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            Volume (m³)
                          </label>
                          <input
                            type="number"
                            step="0.001"
                            min="0"
                            value={pkg.volume}
                            onChange={(e) => handlePackageChange(index, 'volume', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            Length (cm)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            value={pkg.length}
                            onChange={(e) => handlePackageChange(index, 'length', parseFloat(e.target.value) || '')}
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            Width (cm)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            value={pkg.width}
                            onChange={(e) => handlePackageChange(index, 'width', parseFloat(e.target.value) || '')}
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            Height (cm)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            value={pkg.height}
                            onChange={(e) => handlePackageChange(index, 'height', parseFloat(e.target.value) || '')}
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            Condition
                          </label>
                          <select
                            value={pkg.condition}
                            onChange={(e) => handlePackageChange(index, 'condition', e.target.value)}
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          >
                            {conditions.map(condition => (
                              <option key={condition} value={condition}>{condition}</option>
                            ))}
                          </select>
                        </div>

                        <div className="col-span-3">
                          <label className="block text-xs text-gray-500 mb-1">
                            Description
                          </label>
                          <input
                            type="text"
                            value={pkg.description}
                            onChange={(e) => handlePackageChange(index, 'description', e.target.value)}
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            placeholder="Cargo description..."
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="block text-xs text-gray-500 mb-1">
                            Marks & Numbers
                          </label>
                          <input
                            type="text"
                            value={pkg.marksAndNumbers}
                            onChange={(e) => handlePackageChange(index, 'marksAndNumbers', e.target.value)}
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            placeholder="Shipping marks..."
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            HS Code
                          </label>
                          <input
                            type="text"
                            value={pkg.hsCode}
                            onChange={(e) => handlePackageChange(index, 'hsCode', e.target.value)}
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={addPackage}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Another Package
                  </button>
                </>
              )}

              {/* Package Summary */}
              {formData.packages.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Package Summary</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Total Packages</p>
                      <p className="text-lg font-semibold text-gray-900">{totalPackages}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total Weight</p>
                      <p className="text-lg font-semibold text-gray-900">{formatWeight(totalWeight)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total Volume</p>
                      <p className="text-lg font-semibold text-gray-900">{formatVolume(totalVolume)}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {errors.packages && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.packages}
                </p>
              )}
            </div>
          )}

          {/* Step 3: Transport & Dates */}
          {activeStep === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Carrier Name
                  </label>
                  <input
                    type="text"
                    value={formData.transport.carrierName}
                    onChange={(e) => handleInputChange('transport', {
                      ...formData.transport,
                      carrierName: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter carrier name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Route
                  </label>
                  <input
                    type="text"
                    value={formData.transport.route}
                    onChange={(e) => handleInputChange('transport', {
                      ...formData.transport,
                      route: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Direct, Transshipment"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Departure
                  </label>
                  <input
                    type="date"
                    value={formData.transport.estimatedDeparture}
                    onChange={(e) => handleInputChange('transport', {
                      ...formData.transport,
                      estimatedDeparture: e.target.value
                    })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Arrival
                  </label>
                  <input
                    type="date"
                    value={formData.transport.estimatedArrival}
                    onChange={(e) => handleInputChange('transport', {
                      ...formData.transport,
                      estimatedArrival: e.target.value
                    })}
                    min={formData.transport.estimatedDeparture || new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {formData.transport.estimatedDeparture && formData.transport.estimatedArrival && (
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="flex items-start">
                    <Clock className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-yellow-800 font-medium">Transit Time</p>
                      <p className="text-sm text-yellow-600 mt-1">
                        {Math.ceil(
                          (new Date(formData.transport.estimatedArrival) - new Date(formData.transport.estimatedDeparture)) 
                          / (1000 * 60 * 60 * 24)
                        )} days
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Additional Info */}
          {activeStep === 4 && (
            <div className="space-y-6">
              {/* Insurance Section */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-700">Insurance</h3>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.insurance.required}
                      onChange={(e) => handleInputChange('insurance', {
                        ...formData.insurance,
                        required: e.target.checked
                      })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">Add insurance</span>
                  </label>
                </div>

                {formData.insurance.required && (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Coverage Amount
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.insurance.coverageAmount}
                        onChange={(e) => handleInputChange('insurance', {
                          ...formData.insurance,
                          coverageAmount: e.target.value
                        })}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Currency
                      </label>
                      <select
                        value={formData.insurance.currency}
                        onChange={(e) => handleInputChange('insurance', {
                          ...formData.insurance,
                          currency: e.target.value
                        })}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                      >
                        {currencies.map(currency => (
                          <option key={currency} value={currency}>{currency}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Customs Info */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-4">Customs Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Broker Name
                    </label>
                    <input
                      type="text"
                      value={formData.customsInfo.brokerName}
                      onChange={(e) => handleInputChange('customsInfo', {
                        ...formData.customsInfo,
                        brokerName: e.target.value
                      })}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Broker Contact
                    </label>
                    <input
                      type="text"
                      value={formData.customsInfo.brokerContact}
                      onChange={(e) => handleInputChange('customsInfo', {
                        ...formData.customsInfo,
                        brokerContact: e.target.value
                      })}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.customsInfo.dutiesPaid}
                      onChange={(e) => handleInputChange('customsInfo', {
                        ...formData.customsInfo,
                        dutiesPaid: e.target.checked
                      })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">Duties prepaid</span>
                  </label>
                </div>
              </div>

              {/* Payment Terms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Terms
                </label>
                <input
                  type="text"
                  value={formData.paymentTerms}
                  onChange={(e) => handleInputChange('paymentTerms', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., Prepaid, Collect, 30 days"
                />
              </div>
            </div>
          )}

          {/* Step 5: Review & Create */}
          {activeStep === 5 && (
            <div className="space-y-6">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      All information completed. Review before creating shipment from confirmed booking.
                    </p>
                  </div>
                </div>
              </div>

              {/* Shipment Summary Card */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700">Shipment Summary</h3>
                </div>
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Confirmed Booking</p>
                      <p className="text-sm font-medium">{selectedBooking?.bookingNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Customer</p>
                      <p className="text-sm font-medium">{selectedBooking?.customer?.companyName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Mode</p>
                      <p className="text-sm font-medium">{formData.mode}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Type</p>
                      <p className="text-sm font-medium">{formData.shipmentType}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-2">Packages ({formData.packages.length})</p>
                    <div className="bg-gray-50 rounded p-3">
                      <div className="grid grid-cols-4 gap-2 text-xs font-medium text-gray-500 mb-2">
                        <span>Type</span>
                        <span>Qty</span>
                        <span>Weight</span>
                        <span>Volume</span>
                      </div>
                      {formData.packages.map((pkg, idx) => (
                        <div key={idx} className="grid grid-cols-4 gap-2 text-sm mt-2">
                          <span>{pkg.packageType}</span>
                          <span>{pkg.quantity}</span>
                          <span>{formatWeight(pkg.weight)}</span>
                          <span>{formatVolume(pkg.volume)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {formData.transport.carrierName && (
                      <div>
                        <p className="text-xs text-gray-500">Carrier</p>
                        <p className="text-sm">{formData.transport.carrierName}</p>
                      </div>
                    )}
                    {formData.transport.estimatedDeparture && (
                      <div>
                        <p className="text-xs text-gray-500">Est. Departure</p>
                        <p className="text-sm">{new Date(formData.transport.estimatedDeparture).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>

                  {formData.insurance.required && (
                    <div>
                      <p className="text-xs text-gray-500">Insurance Coverage</p>
                      <p className="text-sm">
                        {formatCurrency(formData.insurance.coverageAmount, formData.insurance.currency)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-yellow-800 font-medium">Please confirm</p>
                    <p className="text-sm text-yellow-600 mt-1">
                      By creating this shipment, you confirm that all information provided is accurate.
                      The shipment will be created from the confirmed booking #{selectedBooking?.bookingNumber}.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handleBack}
              disabled={activeStep === 0}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </button>
            <div className="flex space-x-3">
              {activeStep < steps.length - 1 && (
                <button
                  onClick={handleNext}
                  disabled={!selectedBooking && activeStep === 0}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showBookingSearch && <BookingSearchModal />}
      {showPreview && <PreviewModal />}
      {showSuccess && <SuccessModal />}

      {/* Error Snackbar */}
      {errors.submit && (
        <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 max-w-sm shadow-lg z-50">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800">Error</p>
              <p className="text-sm text-red-600 mt-1">{errors.submit}</p>
            </div>
            <button 
              onClick={() => setErrors(prev => ({ ...prev, submit: null }))}
              className="ml-4 text-red-600 hover:text-red-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateShipment;