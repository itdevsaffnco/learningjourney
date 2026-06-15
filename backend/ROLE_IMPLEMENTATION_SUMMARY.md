# Role-Based Access Control Implementation - SAFF & Co. LMS

## Overview
Complete role-based access control system implemented for three distinct user roles with clearly defined responsibilities, permissions, and access levels.

---

## Role Structure

### 🔑 ADMIN - Platform Administrator
**Responsibility**: Full system management and oversight

**Job Functions**:
- User account management (create, edit, delete)
- Role assignment and organizational structure
- Content moderation and approval
- System analytics and reporting
- Platform configuration and security

**Key Features**:
- Access all system analytics across all divisions
- View comprehensive leaderboards
- Moderate all content before publication (if enabled)
- Generate compliance reports
- Manage organizational divisions

**Restrictions**:
- Only 1-2 per organization
- Cannot access individual user learning data without specific need

---

### 📚 TRAINER - Content Creator & Instructor
**Responsibility**: Create and manage learning content, assess student performance

**Job Functions**:
- Design and develop courses, modules, and lessons
- Create quizzes and assignments
- Grade student work and provide feedback
- Build learning paths (structured learning sequences)
- Monitor student progress on their content

**Key Features**:
- Full course creation and editing tools
- Quiz builder with multiple question types
- Assignment rubrics and automated grading setup
- Student progress dashboard
- Announcement creation for their content
- Learning path designer

**Restrictions**:
- Cannot access Admin panel
- Can only grade their own content
- Cannot access system-wide analytics (only their student data)
- Cannot delete user accounts

**Natural Growth Path**: High-performing trainers can be promoted to Admin roles

---

### 👥 STAFF - Learner
**Responsibility**: Complete learning objectives and build professional skills

**Job Functions**:
- Enroll in and complete courses
- Take quizzes and attempt assessments
- Submit assignments and projects
- Earn certificates upon completion
- Engage with learning community

**Key Features**:
- Personalized learning dashboard
- Recommended courses based on division and role
- Progress tracking and analytics
- Points and rewards system
- Leaderboard (personal, divisional, and organizational)
- Certificate generation and download

**Restrictions**:
- Cannot create or edit courses
- Cannot view other employees' assignment grades
- Cannot access grading tools
- Cannot create announcements

---

## Implementation Details

### Middleware Protection
All API endpoints are protected by role-based middleware. Routes are organized as follows:

```
├── Public Routes (No auth required)
│   ├── POST /login
│   └── POST /register
│
├── Shared Routes (All authenticated users)
│   ├── User Profile & Personal Data
│   ├── View Courses & Content
│   ├── View Quizzes & Assignments
│   └── Community Features (Leaderboard)
│
├── Staff Only Routes
│   ├── Complete Lessons
│   ├── Submit Quizzes
│   └── Submit Assignments
│
├── Trainer Only Routes
│   ├── Create/Edit/Delete Courses
│   ├── Create/Edit/Delete Quizzes
│   ├── Create/Edit/Delete Assignments
│   ├── Grade Submissions
│   ├── Learning Path Management
│   └── Student Progress Monitoring
│
└── Admin Only Routes
    ├── User Management
    ├── Role & Division Management
    ├── Content Moderation
    ├── Analytics & Reporting
    └── System Configuration
```

### Database Schema
**roles table** (with new permissions field):
```sql
- id (PK)
- name (Admin, Trainer, Staff)
- description (Job description)
- permissions (JSON array)
- created_at
- updated_at
```

**users table** (already has role_id and division_id):
```sql
- id (PK)
- name
- email
- password
- role_id (FK → roles)
- division_id (FK → divisions)
- ... other fields
```

---

## API Route Structure

### Staff-Only Endpoints
```
POST   /lessons/{id}/progress          - Mark lesson as complete
POST   /quizzes/{id}/submit            - Submit quiz answers
GET    /quizzes/{id}/results           - View quiz results
POST   /assignments/{id}/submit        - Submit assignment
```

### Trainer-Only Endpoints
```
POST   /courses                        - Create new course
PUT    /courses/{id}                   - Edit course
DELETE /courses/{id}                   - Delete course
POST   /modules                        - Create module
POST   /quizzes                        - Create quiz
PUT    /quizzes/{id}                   - Edit quiz
DELETE /quizzes/{id}                   - Delete quiz
POST   /assignments                    - Create assignment
GET    /assignments/{id}/submissions   - View student submissions
POST   /assignments/{id}/grade         - Grade submission
GET    /progress/students              - View all students' progress
POST   /learning-paths                 - Create learning path
```

### Admin-Only Endpoints
```
GET    /admin/users                    - List all users
POST   /admin/users                    - Create user
PUT    /admin/users/{id}               - Edit user
DELETE /admin/users/{id}               - Delete user
GET    /admin/roles                    - List roles
GET    /admin/divisions                - List divisions
GET    /admin/analytics/overview       - System analytics
GET    /admin/analytics/by-division    - Division-level analytics
GET    /admin/announcements            - All announcements
```

---

## Division-Based Access Control

In addition to roles, users belong to **divisions** (Sales, Marketing, HQ, R&D, Retail BA):

- **Trainers** see courses and students in all divisions (or assigned divisions)
- **Staff** see:
  - Courses tagged for their division
  - Leaderboards filtered by their division
  - Division-specific announcements
- **Admins** see all divisions and can cross-division reporting

---

## Permission Model

Each role has a JSON `permissions` array defining what they can do:

### Admin Permissions
```json
[
  "users.manage",
  "roles.manage",
  "divisions.manage",
  "content.moderate",
  "analytics.view",
  "system.settings",
  "announcements.create"
]
```

### Trainer Permissions
```json
[
  "courses.create",
  "courses.edit",
  "modules.create",
  "modules.edit",
  "lessons.create",
  "lessons.edit",
  "quizzes.create",
  "quizzes.edit",
  "assignments.create",
  "assignments.edit",
  "paths.create",
  "paths.edit",
  "submissions.grade",
  "progress.view",
  "announcements.create"
]
```

### Staff Permissions
```json
[
  "courses.enroll",
  "lessons.complete",
  "quizzes.attempt",
  "assignments.submit",
  "certificates.view",
  "leaderboard.view",
  "progress.view",
  "announcements.view",
  "points.view",
  "rewards.redeem"
]
```

---

## Business Alignment

### Risk Management
- ✅ Users can only access their role's functionality
- ✅ Sensitive operations (user deletion) require admin access
- ✅ All actions can be logged and audited
- ✅ Content moderation prevents inappropriate material

### Scalability
- ✅ Trainers can create content without admin approval (if enabled)
- ✅ Multiple trainers can work independently
- ✅ Admin doesn't become bottleneck for content creation

### Data Privacy
- ✅ Staff cannot view other employees' grades
- ✅ Trainers cannot see other trainers' students
- ✅ Admin has full visibility for compliance

### Engagement & Gamification
- ✅ Points and rewards drive engagement
- ✅ Leaderboard creates healthy competition
- ✅ Certificates recognize achievements

---

## Migration & Deployment

### To Deploy:
```bash
# Run migrations to add permissions column
php artisan migrate

# Seed roles with proper permissions
php artisan db:seed --class=RoleSeeder

# Clear cache
php artisan cache:clear
```

### Required Environment:
- Laravel 11+
- PHP 8.2+
- MySQL 5.7+
- Sanctum for API token authentication

---

## Frontend Implementation

### Role-Based Navigation
Frontend should show menu items based on user's role:

**Staff Dashboard Shows**:
- My Learning
- Courses
- Quizzes
- Assignments
- Certificates
- Leaderboard
- Points & Rewards

**Trainer Dashboard Shows**:
- Courses (with create/edit)
- Quizzes (with create/edit)
- Assignments (with grading)
- Learning Paths
- Student Progress
- Announcements

**Admin Dashboard Shows**:
- User Management
- Role Management
- Content Moderation
- Analytics
- System Settings
- Division Management

---

## Future Enhancements

**Phase 2**:
- Manager role (oversee team training)
- Content approval workflow
- Custom permissions builder
- Audit logs and compliance reporting

**Phase 3**:
- Guest/Partner access roles
- Granular permission customization
- Two-factor authentication for sensitive roles
- IP-based access restrictions

---

## Support & Questions

For role implementation issues or clarification on permissions:
1. Check `ROLES_AND_PERMISSIONS.md` for detailed descriptions
2. Review API routes in `routes/api.php`
3. Check middleware in `app/Http/Middleware/`

