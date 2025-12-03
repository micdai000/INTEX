# AWS Deployment Guide - Ella Rises

This guide walks through deploying the Ella Rises application to AWS with RDS PostgreSQL.

---

## Pre-Deployment Checklist

- [ ] AWS account with appropriate permissions
- [ ] RDS PostgreSQL instance created
- [ ] Database created and populated
- [ ] Environment variables configured
- [ ] Pipeline tested

---

## Step 1: Create RDS PostgreSQL Instance

1. **Go to AWS Console** → RDS → Create Database

2. **Configuration:**
   - Engine: PostgreSQL
   - Version: 13+ recommended
   - Template: Free tier (for testing) or Production
   - DB Instance Identifier: `ella-rises-db` (or your choice)
   - Master Username: `postgres` (or your choice)
   - Master Password: **Save this securely!**

3. **Instance Settings:**
   - DB Instance Class: `db.t3.micro` (free tier) or larger
   - Storage: 20 GB (minimum)

4. **Connectivity:**
   - VPC: Default or your VPC
   - Public Access: **Yes** (if connecting from pgAdmin locally)
   - VPC Security Group: Create new or use existing

5. **Security Group Rules:**
   - Add inbound rule: PostgreSQL (port 5432) from your IP or `0.0.0.0/0` (less secure)

6. **Additional Configuration:**
   - Initial Database Name: `ellaRisesData`
   - (If you skip this, you'll create it manually in Step 2)

7. **Create Database** and wait for it to become "Available" (5-10 minutes)

8. **Save your endpoint** - looks like: `ella-rises-db.xxxxxxxxxxxx.us-east-1.rds.amazonaws.com`

---

## Step 2: Set Up Database in pgAdmin

### Connect to RDS:

1. **Open pgAdmin** → Right-click "Servers" → "Register" → "Server"

2. **General Tab:**
   - Name: `Ella Rises RDS` (any name)

3. **Connection Tab:**
   - Host: `your-rds-endpoint.rds.amazonaws.com`
   - Port: `5432`
   - Maintenance Database: `postgres`
   - Username: Your master username
   - Password: Your master password
   - Save Password: Yes

4. **Save** and connect

### Create Database (if not created during RDS setup):

1. Right-click "Databases" → "Create" → "Database"
2. Name: `ellaRisesData`
3. Save

### Run the SQL Script:

1. **Expand** Databases → Right-click `ellaRisesData` → "Query Tool"
2. **Verify** you see `ellaRisesData` in the query tool tab (NOT `postgres`)
3. **Open** `references/ella_rises_database_with_users.sql`
4. **Copy** entire contents and paste into query tool
5. **Execute** (F5 or play button)
6. **Verify** no errors - should see row counts for each table

### Verify Data:

Run this query to confirm:
```sql
SELECT 'person' AS table_name, COUNT(*) FROM person
UNION ALL SELECT 'event', COUNT(*) FROM event
UNION ALL SELECT 'app_user', COUNT(*) FROM app_user
UNION ALL SELECT 'donation', COUNT(*) FROM donation;
```

Expected: ~1176 persons, 15 events, 2 app_users, 767 donations

---

## Step 3: Configure Environment Variables

### For Local Development (.env file):

```env
# Database
DB_HOST=your-rds-endpoint.rds.amazonaws.com
DB_PORT=5432
DB_NAME=ellaRisesData
DB_USER=your-master-username
DB_PASSWORD=your-master-password

# Session
SESSION_SECRET=your-random-secret-string-here

# Email (for contact form)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
ADMIN_EMAIL=admin-email@example.com

# Environment
NODE_ENV=production
PORT=3000
```

### For AWS (Environment Variables in your deployment):

Set these same variables in your AWS environment:
- **Elastic Beanstalk:** Configuration → Software → Environment Properties
- **ECS:** Task Definition → Environment Variables
- **EC2:** Set in your deployment script or use AWS Secrets Manager

**IMPORTANT:** Never commit `.env` to git! It's in `.gitignore`.

---

## Step 4: Pre-Push Checklist

Before pushing to main:

- [ ] **Database is populated** - Ran SQL script successfully
- [ ] **Test locally with RDS** - Update local `.env` to point to RDS, test the app
- [ ] **Environment variables set in AWS** - All variables from Step 3
- [ ] **Security group allows connections** - From your EC2/Elastic Beanstalk instances
- [ ] **No secrets in code** - Check no hardcoded passwords/keys

### Test Locally with RDS:

```bash
# Update .env with RDS credentials, then:
npm run dev

# Test these:
# - Homepage loads
# - Login works (admin@test.com / password)
# - Dashboard shows correct counts
# - Can view participants, events, etc.
```

---

## Step 5: Push to Deploy

```bash
git add .
git commit -m "Ready for production deployment"
git push origin main
```

Your pipeline will handle the rest!

---

## Post-Deployment Verification

After deployment completes:

1. **Visit your AWS URL**
2. **Test login:** `admin@test.com` / `password`
3. **Verify data loads** in dashboard
4. **Test contact form** (if email configured)
5. **Test as common user:** `user@test.com` / `password`

---

## Troubleshooting

### "Connection refused" to RDS
- Check security group allows inbound on port 5432
- Verify RDS is publicly accessible (if connecting externally)
- Confirm endpoint URL is correct

### "Password authentication failed"
- Double-check username/password
- Ensure you're using the master credentials

### "Database does not exist"
- Make sure you created `ellaRisesData` database
- Check you're connecting to the right database in your app

### "relation does not exist" (table not found)
- SQL script may not have run completely
- Re-run the script on the correct database

### App works locally but not on AWS
- Environment variables not set in AWS
- Security group blocking EC2 → RDS connection
- Check CloudWatch logs for errors

---

## Test User Credentials

| Email | Password | Role | Access |
|-------|----------|------|--------|
| admin@test.com | password | manager | Full access, can edit/delete |
| user@test.com | password | common | View only, no Users tab |

---

## Security Reminders

- [ ] Change test user passwords before going live
- [ ] Restrict RDS security group to only necessary IPs
- [ ] Use AWS Secrets Manager for production credentials
- [ ] Enable SSL for database connections
- [ ] Set `NODE_ENV=production` in AWS

---

## Files Reference

| File | Purpose |
|------|---------|
| `references/ella_rises_database_with_users.sql` | Full database script with app_user table |
| `references/ella_rises_database.sql` | Original database script (backup) |
| `.env.example` | Template for environment variables |
| `scripts/app_user_setup.sql` | Standalone app_user setup (if needed separately) |
