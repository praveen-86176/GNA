import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';
import socketService from '../services/socketService';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { isAuthenticated, user, token, loading } = useAuth();

  useEffect(() => {
    if (isAuthenticated && token && !loading) {
      console.log('🔌 Initializing socket connection...');
      
      // Connect socket with token
      const socket = socketService.connect(token);
      
      if (!socket) {
        console.log('⏸️ Failed to initialize socket');
        return;
      }

      // Set up event listeners
      socketService.on('connect', () => {
        console.log('✅ Socket connected');
        setIsConnected(true);
        
        const userId = user._id || user.id;
        const userRole = user.role;
        
        // Join role-based room
        socketService.emit('join_room', {
          role: userRole,
          userId: userId,
          userName: user.name
        });

        toast.success('🔥 Connected to real-time updates', {
          duration: 2000,
          position: 'bottom-right'
        });
      });

      socketService.on('disconnect', () => {
        console.log('❌ Socket disconnected');
        setIsConnected(false);
      });

      // Order event handlers
      socketService.on('order_created', (data) => {
        try {
          const orderId = data.order?.orderId || data.orderId || 'Unknown';
          toast.success(`🆕 New order created: ${orderId}`, {
            duration: 4000,
            position: 'top-right'
          });
        } catch (error) {
          console.error('Error handling order_created event:', error);
        }
      });

      socketService.on('order_updated', (data) => {
        try {
          const orderId = data.order?.orderId || data.orderId || 'Unknown';
          toast.success(`📝 Order ${orderId} updated`, {
            duration: 3000,
            position: 'top-right'
          });
        } catch (error) {
          console.error('Error handling order_updated event:', error);
        }
      });

      socketService.on('order_status_changed', (data) => {
        try {
          const statusMessages = {
            PREP: '👨‍🍳 Order is being prepared',
            PICKED: '🛵 Order has been picked up',
            ON_ROUTE: '🚚 Order is on the way',
            DELIVERED: '✅ Order has been delivered'
          };
          
          const orderId = data.order?.orderId || data.orderId || 'Unknown';
          const status = data.order?.status || data.status;
          const message = statusMessages[status] || `Status updated to ${status}`;
          
          toast.success(`${orderId}: ${message}`, {
            duration: 4000,
            position: 'top-right'
          });
        } catch (error) {
          console.error('Error handling order_status_changed event:', error);
        }
      });

      // Cleanup on unmount
      return () => {
        console.log('🧹 Cleaning up socket connection...');
        socketService.disconnect();
        setIsConnected(false);
      };
    } else if (!isAuthenticated && socketService.isSocketConnected()) {
      console.log('🔒 User not authenticated, closing socket...');
      socketService.disconnect();
      setIsConnected(false);
    }
  }, [isAuthenticated, user, token, loading]);

  const value = {
    socket: socketService,
    isConnected,
    onlineUsers,
    emitOrderStatusUpdate: (data) => socketService.emit('order_status_update', data),
    emitPartnerLocationUpdate: (data) => socketService.emit('partner_location_update', data),
    emitOrderCreated: (data) => socketService.emit('order_created', data),
    emitPartnerAssigned: (data) => socketService.emit('partner_assigned', data),
    joinRoom: (roomName) => socketService.joinRoom(roomName),
    leaveRoom: (roomName) => socketService.leaveRoom(roomName)
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}; 
