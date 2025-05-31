import { io } from 'socket.io-client';

// Socket configuration
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  connect(token = null) {
    try {
      // Disconnect existing socket if any
      this.disconnect();

      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        upgrade: true,
        rememberUpgrade: true,
        timeout: 5000,
        forceNew: true,
        auth: {
          token: token || localStorage.getItem('token')
        },
        query: {
          token: token || localStorage.getItem('token')
        },
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay
      });

      // Connection event handlers
      this.socket.on('connect', () => {
        console.log('✅ Socket connected:', this.socket.id);
        this.isConnected = true;
        this.reconnectAttempts = 0;
      });

      this.socket.on('disconnect', (reason) => {
        console.log('❌ Socket disconnected:', reason);
        this.isConnected = false;
        
        // Handle reconnection
        if (reason === 'io server disconnect') {
          // Server initiated disconnect, try to reconnect
          this.socket.connect();
        }
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error);
        this.isConnected = false;
        this.reconnectAttempts++;
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error('❌ Max reconnection attempts reached');
          this.disconnect();
        }
      });

      this.socket.on('error', (error) => {
        console.error('❌ Socket error:', error);
      });

      // Add reconnection event handlers
      this.socket.on('reconnect_attempt', (attemptNumber) => {
        console.log(`🔄 Reconnection attempt ${attemptNumber}`);
      });

      this.socket.on('reconnect', (attemptNumber) => {
        console.log(`✅ Reconnected after ${attemptNumber} attempts`);
        this.isConnected = true;
        this.reconnectAttempts = 0;
      });

      this.socket.on('reconnect_error', (error) => {
        console.error('❌ Reconnection error:', error);
      });

      this.socket.on('reconnect_failed', () => {
        console.error('❌ Failed to reconnect');
        this.isConnected = false;
      });

      return this.socket;
    } catch (error) {
      console.error('❌ Socket initialization error:', error);
      return null;
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.reconnectAttempts = 0;
    }
  }

  emit(event, data) {
    if (this.socket && this.isConnected) {
      try {
        this.socket.emit(event, data);
        console.log(`📤 Emitted ${event}:`, data);
      } catch (error) {
        console.error(`❌ Error emitting ${event}:`, error);
      }
    } else {
      console.warn('⚠️ Socket not connected, cannot emit:', event);
    }
  }

  on(event, callback) {
    if (this.socket) {
      try {
        this.socket.on(event, callback);
        console.log(`👂 Listening for ${event}`);
      } catch (error) {
        console.error(`❌ Error setting up listener for ${event}:`, error);
      }
    }
  }

  off(event, callback) {
    if (this.socket) {
      try {
        this.socket.off(event, callback);
        console.log(`🔕 Removed listener for ${event}`);
      } catch (error) {
        console.error(`❌ Error removing listener for ${event}:`, error);
      }
    }
  }

  // Utility methods
  isSocketConnected() {
    return this.socket?.connected || false;
  }

  getSocketId() {
    return this.socket?.id;
  }

  // Room management
  joinRoom(roomName) {
    if (this.socket && this.isConnected) {
      this.emit('join_room', { room: roomName });
    }
  }

  leaveRoom(roomName) {
    if (this.socket && this.isConnected) {
      this.emit('leave_room', { room: roomName });
    }
  }
}

// Export singleton instance
export default new SocketService(); 