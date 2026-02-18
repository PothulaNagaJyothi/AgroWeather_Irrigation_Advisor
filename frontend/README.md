# AgroWeather Irrigation Advisor — Frontend

Modern, responsive React frontend using Vite and industry-standard practices.

## Features

- **User Authentication**: Secure Login and Signup pages with JWT handling
- **Responsive Design**: Mobile-first layout with hamburger menu and adaptable grids
- **Smart Dashboard**: Location-based weather forecasts and latest irrigation advice
- **Interactive Forms**: Farm input with location presets and validation
- **History Tracking**: detailed decision logs with reasoning and priority
- **Loading & Error States**: Comprehensive UX for all states

## Setup

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## Build for Production

```bash
npm run build
npm run preview
```

## Deployment

### Render.com
- **Runtime**: Static Site
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`
- **SPA Rewrite**: All routes redirect to `index.html` (defined in `render.yaml`).

### Environment Variables

The app automatically handles Render's internal hostnames.
- `VITE_API_BASE`: URL of the backend API.
  - If set to an internal name like `agroweather-backend`, the app automatically appends `.onrender.com` to make it a valid public URL.

**Local Development:**
Create a `.env` file:
```
VITE_API_BASE=http://localhost:4000/api
```

## Project Structure

- `src/pages/` - Application pages (Home, Login, Signup, FarmInput, Dashboard, History)
- `src/components/` - Reusable UI (DecisionDashboard, ProtectedRoute, Navbar)
- `src/api/` - Backend integration (apiClient, authService)
- `src/styles/` - Global CSS with design system
- `index.html` - HTML entry point

## Technologies

- **React 18** - UI library
- **React Router 6** - Client-side routing
- **Vite** - Modern build tool
- **Axios** - HTTP client
- **CSS3** - Modern styling with Flexbox & Grid

## Design System

The app uses a cohesive design system with:

- **Color Palette**: Agricultural greens, water blues, and neutral grays
- **Typography**: System font stack for optimal readability
- **Spacing & Layout**: Consistent 8px grid spacing
- **Components**: Reusable cards, buttons, badges, and forms
- **Responsive**: Mobile-first design with breakpoints

## Notes

- No hard-coded API URLs; uses `VITE_API_BASE` from environment
- Clean separation of concerns: no business logic in UI
- Accessibility-focused: proper contrast, focus states, semantic HTML
