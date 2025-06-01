import React, { useEffect, useState } from 'react';
import { useOrder } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import orderService from '../services/orderService';
import toast from 'react-hot-toast';

// Mock Delivery Partners data
const mockDeliveryPartners = [
  { id: 'DP001', name: 'Amit Sharma', region: 'North India', status: 'Available', rating: 4.8, totalDeliveries: 156 },
  { id: 'DP002', name: 'Priya Singh', region: 'West India', status: 'Available', rating: 4.5, totalDeliveries: 89 },
  { id: 'DP003', name: 'Rajesh Kumar', region: 'South India', status: 'On Delivery', rating: 4.9, totalDeliveries: 234 },
  { id: 'DP004', name: 'Anjali Reddy', region: 'East India', status: 'Available', rating: 4.7, totalDeliveries: 178 },
  { id: 'DP005', name: 'Vikram Patel', region: 'West India', status: 'Available', rating: 4.6, totalDeliveries: 145 },
  { id: 'DP006', name: 'Neha Gupta', region: 'North India', status: 'On Delivery', rating: 4.4, totalDeliveries: 112 },
  { id: 'DP007', name: 'Suresh Menon', region: 'South India', status: 'Available', rating: 4.8, totalDeliveries: 167 },
  { id: 'DP008', name: 'Deepa Das', region: 'East India', status: 'Available', rating: 4.3, totalDeliveries: 98 },
  { id: 'DP009', name: 'Kiran Rao', region: 'South India', status: 'On Delivery', rating: 4.7, totalDeliveries: 189 },
  { id: 'DP010', name: 'Ravi Verma', region: 'North India', status: 'Available', rating: 4.5, totalDeliveries: 134 },
  { id: 'DP011', name: 'Sneha Patil', region: 'West India', status: 'Available', rating: 4.6, totalDeliveries: 115 },
  { id: 'DP012', name: 'Arjun Nair', region: 'South India', status: 'Available', rating: 4.9, totalDeliveries: 201 },
];

const PartnersPage = () => {
  const { deliveryPartners, getAvailableDeliveryPartners, loading, error } = useOrder();
  const { user } = useAuth();
  const [partners, setPartners] = useState(mockDeliveryPartners);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [availableOrders, setAvailableOrders] = useState([]);

  useEffect(() => {
    // For now, we'll use mock data
    // When API is ready, uncomment the line below
    // getAvailableDeliveryPartners();
    
    // Apply initial filtering
    applyFilters(selectedStatus, selectedRegion);
    
    // Load available orders
    loadAvailableOrders();
  }, [selectedStatus, selectedRegion]);

  const loadAvailableOrders = async () => {
    try {
      const response = await orderService.getOrdersByStatus('PREP');
      if (response.success) {
        setAvailableOrders(response.data.orders || []);
      }
    } catch (error) {
      console.error('Error loading available orders:', error);
      toast.error('Failed to load available orders');
    }
  };

  const handleAssignOrder = async (partnerId) => {
    if (!selectedOrder) {
      toast.error('Please select an order first');
      return;
    }

    try {
      const response = await orderService.assignPartner(selectedOrder._id, partnerId);
      if (response.success) {
        toast.success('Order assigned successfully!');
        setShowOrderModal(false);
        setSelectedOrder(null);
        // Refresh the partners list
        applyFilters(selectedStatus, selectedRegion);
        // Refresh available orders
        loadAvailableOrders();
      }
    } catch (error) {
      console.error('Error assigning order:', error);
      toast.error(error.message || 'Failed to assign order');
    }
  };

  const applyFilters = (status, region) => {
    const filtered = mockDeliveryPartners.filter(p => 
      (status === 'all' ? true : p.status === status) &&
      (region === 'all' ? true : p.region === region)
    );
    setPartners(filtered);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div 
      className="p-6 min-h-screen"
      style={{ background: 'linear-gradient(to bottom right, #e11d48, #9333ea)' }}
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Delivery Partners</h1>
        <div className="flex gap-4">
          <select 
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">All Partners</option>
            <option value="Available">Available</option>
            <option value="On Delivery">On Delivery</option>
          </select>
          <select 
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
          >
            <option value="all">All Regions</option>
            <option value="North India">North India</option>
            <option value="South India">South India</option>
            <option value="East India">East India</option>
            <option value="West India">West India</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {partners.map(partner => (
          <div key={partner.id} className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{partner.name}</h3>
                <p className="text-gray-600">ID: {partner.id}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                partner.status === 'Available' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {partner.status}
              </span>
            </div>
            <div className="mt-4 space-y-2">
              <p className="text-gray-700">
                <span className="font-medium">Region:</span> {partner.region}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Rating:</span> {partner.rating} ⭐
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Total Deliveries:</span> {partner.totalDeliveries}
              </p>
              {user?.role === 'manager' && (
                <button 
                  className="w-full mt-3 px-4 py-2 bg-purple-400 text-white rounded-lg hover:bg-purple-500 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={partner.status === 'On Delivery'}
                  onClick={() => {
                    setSelectedOrder(null);
                    setShowOrderModal(true);
                  }}
                >
                  {partner.status === 'On Delivery' ? 'Currently on Delivery' : 'Assign Order'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Order Selection Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Select Order to Assign</h3>
            
            {availableOrders.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {availableOrders.map(order => (
                  <div
                    key={order._id}
                    className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                      selectedOrder?._id === order._id ? 'border-purple-500 bg-purple-50' : ''
                    }`}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Order #{order.orderId}</p>
                        <p className="text-sm text-gray-600">{order.customerName}</p>
                      </div>
                      <p className="font-semibold">{order.totalAmount}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">No available orders at the moment</p>
            )}

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowOrderModal(false);
                  setSelectedOrder(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAssignOrder(partner.id)}
                disabled={!selectedOrder}
                className="px-4 py-2 bg-purple-400 text-white rounded-lg hover:bg-purple-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Assign Selected Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnersPage;