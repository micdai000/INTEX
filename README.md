# Ella Rises - INTEX Project

A comprehensive web application for the Ella Rises organization, designed to manage participants, events, surveys, milestones, and donations for their women's STEAM empowerment programs.

## Project Information

**Project**: IS 402/403/404/415 INTEX - Fall 2025
**Organization**: Ella Rises (https://www.ellarises.org/)
**Deployment**: AWS Elastic Beanstalk with RDS PostgreSQL

---

## Demo Credentials

### Manager Account (Full Access)
- **Email**: `admin@test.com`
- **Password**: `password`

### Common User Account (Read-Only Access)
- **Email**: `user@test.com`
- **Password**: `password`

---

## Features

### Public Pages
- Landing page with event countdown
- About page
- Programs/Workshops information
- Contact form
- Public donation form

### Authenticated Features
- **Dashboard**: Statistics overview with embedded Tableau visualization
- **Participants**: Full CRUD management with milestone tracking
- **Events**: Event and occurrence management
- **Surveys**: Post-event survey collection and analysis
- **Milestones**: Achievement tracking for participants
- **Donations**: Donation record management
- **Users**: User account management (managers only)

### User Roles
| Role | Permissions |
|------|-------------|
| Manager | Full CRUD access to all data, user management |
| Common | Read-only access to view data |

---

## Technology Stack

- **Backend**: Node.js with Express.js
- **Templating**: EJS (Embedded JavaScript)
- **Database**: PostgreSQL
- **Authentication**: Session-based with bcrypt password hashing
- **Deployment**: AWS Elastic Beanstalk
- **Database Hosting**: AWS RDS
- **Analytics**: Embedded Tableau Dashboard

### Key Packages
- express
- ejs
- pg (PostgreSQL client)
- express-session
- bcrypt (password encryption)
- connect-flash
- nodemailer

---

## Local Development Setup

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- npm package manager

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd intex

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run database setup
psql -U postgres -d ella_rises -f scripts/setup-auth.sql

# Seed admin user
node scripts/seed-user.js

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file with the following:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ella_rises
DB_USER=postgres
DB_PASSWORD=your_password

# Session Configuration
SESSION_SECRET=your_secret_key

# Production Settings (AWS)
NODE_ENV=production
FORCE_HTTPS=true

# Email Configuration (for contact form)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
ADMIN_EMAIL=admin@ellarises.org
```

---

## Project Structure

```
intex/
├── config/
│   └── database.js         # PostgreSQL connection pool
├── middleware/
│   └── auth.js             # Authentication middleware
├── routes/
│   ├── auth.js             # Login/logout/signup
│   ├── contact.js          # Contact form
│   ├── donations.js        # Donation CRUD
│   ├── events.js           # Event & occurrence CRUD
│   ├── index.js            # Landing, dashboard, about
│   ├── milestones.js       # Milestone CRUD
│   ├── participants.js     # Participant CRUD
│   ├── surveys.js          # Survey CRUD
│   └── users.js            # User management
├── views/
│   ├── auth/               # Login/signup views
│   ├── donations/          # Donation views
│   ├── events/             # Event views
│   ├── milestones/         # Milestone views
│   ├── participants/       # Participant views
│   ├── partials/           # Header/footer
│   ├── surveys/            # Survey views
│   ├── users/              # User management views
│   ├── layout.ejs          # Main layout
│   └── *.ejs               # Page views
├── public/
│   ├── css/
│   │   └── style.css       # Main stylesheet
│   └── images/             # Static images
├── scripts/
│   ├── seed-user.js        # Create admin user
│   └── setup-auth.sql      # Database setup
├── server.js               # Express server entry point
└── package.json
```

---

## API Routes

### Authentication
| Method | Route | Description |
|--------|-------|-------------|
| GET | /auth/login | Login page |
| POST | /auth/login | Process login |
| GET | /auth/signup | Registration page |
| POST | /auth/signup | Process registration |
| POST | /auth/logout | Logout |

### Participants
| Method | Route | Description |
|--------|-------|-------------|
| GET | /participants | List all |
| GET | /participants/:id | View details |
| GET | /participants/create/new | Create form |
| POST | /participants | Create |
| GET | /participants/:id/edit | Edit form |
| POST | /participants/:id | Update |
| POST | /participants/:id/delete | Delete |

### Events
| Method | Route | Description |
|--------|-------|-------------|
| GET | /events | List all |
| GET | /events/:id | View with occurrences |
| POST | /events/:id/occurrences | Add occurrence |
| POST | /events/:id/occurrences/:oid/delete | Delete occurrence |

### Surveys, Donations, Milestones, Users
Similar CRUD patterns for each entity.

---

## Special Pages

- **HTTP 418**: `/teapot` - Returns "I'm a teapot" status (IS 404 requirement)
- **404 Page**: Custom not found page
- **Error Page**: Graceful error handling

---

## Accessibility Features

- Skip link for keyboard navigation
- ARIA labels on interactive elements
- High contrast color scheme
- Mobile-responsive design
- Alt text on images

---

## Security Features

- bcrypt password hashing (salt rounds: 10)
- Session-based authentication
- HTTP-only cookies
- CSRF protection via SameSite cookies
- SQL injection prevention via parameterized queries
- XSS prevention via EJS escaping

---

## Deployment

The application is deployed on AWS Elastic Beanstalk:
1. Database hosted on AWS RDS PostgreSQL
2. Custom domain configuration
3. HTTPS enabled via AWS Certificate Manager
4. Environment variables managed through EB console

---

## Files to Remove Before Submission

The `TO_REMOVE/` directory contains reference files and unused code that should be deleted before final deployment:
- references/ (project documentation, old code)
- src/ (unused CSS files)
- branding/ (design reference)

---

## Credits

- **Organization**: Ella Rises
- **Framework**: Express.js
- **Analytics**: Tableau Public
- **Icons**: Heroicons (SVG)
- **Fonts**: Montserrat (Google Fonts)

---

## License

This project was created for educational purposes as part of the BYU Information Systems INTEX program.
