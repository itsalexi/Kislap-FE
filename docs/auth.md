# Authentication Documentation

## Overview

Kislap uses Google OAuth 2.0 for user authentication, combined with JWT tokens for API access. The authentication system provides secure, stateless authentication for both web and mobile clients. The system includes role-based access control (RBAC) with USER and ADMIN roles.

## Authentication Flow

### 1. Google OAuth Flow

```
User → Frontend → Backend → Google OAuth → Backend → Frontend (with JWT)
```

1. **Initiate Login**: User clicks login button
2. **Redirect to Google**: Backend redirects to Google OAuth
3. **User Authorization**: User grants permissions to Kislap
4. **OAuth Callback**: Google redirects back with authorization code
5. **Token Exchange**: Backend exchanges code for user info
6. **User Creation/Update**: User is created or updated in database
7. **JWT Generation**: Backend generates JWT token with role information
8. **Redirect to Frontend**: User is redirected with JWT token

### 2. JWT Token Usage

After OAuth authentication, clients use JWT tokens for API requests:

```
Client → API Request (with JWT) → Backend → Response
```

## Role-Based Access Control (RBAC)

### Roles

| Role    | Description                                  | Permissions                            |
| ------- | -------------------------------------------- | -------------------------------------- |
| `USER`  | Standard user role (default)                 | Claim cards, manage own profile        |
| `ADMIN` | Administrator role with elevated permissions | All user permissions + user management |

### Middleware Functions

-   `authenticateJWT`: Verifies JWT token and loads user data
-   `requireAdmin`: Ensures user has ADMIN role
-   `requireRole(roles)`: Ensures user has one of the specified roles

## Endpoints

### Google OAuth Login

**Endpoint**: `GET /api/auth/google`

**Description**: Initiates the Google OAuth authentication flow.

**Request**: No body required

**Response**: Redirects to Google OAuth consent screen

**Example**:

```bash
curl -X GET "http://localhost:3000/api/auth/google"
```

### OAuth Callback

**Endpoint**: `GET /api/auth/google/callback`

**Description**: Handles the OAuth callback from Google and generates JWT token.

**Request**: No body required (handled by Google redirect)

**Response**: Redirects to frontend with JWT token

**Redirect URL**: `${FRONTEND_URL}/auth/callback?token=<jwt-token>`

**Example Response**:

```javascript
// Frontend receives redirect to:
// http://localhost:3001/auth/callback?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Get Current User

**Endpoint**: `GET /api/auth/me`

**Description**: Returns information about the currently authenticated user.

**Headers**:

```
Authorization: Bearer <jwt-token>
```

**Response**:

```json
{
    "user": {
        "id": "clx1234567890",
        "email": "john.doe@example.com",
        "name": "John Doe",
        "role": "USER",
        "createdAt": "2024-01-15T10:30:00.000Z"
    },
    "message": "Token is valid"
}
```

**Error Responses**:

-   `401 Unauthorized`: Invalid or missing token
-   `500 Internal Server Error`: Server error

**Example**:

```bash
curl -X GET "http://localhost:3000/api/auth/me" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Get User Profile

**Endpoint**: `GET /api/auth/profile`

**Description**: Returns detailed user profile including claimed cards.

**Headers**:

```
Authorization: Bearer <jwt-token>
```

**Response**:

```json
{
    "id": "clx1234567890",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "picture": "https://lh3.googleusercontent.com/a/...",
    "role": "USER",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "claimedCards": [
        {
            "id": "clx1234567891",
            "uuid": "550e8400-e29b-41d4-a716-446655440000",
            "isClaimed": true,
            "claimedAt": "2024-01-15T11:00:00.000Z",
            "contactInfo": { ... },
            "socialLinks": [ ... ],
            "otherLinks": [ ... ],
            "bio": "Software Engineer",
            "profilePicture": "https://...",
            "bannerPicture": "https://...",
            "createdAt": "2024-01-15T10:30:00.000Z",
            "updatedAt": "2024-01-15T11:00:00.000Z"
        }
    ]
}
```

**Error Responses**:

-   `401 Unauthorized`: Invalid or missing token
-   `404 Not Found`: User not found
-   `500 Internal Server Error`: Server error

### Check Authentication Status

**Endpoint**: `GET /api/auth/status`

**Description**: Checks if the current session is authenticated (for session-based auth).

**Request**: No body required

**Response**:

```json
{
    "authenticated": true,
    "user": {
        "id": "clx1234567890",
        "email": "john.doe@example.com",
        "name": "John Doe",
        "picture": "https://lh3.googleusercontent.com/a/...",
        "role": "USER"
    }
}
```

**Unauthenticated Response**:

```json
{
    "authenticated": false
}
```

**Example**:

```bash
curl -X GET "http://localhost:3000/api/auth/status"
```

### Logout

**Endpoint**: `POST /api/auth/logout`

**Description**: Logs out the current user (session-based auth).

**Headers**:

```
Authorization: Bearer <jwt-token>
```

**Response**:

```json
{
    "message": "Logged out successfully"
}
```

**Error Responses**:

-   `401 Unauthorized`: Invalid or missing token
-   `500 Internal Server Error`: Logout failed

**Example**:

```bash
curl -X POST "http://localhost:3000/api/auth/logout" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Admin Endpoints

### Get All Users (Admin Only)

**Endpoint**: `GET /api/auth/admin/users`

**Description**: Returns a list of all users in the system.

**Headers**:

```
Authorization: Bearer <jwt-token>
```

**Required Role**: `ADMIN`

**Response**:

```json
[
    {
        "id": "clx1234567890",
        "email": "john.doe@example.com",
        "name": "John Doe",
        "role": "USER",
        "picture": "https://lh3.googleusercontent.com/a/...",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z",
        "_count": {
            "claimedCards": 2
        }
    },
    {
        "id": "clx1234567892",
        "email": "admin@example.com",
        "name": "Admin User",
        "role": "ADMIN",
        "picture": "https://lh3.googleusercontent.com/a/...",
        "createdAt": "2024-01-10T09:00:00.000Z",
        "updatedAt": "2024-01-15T12:00:00.000Z",
        "_count": {
            "claimedCards": 0
        }
    }
]
```

**Error Responses**:

-   `401 Unauthorized`: Invalid or missing token
-   `403 Forbidden`: Admin access required
-   `500 Internal Server Error`: Server error

**Example**:

```bash
curl -X GET "http://localhost:3000/api/auth/admin/users" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Update User Role (Admin Only)

**Endpoint**: `PATCH /api/auth/admin/users/:userId/role`

**Description**: Updates a user's role.

**Headers**:

```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Required Role**: `ADMIN`

**Request Body**:

```json
{
    "role": "ADMIN"
}
```

**Response**:

```json
{
    "id": "clx1234567890",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "role": "ADMIN",
    "updatedAt": "2024-01-15T12:00:00.000Z"
}
```

**Error Responses**:

-   `400 Bad Request`: Invalid role or cannot remove own admin role
-   `401 Unauthorized`: Invalid or missing token
-   `403 Forbidden`: Admin access required
-   `404 Not Found`: User not found
-   `500 Internal Server Error`: Server error

**Example**:

```bash
curl -X PATCH "http://localhost:3000/api/auth/admin/users/clx1234567890/role" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"role": "ADMIN"}'
```

### Delete User (Admin Only)

**Endpoint**: `DELETE /api/auth/admin/users/:userId`

**Description**: Deletes a user account.

**Headers**:

```
Authorization: Bearer <jwt-token>
```

**Required Role**: `ADMIN`

**Response**:

```json
{
    "message": "User deleted successfully"
}
```

**Error Responses**:

-   `400 Bad Request`: Cannot delete own account
-   `401 Unauthorized`: Invalid or missing token
-   `403 Forbidden`: Admin access required
-   `404 Not Found`: User not found
-   `500 Internal Server Error`: Server error

**Example**:

```bash
curl -X DELETE "http://localhost:3000/api/auth/admin/users/clx1234567890" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## JWT Token Details

### Token Structure

JWT tokens contain the following payload:

```json
{
    "userId": "clx1234567890",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "role": "USER",
    "iat": 1703123456,
    "exp": 1703728256
}
```

### Token Configuration

-   **Algorithm**: HS256
-   **Expiration**: 24 hours
-   **Issuer**: Kislap Backend
-   **Secret**: Configured via `JWT_SECRET` environment variable

### Token Usage

Include JWT tokens in the `Authorization` header:

```
Authorization: Bearer <jwt-token>
```

## Security Considerations

### Role-Based Access

-   All admin endpoints require the `ADMIN` role
-   Users cannot modify their own role to prevent privilege escalation
-   Admins cannot delete their own accounts to prevent lockout
-   Role information is included in JWT tokens for efficient authorization

### Token Security

-   JWT tokens expire after 24 hours
-   Tokens include role information for authorization
-   Invalid tokens return 401 Unauthorized
-   Missing tokens return 401 Unauthorized

### Error Handling

-   Authentication errors return 401 Unauthorized
-   Authorization errors return 403 Forbidden
-   Detailed error messages help with debugging
-   Role requirements are clearly specified in error responses

## Environment Variables

### Required Variables

| Variable               | Description                | Example                                       |
| ---------------------- | -------------------------- | --------------------------------------------- |
| `GOOGLE_CLIENT_ID`     | Google OAuth client ID     | `123456789-abc123.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | `GOCSPX-abc123def456`                         |
| `GOOGLE_CALLBACK_URL`  | OAuth callback URL         | `http://localhost:3000/auth/google/callback`  |
| `JWT_SECRET`           | JWT signing secret         | `your-super-secret-jwt-key`                   |
| `SESSION_SECRET`       | Session encryption secret  | `your-session-secret-key`                     |
| `FRONTEND_URL`         | Frontend application URL   | `http://localhost:3001`                       |

### Google OAuth Setup

1. **Create Google Cloud Project**:

    - Go to [Google Cloud Console](https://console.cloud.google.com/)
    - Create a new project or select existing one

2. **Enable Google+ API**:

    - Go to APIs & Services > Library
    - Search for "Google+ API" and enable it

3. **Create OAuth Credentials**:

    - Go to APIs & Services > Credentials
    - Click "Create Credentials" > "OAuth 2.0 Client IDs"
    - Choose "Web application"
    - Add authorized redirect URIs:
        - `http://localhost:3000/auth/google/callback` (development)
        - `https://yourdomain.com/auth/google/callback` (production)

4. **Configure Environment Variables**:
    ```env
    GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
    GOOGLE_CLIENT_SECRET=your-client-secret
    GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
    ```

## Security Features

### Rate Limiting

Authentication endpoints are protected by rate limiting:

-   **Window**: 15 minutes
-   **Limit**: 100 requests per IP
-   **Scope**: All `/api/` routes

### CORS Protection

Cross-Origin Resource Sharing is configured for security:

-   **Origin**: Configured via `FRONTEND_URL`
-   **Credentials**: Enabled for session cookies
-   **Methods**: GET, POST, PUT, DELETE

### Input Validation

All authentication inputs are validated:

-   Email format validation
-   Token format validation
-   Required field validation

## Error Handling

### Common Error Responses

#### 401 Unauthorized

```json
{
    "error": "Authentication required"
}
```

#### 401 Invalid Token

```json
{
    "error": "Invalid token"
}
```

#### 400 Already Authenticated

```json
{
    "error": "Already authenticated"
}
```

#### 500 Server Error

```json
{
    "error": "Something went wrong!",
    "message": "Internal server error"
}
```

## Frontend Integration

### React Example

```javascript
// Login component
const handleLogin = () => {
    window.location.href = 'http://localhost:3000/api/auth/google';
};

// Handle OAuth callback
useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
        localStorage.setItem('jwt_token', token);
        // Redirect to dashboard
        navigate('/dashboard');
    }
}, []);

// API request with JWT
const fetchUserData = async () => {
    const token = localStorage.getItem('jwt_token');

    const response = await fetch('http://localhost:3000/api/auth/me', {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json();
    return data.user;
};
```

### Logout Example

```javascript
const handleLogout = async () => {
    const token = localStorage.getItem('jwt_token');

    await fetch('http://localhost:3000/api/auth/logout', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    localStorage.removeItem('jwt_token');
    navigate('/login');
};
```

## Testing

### Test Authentication Flow

1. **Start the server**:

    ```bash
    npm run dev
    ```

2. **Test OAuth initiation**:

    ```bash
    curl -X GET "http://localhost:3000/api/auth/google"
    ```

3. **Test with sample JWT** (after OAuth login):

    ```bash
    curl -X GET "http://localhost:3000/api/auth/me" \
      -H "Authorization: Bearer <your-jwt-token>"
    ```

4. **Test logout**:
    ```bash
    curl -X POST "http://localhost:3000/api/auth/logout" \
      -H "Authorization: Bearer <your-jwt-token>"
    ```

## Troubleshooting

### Common Issues

1. **Invalid OAuth Credentials**:

    - Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
    - Check redirect URI configuration in Google Console

2. **CORS Errors**:

    - Ensure `FRONTEND_URL` is correctly set
    - Check that frontend origin matches CORS configuration

3. **JWT Token Expired**:

    - Tokens expire after 7 days
    - Implement token refresh logic if needed

4. **Session Issues**:
    - Verify `SESSION_SECRET` is set
    - Check cookie configuration for production

### Debug Mode

Enable debug logging by setting:

```env
NODE_ENV=development
```

This will show detailed Prisma query logs and error messages.
