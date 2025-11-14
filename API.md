# API Documentation

## Base URL
- **Development**: `http://127.0.0.1:5001`
- **Production**: `https://webapp.vtelltales.com/api`

## Authentication

### Headers
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Login
```http
POST /storyapi/StoryBook/LoginUser
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user123",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Login successful"
}
```

## Stories API

### Get Featured Stories
```http
GET /storyapi/StoryBook/GetTopStory/{userId}
```

**Response:**
```json
[
  {
    "storyid": 1,
    "storytitle": "The Magic Forest",
    "storydesc": "A magical adventure story",
    "userid": "user123",
    "storyimg": "/images/story1.jpg",
    "storylike": 15,
    "storyview": 127,
    "createdate": "2024-01-15T10:30:00Z"
  }
]
```

### Get Stories with Pagination
```http
GET /storyapi/StoryBook/GetAllStoriesbypage/{userId}/{page}/{limit}
```

### Get Story Details
```http
GET /storyapi/StoryBook/story/{userId}/{storyId}
```

### Create New Story
```http
POST /storyapi/StoryBook/AddStory
Content-Type: multipart/form-data

{
  "userid": "user123",
  "storytitle": "My New Story",
  "storydesc": "Story description",
  "storytypeid": 1,
  "file": [uploaded_image_file]
}
```

## User Profile API

### Get User Profile
```http
GET /storyapi/StoryBook/viewprofile/{userId}
```

**Response:**
```json
{
  "userid": "user123",
  "email": "user@example.com",
  "name": "John Doe",
  "age": "25",
  "location": "New York",
  "profileimg": "/images/profile.jpg",
  "followingcount": "12",
  "followercount": "8",
  "storycount": "3"
}
```

### Update Profile
```http
POST /storyapi/StoryBook/updateProfile
Content-Type: multipart/form-data

{
  "userid": "user123",
  "name": "John Smith",
  "age": "26",
  "location": "Los Angeles"
}
```

## Story Categories API

### Get All Story Types
```http
GET /storyapi/StoryBook/getallstorytype
```

**Response:**
```json
[
  {
    "stid": 1,
    "sttype": "Adventure"
  },
  {
    "stid": 2,
    "sttype": "Fantasy"
  }
]
```

## Story Interaction API

### Like a Story
```http
POST /storyapi/StoryBook/AddStoryLike
Content-Type: application/json

{
  "userid": "user123",
  "storyid": 1,
  "likeaction": true
}
```

### Add Story Comment
```http
POST /storyapi/StoryBook/AddStoryComment
Content-Type: application/json

{
  "userid": "user123",
  "storyid": 1,
  "commenttext": "Great story!"
}
```

### Get Story Comments
```http
GET /storyapi/StoryBook/GetStoryComments/{storyId}
```

## Admin API

### Get All Users (Admin)
```http
GET /storyapi/StoryBook/Getallusers
```

### Get Admin Dashboard Data
```http
GET /storyapi/StoryBook/GetAdminDashboardCard
```

### Get All Stories (Admin)
```http
GET /storyapi/StoryBook/GetAdminAllStories
```

## Error Responses

### Standard Error Format
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### HTTP Status Codes
- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

- **Limit**: 100 requests per minute per IP
- **Headers**: 
  - `X-RateLimit-Limit`: Rate limit ceiling
  - `X-RateLimit-Remaining`: Number of requests left
  - `X-RateLimit-Reset`: UTC date time when the rate limit resets

## CORS Policy

**Allowed Origins:**
- `http://localhost:3000` (Development)
- `https://webapp.vtelltales.com` (Production)

**Allowed Methods:**
- GET, POST, PUT, DELETE, OPTIONS

**Allowed Headers:**
- Authorization, Content-Type, X-Requested-With