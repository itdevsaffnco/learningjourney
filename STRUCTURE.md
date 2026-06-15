# SAFF & Co. LMS - Project Structure

```
saff-lms/
│
├── backend/                          # Laravel Backend (API Server)
│   ├── app/                          # Laravel Application
│   │   ├── Http/Controllers/Api/     # API Controllers
│   │   ├── Models/                   # Eloquent Models
│   │   └── ...
│   ├── database/
│   │   ├── migrations/               # Database Migrations (21 total)
│   │   ├── seeders/                  # Seeders (Divisions, Roles)
│   │   └── ...
│   ├── routes/
│   │   ├── api.php                   # API Routes (30+ endpoints)
│   │   └── ...
│   ├── config/                       # Laravel Config
│   ├── storage/                      # Storage
│   ├── vendor/                       # Composer Dependencies
│   ├── .env                          # Environment Variables
│   ├── artisan                       # Laravel CLI
│   ├── composer.json                 # PHP Dependencies
│   └── phpunit.xml                   # Testing Config
│
├── frontend/                         # React Frontend (Dev Server)
│   ├── resources/
│   │   ├── js/
│   │   │   ├── App.jsx               # Main App Component
│   │   │   ├── pages/                # Page Components
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Courses.jsx
│   │   │   │   ├── Quizzes.jsx
│   │   │   │   ├── Assignments.jsx
│   │   │   │   └── ...
│   │   │   └── components/           # Shared Components
│   │   │       ├── Sidebar.jsx       # With Leaderboard
│   │   │       └── ...
│   │   └── css/
│   │       └── app.css               # Tailwind Styles
│   ├── public/
│   │   ├── index.html                # HTML Entry Point
│   │   ├── dist/                     # Built Production Files
│   │   └── ...
│   ├── node_modules/                 # npm Dependencies
│   ├── package.json                  # npm Packages
│   ├── vite.config.js                # Vite Config
│   ├── tailwind.config.js            # Tailwind Config
│   └── postcss.config.js             # PostCSS Config
│
├── README.md                         # Main Documentation
└── STRUCTURE.md                      # This File
```

## Running the Application

### Prerequisites
- XAMPP (PHP 8.2+, MySQL)
- Node.js & npm
- Composer

### Start Backend (Terminal 1)
```bash
cd saff-lms/backend
php artisan serve
# Runs on http://localhost:8000
```

### Start Frontend (Terminal 2)
```bash
cd saff-lms/frontend
npm run dev
# Runs on http://localhost:5173
```

### Start MySQL (Terminal 3)
- Open XAMPP Control Panel
- Click Start for MySQL

## Access Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/api
- Database: saff_lms (MySQL)

## Demo Credentials
```
Admin:    admin@example.com / password
Trainer:  trainer@example.com / password
Staff:    staff@example.com / password
```

## Key Features

### Backend (Laravel)
✅ RESTful API with 30+ endpoints
✅ Token-based Authentication (Sanctum)
✅ Role-based Access Control
✅ Multi-division user grouping
✅ Auto-graded quiz system
✅ Points & Leaderboard system
✅ Database migrations & seeders

### Frontend (React)
✅ Modern UI with Tailwind CSS
✅ Smooth animations (Framer Motion)
✅ Dark/Light theme support
✅ Responsive design
✅ Sidebar with Leaderboard
✅ Login & Dashboard pages
✅ Ready for expansion

## Development Workflow

1. **Make API changes** → Edit files in `backend/app/Http/Controllers/Api/`
2. **Make UI changes** → Edit components in `frontend/resources/js/pages/` or `frontend/resources/js/components/`
3. **Update styles** → Edit `frontend/resources/css/app.css`
4. **Run migrations** → `cd backend && php artisan migrate`
5. **Seed data** → `cd backend && php artisan db:seed`

## Build for Production

### Backend
```bash
cd backend
composer install --no-dev
php artisan migrate --force
```

### Frontend
```bash
cd frontend
npm install
npm run build
# Output: public/dist/
```

## Troubleshooting

### Backend Issues
```bash
cd backend

# Clear cache
php artisan cache:clear

# Regenerate config
php artisan config:cache

# Reset database
php artisan migrate:fresh --seed
```

### Frontend Issues
```bash
cd frontend

# Clear node modules & reinstall
rm -r node_modules package-lock.json
npm install

# Clear Vite cache
rm -r node_modules/.vite
npm run dev
```

---

**Built with ❤️ for SAFF & Co. | Full Stack: React + Laravel + MySQL**
