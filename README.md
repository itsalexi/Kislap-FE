# Kislap Frontend

A Next.js frontend for the Kislap smart business card system.

## Features

-   Google OAuth authentication
-   View and claim digital business cards
-   Dashboard for managing claimed cards
-   Responsive design with Material-UI

## Prerequisites

-   Node.js 16 or higher
-   Backend server running (see backend documentation)
-   Google OAuth credentials configured

## Setup

1. **Install dependencies**:

    ```bash
    npm install
    ```

2. **Environment configuration** (⚠️ **REQUIRED**):

    ```bash
    cp env.example .env.local
    ```

    Edit `.env.local` and set your backend URL:

    ```env
    NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
    ```

    **Important**: Make sure your backend server is running on this URL before starting the frontend.

3. **Start development server**:

    ```bash
    npm run dev
    ```

    The frontend will be available at `http://localhost:3001`

## Backend Setup

Make sure your backend server is running and configured with:

-   Google OAuth credentials
-   Database setup
-   CORS configured for frontend URL (`http://localhost:3001`)

See the backend documentation in the `docs/` folder for detailed setup instructions.

## Troubleshooting

### "Backend URL not configured" Error

If you see this error, make sure:

1. You've created `.env.local` file
2. `NEXT_PUBLIC_BACKEND_URL` is set correctly
3. Your backend server is running

### "Route not found" Error

This usually means:

1. Backend server is not running
2. Backend URL is incorrect
3. CORS is not configured properly

## Usage

1. **Authentication**: Click "Login with Google" to authenticate
2. **View Cards**: Visit `/card/[uuid]` to view any card
3. **Claim Cards**: Use the claim page or claim button on unclaimed cards
4. **Dashboard**: Manage your claimed cards at `/dashboard`

## Project Structure

```
app/
├── components/          # React components
│   ├── AuthProvider.js  # Authentication context
│   ├── Header.js        # Navigation header
│   ├── CardView.js      # Card display component
│   ├── LoadingSpinner.js # Loading component
│   └── ThemeWrapper.js  # MUI theme wrapper
├── lib/                 # Server actions and utilities
│   ├── auth.js          # Authentication utilities
│   └── cards.js         # Card-related server actions
├── api/                 # API routes
│   └── auth/            # Authentication API routes
└── [pages]/             # Next.js pages
```

## Development

-   **Server Actions**: Used for backend communication
-   **Material-UI**: Component library for styling
-   **Next.js 15**: App Router with React 19
-   **Authentication**: JWT tokens stored in HTTP-only cookies
-   **Navigation**: Proper Next.js router usage

## Environment Variables

| Variable                  | Description     | Required | Default |
| ------------------------- | --------------- | -------- | ------- |
| `NEXT_PUBLIC_BACKEND_URL` | Backend API URL | Yes      | -       |

## Available Scripts

-   `npm run dev` - Start development server
-   `npm run build` - Build for production
-   `npm run start` - Start production server
-   `npm run lint` - Run ESLint
