# Ella Rises Frontend - Integration Guide

This React frontend is ready to connect to your Node/Express backend for the Ella Rises project.

## Quick Start

1. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Update `VITE_API_URL` in `.env` to point to your Node backend (default: http://localhost:3000)

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

## Backend Integration

### API Endpoints Expected

The frontend is configured to call these endpoints on your Node/Express backend:

#### Authentication
- `POST /auth/register` - Create new user account
  - Body: `{ email, password, username }`
  - Returns: User session (set via cookie)

- `POST /auth/login` - User login
  - Body: `{ email, password }`
  - Returns: User session (set via cookie)

- `POST /auth/logout` - User logout
  - Clears session cookie

#### Data Management (TODO: Implement these in your backend)
- `GET /api/participants` - Fetch all participants
- `POST /api/participants` - Create new participant
- `PUT /api/participants/:id` - Update participant
- `DELETE /api/participants/:id` - Delete participant

- `GET /api/events` - Fetch all events
- `POST /api/events` - Create new event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

- `GET /api/surveys` - Fetch survey responses
- `POST /api/surveys` - Submit survey response

- `GET /api/milestones` - Fetch milestones
- `POST /api/milestones` - Create milestone

- `GET /api/analytics` - Fetch analytics data for dashboard

### CORS Configuration

Make sure your Express backend has CORS configured to accept requests from your frontend:

\`\`\`javascript
import cors from 'cors';

app.use(cors({
  origin: 'http://localhost:8080', // Your Vite dev server
  credentials: true, // Important for cookies/sessions
}));
\`\`\`

### Session/Cookie Configuration

The frontend expects session-based authentication. Your Express session should be configured like:

\`\`\`javascript
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax',
  },
}));
\`\`\`

## Features Implemented

### ✅ Completed
- Landing page with Ella Rises branding
- User authentication UI (login/register)
- Dashboard layout with tabs
- Responsive design with Ella Rises color scheme
- Beautiful design system matching the brand

### 🔄 Ready for Backend Connection
- Participant management page (needs API integration)
- Event management page (needs API integration)
- Analytics dashboard (needs API integration)
- Survey system (needs implementation)
- Milestone tracking (needs implementation)

## Deployment to AWS

### Frontend (React App)
You can deploy the React frontend to:
1. **AWS S3 + CloudFront** (static hosting)
2. **AWS Amplify** (easiest option)
3. **Elastic Beanstalk** (if you want a more traditional server setup)

Build the production bundle:
\`\`\`bash
npm run build
\`\`\`

The `dist` folder contains your static assets ready for deployment.

### Environment Variables for Production
Update `.env.production` or set in your AWS deployment:
\`\`\`
VITE_API_URL=https://your-backend-domain.com
\`\`\`

## Design System

The app uses Ella Rises' brand colors:
- **Primary Coral**: `#E57A7A` - Main brand color
- **Soft Peach**: `#F5D4C1` - Secondary backgrounds
- **Warm Pink**: `#F09CA4` - Accent elements
- **Ella Charcoal**: `#333333` - Text and dark elements

All colors are defined in `src/index.css` and `tailwind.config.ts` using HSL format for easy theming.

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **shadcn/ui** for component library
- **React Router** for navigation
- **Lucide React** for icons

## Next Steps

1. Connect the authentication pages to your Node backend
2. Implement the participant management CRUD operations
3. Implement the event management system
4. Build the analytics dashboard with real data
5. Add the survey and milestone features
6. Deploy both frontend and backend to AWS
7. Configure custom domain and HTTPS

## Questions?

Refer to the reference files you provided:
- `routes/auth.js` - Authentication implementation
- `routes/index.js` - Dashboard routes
- `routes/listings.js` - CRUD operations example
- `config/database.js` - Database connection setup

Good luck with your INTEX presentation! 🚀
