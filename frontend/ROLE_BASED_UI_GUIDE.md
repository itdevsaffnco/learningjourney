# Role-Based UI Implementation Guide - SAFF & Co. LMS

## Overview
This guide explains how to implement role-based UI/navigation in the React frontend based on the user's role.

---

## Role Structure

```
┌─────────────────────────────────────┐
│         AUTHENTICATED USER          │
└────────────┬────────────────────────┘
             │
    ┌────────┼────────┐
    │        │        │
    ▼        ▼        ▼
[ADMIN]  [TRAINER]  [STAFF]
```

---

## Navigation by Role

### ADMIN Navigation
```
├── Dashboard (System Overview)
├── User Management
│   ├── All Users
│   ├── Create User
│   └── Edit User
├── Roles & Permissions
├── Divisions
│   ├── All Divisions
│   ├── Create Division
│   └── Edit Division
├── Content Moderation
│   ├── Pending Approval
│   ├── Review Submissions
│   └── Rejected Content
├── Analytics & Reports
│   ├── Organization Overview
│   ├── By Division
│   ├── Engagement Metrics
│   └── Completion Rates
├── Announcements (System-wide)
├── System Settings
└── Logout
```

### TRAINER Navigation
```
├── Dashboard (My Courses & Students)
├── My Learning (Continue own learning)
├── Learning Path
├── Courses
│   ├── My Courses (Created by me)
│   ├── All Courses (Browsable)
│   └── Create New Course
├── Modules
│   ├── Manage Modules
│   └── Create Module
├── Quizzes
│   ├── My Quizzes
│   ├── Create Quiz
│   └── Manage Quiz Questions
├── Assignments
│   ├── My Assignments
│   ├── Create Assignment
│   └── Student Submissions (Grading)
├── Learning Paths
│   ├── Manage Paths
│   └── Create Learning Path
├── Student Progress
│   ├── All Students
│   ├── Student Details
│   └── Performance Analytics
├── Announcements (Create & Manage)
├── Certificates (View issued)
├── Leaderboard
├── Points
└── Logout
```

### STAFF Navigation
```
├── Dashboard (My Progress)
├── My Learning (Enrolled Courses)
├── Learning Path (Recommended Paths)
├── Courses (Browse & Enroll)
├── Quizzes (Attempt)
├── Assignments (Submit)
├── Certificates (View & Download)
├── Announcements (View)
├── Leaderboard (View Rankings)
├── Points & Rewards (View & Redeem)
└── Logout
```

---

## Implementation Pattern

### 1. Create Role Guard Component

```jsx
// src/components/RoleGuard.jsx
export default function RoleGuard({ role, children, fallback = null }) {
  const user = useContext(UserContext);
  
  if (!user) return null;
  
  if (typeof role === 'string') {
    if (user.role?.name === role) {
      return children;
    }
  } else if (Array.isArray(role)) {
    if (role.includes(user.role?.name)) {
      return children;
    }
  }
  
  return fallback || null;
}
```

### 2. Usage in Navigation

```jsx
<nav>
  <RoleGuard role="Staff">
    <NavLink to="/my-learning">My Learning</NavLink>
  </RoleGuard>
  
  <RoleGuard role={["Trainer", "Admin"]}>
    <NavLink to="/courses/create">Create Course</NavLink>
  </RoleGuard>
  
  <RoleGuard role="Admin">
    <NavLink to="/admin/users">Manage Users</NavLink>
  </RoleGuard>
</nav>
```

### 3. Protected Routes

```jsx
// src/config/routes.jsx
export const ROLE_BASED_ROUTES = {
  admin: [
    { path: '/admin/users', component: AdminUsers },
    { path: '/admin/divisions', component: AdminDivisions },
    { path: '/admin/analytics', component: AdminAnalytics },
  ],
  trainer: [
    { path: '/courses/create', component: CreateCourse },
    { path: '/quizzes/create', component: CreateQuiz },
    { path: '/assignments/submissions', component: GradeSubmissions },
  ],
  staff: [
    { path: '/my-learning', component: MyLearning },
    { path: '/courses/:id/enroll', component: EnrollCourse },
  ],
};
```

---

## Dashboard Pages

### Admin Dashboard
```jsx
<div className="admin-dashboard">
  <div className="stats-grid">
    <StatCard title="Total Users" value={users.length} />
    <StatCard title="Active Courses" value={courses.length} />
    <StatCard title="Divisions" value={divisions.length} />
    <StatCard title="Completion Rate" value={completionRate} />
  </div>
  
  <div className="recent-activity">
    <RecentUsers />
    <PendingApprovals />
  </div>
  
  <AnalyticsCharts />
</div>
```

### Trainer Dashboard
```jsx
<div className="trainer-dashboard">
  <div className="courses-section">
    <CoursesList role="trainer" />
    <CreateCourseButton />
  </div>
  
  <div className="students-section">
    <StudentList />
    <PendingSubmissions />
  </div>
  
  <div className="progress-analytics">
    <StudentProgressChart />
  </div>
</div>
```

### Staff Dashboard
```jsx
<div className="staff-dashboard">
  <WelcomeBanner />
  
  <div className="stats-grid">
    <StatCard title="Points" value={user.points} />
    <StatCard title="Streak" value={user.streak} />
    <StatCard title="Courses Completed" value={completedCourses} />
    <StatCard title="Overall Progress" value={overallProgress} />
  </div>
  
  <div className="recommended-courses">
    <RecommendedCoursesList />
  </div>
</div>
```

---

## Sidebar Navigation Component

```jsx
// src/components/Sidebar.jsx
export default function Sidebar({ user }) {
  const menuItems = {
    Admin: [
      { label: 'Dashboard', icon: Home, path: '/dashboard' },
      { label: 'User Management', icon: Users, path: '/admin/users' },
      { label: 'Divisions', icon: Building2, path: '/admin/divisions' },
      { label: 'Content Review', icon: CheckCircle, path: '/admin/content' },
      { label: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
    ],
    Trainer: [
      { label: 'Dashboard', icon: Home, path: '/dashboard' },
      { label: 'My Learning', icon: BookOpen, path: '/my-learning' },
      { label: 'Courses', icon: Trophy, path: '/courses' },
      { label: 'Quizzes', icon: CheckSquare, path: '/quizzes' },
      { label: 'Assignments', icon: Medal, path: '/assignments' },
      { label: 'Student Progress', icon: TrendingUp, path: '/progress' },
      { label: 'Leaderboard', icon: Award, path: '/leaderboard' },
    ],
    Staff: [
      { label: 'Dashboard', icon: Home, path: '/dashboard' },
      { label: 'My Learning', icon: BookOpen, path: '/my-learning' },
      { label: 'Courses', icon: Trophy, path: '/courses' },
      { label: 'Quizzes', icon: CheckSquare, path: '/quizzes' },
      { label: 'Assignments', icon: Medal, path: '/assignments' },
      { label: 'Certificates', icon: Gift, path: '/certificates' },
      { label: 'Leaderboard', icon: Award, path: '/leaderboard' },
      { label: 'Points', icon: Sparkles, path: '/points' },
    ],
  };
  
  const items = menuItems[user.role?.name] || [];
  
  return (
    <nav className="sidebar">
      {items.map(item => (
        <NavLink key={item.path} to={item.path}>
          <item.icon className="w-5 h-5" />
          {isOpen && <span>{item.label}</span>}
        </NavLink>
      ))}
    </nav>
  );
}
```

---

## Button/Action Permissions

### Show/Hide Based on Role

```jsx
// Create Course Button - Only for Trainer and Admin
<RoleGuard role={["Trainer", "Admin"]}>
  <button onClick={() => navigate('/courses/create')} className="btn-primary">
    + Create Course
  </button>
</RoleGuard>

// Delete User Button - Only for Admin
<RoleGuard role="Admin">
  <button onClick={deleteUser} className="btn-danger">
    Delete User
  </button>
</RoleGuard>

// Submit Assignment - Only for Staff
<RoleGuard role="Staff">
  <button onClick={submitAssignment} className="btn-primary">
    Submit Assignment
  </button>
</RoleGuard>

// Grade Submission - Only for Trainer
<RoleGuard role={["Trainer", "Admin"]}>
  <button onClick={openGradingPanel} className="btn-secondary">
    Grade Submission
  </button>
</RoleGuard>
```

---

## Data Access Patterns

### By Role in API Calls

```jsx
// Admin can fetch all users
if (user.role?.name === 'Admin') {
  const users = await fetch('/api/admin/users');
}

// Trainer can only fetch their students' progress
if (user.role?.name === 'Trainer') {
  const progress = await fetch('/api/progress/students');
}

// Staff can only fetch their own progress
if (user.role?.name === 'Staff') {
  const progress = await fetch('/api/progress');
}
```

---

## Form Visibility

### Course Creation Form

```jsx
<RoleGuard role={["Trainer", "Admin"]}>
  <CourseForm>
    <TextField label="Course Title" />
    <TextField label="Description" />
    <DivisionSelect label="Available to Division" />
    <QuizBuilder />
    <AssignmentBuilder />
    <SubmitButton />
  </CourseForm>
</RoleGuard>
```

### User Management Form

```jsx
<RoleGuard role="Admin">
  <UserForm>
    <TextField label="Name" />
    <TextField label="Email" />
    <RoleSelect label="Role" options={['Admin', 'Trainer', 'Staff']} />
    <DivisionSelect label="Division" />
    <SubmitButton />
  </UserForm>
</RoleGuard>
```

---

## Role-Based Styling

```css
/* Different header colors by role */
.dashboard-header.admin { @apply bg-blue-600; }
.dashboard-header.trainer { @apply bg-purple-600; }
.dashboard-header.staff { @apply bg-green-600; }

/* Role indicator badge */
.role-badge {
  @apply px-3 py-1 rounded-full text-sm font-semibold;
}
.role-badge.admin { @apply bg-blue-100 text-blue-800; }
.role-badge.trainer { @apply bg-purple-100 text-purple-800; }
.role-badge.staff { @apply bg-green-100 text-green-800; }
```

---

## Analytics Dashboard

### Staff Analytics
```jsx
<StaffAnalytics>
  <ProgressChart />
  <QuizPerformance />
  <LearningStreak />
  <CertificatesEarned />
</StaffAnalytics>
```

### Trainer Analytics
```jsx
<TrainerAnalytics>
  <StudentProgressChart />
  <CourseCompletion />
  <QuizPerformance />
  <AssignmentMetrics />
</TrainerAnalytics>
```

### Admin Analytics
```jsx
<AdminAnalytics>
  <OverallMetrics />
  <DivisionComparison />
  <EngagementTrends />
  <ComplianceReporting />
  <UserActivityLog />
</AdminAnalytics>
```

---

## Context/State Management Example

```jsx
// src/context/UserContext.js
const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  
  const isSuperAdmin = () => user?.role?.name === 'Admin';
  const isTrainer = () => ['Trainer', 'Admin'].includes(user?.role?.name);
  const isStaff = () => user?.role?.name === 'Staff';
  
  const value = {
    user,
    setUser,
    isSuperAdmin,
    isTrainer,
    isStaff,
  };
  
  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

// Usage in components
const { user, isTrainer } = useContext(UserContext);
```

---

## Mobile Responsive Considerations

- Admin: Needs full analytics dashboard (requires larger screen)
- Trainer: Course management needs good UI space
- Staff: Mobile-friendly learning interface critical

Adjust navigation to collapse on mobile for all roles.

---

## Accessibility & UX

1. **Clear Role Indicators**: Show user's role in profile menu
2. **Contextual Help**: Different help docs by role
3. **Restricted Action Feedback**: Show "Not available for your role" messages
4. **Progressive Disclosure**: Show only relevant features per role

---

## Testing Checklist

- [ ] Admin sees all menu items
- [ ] Trainer sees course creation but not user management
- [ ] Staff sees only learning items, no creation tools
- [ ] Protected routes redirect when accessed by wrong role
- [ ] API calls respect role restrictions
- [ ] Forms hide/show based on role
- [ ] Buttons disabled/hidden for restricted roles
- [ ] No console errors on role check failures

