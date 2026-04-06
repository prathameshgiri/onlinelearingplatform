// ===== COURSE DETAIL PAGE SCRIPT =====

let selectedRating = 0;
let currentCourseId = null;

// Curriculum data for courses (tags-based dynamic generation + custom modules)
const curriculumMap = {
  'c1': ['HTML5 Fundamentals & Semantic Markup', 'CSS3 Flexbox, Grid & Animations', 'JavaScript ES6+ Core Concepts', 'DOM Manipulation & Event Handling', 'React.js Components & Hooks', 'State Management with Context API', 'Node.js & Express Backend', 'MongoDB Database & Mongoose ODM', 'REST API Design & Implementation', 'Authentication with JWT', 'Deployment on Vercel & Render', 'Building 25+ Real-World Projects'],
  'c2': ['Python Programming Fundamentals', 'NumPy for Numerical Computing', 'Data Analysis with Pandas', 'Data Visualization - Matplotlib & Seaborn', 'Statistical Analysis & Probability', 'Machine Learning with Scikit-Learn', 'Supervised Learning - Regression & Classification', 'Unsupervised Learning - Clustering & PCA', 'Deep Learning with TensorFlow', 'Neural Networks with PyTorch', 'Natural Language Processing (NLP)', 'Real-World ML Project Deployment'],
  'c3': ['Design Thinking & UX Principles', 'User Research & Persona Creation', 'Information Architecture', 'Wireframing Techniques', 'Figma Interface & Tools Mastery', 'Component Design & Auto Layout', 'Prototyping & Micro-interactions', 'Color Theory & Typography', 'Design Systems & Style Guides', 'Adobe XD Fundamentals', 'Accessibility (WCAG) Standards', 'Portfolio Building & Presentation'],
  'c4': ['AWS Cloud Fundamentals & IAM', 'EC2 Instances & Auto Scaling', 'S3 Storage & CloudFront CDN', 'VPC Networking & Security Groups', 'Lambda Serverless Functions', 'DynamoDB & RDS Databases', 'API Gateway & Route 53', 'CloudWatch Monitoring & Logging', 'Elastic Beanstalk Deployment', 'Infrastructure as Code (CloudFormation)', 'Cost Optimization Strategies', 'SAA Certification Practice Tests'],
  'c5': ['Dart Programming Language Basics', 'Flutter Widgets & Layouts', 'State Management with Provider', 'Advanced State - Riverpod', 'Navigation & Routing', 'REST API Integration', 'Firebase Authentication & Firestore', 'Push Notifications (FCM)', 'Animations & Custom Painters', 'Platform Channels & Native Code', 'App Store Publishing (iOS & Android)', 'Testing & Debugging Techniques'],
  'c6': ['Introduction to Cybersecurity', 'Kali Linux Setup & Tools', 'Network Fundamentals & Scanning', 'Information Gathering & OSINT', 'Vulnerability Assessment', 'Exploitation with Metasploit', 'Web Application Hacking (OWASP)', 'Wireless Network Security', 'Cryptography & Encryption', 'Social Engineering Techniques', 'Burp Suite & Wireshark Labs', 'CEH Exam Preparation'],
  'c7': ['Digital Marketing Fundamentals', 'SEO - On-Page & Off-Page', 'Google Ads (Search & Display)', 'Facebook & Instagram Ads', 'Social Media Marketing Strategy', 'Content Marketing & Blogging', 'Email Marketing & Automation', 'YouTube Marketing & Video SEO', 'Google Analytics & Data Analysis', 'Affiliate Marketing', 'Marketing Funnel Building', 'Real Campaign Management Project'],
  'c8': ['Blockchain Technology Fundamentals', 'Ethereum & Smart Contracts', 'Solidity Programming Language', 'Development with Hardhat', 'Web3.js & Ethers.js Integration', 'ERC-20 Token Creation', 'ERC-721 NFT Development', 'DeFi Protocols & Concepts', 'DAO Governance Systems', 'IPFS & Decentralized Storage', 'Security Auditing & Testing', 'NFT Marketplace Final Project'],
  'c9': ['React.js Hooks Deep Dive', 'Context API & Custom Hooks', 'Redux Toolkit & RTK Query', 'React Router v6 Advanced', 'Next.js 14 App Router', 'Server Components & Streaming', 'API Routes & Middleware', 'SSR, SSG, ISR Strategies', 'TypeScript with React', 'Tailwind CSS Integration', 'Authentication & Authorization', 'Production Deployment'],
  'c10': ['Java Fundamentals & OOP', 'Collections Framework', 'Exception Handling & Generics', 'Streams API & Lambda Expressions', 'Multithreading & Concurrency', 'JDBC & Database Connectivity', 'Spring Boot Fundamentals', 'REST API Development', 'Spring Security & JWT', 'Microservices Architecture', 'JUnit 5 Testing', 'Maven/Gradle Build Tools']
};

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('id');
  currentCourseId = courseId;

  if (!courseId) {
    window.location.href = 'courses.html';
    return;
  }

  try {
    const course = await api(`/courses/${courseId}`);
    renderCourseDetail(course);

    // Load instructor
    loadInstructor(course.instructor);

    // Generate curriculum
    renderCurriculum(course);

    // Load reviews
    loadReviews(courseId);

    // Setup review form
    setupReviewForm(courseId);

    // Check enrollment status
    const user = getUser();
    if (user) {
      const enrollments = await api(`/enrollments/user/${user.id}`);
      const enrolled = enrollments.find(e => e.courseId === courseId);
      if (enrolled) {
        const btn = document.getElementById('enrollBtn');
        btn.textContent = `✓ Enrolled (${enrolled.progress}% complete)`;
        btn.classList.add('enrolled');
        btn.onclick = null;
      }
    }
  } catch (err) {
    console.error(err);
    showToast('Failed to load course details', 'error');
  }

  hideLoader();
});

function renderCourseDetail(course) {
  document.title = `${course.title} - LearnHub`;
  document.getElementById('breadcrumbTitle').textContent = course.title;
  document.getElementById('courseTitle').textContent = course.title;
  document.getElementById('courseDescription').textContent = course.description;

  const img = document.getElementById('courseImage');
  img.src = course.image;
  img.alt = course.title;

  document.getElementById('coursePrice').innerHTML = `${formatPrice(course.price)} <small>one-time</small>`;

  // Meta
  const meta = document.getElementById('courseMeta');
  meta.innerHTML = `
    <div class="course-detail-meta-item"><span class="icon">👤</span> ${course.instructor}</div>
    <div class="course-detail-meta-item"><span class="icon">⭐</span> ${course.rating} rating</div>
    <div class="course-detail-meta-item"><span class="icon">👥</span> ${course.students.toLocaleString()} students</div>
    <div class="course-detail-meta-item"><span class="icon">⏱</span> ${course.duration}</div>
    <div class="course-detail-meta-item"><span class="icon">📖</span> ${course.lessons} lessons</div>
    <div class="course-detail-meta-item"><span class="icon">📊</span> ${course.level}</div>
  `;

  // Tags
  const tags = document.getElementById('courseTags');
  if (course.tags && course.tags.length) {
    tags.innerHTML = course.tags.map(t => `<span class="course-tag">${t}</span>`).join('');
  }

  // Sidebar features
  const features = document.getElementById('sidebarFeatures');
  features.innerHTML = `
    <li><span class="icon">⏱</span> ${course.duration} of content</li>
    <li><span class="icon">📖</span> ${course.lessons} lessons</li>
    <li><span class="icon">📊</span> ${course.level} level</li>
    <li><span class="icon">📱</span> Access on mobile</li>
    <li><span class="icon">🏆</span> Certificate of completion</li>
    <li><span class="icon">♾️</span> Lifetime access</li>
  `;
}

// ===== INSTRUCTOR SECTION =====
async function loadInstructor(instructorName) {
  try {
    const instructor = await api(`/instructors/${encodeURIComponent(instructorName)}`);
    const card = document.getElementById('instructorCard');

    document.getElementById('instructorImage').src = instructor.image || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&h=200&fit=crop&crop=face';
    document.getElementById('instructorImage').alt = instructor.name;
    document.getElementById('instructorName').textContent = instructor.name;
    document.getElementById('instructorBio').textContent = instructor.bio;

    const expertiseEl = document.getElementById('instructorExpertise');
    expertiseEl.innerHTML = (instructor.expertise || []).map(e =>
      `<span style="padding: 3px 10px; background: rgba(162,155,254,0.15); color: var(--primary-light); border-radius: 50px; font-size: 0.72rem; font-weight: 600;">${e}</span>`
    ).join('');

    const statsEl = document.getElementById('instructorStats');
    statsEl.innerHTML = `
      <span>📚 <strong>${instructor.courses}</strong> Courses</span>
      <span>👥 <strong>${instructor.students?.toLocaleString()}</strong> Students</span>
      <span>⭐ <strong>${instructor.rating}</strong> Rating</span>
    `;

    card.style.display = 'block';
  } catch (err) {
    console.error('Failed to load instructor:', err);
  }
}

// ===== CURRICULUM SECTION =====
function renderCurriculum(course) {
  const section = document.getElementById('curriculumSection');
  const grid = document.getElementById('curriculumGrid');

  // Use predefined curriculum or generate from tags/description
  let topics = curriculumMap[course.id];

  if (!topics) {
    // Auto-generate from tags and course info
    topics = [];
    if (course.tags && course.tags.length) {
      course.tags.forEach(tag => {
        topics.push(`${tag} - Fundamentals & Concepts`);
        topics.push(`${tag} - Hands-on Projects`);
      });
    }
    // Add generic topics
    topics.push('Practice Exercises & Quizzes');
    topics.push('Final Capstone Project');
  }

  grid.innerHTML = topics.map((topic, i) => `
    <div class="curriculum-item" style="animation-delay: ${i * 0.05}s;">
      <div class="curriculum-check">✓</div>
      <span class="curriculum-text">${topic}</span>
    </div>
  `).join('');

  section.style.display = 'block';
}

// ===== REVIEWS SECTION =====
async function loadReviews(courseId) {
  try {
    const reviews = await api(`/reviews/${courseId}`);
    renderReviews(reviews);
  } catch (err) {
    console.error('Failed to load reviews:', err);
  }
}

function renderReviews(reviews) {
  const list = document.getElementById('reviewsList');
  const noReviews = document.getElementById('noReviews');
  const summary = document.getElementById('reviewSummary');

  if (reviews.length === 0) {
    noReviews.style.display = 'block';
    summary.textContent = 'No reviews yet - be the first to share your experience!';
    return;
  }

  noReviews.style.display = 'none';

  // Calculate summary
  const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
  summary.textContent = `${avgRating} ⭐ average rating from ${reviews.length} student${reviews.length > 1 ? 's' : ''}`;

  list.innerHTML = reviews.map(r => reviewCardHTML(r)).join('');
}

function reviewCardHTML(review, isNew = false) {
  const date = new Date(review.createdAt);
  const timeAgo = getTimeAgo(date);
  const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);

  return `
    <div class="review-card ${isNew ? 'new-review-highlight' : ''}">
      <div class="review-card-header">
        <div class="review-avatar">${review.userAvatar || '?'}</div>
        <div>
          <div class="review-name">${review.userName}</div>
          <div class="review-date">${timeAgo}</div>
        </div>
        <div class="review-stars" style="margin-left: auto;">${stars}</div>
      </div>
      <p class="review-comment">${review.comment}</p>
    </div>
  `;
}

function getTimeAgo(date) {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  const months = Math.floor(diff / 2592000000);

  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min${mins > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ===== REVIEW FORM =====
function setupReviewForm(courseId) {
  const user = getUser();
  const formContainer = document.getElementById('reviewFormContainer');
  const loginPrompt = document.getElementById('reviewLoginPrompt');

  if (user) {
    formContainer.style.display = 'block';
    loginPrompt.style.display = 'none';
  } else {
    formContainer.style.display = 'none';
    loginPrompt.style.display = 'block';
  }
}

function setRating(rating) {
  selectedRating = rating;
  document.getElementById('ratingValue').value = rating;
  const stars = document.querySelectorAll('.star-btn');
  stars.forEach(star => {
    const r = parseInt(star.dataset.rating);
    star.textContent = r <= rating ? '★' : '☆';
    star.classList.toggle('active', r <= rating);
  });
}

async function submitReview(e) {
  e.preventDefault();
  const user = getUser();
  if (!user) {
    showToast('Please log in to submit a review', 'warning');
    return;
  }

  if (selectedRating === 0) {
    showToast('Please select a rating', 'warning');
    return;
  }

  const comment = document.getElementById('reviewComment').value.trim();
  if (!comment) {
    showToast('Please write your feedback', 'warning');
    return;
  }

  const btn = document.getElementById('submitReviewBtn');
  btn.disabled = true;
  btn.textContent = 'Submitting...';

  try {
    const result = await api('/reviews', {
      method: 'POST',
      body: JSON.stringify({
        userId: user.id,
        courseId: currentCourseId,
        rating: selectedRating,
        comment
      })
    });

    // Add the new review to the top of the list immediately
    const list = document.getElementById('reviewsList');
    const noReviews = document.getElementById('noReviews');
    noReviews.style.display = 'none';

    const newReviewHTML = reviewCardHTML(result.review, true);
    list.insertAdjacentHTML('afterbegin', newReviewHTML);

    // Update summary
    const allReviewCards = list.querySelectorAll('.review-card');
    const summary = document.getElementById('reviewSummary');
    summary.textContent = `${allReviewCards.length} student review${allReviewCards.length > 1 ? 's' : ''}`;

    // Reset form
    document.getElementById('reviewComment').value = '';
    setRating(0);

    // Hide form (already reviewed)
    document.getElementById('reviewFormContainer').style.display = 'none';

    showToast('🎉 Your review has been posted!', 'success');

    // Scroll to the new review
    const newCard = list.firstElementChild;
    if (newCard) {
      newCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Remove highlight after 3 seconds
    setTimeout(() => {
      if (newCard) newCard.classList.remove('new-review-highlight');
    }, 3000);

  } catch (err) {
    showToast(err.message, 'error');
    btn.disabled = false;
    btn.textContent = 'Submit Review';
  }
}

async function handleEnroll() {
  const user = getUser();
  if (!user) {
    showToast('Please log in to enroll', 'warning');
    setTimeout(() => window.location.href = 'login.html', 1000);
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('id');

  const btn = document.getElementById('enrollBtn');
  btn.disabled = true;
  btn.textContent = 'Enrolling...';

  try {
    await api('/enrollments', {
      method: 'POST',
      body: JSON.stringify({ userId: user.id, courseId })
    });

    btn.textContent = '✓ Enrolled Successfully!';
    btn.classList.add('enrolled');
    btn.onclick = null;
    showToast('🎉 Successfully enrolled! Happy learning!', 'success');
  } catch (err) {
    showToast(err.message, 'error');
    btn.disabled = false;
    btn.textContent = 'Enroll Now';
  }
}
