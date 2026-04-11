# Visitor & Access Management System (VAMS)

A complete web-based visitor and access management system for college/hostel environments. Built with **React + Vite** (frontend) and **Node.js + Express** (backend) with **MySQL** database.

---

## Overview

VAMS manages the complete visitor lifecycle:
1. **Register visitors** with ID proof
2. **Register hosts** (students, faculty, staff)
3. **Create visit requests** with purpose
4. **Admin approval/rejection** workflow
5. **Check-in/Check-out** tracking at gate
6. **Dashboard analytics** and **visit history**

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite 5 + React Router 6 |
| Backend | Node.js + Express 5 |
| Database | MySQL 8.0+ |
| Styling | Custom CSS (responsive) |

---

## Project Structure

```
dbms_project/
├── Backend/
│   ├── src/
│   │   ├── config/db.js         # MySQL connection
│   │   ├── controllers/        # Business logic
│   │   ├── routes/            # API routes
│   │   ├── middlewares/       # Error handling
│   │   └── app.js            # Express app setup
│   ├── database.sql           # Schema + sample data
│   ├── server.js            # Entry point
│   ├── package.json
│   └── .env                 # Environment config
│
├── Frontend/
│   ├── src/
│   │   ├── components/       # Reusable modals
│   │   ├── context/        # React context
│   │   ├── pages/         # Page components
│   │   ├── services/       # API client
│   │   ├── App.jsx        # Main app + routing
│   │   └── App.css       # All styles
│   ├── index.html
│   ├── vite.config.js       # Vite config + proxy
│   └── package.json
│
├── README.md
└── .gitignore
```

---

## Database Schema

### Tables

**1. visitor** - External visitors
| Column | Type | Description |
|--------|------|------------|
| visitor_id | INT PK | Auto-increment ID |
| full_name | VARCHAR(100) | Visitor name |
| phone_no | VARCHAR(15) | Contact number |
| email | VARCHAR(100) | Email (unique) |
| id_proof_type | VARCHAR(50) | Aadhar/PAN/Driving License/Passport/Voter ID |
| id_proof_number | VARCHAR(50) | ID number (unique) |

**2. host** - People being visited
| Column | Type | Description |
|--------|------|------------|
| host_id | INT PK | Auto-increment ID |
| full_name | VARCHAR(100) | Host name |
| department | VARCHAR(100) | Department (optional) |
| phone_no | VARCHAR(15) | Contact number |
| email | VARCHAR(100) | Email (unique) |
| host_type | ENUM | Student/Faculty/Staff |
| roll_number | VARCHAR(20) | Student roll number (unique, optional) |

**3. admin** - Administrators/security
| Column | Type | Description |
|--------|------|------------|
| admin_id | INT PK | Auto-increment ID |
| full_name | VARCHAR(100) | Admin name |
| email | VARCHAR(100) | Email (unique) |
| phone_no | VARCHAR(15) | Contact number |
| role | ENUM | Security/Admin/SuperAdmin |

**4. visit_request** - Visit requests
| Column | Type | Description |
|--------|------|------------|
| request_id | INT PK | Auto-increment ID |
| visitor_id | INT FK | Reference to visitor |
| host_id | INT FK | Reference to host |
| visit_date | DATE | Scheduled visit date |
| purpose | VARCHAR(255) | Reason for visit |
| approval_status | ENUM | Pending → Approved/Rejected/Completed |
| requested_at | DATETIME | Request creation time |
| approved_by_admin_id | INT FK | Admin who approved/rejected |
| approval_time | DATETIME | Approval/rejection time |
| rejection_reason | VARCHAR(255) | Reason if rejected |

**5. entry_log** - Check-in/check-out tracking
| Column | Type | Description |
|--------|------|------------|
| log_id | INT PK | Auto-increment ID |
| request_id | INT FK UNIQUE | Reference to visit_request |
| entry_time | DATETIME | Check-in time |
| exit_time | DATETIME | Check-out time (null if inside) |

---

## API Endpoints

### Visitors
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/visitors` | Get all visitors |
| GET | `/api/visitors/:id` | Get single visitor |
| POST | `/api/visitors` | Create visitor |
| PUT | `/api/visitors/:id` | Update visitor |
| DELETE | `/api/visitors/:id` | Delete visitor |

### Hosts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/hosts` | Get all hosts |
| GET | `/api/hosts/:id` | Get single host |
| POST | `/api/hosts` | Create host |
| PUT | `/api/hosts/:id` | Update host |
| DELETE | `/api/hosts/:id` | Delete host |

### Visit Requests
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/visit-requests` | Get all requests (optional `?status=Pending`) |
| GET | `/api/visit-requests/:id` | Get single request |
| POST | `/api/visit-requests` | Create new request |
| PATCH | `/api/visit-requests/:id/approve` | Approve request |
| PATCH | `/api/visit-requests/:id/reject` | Reject request |

### Entry/Exit
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/entry-exit/current-visitors` | Visitors currently inside |
| PATCH | `/api/entry-exit/:id/checkin` | Check-in visitor |
| PATCH | `/api/entry-exit/:id/checkout` | Check-out visitor |
| GET | `/api/entry-exit/history` | Visit history (`?start_date=...&end_date=...`) |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Total visitors, hosts, pending requests, current inside |
| GET | `/api/dashboard/recent-activity` | Recent activity feed |

---

## Frontend Pages

1. **Dashboard** - Stats cards + recent activity + quick actions
2. **Visitors** - Add/view/delete visitors
3. **Hosts** - Add/view/delete hosts (Student/Faculty/Staff)
4. **Visit Requests** - Create + approve/reject requests
5. **Entry/Exit** - Check-in/check-out visitors + current inside list
6. **History** - Filter by date range

---

## How It Works

### Complete Workflow

```
1. SECURITY/ADMIN adds a VISITOR
   → Name, phone, email, ID proof

2. SECURITY/ADMIN adds a HOST (Student/Faculty/Staff)
   → Name, department, contact, type

3. Someone creates a VISIT REQUEST
   → Select visitor + host + date + purpose

4. ADMIN reviews and APPROVES or REJECTS
   → If rejected, provide reason

5. At gate: SECURITY checks in approved visitor
   → Records entry time

6. Visitor meets host, then checks out
   → Records exit time, marks visit complete

7. View ANALYTICS on dashboard
   → Stats, activity log, history
```

### Check-in Logic
- Only `Approved` requests can be checked in
- Check-in creates `entry_log` record
- Check-out sets exit time + marks request `Completed`
- Current visitors = `entry_log.exit_time IS NULL`

### Time Tracking
- `entry_time` recorded at check-in
- `exit_time` recorded at check-out
- `minutes_inside` calculated dynamically
- `total_visit_minutes` stored on completion

---

## Setup Instructions

### 1. Database Setup
```bash
# Create database and tables
mysql -u root -p < Backend/database.sql
```

### 2. Backend Setup
```bash
cd Backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your MySQL credentials:
# PORT=5000
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=your_password
# DB_NAME=visitor_access_management
# DB_PORT=3306

# Run in development mode
npm run dev

# OR production
npm start
```

### 3. Frontend Setup
```bash
cd Frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Access at http://localhost:5173
```

**Backend runs on port 5000**
**Frontend runs on port 5173** (proxies API to backend)

---

## Sample Data

The `database.sql` includes sample data:

- **Visitors**: Rahul Sharma, Priya Verma, Aman Gupta
- **Hosts**: Parth (Student), Dr. Mehta (Faculty), Rohit (Staff)
- **Admins**: Security Head, Main Admin
- **Requests**: Mix of Pending, Approved, Rejected, Completed

---

## Environment Variables

**Backend (.env)**:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=visitor_access_management
DB_PORT=3306
```

**Frontend (vite.config.js)**:
- Already configured to proxy `/api` → `http://localhost:5000`

---

## Key Features

| Feature | Description |
|---------|-------------|
| Multi-role hosts | Student/Faculty/Staff with roll numbers |
| Approval workflow | Pending → Approved/Rejected + reason |
| Real-time tracking | Current visitors + minutes inside |
| Dashboard analytics | Stats cards + activity feed |
| Date range filters | History by start/end date |
| Responsive design | Works on mobile/tablet/desktop |
| Toast notifications | Success/error feedback |
| Modal forms | Add visitor/host/request |

---

## Common Issues

| Issue | Solution |
|-------|----------|
| Database connection failed | Check MySQL running + credentials in `.env` |
| CORS errors | Ensure frontend uses Vite dev server |
| 404 on API | Verify backend running on port 5000 |
| Empty tables | Run `database.sql` to create schema |

---

## Future Enhancements

- User authentication (login)
- QR code visitor passes
- Email/SMS notifications
- Photo capture for visitors
- Multiple gate entry points
- Export to CSV/PDF
- Visit scheduling with time slots

---

## License

Educational/demo project. For production deployment, add:
- User authentication
- Input validation
- Error monitoring
- Rate limiting
- Audit logging

---

**Questions?** Check `Backend/database.sql` for complete schema documentation.