// app/warehouse/receive/[shipmentId]/page.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { receiveShipment, getShipmentById } from '@/Api/warehouse';
import {  getShipmentById } from '@/Api/shipping';
import { Loader2, Package, ArrowLeft, Save, MapPin, User, Calendar, Phone, Mail } from 'lucide-react';

export default function ReceiveShipmentPage() {
  const router = useRouter();
  const params = useParams();
  const shipmentId = params.shipmentId;
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [shipment, setShipment] = useState(null);
  
  // Form states
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [condition, setCondition] = useState('Good');

  // Load shipment data
  useEffect(() => {
    const fetchShipment = async () => {
      setLoading(true);
      const result = await getShipmentById(shipmentId);
      if (result.success) {
        setShipment(result.data);
      } else {
        toast.error('Failed to load shipment');
      }
      setLoading(false);
    };
    
    if (shipmentId) {
      fetchShipment();
    }
  }, [shipmentId]);

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!location.trim()) {
      toast.error('Please enter storage location');
      return;
    }
    
    setSubmitting(true);
    
    // Prepare data for API - আপনার backend যেভাবে expects করে
    const receiveData = {
      location: location,
      notes: `Condition: ${condition}. ${notes}`
    };
    
    console.log('Sending to API:', receiveData);
    
    const result = await receiveShipment(shipmentId, receiveData);
    
    if (result.success) {
      toast.success('Shipment received successfully!');
      // Redirect back to expected list after 2 seconds
      setTimeout(() => {
        router.push('/warehouse/expected');
      }, 2000);
    } else {
      toast.error(result.message || 'Failed to receive shipment');
    }
    
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#E67E22]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </button>
          
          <h1 className="text-2xl font-bold text-gray-900">Receive Shipment</h1>
          <p className="text-sm text-gray-500">Complete the receipt process</p>
        </div>

        {/* Shipment Info Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipment Details</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Tracking Number</p>
              <p className="text-sm font-medium">{shipment?.trackingNumber || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Shipment Number</p>
              <p className="text-sm font-medium">{shipment?.shipmentNumber || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Customer</p>
              <p className="text-sm font-medium">
                {shipment?.customerId?.firstName} {shipment?.customerId?.lastName}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Packages</p>
              <p className="text-sm font-medium">{shipment?.packages?.length || 0}</p>
            </div>
          </div>
        </div>

        {/* Receive Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Receiving Information</h2>
          
          <div className="space-y-4">
            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Storage Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., A-1-2-3 (Zone-Aisle-Rack-Bin)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E67E22] focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Format: Zone-Aisle-Rack-Bin (e.g., A-1-2-3)</p>
            </div>

            {/* Condition */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Condition
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E67E22] focus:border-transparent"
              >
                <option value="Good">Good</option>
                <option value="Damaged">Damaged</option>
                <option value="Partial">Partially Damaged</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Any special notes about this receipt..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E67E22] focus:border-transparent"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full px-4 py-3 bg-[#E67E22] text-white rounded-lg hover:bg-[#d35400] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Receive Shipment
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}