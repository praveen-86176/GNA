import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  MapPinIcon,
  PhoneIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  TruckIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ArrowTopRightOnSquareIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import partnerService from '../services/partnerService';
import toast from 'react-hot-toast';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';
import Loading from '../components/ui/Loading';
import { fadeInUp, scaleIn } from '../utils/animations';

const CurrentOrder = () => {
  const { user, updatePartnerStatus } = useAuth();
  const { socket, connected } = useSocket();
  const [currentOrder, setCurrentOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadCurrentOrder();
    
    // Socket listeners for real-time updates
    if (socket) {
      socket.on('order_assigned', handleOrderAssigned);
      socket.on('order_updated', handleOrderUpdate);
      socket.on('order_status_changed', handleOrderStatusChange);
    }

    return () => {
      if (socket) {
        socket.off('order_assigned');
        socket.off('order_updated');
        socket.off('order_status_changed');
      }
    };
  }, [socket, user]);

  const loadCurrentOrder = async () => {
    try {
      setLoading(true);
      
      // Get current order from user context and load real order from global storage
      if (user && user.currentOrder) {
        // Load the actual order from global storage
        const globalOrders = JSON.parse(localStorage.getItem('global_orders') || '[]');
        const userCurrentOrder = globalOrders.find(order => 
          order._id === user.currentOrder && 
          (order.assignedPartner === (user._id || user.id))
        );
        
        if (userCurrentOrder) {
          // Get stored status from auth localStorage - this is the most recent user action
          const storedAuth = JSON.parse(localStorage.getItem('zomato_auth') || '{}');
          const authStatus = storedAuth.user?.orderStatus;
          
          // Use auth status as the source of truth for partner actions
          const finalStatus = authStatus || userCurrentOrder.status || 'PICKED';
          
          // Update global storage to match auth status to keep them in sync
          if (userCurrentOrder.status !== finalStatus) {
            const updatedGlobalOrders = globalOrders.map(order => 
              order._id === user.currentOrder 
                ? { ...order, status: finalStatus, updatedAt: new Date().toISOString() }
                : order
            );
            localStorage.setItem('global_orders', JSON.stringify(updatedGlobalOrders));
            console.log('🔄 Global storage updated to match auth status:', finalStatus);
          }
          
          const currentOrderWithStatus = {
            ...userCurrentOrder,
            status: finalStatus
          };
          
          setCurrentOrder(currentOrderWithStatus);
          console.log('✅ Real current order loaded with persisted status:', userCurrentOrder.orderId, 'status:', finalStatus);
        } else {
          // Order not found in global storage, clear current order
          setCurrentOrder(null);
          updatePartnerStatus('available', null);
          console.log('ℹ️ Current order not found in global storage, clearing...');
        }
      } else {
        setCurrentOrder(null);
        console.log('ℹ️ No current order found in user context');
      }
      
    } catch (error) {
      console.error('Error loading current order:', error);
      toast.error('Failed to load current order');
    } finally {
      setLoading(false);
    }
  };

  const handleOrderAssigned = (data) => {
    setCurrentOrder(data.order);
    toast.success('New order assigned!');
  };

  const handleOrderUpdate = (data) => {
    if (currentOrder && data.order?._id === currentOrder._id) {
      setCurrentOrder(data.order);
    }
  };

  const handleOrderStatusChange = (data) => {
    if (currentOrder && data.orderId === currentOrder._id) {
      setCurrentOrder(prev => ({ ...prev, status: data.status }));
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!currentOrder) return;
    
    try {
      setUpdating(true);
      console.log('🔄 Updating order status from', currentOrder.status, 'to', newStatus);
      
      // Update order status in demo mode
      const updatedOrder = {
        ...currentOrder,
        status: newStatus,
        updatedAt: new Date()
      };
      
      setCurrentOrder(updatedOrder);
      
      // Update the order status in global storage FIRST
      const globalOrders = JSON.parse(localStorage.getItem('global_orders') || '[]');
      const updatedGlobalOrders = globalOrders.map(order => 
        order._id === currentOrder._id 
          ? { 
              ...order, 
              status: newStatus, 
              updatedAt: new Date().toISOString(),
              partnerStatus: 'busy' // Ensure partner is marked as busy while handling order
            }
          : order
      );
      localStorage.setItem('global_orders', JSON.stringify(updatedGlobalOrders));
      console.log('✅ Global storage updated with status:', newStatus);
      
      // Update the user's stored order status in auth storage SECOND
      const storedAuth = JSON.parse(localStorage.getItem('zomato_auth') || '{}');
      if (storedAuth.user) {
        storedAuth.user.orderStatus = newStatus;
        storedAuth.user.currentOrder = updatedOrder._id;
        localStorage.setItem('zomato_auth', JSON.stringify(storedAuth));
        console.log('✅ Auth storage updated with status:', newStatus);
      }
      
      // Update partner status in manager's view
      const partnerStatuses = JSON.parse(localStorage.getItem('partner_statuses') || '{}');
      partnerStatuses[user._id || user.id] = {
        status: 'busy',
        currentOrder: updatedOrder._id,
        updatedAt: new Date().toISOString(),
        partnerName: user.name,
        orderStatus: newStatus
      };
      localStorage.setItem('partner_statuses', JSON.stringify(partnerStatuses));
      
      // Update the AuthContext to keep it in sync
      updatePartnerStatus('busy', updatedOrder._id);
      
      // Broadcast status change to all connected clients
      window.dispatchEvent(new CustomEvent('orderStatusChanged', {
        detail: {
          orderId: currentOrder._id,
          newStatus,
          partnerId: user._id || user.id,
          partnerName: user.name
        }
      }));
      
      toast.success(`Order status updated to ${newStatus}`, {
        icon: newStatus === 'DELIVERED' ? '✅' : '📝',
        duration: 3000
      });
      
      if (newStatus === 'DELIVERED') {
        // Add to completed orders history
        const completedOrders = JSON.parse(localStorage.getItem('completed_orders') || '[]');
        const completedOrder = {
          ...updatedOrder,
          deliveredAt: new Date().toISOString(),
          partnerId: user._id || user.id,
          partnerName: user.name,
          deliveryTime: Math.floor(Math.random() * 10) + 20, // 20-30 minutes
          rating: Math.random() > 0.8 ? 4 : 5 // Mostly 5 stars, some 4 stars
        };
        completedOrders.unshift(completedOrder);
        localStorage.setItem('completed_orders', JSON.stringify(completedOrders));
        
        // Update statistics when order is completed
        const completionBonus = 50; // Bonus earnings per delivery
        const deliveryTime = completedOrder.deliveryTime;
        
        // Update today's statistics
        const todayStats = JSON.parse(localStorage.getItem('partner_today_stats') || '{}');
        const newTodayStats = {
          deliveries: (todayStats.deliveries || 8) + 1,
          earnings: (todayStats.earnings || 1200) + completionBonus,
          lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('partner_today_stats', JSON.stringify(newTodayStats));
        
        // Update total statistics
        const totalStats = JSON.parse(localStorage.getItem('partner_total_stats') || '{}');
        const newTotalStats = {
          deliveries: (totalStats.deliveries || 247) + 1,
          earnings: (totalStats.earnings || 28450) + completionBonus,
          totalDeliveryTime: (totalStats.totalDeliveryTime || 5681) + deliveryTime,
          lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('partner_total_stats', JSON.stringify(newTotalStats));
        
        // Clear current order from AuthContext when delivered
        updatePartnerStatus('available', null);
        
        // Update partner status in manager's view to available
        partnerStatuses[user._id || user.id] = {
          status: 'available',
          currentOrder: null,
          updatedAt: new Date().toISOString(),
          partnerName: user.name
        };
        localStorage.setItem('partner_statuses', JSON.stringify(partnerStatuses));
        
        // Remove order from global orders (mark as completed)
        const finalGlobalOrders = globalOrders.filter(order => order._id !== currentOrder._id);
        localStorage.setItem('global_orders', JSON.stringify(finalGlobalOrders));
        
        // Broadcast partner status change to available
        window.dispatchEvent(new CustomEvent('partnerStatusChanged', {
          detail: {
            partnerId: user._id || user.id,
            partnerName: user.name,
            newStatus: 'available',
            currentOrder: null
          }
        }));
        
        setTimeout(() => {
          setCurrentOrder(null);
          toast.success(`🎉 Order completed! Great job! +₹${completionBonus} earned`, {
            duration: 5000
          });
          
          // Trigger dashboard refresh event
          window.dispatchEvent(new CustomEvent('orderCompleted', {
            detail: { 
              newStats: newTodayStats, 
              totalStats: newTotalStats,
              completionBonus,
              completedOrder
            }
          }));
          
        }, 2000);
      }
      
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      toast.error('Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      'PREP': 'PICKED',
      'PICKED': 'ON_ROUTE',
      'ON_ROUTE': 'DELIVERED'
    };
    return statusFlow[currentStatus];
  };

  const getStatusAction = (status) => {
    const actions = {
      'PREP': 'Mark as Picked Up',
      'PICKED': 'Start Delivery',
      'ON_ROUTE': 'Mark as Delivered'
    };
    return actions[status];
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: 'short'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, #e11d48, #9333ea)' }}>
        <Loading size="lg" text="Loading current order..." />
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, #e11d48, #9333ea)' }}>
        <div className="max-w-4xl mx-auto p-6">
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <TruckIcon className="h-12 w-12 text-gray-400" />
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              No Active Order
            </h1>
            <p className="text-lg text-white/90 mb-8">
              You don't have any active orders at the moment. Check your dashboard for available orders.
            </p>
            <Button
              onClick={() => navigate('/partner-dashboard')}
              size="lg"
              className="bg-rose-500/20 text-white hover:bg-rose-500/30 backdrop-blur-sm"
            >
              Go to Dashboard
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, #e11d48, #9333ea)' }}>
      <div className="max-w-4xl mx-auto p-6">
        
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={fadeInUp.initial}
          animate={fadeInUp.animate}
          transition={fadeInUp.transition}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white drop-shadow-lg">Current Order</h1>
              <p className="text-lg text-white/90 mt-1 drop-shadow">
                Manage your active delivery
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                connected ? 'bg-white/30 text-white drop-shadow' : 'bg-red-500/30 text-white drop-shadow'
              }`}>
                {connected ? '🟢 Live Connected' : '🔴 Offline'}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Order Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card variant="elevated" className="bg-white/20 backdrop-blur-md border-white/30 text-white overflow-hidden mb-8 shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -mr-16 -mt-16"></div>
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between drop-shadow">
                <span className="flex items-center">
                  <TruckIcon className="h-6 w-6 mr-2" />
                  Order #{currentOrder.orderId}
                </span>
                <StatusBadge status={currentOrder.status} className="bg-white/30" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Details */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 drop-shadow">Customer Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <UserIcon className="h-5 w-5 text-white/90 mr-3" />
                      <span className="text-white drop-shadow-sm">{currentOrder.customerName}</span>
                    </div>
                    <div className="flex items-center">
                      <PhoneIcon className="h-5 w-5 text-white/90 mr-3" />
                      <span className="text-white drop-shadow-sm">{currentOrder.customerPhone}</span>
                    </div>
                    <div className="flex items-start">
                      <MapPinIcon className="h-5 w-5 text-white/90 mr-3 mt-0.5" />
                      <span className="text-white drop-shadow-sm">{currentOrder.customerAddress}</span>
                    </div>
                  </div>
                </div>

                {/* Order Info */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 drop-shadow">Order Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <CurrencyRupeeIcon className="h-5 w-5 text-white/90 mr-3" />
                      <span className="text-white font-bold text-xl drop-shadow">
                        {formatCurrency(currentOrder.totalAmount)}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <ClockIcon className="h-5 w-5 text-white/90 mr-3" />
                      <span className="text-white drop-shadow-sm">{formatTime(currentOrder.createdAt)}</span>
                    </div>
                    <div>
                      <p className="text-white/90 text-sm mb-2 drop-shadow-sm">Items:</p>
                      <div className="space-y-1">
                        {currentOrder.items?.map((item, index) => (
                          <div key={index} className="text-white text-sm drop-shadow-sm">
                            {item.quantity}x {item.name} - {formatCurrency(item.price)}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {/* Primary Action */}
          <Card hover className="md:col-span-2 bg-white/20 backdrop-blur-md border-white/30 shadow-xl">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold text-white mb-4 drop-shadow">
                Next Action Required
              </h3>
              {getNextStatus(currentOrder.status) && (
                <Button
                  onClick={() => handleUpdateStatus(getNextStatus(currentOrder.status))}
                  loading={updating}
                  size="lg"
                  fullWidth
                  className="bg-white text-purple-600 hover:bg-white/90 mb-4 shadow-lg"
                >
                  {getStatusAction(currentOrder.status)}
                </Button>
              )}
              
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => window.open(`tel:${currentOrder.customerPhone}`)}
                  variant="secondary"
                  icon={PhoneIcon}
                  fullWidth
                  className="bg-white/30 text-white hover:bg-white/40 shadow-lg"
                >
                  Call Customer
                </Button>
                
                <Button
                  onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(currentOrder.customerAddress)}`)}
                  variant="secondary"
                  icon={ArrowTopRightOnSquareIcon}
                  fullWidth
                  className="bg-white/30 text-white hover:bg-white/40 shadow-lg"
                >
                  Navigate
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card hover className="bg-white/20 backdrop-blur-md border-white/30 shadow-xl">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4 drop-shadow">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Button
                  onClick={loadCurrentOrder}
                  variant="ghost"
                  icon={ArrowPathIcon}
                  fullWidth
                  size="sm"
                  className="text-white hover:bg-white/30 shadow-sm"
                >
                  Refresh Order
                </Button>
                
                <Button
                  onClick={() => window.location.href = '/partner-dashboard'}
                  variant="ghost"
                  fullWidth
                  size="sm"
                  className="text-white hover:bg-white/30 shadow-sm"
                >
                  Back to Dashboard
                </Button>
                
                <Button
                  onClick={() => window.location.href = '/order-history'}
                  variant="ghost"
                  fullWidth
                  size="sm"
                  className="text-white hover:bg-white/30 shadow-sm"
                >
                  View History
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default CurrentOrder; 