# Setup Documentation

## Overview

This document provides comprehensive setup instructions for the Kislap backend, including installation, configuration, database setup, and deployment.

## Prerequisites

### System Requirements

-   **Node.js**: Version 16 or higher
-   **PostgreSQL**: Version 12 or higher
-   **npm**: Version 8 or higher
-   **Git**: For version control

### Development Tools

-   **Code Editor**: VS Code, Sublime Text, or similar
-   **API Testing**: Postman, Insomnia, or curl
-   **Database Client**: pgAdmin, DBeaver, or similar

## Installation

### 1. Clone Repository

```bash
git clone <repository-url>
cd kislap-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy the environment template:

```bash
cp env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/kislap_db"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:3000/auth/google/callback"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Session
SESSION_SECRET="your-session-secret-key"

# Server
PORT=3000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:3001"

# Admin Access (comma-separated emails)
ADMIN_EMAILS="admin@example.com,superadmin@example.com"
```

## Database Setup

### 1. PostgreSQL Installation

#### Ubuntu/Debian

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

#### macOS (Homebrew)

```bash
brew install postgresql
brew services start postgresql
```

#### Windows

Download and install from [PostgreSQL official website](https://www.postgresql.org/download/windows/)

### 2. Create Database

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE kislap_db;
CREATE USER kislap_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE kislap_db TO kislap_user;
\q
```

### 3. Database Migration

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with sample data
npm run db:seed
```

## Google OAuth Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable billing (required for OAuth)

### 2. Enable APIs

1. Go to **APIs & Services** > **Library**
2. Search for and enable:
    - **Google+ API**
    - **Google OAuth2 API**

### 3. Create OAuth Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client IDs**
3. Choose **Web application**
4. Configure authorized redirect URIs:
    - Development: `http://localhost:3000/auth/google/callback`
    - Production: `https://yourdomain.com/auth/google/callback`

### 4. Update Environment Variables

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
```

## Development Setup

### 1. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3000`

### 2. Verify Installation

Test the health endpoint:

```bash
curl http://localhost:3000/health
```

Expected response:

```json
{
    "status": "OK",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "environment": "development"
}
```

### 3. Test Sample Data

Test with seeded data:

```bash
# Test claimed card
curl http://localhost:3000/profile/550e8400-e29b-41d4-a716-446655440000

# Test unclaimed card (use UUID from seed output)
curl http://localhost:3000/profile/<unclaimed-uuid>
```

## Available Scripts

### Development Scripts

```bash
# Start development server with nodemon
npm run dev

# Start production server
npm start

# Generate Prisma client
npm run db:generate

# Push schema changes to database
npm run db:push

# Run database migrations
npm run db:migrate

# Open Prisma Studio (database GUI)
npm run db:studio

# Seed database with sample data
npm run db:seed
```

### Database Management

```bash
# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Create new migration
npx prisma migrate dev --name migration_name

# Deploy migrations to production
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

## Configuration

### Environment Variables

| Variable               | Description                  | Required | Default     |
| ---------------------- | ---------------------------- | -------- | ----------- |
| `DATABASE_URL`         | PostgreSQL connection string | Yes      | -           |
| `GOOGLE_CLIENT_ID`     | Google OAuth client ID       | Yes      | -           |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret   | Yes      | -           |
| `GOOGLE_CALLBACK_URL`  | OAuth callback URL           | Yes      | -           |
| `JWT_SECRET`           | JWT signing secret           | Yes      | -           |
| `SESSION_SECRET`       | Session encryption secret    | Yes      | -           |
| `FRONTEND_URL`         | Frontend application URL     | Yes      | -           |
| `PORT`                 | Server port                  | No       | 3000        |
| `NODE_ENV`             | Environment                  | No       | development |
| `ADMIN_EMAILS`         | Admin email addresses        | No       | -           |

### Database Configuration

#### Connection String Format

```
postgresql://username:password@host:port/database
```

#### Example Configurations

**Local Development**:

```
DATABASE_URL="postgresql://kislap_user:password@localhost:5432/kislap_db"
```

**Production (with SSL)**:

```
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
```

**Docker**:

```
DATABASE_URL="postgresql://postgres:password@postgres:5432/kislap_db"
```

### Security Configuration

#### JWT Configuration

```env
# Generate a secure JWT secret
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
```

Generate a secure secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### Session Configuration

```env
# Generate a secure session secret
SESSION_SECRET="your-session-secret-key"
```

## Testing

### Manual Testing

1. **Health Check**:

    ```bash
    curl http://localhost:3000/health
    ```

2. **Google OAuth Flow**:

    - Visit: `http://localhost:3000/api/auth/google`
    - Complete OAuth flow
    - Verify JWT token generation

3. **Card Operations**:

    ```bash
    # Get user cards (requires JWT token)
    curl -H "Authorization: Bearer <jwt-token>" \
      http://localhost:3000/api/cards/my-cards

    # View public card
    curl http://localhost:3000/profile/550e8400-e29b-41d4-a716-446655440000
    ```

4. **Admin Operations**:
    ```bash
    # Get statistics (requires admin JWT token)
    curl -H "Authorization: Bearer <admin-jwt-token>" \
      http://localhost:3000/api/admin/stats
    ```

### Automated Testing

Create test files in `tests/` directory:

```bash
# Install testing dependencies
npm install --save-dev jest supertest

# Run tests
npm test
```

## Deployment

### Production Environment

#### 1. Environment Variables

```env
NODE_ENV=production
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
GOOGLE_CLIENT_ID="your-production-client-id"
GOOGLE_CLIENT_SECRET="your-production-client-secret"
GOOGLE_CALLBACK_URL="https://yourdomain.com/auth/google/callback"
JWT_SECRET="your-production-jwt-secret"
SESSION_SECRET="your-production-session-secret"
FRONTEND_URL="https://yourdomain.com"
ADMIN_EMAILS="admin@yourdomain.com"
```

#### 2. Database Setup

```bash
# Run migrations
npm run db:migrate

# Generate production client
npm run db:generate
```

#### 3. Process Management

Use PM2 for process management:

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start src/server.js --name kislap-backend

# Monitor
pm2 monit

# Logs
pm2 logs kislap-backend
```

### Docker Deployment

#### 1. Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run db:generate

EXPOSE 3000

CMD ["npm", "start"]
```

#### 2. Docker Compose

```yaml
version: '3.8'
services:
    app:
        build: .
        ports:
            - '3000:3000'
        environment:
            - DATABASE_URL=postgresql://postgres:password@postgres:5432/kislap_db
            - NODE_ENV=production
        depends_on:
            - postgres

    postgres:
        image: postgres:15
        environment:
            - POSTGRES_DB=kislap_db
            - POSTGRES_USER=postgres
            - POSTGRES_PASSWORD=password
        volumes:
            - postgres_data:/var/lib/postgresql/data

volumes:
    postgres_data:
```

#### 3. Build and Run

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f app
```

## Troubleshooting

### Common Issues

#### 1. Database Connection

**Error**: `ECONNREFUSED` or `ENOTFOUND`

**Solution**:

-   Verify PostgreSQL is running
-   Check connection string format
-   Ensure database exists

```bash
# Test connection
psql "postgresql://user:pass@host:5432/db"
```

#### 2. OAuth Errors

**Error**: `Invalid client` or `Redirect URI mismatch`

**Solution**:

-   Verify Google OAuth credentials
-   Check redirect URI configuration
-   Ensure HTTPS in production

#### 3. JWT Token Issues

**Error**: `Invalid token` or `Token expired`

**Solution**:

-   Check `JWT_SECRET` configuration
-   Verify token format in requests
-   Check token expiration

#### 4. CORS Errors

**Error**: `CORS policy` or `Access-Control-Allow-Origin`

**Solution**:

-   Verify `FRONTEND_URL` configuration
-   Check CORS settings in server.js
-   Ensure frontend origin matches

### Debug Mode

Enable debug logging:

```env
NODE_ENV=development
```

This enables:

-   Prisma query logging
-   Detailed error messages
-   Request/response logging

### Logs

View application logs:

```bash
# Development
npm run dev

# Production with PM2
pm2 logs kislap-backend

# Docker
docker-compose logs -f app
```

## Performance Optimization

### Database Optimization

1. **Indexes**: Ensure proper database indexes
2. **Connection Pooling**: Configure Prisma connection limits
3. **Query Optimization**: Use select and include efficiently

### Application Optimization

1. **Rate Limiting**: Adjust limits based on usage
2. **Caching**: Implement Redis for frequently accessed data
3. **Compression**: Enable gzip compression

### Monitoring

1. **Health Checks**: Monitor `/health` endpoint
2. **Database Metrics**: Monitor query performance
3. **Error Tracking**: Implement error monitoring (Sentry, etc.)

## Security Checklist

-   [ ] Change default JWT and session secrets
-   [ ] Configure HTTPS in production
-   [ ] Set up proper CORS origins
-   [ ] Implement rate limiting
-   [ ] Use environment variables for secrets
-   [ ] Regular security updates
-   [ ] Database backups
-   [ ] Monitor for suspicious activity
