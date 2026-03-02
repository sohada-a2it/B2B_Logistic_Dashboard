// app/warehouse/expected/page.jsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getExpectedShipments, receiveShipment } from '@/Api/warehouse';
import { formatDate } from '@/Api/booking';
import { 
  Loader2, Package, Search, Calendar, MapPin, User, 
  X, CheckCircle, Map, AlertTriangle, Save 
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function ExpectedShipmentsPage() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Receive modal state
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Form states
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [condition, setCondition] = useState('Good');

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    setLoading(true);
    const result = await getExpectedShipments();
    if (result.success) {
      setShipments(result.data);
    }
    setLoading(false);
  };

  const handleReceiveClick = (shipment) => {
    setSelectedShipment(shipment);
    setLocation(''); // Reset form
    setNotes('');
    setCondition('Good');
    setShowReceiveModal(true);
  };

  const handleReceiveSubmit = async (e) => {
    e.preventDefault();
    
    if (!location.trim()) {
      toast.error('Please enter storage location');
      return;
    }
    
    setSubmitting(true);
    
    const receiveData = {
      location: location,
      notes: `Condition: ${condition}. ${notes}`
    };
    
    const result = await receiveShipment(selectedShipment._id, receiveData);
    
    if (result.success) {
      toast.success('Shipment received successfully!');
      setShowReceiveModal(false);
      fetchShipments(); // Refresh the list
    } else {
      toast.error(result.message || 'Failed to receive shipment');
    }
    
    setSubmitting(false);
  };

  const filteredShipments = shipments.filter(s => 
    s.trackingNumber?.toLowerCase().includes(search.toLowerCase()) ||
    s.customerId?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
    s.customerId?.lastName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Expected Shipments</h1>
          <p className="text-sm text-gray-500">Shipments waiting to be received at warehouse</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by tracking number or customer name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E67E22] focus:border-transparent"
            />
          </div>
        </div>

        {/* Shipments List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#E67E22]" />
          </div>
        ) : filteredShipments.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Package className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <h3 className="text-sm font-medium text-gray-900">No expected shipments</h3>
            <p className="text-xs text-gray-500 mt-1">All clear! No shipments waiting to be received.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredShipments.map((shipment) => (
              <div
                key={shipment._id}
                className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Package className="h-5 w-5 text-[#E67E22]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {shipment.trackingNumber}
                      </p>
                      <p className="text-xs text-gray-500">
                        {shipment.shipmentNumber}
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                    Pending
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div className="flex items-center text-xs text-gray-500">
                    <User className="h-3.5 w-3.5 mr-1" />
                    {shipment.customerId?.firstName} {shipment.customerId?.lastName}
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    {formatDate(shipment.createdAt)}
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <MapPin className="h-3.5 w-3.5 mr-1" />
                    {shipment.shipmentDetails?.origin} → {shipment.shipmentDetails?.destination}
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <Package className="h-3.5 w-3.5 mr-1" />
                    {shipment.packages?.length || 0} packages
                  </div>
                </div>

                <div className="mt-3 text-right">
                  <button
                    onClick={() => handleReceiveClick(shipment)}
                    className="text-xs bg-[#E67E22] text-white px-4 py-2 rounded-lg hover:bg-[#d35400] transition-colors"
                  >
                    Click to receive →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Receive Modal */}
      {showReceiveModal && selectedShipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Receive Shipment</h2>
                <button
                  onClick={() => setShowReceiveModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Shipment Info */}
              <div className="bg-orange-50 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-gray-900 mb-2">Shipment Details</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Tracking:</span>
                    <span className="ml-2 font-medium">{selectedShipment.trackingNumber}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Customer:</span>
                    <span className="ml-2 font-medium">
                      {selectedShipment.customerId?.firstName} {selectedShipment.customerId?.lastName}
                    </span>
                  </div>
                </div>
              </div>

              {/* Receive Form */}
              <form onSubmit={handleReceiveSubmit} className="space-y-4">
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
                  <p className="text-xs text-gray-500 mt-1">Format: Zone-Aisle-Rack-Bin</p>
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

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowReceiveModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-[#E67E22] text-white rounded-lg hover:bg-[#d35400] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Receive Shipment
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}