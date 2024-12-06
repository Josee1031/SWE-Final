### **Library Management System (LMS) - Developer Setup Guide**

This guide will help developers set up the **Library Management System (LMS)** project on their local machines, including initializing the **React frontend**, **Django backend**, and a **local MySQL database**.

---

## **Prerequisites**
Ensure the following tools are installed on your system:

### **Common Requirements**
- **Git**: [Install Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
- **Node.js & npm**: [Install Node.js](https://nodejs.org/) (Latest stable version recommended)
- **Python 3.10**: [Install Python](https://www.python.org/downloads/)
- **MySQL**: [Install MySQL](https://dev.mysql.com/downloads/) (Community Edition recommended)

---

## **1. Clone the Repository**
1. Clone the repository to your local machine:
   ```bash
   git clone <repository-url>
   cd <repository-folder>
   ```

2. Confirm the folder contains:
   - `lms_frontend/`: React frontend source code.
   - `lms_backend/`: Django backend source code.

---

## **2. Setting Up the Frontend**

### **Steps**
1. Navigate to the frontend directory:
   ```bash
   cd lms_frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. The React frontend will be accessible at:
   ```
   http://localhost:3000
   ```

---

## **3. Setting Up the Backend**

### **A) Install Python Dependencies**
1. Navigate to the backend directory:
   ```bash
   cd ../lms_backend
   ```

2. Set up a Python virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate       # For Mac/Linux
   venv\Scripts\activate          # For Windows
   ```

3. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

---

### **B) Configure the MySQL Database**

#### **1. Install and Start MySQL**
Follow platform-specific steps to install MySQL:
- **Mac/Linux**:
  - Install MySQL:
    ```bash
    sudo apt update && sudo apt install mysql-server  # For Ubuntu
    brew install mysql                                 # For macOS
    ```
  - Start MySQL:
    ```bash
    sudo service mysql start  # Ubuntu
    brew services start mysql # macOS
    ```

- **Windows**:
  - Download and install MySQL from [MySQL Official Site](https://dev.mysql.com/downloads/).
  - Start the MySQL server via the MySQL Workbench or Windows Services Manager.

---

#### **2. Create the Database**
1. Log in to MySQL:
   ```bash
   mysql -u root -p
   ```

2. Create the database and user:
   ```sql
   CREATE DATABASE bookworm CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
   CREATE USER 'bookworm_user'@'localhost' IDENTIFIED BY 'securepassword';
   GRANT ALL PRIVILEGES ON bookworm.* TO 'bookworm_user'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
   ```

#### **3. Verify Database Setup**
Log back in to confirm the database:
```bash
mysql -u bookworm_user -p
USE bookworm;
SHOW TABLES;
```
It should return an empty list initially, as tables are created during Django migrations.

---

### **C) Apply Migrations**
Run the following commands to initialize the database schema:

1. Apply the migrations:
   ```bash
   python manage.py migrate
   ```

2. Verify the schema:
   ```bash
   mysql -u bookworm_user -p
   USE bookworm;
   SHOW TABLES;
   ```
You should see the default Django tables (e.g., `auth_user`, `django_migrations`) along with any app-specific tables.

---

### **D) Start the Django Server**
Run the development server:
```bash
python manage.py runserver
```

The backend will be accessible at:
```
http://127.0.0.1:8000
```

---

## **4. Testing the Setup**

### **Frontend**
1. Ensure the React frontend is running at:
   ```
   http://localhost:3000
   ```

2. Confirm the frontend can interact with the backend by navigating through the app.

### **Backend**
1. Ensure the backend is running at:
   ```
   http://127.0.0.1:8000
   ```

2. Test API endpoints using tools like Postman, curl, or your browser (for basic GET endpoints).

---

## **5. Notes**

- Ensure your MySQL server is running before starting the backend server.
- Use `npm install` to ensure your frontend dependencies are up-to-date.
- For troubleshooting, check Django logs (`runserver` output) and browser console logs.

---

## **6. Key Commands**

### **Frontend**
```bash
cd lms_frontend
npm install
npm run dev
```

### **Backend**
```bash
cd lms_backend
python -m venv venv
source venv/bin/activate       # (or venv\Scripts\activate for Windows)
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

---
