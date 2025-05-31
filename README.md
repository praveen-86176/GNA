# Zomato Ops Pro 🚀

A comprehensive restaurant operations management platform that streamlines the coordination between restaurants and delivery partners.

## 🌟 Features

### For Restaurant Managers
- Real-time order tracking and management
- Restaurant profile and menu management
- Analytics dashboard with key performance metrics
- Order history and reporting
- Staff management and scheduling

### For Delivery Partners
- Real-time order notifications
- Route optimization and navigation
- Earnings tracking and analytics
- Profile and vehicle management
- Delivery history and ratings

## 🛠️ Tech Stack

### Frontend
- React.js
- Tailwind CSS
- Framer Motion for animations
- React Router for navigation
- React Context for state management
- Heroicons for UI icons

### Backend
- Node.js
- Express.js
- MongoDB
- JWT for authentication
- Socket.IO for real-time updates

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/zomato-ops-pro.git
cd zomato-ops-pro
```

2. Install dependencies
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

3. Set up environment variables
```bash
# In the backend directory, create a .env file with:
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=5000
```

4. Start the development servers
```bash
# Start backend server (from backend directory)
npm run dev

# Start frontend server (from frontend directory)
npm start
```

## 📱 Application Structure

```
zomato-ops-pro/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── utils/
│   │   └── App.js
│   └── package.json
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── server.js
└── README.md
```

## 🔐 Authentication

The application supports two types of users:
1. Restaurant Managers
2. Delivery Partners

Each user type has specific features and permissions tailored to their role.

## 🎨 UI/UX Features

- Modern and responsive design
- Light greenish theme for better visibility
- Smooth animations and transitions
- Real-time updates and notifications
- Interactive dashboards and charts
- Mobile-first approach

## 📊 Key Features

- Real-time order tracking
- Smart logistics coordination
- Advanced analytics and reporting
- Enterprise-grade security
- Role-based access control
- Responsive design for all devices

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Author

- Praveen Kumar [Full Stack Developer]

## 🙏 Acknowledgments

- Zomato for inspiration
- All contributors who have helped shape this project
- The open-source community

## 📞 Support

For support, email support@zomatoopspro.com or join our Slack/Discord channel.

---

## Made with ❤️ for the restaurant industry
