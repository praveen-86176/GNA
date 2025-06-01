import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const OrderContext = createContext();

// Define your backend Socket.IO server URL
const SOCKET_SERVER_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'; // Replace with your backend URL

// Mock Delivery Partners data (up to 10 from different regions)
const mockDeliveryPartners = [
  { id: 'DP001', name: 'Amit Sharma', region: 'North India', status: 'Available' },
  { id: 'DP002', name: 'Priya Singh', region: 'West India', status: 'Available' },
  { id: 'DP003', name: 'Rajesh Kumar', region: 'South India', status: 'On Delivery' },
  { id: 'DP004', name: 'Anjali Reddy', region: 'East India', status: 'Available' },
  { id: 'DP005', name: 'Vikram Patel', region: 'West India', status: 'Available' },
  { id: 'DP006', name: 'Neha Gupta', region: 'North India', status: 'On Delivery' },
  { id: 'DP007', name: 'Suresh Menon', region: 'South India', status: 'Available' },
  { id: 'DP008', name: 'Deepa Das', region: 'East India', status: 'Available' },
  { id: 'DP009', name: 'Kiran Rao', region: 'South India', status: 'On Delivery' },
  { id: 'DP010', name: 'Ravi Verma', region: 'North India', status: 'Available' },
];

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};

export const OrderProvider = ({ children }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [deliveryPartners, setDeliveryPartners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);

  // Helper function to get auth headers
  const getAuthHeaders = useCallback(() => {
    return {
      'Content-Type': 'application/json',
      'Authorization': user?.token ? `Bearer ${user.token}` : '',
    };
  }, [user?.token]);

  // Fetch restaurant orders for managers
  const fetchRestaurantOrders = useCallback(async () => {
    if (!user?.token) return; // Don't fetch if not authenticated
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/restaurant/orders', {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching restaurant orders:', error);
    }
  }, [user?.token, getAuthHeaders]); // Added dependencies

  // Fetch delivery orders for partners
  const fetchDeliveryOrders = useCallback(async () => {
    if (!user?.token) return; // Don't fetch if not authenticated
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/delivery/orders', {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching delivery orders:', error);
    }
  }, [user?.token, getAuthHeaders]); // Added dependencies

  // Fetch orders based on user role
  useEffect(() => {
    if (user) {
      if (user.role === 'manager') {
        fetchRestaurantOrders();
      } else if (user.role === 'partner') {
        fetchDeliveryOrders();
      }
    }
  }, [user, fetchRestaurantOrders, fetchDeliveryOrders]); // Added dependencies

  // Assign delivery partner to order
  const assignDeliveryPartner = async (orderId, partnerId) => {
    if (!user?.token) throw new Error('Not authenticated');
    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/orders/${orderId}/assign`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ partnerId }),
      });
      const data = await response.json();

      // Update orders state (this might be better handled by a socket event)
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, deliveryPartner: data.partner } : order
        )
      );

      return data;
    } catch (error) {
      console.error('Error assigning delivery partner:', error);
      throw error;
    }
  };

  // Get available delivery partners
  const getAvailableDeliveryPartners = async () => {
    if (!user?.token) return []; // Don't fetch if not authenticated
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/delivery/partners/available', {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      setDeliveryPartners(data);
      return data;
    } catch (error) {
      console.error('Error fetching available delivery partners:', error);
      throw error;
    }
  };

  // Get active orders for delivery partner
  const getActiveOrders = async (partnerId) => {
     if (!user?.token) return []; // Don't fetch if not authenticated
    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/delivery/partners/${partnerId}/active-orders`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      setActiveOrders(data);
      return data;
    } catch (error) {
      console.error('Error fetching active orders:', error);
      throw error;
    }
  };

  // --- Mock/API Integration Functions (Keep these, but they'll be called less often with real-time) ---
  // This fetchOrders is primarily for initial load or manual refresh now
  const fetchOrders = useCallback(async () => {
    if (!user?.token) return; // Don't fetch if not authenticated
    setLoading(true);
    setError(null);
    try {
      // Replace with actual API call (e.g., using fetch or axios)
      const response = await fetch(`${SOCKET_SERVER_URL}/api/orders`, {
          headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();

      // // Mock data and delay (remove this section when integrating actual API)
      // await new Promise(resolve => setTimeout(resolve, 500));
      // const mockOrders = [
      //   { id: 'ORD001', customer: 'John Doe', amount: 25.50, status: 'Delivered', partner: 'Alice Smith', time: '2 mins ago', statusColor: 'text-green-600' },
      //   { id: 'ORD002', customer: 'Jane Doe', amount: 35.00, status: 'Preparing', partner: 'Bob Johnson', time: '10 mins ago', statusColor: 'text-yellow-600' },
      //   { id: 'ORD003', customer: 'Peter Jones', amount: 15.75, status: 'Out for Delivery', partner: 'Charlie Brown', time: '15 mins ago', statusColor: 'text-blue-600' },
      //   { id: 'ORD004', customer: 'Mary Williams', amount: 40.20, status: 'New Order', partner: 'Unassigned', time: '20 mins ago', statusColor: 'text-purple-600' },
      //   { id: 'ORD005', customer: 'David Green', amount: 20.00, status: 'Cancelled', partner: 'N/A', time: '30 mins ago', statusColor: 'text-red-600' },
      // ];
      // setOrders(mockOrders); // Use fetched data instead of mock data

      setOrders(data);
    } catch (err) {
      setError(err);
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.token, getAuthHeaders, SOCKET_SERVER_URL]); // Added dependencies

  // Simulate creating a new order (this function will now also emit a socket event)
  const createOrder = async (orderData) => {
    if (!user?.token) throw new Error('Not authenticated');
    setLoading(true);
    setError(null);
    try {
      // --- Start: Replace with actual API call to create order ---
       const response = await fetch(`${SOCKET_SERVER_URL}/api/orders`, {
         method: 'POST',
         headers: getAuthHeaders(),
         body: JSON.stringify(orderData),
       });
       if (!response.ok) { /* Handle specific API errors like validation */ throw new Error('Failed to create order'); }
       const newOrder = await response.json(); // Backend should return the created order
      // --- End: Replace with actual API call ---

      console.log('Order created (sent to backend): ', newOrder);

       // Assuming backend emits 'newOrder' event after successful creation,
       // the state update will happen via the socket listener.
       // If not using socket for new order, uncomment the line below:
      // setOrders(prevOrders => [newOrder, ...prevOrders]);

    } catch (err) {
      setError(err);
      console.error('Error creating order:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Simulate updating an order status (this function will now also emit a socket event)
  const updateOrderStatus = async (orderId, newStatus) => {
    if (!user?.token) throw new Error('Not authenticated');
    setLoading(true);
    setError(null);
    try {
      // --- Start: Replace with actual API call to update order status ---
       const response = await fetch(`${SOCKET_SERVER_URL}/api/orders/${orderId}/status`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({ status: newStatus }),
       });
       if (!response.ok) { /* Handle specific API errors */ throw new Error('Failed to update order status'); }
       const updatedOrder = await response.json(); // Backend should return the updated order
      // --- End: Replace with actual API call ---

      console.log(`Order ${orderId} status updated to ${newStatus} (sent to backend)`);

       // Assuming backend emits 'orderUpdated' event after successful update,
       // the state update will happen via the socket listener.
       // If not using socket for updates, uncomment the block below:
      // const statusColors = { /* ... your status color mapping */ };
      // const updatedStatusColor = statusColors[updatedOrder.status] || 'text-gray-600';
      // setOrders(prevOrders =>
      //     prevOrders.map(order =>
      //         order.id === updatedOrder.id ? { ...order, ...updatedOrder, statusColor: updatedStatusColor } : order
      //     )
      // );

    } catch (err) {
      setError(err);
      console.error('Error updating order status:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Simulate assigning a partner to an order (this function will now also emit a socket event)
  const assignPartner = async (orderId, partnerId) => {
    if (!user?.token) throw new Error('Not authenticated');
    setLoading(true);
    setError(null);
    try {
      // --- Start: Replace with actual API call to assign partner ---
       const response = await fetch(`${SOCKET_SERVER_URL}/api/orders/${orderId}/assign`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({ partnerId }),
       });
       if (!response.ok) { /* Handle specific API errors */ throw new Error('Failed to assign partner'); }
       const updatedOrder = await response.json(); // Backend should return the updated order
      // --- End: Replace with actual API call ---

      console.log(`Partner ${updatedOrder.partner?.name || partnerId} assigned to order ${orderId} (sent to backend)`); // Use partner name from backend response

       // Assuming backend emits 'orderUpdated' event after successful assignment,
       // the state update will happen via the socket listener.
       // If not using socket for assignments, uncomment the block below:
      // const assignedPartner = mockDeliveryPartners.find(p => p.id === partnerId); // Find mock partner
      // const assignedPartnerName = assignedPartner ? assignedPartner.name : `Partner ${partnerId}`;
      // const updatedStatusColor = 'text-yellow-600'; // Assuming status changes on assignment
      // setOrders(prevOrders =>
      //     prevOrders.map(order =>
      //         order.id === updatedOrder.id ? { ...order, ...updatedOrder, partner: assignedPartnerName, status: 'Preparing', statusColor: updatedStatusColor } : order
      //     )
      // );

    } catch (err) {
      setError(err);
      console.error('Error assigning partner:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }
  // --- End Mock/API Integration Functions ---

  // --- Socket.IO Connection and Event Handling ---
  useEffect(() => {
    // Only connect if the user is authenticated
    if (!user?.token) {
        console.log('User not authenticated, skipping socket connection.');
        // Optional: Disconnect existing socket if token is removed
        if (socket) { socket.disconnect(); setSocket(null); }
        return; // Don't proceed with connection
    }

    // Connect to the Socket.IO server, passing the token for authentication
    const socketIo = io(SOCKET_SERVER_URL, {
        auth: {
            token: user.token
        }
        // Or, you might pass it as a query parameter depending on backend setup:
        // query: { token: user.token }
    });

    setSocket(socketIo);

    // Listen for connection success
    socketIo.on('connect', () => {
      console.log('Socket.IO connected:', socketIo.id);
      // Emit an event to join a room based on user role for targeted updates
       socketIo.emit('joinRoleRoom', user.role); // Example: Join 'manager' or 'partner' room
        // If partners need specific order updates, they might join a partner-specific room
        // if (user.role === 'partner' && user.id) {
        //     socketIo.emit('joinPartnerRoom', user.id);
        // }
    });

    // Listen for authentication errors from the server (if backend sends them)
    socketIo.on('connect_error', (err) => {
      console.error('Socket.IO connection error:', err);
      if (err.message === 'Authentication error') {
          console.error('Socket Authentication Error');
          // Handle authentication failure (e.g., redirect to login or show message)
          // Example: logout(); // Assuming logout is available via AuthContext
      } else {
           setError(new Error('Failed to connect to real-time updates.'));
      }
    });

    // Listen for real-time events from the backend
    // Update state based on received data
    socketIo.on('orderUpdated', (updatedOrder) => {
      console.log('Socket: orderUpdated received', updatedOrder);
       const statusColors = { // Keep mapping consistent
                'Delivered': 'text-green-600',
                'Preparing': 'text-yellow-600',
                'Out for Delivery': 'text-blue-600',
                'New Order': 'text-purple-600',
                'Cancelled': 'text-red-600',
                // Add other statuses as needed
         };
        const statusColor = updatedOrder.statusColor || statusColors[updatedOrder.status] || 'text-gray-600';

      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === updatedOrder.id ? { ...order, ...updatedOrder, statusColor } : order
        )
      );
        // Also update active orders if this affects a partner
        // This logic depends heavily on how active orders are defined and managed
        // If activeOrders are just a filtered view of 'orders', updating 'orders' is enough.
         setActiveOrders(prevActiveOrders =>
             prevActiveOrders.map(order =>
                 order.id === updatedOrder.id ? { ...order, ...updatedOrder, statusColor } : order
             ).filter(order => order.status !== 'Delivered' && order.status !== 'Cancelled') // Example filtering
         );
    });

    socketIo.on('newOrder', (newOrder) => {
      console.log('Socket: newOrder received', newOrder);
       const statusColors = { // Keep mapping consistent
                'Delivered': 'text-green-600',
                'Preparing': 'text-yellow-600',
                'Out for Delivery': 'text-blue-600',
                'New Order': 'text-purple-600',
                'Cancelled': 'text-red-600',
                 // Add other statuses as needed
         };
          const statusColor = newOrder.statusColor || statusColors[newOrder.status] || 'text-gray-600';

      setOrders(prevOrders => [ { ...newOrder, statusColor }, ...prevOrders]);
       // If partners automatically see new orders they might be eligible for,
       // you might need to add it to activeOrders state here based on your logic.
         if (user?.role === 'partner' && newOrder.status === 'New Order') { // Example condition
             // Assuming new orders are relevant to partners
             setActiveOrders(prevActiveOrders => [ { ...newOrder, statusColor }, ...prevActiveOrders]);
         }
    });

    socketIo.on('orderDeleted', (deletedOrderId) => {
      console.log('Socket: orderDeleted received', deletedOrderId);
      setOrders(prevOrders => prevOrders.filter(order => order.id !== deletedOrderId));
       // Also remove from active orders if it exists there
         setActiveOrders(prevActiveOrders => prevActiveOrders.filter(order => order.id !== deletedOrderId));
    });

    // Clean up the connection when the component unmounts or token changes
    return () => {
      console.log('Socket.IO disconnecting');
      socketIo.disconnect();
      setSocket(null);
    };
  }, [user?.token, SOCKET_SERVER_URL, user?.role]); // Reconnect if token, server URL, or user role changes

   // Fetch initial data when socket connects AND user is authenticated
    useEffect(() => {
        if (socket && user?.token) {
            console.log('Socket connected and user authenticated, fetching initial data.');
            // Decide which fetch function to call based on user role, or a universal one
             if (user.role === 'manager') {
                fetchRestaurantOrders();
             } else if (user.role === 'partner') {
                 fetchDeliveryOrders();
             }
             // Or if fetchOrders handles this internally:
             // fetchOrders(); // This fetchOrders is a general one, might need role-specific logic inside
        } else if (!user?.token) {
             // Clear orders if user logs out
             setOrders([]);
        }
    }, [socket, user?.token, fetchRestaurantOrders, fetchDeliveryOrders]); // Re-fetch when socket/user changes

  // --- End Socket.IO Connection and Event Handling ---

  const value = {
    orders, // Orders for manager/general view
    activeOrders, // Orders specifically for a partner
    deliveryPartners, // Available partners for manager view
    assignPartner, // Used by manager to assign
    updateOrderStatus, // Used by both manager and partner
    getAvailableDeliveryPartners, // Used by manager
    getActiveOrders, // Used by partner
    fetchOrders, // General fetch, perhaps for initial load
    createOrder, // Used by manager to create
    loading,
    error,
    socket, // Expose socket if needed (use cautiously)
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};

// Make sure to wrap your application (or the relevant parts) with <OrderProvider>
// and wrap that with <AuthProvider> as shown in the previous App.js example. 