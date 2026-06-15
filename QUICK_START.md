# 🚀 SAFF LMS - Quick Start Guide

## 📁 Struktur Project

```
saff-lms/
├── backend/          ← Laravel API Server
├── frontend/         ← React Dev Server
├── README.md
├── STRUCTURE.md
└── QUICK_START.md    (File ini)
```

---

## ⚙️ Prerequisites

✅ XAMPP (PHP 8.2+, MySQL)
✅ Node.js & npm
✅ Composer
✅ Database sudah dibuat & migrations sudah jalan

---

## 🎯 3 Langkah Menjalankan Aplikasi

### **Terminal 1: Backend (Laravel API)**
```bash
cd C:\Users\Ryan Handani\Documents\Coding\Learning\saff-lms\backend
php artisan serve
```
✅ Akan berjalan di: **http://localhost:8000**

### **Terminal 2: Frontend (React Dev Server)**
```bash
cd C:\Users\Ryan Handani\Documents\Coding\Learning\saff-lms\frontend
npm run dev
```
✅ Akan berjalan di: **http://localhost:5173**

### **Terminal 3: MySQL**
- Buka **XAMPP Control Panel**
- Klik **Start** untuk MySQL
- Pastikan status **hijau** ✅

---

## 🔐 Login Test

Buka: **http://localhost:5173**

**Gunakan salah satu akun:**

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | password |
| Trainer | trainer@example.com | password |
| Staff | staff@example.com | password |

---

## 📁 File Structure Explanation

### **Backend** (`saff-lms/backend/`)
```
backend/
├── app/Http/Controllers/Api/     ← API Logic
├── app/Models/                   ← Database Models
├── database/migrations/           ← Database Schema
├── database/seeders/             ← Sample Data
├── routes/api.php                ← API Endpoints
├── .env                          ← Configuration
└── artisan                       ← CLI Tool
```

### **Frontend** (`saff-lms/frontend/`)
```
frontend/
├── resources/js/
│   ├── App.jsx                   ← Main Component
│   ├── pages/                    ← Page Components
│   └── components/               ← Shared Components
├── resources/css/app.css         ← Styles
├── public/index.html             ← HTML Entry
├── vite.config.js                ← Build Config
├── tailwind.config.js            ← Tailwind Config
└── package.json                  ← Dependencies
```

---

## 🔧 Common Commands

### **Backend Commands**
```bash
cd backend

# Run migrations
php artisan migrate

# Reset database with seed data
php artisan migrate:fresh --seed

# Clear cache
php artisan cache:clear

# Create new migration
php artisan make:migration create_table_name

# Create new controller
php artisan make:controller Api/ControllerName
```

### **Frontend Commands**
```bash
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Clear node modules
rm -r node_modules && npm install
```

---

## 🌐 API Endpoints

**Base URL:** `http://localhost:8000/api`

### Authentication
- `POST /login` - Login
- `POST /register` - Register
- `POST /logout` - Logout
- `GET /user` - Get current user

### Courses
- `GET /courses` - List courses
- `GET /courses/{id}` - Get course details
- `POST /lessons/{id}/progress` - Update progress

### Quizzes
- `GET /quizzes` - List quizzes
- `POST /quizzes/{id}/submit` - Submit quiz

### Leaderboard
- `GET /leaderboard` - Global rankings
- `GET /leaderboard/division/{id}` - Division rankings

**See full API docs in:** `backend/routes/api.php`

---

## 🐛 Troubleshooting

### Port 8000 sudah terpakai
```bash
php artisan serve --port=8001
```

### npm modules error
```bash
cd frontend
rm -r node_modules package-lock.json
npm install
```

### Database error
1. Pastikan MySQL running di XAMPP
2. Check `.env` file:
   ```
   DB_HOST=127.0.0.1
   DB_DATABASE=saff_lms
   DB_USERNAME=root
   DB_PASSWORD=
   ```
3. Run migrations:
   ```bash
   cd backend
   php artisan migrate
   ```

### CORS error
Backend proxy sudah otomatis dihandle di `frontend/vite.config.js`

---

## 📊 Database Info

- **Database Name:** `saff_lms`
- **Host:** `127.0.0.1` (localhost)
- **User:** `root`
- **Password:** (kosong)
- **Type:** MySQL 5.7+

**PhpMyAdmin:** http://localhost/phpmyadmin

---

## 🎯 Next Steps

1. ✅ Jalankan backend & frontend
2. ✅ Login dengan demo credentials
3. ✅ Explore dashboard & leaderboard
4. ✅ Check sidebar navigation
5. ✅ Develop lebih lanjut sesuai kebutuhan

---

## 📚 Documentation Files

- **README.md** - Main project documentation
- **STRUCTURE.md** - Detailed project structure
- **QUICK_START.md** - This file (quick reference)

---

## 💡 Tips

- Backend dan Frontend berjalan **independent** - bisa di-kill salah satunya tanpa affect yang lain
- Frontend otomatis proxy API calls ke localhost:8000
- Pastikan **3 terminals** berjalan: Backend, Frontend, MySQL
- Check console/terminal untuk error messages

---

**Happy Coding! 🎉**

Jika ada pertanyaan, check dokumentasi di folder docs atau file README.md
