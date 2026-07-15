# 🚌  - MERN Bus Booking Platform

GoBus is a full-stack MERN (MongoDB, Express.js, React.js, Node.js) bus booking platform designed to connect passengers and bus operators through a modern and user-friendly interface. The project includes secure authentication, password recovery using OTP, and separate dashboards for different types of users.

---

## 🚀 Features

### 🔐 Authentication

* User Registration and Login
* JWT-based Authentication
* Password Hashing using bcrypt
* Forgot Password with Email OTP Verification
* Reset Password Functionality

### 👤 User Features

* User Signup and Login
* Secure Dashboard Access
* Update Profile
* Book Bus Tickets (Upcoming)
* View Booking History (Upcoming)

### 🏢 Operator Features (Upcoming)

* Operator Registration and Login
* Add and Manage Buses
* Manage Bookings
* Revenue Dashboard

### 🛠️ Admin Features (Upcoming)

* Admin Dashboard
* Manage Users
* Manage Operators
* View Platform Revenue
* Analytics and Reports

---

## 🏗️ Tech Stack

### Frontend

* React.js
* Vite
* Material UI (MUI)
* CSS3

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* bcryptjs
* Nodemailer

### Database

* MongoDB

---

## 📂 Project Structure

```bash
gobus/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── config/
│   └── server.js
│
├── .gitignore
└── README.md
```

---

## ⚙️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/gobus.git
cd gobus
```

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 3. Install Backend Dependencies

```bash
cd ../backend
npm install
```

---

## 🔑 Environment Variables

Create a `.env` file inside the `backend` folder.

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/gobus_db
JWT_SECRET=your_secret_key

EMAIL=yourgmail@gmail.com
EMAIL_PASS=your_gmail_app_password
```

---

## ▶️ Run the Backend

```bash
cd backend
npm start
```

or

```bash
nodemon server.js
```

---

## ▶️ Run the Frontend

```bash
cd frontend
npm run dev
```

---

## 🌐 Application URLs

Frontend:

```bash
http://localhost:5173
```

Backend:

```bash
http://localhost:5000
```

---

## 🔗 API Endpoints

### Authentication

#### Signup

```http
POST /api/auth/signup
```

#### Login

```http
POST /api/auth/login
```

#### Forgot Password

```http
POST /api/auth/forgot-password
```

#### Verify OTP

```http
POST /api/auth/verify-otp
```

#### Reset Password

```http
POST /api/auth/reset-password
```

---

## 🔒 Security Features

* JWT Authentication
* Password Encryption with bcrypt
* Protected Routes
* Environment Variables
* OTP Expiry Validation
* Secure Password Reset Flow

---

## 📸 Screenshots

* Login Page
* Signup Page
* Forgot Password Page
* Dashboard
* Admin Dashboard (Upcoming)
* Operator Dashboard (Upcoming)

---

## 🚧 Future Enhancements

* Bus Search and Booking System
* Payment Gateway Integration
* Seat Selection
* Live Bus Tracking
* Push Notifications
* Google Login
* Booking History
* Reviews and Ratings
* Mobile Application using Flutter

---

## 👨‍💻 Author

**Yash Sharma**

* Full Stack Developer
* B.Tech Computer Science Student
* MERN Stack Developer

---

## 📄 License

This project is licensed under the MIT License.

---

⭐ If you like this project, don't forget to give it a star on GitHub!
