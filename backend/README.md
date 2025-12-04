# Medical Internship Management Backend

A Node.js + Express.js backend API for the Medical Internship Management Platform.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **File Uploads**: Multer
- **Validation**: express-validator

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js      # MySQL connection pool
│   │   ├── schema.sql       # Database schema
│   │   └── migrate.js       # Migration script
│   ├── controllers/
│   │   ├── admin.controller.js
│   │   ├── application.controller.js
│   │   ├── attendance.controller.js
│   │   ├── auth.controller.js
│   │   ├── document.controller.js
│   │   ├── evaluation.controller.js
│   │   ├── hospital.controller.js
│   │   ├── logbook.controller.js
│   │   ├── message.controller.js
│   │   ├── notification.controller.js
│   │   ├── offer.controller.js
│   │   ├── service.controller.js
│   │   ├── student.controller.js
│   │   ├── tutor.controller.js
│   │   └── user.controller.js
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   ├── upload.middleware.js
│   │   └── validation.middleware.js
│   ├── routes/
│   │   └── *.routes.js
│   ├── utils/
│   │   ├── helpers.js
│   │   └── validators.js
│   └── index.js             # Main entry point
├── uploads/                  # Uploaded files directory
├── .env.example
├── package.json
└── README.md
```

## Installation

1. **Clone and navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Create MySQL database and run migrations**
   ```bash
   # Create database manually first
   mysql -u root -p -e "CREATE DATABASE internship_management;"
   
   # Run migration script
   npm run db:migrate
   ```

5. **Start the server**
   ```bash
   # Development mode (with hot reload)
   npm run dev
   
   # Production mode
   npm start
   ```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| NODE_ENV | Environment | development |
| DB_HOST | MySQL host | localhost |
| DB_PORT | MySQL port | 3306 |
| DB_USER | MySQL user | root |
| DB_PASSWORD | MySQL password | - |
| DB_NAME | Database name | internship_management |
| JWT_SECRET | JWT signing secret | - |
| JWT_EXPIRES_IN | Token expiration | 7d |
| UPLOAD_DIR | Upload directory | uploads |
| MAX_FILE_SIZE | Max file size (bytes) | 5242880 |

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login user |
| GET | /api/auth/me | Get current user |
| POST | /api/auth/change-password | Change password |
| POST | /api/auth/forgot-password | Request password reset |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/users/profile | Get own profile |
| PUT | /api/users/profile | Update profile |
| POST | /api/users/avatar | Upload avatar |
| GET | /api/users/settings | Get settings |
| PUT | /api/users/settings | Update settings |

### Students
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/students/dashboard | Student dashboard |
| GET | /api/students | List all students |
| GET | /api/students/:id | Get student details |
| GET | /api/students/:id/internships | Get student internships |
| GET | /api/students/:id/applications | Get student applications |

### Hospitals
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/hospitals/dashboard | Hospital dashboard |
| GET | /api/hospitals/students | Hospital's current students |
| GET | /api/hospitals/statistics | Hospital statistics |
| GET | /api/hospitals | List all hospitals |
| GET | /api/hospitals/:id | Get hospital details |

### Services
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/services | List services |
| GET | /api/services/:id | Get service details |
| POST | /api/services | Create service |
| PUT | /api/services/:id | Update service |
| DELETE | /api/services/:id | Delete service |

### Internship Offers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/offers | List published offers |
| GET | /api/offers/my-offers | Hospital's offers |
| GET | /api/offers/:id | Get offer details |
| POST | /api/offers | Create offer |
| PUT | /api/offers/:id | Update offer |
| DELETE | /api/offers/:id | Delete offer |
| POST | /api/offers/:id/copy | Copy offer |

### Applications
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/applications | Submit application |
| GET | /api/applications/my-applications | Student's applications |
| GET | /api/applications/received | Hospital's received applications |
| GET | /api/applications/:id | Get application details |
| PUT | /api/applications/:id/status | Update status (hospital) |
| POST | /api/applications/:id/withdraw | Withdraw application |

### Evaluations
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/evaluations | Create evaluation |
| GET | /api/evaluations/my-evaluations | Doctor's evaluations |
| GET | /api/evaluations/student | Student's evaluations |
| GET | /api/evaluations/pending | Pending evaluations |
| GET | /api/evaluations/:id | Get evaluation details |
| PUT | /api/evaluations/:id | Update evaluation |

### Attendance
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/attendance | Record attendance |
| GET | /api/attendance/my-attendance | Student's attendance |
| GET | /api/attendance/pending | Pending validations |
| GET | /api/attendance/history | Attendance history |
| PUT | /api/attendance/:id/validate | Validate attendance |

### Logbook
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/logbook | Create entry |
| GET | /api/logbook/my-entries | Student's entries |
| GET | /api/logbook/pending | Pending reviews |
| GET | /api/logbook/reviewed | Reviewed entries |
| GET | /api/logbook/:id | Get entry details |
| PUT | /api/logbook/:id | Update entry |
| DELETE | /api/logbook/:id | Delete entry |
| PUT | /api/logbook/:id/review | Review entry |

### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/messages/conversations | Get conversations |
| POST | /api/messages/conversations | Create conversation |
| GET | /api/messages/conversations/:id/messages | Get messages |
| POST | /api/messages | Send message |
| GET | /api/messages/unread | Get unread count |

### Documents
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/documents/upload | Upload document |
| GET | /api/documents | List documents |
| GET | /api/documents/:id | Get document |
| GET | /api/documents/:id/download | Download document |
| DELETE | /api/documents/:id | Delete document |
| PUT | /api/documents/:id/verify | Verify document |

### Tutors
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/tutors | List hospital tutors |
| GET | /api/tutors/:id | Get tutor details |
| POST | /api/tutors | Add tutor |
| PUT | /api/tutors/:id | Update tutor |
| DELETE | /api/tutors/:id | Remove tutor |
| POST | /api/tutors/assign | Assign student |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/notifications | Get notifications |
| PUT | /api/notifications/:id/read | Mark as read |
| PUT | /api/notifications/read-all | Mark all as read |
| DELETE | /api/notifications/:id | Delete notification |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/dashboard | Dashboard stats |
| GET | /api/admin/users | List users |
| POST | /api/admin/users | Create user |
| PUT | /api/admin/users/:id | Update user |
| DELETE | /api/admin/users/:id | Delete user |
| GET | /api/admin/logs | Activity logs |
| GET | /api/admin/statistics | System statistics |

## Sample Requests

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "password123",
    "first_name": "John",
    "last_name": "Doe",
    "role": "student"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "password123"
  }'
```

### Get Offers (with auth)
```bash
curl -X GET http://localhost:5000/api/offers \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Submit Application
```bash
curl -X POST http://localhost:5000/api/applications \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "offer_id": "uuid-of-offer",
    "cover_letter": "I am interested in this position...",
    "motivation": "My motivation is..."
  }'
```

### Upload Document
```bash
curl -X POST http://localhost:5000/api/documents/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "document=@/path/to/cv.pdf" \
  -F "type=cv"
```

## Roles & Permissions

| Role | Description |
|------|-------------|
| student | Can apply to internships, manage logbook, view evaluations |
| doctor | Can evaluate students, validate attendance, review logbooks |
| hospital | Can manage offers, services, tutors, review applications |
| admin | Full system access, user management, statistics |

## Default Admin Account

After running migrations, a default admin account is created:
- **Email**: admin@example.com
- **Password**: password

**⚠️ Change this password immediately in production!**

## Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address"
    }
  ]
}
```

## Success Response Format

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

## License

MIT
