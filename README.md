# 📚 LearnHub - Online Learning Platform

A modern, full-stack online learning platform with a student portal and admin dashboard. Built with vanilla HTML/CSS/JavaScript and Node.js/Express.

## ✨ Features

### 🎓 Student Portal (Port 3000)
- **User Registration & Login** with validation
- **User Dashboard** with enrolled courses and progress tracking
- **Course Listing** with grid-based animated cards
- **Course Details** page with enrollment
- **Search & Filter** courses by category, level, and rating
- **Dark Mode** toggle
- **Toast Notifications**
- **Skeleton Loaders** for smooth loading experience
- **Scroll-based Animations**
- **Fully Responsive** (mobile-first design)

### 🛡️ Admin Panel (Port 3001)
- **Admin Authentication**
- **Dashboard Analytics** (total users, courses, enrollments, avg progress)
- **Visual Charts** (category distribution, top courses)
- **User Management** (view, edit, delete users)
- **Course Management** (add, edit, delete courses)
- **Enrollment Tracking** (view all enrollments with progress)
- **Real-time Updates** (auto-refresh every 10 seconds)
- **Dark Mode** support

### 🎨 UI/UX Highlights
- Glassmorphism design with soft shadows
- Gradient accents on clean backgrounds
- Smooth CSS animations and transitions
- Interactive hover effects
- Premium typography (Inter font)
- Skeleton loading states
- Toast notification system

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript |
| **Backend** | Node.js, Express.js |
| **Database** | JSON-based local storage |
| **Design** | CSS Flexbox, Grid, Animations |
| **Fonts** | Google Fonts (Inter) |

## 📂 Project Structure

```
├── client/                  # Student Portal Frontend
│   ├── css/
│   │   └── style.css       # Complete design system
│   ├── js/
│   │   ├── utils.js        # Shared utilities
│   │   ├── app.js          # Home page logic
│   │   ├── auth.js         # Login/Register
│   │   ├── courses.js      # Course listing
│   │   ├── course-detail.js # Course detail
│   │   └── dashboard.js    # User dashboard
│   ├── index.html          # Landing page
│   ├── courses.html        # Course catalog
│   ├── course.html         # Course details
│   ├── dashboard.html      # User dashboard
│   ├── login.html          # Login page
│   └── register.html       # Registration page
│
├── admin/                   # Admin Panel Frontend
│   ├── css/
│   │   └── admin.css       # Admin design system
│   ├── js/
│   │   ├── admin-utils.js     # Admin utilities
│   │   ├── admin-dashboard.js # Dashboard analytics
│   │   ├── admin-users.js     # User management
│   │   ├── admin-courses.js   # Course management
│   │   └── admin-enrollments.js # Enrollment tracking
│   ├── index.html          # Admin login
│   ├── dashboard.html      # Admin dashboard
│   ├── users.html          # User management
│   ├── courses.html        # Course management
│   └── enrollments.html    # Enrollment tracking
│
├── server/                  # Backend
│   ├── server.js           # API server (Port 5000)
│   ├── client-server.js    # Student portal server (Port 3000)
│   ├── admin-server.js     # Admin panel server (Port 3001)
│   └── db.json             # JSON database
│
├── package.json
└── README.md
```

## 🚀 Setup Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) (v14 or higher)
- npm (comes with Node.js)

### Installation

1. **Clone or download the project**
   ```bash
   cd "Pranjali Sangve"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the project**
   ```bash
   npm run dev
   ```

   This single command starts all three servers simultaneously:
   - 📚 Student Portal: http://localhost:3000
   - 🛡️ Admin Panel: http://localhost:3001
   - 🚀 API Server: http://localhost:5000

## 🔑 Demo Credentials

### Student Login
| Field | Value |
|-------|-------|
| Email | `student@demo.com` |
| Password | `demo1234` |

### Admin Login
| Field | Value |
|-------|-------|
| Email | `admin@learnhub.com` |
| Password | `admin123` |

## 🌐 Ports Information

| Service | Port | URL |
|---------|------|-----|
| Student Portal | 3000 | http://localhost:3000 |
| Admin Panel | 3001 | http://localhost:3001 |
| API Server | 5000 | http://localhost:5000 |

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/admin-login` | Admin login |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users |
| GET | `/api/users/:id` | Get single user |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |

### Courses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/courses` | Get all courses (with search/filter/sort) |
| GET | `/api/courses/:id` | Get single course |
| POST | `/api/courses` | Create course |
| PUT | `/api/courses/:id` | Update course |
| DELETE | `/api/courses/:id` | Delete course |

### Enrollments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/enrollments` | Get all enrollments |
| GET | `/api/enrollments/user/:userId` | Get user enrollments |
| POST | `/api/enrollments` | Enroll in course |
| PUT | `/api/enrollments/:id` | Update progress |
| DELETE | `/api/enrollments/:id` | Remove enrollment |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics` | Get platform analytics |

## 📸 Screenshots

### Student Portal
![Landing Page](screenshots/landing.png)
<br>
![Course Catalog](screenshots/catalog.png)
<br>
![Student Dashboard](screenshots/dashboard.png)

### Admin Panel
![Admin Dashboard](screenshots/admin-dashboard.png)
<br>
![User Management](screenshots/admin-users.png)

## 👩‍💻 Credits

**Developed by:** Prathamesh Giri  
📧 **Email:** [contact@prathameshgiri.in](mailto:contact@prathameshgiri.in)  
🌐 **Website:** [https://prathameshgiri.in/](https://prathameshgiri.in/) | [https://build.prathameshgiri.in/](https://build.prathameshgiri.in/)

**Developed for:** Pranjali Sangve

---

*Built with ❤️ for the Online Learning Platform project*
