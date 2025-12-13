# Nexus School Management System

A high-performance, role-based School Management System built with React, Vite, and Firebase.

## 🚀 Getting Started

### 1. Installation

Install the dependencies:

```bash
npm install
```

### 2. Firebase Configuration

This system requires Firebase for Authentication and Database.

1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Create a new project.
3. Enable **Authentication** (Email/Password).
4. Enable **Firestore Database** (Start in Test Mode).
5. Copy your web app configuration keys.
6. Open `src/firebase/config.js` and paste your keys:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  ...
};
```

### 3. Running the App

Start the development server:

```bash
npm run dev
```

## 🛡️ User Roles & Features

### System Admin
- Monitor system performance and logs.
- Create new School instances and assign Management admins.
- Login at: `/login/admin`

### Management (Principal)
- Onboard Teachers and Staff.
- Manage Student Enrollments.
- View School Reports.
- Login at: `/login/management`

### Teacher
- Manage Class Roster.
- Mark Daily Attendance.
- input Grades.
- Login at: `/login/teacher`

### Student
- View Timetable and Attendance.
- Check Report Cards.
- Receive Notifications.
- Login at: `/login/student`

## 🎨 Design

Built with a premium Glassmorphism aesthetic using Vanilla CSS for maximum performance and customizability.
