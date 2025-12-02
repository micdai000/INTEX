# Provo Student Housing Swap

A platform for BYU and UVU students to buy and sell housing contracts in Provo, Utah.

## Technologies

This project is built with:

- Node.js
- Express.js
- EJS (Embedded JavaScript Templates)
- PostgreSQL
- Tailwind CSS
- JavaScript

## Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Database
Create a PostgreSQL database and run the schema:
```bash
createdb provo_crib_connect
psql -d provo_crib_connect -f database-schema.sql
```

### 3. Configure Environment
Create a `.env` file (see `.env.example` for template):
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=provo_crib_connect
DB_USER=postgres
DB_PASSWORD=your_password
SESSION_SECRET=your-secret-key-here
PORT=3000
```

### 4. Run the Server
```bash
npm start
```
Or for development with auto-reload:
```bash
npm run dev
```

### 5. Open in Browser
Navigate to `http://localhost:3000`

For detailed setup instructions, see [SETUP.md](./SETUP.md)

## Features

- User authentication (login/register)
- Browse housing listings
- Create and manage listings
- Search and filter listings
- User dashboard
- Contact sellers
