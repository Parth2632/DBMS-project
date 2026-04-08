# 🚪 Visitor & Access Management System (DBMS Project)

A backend-driven system for managing visitors in a college/hostel environment.

---

## 🧠 Project Overview

This system handles the complete lifecycle of a visitor:

```
Visitor → Visit Request → Admin Approval → Entry → Exit → History
```

### Features

* Create visitor records
* Request visits to host (student/faculty/staff)
* Admin approval/rejection system
* Entry and exit tracking
* View current visitors inside campus
* Maintain full visit history

---

## 🧩 Tech Stack

* **Backend:** Node.js, Express.js
* **Database:** MySQL
* **API Testing:** Postman

---

## ⚙️ Backend Setup Guide

### 1️⃣ Clone the Repository

```bash
git clone <your-repo-url>
cd <project-folder>/backend
```

---

### 2️⃣ Install Dependencies

```bash
npm install
```

---

### 3️⃣ Create `.env` File

Create a `.env` file in the backend root folder and add:

```env
PORT=5000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=visitor_access_management
DB_PORT=3306
```

👉 Replace `your_mysql_password` with your actual MySQL password.

---

### 4️⃣ Setup MySQL Database

Run the SQL script:

```bash
database.sql
```

This will:

* Create database: `visitor_access_management`
* Create all required tables
* Insert sample data
* Setup approval, entry, and exit logs
* Provide useful SQL queries for testing

---

### 5️⃣ Run the Server

```bash
npm run dev
```

Expected output:

```bash
Connected to MySQL database
Server is running on port 5000
```

---

### 6️⃣ Test API

Open in browser:

```bash
http://localhost:5000/
```

Or use Postman for endpoints like:

```bash
POST /api/visitors
```

---

## 🛑 Important Notes

* Do **NOT** push `.env` file to GitHub
* `.env` is already ignored using `.gitignore`
* `node_modules` should not be pushed
* If dependencies fail, run:

  ```bash
  npm install
  ```

---

## 🔁 Contribution Rules

This repository is **restricted**.

❌ Direct push access is **NOT allowed**

### To contribute:

1. Fork the repository
2. Clone your fork
3. Create a new branch
4. Make changes
5. Push to your fork
6. Create a Pull Request

---

## 📁 Project Structure

```
backend/
│
├── src/
│   ├── config/        # Database connection
│   ├── controllers/   # Business logic
│   ├── routes/        # API routes
│   ├── models/        # (optional)
│   ├── middleware/    # (future use)
│   ├── utils/         # Helper functions
│   └── app.js         # Express app setup
│
├── server.js          # Entry point
├── database.sql       # MySQL schema + sample data
├── .env               # Local environment variables (not pushed)
├── .gitignore
├── package.json
```

---

## 🧪 API Overview

### Visitor API

```
POST /api/visitors
```

Create a new visitor.

---

## 📊 Database Design Highlights

* Fully normalized relational schema
* Foreign key constraints for data integrity
* ENUM-based status management
* Separate entry log system
* Optimized join queries for analytics

---

## 🚀 Current Status

### ✅ Completed

* Database schema design
* MySQL relationships & constraints
* Express server setup
* MySQL connection (pool)
* Create Visitor API

### 🔄 In Progress

* Visit Request APIs
* Admin Approval APIs
* Entry / Exit APIs
* Query APIs

---

## 🧠 Learning Outcomes

This project demonstrates:

* REST API design
* Backend architecture
* SQL + relational modeling
* Business logic implementation
* Async handling in Node.js
* Error handling and validation

---

## 📌 Future Improvements

* Authentication (JWT)
* Role-based access control
* Deployment (Render / Docker)
* Frontend UI integration

---

## 👨‍💻 Author

Built as part of DBMS + Backend Learning Project 🚀
