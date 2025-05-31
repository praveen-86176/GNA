const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

// Sample data for creating orders
const sampleOrders = [
  {
    items: [
      { 
        name: 'Hyderabadi Veg Biryani',
        quantity: 2,
        price: 280,
        description: 'Aromatic basmati rice cooked with mixed vegetables and special spices',
        preferences: 'Extra spicy, extra onions'
      },
      { 
        name: 'Mint Raita',
        quantity: 2,
        price: 60,
        description: 'Fresh yogurt with mint and cucumber',
        preferences: 'Extra mint'
      },
      { 
        name: 'Masala Coke',
        quantity: 2,
        price: 80,
        description: 'Coca-Cola with Indian spices and lime',
        preferences: 'Extra masala'
      }
    ],
    customerName: 'Arjun Mehta',
    customerPhone: '9876543210',
    customerAddress: 'Flat 302, Green Valley Apartments, 8th Block, Koramangala, Bangalore - 560034',
    specialInstructions: 'Please call before delivery, no doorbell',
    prepTime: 15,
    estimatedDeliveryTime: 30,
    priority: 'medium',
    restaurant: {
      name: 'Spice Garden',
      location: 'Koramangala 8th Block',
      rating: 4.5
    }
  },
  {
    items: [
      { 
        name: 'Chicken Tikka Pizza',
        quantity: 1,
        price: 399,
        description: 'Wood-fired pizza with tandoori chicken, bell peppers, and onions',
        preferences: 'Extra cheese, well done'
      },
      { 
        name: 'Garlic Bread',
        quantity: 1,
        price: 149,
        description: 'Toasted bread with garlic butter and herbs',
        preferences: 'Extra garlic butter'
      },
      { 
        name: 'Chocolate Lava Cake',
        quantity: 1,
        price: 199,
        description: 'Warm chocolate cake with molten center, served with vanilla ice cream',
        preferences: 'Extra hot'
      }
    ],
    customerName: 'Priya Patel',
    customerPhone: '9876543211',
    customerAddress: 'House No. 45, 12th Main Road, Indiranagar, Bangalore - 560038',
    specialInstructions: 'Please deliver to the security desk',
    prepTime: 20,
    estimatedDeliveryTime: 35,
    priority: 'high',
    restaurant: {
      name: 'Pizza Paradise',
      location: 'Indiranagar',
      rating: 4.3
    }
  },
  {
    items: [
      { 
        name: 'Paneer Butter Masala',
        quantity: 1,
        price: 320,
        description: 'Cottage cheese in rich tomato gravy with butter and cream',
        preferences: 'Extra gravy'
      },
      { 
        name: 'Butter Naan',
        quantity: 4,
        price: 160,
        description: 'Soft bread baked in tandoor with butter',
        preferences: 'Well done'
      },
      { 
        name: 'Jeera Rice',
        quantity: 1,
        price: 180,
        description: 'Basmati rice tempered with cumin seeds',
        preferences: 'Extra jeera'
      },
      { 
        name: 'Gulab Jamun',
        quantity: 2,
        price: 120,
        description: 'Sweet milk solids dumplings in sugar syrup',
        preferences: 'Warm'
      }
    ],
    customerName: 'Rahul Sharma',
    customerPhone: '9876543212',
    customerAddress: 'Apt 505, Prestige Shantiniketan, Whitefield Main Road, Bangalore - 560066',
    specialInstructions: 'Please keep the food hot',
    prepTime: 18,
    estimatedDeliveryTime: 33,
    priority: 'medium',
    restaurant: {
      name: 'Royal Spice',
      location: 'Whitefield',
      rating: 4.7
    }
  },
  {
    items: [
      { 
        name: 'Classic Chicken Burger',
        quantity: 2,
        price: 299,
        description: 'Grilled chicken patty with lettuce, tomato, and special sauce',
        preferences: 'Extra sauce, no onions'
      },
      { 
        name: 'Loaded French Fries',
        quantity: 1,
        price: 149,
        description: 'Crispy fries topped with cheese and herbs',
        preferences: 'Extra crispy'
      },
      { 
        name: 'Oreo Milkshake',
        quantity: 2,
        price: 199,
        description: 'Creamy milkshake with Oreo cookies',
        preferences: 'Extra thick'
      }
    ],
    customerName: 'Ananya Reddy',
    customerPhone: '9876543213',
    customerAddress: 'Flat 1203, Brigade Gateway, Malleshwaram West, Bangalore - 560055',
    specialInstructions: 'Please deliver to the main entrance',
    prepTime: 12,
    estimatedDeliveryTime: 25,
    priority: 'low',
    restaurant: {
      name: 'Burger Junction',
      location: 'Malleshwaram',
      rating: 4.2
    }
  },
  {
    items: [
      { 
        name: 'Veg Fried Rice',
        quantity: 1,
        price: 220,
        description: 'Stir-fried rice with mixed vegetables and soy sauce',
        preferences: 'Extra spicy'
      },
      { 
        name: 'Hakka Noodles',
        quantity: 1,
        price: 220,
        description: 'Stir-fried noodles with vegetables and Chinese spices',
        preferences: 'Extra vegetables'
      },
      { 
        name: 'Veg Manchurian',
        quantity: 1,
        price: 280,
        description: 'Vegetable dumplings in spicy sauce',
        preferences: 'Extra sauce'
      },
      { 
        name: 'Coke',
        quantity: 2,
        price: 80,
        description: 'Regular Coca-Cola',
        preferences: 'Extra cold'
      }
    ],
    customerName: 'Vikram Singh',
    customerPhone: '9876543214',
    customerAddress: 'House No. 78, 4th Block, Jayanagar, Bangalore - 560011',
    specialInstructions: 'Please deliver to the back gate',
    prepTime: 15,
    estimatedDeliveryTime: 30,
    priority: 'high',
    restaurant: {
      name: 'Wok & Roll',
      location: 'Jayanagar',
      rating: 4.4
    }
  },
  {
    items: [
      { 
        name: 'Chicken Shawarma',
        quantity: 2,
        price: 180,
        description: 'Grilled chicken wrapped in pita bread with garlic sauce',
        preferences: 'Extra garlic sauce'
      },
      { 
        name: 'Hummus',
        quantity: 1,
        price: 120,
        description: 'Creamy chickpea dip with olive oil',
        preferences: 'Extra olive oil'
      },
      { 
        name: 'Falafel',
        quantity: 1,
        price: 150,
        description: 'Crispy chickpea fritters',
        preferences: 'Extra crispy'
      },
      { 
        name: 'Lemon Mint',
        quantity: 2,
        price: 100,
        description: 'Refreshing drink with lemon and mint',
        preferences: 'Extra mint'
      }
    ],
    customerName: 'Zara Khan',
    customerPhone: '9876543215',
    customerAddress: 'Flat 402, Purva Riviera, Sarjapur Road, Bangalore - 560103',
    specialInstructions: 'Please call when reaching the gate',
    prepTime: 10,
    estimatedDeliveryTime: 25,
    priority: 'medium',
    restaurant: {
      name: 'Arabian Delight',
      location: 'Sarjapur Road',
      rating: 4.6
    }
  },
  {
    items: [
      { 
        name: 'Margherita Pizza',
        quantity: 1,
        price: 299,
        description: 'Classic pizza with tomato sauce and mozzarella',
        preferences: 'Extra cheese'
      },
      { 
        name: 'Pasta Alfredo',
        quantity: 1,
        price: 249,
        description: 'Fettuccine pasta in creamy parmesan sauce',
        preferences: 'Extra creamy'
      },
      { 
        name: 'Garlic Bread',
        quantity: 1,
        price: 149,
        description: 'Toasted bread with garlic butter',
        preferences: 'Extra garlic'
      },
      { 
        name: 'Tiramisu',
        quantity: 1,
        price: 199,
        description: 'Classic Italian dessert with coffee and mascarpone',
        preferences: 'Extra coffee'
      }
    ],
    customerName: 'Aditya Verma',
    customerPhone: '9876543216',
    customerAddress: 'Apt 1201, Sobha Dream Acres, Bellandur, Bangalore - 560103',
    specialInstructions: 'Please deliver to the clubhouse',
    prepTime: 20,
    estimatedDeliveryTime: 35,
    priority: 'low',
    restaurant: {
      name: 'Italian Villa',
      location: 'Bellandur',
      rating: 4.8
    }
  }
];

async function createSampleData() {
  try {
    console.log('🚀 Starting sample data creation...');
    
    // Step 1: Login as manager
    console.log('1️⃣ Logging in as manager...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'manager@gnaenergy.com',
      password: 'manager123'
    });
    
    if (!loginResponse.data.success) {
      throw new Error('Login failed');
    }
    
    const token = loginResponse.data.data.token;
    console.log('✅ Manager login successful');
    
    // Set up axios with auth header
    const authApi = axios.create({
      baseURL: API_BASE,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Step 2: Create sample orders
    console.log('2️⃣ Creating sample orders...');
    const createdOrders = [];
    
    for (let i = 0; i < sampleOrders.length; i++) {
      try {
        const orderResponse = await authApi.post('/orders', sampleOrders[i]);
        if (orderResponse.data.success) {
          createdOrders.push(orderResponse.data.data);
          console.log(`✅ Order ${i + 1} created: ${orderResponse.data.data.orderId}`);
        }
        // Add delay between requests
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`❌ Failed to create order ${i + 1}:`, error.response?.data?.message || error.message);
      }
    }
    
    // Step 3: Get available partners
    console.log('3️⃣ Fetching available partners...');
    const partnersResponse = await authApi.get('/partners/available');
    
    if (!partnersResponse.data.success || !partnersResponse.data.data.length) {
      console.log('⚠️ No available partners found');
      return;
    }
    
    const partners = partnersResponse.data.data;
    console.log(`✅ Found ${partners.length} available partners`);
    
    // Step 4: Assign partners to some orders
    console.log('4️⃣ Assigning partners to orders...');
    const assignableOrders = createdOrders.slice(0, Math.min(createdOrders.length, partners.length));
    
    for (let i = 0; i < assignableOrders.length; i++) {
      try {
        const order = assignableOrders[i];
        const partner = partners[i % partners.length];
        
        const assignResponse = await authApi.put(`/orders/${order._id}/assign-partner`, {
          partnerId: partner._id
        });
        
        if (assignResponse.data.success) {
          console.log(`✅ Partner ${partner.name} assigned to order ${order.orderId}`);
        }
        
        // Add delay between requests
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`❌ Failed to assign partner to order:`, error.response?.data?.message || error.message);
      }
    }
    
    // Step 5: Update some order statuses to simulate progress
    console.log('5️⃣ Updating order statuses...');
    const statuses = ['PICKED', 'ON_ROUTE', 'DELIVERED'];
    
    for (let i = 0; i < Math.min(assignableOrders.length, 3); i++) {
      try {
        const order = assignableOrders[i];
        const status = statuses[i % statuses.length];
        
        // First login as partner to update status
        const partnerLoginResponse = await axios.post(`${API_BASE}/auth/login`, {
          email: 'raj@gnadelivery.com',
          password: 'partner123'
        });
        
        if (partnerLoginResponse.data.success) {
          const partnerToken = partnerLoginResponse.data.data.token;
          const partnerApi = axios.create({
            baseURL: API_BASE,
            headers: {
              'Authorization': `Bearer ${partnerToken}`,
              'Content-Type': 'application/json'
            }
          });
          
          const statusResponse = await partnerApi.put(`/orders/${order._id}/status`, {
            status: status
          });
          
          if (statusResponse.data.success) {
            console.log(`✅ Order ${order.orderId} status updated to ${status}`);
          }
        }
        
        // Add delay between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`❌ Failed to update order status:`, error.response?.data?.message || error.message);
      }
    }
    
    console.log('🎉 Sample data creation completed!');
    console.log('📊 You should now see data in your dashboard');
    
  } catch (error) {
    console.error('❌ Error creating sample data:', error.response?.data?.message || error.message);
  }
}

// Run the script
createSampleData(); 