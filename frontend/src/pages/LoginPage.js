import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  ShieldCheckIcon, 
  TruckIcon, 
  ChartBarIcon, 
  ClockIcon,
  UserIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  MapPinIcon,
  EnvelopeIcon,
  LockClosedIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { fadeInUp, fadeInDown, staggerContainer, staggerItem } from '../utils/animations';
import { cn } from '../utils/cn';
import zomatoLogo from '../assets/zomato-logo.svg';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [selectedRole, setSelectedRole] = useState('manager'); // 'manager' or 'partner'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Common fields
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    // Manager specific
    restaurantName: '',
    address: '',
    // Partner specific
    vehicleType: 'bike',
    vehicleNumber: '',
    licenseNumber: ''
  });
  
  const { isAuthenticated, user, login, register } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const userRole = user?.role;
      if (userRole === 'partner') {
        navigate('/partner-dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    // Clear role-specific fields when switching
    setFormData(prev => ({
      ...prev,
      restaurantName: '',
      address: '',
      vehicleType: 'bike',
      vehicleNumber: '',
      licenseNumber: ''
    }));
  };

  const validateForm = () => {
    const errors = [];

    if (!formData.email) {
      errors.push('Email is required');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.push('Please enter a valid email address');
    }

    if (!formData.password) {
      errors.push('Password is required');
    } else if (formData.password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }

    if (!isLogin) {
      if (!formData.name) {
        errors.push('Full name is required');
      }
      
      if (!formData.phone) {
        errors.push('Phone number is required');
      } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
        errors.push('Please enter a valid 10-digit phone number');
      }

      if (formData.password !== formData.confirmPassword) {
        errors.push('Passwords do not match');
      }

      if (selectedRole === 'manager') {
        if (!formData.restaurantName) {
          errors.push('Restaurant name is required');
        }
        if (!formData.address) {
          errors.push('Restaurant address is required');
        }
      }

      if (selectedRole === 'partner') {
        if (!formData.vehicleNumber) {
          errors.push('Vehicle number is required');
        }
        if (!formData.licenseNumber) {
          errors.push('License number is required');
        }
      }
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const errors = validateForm();
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      setIsLoading(false);
      return;
    }

    try {
      if (isLogin) {
        console.log('🔐 Starting login process...');
        const response = await login({
          email: formData.email,
          password: formData.password
        });
        
        if (response.success) {
          const user = response.data.user;
          toast.success(`🎉 Welcome back, ${user.name}!`, {
            duration: 3000,
            position: 'top-center'
          });
        }
      } else {
        console.log('📝 Starting registration process...');
        const registrationData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          role: selectedRole,
          ...(selectedRole === 'manager' ? {
            restaurantName: formData.restaurantName,
            address: formData.address
          } : {
            vehicleType: formData.vehicleType,
            vehicleNumber: formData.vehicleNumber,
            licenseNumber: formData.licenseNumber
          })
        };

        const response = await register(registrationData);
        
        if (response.success) {
          toast.success(`🎉 Welcome to Zomato Ops Pro, ${formData.name}!`, {
            duration: 3000,
            position: 'top-center'
          });
        }
      }
    } catch (error) {
      console.error('❌ Authentication error:', error);
      
      let errorMessage = isLogin ? 'Login failed. Please try again.' : 'Registration failed. Please try again.';
      if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(`❌ ${errorMessage}`, {
        duration: 5000,
        position: 'top-center'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: ClockIcon,
      title: 'Real-time Tracking',
      description: 'Live order and delivery updates',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: TruckIcon,
      title: 'Smart Logistics',
      description: 'Efficient delivery coordination',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: ChartBarIcon,
      title: 'Advanced Analytics',
      description: 'Performance insights & reports',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Enterprise Security',
      description: 'Bank-grade data protection',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex flex-col lg:flex-row">
      {/* Left Side - Features */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-600/20 via-emerald-600/20 to-teal-600/20"></div>
        
        {/* Animated background shapes */}
        <motion.div
          className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-green-500/30 to-emerald-500/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-72 h-72 bg-gradient-to-r from-emerald-500/30 to-teal-500/30 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />

        <div className="relative z-10 flex flex-col justify-center px-12 py-8 h-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <div className="flex items-center mb-4">
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-2xl">
                <img src={zomatoLogo} alt="Zomato Logo" className="w-14 h-14" />
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Transform Your Restaurant Operations
            </h2>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              Join thousands of restaurants and delivery partners who trust our platform for seamless operations, real-time tracking, and data-driven insights.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 gap-4"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={staggerItem}
                className="flex items-start space-x-3 p-3 rounded-xl bg-white/80 backdrop-blur-sm border border-green-100 hover:bg-white/90 transition-all duration-300"
                whileHover={{ scale: 1.02, x: 10 }}
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center shadow-lg`}>
                  <feature.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-0.5">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="p-4 sm:p-6 lg:p-8 bg-white/95 backdrop-blur-sm shadow-2xl border border-green-100/50 rounded-2xl hover:shadow-green-100/50 transition-all duration-300">
            {/* Auth Toggle */}
            <div className="flex mb-6 sm:mb-8">
              <div className="flex bg-green-50 rounded-xl p-1 w-full shadow-sm">
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className={cn(
                    "flex-1 px-3 sm:px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                    isLogin
                      ? "bg-white text-green-700 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className={cn(
                    "flex-1 px-3 sm:px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                    !isLogin
                      ? "bg-white text-green-700 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  Sign Up
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={isLogin ? 'login' : 'signup'}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="overflow-y-auto max-h-[calc(100vh-200px)]"
              >
                <div className="text-center mb-6 sm:mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {isLogin ? 'Welcome back!' : 'Create your account'}
                  </h2>
                  <p className="text-gray-600">
                    {isLogin 
                      ? 'Sign in to access your dashboard' 
                      : 'Join our platform and start managing your operations'
                    }
                  </p>
                </div>

                {/* Role Selection for Signup */}
                {!isLogin && (
                  <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      I am a
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => handleRoleChange('manager')}
                        className={cn(
                          "p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center space-y-2 hover:shadow-md",
                          selectedRole === 'manager'
                            ? "border-green-500 bg-green-50 text-green-700"
                            : "border-gray-200 hover:border-gray-300 text-gray-600"
                        )}
                      >
                        <BuildingOfficeIcon className="h-6 w-6" />
                        <span className="font-medium">Restaurant Manager</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRoleChange('partner')}
                        className={cn(
                          "p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center space-y-2 hover:shadow-md",
                          selectedRole === 'partner'
                            ? "border-green-500 bg-green-50 text-green-700"
                            : "border-gray-200 hover:border-gray-300 text-gray-600"
                        )}
                      >
                        <TruckIcon className="h-6 w-6" />
                        <span className="font-medium">Delivery Partner</span>
                      </button>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Form fields with updated styling */}
                  {!isLogin && (
                    <div className="relative group">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <UserIcon className="h-5 w-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                        </div>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                          placeholder="Enter your full name"
                        />
                      </div>
                    </div>
                  )}

                  <div className="relative group">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <EnvelopeIcon className="h-5 w-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  {/* Phone field for signup */}
                  {!isLogin && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <PhoneIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                          placeholder="Enter your phone number"
                        />
                      </div>
                    </div>
                  )}

                  {/* Role-specific fields for signup */}
                  {!isLogin && selectedRole === 'manager' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Restaurant Name
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            name="restaurantName"
                            value={formData.restaurantName}
                            onChange={handleChange}
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                            placeholder="Enter restaurant name"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Restaurant Address
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MapPinIcon className="h-5 w-5 text-gray-400" />
                          </div>
                          <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            rows={3}
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors resize-none"
                            placeholder="Enter restaurant address"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {!isLogin && selectedRole === 'partner' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Vehicle Type
                        </label>
                        <select
                          name="vehicleType"
                          value={formData.vehicleType}
                          onChange={handleChange}
                          className="block w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                        >
                          <option value="bike">Motorcycle</option>
                          <option value="scooter">Scooter</option>
                          <option value="bicycle">Bicycle</option>
                          <option value="car">Car</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Vehicle Number
                          </label>
                          <input
                            type="text"
                            name="vehicleNumber"
                            value={formData.vehicleNumber}
                            onChange={handleChange}
                            className="block w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                            placeholder="DL01AB1234"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            License Number
                          </label>
                          <input
                            type="text"
                            name="licenseNumber"
                            value={formData.licenseNumber}
                            onChange={handleChange}
                            className="block w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                            placeholder="DL123456789"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Password field with updated styling */}
                  <div className="relative group">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <LockClosedIcon className="h-5 w-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-green-500 transition-colors" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-gray-400 hover:text-green-500 transition-colors" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password field for signup */}
                  {!isLogin && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <LockClosedIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                          placeholder="Confirm your password"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                          ) : (
                            <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Submit Button with updated styling */}
                  <Button
                    type="submit"
                    loading={isLoading}
                    fullWidth
                    size="lg"
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {isLogin ? 'Sign In' : 'Create Account'}
                  </Button>

                  {/* Terms with updated styling */}
                  {!isLogin && (
                    <p className="text-sm text-gray-600 text-center">
                      By creating an account, you agree to our{' '}
                      <a href="#" className="text-green-600 hover:text-green-700 font-medium">
                        Terms of Service
                      </a>{' '}
                      and{' '}
                      <a href="#" className="text-green-600 hover:text-green-700 font-medium">
                        Privacy Policy
                      </a>
                    </p>
                  )}
                </form>
              </motion.div>
            </AnimatePresence>
          </Card>

          {/* Demo Credentials */}
          <motion.div
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-sm text-gray-400 mb-3">
              New to Zomato Ops Pro? Create your account above.
            </p>
            <div className="text-xs text-gray-500">
              Choose your role (Restaurant Manager or Delivery Partner) and register to get started.
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage; 