# Inventory Management System

A comprehensive inventory management solution for efficient stock tracking, supplier management, and business analytics.

## Overview

This inventory management system provides a full-featured platform for managing products, suppliers, stock movements, and generating insights through analytics. It features a modern React frontend with a responsive UI and a robust Express.js backend connected to MongoDB.

## Features

- **User Authentication**: Secure login and role-based access control
- **Product Management**: Add, edit, and track product details
- **Category Organization**: Group products by customizable categories
- **Supplier Management**: Track supplier information and performance
- **Stock Movement Tracking**: Record all stock additions and removals
- **Low Stock Alerts**: Get notified when products fall below minimum levels
- **Reports & Analytics**: Generate insights with customizable reports
- **Natural Language Query**: Ask questions about your inventory in natural language
- **Audit Logs**: Keep track of all system activities
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Frontend
- React 19
- Vite
- React Router DOM
- Tailwind CSS
- Radix UI Components
- Recharts for data visualization
- Axios for API communication

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- OpenAI API integration for natural language processing

## Installation

### Prerequisites
- Node.js (v18+)
- MongoDB
- DeepSeek API key (for natural language query functionality)

### Setup

1. Clone the repository
```bash
git clone https://github.com/yourusername/inventory-management.git
cd inventory-management
```

2. Install dependencies for backend
```bash
cd backend
npm install
```

3. Install dependencies for frontend
```bash
cd ../frontend
npm install
```

4. Create environment variables

Backend (.env file in backend directory):
```
PORT=5001
MONGODB_URI=mongodb://localhost:27017/inventory
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
DEEPSEEK_API_KEY=your_deepseek_api_key
DEEPSEEK_API_ENDPOINT=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-coder
NODE_ENV=development
```

Frontend (.env file in frontend directory):
```
VITE_API_URL=http://localhost:5001/api
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/profile` - Get user profile

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create a new product
- `GET /api/products/:id` - Get a single product
- `PUT /api/products/:id` - Update a product
- `DELETE /api/products/:id` - Delete a product

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create a new category
- `GET /api/categories/:id` - Get a single category
- `PUT /api/categories/:id` - Update a category
- `DELETE /api/categories/:id` - Delete a category

### Suppliers
- `GET /api/suppliers` - Get all suppliers
- `POST /api/suppliers` - Create a new supplier
- `GET /api/suppliers/:id` - Get a single supplier
- `PUT /api/suppliers/:id` - Update a supplier
- `DELETE /api/suppliers/:id` - Delete a supplier

### Stock Movements
- `GET /api/stock-movements` - Get all stock movements
- `POST /api/stock-movements` - Create a new stock movement
- `GET /api/stock-movements/:id` - Get a single stock movement

### Reports
- `GET /api/reports/inventory` - Get inventory reports
- `GET /api/reports/movements` - Get stock movement reports

### Dashboard
- `GET /api/dashboard/summary` - Get dashboard summary
- `GET /api/dashboard/low-stock` - Get low stock items

### Chatbot
- `POST /api/chat/query` - Process natural language query
- `GET /api/chat/history` - Get query history
- `DELETE /api/chat/history` - Clear query history

### Settings
- `GET /api/settings` - Get application settings
- `PUT /api/settings` - Update application settings

### Audit Logs
- `GET /api/audit-logs` - Get audit logs

## Usage

1. Start the backend server
```bash
cd backend
npm run dev
```

2. Start the frontend development server
```bash
cd frontend
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## License

MIT License

Copyright (c) 2025 Hicham El Farouki

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
