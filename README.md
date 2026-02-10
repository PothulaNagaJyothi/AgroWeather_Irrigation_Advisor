# AgroWeather Irrigation Advisor

A full-stack web application that helps farmers make intelligent irrigation scheduling decisions using real-time weather forecasts, soil properties, and crop requirements.

## 🌾 Overview

**AgroWeather Irrigation Advisor** is a decision-support system for agricultural water management. It integrates:

- **Real-time weather data** from the Open-Meteo API (no API key required)
- **User Authentication** (Signup/Login) with secure JWT and password hashing
- **Rule-based decision engine** considering temperature, rainfall, crop type, soil type, and field size
- **Interactive Dashboard** with location-based weather forecasts and latest advice
- **Explainable recommendations** with detailed reasoning and priority levels
- **History tracking** of all irrigation decisions
- **Responsive Design** for desktop, tablet, and mobile devices

## 🏗️ Architecture

The application follows a **three-tier architecture**:

### Presentation Layer (React)
- Modern, responsive UI with Vite
- Pages: Home, Farm Input, Dashboard, Weather Forecast, History
- Component-based architecture with clean separation of concerns

### Application Layer (Node.js + Express)
- RESTful API endpoints
- Controllers for request handling
- Services for business logic (decision engine, weather service, auth)
- Input validation with Joi
- **JWT Authentication middleware** for route protection
- Centralized error handling

### Data Layer (SQLite)
- Relational schema with four tables: `users`, `farm_details`, `weather_data`, `irrigation_history`
- Persistent storage of user profiles, farm configurations, and decisions
- Uses sql.js (WASM) for browser-compatible database

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm or yarn

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Initialize database
npm run init-db

# Start development server
npm run dev
```

Backend runs on `http://localhost:4000` by default.

### Frontend Setup (new terminal)

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs on `http://localhost:5173` by default.

### Access the Application

1. Open your browser to `http://localhost:5173`
2. **Sign Up** for a new account or **Log In** if you already have one
3. Use the **Farm Input** page to submit your field details and get irrigation recommendations
4. Check **Dashboard** for weather forecasts and your latest advice
5. Review **History** for past irrigation decisions

## 📖 API Documentation

### Endpoints

#### Create Farm & Get Recommendation
```
POST /api/farm
Content-Type: application/json

{
  "name": "North Field",
  "location_name": "Punjab (Ludhiana)",
  "location_lat": 30.9010,
  "location_lon": 75.8573,
  "crop_type": "Maize",
  "soil_type": "loamy",
  "field_size_ha": 5
}

Response:
{
  "farm": { id, name, location_lat, location_lon, crop_type, soil_type, field_size_ha, created_at },
  "decision": {
    "decision": "start|postpone|monitor",
    "reason": "Human-readable explanation",
    "priority": "high|medium|low",
    "meta": { totalPrecip, avgTemp, cropDemand, soilFactor }
  }
}
```

#### Get Weather Forecast
```
GET /api/weather/forecast?lat=12.9716&lon=77.5946

Response:
{
  "data": {
    "latitude": 13,
    "longitude": 77.625,
    "timezone": "GMT",
    "hourly": {
      "time": [...],
      "temperature_2m": [...],
      "precipitation": [...]
    }
  }
}
```

#### List Irrigation History
```
GET /api/history

Response:
{
  "history": [
    { id, farm_id, farm_name, decision, reason, priority, created_at },
    ...
  ]
}
```

## 🎯 Decision Engine Rules

The irrigation advisor uses rule-based logic:

1. **Rainfall Check**: If forecast rainfall (48h) > 5mm → `postpone`
2. **Temperature Check**: If avg temp > 30°C → consider `start`
3. **Soil Retention**: Adjust based on soil water retention capacity
4. **Crop Demand**: High-demand crops (rice, maize, sugarcane) increase priority
5. **Field Size**: Larger fields get higher priority for water management

All decisions include explainable reasoning for farmer understanding.

## 📁 Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── middlewares/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   ├── database/
│   ├── package.json
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── FarmInput.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── History.jsx
│   │   ├── api/
│   │   │   └── apiClient.js
│   │   ├── styles/
│   │   │   └── global.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── README.md
│
└── README.md (this file)
```

## 🎨 Design & UX

### Design System
- **Colors**: Agricultural greens (#4a7c3e), water blues (#1e88e5), neutral grays
- **Typography**: System font stack for readability
- **Spacing**: 8px grid system
- **Shadows**: Subtle elevation for depth

### Pages

**Home**
- Hero section with application pitch
- Feature highlights with icons
- Call-to-action button

**Farm Input**
- Simple, user-friendly form centered on screen
- Location dropdown with 15+ popular farming regions (no lat/lon confusion)
- Crop, soil, and field size dropdowns
- Real-time decision display with status badge and priority indicator
- Decision reasoning and metadata
- Mobile-responsive layout

**Dashboard**
- Weather forecast display
- Temperature and precipitation cards
- Hourly forecast grid with weather icons
- Summary statistics

**History**
- Summary metrics (total decisions, counts by type)
- Clean table with sorting
- Decision badges with color coding
- Priority indicators

## 🔧 Configuration

### Backend Environment Variables

Create `.env` in the `backend/` directory:

```
PORT=4000
SQLITE_FILE=./database/agroweather.db
```

### Frontend Environment Variables

Create `.env` in the `frontend/` directory:

```
VITE_API_BASE=http://localhost:4000/api
```

## 📊 Database Schema

### farm_details
```sql
CREATE TABLE farm_details (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT,
  location_name TEXT,
  location_lat REAL NOT NULL,
  location_lon REAL NOT NULL,
  crop_type TEXT NOT NULL,
  soil_type TEXT NOT NULL,
  field_size_ha REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### weather_data
```sql
CREATE TABLE weather_data (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lat REAL NOT NULL,
  lon REAL NOT NULL,
  fetched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  data TEXT NOT NULL
);
```

### irrigation_history
```sql
CREATE TABLE irrigation_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  farm_id INTEGER NOT NULL,
  decision TEXT NOT NULL,
  reason TEXT NOT NULL,
  priority TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(farm_id) REFERENCES farm_details(id) ON DELETE CASCADE
);
```

### users
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🛠️ Development

### Tech Stack

**Backend**
- Node.js 18+
- Express 4.x
- sql.js (SQLite WASM)
- Axios (HTTP client)
- Joi (validation)
- JWT (jsonwebtoken) - Authentication
- bcryptjs - Password hashing

**Frontend**
- React 18
- React Router 6
- Vite 5.2
- Axios with interceptors
- CSS3 (Flexbox, Grid)
- localStorage - Token storage
- Protected routes

### Scripts

**Backend**
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run init-db` - Initialize/reset database

**Frontend**
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 📋 Code Quality

- ✅ Clean, modular code with separation of concerns
- ✅ Consistent naming conventions
- ✅ No duplicated logic
- ✅ Reusable components
- ✅ Error handling at all layers
- ✅ Input validation
- ✅ Responsive design
- ✅ Accessibility basics (contrast, focus states)


**Happy Farming! 🌾** Let AgroWeather help you make smarter irrigation decisions.
