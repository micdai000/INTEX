# Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

This will also automatically build the Tailwind CSS (via the `postinstall` script).

### 2. Set Up Database

1. Make sure PostgreSQL is running on your machine
2. Create a database:
   ```sql
   CREATE DATABASE provo_crib_connect;
   ```
3. Run the schema:
   ```bash
   psql -d provo_crib_connect -f database-schema.sql
   ```
   Or if you're already in psql:
   ```sql
   \i database-schema.sql
   ```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=provo_crib_connect
DB_USER=postgres
DB_PASSWORD=your_password_here
SESSION_SECRET=your-secret-key-change-this-in-production
PORT=3000
NODE_ENV=development
```

### 4. Run the Server

**Option 1: Using npm start (recommended)**
```bash
npm start
```

**Option 2: Using node directly**
```bash
node server.js
```

**Option 3: Development mode with auto-reload**
```bash
npm run dev
```

### 5. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## Troubleshooting

### Database Connection Issues
- Make sure PostgreSQL is running: `pg_isready` or check your PostgreSQL service
- Verify your database credentials in the `.env` file
- Check that the database exists: `psql -l`

### CSS Not Loading
- Make sure Tailwind CSS is built: `npm run build:css`
- Check that `public/css/style.css` exists
- For development with auto-rebuild: `npm run build:css:watch` (in a separate terminal)

### Port Already in Use
- Change the PORT in your `.env` file
- Or kill the process using port 3000:
  ```bash
  lsof -ti:3000 | xargs kill -9
  ```

### Module Not Found Errors
- Make sure all dependencies are installed: `npm install`
- Delete `node_modules` and `package-lock.json`, then run `npm install` again

## Development Commands

- `npm start` - Start the server
- `npm run dev` - Start with auto-reload (requires Node.js 18+)
- `npm run build:css` - Build Tailwind CSS once
- `npm run build:css:watch` - Watch and rebuild CSS on changes

