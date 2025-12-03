# Finger Down Library Management System

A web app for managing a library. Staff can add/edit books, manage reservations, and view users. Customers can browse the catalogue and see book availability.

## Tech Stack
- **Frontend**: React + TypeScript + Vite + TailwindCSS + shadcn/ui
- **Backend**: Django + Django REST Framework
- **Database**: MySQL
- **Auth**: JWT (JSON Web Tokens)

---

## Quick Start with Docker

### Prerequisites
- Docker & Docker Compose installed

### Run the App
```bash
docker compose up --build
```

This starts 3 containers:
- **db**: MySQL database on port 3306
- **backend**: Django API on port 8000
- **frontend**: React app on port 5173

Open http://localhost:5173 in your browser.

### Test Accounts
| Role | Email | Password |
|------|-------|----------|
| Staff | librarian1@example.com | password1 |
| Customer | user1@example.com | password3 |

---

## Security Implementations

### 1. Input Validation
We validate user input on both frontend and backend to prevent bad data and attacks.

**Frontend (Zod schemas)**:
- Login/Signup: email format, password length
- Book forms: required fields, ISBN checksum validation
- Reservations: email format, date not in past

**Backend (Django)**:
- ISBN validation using `python-stdnum` library
- Required field checks before database operations
- Serializer validation for all API inputs

### 2. Authentication & Authorization
- JWT tokens for stateless authentication
- Role-based access control (staff vs customer)
- Protected routes that check user permissions
- Tokens stored in localStorage with refresh capability

### 3. Secure Development Lifecycle (SSDLC)
- Code reviews via pull requests
- Environment variables for sensitive config (DB credentials, secret keys)
- `.dockerignore` and `.gitignore` to prevent exposing secrets
- Separate dev/prod configurations

### 4. CI/CD Pipeline
- GitHub Actions for automated testing
- Linting checks on pull requests
- Build verification before merge

### 5. Defense in Depth
- CORS configuration to restrict origins
- Django's built-in CSRF protection
- Password hashing (Django's default auth)
- SQL injection prevention via Django ORM

---

## Project Structure
```
├── lms_frontend/          # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── hooks/         # Custom React hooks
│   │   └── config/        # API configuration
│   └── Dockerfile
├── lms_backend/           # Django backend
│   ├── myapp/
│   │   ├── models/        # Database models
│   │   ├── views/         # API endpoints
│   │   └── serializers/   # Data validation
│   └── Dockerfile
└── docker-compose.yml
```

---

## Development Without Docker

### Frontend
```bash
cd lms_frontend
npm install
npm run dev
```

### Backend
```bash
cd lms_backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py load_data
python manage.py runserver
```

Note: You'll need MySQL running locally with a `bookworm` database.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/sign-in/ | Login |
| POST | /api/auth/sign-up/ | Register |
| GET | /api/books/ | List books |
| POST | /api/books/ | Add book (staff) |
| GET | /api/reservations/ | List reservations |
| POST | /api/reservations/ | Create reservation |
| GET | /api/users/ | List users (staff) |
