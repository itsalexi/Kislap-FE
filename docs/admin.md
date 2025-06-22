# Admin Module Documentation

## Overview

The Admin module provides administrative functionality for managing the Kislap platform. It includes card management, user management, statistics, and system administration features. Access is restricted to users with ADMIN role.

## Frontend Admin Dashboard

The admin dashboard is accessible at `/admin` and provides a comprehensive web interface for managing the platform:

### Features

-   **Statistics Overview**: Real-time platform statistics including total cards, claimed/unclaimed cards, total users, and claim rate
-   **Card Management**: Create new cards, view all cards with filtering options, and delete cards
-   **User Management**: View all users with their claimed cards and activity
-   **Real-time Updates**: Automatic data refresh and loading states

### Access Control

-   Only users with `ADMIN` role can access the dashboard
-   Non-admin users will see a clear message about insufficient privileges
-   All admin operations require valid JWT authentication with ADMIN role
-   The Admin link in the header is only visible to ADMIN users

### Dashboard Sections

1. **Statistics Tab**: Shows platform metrics in card format
2. **Cards Tab**: Card creation and management interface
3. **Users Tab**: User overview with claimed cards and role information

## Authentication & Authorization

### Role-Based Access Control (RBAC)

Admin access is controlled via user roles in the database:

-   **USER**: Standard user role with basic permissions
-   **ADMIN**: Administrator role with full platform access

Users with `ADMIN` role can:

-   Access the admin dashboard
-   View platform statistics
-   Create and manage cards
-   View all users and their activity
-   Delete cards

### Required Headers

All admin endpoints require authentication:

```
Authorization: Bearer <jwt-token>
```

The JWT token must contain a user with `ADMIN` role.

## Endpoints

### Get All Cards

**Endpoint**: `GET /api/admin/cards`

**Description**: Returns paginated list of all cards in the system.

**Authentication**: Required (Admin JWT token)

**Headers**:

```
Authorization: Bearer <jwt-token>
```

**Query Parameters**:

-   `page` (number): Page number (default: 1)
-   `limit` (number): Items per page (default: 20, max: 100)
-   `claimed` (boolean): Filter by claim status (optional)

**Response**:

```json
{
    "cards": [
        {
            "id": "clx1234567890",
            "uuid": "550e8400-e29b-41d4-a716-446655440000",
            "isClaimed": true,
            "createdAt": "2024-01-15T10:30:00Z",
            "updatedAt": "2024-01-15T10:30:00Z",
            "contactInfo": {
                "name": "John Doe",
                "title": "Software Engineer"
            },
            "socialLinks": {
                "linkedin": "https://linkedin.com/in/johndoe"
            },
            "bio": "Passionate software engineer...",
            "owner": {
                "id": "clx0987654321",
                "name": "John Doe",
                "email": "john@example.com"
            }
        }
    ],
    "pagination": {
        "page": 1,
        "limit": 20,
        "total": 150,
        "pages": 8
    }
}
```

**Error Responses**:

-   `401 Unauthorized`: Invalid or missing token
-   `403 Forbidden`: Admin access required
-   `500 Internal Server Error`: Server error

**Examples**:

Get all cards:

```bash
curl -X GET "http://localhost:3000/api/admin/cards" \
  -H "Authorization: Bearer <jwt-token>"
```

Get claimed cards only:

```bash
curl -X GET "http://localhost:3000/api/admin/cards?claimed=true" \
  -H "Authorization: Bearer <jwt-token>"
```

Get unclaimed cards with pagination:

```bash
curl -X GET "http://localhost:3000/api/admin/cards?claimed=false&page=2&limit=10" \
  -H "Authorization: Bearer <jwt-token>"
```

### Create Unclaimed Cards

**Endpoint**: `POST /api/admin/cards`

**Description**: Creates new unclaimed cards for distribution.

**Authentication**: Required (Admin JWT token)

**Headers**:

```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body**:

```json
{
    "count": 10
}
```

**Validation Rules**:

-   `count`: Must be an integer between 1 and 100

**Response**:

```json
{
    "message": "Created 10 unclaimed card(s)",
    "cards": [
        {
            "id": "clx1234567890",
            "uuid": "550e8400-e29b-41d4-a716-446655440000",
            "isClaimed": false,
            "createdAt": "2024-01-15T10:30:00Z"
        },
        {
            "id": "clx1234567891",
            "uuid": "550e8400-e29b-41d4-a716-446655440001",
            "isClaimed": false,
            "createdAt": "2024-01-15T10:30:01Z"
        }
    ]
}
```

**Error Responses**:

-   `401 Unauthorized`: Invalid or missing token
-   `403 Forbidden`: Admin access required
-   `400 Bad Request`: Validation errors
-   `500 Internal Server Error`: Server error

**Example**:

```bash
curl -X POST "http://localhost:3000/api/admin/cards" \
  -H "Authorization: Bearer <jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{"count": 5}'
```

### Get Platform Statistics

**Endpoint**: `GET /api/admin/stats`

**Description**: Returns comprehensive platform statistics.

**Authentication**: Required (Admin JWT token)

**Headers**:

```
Authorization: Bearer <jwt-token>
```

**Response**:

```json
{
    "stats": {
        "totalCards": 150,
        "claimedCards": 89,
        "unclaimedCards": 61,
        "totalUsers": 45,
        "claimRate": 59.33
    }
}
```

**Statistics Explained**:

-   `totalCards`: Total number of cards in the system
-   `claimedCards`: Number of cards that have been claimed
-   `unclaimedCards`: Number of cards available for claiming
-   `totalUsers`: Total number of registered users
-   `claimRate`: Percentage of cards that have been claimed

**Error Responses**:

-   `401 Unauthorized`: Invalid or missing token
-   `403 Forbidden`: Admin access required
-   `500 Internal Server Error`: Server error

**Example**:

```bash
curl -X GET "http://localhost:3000/api/admin/stats" \
  -H "Authorization: Bearer <jwt-token>"
```

### Delete a Card

**Endpoint**: `DELETE /api/admin/cards/:uuid`

**Description**: Permanently deletes a card from the system.

**Authentication**: Required (Admin JWT token)

**Headers**:

```
Authorization: Bearer <jwt-token>
```

**Parameters**:

-   `uuid` (string): Card UUID to delete

**Response**:

```json
{
    "message": "Card deleted successfully"
}
```

**Error Responses**:

-   `401 Unauthorized`: Invalid or missing token
-   `403 Forbidden`: Admin access required
-   `404 Not Found`: Card not found
-   `500 Internal Server Error`: Server error

**Example**:

```bash
curl -X DELETE "http://localhost:3000/api/admin/cards/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer <jwt-token>"
```

### Get Users with Cards

**Endpoint**: `GET /api/admin/users`

**Description**: Returns paginated list of users with their claimed cards.

**Authentication**: Required (Admin JWT token)

**Headers**:

```
Authorization: Bearer <jwt-token>
```

**Query Parameters**:

-   `page` (number): Page number (default: 1)
-   `limit` (number): Items per page (default: 20, max: 100)

**Response**:

```json
{
    "users": [
        {
            "id": "clx0987654321",
            "email": "john@example.com",
            "name": "John Doe",
            "picture": "https://lh3.googleusercontent.com/a/...",
            "createdAt": "2024-01-15T10:30:00Z",
            "updatedAt": "2024-01-15T10:30:00Z",
            "_count": {
                "claimedCards": 2
            },
            "claimedCards": [
                {
                    "id": "clx1234567890",
                    "uuid": "550e8400-e29b-41d4-a716-446655440000",
                    "createdAt": "2024-01-15T10:30:00Z"
                },
                {
                    "id": "clx1234567891",
                    "uuid": "550e8400-e29b-41d4-a716-446655440001",
                    "createdAt": "2024-01-15T10:31:00Z"
                }
            ]
        }
    ],
    "pagination": {
        "page": 1,
        "limit": 20,
        "total": 45,
        "pages": 3
    }
}
```

**Error Responses**:

-   `401 Unauthorized`: Invalid or missing token
-   `403 Forbidden`: Admin access required
-   `500 Internal Server Error`: Server error

**Example**:

```bash
curl -X GET "http://localhost:3000/api/admin/users?page=1&limit=10" \
  -H "Authorization: Bearer <jwt-token>"
```

## Business Logic

### Card Creation Process

1. **Validation**: Verify admin permissions and input validation
2. **UUID Generation**: Generate unique UUIDs for each card
3. **Database Insert**: Create cards with `isClaimed: false`
4. **Response**: Return created cards with their UUIDs

### Statistics Calculation

1. **Total Cards**: Count all cards in the system
2. **Claimed Cards**: Count cards where `isClaimed = true`
3. **Unclaimed Cards**: Count cards where `isClaimed = false`
4. **Total Users**: Count all registered users
5. **Claim Rate**: Calculate percentage of claimed cards

### Card Deletion Process

1. **Validation**: Verify admin permissions and card existence
2. **Cascade Check**: Ensure no active claims (optional)
3. **Deletion**: Permanently remove card from database
4. **Response**: Confirm successful deletion

## Data Management

### Card Inventory Management

**Creating Cards for Distribution**:

```bash
# Create 50 cards for a new batch
curl -X POST "http://localhost:3000/api/admin/cards" \
  -H "Authorization: Bearer <jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{"count": 50}'
```

**Monitoring Card Status**:

```bash
# Check claim rate
curl -X GET "http://localhost:3000/api/admin/stats" \
  -H "Authorization: Bearer <jwt-token>"

# View unclaimed cards
curl -X GET "http://localhost:3000/api/admin/cards?claimed=false" \
  -H "Authorization: Bearer <jwt-token>"
```

### User Management

**View User Activity**:

```bash
# Get users with their card counts
curl -X GET "http://localhost:3000/api/admin/users" \
  -H "Authorization: Bearer <jwt-token>"
```

## Security Considerations

### Access Control

-   **Admin Verification**: All endpoints verify admin status via user roles
-   **Token Validation**: JWT tokens are validated for each request
-   **Input Validation**: All inputs are validated and sanitized

### Data Protection

-   **Sensitive Data**: User passwords are not stored (OAuth only)
-   **Limited Exposure**: Only necessary user information is returned
-   **Audit Trail**: Card creation and deletion are logged

### Rate Limiting

Admin endpoints are subject to the same rate limiting as other API endpoints:

-   **Window**: 15 minutes
-   **Limit**: 100 requests per IP

## Error Handling

### Common Error Scenarios

1. **Unauthorized Access**: Non-admin users attempting admin operations
2. **Invalid Input**: Malformed request data or validation failures
3. **Resource Not Found**: Attempting to delete non-existent cards
4. **Database Errors**: Connection or constraint violations

### Error Response Format

```json
{
    "error": "Error message description",
    "details": "Additional error details (optional)"
}
```

## Testing

### Admin Endpoint Testing

1. **Get Statistics**:

    ```bash
    curl -X GET "http://localhost:3000/api/admin/stats" \
      -H "Authorization: Bearer <admin-jwt-token>"
    ```

2. **Create Cards**:

    ```bash
    curl -X POST "http://localhost:3000/api/admin/cards" \
      -H "Authorization: Bearer <admin-jwt-token>" \
      -H "Content-Type: application/json" \
      -d '{"count": 5}'
    ```

3. **View All Cards**:

    ```bash
    curl -X GET "http://localhost:3000/api/admin/cards?page=1&limit=10" \
      -H "Authorization: Bearer <admin-jwt-token>"
    ```

4. **View Users**:
    ```bash
    curl -X GET "http://localhost:3000/api/admin/users" \
      -H "Authorization: Bearer <admin-jwt-token>"
    ```

### Admin Setup

1. **Set Admin Emails**:

    ```env
    ADMIN_EMAILS=admin@example.com,superadmin@example.com
    ```

2. **Login as Admin**:

    - Use Google OAuth with admin email
    - Verify admin access with stats endpoint

3. **Test Admin Functions**:
    - Create test cards
    - View platform statistics
    - Monitor user activity

## Production Considerations

### Admin Access Management

1. **Role-Based Access**: Implement proper RBAC system
2. **Admin Dashboard**: Build web interface for admin operations
3. **Audit Logging**: Log all admin actions for security
4. **Backup Strategy**: Regular database backups

### Monitoring

1. **Platform Metrics**: Track card creation and claim rates
2. **User Activity**: Monitor user engagement and growth
3. **System Health**: Monitor API performance and errors
4. **Security Alerts**: Monitor for suspicious admin activity

### Scalability

1. **Pagination**: All list endpoints support pagination
2. **Database Indexes**: Optimize queries for large datasets
3. **Caching**: Consider caching for frequently accessed statistics
4. **Rate Limiting**: Adjust limits based on admin usage patterns
