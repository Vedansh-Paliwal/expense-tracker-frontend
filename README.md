# 💸 Expense Tracker

A full-stack expense tracking web application that helps users manage their spending, set budgets, and analyze expenses.

---

## 🚀 Features

* User authentication (Signup/Login with JWT)
* Add, update, and delete expenses
* Set and track monthly budget
* View recent transactions
* Category-wise expense breakdown
* Analytics with charts
* 🤖 AI-powered financial insights:

  * Generates a financial report based on:

    * Monthly income
    * Savings goal
    * Financial priority
    * User's expense data
  * Avoids redundant generation by reusing previously generated reports if inputs haven't changed
* Responsive UI (works on desktop and mobile)

---

## 🛠 Tech Stack

### Frontend

* React (Vite)
* CSS Modules
* React Router

### Backend

* Spring Boot
* Spring Security (JWT Authentication)
* MongoDB Atlas

### Deployment

* Frontend: Netlify
* Backend: Render

---

## 🔗 Live Demo

* Frontend: https://expense-tracker-app-vp.netlify.app/
* Backend: https://expense-tracker-backend-kobn.onrender.com/

---

## ⚙️ Setup Instructions

### 1. Clone the repository

```id="q1a2w3"
git clone https://github.com/your-username/expense-tracker.git
cd expense-tracker
```

---

### 2. Frontend Setup

```id="e4r5t6"
cd frontend
npm install
npm run dev
```

---

### 3. Backend Setup

* Configure MongoDB URI
* Set JWT secret
* Run Spring Boot application

---

## 📌 Notes

* Backend may take a few seconds to respond initially (Render free tier sleeps when inactive)
* Ensure correct CORS configuration for frontend-backend communication

---

## 👨‍💻 Author

Vedansh Paliwal