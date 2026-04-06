const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 5000;
const DB_PATH = path.join(__dirname, 'db.json');

// Middleware
app.use(cors());
app.use(express.json());

// --- Database Helpers ---
function readDB() {
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(raw);
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// --- Activity Logger ---
function logActivity(db, type, description) {
  if (!db.activities) db.activities = [];
  const activity = {
    id: 'a' + uuidv4().slice(0, 8),
    type,
    description,
    timestamp: new Date().toISOString()
  };
  db.activities.unshift(activity);
  
  // Keep only the last 100 activities to prevent infinite growth
  if (db.activities.length > 100) {
    db.activities = db.activities.slice(0, 100);
  }
}

// ========================
// AUTH ROUTES
// ========================

// User Registration
app.post('/api/auth/register', (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const db = readDB();
    const existingUser = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    const newUser = {
      id: 'u' + uuidv4().slice(0, 8),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      avatar: '',
      joinedAt: new Date().toISOString()
    };

    db.users.push(newUser);
    logActivity(db, 'user_registered', `New user registered: ${newUser.name} (${newUser.email})`);
    writeDB(db);

    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({ message: 'Registration successful', user: userWithoutPassword });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// User Login
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const db = readDB();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({ message: 'Login successful', user: userWithoutPassword });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin Login
app.post('/api/auth/admin-login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const db = readDB();
    const admin = db.admins.find(a => a.email.toLowerCase() === email.toLowerCase() && a.password === password);

    if (!admin) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    const { password: _, ...adminWithoutPassword } = admin;
    res.json({ message: 'Admin login successful', admin: adminWithoutPassword });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ========================
// USER ROUTES
// ========================

// Get all users
app.get('/api/users', (req, res) => {
  try {
    const db = readDB();
    const users = db.users.map(({ password, ...u }) => u);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single user
app.get('/api/users/:id', (req, res) => {
  try {
    const db = readDB();
    const user = db.users.find(u => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user
app.put('/api/users/:id', (req, res) => {
  try {
    const db = readDB();
    const index = db.users.findIndex(u => u.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'User not found' });

    const { name, email } = req.body;
    if (name) db.users[index].name = name.trim();
    if (email) db.users[index].email = email.toLowerCase().trim();

    writeDB(db);
    const { password, ...updated } = db.users[index];
    res.json({ message: 'User updated', user: updated });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete user
app.delete('/api/users/:id', (req, res) => {
  try {
    const db = readDB();
    const index = db.users.findIndex(u => u.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'User not found' });

    db.users.splice(index, 1);
    // Also remove enrollments for deleted user
    db.enrollments = db.enrollments.filter(e => e.userId !== req.params.id);
    writeDB(db);

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ========================
// COURSE ROUTES
// ========================

// Get all courses
app.get('/api/courses', (req, res) => {
  try {
    const db = readDB();
    let courses = [...db.courses];

    // Search
    const { search, category, level, sort } = req.query;
    if (search) {
      const s = search.toLowerCase();
      courses = courses.filter(c =>
        c.title.toLowerCase().includes(s) ||
        c.description.toLowerCase().includes(s) ||
        c.instructor.toLowerCase().includes(s) ||
        (c.tags && c.tags.some(t => t.toLowerCase().includes(s)))
      );
    }
    if (category) {
      courses = courses.filter(c => c.category.toLowerCase() === category.toLowerCase());
    }
    if (level) {
      courses = courses.filter(c => c.level.toLowerCase() === level.toLowerCase());
    }

    // Sort
    if (sort === 'rating') courses.sort((a, b) => b.rating - a.rating);
    else if (sort === 'students') courses.sort((a, b) => b.students - a.students);
    else if (sort === 'price-low') courses.sort((a, b) => a.price - b.price);
    else if (sort === 'price-high') courses.sort((a, b) => b.price - a.price);
    else if (sort === 'newest') courses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single course
app.get('/api/courses/:id', (req, res) => {
  try {
    const db = readDB();
    const course = db.courses.find(c => c.id === req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create course
app.post('/api/courses', (req, res) => {
  try {
    const { title, description, instructor, category, level, duration, lessons, price, image, tags } = req.body;

    if (!title || !description || !instructor || !category) {
      return res.status(400).json({ error: 'Title, description, instructor, and category are required' });
    }

    const db = readDB();
    const newCourse = {
      id: 'c' + uuidv4().slice(0, 8),
      title: title.trim(),
      description: description.trim(),
      instructor: instructor.trim(),
      category,
      level: level || 'Beginner',
      duration: duration || '0 hours',
      lessons: parseInt(lessons) || 0,
      rating: 0,
      students: 0,
      price: parseFloat(price) || 0,
      image: image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=400&fit=crop',
      tags: tags || [],
      createdAt: new Date().toISOString()
    };

    db.courses.push(newCourse);
    writeDB(db);

    res.status(201).json({ message: 'Course created', course: newCourse });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update course
app.put('/api/courses/:id', (req, res) => {
  try {
    const db = readDB();
    const index = db.courses.findIndex(c => c.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Course not found' });

    const allowed = ['title', 'description', 'instructor', 'category', 'level', 'duration', 'lessons', 'price', 'image', 'tags', 'rating'];
    allowed.forEach(field => {
      if (req.body[field] !== undefined) {
        db.courses[index][field] = req.body[field];
      }
    });

    writeDB(db);
    res.json({ message: 'Course updated', course: db.courses[index] });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete course
app.delete('/api/courses/:id', (req, res) => {
  try {
    const db = readDB();
    const index = db.courses.findIndex(c => c.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Course not found' });

    db.courses.splice(index, 1);
    db.enrollments = db.enrollments.filter(e => e.courseId !== req.params.id);
    writeDB(db);

    res.json({ message: 'Course deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ========================
// ENROLLMENT ROUTES
// ========================

// Get all enrollments
app.get('/api/enrollments', (req, res) => {
  try {
    const db = readDB();
    const enriched = db.enrollments.map(e => {
      const user = db.users.find(u => u.id === e.userId);
      const course = db.courses.find(c => c.id === e.courseId);
      return {
        ...e,
        userName: user ? user.name : 'Unknown',
        userEmail: user ? user.email : '',
        courseTitle: course ? course.title : 'Unknown',
        courseCategory: course ? course.category : ''
      };
    });
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get enrollments by user
app.get('/api/enrollments/user/:userId', (req, res) => {
  try {
    const db = readDB();
    const userEnrollments = db.enrollments
      .filter(e => e.userId === req.params.userId)
      .map(e => {
        const course = db.courses.find(c => c.id === e.courseId);
        return { ...e, course };
      });
    res.json(userEnrollments);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Enroll in course
app.post('/api/enrollments', (req, res) => {
  try {
    const { userId, courseId } = req.body;

    if (!userId || !courseId) {
      return res.status(400).json({ error: 'userId and courseId are required' });
    }

    const db = readDB();

    const userExists = db.users.find(u => u.id === userId);
    if (!userExists) return res.status(404).json({ error: 'User not found' });

    const courseExists = db.courses.find(c => c.id === courseId);
    if (!courseExists) return res.status(404).json({ error: 'Course not found' });

    const alreadyEnrolled = db.enrollments.find(e => e.userId === userId && e.courseId === courseId);
    if (alreadyEnrolled) {
      return res.status(409).json({ error: 'Already enrolled in this course' });
    }

    const enrollment = {
      id: 'e' + uuidv4().slice(0, 8),
      userId,
      courseId,
      progress: 0,
      enrolledAt: new Date().toISOString()
    };

    db.enrollments.push(enrollment);
    
    // Increment student count
    const courseIndex = db.courses.findIndex(c => c.id === courseId);
    if (courseIndex !== -1) {
      db.courses[courseIndex].students += 1;
    }
    
    logActivity(db, 'course_enrolled', `User ID ${userId} enrolled in Course ID ${courseId}`);
    writeDB(db);

    res.status(201).json({ message: 'Enrolled successfully', enrollment });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update enrollment progress
app.put('/api/enrollments/:id', (req, res) => {
  try {
    const db = readDB();
    const index = db.enrollments.findIndex(e => e.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Enrollment not found' });

    if (req.body.progress !== undefined) {
      db.enrollments[index].progress = Math.min(100, Math.max(0, parseInt(req.body.progress)));
    }

    writeDB(db);
    res.json({ message: 'Progress updated', enrollment: db.enrollments[index] });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete enrollment
app.delete('/api/enrollments/:id', (req, res) => {
  try {
    const db = readDB();
    const index = db.enrollments.findIndex(e => e.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Enrollment not found' });

    db.enrollments.splice(index, 1);
    writeDB(db);

    res.json({ message: 'Enrollment removed' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ========================
// INSTRUCTOR ROUTES
// ========================

// Get instructor by name
app.get('/api/instructors/:name', (req, res) => {
  try {
    const db = readDB();
    const instructor = (db.instructors || []).find(
      i => i.name.toLowerCase() === decodeURIComponent(req.params.name).toLowerCase()
    );
    if (!instructor) {
      return res.json({ name: req.params.name, image: '', bio: 'Expert instructor on LearnHub.', expertise: [], courses: 1, students: 0, rating: 4.5 });
    }
    res.json(instructor);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ========================
// REVIEW ROUTES
// ========================

// Get reviews for a course
app.get('/api/reviews/:courseId', (req, res) => {
  try {
    const db = readDB();
    const reviews = (db.reviews || [])
      .filter(r => r.courseId === req.params.courseId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(r => {
        const user = db.users.find(u => u.id === r.userId);
        return {
          ...r,
          userName: user ? user.name : 'Anonymous',
          userAvatar: user ? user.name.charAt(0).toUpperCase() : '?'
        };
      });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add a review
app.post('/api/reviews', (req, res) => {
  try {
    const { userId, courseId, rating, comment } = req.body;
    if (!userId || !courseId || !rating || !comment) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const db = readDB();
    if (!db.reviews) db.reviews = [];

    // Check duplicate review
    const existing = db.reviews.find(r => r.userId === userId && r.courseId === courseId);
    if (existing) {
      return res.status(409).json({ error: 'You have already reviewed this course' });
    }

    const user = db.users.find(u => u.id === userId);
    const review = {
      id: 'r' + uuidv4().slice(0, 8),
      userId,
      courseId,
      rating: Math.min(5, Math.max(1, parseInt(rating))),
      comment: comment.trim(),
      createdAt: new Date().toISOString()
    };

    db.reviews.push(review);
    logActivity(db, 'review_added', `New ${review.rating}-star review added for course ${courseId} by user ${userId}`);
    writeDB(db);

    res.status(201).json({
      message: 'Review added',
      review: {
        ...review,
        userName: user ? user.name : 'Anonymous',
        userAvatar: user ? user.name.charAt(0).toUpperCase() : '?'
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ========================
// ANALYTICS ROUTE
// ========================
app.get('/api/analytics', (req, res) => {
  try {
    const db = readDB();
    const totalUsers = db.users.length;
    const totalCourses = db.courses.length;
    const totalEnrollments = db.enrollments.length;
    const avgProgress = db.enrollments.length > 0
      ? Math.round(db.enrollments.reduce((sum, e) => sum + e.progress, 0) / db.enrollments.length)
      : 0;

    // Category distribution
    const categories = {};
    db.courses.forEach(c => {
      categories[c.category] = (categories[c.category] || 0) + 1;
    });

    // Recent enrollments (last 5)
    const recentEnrollments = db.enrollments
      .sort((a, b) => new Date(b.enrolledAt) - new Date(a.enrolledAt))
      .slice(0, 5)
      .map(e => {
        const user = db.users.find(u => u.id === e.userId);
        const course = db.courses.find(c => c.id === e.courseId);
        return {
          ...e,
          userName: user ? user.name : 'Unknown',
          courseTitle: course ? course.title : 'Unknown'
        };
      });

    // Top courses by students
    const topCourses = [...db.courses]
      .sort((a, b) => b.students - a.students)
      .slice(0, 5)
      .map(c => ({ id: c.id, title: c.title, students: c.students, rating: c.rating }));

    res.json({
      totalUsers,
      totalCourses,
      totalEnrollments,
      avgProgress,
      categories,
      recentEnrollments,
      topCourses
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ========================
// CONTACTS & ACTIVITIES
// ========================

app.get('/api/activities', (req, res) => {
  try {
    const db = readDB();
    res.json(db.activities || []);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/contacts', (req, res) => {
  try {
    const db = readDB();
    res.json(db.contacts || []);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/contacts', (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const db = readDB();
    if (!db.contacts) db.contacts = [];
    
    const contact = {
      id: 'msg_' + uuidv4().slice(0, 8),
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
      status: 'unread',
      createdAt: new Date().toISOString()
    };

    db.contacts.push(contact);
    logActivity(db, 'contact_received', `New contact message from ${contact.name} regarding "${contact.subject}"`);
    writeDB(db);

    res.status(201).json({ message: 'Message sent successfully', contact });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/contacts/:id', (req, res) => {
  try {
    const db = readDB();
    if (!db.contacts) return res.status(404).json({ error: 'Not found' });
    
    const index = db.contacts.findIndex(c => c.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Message not found' });

    db.contacts.splice(index, 1);
    writeDB(db);

    res.json({ message: 'Message deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
});
