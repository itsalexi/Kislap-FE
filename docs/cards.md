# Cards API Documentation

## Overview

The Cards API provides endpoints for managing smart business cards. Users can claim cards, update their content, and view card information.

## Authentication

All endpoints except `GET /:uuid` require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <jwt-token>
```

## Endpoints

### Get User's Cards

**Endpoint**: `GET /api/cards`

**Description**: Get all cards owned by the authenticated user.

**Authentication**: Required

**Response**:

```json
[
    {
        "id": "clx123",
        "uuid": "550e8400-e29b-41d4-a716-446655440000",
        "isClaimed": true,
        "claimedAt": "2024-01-15T10:30:00.000Z",
        "contactInfo": {
            "name": "John Doe",
            "title": "Software Engineer",
            "company": "Tech Corp",
            "email": "john@example.com",
            "phone": "+1234567890",
            "address": "123 Main St, City, State"
        },
        "socialLinks": [
            {
                "platform": "linkedin",
                "url": "https://linkedin.com/in/johndoe",
                "order": 1
            }
        ],
        "otherLinks": [
            {
                "title": "Portfolio",
                "url": "https://johndoe.dev",
                "order": 1
            }
        ],
        "bio": "Passionate software engineer...",
        "profilePicture": "https://example.com/profile.jpg",
        "bannerPicture": "https://example.com/banner.jpg",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
    }
]
```

### Get Card by UUID

**Endpoint**: `GET /api/cards/:uuid`

**Description**: Get card information by UUID. Returns different responses for claimed and unclaimed cards.

**Authentication**: Not required

**Parameters**:

-   `uuid` (string): Card UUID

**Response for Claimed Card**:

```json
{
    "claimed": true,
    "card": {
        "uuid": "550e8400-e29b-41d4-a716-446655440000",
        "contactInfo": {
            "name": "John Doe",
            "title": "Software Engineer",
            "company": "Tech Corp",
            "email": "john@example.com",
            "phone": "+1234567890",
            "address": "123 Main St, City, State"
        },
        "socialLinks": [
            {
                "platform": "linkedin",
                "url": "https://linkedin.com/in/johndoe",
                "order": 1
            }
        ],
        "otherLinks": [
            {
                "title": "Portfolio",
                "url": "https://johndoe.dev",
                "order": 1
            }
        ],
        "bio": "Passionate software engineer...",
        "profilePicture": "https://example.com/profile.jpg",
        "bannerPicture": "https://example.com/banner.jpg",
        "owner": {
            "name": "John Doe",
            "email": "john@example.com"
        }
    }
}
```

**Response for Unclaimed Card**:

```json
{
    "claimed": false,
    "message": "This card is not claimed yet",
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "claimUrl": "http://localhost:3001/claim/550e8400-e29b-41d4-a716-446655440000"
}
```

### Claim a Card

**Endpoint**: `POST /api/cards/:uuid/claim`

**Description**: Claim an unclaimed card for the authenticated user.

**Authentication**: Required

**Parameters**:

-   `uuid` (string): Card UUID

**Response**:

```json
{
    "message": "Card claimed successfully",
    "card": {
        "id": "clx123",
        "uuid": "550e8400-e29b-41d4-a716-446655440000",
        "isClaimed": true,
        "claimedAt": "2024-01-15T10:30:00.000Z",
        "ownerId": "user123"
    }
}
```

**Error Responses**:

-   `404 Not Found`: Card not found
-   `400 Bad Request`: Card is already claimed

### Update Card Content

**Endpoint**: `PUT /api/cards/:uuid`

**Description**: Update the content of a claimed card.

**Authentication**: Required

**Parameters**:

-   `uuid` (string): Card UUID

**Request Body**:

```json
{
    "contactInfo": {
        "name": "John Doe",
        "title": "Software Engineer",
        "company": "Tech Corp",
        "email": "john@example.com",
        "phone": "+1234567890",
        "address": "123 Main St, City, State"
    },
    "socialLinks": [
        {
            "platform": "linkedin",
            "url": "https://linkedin.com/in/johndoe",
            "order": 1
        },
        {
            "platform": "github",
            "url": "https://github.com/johndoe",
            "order": 2
        }
    ],
    "otherLinks": [
        {
            "title": "Portfolio",
            "url": "https://johndoe.dev",
            "order": 1
        },
        {
            "title": "Blog",
            "url": "https://blog.johndoe.dev",
            "order": 2
        }
    ],
    "bio": "Passionate software engineer with 5+ years of experience..."
}
```

**Validation Rules**:

#### Contact Info Validation

-   `name`: String, 1-100 characters (optional)
-   `title`: String, 1-100 characters (optional)
-   `company`: String, 1-100 characters (optional)
-   `email`: Valid email address (optional)
-   `phone`: Valid phone number, digits only with optional + prefix (optional)
-   `address`: String, 1-200 characters (optional)

#### Social Links Validation

-   Maximum 5 social links
-   Each link must have:
    -   `platform`: String, 1-50 characters
    -   `url`: Valid HTTP/HTTPS URL
    -   `order`: Positive integer (unique within the array)

#### Other Links Validation

-   Unlimited number of links
-   Each link must have:
    -   `title`: String, 1-100 characters
    -   `url`: Valid HTTP/HTTPS URL
    -   `order`: Positive integer (unique within the array)

#### Bio Validation

-   `bio`: String, 1-1000 characters (optional)

**Response**:

```json
{
  "message": "Card updated successfully",
  "card": {
    "id": "clx123",
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "contactInfo": { ... },
    "socialLinks": [ ... ],
    "otherLinks": [ ... ],
    "bio": "Updated bio...",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses**:

-   `400 Bad Request`: Validation errors
-   `403 Forbidden`: User doesn't own the card
-   `404 Not Found`: Card not found

**Validation Error Example**:

```json
{
    "error": "Validation failed",
    "details": [
        {
            "msg": "Email must be a valid email address",
            "param": "contactInfo.email",
            "location": "body"
        },
        {
            "msg": "Maximum 5 social links allowed",
            "param": "socialLinks",
            "location": "body"
        }
    ]
}
```

### Unlink Card

**Endpoint**: `DELETE /api/cards/:uuid`

**Description**: Unlink a card from the authenticated user, making it unclaimed again.

**Authentication**: Required

**Parameters**:

-   `uuid` (string): Card UUID

**Response**:

```json
{
    "message": "Card unlinked successfully"
}
```

**Error Responses**:

-   `403 Forbidden`: User doesn't own the card
-   `404 Not Found`: Card not found

## Data Structures

### Contact Info

```json
{
    "name": "John Doe",
    "title": "Software Engineer",
    "company": "Tech Corp",
    "email": "john@example.com",
    "phone": "+1234567890",
    "address": "123 Main St, City, State"
}
```

**Note**: Website links should be added to the `otherLinks` array instead of the contact info.

### Social Links

Array of social media links (maximum 5):

```json
[
    {
        "platform": "linkedin",
        "url": "https://linkedin.com/in/johndoe",
        "order": 1
    },
    {
        "platform": "github",
        "url": "https://github.com/johndoe",
        "order": 2
    },
    {
        "platform": "twitter",
        "url": "https://twitter.com/johndoe",
        "order": 3
    }
]
```

### Other Links

Array of additional links (unlimited):

```json
[
    {
        "title": "Portfolio",
        "url": "https://johndoe.dev",
        "order": 1
    },
    {
        "title": "Blog",
        "url": "https://blog.johndoe.dev",
        "order": 2
    },
    {
        "title": "Resume",
        "url": "https://johndoe.dev/resume",
        "order": 3
    }
]
```

## Error Handling

### Common Error Responses

-   `400 Bad Request`: Invalid request data or validation errors
-   `401 Unauthorized`: Missing or invalid authentication token
-   `403 Forbidden`: User not authorized to perform the action
-   `404 Not Found`: Card not found
-   `500 Internal Server Error`: Server error

### Validation Error Format

```json
{
    "error": "Validation failed",
    "details": [
        {
            "msg": "Error message",
            "param": "field.name",
            "location": "body"
        }
    ]
}
```

## Examples

### Claim and Update a Card

```bash
# 1. Claim a card
curl -X POST "http://localhost:3000/api/cards/550e8400-e29b-41d4-a716-446655440000/claim" \
  -H "Authorization: Bearer <jwt-token>"

# 2. Update card content
curl -X PUT "http://localhost:3000/api/cards/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer <jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "contactInfo": {
      "name": "John Doe",
      "title": "Software Engineer",
      "company": "Tech Corp",
      "email": "john@example.com",
      "phone": "+1234567890"
    },
    "socialLinks": [
      {
        "platform": "linkedin",
        "url": "https://linkedin.com/in/johndoe",
        "order": 1
      }
    ],
    "otherLinks": [
      {
        "title": "Portfolio",
        "url": "https://johndoe.dev",
        "order": 1
      }
    ],
    "bio": "Passionate software engineer..."
  }'
```

### Get Public Card

```bash
curl "http://localhost:3000/api/cards/550e8400-e29b-41d4-a716-446655440000"
```
