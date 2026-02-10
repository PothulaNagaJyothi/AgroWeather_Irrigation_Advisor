# AgroWeather Irrigation Advisor — Backend

Production-ready Node.js + Express API server with SQLite database integration.

## Features

- **RESTful API** with clean routing structure
- **Rule-based decision engine** for irrigation recommendations
- **Weather integration** with Open-Meteo API (no API key required)
- **SQL database** for persistent storage using sql.js (WASM)
- **Input validation** using Joi
- **Centralized error handling**
- **Service-oriented architecture** for scalability

## Setup

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm

### Installation

```bash
npm install
```

### Database Initialization

```bash
npm run init-db
```

This creates the SQLite database at `database/agroweather.db` with the required tables.

### Start Development Server

```bash
npm run dev
```

Server runs on `http://localhost:4000` by default.

### Start Production Server

```bash
npm start
```

## API Endpoints
  
### 1. Authentication

#### Sign Up
**POST** `/api/auth/signup`

Body:
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

#### Log In
**POST** `/api/auth/login`

Body:
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

Response (for both):
```json
{
  "user": { "id": 1, "email": "user@example.com" },
  "token": "eyJhbGciOiJIUzI1NiIsInR..."
}
```

> **Note:** All subsequent endpoints require the `Authorization` header: `Bearer <token>`

### 2. Create Farm & Get Irrigation Decision

**POST** `/api/farm`

Request body:
```json
{
  "name": "North Field",
  "location_lat": 12.9716,
  "location_lon": 77.5946,
  "crop_type": "Maize",
  "soil_type": "loamy",
  "field_size_ha": 5
}
```

Response:
```json
{
  "farm": {
    "id": 1,
    "name": "North Field",
    "location_lat": 12.9716,
    "location_lon": 77.5946,
    "crop_type": "Maize",
    "soil_type": "loamy",
    "field_size_ha": 5,
    "created_at": "2026-02-10T12:00:00"
  },
  "decision": {
    "decision": "start",
    "reason": "Low forecast rain (0.0mm) with avg temp 25.0°C and soil retention factor 1.0.",
    "priority": "high",
    "meta": {
      "totalPrecip": 0,
      "avgTemp": 25,
      "cropDemand": "high",
      "soilFactor": 1
    }
  }
}
```

**Validation Rules:**
- `location_lat` (required): number
- `location_lon` (required): number
- `crop_type` (required): string
- `soil_type` (required): one of "sandy", "loamy", "clay"
- `field_size_ha` (required): number >= 0.01
- `name` (optional): string

### 2. Get Weather Forecast

**GET** `/api/weather/forecast?lat=12.9716&lon=77.5946`

Query parameters:
- `lat` (required): latitude in decimal degrees
- `lon` (required): longitude in decimal degrees

Response:
```json
{
  "data": {
    "latitude": 13,
    "longitude": 77.625,
    "timezone": "GMT",
    "hourly": {
      "time": ["2026-02-10T00:00", "2026-02-10T01:00", ...],
      "temperature_2m": [16, 15.5, 15.6, ...],
      "precipitation": [0, 0, 0, ...]
    }
  }
}
```

### 3. Get Irrigation History

**GET** `/api/history`

Response:
```json
{
  "history": [
    {
      "id": 1,
      "farm_id": 1,
      "farm_name": "North Field",
      "decision": "start",
      "reason": "Low forecast rain...",
      "priority": "high",
      "created_at": "2026-02-10T12:00:00"
    }
  ]
}
```

## Project Structure

```
src/
├── config/
│   └── index.js              # Configuration constants
├── controllers/
│   ├── farmController.js     # Farm and decision endpoints
│   ├── weatherController.js  # Weather forecast endpoints
│   └── historyController.js  # History endpoints
├── services/
│   ├── farmService.js        # Farm data operations
│   ├── weatherService.js     # Weather API integration
│   ├── historyService.js     # History queries
│   └── decisionService.js    # Irrigation decision logic
├── routes/
│   ├── index.js              # Main router
│   ├── farm.js               # Farm routes
│   ├── weather.js            # Weather routes
│   └── history.js            # History routes
├── middlewares/
│   ├── errorHandler.js       # Centralized error handling
│   └── validate.js           # Input validation
├── utils/
│   └── db.js                 # Database wrapper
├── database/
│   └── init.js               # Database initialization/migrations
├── app.js                    # Express application
└── server.js                 # Server entry point

database/
└── agroweather.db            # SQLite database file (created by init-db)
```

## Decision Engine Logic

The irrigation advisor uses a rule-based system:

1. **Rainfall Assessment** (48-hour forecast)
   - If total precipitation > 5mm → `POSTPONE`
   - Reasoning: Sufficient natural moisture, delay irrigation

2. **Temperature & Soil Evaluation**
   - If no significant rain AND avg temp > 30°C → `START`
   - If no significant rain AND high crop demand with low soil retention → `START`
   - Otherwise → `MONITOR`

3. **Priority Calculation**
   - `HIGH`: High crop demand (rice, maize) OR field size > 10ha
   - `MEDIUM`: Medium crop demand (wheat, soy)
   - `LOW`: Low crop demand with favorable conditions

## Example Usage

### cURL Example

```bash
# Create farm and get recommendation
curl -X POST http://localhost:4000/api/farm \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Farm",
    "location_lat": 12.9716,
    "location_lon": 77.5946,
    "crop_type": "Maize",
    "soil_type": "loamy",
    "field_size_ha": 5
  }'

# Get weather forecast
curl "http://localhost:4000/api/weather/forecast?lat=12.9716&lon=77.5946"

# Get history
curl http://localhost:4000/api/history
```

## Environment Variables

Create `.env` file in the backend directory:

```
PORT=4000
SQLITE_FILE=./database/agroweather.db
```

## Error Handling

All errors return consistent JSON responses:

```json
{
  "error": "Error message describing what went wrong"
}
```

HTTP Status Codes:
- `200`: Success
- `400`: Bad request (validation error)
- `404`: Not found
- `500`: Server error

## Database Schema

### users
Stores user credentials and profile data.

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### farm_details
Stores farm configuration...

```sql
CREATE TABLE farm_details (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  location_lat REAL NOT NULL,
  location_lon REAL NOT NULL,
  crop_type TEXT NOT NULL,
  soil_type TEXT NOT NULL,
  field_size_ha REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### weather_data
Caches weather forecast data to reduce API calls.

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
Tracks all irrigation recommendations made.

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

## Technologies

- **Express**: Web framework
- **sql.js**: SQLite in WebAssembly
- **Axios**: HTTP client for Open-Meteo API
- **Joi**: Data validation
- **Nodemon**: Development auto-reload

## Code Quality

- ✅ Separation of concerns (controllers, services, models)
- ✅ Input validation on all endpoints
- ✅ Comprehensive error handling
- ✅ Descriptive routing structure
- ✅ Reusable service functions
- ✅ Database abstraction layer

## Testing

To test the API manually:

1. Start the server: `npm run dev`
2. Use cURL, Postman, or the frontend to make requests
3. Check `database/agroweather.db` to verify data persistence

## Troubleshooting

### Database not initializing
```bash
npm run init-db
```

### Port already in use
Change PORT in `.env` and restart server

### Database locked
This is rare with sql.js. Restart the server if it occurs.

## Performance Notes

- Forecast data is cached in the database to minimize Open-Meteo API calls
- sql.js is loaded into memory, so restart rebuilds the database from disk
- Decision engine is synchronous and optimized for low latency

## Production Deployment

For production, consider:

1. Using a persistent database (PostgreSQL, MariaDB)
2. Adding request logging and monitoring
3. Implementing rate limiting
4. Using environment-based configuration
5. Setting up CI/CD pipeline
6. Adding API documentation (Swagger/OpenAPI)

## License

MIT

---

Questions or improvements? Open an issue on GitHub!
