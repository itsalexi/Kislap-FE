# Upload System Documentation

## Overview

The Kislap upload system provides secure file upload functionality for card profile and banner pictures using S3-compatible storage (MinIO). Images are automatically processed, resized, and optimized for web delivery.

## Features

-   **S3/MinIO Integration**: Compatible with AWS S3 and MinIO storage
-   **Image Processing**: Automatic resizing and optimization using Sharp
-   **File Validation**: Type and size validation for security
-   **Automatic Cleanup**: Old images are deleted when replaced
-   **Organized Storage**: Files are organized by card UUIDs
-   **Card-Specific**: Only card pictures are supported (no user profile/banner)

## Configuration

### Environment Variables

| Variable               | Description                        | Default                           |
| ---------------------- | ---------------------------------- | --------------------------------- |
| `S3_ENDPOINT`          | S3/MinIO endpoint URL              | `http://localhost:9000`           |
| `S3_REGION`            | S3 region                          | `us-east-1`                       |
| `S3_ACCESS_KEY_ID`     | Access key for S3/MinIO            | Required                          |
| `S3_SECRET_ACCESS_KEY` | Secret key for S3/MinIO            | Required                          |
| `S3_BUCKET_NAME`       | Bucket name for storing images     | `kislap-images`                   |
| `S3_FORCE_PATH_STYLE`  | Force path-style URLs              | `true`                            |
| `MAX_FILE_SIZE`        | Maximum file size in bytes         | `5242880` (5MB)                   |
| `ALLOWED_IMAGE_TYPES`  | Comma-separated allowed MIME types | `image/jpeg,image/png,image/webp` |

### MinIO Setup

1. **Install MinIO**:

    ```bash
    # Using Docker
    docker run -p 9000:9000 -p 9001:9001 \
      -e "MINIO_ROOT_USER=admin" \
      -e "MINIO_ROOT_PASSWORD=password123" \
      minio/minio server /data --console-address ":9001"
    ```

2. **Create Bucket**:

    - Access MinIO Console at `http://localhost:9001`
    - Login with admin/password123
    - Create bucket named `kislap-images`
    - Set bucket policy to public read access

3. **Configure Environment**:
    ```env
    S3_ENDPOINT=http://localhost:9000
    S3_REGION=us-east-1
    S3_ACCESS_KEY_ID=admin
    S3_SECRET_ACCESS_KEY=password123
    S3_BUCKET_NAME=kislap-images
    S3_FORCE_PATH_STYLE=true
    ```

## Endpoints

### Test S3 Connection

**Endpoint**: `GET /api/upload/test-connection`

**Description**: Test the S3/MinIO connection and configuration.

**Authentication**: Required (JWT token)

**Headers**:

```
Authorization: Bearer <jwt-token>
```

**Response**:

```json
{
    "message": "S3 connection successful",
    "bucket": "kislap-images",
    "endpoint": "http://localhost:9000",
    "region": "us-east-1"
}
```

**Error Response**:

```json
{
    "error": "S3 connection failed",
    "message": "Error details",
    "details": {
        "endpoint": "http://localhost:9000",
        "region": "us-east-1",
        "bucket": "kislap-images"
    }
}
```

### Upload Card Profile Picture

**Endpoint**: `POST /api/upload/card/:uuid/profile-picture`

**Description**: Upload a profile picture for a specific card.

**Authentication**: Required (JWT token)

**Authorization**: User must own the card

**Headers**:

```
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data
```

**Parameters**:

-   `uuid` (string): Card UUID

**Form Data**:

-   `profilePicture` (file): Image file (JPEG, PNG, WebP)

**Response**:

```json
{
    "message": "Card profile picture uploaded successfully",
    "imageUrl": "http://localhost:9000/kislap-images/cards/550e8400-e29b-41d4-a716-446655440004/profile/card-profile-1703123456789-abc123.webp",
    "filename": "card-profile-1703123456789-abc123.webp"
}
```

**Error Responses**:

-   `400 Bad Request`: No file uploaded, invalid file type, or file too large
-   `401 Unauthorized`: Invalid or missing token
-   `403 Forbidden`: User doesn't own the card
-   `404 Not Found`: Card not found
-   `500 Internal Server Error`: Upload failed

**Example**:

```bash
curl -X POST "http://localhost:3000/api/upload/card/550e8400-e29b-41d4-a716-446655440004/profile-picture" \
  -H "Authorization: Bearer <jwt-token>" \
  -F "profilePicture=@/path/to/image.jpg"
```

### Upload Card Banner Picture

**Endpoint**: `POST /api/upload/card/:uuid/banner-picture`

**Description**: Upload a banner picture for a specific card.

**Authentication**: Required (JWT token)

**Authorization**: User must own the card

**Headers**:

```
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data
```

**Parameters**:

-   `uuid` (string): Card UUID

**Form Data**:

-   `bannerPicture` (file): Image file (JPEG, PNG, WebP)

**Response**:

```json
{
    "message": "Card banner picture uploaded successfully",
    "imageUrl": "http://localhost:9000/kislap-images/cards/550e8400-e29b-41d4-a716-446655440004/banner/card-banner-1703123456789-def456.webp",
    "filename": "card-banner-1703123456789-def456.webp"
}
```

**Example**:

```bash
curl -X POST "http://localhost:3000/api/upload/card/550e8400-e29b-41d4-a716-446655440004/banner-picture" \
  -H "Authorization: Bearer <jwt-token>" \
  -F "bannerPicture=@/path/to/banner.jpg"
```

### Upload Both Card Pictures

**Endpoint**: `POST /api/upload/card/:uuid/both-pictures`

**Description**: Upload both profile and banner pictures for a card at once.

**Authentication**: Required (JWT token)

**Authorization**: User must own the card

**Headers**:

```
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data
```

**Parameters**:

-   `uuid` (string): Card UUID

**Form Data**:

-   `profilePicture` (file, optional): Profile image file
-   `bannerPicture` (file, optional): Banner image file

**Response**:

```json
{
    "message": "Card pictures uploaded successfully",
    "profilePicture": "http://localhost:9000/kislap-images/cards/550e8400-e29b-41d4-a716-446655440004/profile/card-profile-1703123456789-abc123.webp",
    "bannerPicture": "http://localhost:9000/kislap-images/cards/550e8400-e29b-41d4-a716-446655440004/banner/card-banner-1703123456789-def456.webp"
}
```

### Delete Card Profile Picture

**Endpoint**: `DELETE /api/upload/card/:uuid/profile-picture`

**Description**: Delete the profile picture from a card.

**Authentication**: Required (JWT token)

**Authorization**: User must own the card

**Headers**:

```
Authorization: Bearer <jwt-token>
```

**Parameters**:

-   `uuid` (string): Card UUID

**Response**:

```json
{
    "message": "Profile picture deleted successfully"
}
```

**Error Responses**:

-   `401 Unauthorized`: Invalid or missing token
-   `403 Forbidden`: User doesn't own the card
-   `404 Not Found`: Card not found or no profile picture to delete
-   `500 Internal Server Error`: Deletion failed

### Delete Card Banner Picture

**Endpoint**: `DELETE /api/upload/card/:uuid/banner-picture`

**Description**: Delete the banner picture from a card.

**Authentication**: Required (JWT token)

**Authorization**: User must own the card

**Headers**:

```
Authorization: Bearer <jwt-token>
```

**Parameters**:

-   `uuid` (string): Card UUID

**Response**:

```json
{
    "message": "Banner picture deleted successfully"
}
```

## Image Processing

### Profile Pictures

-   **Dimensions**: 400x400 pixels
-   **Format**: WebP
-   **Quality**: 85%
-   **Fit**: Cover (maintains aspect ratio, crops if necessary)

### Banner Pictures

-   **Dimensions**: 1200x400 pixels
-   **Format**: WebP
-   **Quality**: 85%
-   **Fit**: Cover (maintains aspect ratio, crops if necessary)

## File Organization

### Storage Structure

```
kislap-images/
├── cards/
│   └── {card-uuid}/
│       ├── profile/
│       │   └── card-profile-{timestamp}-{random}.webp
│       └── banner/
│           └── card-banner-{timestamp}-{random}.webp
```

### File Naming Convention

-   **Profile**: `card-profile-{timestamp}-{random}.webp`
-   **Banner**: `card-banner-{timestamp}-{random}.webp`

## Security

### File Validation

-   **Allowed Types**: JPEG, PNG, WebP
-   **Maximum Size**: 5MB (configurable)
-   **Content Validation**: MIME type checking

### Access Control

-   **Authentication Required**: All endpoints require JWT token
-   **Authorization**: Users can only upload to their own cards
-   **Card Ownership**: Must be the card owner to upload/delete

### Error Handling

-   **Graceful Degradation**: Old files are cleaned up on replacement
-   **Detailed Logging**: All operations are logged for debugging
-   **Validation Errors**: Clear error messages for invalid uploads

## Testing

### Test Endpoints

Use the test page at `http://localhost:3000/test` (development only) to:

1. **Test S3 Connection**: Verify MinIO connectivity
2. **Upload Card Profile**: Test profile picture upload
3. **Upload Card Banner**: Test banner picture upload

### Manual Testing

```bash
# Test S3 connection
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3000/api/upload/test-connection"

# Upload card profile picture
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -F "profilePicture=@test.jpg" \
  "http://localhost:3000/api/upload/card/{uuid}/profile-picture"

# Upload card banner picture
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -F "bannerPicture=@banner.jpg" \
  "http://localhost:3000/api/upload/card/{uuid}/banner-picture"
```

## Troubleshooting

### Common Issues

1. **"Unexpected field" Error**: Ensure field name is `profilePicture` or `bannerPicture`
2. **S3 Connection Failed**: Check MinIO is running and credentials are correct
3. **File Too Large**: Increase `MAX_FILE_SIZE` or reduce image size
4. **Invalid File Type**: Ensure image is JPEG, PNG, or WebP

### Debug Steps

1. **Test S3 Connection**: Use the test endpoint to verify connectivity
2. **Check Environment Variables**: Ensure all S3 variables are set
3. **Verify MinIO Setup**: Confirm bucket exists and is accessible
4. **Check File Format**: Ensure uploaded file is a valid image
