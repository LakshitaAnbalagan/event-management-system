# Event Management System - New Features API Documentation

## Overview
This document covers the new API endpoints for the enhanced event management features:
1. **Detailed Registration Management** - View comprehensive registration details
2. **Attendance Tracking System** - Mark and manage participant attendance
3. **Prize/Winner Management** - Award and manage prizes for events

---

## Authentication
All admin endpoints require authentication with admin privileges:
```
Authorization: Bearer <admin_jwt_token>
```

---

## 1. Detailed Registration Management

### Get Detailed Event Registrations
**Endpoint:** `GET /api/admin/events/:eventId/registrations/detailed`

**Description:** Fetch comprehensive registration details including attendance and prize information.

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 20) - Items per page
- `status` (string) - Filter by registration status: 'all', 'submitted', 'approved', 'rejected'
- `registrationType` (string) - Filter by type: 'all', 'individual', 'team'
- `search` (string) - Search in email, phone, college, department, team name, registration number

**Response:**
```json
{
  "success": true,
  "data": {
    "event": {
      "id": "eventId",
      "name": "Event Name",
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-01-02T00:00:00.000Z",
      "venue": "Event Venue",
      "registrationFee": 100
    },
    "registrations": [
      {
        "_id": "registrationId",
        "registrationNumber": "EVT-2024-01-01-0001",
        "user": {
          "name": "John Doe",
          "email": "john@example.com",
          "phone": "9876543210"
        },
        "registrationType": "individual",
        "status": "approved",
        "contactDetails": {
          "email": "john@example.com",
          "primaryPhone": "9876543210"
        },
        "academicDetails": {
          "college": "ABC College",
          "department": "Computer Science",
          "year": "3rd"
        },
        "attendance": {
          "attendanceStatus": "present",
          "checkInTime": "2024-01-01T10:00:00.000Z",
          "markedBy": {
            "name": "Admin User"
          }
        },
        "prize": {
          "prizeName": "First Prize",
          "position": "1st",
          "prizeValue": 5000
        }
      }
    ],
    "statistics": {
      "registrationStats": [
        { "_id": "approved", "count": 50 },
        { "_id": "submitted", "count": 10 }
      ],
      "attendanceStats": [
        { "_id": "present", "count": 45 },
        { "_id": "absent", "count": 5 }
      ],
      "totalRegistrations": 60
    },
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalRegistrations": 60,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

## 2. Attendance Tracking System

### Mark Attendance
**Endpoint:** `POST /api/admin/events/:eventId/registrations/:registrationId/attendance`

**Description:** Mark or update attendance for a specific registration.

**Request Body:**
```json
{
  "attendanceStatus": "present", // "present", "absent", "late"
  "notes": "Arrived on time" // Optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Attendance marked successfully",
  "data": {
    "attendance": {
      "_id": "attendanceId",
      "attendanceStatus": "present",
      "checkInTime": "2024-01-01T10:00:00.000Z",
      "notes": "Arrived on time",
      "user": {
        "name": "John Doe",
        "email": "john@example.com"
      },
      "registration": {
        "registrationNumber": "EVT-2024-01-01-0001"
      },
      "markedBy": {
        "name": "Admin User"
      },
      "markedAt": "2024-01-01T10:00:00.000Z"
    }
  }
}
```

### Get Event Attendance
**Endpoint:** `GET /api/admin/events/:eventId/attendance`

**Description:** Get attendance summary for an event.

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 20) - Items per page
- `status` (string) - Filter by attendance status: 'all', 'present', 'absent', 'late'
- `search` (string) - Search by participant name, email, or phone

**Response:**
```json
{
  "success": true,
  "data": {
    "event": {
      "id": "eventId",
      "name": "Event Name",
      "startDate": "2024-01-01T00:00:00.000Z",
      "venue": "Event Venue"
    },
    "attendance": [
      {
        "_id": "attendanceId",
        "attendanceStatus": "present",
        "checkInTime": "2024-01-01T10:00:00.000Z",
        "notes": "On time",
        "user": {
          "name": "John Doe",
          "email": "john@example.com",
          "phone": "9876543210",
          "college": "ABC College",
          "department": "Computer Science"
        },
        "registration": {
          "registrationNumber": "EVT-2024-01-01-0001",
          "registrationType": "individual"
        },
        "markedBy": {
          "name": "Admin User"
        },
        "markedAt": "2024-01-01T10:00:00.000Z"
      }
    ],
    "statistics": {
      "attendanceStats": [
        { "_id": "present", "count": 45 },
        { "_id": "absent", "count": 5 },
        { "_id": "late", "count": 3 }
      ],
      "totalRegistrations": 60,
      "attendanceMarked": 53,
      "attendanceNotMarked": 7
    },
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalAttendance": 53,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

## 3. Prize/Winner Management

### Add Event Prize
**Endpoint:** `POST /api/admin/events/:eventId/prizes`

**Description:** Add a prize for an event winner.

**Content-Type:** `multipart/form-data`

**Form Fields:**
- `prizeName` (string, required) - Name of the prize
- `prizeDescription` (string, optional) - Description of the prize
- `position` (string, required) - Prize position: '1st', '2nd', '3rd', 'participation', 'special', 'consolation'
- `prizeValue` (number, optional) - Monetary value of the prize
- `currency` (string, default: 'INR') - Currency code
- `winnerType` (string, required) - Winner type: 'individual', 'team'
- `registrationId` (string, required) - Registration ID of the winner
- `notes` (string, optional) - Additional notes
- `prizeImage` (file, optional) - Prize image file

**Response:**
```json
{
  "success": true,
  "message": "Prize added successfully",
  "data": {
    "prize": {
      "_id": "prizeId",
      "prizeName": "First Prize",
      "prizeDescription": "Best overall performance",
      "position": "1st",
      "prizeValue": 5000,
      "currency": "INR",
      "winner": {
        "type": "individual",
        "user": {
          "name": "John Doe",
          "email": "john@example.com"
        },
        "registration": {
          "registrationNumber": "EVT-2024-01-01-0001"
        }
      },
      "prizeImage": {
        "url": "https://cloudinary.com/image.jpg",
        "public_id": "prize_image_id"
      },
      "certificateIssued": false,
      "awardedBy": {
        "name": "Admin User"
      },
      "awardedAt": "2024-01-01T15:00:00.000Z"
    }
  }
}
```

### Get Event Prizes
**Endpoint:** `GET /api/admin/events/:eventId/prizes`

**Description:** Get all prizes for an event.

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 20) - Items per page
- `position` (string) - Filter by position: 'all', '1st', '2nd', '3rd', 'participation', 'special', 'consolation'

**Response:**
```json
{
  "success": true,
  "data": {
    "event": {
      "id": "eventId",
      "name": "Event Name",
      "startDate": "2024-01-01T00:00:00.000Z",
      "venue": "Event Venue"
    },
    "prizes": [
      {
        "_id": "prizeId",
        "prizeName": "First Prize",
        "position": "1st",
        "prizeValue": 5000,
        "winner": {
          "type": "individual",
          "user": {
            "name": "John Doe",
            "email": "john@example.com"
          }
        },
        "certificateIssued": true,
        "certificateNumber": "CERT-001",
        "awardedBy": {
          "name": "Admin User"
        },
        "awardedAt": "2024-01-01T15:00:00.000Z"
      }
    ],
    "statistics": {
      "prizeStats": [
        { "_id": "1st", "count": 1, "totalValue": 5000 },
        { "_id": "2nd", "count": 1, "totalValue": 3000 }
      ],
      "totalPrizes": 2
    },
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalPrizes": 2,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

### Update Prize
**Endpoint:** `PUT /api/admin/prizes/:prizeId`

**Description:** Update an existing prize.

**Content-Type:** `multipart/form-data`

**Form Fields:**
- `prizeName` (string, optional) - Name of the prize
- `prizeDescription` (string, optional) - Description of the prize
- `position` (string, optional) - Prize position
- `prizeValue` (number, optional) - Monetary value of the prize
- `currency` (string, optional) - Currency code
- `certificateIssued` (boolean, optional) - Whether certificate is issued
- `certificateNumber` (string, optional) - Certificate number
- `notes` (string, optional) - Additional notes
- `prizeImage` (file, optional) - New prize image file

**Response:**
```json
{
  "success": true,
  "message": "Prize updated successfully",
  "data": {
    "prize": {
      // Updated prize object
    }
  }
}
```

### Delete Prize
**Endpoint:** `DELETE /api/admin/prizes/:prizeId`

**Description:** Delete a prize.

**Response:**
```json
{
  "success": true,
  "message": "Prize deleted successfully"
}
```

---

## Database Models

### Attendance Model
```javascript
{
  event: ObjectId, // Reference to Event
  registration: ObjectId, // Reference to Registration
  user: ObjectId, // Reference to User
  attendanceStatus: String, // 'present', 'absent', 'late'
  checkInTime: Date,
  checkOutTime: Date,
  notes: String,
  markedBy: ObjectId, // Reference to Admin User
  markedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Prize Model
```javascript
{
  event: ObjectId, // Reference to Event
  prizeName: String,
  prizeDescription: String,
  position: String, // '1st', '2nd', '3rd', 'participation', 'special', 'consolation'
  prizeValue: Number,
  currency: String,
  winner: {
    type: String, // 'individual', 'team'
    user: ObjectId, // Reference to User (for individual)
    teamName: String, // For team winners
    teamMembers: Array, // Team member details
    registration: ObjectId // Reference to Registration
  },
  prizeImage: {
    public_id: String,
    url: String
  },
  certificateIssued: Boolean,
  certificateNumber: String,
  awardedBy: ObjectId, // Reference to Admin User
  awardedAt: Date,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Frontend Components

### 1. EventRegistrationsDetailed.jsx
- Comprehensive registration management interface
- Integrated attendance marking
- Prize assignment functionality
- Advanced filtering and search
- Real-time statistics

### 2. EventAttendance.jsx
- Attendance overview and statistics
- Attendance rate calculations
- Export functionality
- Search and filter capabilities

### 3. EventPrizes.jsx
- Prize management interface
- Winner selection from registrations
- Certificate tracking
- Prize image upload
- Comprehensive prize statistics

---

## Usage Examples

### Mark Attendance
```javascript
// Mark a participant as present
const response = await api.post(
  `/admin/events/${eventId}/registrations/${registrationId}/attendance`,
  {
    attendanceStatus: 'present',
    notes: 'Arrived on time'
  }
);
```

### Add Prize
```javascript
// Add a prize for a winner
const formData = new FormData();
formData.append('prizeName', 'First Prize');
formData.append('position', '1st');
formData.append('prizeValue', '5000');
formData.append('winnerType', 'individual');
formData.append('registrationId', 'registration_id');
formData.append('prizeImage', imageFile);

const response = await api.post(`/admin/events/${eventId}/prizes`, formData);
```

### Get Detailed Registrations
```javascript
// Get registrations with attendance and prize info
const response = await api.get(
  `/admin/events/${eventId}/registrations/detailed`,
  {
    params: {
      page: 1,
      limit: 20,
      status: 'approved',
      search: 'john'
    }
  }
);
```

---

## Error Handling

All endpoints return standardized error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Notes

1. All file uploads are handled through Cloudinary
2. Attendance can be marked multiple times (updates existing record)
3. Prizes are linked to specific registrations
4. All admin actions are logged with user information
5. Real-time updates are supported through Socket.IO events
6. Pagination is implemented for all list endpoints
7. Search functionality supports multiple fields
8. Export functionality is available for attendance data
