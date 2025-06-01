import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import ThemedCard from '../../components/ui/ThemedCard';
import { ShoppingBagIcon, CreditCardIcon, ClockIcon, TruckIcon } from '@heroicons/react/24/outline';
import { useOrder } from '../../context/OrderContext';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
  const { colorScheme } = useTheme();
  const { orders, loading, error, fetchRestaurantOrders } = useOrder();
  const { user } = useAuth();

  // Mock data (replace with API calls)
  const mockMetrics = {
    totalOrders: 120,
    pendingOrders: 15,
    completedOrders: 105,
    averageDeliveryTime: '30 mins',
  };

  const mockRecentOrders = [
    { id: 'ORD001', customerName: 'Rajeev S.', status: 'Preparing', deliveryPartner: null, time: '10:30 AM' },
    { id: 'ORD002', customerName: 'Priya K.', status: 'Out for Delivery', deliveryPartner: 'Amit S.', time: '10:15 AM' },
    { id: 'ORD003', customerName: 'Amit S.', status: 'Delivered', deliveryPartner: 'Priya S.', time: '09:45 AM' },
    { id: 'ORD004', customerName: 'Neha R.', status: 'Pending', deliveryPartner: null, time: '10:45 AM' },
    { id: 'ORD005', customerName: 'Vikram P.', status: 'Preparing', deliveryPartner: null, time: '10:35 AM' },
  ];

  const [metrics, setMetrics] = useState(mockMetrics);
  const [recentOrders, setRecentOrders] = useState(mockRecentOrders);

  // useEffect(() => {
  //   if (user?.role === 'manager') {
  //     fetchRestaurantOrders(user.restaurantId);
  //   }
  // }, [user, fetchRestaurantOrders]);

  // useEffect(() => {
  //   if (orders) {
  //     // Calculate and update metrics based on fetched orders
  //     // setMetrics(...)
  //     // setRecentOrders(...)
  //   }
  // }, [orders]);

  if (loading) return <div>Loading Dashboard...</div>;
  if (error) return <div>Error loading dashboard: {error.message}</div>;

  return (
    <div 
      className="p-6 min-h-screen"
      style={{ background: 'linear-gradient(to bottom right, #e11d48, #9333ea)' }}
    >
      <h1 className="text-3xl font-bold mb-6 text-white">Restaurant Dashboard</h1>
      
      {/* Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-5 text-center">
          <h2 className="text-xl font-semibold text-gray-700">Total Orders</h2>
          <p className="text-3xl font-bold text-blue-600 mt-2">{metrics.totalOrders}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5 text-center">
          <h2 className="text-xl font-semibold text-gray-700">Pending Orders</h2>
          <p className="text-3xl font-bold text-yellow-600 mt-2">{metrics.pendingOrders}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5 text-center">
          <h2 className="text-xl font-semibold text-gray-700">Completed Orders</h2>
          <p className="text-3xl font-bold text-green-600 mt-2">{metrics.completedOrders}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5 text-center">
          <h2 className="text-xl font-semibold text-gray-700">Avg. Delivery Time</h2>
          <p className="text-3xl font-bold text-purple-600 mt-2">{metrics.averageDeliveryTime}</p>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-white">Recent Orders</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Partner</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.customerName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'Out for Delivery' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'Preparing' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.deliveryPartner || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 