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

const scrollbarHide = `
  .scrollbar-hide {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;  /* Chrome, Safari and Opera */
  }
  
  /* Custom scrollbar styling */
  ::-webkit-scrollbar {
    width: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb {
    background: linear-gradient(to bottom, #f43f5e, #a855f7);
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(to bottom, #e11d48, #9333ea);
  }
`;

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
        if (!formData.vehicleType) {
          errors.push('Vehicle type is required');
        }
        if (!formData.vehicleNumber) {
          errors.push('Vehicle number is required');
        } else if (formData.vehicleNumber.length < 6 || formData.vehicleNumber.length > 15) {
          errors.push('Vehicle number must be between 6 and 15 characters');
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
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          phone: formData.phone.trim(),
          role: selectedRole,
          ...(selectedRole === 'manager' ? {
            restaurantName: formData.restaurantName.trim(),
            address: formData.address.trim()
          } : {
            vehicleType: formData.vehicleType,
            vehicleNumber: formData.vehicleNumber.trim(),
            licenseNumber: formData.licenseNumber.trim()
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
      color: 'from-blue-500 to-indigo-600',
      hoverColor: 'hover:from-blue-600 hover:to-indigo-700',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200'
    },
    {
      icon: TruckIcon,
      title: 'Smart Logistics',
      description: 'Efficient delivery coordination',
      color: 'from-emerald-500 to-green-600',
      hoverColor: 'hover:from-emerald-600 hover:to-green-700',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      borderColor: 'border-emerald-200'
    },
    {
      icon: ChartBarIcon,
      title: 'Advanced Analytics',
      description: 'Performance insights & reports',
      color: 'from-violet-500 to-purple-600',
      hoverColor: 'hover:from-violet-600 hover:to-purple-700',
      bgColor: 'bg-violet-50',
      textColor: 'text-violet-700',
      borderColor: 'border-violet-200'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Enterprise Security',
      description: 'Bank-grade data protection',
      color: 'from-amber-500 to-orange-600',
      hoverColor: 'hover:from-amber-600 hover:to-orange-700',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
      borderColor: 'border-amber-200'
    }
  ];

  // Enhanced color schemes with more vibrant options
  const colorSchemes = {
    primary: {
      from: 'from-rose-500',
      to: 'to-purple-600',
      hoverFrom: 'hover:from-rose-600',
      hoverTo: 'hover:to-purple-700',
      border: 'border-rose-200',
      focus: 'focus:ring-rose-500',
      text: 'text-rose-600',
      bg: 'bg-rose-50',
      shadow: 'shadow-rose-100/50',
      gradient: 'bg-gradient-to-r from-rose-500/20 to-purple-500/20'
    },
    secondary: {
      from: 'from-purple-400',
      to: 'to-violet-500',
      hoverFrom: 'hover:from-purple-500',
      hoverTo: 'hover:to-violet-600',
      border: 'border-purple-200',
      focus: 'focus:ring-purple-500',
      text: 'text-purple-600',
      bg: 'bg-purple-50',
      shadow: 'shadow-purple-100/50',
      gradient: 'bg-gradient-to-r from-purple-400/20 to-violet-500/20'
    }
  };

  const currentColorScheme = selectedRole === 'manager' ? colorSchemes.primary : colorSchemes.secondary;

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <style>{scrollbarHide}</style>
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-pink-50 flex flex-col lg:flex-row relative overflow-hidden">
        {/* Enhanced Background Effects */}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {/* Animated gradient orbs */}
          <motion.div
            className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-rose-400/30 to-purple-400/30 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
              x: [0, 50, 0],
              y: [0, 30, 0]
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          <motion.div
            className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-purple-400/30 to-pink-400/30 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0],
              x: [0, -50, 0],
              y: [0, -30, 0]
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
          />

          {/* Floating particles */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}

          {/* Animated grid lines */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]">
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-rose-500/10 via-purple-500/10 to-pink-500/10"
              animate={{
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>

          {/* Light beams */}
          <motion.div
            className="absolute top-0 left-1/4 w-1 h-1/3 bg-gradient-to-b from-rose-200/40 to-transparent"
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scaleY: [1, 1.2, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute top-0 right-1/3 w-1 h-1/4 bg-gradient-to-b from-purple-200/40 to-transparent"
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scaleY: [1, 1.2, 1],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-0 left-1/3 w-1 h-1/3 bg-gradient-to-t from-pink-200/40 to-transparent"
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scaleY: [1, 1.2, 1],
            }}
            transition={{
              duration: 4.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Glowing orbs */}
          <motion.div
            className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-r from-rose-400/20 to-purple-400/20 rounded-full blur-2xl"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 90, 180],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-2xl"
            animate={{
              scale: [1.1, 1, 1.1],
              rotate: [180, 270, 360],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </motion.div>

        {/* Left Side - Features */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden lg:fixed lg:h-screen">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-600/20 via-purple-600/20 to-pink-600/20 backdrop-blur-sm"></div>
          
          {/* Animated Bubbles */}
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={`bubble-${i}`}
              className="absolute rounded-full bg-gradient-to-r from-rose-400/20 to-purple-400/20 backdrop-blur-sm"
              style={{
                width: `${Math.random() * 60 + 20}px`,
                height: `${Math.random() * 60 + 20}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100, 0],
                x: [0, Math.random() * 50 - 25, 0],
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 5,
              }}
            />
          ))}

          {/* Floating Bubbles with Glow */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`glow-bubble-${i}`}
              className="absolute rounded-full bg-gradient-to-r from-rose-500/10 to-purple-500/10 backdrop-blur-sm"
              style={{
                width: `${Math.random() * 100 + 50}px`,
                height: `${Math.random() * 100 + 50}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                filter: 'blur(20px)',
              }}
              animate={{
                y: [0, -150, 0],
                x: [0, Math.random() * 100 - 50, 0],
                scale: [1, 1.3, 1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: Math.random() * 15 + 15,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 8,
              }}
            />
          ))}

          {/* Interactive Bubbles */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={`interactive-bubble-${i}`}
              className="absolute rounded-full bg-gradient-to-r from-rose-400/30 to-purple-400/30 backdrop-blur-sm cursor-pointer"
              style={{
                width: `${Math.random() * 40 + 30}px`,
                height: `${Math.random() * 40 + 30}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              whileHover={{
                scale: 1.5,
                opacity: 0.8,
              }}
              animate={{
                y: [0, -80, 0],
                x: [0, Math.random() * 30 - 15, 0],
                scale: [1, 1.1, 1],
                opacity: [0.4, 0.6, 0.4],
              }}
              transition={{
                duration: Math.random() * 8 + 8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 4,
              }}
            />
          ))}

          {/* Feature section background effects */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Animated circles */}
            <motion.div
              className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full blur-2xl"
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 90, 180],
                x: [0, 30, 0],
                y: [0, -20, 0]
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            <motion.div
              className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-gradient-to-r from-emerald-400/20 to-green-400/20 rounded-full blur-2xl"
              animate={{
                scale: [1.2, 1, 1.2],
                rotate: [180, 270, 360],
                x: [0, -30, 0],
                y: [0, 20, 0]
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            <motion.div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-violet-400/20 to-purple-400/20 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 180, 360]
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                ease: "linear"
              }}
            />

            {/* Animated grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]">
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-rose-500/5 via-purple-500/5 to-pink-500/5"
                animate={{
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>

            {/* Floating particles */}
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1.5 h-1.5 bg-white/30 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`
                }}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.3, 0.6, 0.3],
                  scale: [1, 1.2, 1]
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2
                }}
              />
            ))}
          </div>
          
          <div className="relative z-10 flex flex-col justify-center px-12 py-8 h-full">
            {/* Logo section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6"
            >
              <div className="flex items-center mb-8">
                <motion.div 
                  className="relative"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-purple-500 rounded-2xl blur-lg opacity-50"></div>
                  <div className="relative w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-2xl transform hover:rotate-3 transition-all duration-300">
                    <motion.img 
                      src={zomatoLogo} 
                      alt="Zomato Logo" 
                      className="w-16 h-16"
                      animate={{
                        scale: [1, 1.05, 1],
                        rotate: [0, 2, 0]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  </div>
                  <motion.div
                    className="absolute -inset-1 bg-gradient-to-r from-rose-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-1000"
                    animate={{
                      opacity: [0, 0.5, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="ml-4"
                >
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent">
                    Zomato Ops Pro
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">Enterprise Solutions</p>
                </motion.div>
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Transform Your Restaurant Operations
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Join thousands of restaurants and delivery partners who trust our platform for seamless operations, real-time tracking, and data-driven insights.
              </p>
            </motion.div>

            {/* Features section with enhanced styling */}
            <motion.div
              className="grid grid-cols-1 gap-4 relative"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={staggerItem}
                  className={`group relative p-4 rounded-xl ${feature.bgColor} backdrop-blur-sm border-2 ${feature.borderColor} hover:border-opacity-100 transition-all duration-300 overflow-hidden`}
                  whileHover={{ 
                    scale: 1.02, 
                    x: 10,
                    boxShadow: `0 10px 30px -10px ${feature.textColor}40`
                  }}
                >
                  {/* Feature background effects */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-40 transition-opacity duration-300`}
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, 0]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  
                  {/* Content */}
                  <div className="relative z-10 flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} ${feature.hoverColor} flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300 group-hover:shadow-2xl group-hover:shadow-${feature.textColor}20`}>
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold ${feature.textColor} mb-1 group-hover:translate-x-1 transition-transform duration-300 group-hover:text-${feature.textColor.split('-')[1]}-800`}>
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 group-hover:text-gray-800 transition-colors duration-300">
                        {feature.description}
                      </p>
                    </div>
                  </div>

                  {/* Hover effect line */}
                  <div className={`absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r ${feature.color} group-hover:w-full transition-all duration-300`}></div>
                  
                  {/* Glow effect */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-300`}></div>
                  
                  {/* Border highlight */}
                  <div className={`absolute inset-0 border-2 border-transparent group-hover:border-${feature.textColor} rounded-xl transition-colors duration-300`}></div>

                  {/* Shine effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  </div>

                  {/* Color pulse effect */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-20`}
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0, 0.2, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8 lg:ml-[50%] relative overflow-hidden">
          {/* Enhanced Background Effects */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Main gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-100/70 via-rose-100/70 to-purple-100/70 dark:from-purple-900/25 dark:via-rose-900/25 dark:to-purple-900/25 transition-colors duration-500"></div>

            {/* Dynamic Bubbles */}
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={`dynamic-bubble-${i}`}
                className="absolute rounded-full bg-gradient-to-r from-purple-400/20 to-rose-400/20 dark:from-purple-400/15 dark:to-rose-400/15 backdrop-blur-sm transition-colors duration-500"
                style={{
                  width: `${Math.random() * 40 + 10}px`,
                  height: `${Math.random() * 40 + 10}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  filter: 'blur(4px)',
                }}
                animate={{
                  y: [0, -100, 0],
                  x: [0, Math.random() * 30 - 15, 0],
                  scale: [1, 1.2, 1],
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                  duration: Math.random() * 10 + 10,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: Math.random() * 5,
                }}
              />
            ))}

            {/* Glowing Bubbles */}
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={`glow-bubble-${i}`}
                className="absolute rounded-full bg-gradient-to-r from-purple-500/15 to-rose-500/15 dark:from-purple-500/10 dark:to-rose-500/10 backdrop-blur-sm transition-colors duration-500"
                style={{
                  width: `${Math.random() * 60 + 20}px`,
                  height: `${Math.random() * 60 + 20}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  filter: 'blur(12px)',
                }}
                animate={{
                  y: [0, -150, 0],
                  x: [0, Math.random() * 50 - 25, 0],
                  scale: [1, 1.3, 1],
                  opacity: [0.15, 0.3, 0.15],
                }}
                transition={{
                  duration: Math.random() * 15 + 15,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: Math.random() * 8,
                }}
              />
            ))}

            {/* Interactive Bubbles */}
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={`interactive-bubble-${i}`}
                className="absolute rounded-full bg-gradient-to-r from-purple-400/25 to-rose-400/25 dark:from-purple-400/20 dark:to-rose-400/20 backdrop-blur-sm cursor-pointer transition-colors duration-500"
                style={{
                  width: `${Math.random() * 30 + 15}px`,
                  height: `${Math.random() * 30 + 15}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                whileHover={{
                  scale: 1.5,
                  opacity: 0.6,
                }}
                animate={{
                  y: [0, -80, 0],
                  x: [0, Math.random() * 20 - 10, 0],
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: Math.random() * 8 + 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: Math.random() * 4,
                }}
              />
            ))}

            {/* Dynamic Light Rays */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={`light-ray-${i}`}
                className="absolute w-1 h-1/4 bg-gradient-to-b from-purple-300/40 via-rose-300/40 to-transparent dark:from-purple-300/30 dark:via-rose-300/30 transition-colors duration-500"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                  scaleY: [1, 1.2, 1],
                  rotate: [0, 5, 0],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: Math.random() * 2,
                }}
              />
            ))}

            {/* Floating Particles */}
            {[...Array(40)].map((_, i) => (
              <motion.div
                key={`particle-${i}`}
                className="absolute w-1 h-1 bg-white/40 dark:bg-white/30 rounded-full transition-colors duration-500"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  filter: 'blur(0.5px)',
                }}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.3, 0.6, 0.3],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}

            {/* Animated Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:24px_24px] transition-colors duration-500">
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-rose-500/10 to-purple-500/10 dark:from-purple-500/5 dark:via-rose-500/5 dark:to-purple-500/5 transition-colors duration-500"
                animate={{
                  opacity: [0.3, 0.5, 0.3],
                  scale: [1, 1.02, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>

            {/* Focus Light */}
            <motion.div
              className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-purple-900/15 dark:to-purple-900/10 transition-colors duration-500"
              animate={{
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>

          <motion.div
            className="w-full max-w-md relative z-10"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Role Selection Cards */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Choose Your Role</h2>
              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  type="button"
                  onClick={() => {
                    handleRoleChange('manager');
                    setIsLogin(true);
                  }}
                  className={`p-6 rounded-xl border-2 transition-all duration-300 flex flex-col items-center space-y-4 relative overflow-hidden group ${
                    selectedRole === 'manager'
                      ? "border-rose-500 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-200 shadow-[0_4px_20px_-4px_rgba(244,63,94,0.3)] dark:shadow-[0_4px_20px_-4px_rgba(244,63,94,0.2)]"
                      : "border-gray-200 dark:border-gray-700 hover:border-rose-500/50 dark:hover:border-rose-400/50 text-gray-600 dark:text-gray-300 hover:shadow-[0_4px_20px_-4px_rgba(244,63,94,0.2)] dark:hover:shadow-[0_4px_20px_-4px_rgba(244,63,94,0.1)]"
                  }`}
                  whileHover={{ 
                    scale: 1.02,
                    transition: { duration: 0.2 }
                  }}
                >
                  {/* Background gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-r from-rose-500/10 to-purple-500/10 dark:from-rose-500/30 dark:to-purple-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  
                  {/* Icon container */}
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-r from-rose-500 to-purple-500 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300 relative z-10`}>
                    <BuildingOfficeIcon className="h-8 w-8 text-white" />
                  </div>

                  {/* Content */}
                  <div className="text-center relative z-10">
                    <span className="font-semibold text-lg block group-hover:text-rose-600 dark:group-hover:text-rose-100 transition-colors duration-300">Restaurant Manager</span>
                    <span className="text-sm text-gray-500 dark:text-gray-300 mt-1 block group-hover:text-gray-700 dark:group-hover:text-gray-100 transition-colors duration-300">Manage your restaurant operations</span>
                  </div>

                  {/* Hover effects */}
                  <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-rose-500 to-purple-500 group-hover:w-full transition-all duration-300"></div>
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-rose-500/50 dark:group-hover:border-rose-400/50 rounded-xl transition-colors duration-300"></div>

                  {/* Shine effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  </div>
                </motion.button>

                <motion.button
                  type="button"
                  onClick={() => {
                    handleRoleChange('partner');
                    setIsLogin(true);
                  }}
                  className={`p-6 rounded-xl border-2 transition-all duration-300 flex flex-col items-center space-y-4 relative overflow-hidden group ${
                    selectedRole === 'partner'
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-200 shadow-[0_4px_20px_-4px_rgba(168,85,247,0.3)] dark:shadow-[0_4px_20px_-4px_rgba(168,85,247,0.2)]"
                      : "border-gray-200 dark:border-gray-700 hover:border-purple-500/50 dark:hover:border-purple-400/50 text-gray-600 dark:text-gray-300 hover:shadow-[0_4px_20px_-4px_rgba(168,85,247,0.2)] dark:hover:shadow-[0_4px_20px_-4px_rgba(168,85,247,0.1)]"
                  }`}
                  whileHover={{ 
                    scale: 1.02,
                    transition: { duration: 0.2 }
                  }}
                >
                  {/* Background gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-r from-purple-400/10 to-violet-500/10 dark:from-purple-400/30 dark:to-violet-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  
                  {/* Icon container */}
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-r from-purple-400 to-violet-500 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300 relative z-10`}>
                    <TruckIcon className="h-8 w-8 text-white" />
                  </div>

                  {/* Content */}
                  <div className="text-center relative z-10">
                    <span className="font-semibold text-lg block group-hover:text-purple-600 dark:group-hover:text-purple-100 transition-colors duration-300">Delivery Partner</span>
                    <span className="text-sm text-gray-500 dark:text-gray-300 mt-1 block group-hover:text-gray-700 dark:group-hover:text-gray-100 transition-colors duration-300">Manage your deliveries</span>
                  </div>

                  {/* Hover effects */}
                  <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-purple-400 to-violet-500 group-hover:w-full transition-all duration-300"></div>
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-purple-500/50 dark:group-hover:border-purple-400/50 rounded-xl transition-colors duration-300"></div>

                  {/* Shine effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  </div>
                </motion.button>
              </div>
            </div>

            {/* Auth Form */}
            <Card className={`p-4 sm:p-6 lg:p-8 bg-white dark:bg-gray-900 shadow-xl border-2 ${currentColorScheme.border} dark:border-gray-700 rounded-2xl transition-all duration-300`}>
              {/* Auth Toggle with enhanced styling */}
              <div className="flex mb-6 sm:mb-8">
                <div className={`flex ${currentColorScheme.bg} dark:bg-gray-800 rounded-xl p-1 w-full shadow-sm border border-${selectedRole === 'manager' ? 'rose' : 'blue'}-100 dark:border-gray-700`}>
                  <button
                    type="button"
                    onClick={() => setIsLogin(true)}
                    className={cn(
                      "flex-1 px-3 sm:px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                      isLogin
                        ? `bg-white dark:bg-gray-700 ${currentColorScheme.text} dark:text-white shadow-sm`
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
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
                        ? `bg-white dark:bg-gray-700 ${currentColorScheme.text} dark:text-white shadow-sm`
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    )}
                  >
                    Sign Up
                  </button>
                </div>
              </div>

              {/* Form fields with enhanced styling */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {!isLogin && (
                  <div className="relative group">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserIcon className={`h-5 w-5 text-gray-400 dark:text-gray-500 group-focus-within:${currentColorScheme.text} transition-colors`} />
                      </div>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`block w-full pl-10 pr-3 py-3 border-2 ${currentColorScheme.border} dark:border-gray-700 rounded-xl ${currentColorScheme.focus} focus:border-${selectedRole === 'manager' ? 'rose' : 'blue'}-500 transition-all duration-200 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Email field */}
                <div className="relative group">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <EnvelopeIcon className={`h-5 w-5 text-gray-400 dark:text-gray-500 group-focus-within:${currentColorScheme.text} transition-colors`} />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-3 border-2 ${currentColorScheme.border} dark:border-gray-700 rounded-xl ${currentColorScheme.focus} focus:border-${selectedRole === 'manager' ? 'rose' : 'blue'}-500 transition-all duration-200 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                {/* Phone field for signup */}
                {!isLogin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
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
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors dark:bg-gray-800 dark:text-gray-100"
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>
                )}

                {/* Role-specific fields for signup */}
                {!isLogin && selectedRole === 'manager' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
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
                          className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors dark:bg-gray-800 dark:text-gray-100"
                          placeholder="Enter restaurant name"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
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
                          className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors resize-none dark:bg-gray-800 dark:text-gray-100"
                          placeholder="Enter restaurant address"
                        />
                      </div>
                    </div>
                  </>
                )}

                {!isLogin && selectedRole === 'partner' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        Vehicle Type
                      </label>
                      <select
                        name="vehicleType"
                        value={formData.vehicleType}
                        onChange={handleChange}
                        className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
                      >
                        <option value="bike" className="dark:bg-gray-800 dark:text-gray-100">Motorcycle</option>
                        <option value="scooter" className="dark:bg-gray-800 dark:text-gray-100">Scooter</option>
                        <option value="bicycle" className="dark:bg-gray-800 dark:text-gray-100">Bicycle</option>
                        <option value="car" className="dark:bg-gray-800 dark:text-gray-100">Car</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                          Vehicle Number
                        </label>
                        <input
                          type="text"
                          name="vehicleNumber"
                          value={formData.vehicleNumber}
                          onChange={handleChange}
                          className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
                          placeholder="Enter vehicle number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                          License Number
                        </label>
                        <input
                          type="text"
                          name="licenseNumber"
                          value={formData.licenseNumber}
                          onChange={handleChange}
                          className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
                          placeholder="DL123456789"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Password field */}
                <div className="relative group">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LockClosedIcon className={`h-5 w-5 text-gray-400 dark:text-gray-500 group-focus-within:${currentColorScheme.text} transition-colors`} />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-10 py-3 border-2 ${currentColorScheme.border} dark:border-gray-700 rounded-xl ${currentColorScheme.focus} focus:border-${selectedRole === 'manager' ? 'rose' : 'blue'}-500 transition-all duration-200 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
                      placeholder="Enter your password"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password field for signup */}
                {!isLogin && (
                  <div className="relative group">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <LockClosedIcon className={`h-5 w-5 text-gray-400 dark:text-gray-500 group-focus-within:${currentColorScheme.text} transition-colors`} />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`block w-full pl-10 pr-10 py-3 border-2 ${currentColorScheme.border} dark:border-gray-700 rounded-xl ${currentColorScheme.focus} focus:border-${selectedRole === 'manager' ? 'rose' : 'blue'}-500 transition-all duration-200 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
                        placeholder="Confirm your password"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full bg-gradient-to-r ${currentColorScheme.from} ${currentColorScheme.to} ${currentColorScheme.hoverFrom} ${currentColorScheme.hoverTo} text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </div>
                  ) : (
                    isLogin ? 'Sign In' : 'Create Account'
                  )}
                </motion.button>

                {/* Terms */}
                {!isLogin && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    By creating an account, you agree to our{' '}
                    <a href="#" className={`${currentColorScheme.text} dark:text-${selectedRole === 'manager' ? 'rose' : 'blue'}-400 hover:opacity-80 font-medium`}>
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className={`${currentColorScheme.text} dark:text-${selectedRole === 'manager' ? 'rose' : 'blue'}-400 hover:opacity-80 font-medium`}>
                      Privacy Policy
                    </a>
                  </p>
                )}
              </form>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default AuthPage; 