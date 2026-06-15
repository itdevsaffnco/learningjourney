# SAFF & Co. LMS - Role Quick Reference Card

## One-Page Role Comparison

| Feature | ADMIN 🔑 | TRAINER 📚 | STAFF 👥 |
|---------|--------|---------|--------|
| **Role** | Platform Manager | Content Creator | Learner |
| **Typical Count** | 1-2 | 5-20+ | 100+ |
| **Primary Goal** | System oversight | Create content | Learn skills |
| **Access Level** | Full system | Content tools | Learning interface |
| **Reports Accessible** | All reports | Own student data | Own progress only |

---

## Dashboard at a Glance

### ADMIN Dashboard
```
┌────────────────────────────────────────┐
│    SAFF LMS - ADMIN DASHBOARD          │
├────────────────────────────────────────┤
│  Users: 250    │  Courses: 45          │
│  Active: 187   │  Pending Review: 3    │
├────────────────────────────────────────┤
│ QUICK ACTIONS                          │
│  [+ Add User] [Approve Content]        │
│  [View Analytics] [System Settings]    │
├────────────────────────────────────────┤
│ RECENT ACTIVITY                        │
│  • New user: John Sales (Sales div)    │
│  • Course created: Advanced Blending   │
│  • 15 assignments pending review       │
└────────────────────────────────────────┘
```

### TRAINER Dashboard
```
┌────────────────────────────────────────┐
│   SAFF LMS - TRAINER DASHBOARD         │
├────────────────────────────────────────┤
│  My Courses: 8   │  My Students: 156   │
│  Pending Grades: 12  │  Quiz Rating: 4.8/5 │
├────────────────────────────────────────┤
│ QUICK ACTIONS                          │
│  [+ Create Course] [+ Create Quiz]     │
│  [Grade Assignments] [Student Progress]│
├────────────────────────────────────────┤
│ TODAY'S TASKS                          │
│  • 8 assignments waiting for grades    │
│  • Quiz results: 43 submissions        │
│  • 2 students need intervention        │
└────────────────────────────────────────┘
```

### STAFF Dashboard
```
┌────────────────────────────────────────┐
│   SAFF LMS - STAFF DASHBOARD           │
├────────────────────────────────────────┤
│  My Points: 850  │  Rank: #8 (Sales)   │
│  Streak: 5 days  │  Courses: 2/5       │
├────────────────────────────────────────┤
│ QUICK ACTIONS                          │
│  [Continue Learning] [Browse Courses]  │
│  [View Certificates] [Leaderboard]     │
├────────────────────────────────────────┤
│ RECOMMENDED FOR YOU                    │
│  • Advanced Negotiation Skills (Sales) │
│  • Fragrance Blending Basics (All)     │
│  • Customer Service Excellence (Sales) │
└────────────────────────────────────────┘
```

---

## Navigation Quick Links

### ADMIN Can Access
```
✓ Dashboard               ✓ Divisions
✓ User Management        ✓ Content Moderation  
✓ Role Management        ✓ Analytics
✓ Announcements          ✓ System Settings
✗ Create Courses         ✗ Grade Assignments
✗ View Student Grades    ✗ Enroll in Courses
```

### TRAINER Can Access
```
✓ Dashboard              ✓ Create Quizzes
✓ Create Courses         ✓ Create Assignments
✓ Create Modules         ✓ Grade Submissions
✓ Create Lessons         ✓ Student Progress
✓ Learning Paths         ✓ Create Announcements
✓ View Leaderboard       ✓ My Learning
✗ User Management        ✗ System Settings
✗ View Other Trainers    ✗ Moderate Content
```

### STAFF Can Access
```
✓ Dashboard              ✓ Assignments
✓ Courses (browse)       ✓ Certificates
✓ My Learning            ✓ Leaderboard
✓ Quizzes                ✓ Points & Rewards
✓ Announcements          ✓ View Progress
✗ Create Courses         ✗ Grade Work
✗ User Management        ✗ System Settings
✗ View Other's Grades    ✗ Create Content
```

---

## API Endpoints by Role

### ADMIN ONLY Endpoints (5 groups)
```
User Management     GET /admin/users
                   POST /admin/users
                   PUT /admin/users/{id}
                   DELETE /admin/users/{id}

Analytics          GET /admin/analytics/overview
                   GET /admin/analytics/by-division
                   GET /admin/analytics/engagement

Content Moderation GET /admin/content/review
                   POST /admin/content/{id}/approve

Division Mgmt      GET /admin/divisions
                   POST /admin/divisions
                   PUT /admin/divisions/{id}
```

### TRAINER ONLY Endpoints (4 groups)
```
Course Creation    POST /courses
                   PUT /courses/{id}
                   DELETE /courses/{id}

Quiz Management    POST /quizzes
                   PUT /quizzes/{id}
                   DELETE /quizzes/{id}

Grading            GET /assignments/{id}/submissions
                   POST /assignments/{id}/grade

Progress Monitor   GET /progress/students
                   GET /progress/students/{userId}
```

### STAFF ONLY Endpoints (2 groups)
```
Lesson Completion  POST /lessons/{id}/progress

Assessment         POST /quizzes/{id}/submit
                   POST /assignments/{id}/submit
```

### SHARED Endpoints (All authenticated users)
```
User Info          GET /user
                   GET /profile
                   PUT /profile

Learning Content   GET /courses
                   GET /courses/{id}
                   GET /modules
                   GET /quizzes
                   GET /assignments

Gamification       GET /leaderboard
                   GET /leaderboard/division/{id}
                   GET /points
                   GET /certificates
```

---

## Permissions Matrix

```
┌─────────────────────┬───────┬─────────┬───────┐
│ Permission          │ Admin │ Trainer │ Staff │
├─────────────────────┼───────┼─────────┼───────┤
│ users.manage        │   ✓   │    ✗    │  ✗    │
│ roles.manage        │   ✓   │    ✗    │  ✗    │
│ divisions.manage    │   ✓   │    ✗    │  ✗    │
│ content.moderate    │   ✓   │    ✗    │  ✗    │
│ analytics.view      │   ✓   │    ✗    │  ✗    │
│ system.settings     │   ✓   │    ✗    │  ✗    │
├─────────────────────┼───────┼─────────┼───────┤
│ courses.create      │   -   │    ✓    │  ✗    │
│ courses.edit        │   -   │    ✓    │  ✗    │
│ quizzes.create      │   -   │    ✓    │  ✗    │
│ submissions.grade   │   -   │    ✓    │  ✗    │
│ progress.view       │   -   │    ✓    │  ✓    │
├─────────────────────┼───────┼─────────┼───────┤
│ courses.enroll      │   -   │    -    │  ✓    │
│ lessons.complete    │   -   │    -    │  ✓    │
│ quizzes.attempt     │   -   │    -    │  ✓    │
│ assignments.submit  │   -   │    -    │  ✓    │
│ certificates.view   │   -   │    -    │  ✓    │
│ leaderboard.view    │   ✓   │    ✓    │  ✓    │
│ points.view         │   ✓   │    ✓    │  ✓    │
└─────────────────────┴───────┴─────────┴───────┘
```

---

## Division Visibility

```
ADMIN
└─ Sees: All divisions
   └─ Sales, Marketing, HQ, R&D, Retail BA

TRAINER
└─ Can teach: Assigned divisions (or all)
   └─ Example: Trainer X teaches Sales + Marketing

STAFF
└─ Sees content for: Their division
   └─ Example: Sales employee sees only Sales courses
   └─ Leaderboard: Only within Sales division
```

---

## Typical User Journey by Role

### Admin's Day
```
1. Check system analytics → Performance metrics
2. Review pending content → Approve/reject courses
3. Manage users → Assign roles, reset passwords
4. Monitor engagement → Identify at-risk divisions
5. Generate reports → Compliance documentation
```

### Trainer's Day
```
1. View student submissions → Grade assignments
2. Check quiz results → Identify learning gaps
3. Create new content → Design course module
4. Monitor progress → Follow-up with struggling students
5. Update course materials → Incorporate feedback
```

### Staff's Day
```
1. Login to dashboard → See personalized recommendations
2. Complete lesson → Mark progress, take notes
3. Take quiz → Test knowledge, review results
4. Submit assignment → Apply learning to real scenario
5. Check leaderboard → See ranking, celebrate progress
6. Earn points → Redeem for rewards
7. Download certificate → Share achievement
```

---

## Role Transitions & Growth

```
CAREER PROGRESSION

Staff (Learner)
  ↓
  [Demonstrates mastery & teaching ability]
  ↓
Trainer (Content Creator)
  ↓
  [Manages platform & multiple trainers]
  ↓
Admin (Platform Authority)
```

**Example**: John starts as Staff, completes all Sales courses, shows strong 
performance, is promoted to Trainer to create Sales content, eventually becomes 
Admin to oversee the entire platform.

---

## Troubleshooting

### User Can't Access Feature
```
1. Check their role        → /profile shows role
2. Feature requires role?  → Check permission matrix
3. Has enough permissions? → Contact Admin to grant
4. API returning 403?      → Check middleware
```

### Unexpected Access Denied
```
Error: "Unauthorized. Trainer access required."

Solution:
- This is API enforcing role security
- Check if user needs Trainer role
- Ask Admin to assign role
- Clear browser cache & retry
```

### Course Not Appearing
```
For STAFF (Learner):
- Is course for my division?
- Has trainer published it?
- Ask trainer or admin

For TRAINER:
- Did I create this course?
- Am I enrolled as student too?
- Check course visibility settings

For ADMIN:
- All courses visible
```

---

## Key Takeaways

| Role | Key Responsibility | Key Action | Key Metric |
|-----|-------------------|-----------|-----------|
| **ADMIN** | System health & governance | Approve content | System uptime |
| **TRAINER** | Content creation & quality | Grade assignments | Student satisfaction |
| **STAFF** | Learning & skill building | Complete courses | Completion rate |

---

## Quick Commands (Backend)

```bash
# Seed roles with permissions
php artisan db:seed --class=RoleSeeder

# Check user role
DB::table('users')->where('email', 'user@example.com')->first();

# Change user role
DB::table('users')->where('email', 'user@example.com')
  ->update(['role_id' => 2]); // 1=Admin, 2=Trainer, 3=Staff

# View role permissions
DB::table('roles')->where('name', 'Trainer')->first();
```

---

## Support & Contact

**Questions about roles?**
- Check: `ROLES_AND_PERMISSIONS.md` (detailed)
- Check: `ROLE_BASED_UI_GUIDE.md` (frontend)
- Contact: Admin team

**Need role change?**
- Contact: System Admin
- Provide: Email, new role, business justification

