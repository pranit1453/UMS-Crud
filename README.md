# User Management System (UMS) - CRUD App

A full-stack User Management System with a Flask REST API backend, PostgreSQL database, and a modern responsive HTML5/JavaScript frontend dashboard, containerized with Docker, Docker Compose, and a CLI control script (`ums.sh`).

---

## 🌐 Application URLs

| Service / Endpoint | URL | Description |
| :--- | :--- | :--- |
| **Frontend Web Dashboard** | **[http://localhost:8080](http://localhost:8080)** | Main User Management Web UI |
| **Backend API Root** | **[http://localhost:5000/](http://localhost:5000/)** | REST API index & endpoint guide |
| **Backend Health Check** | **[http://localhost:5000/health](http://localhost:5000/health)** | API status check (`{"status": "UP"}`) |
| **Users API Endpoint** | **[http://localhost:5000/api/users](http://localhost:5000/api/users)** | CRUD JSON endpoint for users |
| **PostgreSQL Database** | **`localhost:5430`** | Direct database connection port |

---

## 🔑 Environment Variables (`.env`)

Create a `.env` file in the root directory (`.env`) and inside `backend/ums/.env`:

### `.env` File Template

```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5430
POSTGRES_DB=ums_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
```
---

## 🚀 Management Script (`ums.sh`)

Use the `./ums.sh` CLI script to manage the entire application lifecycle:

```bash
# Start all services (checks prerequisites, validates config, builds & waits for health)
./ums.sh start

# Show running container status
./ums.sh status

# Follow logs of all services
./ums.sh logs

# Follow logs of a specific service (postgres, backend, frontend)
./ums.sh logs backend

# Follow logs with a specific line limit
./ums.sh logs backend 50

# Restart all services
./ums.sh restart

# Stop and remove containers
./ums.sh stop
```

---

## 🐳 Quick Start with Docker Compose

If running via Docker Compose directly:

```bash
docker compose up -d
```

To stop containers:

```bash
docker compose down -v
```

---

## 📁 Project Structure

```
UMS-Crud/
├── backend/
│   ├── ums/
│   │   ├── models/
│   │   │   └── user.py         # SQLAlchemy User Model
│   │   ├── routes/
│   │   │   └── user_routes.py  # REST API Routes (CRUD)
│   │   ├── services/
│   │   │   └── user_service.py # Business Logic & DB Transactions
│   │   ├── __init__.py         # App factory & Flask CORS init
│   │   ├── config.py           # PostgreSQL DB Configuration
│   │   └── run.py              # Application Entry Point
│   ├── .dockerignore
│   ├── Dockerfile              # Python Flask Dockerfile
│   └── requirements.txt        # Python dependencies
├── frontend/
│   ├── index.html              # Dashboard UI layout
│   ├── styles.css              # Custom styling & glassmorphism theme
│   ├── app.js                  # Frontend API client & DOM handler
│   ├── nginx.conf              # Nginx reverse proxy configuration
│   ├── .dockerignore
│   └── Dockerfile              # Nginx Frontend Dockerfile
├── .env                        # Root Environment variables
├── docker-compose.yml          # Multi-container Compose config
├── ums.sh                      # Shell control management script
└── README.md                   # Documentation
```

---

## 🛠️ Manual / Local Development Setup

### Prerequisites
- Python 3.10+
- PostgreSQL server running locally

### 1. Database Setup
Create database in PostgreSQL:
```sql
CREATE DATABASE ums_db;
```

### 2. Run Backend API
```bash
cd backend
pip install -r requirements.txt
python ums/run.py
```

### 3. Open Frontend UI
Simply open `frontend/index.html` in your browser or run:
```bash
cd frontend
python -m http.server 8000
```
Then visit `http://localhost:8000`.
