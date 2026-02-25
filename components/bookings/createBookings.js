// app/create-booking/page.js
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { createBooking } from '@/Api/booking';

// Icons
import {
  Package, MapPin, Calendar, Weight, Box, FileText, ArrowLeft,
  Plus, Trash2, Send, AlertCircle, CheckCircle, ChevronRight,
  ChevronLeft, Truck, Ship, Plane, Phone, Mail, 
  DollarSign, Edit3, Building, Home, Clock,
  Globe, Hash, Tag, Briefcase, Loader2, X, 
  User, Save,
  Info
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
}) => {
  const baseClasses = 'rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 inline-flex items-center justify-center';
  
  const variants = {
    primary: 'bg-[#2563eb] text-white hover:bg-[#1d4ed8] focus:ring-[#2563eb] shadow-sm',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-400 border border-gray-300',
    outline: 'border border-[#2563eb] text-[#2563eb] hover:bg-blue-50 focus:ring-[#2563eb]',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
    success: 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-500'
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
          <span>Please wait...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};

// Compact Input Component
const Input = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  required = false,
  disabled = false,
  icon: Icon,
  className = '',
  ...props
}) => {
  return (
    <div className="mb-3">
      {label && (
        <label htmlFor={name} className="block text-xs font-medium text-gray-600 mb-1">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
            <Icon className="h-3.5 w-3.5 text-gray-400" />
          </div>
        )}
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-3 py-2 text-sm border rounded-md shadow-sm
            focus:outline-none focus:ring-1 focus:ring-[#2563eb] focus:border-[#2563eb]
            ${error ? 'border-red-300 bg-red-50' : 'border-gray-300'}
            ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}
            ${Icon ? 'pl-8' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

// Compact Select Component
const Select = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  options,
  error,
  required = false,
  icon: Icon,
  placeholder = 'Select...'
}) => {
  return (
    <div className="mb-3">
      {label && (
        <label htmlFor={name} className="block text-xs font-medium text-gray-600 mb-1">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
            <Icon className="h-3.5 w-3.5 text-gray-400" />
          </div>
        )}
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className={`
            w-full px-3 py-2 text-sm border rounded-md shadow-sm appearance-none
            focus:outline-none focus:ring-1 focus:ring-[#2563eb] focus:border-[#2563eb]
            ${error ? 'border-red-300 bg-red-50' : 'border-gray-300'}
            ${Icon ? 'pl-8' : ''}
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
          <ChevronRight className="h-3.5 w-3.5 text-gray-400 transform rotate-90" />
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

// Step Indicator Component
const StepIndicator = ({ step, currentStep, title }) => {
  const isActive = step <= currentStep;
  const isCurrent = step === currentStep;
  
  return (
    <div className="flex items-center">
      <div className={`
        w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all
        ${isCurrent ? 'bg-[#2563eb] text-white ring-2 ring-blue-200' : 
          isActive ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}
      `}>
        {isActive && step < currentStep ? <CheckCircle className="h-3 w-3" /> : step}
      </div>
      <span className={`ml-1.5 text-xs ${isCurrent ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
        {title}
      </span>
    </div>
  );
};

// Main Component
export default function CreateBooking() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [serverErrors, setServerErrors] = useState([]);

  // Form Data State
  const [formData, setFormData] = useState({
    customer: '',
    customerReference: '',
    shipmentDetails: {
      shipmentType: '',
      origin: '',
      destination: '',
      shippingMode: 'DDU',
      pickupRequired: false,
      cargoDetails: [{
        description: '',
        cartons: 1,
        weight: 0,
        volume: 0,
        productCategory: '',
        hsCode: '',
        value: { amount: 0, currency: 'USD' }
      }],
      totalCartons: 0,
      totalWeight: 0,
      totalVolume: 0,
      specialInstructions: '',
      referenceNumber: '',
      incoterms: ''
    },
    pickupAddress: {
      companyName: '',
      contactPerson: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
      pickupDate: '',
      pickupTime: '',
      specialInstructions: ''
    },
    deliveryAddress: {
      consigneeName: '',
      companyName: '',
      phone: '',
      email: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
      isResidential: false
    },
    estimatedDepartureDate: '',
    estimatedArrivalDate: '',
    quotedAmount: 0,
    quotedCurrency: 'USD',
    tags: [],
    notes: []
  });

  // Errors State
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Options
  const shipmentTypes = [
    { value: 'air_freight', label: 'Air Freight', icon: Plane },
    { value: 'sea_freight', label: 'Sea Freight', icon: Ship },
    { value: 'express_courier', label: 'Express Courier', icon: Package }
  ];

  const origins = [
    { value: 'China Warehouse', label: 'China' },
    { value: 'Thailand Warehouse', label: 'Thailand' },
    { value: 'Vietnam Warehouse', label: 'Vietnam' }
  ];

  const destinations = [
    { value: 'USA', label: 'USA' },
    { value: 'UK', label: 'UK' },
    { value: 'Canada', label: 'Canada' },
    { value: 'Germany', label: 'Germany' }
  ];

  const shippingModes = [
    { value: 'DDP', label: 'DDP' },
    { value: 'DDU', label: 'DDU' },
    { value: 'FOB', label: 'FOB' },
    { value: 'CIF', label: 'CIF' }
  ];

  const productCategories = [
    'Electronics', 'Furniture', 'Clothing', 'Machinery', 
    'Automotive', 'Pharmaceuticals', 'Food', 'Others'
  ];

  const currencies = ['USD', 'GBP', 'EUR', 'CNY'];

  // Calculate totals
  useEffect(() => {
    if (formData.shipmentDetails.cargoDetails.length > 0) {
      const totals = formData.shipmentDetails.cargoDetails.reduce(
        (acc, item) => ({
          totalCartons: acc.totalCartons + (Number(item.cartons) || 0),
          totalWeight: acc.totalWeight + (Number(item.weight) || 0),
          totalVolume: acc.totalVolume + (Number(item.volume) || 0)
        }),
        { totalCartons: 0, totalWeight: 0, totalVolume: 0 }
      );

      setFormData(prev => ({
        ...prev,
        shipmentDetails: { ...prev.shipmentDetails, ...totals }
      }));
    }
  }, [formData.shipmentDetails.cargoDetails]);

  // Handle Input Change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => {
      const keys = name.split('.');
      let current = { ...prev };
      let temp = current;
      
      for (let i = 0; i < keys.length - 1; i++) {
        temp = temp[keys[i]];
      }
      
      temp[keys[keys.length - 1]] = type === 'checkbox' ? checked : value;
      return current;
    });

    // Clear error
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle Cargo Change
  const handleCargoChange = (index, field, value) => {
    setFormData(prev => {
      const newData = { ...prev };
      newData.shipmentDetails.cargoDetails[index][field] = value;
      return newData;
    });
  };

  // Add Cargo Item
  const addCargoItem = () => {
    setFormData(prev => ({
      ...prev,
      shipmentDetails: {
        ...prev.shipmentDetails,
        cargoDetails: [
          ...prev.shipmentDetails.cargoDetails,
          {
            description: '',
            cartons: 1,
            weight: 0,
            volume: 0,
            productCategory: '',
            hsCode: '',
            value: { amount: 0, currency: 'USD' }
          }
        ]
      }
    }));
  };

  // Remove Cargo Item
  const removeCargoItem = (index) => {
    if (formData.shipmentDetails.cargoDetails.length > 1) {
      setFormData(prev => ({
        ...prev,
        shipmentDetails: {
          ...prev.shipmentDetails,
          cargoDetails: prev.shipmentDetails.cargoDetails.filter((_, i) => i !== index)
        }
      }));
    }
  };

  // Validate Form
  const validateForm = () => {
    const newErrors = {};

    // Step 1 validation
    if (!formData.shipmentDetails.shipmentType) {
      newErrors['shipmentDetails.shipmentType'] = 'Required';
    }
    if (!formData.shipmentDetails.origin) {
      newErrors['shipmentDetails.origin'] = 'Required';
    }
    if (!formData.shipmentDetails.destination) {
      newErrors['shipmentDetails.destination'] = 'Required';
    }
    if (!formData.estimatedDepartureDate) {
      newErrors.estimatedDepartureDate = 'Required';
    }
    if (!formData.estimatedArrivalDate) {
      newErrors.estimatedArrivalDate = 'Required';
    }

    // Step 2 validation (cargo)
    formData.shipmentDetails.cargoDetails.forEach((item, index) => {
      if (!item.description) {
        newErrors[`cargo_desc_${index}`] = 'Required';
      }
      if (!item.cartons || item.cartons < 1) {
        newErrors[`cargo_cartons_${index}`] = 'Min 1';
      }
      if (!item.weight || item.weight <= 0) {
        newErrors[`cargo_weight_${index}`] = 'Required';
      }
      if (!item.volume || item.volume <= 0) {
        newErrors[`cargo_volume_${index}`] = 'Required';
      }
    });

    // Step 3 validation
    if (!formData.deliveryAddress.consigneeName) {
      newErrors['deliveryAddress.consigneeName'] = 'Required';
    }
    if (!formData.deliveryAddress.email) {
      newErrors['deliveryAddress.email'] = 'Required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.deliveryAddress.email)) {
      newErrors['deliveryAddress.email'] = 'Invalid email';
    }
    if (!formData.deliveryAddress.phone) {
      newErrors['deliveryAddress.phone'] = 'Required';
    }
    if (!formData.deliveryAddress.addressLine1) {
      newErrors['deliveryAddress.addressLine1'] = 'Required';
    }
    if (!formData.deliveryAddress.city) {
      newErrors['deliveryAddress.city'] = 'Required';
    }
    if (!formData.deliveryAddress.country) {
      newErrors['deliveryAddress.country'] = 'Required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsSubmitting(true);
    setServerErrors([]);

    try {
      const response = await createBooking(formData);
      
      if (response.success) {
        setShowSuccess(true);
        toast.success('Booking created successfully!');
        setTimeout(() => {
          router.push('/all_bookings');
        }, 2000);
      } else {
        setServerErrors([{ msg: response.message || 'Failed to create booking' }]);
        toast.error(response.message || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Error:', error);
      setServerErrors([{ msg: error.message || 'Network error' }]);
      toast.error(error.message || 'Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Next Step
  const nextStep = () => {
    let isValid = true;
    
    if (currentStep === 1) {
      if (!formData.shipmentDetails.shipmentType || 
          !formData.shipmentDetails.origin || 
          !formData.shipmentDetails.destination ||
          !formData.estimatedDepartureDate ||
          !formData.estimatedArrivalDate) {
        isValid = false;
        toast.error('Please complete step 1');
      }
    } else if (currentStep === 2) {
      const hasInvalidCargo = formData.shipmentDetails.cargoDetails.some(
        item => !item.description || !item.cartons || !item.weight || !item.volume
      );
      if (hasInvalidCargo) {
        isValid = false;
        toast.error('Please complete all cargo details');
      }
    }

    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Compact */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center space-x-4">
              <Link 
                href="/bookings"
                className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
              >
                <ArrowLeft className="h-4 w-4 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-base font-semibold text-gray-900 flex items-center">
                  <Package className="h-4 w-4 mr-1.5 text-[#2563eb]" />
                  Create New Booking
                </h1>
                <p className="text-xs text-gray-500">Fill in the shipment details</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="text-xs text-gray-500">
                Step {currentStep}/4
              </span>
              <div className="flex space-x-1">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`h-1 w-6 rounded-full transition-colors ${
                      step <= currentStep ? 'bg-[#2563eb]' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Messages */}
      {serverErrors.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-3">
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <div className="flex items-start">
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
              <div className="ml-2 flex-1">
                <p className="text-xs font-medium text-red-800">Error</p>
                {serverErrors.map((error, index) => (
                  <p key={index} className="text-xs text-red-600">{error.msg}</p>
                ))}
              </div>
              <button onClick={() => setServerErrors([])}>
                <X className="h-4 w-4 text-red-500" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">Success!</h3>
              <p className="text-sm text-gray-500 mb-4">Booking created successfully</p>
              <div className="text-xs text-gray-400">Redirecting to bookings...</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Form */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border shadow-sm">
          {/* Step Indicators */}
          <div className="border-b px-4 py-2 bg-gray-50">
            <div className="flex items-center justify-between">
              <StepIndicator step={1} currentStep={currentStep} title="Shipment" />
              <ChevronRight className="h-3 w-3 text-gray-400" />
              <StepIndicator step={2} currentStep={currentStep} title="Cargo" />
              <ChevronRight className="h-3 w-3 text-gray-400" />
              <StepIndicator step={3} currentStep={currentStep} title="Address" />
              <ChevronRight className="h-3 w-3 text-gray-400" />
              <StepIndicator step={4} currentStep={currentStep} title="Review" />
            </div>
          </div>

          {/* Form Content */}
          <div className="p-4">
            {/* Step 1: Shipment Info */}
            {currentStep === 1 && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Select
                    label="Shipment Type"
                    name="shipmentDetails.shipmentType"
                    value={formData.shipmentDetails.shipmentType}
                    onChange={handleInputChange}
                    options={shipmentTypes}
                    required
                    icon={Package}
                    error={errors['shipmentDetails.shipmentType']}
                  />
                  
                  <Select
                    label="Shipping Mode"
                    name="shipmentDetails.shippingMode"
                    value={formData.shipmentDetails.shippingMode}
                    onChange={handleInputChange}
                    options={shippingModes}
                    icon={Briefcase}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Select
                    label="Origin"
                    name="shipmentDetails.origin"
                    value={formData.shipmentDetails.origin}
                    onChange={handleInputChange}
                    options={origins}
                    required
                    icon={MapPin}
                    error={errors['shipmentDetails.origin']}
                  />
                  
                  <Select
                    label="Destination"
                    name="shipmentDetails.destination"
                    value={formData.shipmentDetails.destination}
                    onChange={handleInputChange}
                    options={destinations}
                    required
                    icon={Globe}
                    error={errors['shipmentDetails.destination']}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Departure Date"
                    type="date"
                    name="estimatedDepartureDate"
                    value={formData.estimatedDepartureDate}
                    onChange={handleInputChange}
                    required
                    icon={Calendar}
                    error={errors.estimatedDepartureDate}
                  />
                  
                  <Input
                    label="Arrival Date"
                    type="date"
                    name="estimatedArrivalDate"
                    value={formData.estimatedArrivalDate}
                    onChange={handleInputChange}
                    required
                    icon={Calendar}
                    error={errors.estimatedArrivalDate}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Reference No"
                    name="customerReference"
                    value={formData.customerReference}
                    onChange={handleInputChange}
                    placeholder="Optional"
                    icon={Hash}
                  />
                  
                  <Input
                    label="Incoterms"
                    name="shipmentDetails.incoterms"
                    value={formData.shipmentDetails.incoterms}
                    onChange={handleInputChange}
                    placeholder="e.g., EXW"
                    icon={Tag}
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="pickupRequired"
                    name="shipmentDetails.pickupRequired"
                    checked={formData.shipmentDetails.pickupRequired}
                    onChange={handleInputChange}
                    className="h-3.5 w-3.5 text-[#2563eb] focus:ring-[#2563eb] border-gray-300 rounded"
                  />
                  <label htmlFor="pickupRequired" className="ml-2 text-xs text-gray-600">
                    Pickup required from origin
                  </label>
                </div>
              </div>
            )}

            {/* Step 2: Cargo Details */}
            {currentStep === 2 && (
              <div className="space-y-3">
                {formData.shipmentDetails.cargoDetails.map((item, index) => (
                  <div key={index} className="border rounded-md p-3 bg-gray-50 relative">
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeCargoItem(index)}
                        className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-0.5 hover:bg-red-200"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="col-span-2">
                        <Input
                          label="Description"
                          value={item.description}
                          onChange={(e) => handleCargoChange(index, 'description', e.target.value)}
                          placeholder="Product description"
                          required
                          icon={Package}
                          error={errors[`cargo_desc_${index}`]}
                        />
                      </div>

                      <Select
                        label="Category"
                        value={item.productCategory}
                        onChange={(e) => handleCargoChange(index, 'productCategory', e.target.value)}
                        options={productCategories.map(cat => ({ value: cat, label: cat }))}
                        required
                        icon={Tag}
                      />

                      <Input
                        label="HS Code"
                        value={item.hsCode}
                        onChange={(e) => handleCargoChange(index, 'hsCode', e.target.value)}
                        placeholder="Optional"
                        icon={Hash}
                      />

                      <Input
                        label="Cartons"
                        type="number"
                        value={item.cartons}
                        onChange={(e) => handleCargoChange(index, 'cartons', parseInt(e.target.value) || 0)}
                        min="1"
                        required
                        icon={Box}
                        error={errors[`cargo_cartons_${index}`]}
                      />

                      <Input
                        label="Weight (kg)"
                        type="number"
                        value={item.weight}
                        onChange={(e) => handleCargoChange(index, 'weight', parseFloat(e.target.value) || 0)}
                        min="0.1"
                        step="0.1"
                        required
                        icon={Weight}
                        error={errors[`cargo_weight_${index}`]}
                      />

                      <Input
                        label="Volume (CBM)"
                        type="number"
                        value={item.volume}
                        onChange={(e) => handleCargoChange(index, 'volume', parseFloat(e.target.value) || 0)}
                        min="0.001"
                        step="0.001"
                        required
                        icon={Box}
                        error={errors[`cargo_volume_${index}`]}
                      />

                      <Input
                        label="Value"
                        type="number"
                        value={item.value.amount}
                        onChange={(e) => handleCargoChange(index, 'value', { 
                          ...item.value, 
                          amount: parseFloat(e.target.value) || 0 
                        })}
                        icon={DollarSign}
                      />

                      <Select
                        label="Currency"
                        value={item.value.currency}
                        onChange={(e) => handleCargoChange(index, 'value', { 
                          ...item.value, 
                          currency: e.target.value 
                        })}
                        options={currencies.map(curr => ({ value: curr, label: curr }))}
                      />
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCargoItem}
                  icon={<Plus className="h-3.5 w-3.5" />}
                  className="w-full"
                >
                  Add Item
                </Button>

                {formData.shipmentDetails.cargoDetails.length > 0 && (
                  <div className="bg-blue-50 rounded-md p-2 mt-2">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-xs text-gray-500">Total Cartons</div>
                        <div className="text-sm font-semibold text-[#2563eb]">
                          {formData.shipmentDetails.totalCartons}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Total Weight</div>
                        <div className="text-sm font-semibold text-[#2563eb]">
                          {formData.shipmentDetails.totalWeight.toFixed(1)} kg
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Total Volume</div>
                        <div className="text-sm font-semibold text-[#2563eb]">
                          {formData.shipmentDetails.totalVolume.toFixed(3)} CBM
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Addresses */}
            {currentStep === 3 && (
              <div className="space-y-3">
                {/* Delivery Address */}
                <div className="border rounded-md p-3">
                  <h3 className="text-xs font-medium text-gray-700 mb-2 flex items-center">
                    <Home className="h-3.5 w-3.5 mr-1 text-[#2563eb]" />
                    Delivery Address
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      label="Consignee Name"
                      name="deliveryAddress.consigneeName"
                      value={formData.deliveryAddress.consigneeName}
                      onChange={handleInputChange}
                      required
                      icon={User}
                      error={errors['deliveryAddress.consigneeName']}
                    />

                    <Input
                      label="Company Name"
                      name="deliveryAddress.companyName"
                      value={formData.deliveryAddress.companyName}
                      onChange={handleInputChange}
                      icon={Building}
                    />

                    <Input
                      label="Phone"
                      name="deliveryAddress.phone"
                      value={formData.deliveryAddress.phone}
                      onChange={handleInputChange}
                      required
                      icon={Phone}
                      error={errors['deliveryAddress.phone']}
                    />

                    <Input
                      label="Email"
                      type="email"
                      name="deliveryAddress.email"
                      value={formData.deliveryAddress.email}
                      onChange={handleInputChange}
                      required
                      icon={Mail}
                      error={errors['deliveryAddress.email']}
                    />

                    <div className="col-span-2">
                      <Input
                        label="Address Line 1"
                        name="deliveryAddress.addressLine1"
                        value={formData.deliveryAddress.addressLine1}
                        onChange={handleInputChange}
                        required
                        icon={MapPin}
                        error={errors['deliveryAddress.addressLine1']}
                      />
                    </div>

                    <div className="col-span-2">
                      <Input
                        label="Address Line 2"
                        name="deliveryAddress.addressLine2"
                        value={formData.deliveryAddress.addressLine2}
                        onChange={handleInputChange}
                        icon={MapPin}
                      />
                    </div>

                    <Input
                      label="City"
                      name="deliveryAddress.city"
                      value={formData.deliveryAddress.city}
                      onChange={handleInputChange}
                      required
                      error={errors['deliveryAddress.city']}
                    />

                    <Input
                      label="State"
                      name="deliveryAddress.state"
                      value={formData.deliveryAddress.state}
                      onChange={handleInputChange}
                    />

                    <Input
                      label="Country"
                      name="deliveryAddress.country"
                      value={formData.deliveryAddress.country}
                      onChange={handleInputChange}
                      required
                      error={errors['deliveryAddress.country']}
                    />

                    <Input
                      label="Postal Code"
                      name="deliveryAddress.postalCode"
                      value={formData.deliveryAddress.postalCode}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="mt-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="deliveryAddress.isResidential"
                        checked={formData.deliveryAddress.isResidential}
                        onChange={handleInputChange}
                        className="h-3.5 w-3.5 text-[#2563eb] focus:ring-[#2563eb] border-gray-300 rounded"
                      />
                      <span className="ml-2 text-xs text-gray-600">Residential address</span>
                    </label>
                  </div>
                </div>

                {/* Pickup Address (if required) */}
                {formData.shipmentDetails.pickupRequired && (
                  <div className="border rounded-md p-3">
                    <h3 className="text-xs font-medium text-gray-700 mb-2 flex items-center">
                      <Building className="h-3.5 w-3.5 mr-1 text-[#2563eb]" />
                      Pickup Address
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        label="Company Name"
                        name="pickupAddress.companyName"
                        value={formData.pickupAddress.companyName}
                        onChange={handleInputChange}
                        icon={Building}
                      />

                      <Input
                        label="Contact Person"
                        name="pickupAddress.contactPerson"
                        value={formData.pickupAddress.contactPerson}
                        onChange={handleInputChange}
                        icon={User}
                      />

                      <Input
                        label="Phone"
                        name="pickupAddress.phone"
                        value={formData.pickupAddress.phone}
                        onChange={handleInputChange}
                        icon={Phone}
                      />

                      <div className="col-span-2">
                        <Input
                          label="Address"
                          name="pickupAddress.addressLine1"
                          value={formData.pickupAddress.addressLine1}
                          onChange={handleInputChange}
                          icon={MapPin}
                        />
                      </div>

                      <Input
                        label="City"
                        name="pickupAddress.city"
                        value={formData.pickupAddress.city}
                        onChange={handleInputChange}
                      />

                      <Input
                        label="Country"
                        name="pickupAddress.country"
                        value={formData.pickupAddress.country}
                        onChange={handleInputChange}
                      />

                      <Input
                        label="Pickup Date"
                        type="date"
                        name="pickupAddress.pickupDate"
                        value={formData.pickupAddress.pickupDate}
                        onChange={handleInputChange}
                        icon={Calendar}
                      />

                      <Input
                        label="Pickup Time"
                        type="time"
                        name="pickupAddress.pickupTime"
                        value={formData.pickupAddress.pickupTime}
                        onChange={handleInputChange}
                        icon={Clock}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-md p-3">
                  <h3 className="text-xs font-medium text-gray-700 mb-2">Shipment Overview</h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">Type:</span>{' '}
                      <span className="font-medium">
                        {shipmentTypes.find(t => t.value === formData.shipmentDetails.shipmentType)?.label || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Mode:</span>{' '}
                      <span className="font-medium">{formData.shipmentDetails.shippingMode}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Origin:</span>{' '}
                      <span className="font-medium">{formData.shipmentDetails.origin}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Destination:</span>{' '}
                      <span className="font-medium">{formData.shipmentDetails.destination}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Departure:</span>{' '}
                      <span className="font-medium">{formData.estimatedDepartureDate}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Arrival:</span>{' '}
                      <span className="font-medium">{formData.estimatedArrivalDate}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-md p-3">
                  <h3 className="text-xs font-medium text-gray-700 mb-2">Cargo Summary</h3>
                  <div className="space-y-2">
                    {formData.shipmentDetails.cargoDetails.map((item, index) => (
                      <div key={index} className="text-xs border-b last:border-0 pb-1 last:pb-0">
                        <div className="font-medium">{item.description}</div>
                        <div className="text-gray-500">
                          {item.cartons} ctns | {item.weight} kg | {item.volume} CBM
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 pt-2 border-t grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">Total Cartons:</span>{' '}
                      <span className="font-medium">{formData.shipmentDetails.totalCartons}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Total Weight:</span>{' '}
                      <span className="font-medium">{formData.shipmentDetails.totalWeight} kg</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Total Volume:</span>{' '}
                      <span className="font-medium">{formData.shipmentDetails.totalVolume} CBM</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-md p-3">
                  <h3 className="text-xs font-medium text-gray-700 mb-2">Delivery Address</h3>
                  <div className="text-xs">
                    <p className="font-medium">{formData.deliveryAddress.consigneeName}</p>
                    {formData.deliveryAddress.companyName && (
                      <p className="text-gray-600">{formData.deliveryAddress.companyName}</p>
                    )}
                    <p className="text-gray-600">{formData.deliveryAddress.addressLine1}</p>
                    {formData.deliveryAddress.addressLine2 && (
                      <p className="text-gray-600">{formData.deliveryAddress.addressLine2}</p>
                    )}
                    <p className="text-gray-600">
                      {formData.deliveryAddress.city}
                      {formData.deliveryAddress.state && `, ${formData.deliveryAddress.state}`}
                    </p>
                    <p className="text-gray-600">
                      {formData.deliveryAddress.country}
                      {formData.deliveryAddress.postalCode && ` - ${formData.deliveryAddress.postalCode}`}
                    </p>
                    <p className="text-gray-600 mt-1">
                      <span className="text-gray-500">Phone:</span> {formData.deliveryAddress.phone}<br />
                      <span className="text-gray-500">Email:</span> {formData.deliveryAddress.email}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-4 pt-3 border-t">
              {currentStep > 1 ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={prevStep}
                  icon={<ChevronLeft className="h-3.5 w-3.5" />}
                >
                  Back
                </Button>
              ) : (
                <div></div>
              )}

              {currentStep < 4 ? (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={nextStep}
                  icon={<ChevronRight className="h-3.5 w-3.5" />}
                  iconPosition="right"
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="success"
                  size="sm"
                  isLoading={isSubmitting}
                  icon={<Save className="h-3.5 w-3.5" />}
                >
                  Create Booking
                </Button>
              )}
            </div>
          </div>
        </form>

        {/* Quick Tips */}
        <div className="mt-3 bg-blue-50 rounded-md p-2 border border-blue-100">
          <div className="flex items-start">
            <Info className="h-3.5 w-3.5 text-blue-500 mt-0.5" />
            <div className="ml-1.5">
              <p className="text-xs font-medium text-blue-700">Quick Tips</p>
              <ul className="text-xs text-blue-600 mt-0.5 space-y-0.5">
                <li>• Fields marked with * are required</li>
                <li>• Destination must be different from origin</li>
                <li>• Double-check contact details for delivery</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}