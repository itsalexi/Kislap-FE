# Database Schema Documentation

## Overview

The Kislap backend uses PostgreSQL with Prisma ORM. The database consists of two main models: `User` and `Card`, with a one-to-many relationship between users and their claimed cards. The system includes role-based access control (RBAC) with USER and ADMIN roles.

## Models

### User Model

The `User` model represents authenticated users who can claim and manage business cards.

```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String?
  picture       String?
  googleId      String   @unique
  role          Role     @default(USER)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relations
  claimedCards  Card[]   @relation("CardOwner")

  @@map("users")
}

enum Role {
  USER
  ADMIN
}
```

#### Fields

| Field       | Type     | Description                | Constraints                      |
| ----------- | -------- | -------------------------- | -------------------------------- |
| `id`        | String   | Unique identifier          | Primary key, auto-generated CUID |
| `email`     | String   | User's email address       | Unique, required                 |
| `name`      | String   | User's display name        | Optional                         |
| `picture`   | String   | User's profile picture URL | Optional                         |
| `googleId`  | String   | Google OAuth ID            | Unique, required                 |
| `role`      | Role     | User's role in the system  | Default: USER                    |
| `createdAt` | DateTime | Account creation timestamp | Auto-generated                   |
| `updatedAt` | DateTime | Last update timestamp      | Auto-updated                     |

#### Role Enum

| Role    | Description                                  | Permissions                            |
| ------- | -------------------------------------------- | -------------------------------------- |
| `USER`  | Standard user role (default)                 | Claim cards, manage own profile        |
| `ADMIN` | Administrator role with elevated permissions | All user permissions + user management |

#### Relations

-   **claimedCards**: One-to-many relationship with Card model
    -   A user can claim multiple cards
    -   Cards are linked via `ownerId` foreign key

### Card Model

The `Card` model represents physical business cards with unique QR codes and their associated digital content.

```prisma
model Card {
  id          String   @id @default(cuid())
  uuid        String   @unique
  isClaimed   Boolean  @default(false)
  claimedAt   DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Card content
  contactInfo Json?    // Store contact info as JSON
  socialLinks Json?    // Store social links as JSON (max 5, horizontal display)
  otherLinks  Json?    // Store other links as JSON (unlimited, vertical display)
  bio         String?  @db.Text

  // Card customization - S3/MinIO Storage
  profilePicture String? // Profile picture URL stored in S3/MinIO
  bannerPicture  String? // Banner picture URL stored in S3/MinIO

  // Relations
  ownerId     String?
  owner       User?    @relation("CardOwner", fields: [ownerId], references: [id], onDelete: SetNull)

  @@map("cards")
}
```

#### Fields

| Field            | Type     | Description               | Constraints                      |
| ---------------- | -------- | ------------------------- | -------------------------------- |
| `id`             | String   | Unique identifier         | Primary key, auto-generated CUID |
| `uuid`           | String   | QR code UUID              | Unique, required                 |
| `isClaimed`      | Boolean  | Claim status              | Default: false                   |
| `claimedAt`      | DateTime | When card was claimed     | Optional                         |
| `createdAt`      | DateTime | Card creation timestamp   | Auto-generated                   |
| `updatedAt`      | DateTime | Last update timestamp     | Auto-updated                     |
| `contactInfo`    | Json     | Contact information       | Optional, JSON format            |
| `socialLinks`    | Json     | Social media links        | Optional, JSON format (max 5)    |
| `otherLinks`     | Json     | Other links (ordered)     | Optional, JSON array format      |
| `bio`            | String   | User biography            | Optional, text field             |
| `profilePicture` | String   | Profile picture URL       | Optional, S3/MinIO URL           |
| `bannerPicture`  | String   | Banner picture URL        | Optional, S3/MinIO URL           |
| `ownerId`        | String   | User who claimed the card | Foreign key, optional            |

#### Relations

-   **owner**: Many-to-one relationship with User model
    -   Each card can be claimed by one user
    -   When user is deleted, `ownerId` is set to null (SetNull cascade)

## Relationships

### User ↔ Card Relationship

```
User (1) ←→ (N) Card
```

-   **One-to-Many**: A user can claim multiple cards
-   **Optional**: Cards can exist without being claimed
-   **Cascade**: When a user is deleted, their claimed cards become unclaimed

### Relationship Details

1. **Card Ownership**: Cards are linked to users via the `ownerId` foreign key
2. **Claim Status**: The `isClaimed` boolean field tracks whether a card has been claimed
3. **Cascade Behavior**: When a user is deleted, their cards' `ownerId` is set to null, making them unclaimed again

## Data Types

### JSON Fields

The `contactInfo`, `socialLinks`, and `otherLinks` fields use JSON format for flexibility:

#### contactInfo Structure

```json
{
    "name": "John Doe",
    "title": "Software Engineer",
    "company": "Tech Corp",
    "email": "john@example.com",
    "phone": "+1-555-0123",
    "address": "123 Main St, City, State 12345"
}
```

**Validation Rules:**

-   `name`: String, 1-100 characters (optional)
-   `title`: String, 1-100 characters (optional)
-   `company`: String, 1-100 characters (optional)
-   `email`: Valid email address (optional)
-   `phone`: Valid phone number, digits only with optional + prefix (optional)
-   `address`: String, 1-200 characters (optional)

**Note**: Website links should be added to the `otherLinks` array instead of the contact info.

#### socialLinks Structure (Max 5, Horizontal Display, Ordered)

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

**Constraints:**

-   Maximum 5 social links
-   Each link must have `platform`, `url`, and `order` fields
-   `platform`: String, 1-50 characters
-   `url`: Valid HTTP/HTTPS URL
-   `order`: Positive integer (unique within the array)
-   Displayed horizontally on the card

#### otherLinks Structure (Unlimited, Vertical Display, Ordered)

```json
[
    {
        "title": "Portfolio",
        "url": "https://johndoe.dev/portfolio",
        "order": 1
    },
    {
        "title": "Blog",
        "url": "https://johndoe.dev/blog",
        "order": 2
    },
    {
        "title": "Resume",
        "url": "https://johndoe.dev/resume",
        "order": 3
    }
]
```

**Constraints:**

-   Unlimited number of links
-   Each link must have `title`, `url`, and `order` fields
-   `title`: String, 1-100 characters
-   `url`: Valid HTTP/HTTPS URL
-   `order`: Positive integer (unique within the array)
-   Displayed vertically on the card

### Image Fields (S3/MinIO Storage)

The `profilePicture` and `bannerPicture` fields store URLs to images hosted in S3/MinIO:

#### profilePicture

-   **Purpose**: Profile picture displayed on the business card
-   **Storage**: S3/MinIO bucket (`kislap-images`)
-   **Path**: `cards/{uuid}/profile/{filename}`
-   **Format**: WebP (optimized)
-   **Size**: 400x400 pixels (square, cover fit)
-   **Example**: `http://localhost:9000/kislap-images/cards/550e8400-e29b-41d4-a716-446655440000/profile/card-profile-1703123456789-abc123.webp`

#### bannerPicture

-   **Purpose**: Background/banner image for the card design
-   **Storage**: S3/MinIO bucket (`kislap-images`)
-   **Path**: `cards/{uuid}/banner/{filename}`
-   **Format**: WebP (optimized)
-   **Size**: 1200x400 pixels (landscape, cover fit)
-   **Example**: `http://localhost:9000/kislap-images/cards/550e8400-e29b-41d4-a716-446655440000/banner/card-banner-1703123456789-def456.webp`

#### Image Processing

-   **Automatic Resizing**: Images are automatically resized to optimal dimensions
-   **Format Conversion**: All images converted to WebP for better compression
-   **Quality Optimization**: 85% quality for optimal file size/quality balance
-   **Metadata Removal**: Stripped for smaller file sizes

#### Storage Organization

```
kislap-images/
├── users/
│   └── {user-id}/
│       ├── profile/
│       │   └── profile-{timestamp}-{random}.webp
│       └── banner/
│           └── banner-{timestamp}-{random}.webp
└── cards/
    └── {card-uuid}/
        ├── profile/
        │   └── card-profile-{timestamp}-{random}.webp
        └── banner/
            └── card-banner-{timestamp}-{random}.webp
```

### UUID Format

Card UUIDs are generated using the UUID v4 standard and are used in QR code URLs:

-   Format: `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`
-   Example: `550e8400-e29b-41d4-a716-446655440000`

## Indexes and Constraints

### Primary Keys

-   `User.id`: CUID-based primary key
-   `Card.id`: CUID-based primary key

### Unique Constraints

-   `User.email`: Ensures unique email addresses
-   `User.googleId`: Ensures unique Google OAuth IDs
-   `Card.uuid`: Ensures unique QR code UUIDs

### Foreign Key Constraints

-   `Card.ownerId` → `User.id`: Links cards to users
-   Cascade behavior: `onDelete: SetNull`

## Database Operations

### Common Queries

#### Get User with Claimed Cards

```sql
SELECT u.*, c.*
FROM users u
LEFT JOIN cards c ON u.id = c.ownerId
WHERE u.id = ? AND c.isClaimed = true
```

#### Get Unclaimed Cards

```sql
SELECT * FROM cards
WHERE isClaimed = false
ORDER BY createdAt DESC
```

#### Get Card with Owner Info

```sql
SELECT c.*, u.name, u.email
FROM cards c
LEFT JOIN users u ON c.ownerId = u.id
WHERE c.uuid = ?
```

## Migration Strategy

### Adding New Fields

When adding new fields to existing models:

1. **Backward Compatibility**: New fields should be optional initially
2. **Default Values**: Provide sensible defaults for required fields
3. **Migration Scripts**: Use Prisma migrations for schema changes

### Example Migration

```bash
# Generate migration
npx prisma migrate dev --name add_new_field

# Apply migration
npx prisma migrate deploy
```

## Performance Considerations

### Indexes

-   Primary keys are automatically indexed
-   Unique constraints create indexes
-   Consider adding indexes for frequently queried fields

### Query Optimization

-   Use `select` to limit returned fields
-   Use `include` for related data
-   Implement pagination for large datasets

### Recommended Indexes

```sql
-- For card lookups by UUID
CREATE INDEX idx_cards_uuid ON cards(uuid);

-- For user card queries
CREATE INDEX idx_cards_owner_claimed ON cards(ownerId, isClaimed);

-- For timestamp-based queries
CREATE INDEX idx_cards_created_at ON cards(createdAt);
```

## Security Considerations

### Data Protection

-   Sensitive user data is stored securely
-   Passwords are not stored (OAuth only)
-   Personal information is encrypted in transit

### Access Control

-   Users can only access their own cards
-   Admin access is controlled via email whitelist
-   Public endpoints only return necessary information

### Data Validation

-   Input validation at API level
-   Database constraints for data integrity
-   JSON schema validation for flexible fields

### Image Security

-   **File Type Validation**: Only JPEG, PNG, and WebP files accepted
-   **Size Limits**: Maximum 5MB per file (configurable)
-   **Access Control**: Images stored with public read access
-   **Automatic Cleanup**: Old images deleted when replaced
-   **Virus Scanning**: Consider implementing for production
