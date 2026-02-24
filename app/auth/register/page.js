'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { registerCustomer } from '@/Api/Authentication';

const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  const handleRegister = async (userData) => {
    setLoading(true);
    try {
      const response = await registerCustomer(userData);
      
      toast.success('OTP sent to your email! Please check your inbox.', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
 
      setTimeout(() => {
        window.location.href = '/auth/verify-otp?email=' + encodeURIComponent(userData.email);
      }, 2000);

      return response;
    } catch (error) { 
      toast.error(error.message || 'Registration failed. Please try again.', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    user,
    register: handleRegister
  };
};
 
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
  icon,
  className = '',
  ...props
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
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
          className={
            'w-full px-3 py-2 border rounded-lg shadow-sm ' +
            'focus:outline-none focus:ring-2 focus:ring-[#E67E22] focus:border-[#E67E22] ' +
            (error ? 'border-red-500 ' : 'border-gray-300 ') +
            (disabled ? 'bg-gray-100 cursor-not-allowed ' : '') +
            (icon ? 'pl-10 ' : '') +
            className
          }
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};
 
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
  const baseClasses = 'rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-[#E67E22] text-white hover:bg-[#d35400] focus:ring-[#E67E22]',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    outline: 'border-2 border-[#E67E22] text-[#E67E22] hover:bg-[#fffaf6] focus:ring-[#E67E22]'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const variantClass = variants[variant] || variants.primary;
  const sizeClass = sizes[size] || sizes.md;

  return (
    <button
      type={type}
      className={baseClasses + ' ' + variantClass + ' ' + sizeClass + ' ' + className + ' ' + (disabled || isLoading ? 'opacity-50 cursor-not-allowed' : '')}
      disabled={disabled || isLoading}
      onClick={onClick}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Processing...
        </div>
      ) : (
        children
      )}
    </button>
  );
};
 
export default function Page() {
  const router = useRouter();
  const { register, loading } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    companyName: '',
    companyAddress: '',
    companyVAT: '',
    businessType: 'Trader',
    industry: '',
    acceptTerms: false
  });

  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});

  const businessTypes = ['Trader', 'Manufacturer', 'Distributor', 'Retailer', 'E-commerce', 'Other'];
  const industries = [
    'Textile and Apparel', 
    'Electronics', 
    'Automotive', 
    'Pharmaceuticals',
    'Food and Beverage', 
    'Furniture', 
    'Machinery', 
    'Chemicals', 
    'Other'
  ];

  useEffect(() => {
    validateForm();
  }, [formData]);

  useEffect(() => {
    calculatePasswordStrength(formData.password);
  }, [formData.password]);

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.match(/[a-z]+/)) strength += 25;
    if (password.match(/[A-Z]+/)) strength += 25;
    if (password.match(/[0-9]+/) || password.match(/[$@#&!]+/)) strength += 25;
    setPasswordStrength(strength);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 25) return 'bg-red-500';
    if (passwordStrength <= 50) return 'bg-orange-500';
    if (passwordStrength <= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 25) return 'Weak';
    if (passwordStrength <= 50) return 'Fair';
    if (passwordStrength <= 75) return 'Good';
    return 'Strong';
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (currentStep === 3) {
      if (!formData.companyName.trim()) {
        newErrors.companyName = 'Company name is required';
      }
      if (!formData.companyAddress.trim()) {
        newErrors.companyAddress = 'Company address is required';
      }
      if (!formData.companyVAT.trim()) {
        newErrors.companyVAT = 'VAT number is required';
      }
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const allFields = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allFields);

    if (Object.keys(errors).length === 0) {
      try {
        const { confirmPassword, acceptTerms, ...submitData } = formData;
        await register(submitData);
      } catch (error) {
        // Error is handled in the hook with toast
      }
    } else {
      toast.warning('Please fix the errors before submitting', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  const nextStep = () => {
    const stepFields = {
      1: ['firstName', 'lastName', 'email', 'phone'],
      2: ['password', 'confirmPassword']
    };

    const stepErrors = {};
    stepFields[currentStep].forEach(field => {
      if (errors[field]) {
        stepErrors[field] = errors[field];
      }
    });

    if (Object.keys(stepErrors).length === 0) {
      setCurrentStep(prev => prev + 1);
    } else {
      stepFields[currentStep].forEach(field => {
        setTouched(prev => ({ ...prev, [field]: true }));
      });
      
      toast.warning('Please fill all required fields correctly', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const renderIcon = (type) => {
    switch(type) {
      case 'user':
        return (
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'email':
        return (
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case 'phone':
        return (
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        );
      case 'password':
        return (
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        );
      case 'company':
        return (
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      
      <div className="min-h-screen bg-[#fffaf6] flex flex-col lg:flex-row">
        {/* Left Side - Branding/Info */}
        <div className="lg:w-1/2 bg-[#122652] p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 -left-4 w-72 h-72 bg-[#E67E22] rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-[#3C719D] rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-[#E67E22] rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
          </div>

          {/* Content */}
          <div className="relative z-10">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-[#E67E22] rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-white">Logi<span className="text-[#E67E22]">Swift</span></span>
            </div>

            <div className="mt-16 lg:mt-24">
              <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                Your Global
                <span className="text-[#E67E22] block">Logistics Partner</span>
              </h1>
              <p className="mt-6 text-gray-300 text-lg max-w-md">
                Join thousands of businesses who trust us with their supply chain. 
                Experience seamless shipping worldwide.
              </p>
            </div>

            {/* Features */}
            <div className="mt-12 space-y-4">
              {[
                'Real-time shipment tracking',
                'Global network coverage',
                '24/7 customer support',
                'Competitive shipping rates'
              ].map(function(feature, index) {
                return (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-[#E67E22] rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-200">{feature}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Testimonial */}
          <div className="relative z-10 mt-12 lg:mt-0">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <p className="text-white italic">
                "LogiSwift transformed our supply chain. Their platform is intuitive and their support team is exceptional."
              </p>
              <div className="mt-4 flex items-center">
                <div className="w-10 h-10 bg-[#E67E22] rounded-full flex items-center justify-center text-white font-bold">
                  SJ
                </div>
                <div className="ml-3">
                  <p className="text-white font-semibold">Sarah Johnson</p>
                  <p className="text-gray-300 text-sm">CEO, Global Traders</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#122652]">Create Account</h2>
              <p className="text-gray-600 mt-2">
                Already have an account?{' '}
                <Link href="/" className="text-[#E67E22] font-semibold hover:underline">
                  Sign in
                </Link>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  {[1, 2, 3].map(function(step) {
                    return (
                      <div key={step} className={'flex items-center ' + (step < 3 ? 'flex-1' : '')}>
                        <div className={
                          'w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ' +
                          (currentStep >= step ? 'bg-[#E67E22] text-white' : 'bg-gray-200 text-gray-600')
                        }>
                          {step}
                        </div>
                        {step < 3 && (
                          <div className={
                            'flex-1 h-1 mx-2 rounded ' + 
                            (currentStep > step ? 'bg-[#E67E22]' : 'bg-gray-200')
                          } />
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-xs text-gray-600 px-1">
                  <span>Personal</span>
                  <span>Security</span>
                  <span>Business</span>
                </div>
              </div>

              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="First Name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      onBlur={function() { handleBlur('firstName'); }}
                      placeholder="John"
                      error={touched.firstName && errors.firstName}
                      required
                      icon={renderIcon('user')}
                    />
                    <Input
                      label="Last Name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      onBlur={function() { handleBlur('lastName'); }}
                      placeholder="Doe"
                      error={touched.lastName && errors.lastName}
                      required
                    />
                  </div>

                  <Input
                    label="Email Address"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={function() { handleBlur('email'); }}
                    placeholder="john.doe@company.com"
                    error={touched.email && errors.email}
                    required
                    icon={renderIcon('email')}
                  />

                  <Input
                    label="Phone Number"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={function() { handleBlur('phone'); }}
                    placeholder="+880 1712 345678"
                    error={touched.phone && errors.phone}
                    required
                    icon={renderIcon('phone')}
                  />

                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    onClick={nextStep}
                    className="w-full mt-6"
                  >
                    Continue to Security
                    <svg className="w-5 h-5 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                  <Button
                type="button"
                variant="primary"
                size="lg"
                onClick={() => window.location.href = '/auth/forgot-password'}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                Forgot Your Password
                <svg className="w-5 h-5 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
                </Button>
                </div>
              )}

              {/* Step 2: Password Setup */}
              {currentStep === 2 && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="relative">
                    <Input
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      onBlur={function() { handleBlur('password'); }}
                      placeholder="********"
                      error={touched.password && errors.password}
                      required
                      icon={renderIcon('password')}
                    />
                    <button
                      type="button"
                      onClick={function() { setShowPassword(!showPassword); }}
                      className="absolute right-3 top-9 text-gray-500 hover:text-[#E67E22]"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Password Strength Meter */}
                  {formData.password && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={'h-full ' + getPasswordStrengthColor() + ' transition-all duration-300'}
                            style={{ width: passwordStrength + '%' }}
                          />
                        </div>
                        <span className="ml-3 text-sm font-medium text-gray-600">
                          {getPasswordStrengthText()}
                        </span>
                      </div>
                      <ul className="text-xs text-gray-500 space-y-1">
                        <li className="flex items-center">
                          <span className={'mr-2 ' + (formData.password.length >= 8 ? 'text-green-500' : 'text-gray-400')}>
                            {formData.password.length >= 8 ? '✓' : '○'}
                          </span>
                          At least 8 characters
                        </li>
                        <li className="flex items-center">
                          <span className={'mr-2 ' + (/([a-z])/.test(formData.password) ? 'text-green-500' : 'text-gray-400')}>
                            {/([a-z])/.test(formData.password) ? '✓' : '○'}
                          </span>
                          Contains lowercase letter
                        </li>
                        <li className="flex items-center">
                          <span className={'mr-2 ' + (/([A-Z])/.test(formData.password) ? 'text-green-500' : 'text-gray-400')}>
                            {/([A-Z])/.test(formData.password) ? '✓' : '○'}
                          </span>
                          Contains uppercase letter
                        </li>
                        <li className="flex items-center">
                          <span className={'mr-2 ' + (/([0-9!@#$%^&*])/.test(formData.password) ? 'text-green-500' : 'text-gray-400')}>
                            {/([0-9!@#$%^&*])/.test(formData.password) ? '✓' : '○'}
                          </span>
                          Contains number or special character
                        </li>
                      </ul>
                    </div>
                  )}

                  <Input
                    label="Confirm Password"
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={function() { handleBlur('confirmPassword'); }}
                    placeholder="********"
                    error={touched.confirmPassword && errors.confirmPassword}
                    required
                  />

                  <div className="flex space-x-4 mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={prevStep}
                      className="flex-1"
                    >
                      <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                      </svg>
                      Back
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      size="lg"
                      onClick={nextStep}
                      className="flex-1"
                    >
                      Continue
                      <svg className="w-5 h-5 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Business Information */}
              {currentStep === 3 && (
                <div className="space-y-4 animate-fadeIn">
                  <Input
                    label="Company Name"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    onBlur={function() { handleBlur('companyName'); }}
                    placeholder="Your Company Ltd."
                    error={touched.companyName && errors.companyName}
                    required
                    icon={renderIcon('company')}
                  />

                  <Input
                    label="Company Address"
                    name="companyAddress"
                    value={formData.companyAddress}
                    onChange={handleChange}
                    onBlur={function() { handleBlur('companyAddress'); }}
                    placeholder="123 Business Ave, City, Country"
                    error={touched.companyAddress && errors.companyAddress}
                    required
                  />

                  <Input
                    label="VAT Number"
                    name="companyVAT"
                    value={formData.companyVAT}
                    onChange={handleChange}
                    onBlur={function() { handleBlur('companyVAT'); }}
                    placeholder="VAT-123456789"
                    error={touched.companyVAT && errors.companyVAT}
                    required
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Business Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="businessType"
                        value={formData.businessType}
                        onChange={handleChange}
                        onBlur={function() { handleBlur('businessType'); }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E67E22] focus:border-[#E67E22]"
                      >
                        {businessTypes.map(function(type) {
                          return (
                            <option key={type} value={type}>{type}</option>
                          );
                        })}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Industry <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="industry"
                        value={formData.industry}
                        onChange={handleChange}
                        onBlur={function() { handleBlur('industry'); }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E67E22] focus:border-[#E67E22]"
                      >
                        <option value="">Select Industry</option>
                        {industries.map(function(industry) {
                          return (
                            <option key={industry} value={industry}>{industry}</option>
                          );
                        })}
                      </select>
                      {touched.industry && errors.industry && (
                        <p className="text-sm text-red-600">{errors.industry}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    {/* Terms and Conditions */}
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          type="checkbox"
                          name="acceptTerms"
                          checked={formData.acceptTerms}
                          onChange={handleChange}
                          onBlur={function() { handleBlur('acceptTerms'); }}
                          className="w-4 h-4 text-[#E67E22] border-gray-300 rounded focus:ring-[#E67E22]"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label className="font-medium text-gray-700">
                          I agree to the{' '}
                          <a href="#" className="text-[#E67E22] hover:underline">Terms of Service</a>
                          {' '}and{' '}
                          <a href="#" className="text-[#E67E22] hover:underline">Privacy Policy</a>
                        </label>
                        {touched.acceptTerms && errors.acceptTerms && (
                          <p className="text-red-600 text-xs mt-1">{errors.acceptTerms}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-4 mt-8">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={prevStep}
                      className="flex-1"
                    >
                      <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                      </svg>
                      Back
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      isLoading={loading}
                      className="flex-1"
                    >
                      Create Account
                      <svg className="w-5 h-5 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in-out;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </>
  );
}