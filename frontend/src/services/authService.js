import api from './api';

// Auth service object
export const authService = {
  // Set auth token and user data
  setAuthData: (token, user, role) => {
    console.log('💾 Setting auth data:', { 
      hasToken: !!token, 
      userName: user?.name, 
      userRole: role || user?.role,
      userId: user?._id || user?.id
    });
    
    if (token && user) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('role', role || user.role);
    } else {
      console.warn('⚠️ Incomplete auth data provided');
      authService.removeAuthData();
    }
  },

  // Remove auth data
  removeAuthData: () => {
    console.log('🗑️ Removing auth data');
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
  },

  // Get stored user data
  getStoredUser: () => {
    try {
      const user = localStorage.getItem('user');
      const role = localStorage.getItem('role');
      const token = localStorage.getItem('token');
      
      if (!user || !token) {
        return null;
      }
      
      const parsedUser = JSON.parse(user);
      const result = { 
        user: parsedUser, 
        role: role || parsedUser.role, 
        token 
      };
      
      console.log('💽 Retrieved stored user:', { 
        hasUser: !!result.user, 
        userName: result.user?.name,
        userRole: result.role,
        hasToken: !!result.token
      });
      
      return result;
    } catch (error) {
      console.error('❌ Error parsing stored user data:', error);
      authService.removeAuthData(); // Clear corrupted data
      return null;
    }
  },

  // Register Manager
  registerManager: async (userData) => {
    try {
      console.log('📝 Registering manager:', userData);
      
      // Ensure all required fields are present
      const requiredFields = ['name', 'email', 'password', 'phone'];
      const missingFields = requiredFields.filter(field => !userData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }
      
      const response = await api.post('/auth/register/manager', {
        name: userData.name.trim(),
        email: userData.email.trim().toLowerCase(),
        password: userData.password,
        phone: userData.phone.trim(),
        role: 'manager'
      });
      
      console.log('✅ Manager registration successful:', response.data);
      
      // Set auth data if registration was successful
      if (response.data.success && response.data.data?.token) {
        const { token, user, role } = response.data.data;
        authService.setAuthData(token, user, role);
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Manager registration error:', error);
      
      if (error.response) {
        // Server responded with error
        throw new Error(error.response.data.message || 'Registration failed');
      } else if (error.request) {
        // Request made but no response
        throw new Error('No response from server. Please check your connection.');
      } else {
        // Request setup error
        throw new Error(error.message || 'An unexpected error occurred.');
      }
    }
  },

  // Register Delivery Partner
  registerPartner: async (userData) => {
    try {
      console.log('📝 Registering partner...');
      
      // Ensure all required fields are present
      const requiredFields = ['name', 'email', 'password', 'phone', 'vehicleType', 'vehicleNumber'];
      const missingFields = requiredFields.filter(field => !userData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }
      
      const response = await api.post('/auth/register/partner', {
        name: userData.name.trim(),
        email: userData.email.trim().toLowerCase(),
        password: userData.password,
        phone: userData.phone.trim(),
        vehicleType: userData.vehicleType,
        vehicleNumber: userData.vehicleNumber,
        role: 'partner'
      });
      
      console.log('✅ Partner registration successful:', response.data);
      
      // Set auth data if registration was successful
      if (response.data.success && response.data.data?.token) {
        const { token, user, role } = response.data.data;
        authService.setAuthData(token, user, role);
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Partner registration error:', error);
      
      if (error.response) {
        // Server responded with error
        throw new Error(error.response.data.message || 'Registration failed');
      } else if (error.request) {
        // Request made but no response
        throw new Error('No response from server. Please check your connection.');
      } else {
        // Request setup error
        throw new Error(error.message || 'An unexpected error occurred.');
      }
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      console.log('🔐 Attempting login...');
      const response = await api.post('/auth/login', {
        email: credentials.email?.trim().toLowerCase(),
        password: credentials.password
      });
      
      console.log('📨 Login response received:', response.data);
      
      if (response.data.success && response.data.data?.token) {
        const { token, user, role } = response.data.data;
        authService.setAuthData(token, user, role);
        console.log('✅ Login successful for:', user.name);
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Login error:', error);
      
      if (error.response) {
        throw new Error(error.response.data.message || 'Login failed');
      } else if (error.request) {
        throw new Error('No response from server. Please check your connection.');
      } else {
        throw new Error(error.message || 'An unexpected error occurred.');
      }
    }
  },

  // Logout user
  logout: async () => {
    try {
      console.log('🚪 Logging out...');
      await api.post('/auth/logout');
      console.log('✅ Logout successful');
    } catch (error) {
      console.warn('⚠️ Logout API call failed:', error.message);
    } finally {
      authService.removeAuthData();
      console.log('✅ Local auth data cleared');
    }
  },

  // Get current user profile
  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      console.error('❌ Get profile error:', error);
      throw new Error(error.response?.data?.message || 'Failed to get profile');
    }
  },

  // Update user profile
  updateProfile: async (userData) => {
    try {
      console.log('📝 Updating profile');
      const response = await api.put('/auth/profile', userData);
      console.log('✅ Profile updated successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Update profile error:', error);
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  },

  // Change password
  changePassword: async (passwordData) => {
    try {
      console.log('🔐 Changing password');
      const response = await api.put('/auth/change-password', passwordData);
      console.log('✅ Password changed successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Change password error:', error);
      throw new Error(error.response?.data?.message || 'Failed to change password');
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  },

  // Get current user role
  getUserRole: () => {
    const role = localStorage.getItem('role');
    const user = localStorage.getItem('user');
    
    if (role) return role;
    
    try {
      const parsedUser = JSON.parse(user);
      return parsedUser?.role;
    } catch {
      return null;
    }
  }
}; 