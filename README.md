# Online Examination System (MERN)

A full-stack MCQ-based examination system with **Admin** and **User** roles, JWT authentication, and auto-evaluation of answers.

## Tech Stack

- **Frontend:** React.js, React Router, Axios, CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT, bcrypt

## Project Structure

```
├── backend/
│   ├── config/       # DB connection
│   ├── controllers/  # Auth, Admin, User
│   ├── middleware/   # JWT protect, adminOnly, userOnly
│   ├── models/       # User, Exam, Question, Response
│   ├── routes/       # auth, admin, user
│   ├── server.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── pages/      # User & Admin pages
│   │   ├── services/   # Axios API
│   │   ├── App.js
│   │   └── index.js
│   ├── .env.example
│   └── package.json
└── README.md
```

## Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (local or Atlas connection string)
- **npm** or **yarn**

## Setup Instructions

### 1. Clone / Open project

Ensure you are in the project root (folder containing `backend` and `frontend`).

### 2. Backend setup

```bash
cd backend
npm install
```

Create `.env` from example:

```bash
copy .env.example .env   # Windows
# or: cp .env.example .env   # Mac/Linux
```

Edit `.env` and set:
- `JWT_SECRET` – a strong random string for JWT signing
  
Start the server:

```bash
npm run dev
```

Server runs at **http://********. API base: **http://*********/api**.

### 3. Frontend setup

Open a **new terminal**:

```bash
cd frontend
npm install
```

Optional: create `.env` from example and set API URL if different:

```bash
copy .env.example .env   # Windows
# Set REACT_APP_API_URL=http://**********/api if needed
```

Start the React app:

```bash
npm start
```

Frontend runs at **http:********.

### 5. Create a User (candidate)

- Go to **http://*********/register**
- Register with name, email, password (role is user by default)

### 6. Typical flow

1. **Admin:** Login → Create Exam (title, skill) → Add questions (4 options, correct answer 1–4) → Assign exam to users.
2. **User:** Login → Dashboard shows assigned exams → View & Attempt exam → Submit answers.
3. **Admin:** Responses → Click **Get Score** on a submission → score is calculated, stored, and shown.
4. **User:** Dashboard → View Result for that exam to see score after evaluation.

## API Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register (body: name, email, password, role?) |
| POST | /api/auth/login | Login (body: email, password) |
| POST | /api/admin/exam | Create exam (admin, body: title, skill) |
| GET  | /api/admin/exams | List exams (admin) |
| GET  | /api/admin/users | List users (admin) |
| POST | /api/admin/question | Add question (admin, body: examId, question, options[4], correctAnswer 0-3) |
| POST | /api/admin/assign | Assign exam (admin, body: examId, userIds[]) |
| GET  | /api/admin/responses | List responses (admin, query: examId?) |
| POST | /api/admin/get-score | Evaluate & save score (admin, body: responseId) |
| GET  | /api/user/exams | My assigned exams (user) |
| GET  | /api/user/exam/:id | Get exam + questions (user) |
| POST | /api/user/submit | Submit answers (user, body: examId, answers[]) |
| GET  | /api/user/result/:id | Get result for exam (user) |

## Security

- Passwords hashed with **bcrypt**
- **JWT** in `Authorization: Bearer <token>`
- **Role-based** routes: admin vs user

## Frontend Routes

- **User:** `/login`, `/register`, `/dashboard`, `/exam/:id`, `/result?examId=...`
- **Admin:** `/admin/login`, `/admin/dashboard`, `/admin/create-exam`, `/admin/assign`, `/admin/responses`

## Notes

- One submission per user per exam; re-submit is blocked.
- Correct answer is stored as 0-based index (0–3) for each question.
- Result is visible to user only after admin clicks **Get Score**.

---

**Ready to run locally:** ensure MongoDB is running, set `.env` in backend (and optionally in frontend), then start backend and frontend as above.
