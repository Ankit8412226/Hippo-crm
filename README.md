# Hippo RealEstate CRM + Plot Management Platform

A production-grade, enterprise Real Estate MLM CRM & Plot Management SaaS system built with **Node.js, Express, MongoDB (Mongoose)** and **React, TypeScript, Tailwind CSS**.

---

## 🌟 Key Platform Features

### 1. Source-of-Truth MLM Business Logic (Hippo Business Plan)
- **Business Executive (BE)**: Self Sales ≥ 2 | Team Sales = 0 | Min Legs = 0 | **Commission: 5%**
- **Sr Business Executive (SBE)**: Self Sales ≥ 2 | Team Sales ≥ 5 | Min Legs ≥ 2 | **Commission: 8%**
- **Team Leader (TL)**: Self Sales ≥ 2 | Team Sales ≥ 8 | Min Legs ≥ 2 | **Commission: 10%**
- **Sr Team Leader (STL)**: Self Sales ≥ 1 | Team Sales ≥ 12 | Min Legs ≥ 3 | **Commission: 12%**
- **Business Development Manager (BDM)**: Self Sales ≥ 1 | Team Sales ≥ 20 | Min Legs ≥ 3 | **Commission: 15%**
- **Associate Sales Director (ASD)**: Self Sales ≥ 0 | Team Sales ≥ 50 | Min Legs ≥ 3 | Time Limit = 2 Months (60 Days) | **Commission: 18%**
- **Director Sales (DS)**: Top level qualification | **Commission: 20%**

### 2. Differential Commission Engine & Sponsor Tree
- Automatic differential payout distribution ascends downline sponsor chains upon plot sale transactions.
- Project-level commission rate overrides supported in `ProjectSettings`.

### 3. Interactive SVG Plot Canvas Map Viewer
- Color coded plot inventory:
  - 🟩 `AVAILABLE` (#22C55E)
  - 🟦 `BOOKED` (#3B82F6)
  - 🟨 `PENDING` (#FACC15)
  - 🟥 `SOLD` (#EF4444)
- Zoom, Pan, Plot Number Search, and Status filter controls.
- Click-to-open plot drawer displaying valuation, owner details, payment timeline, and document attachments.

### 4. AI OCR & Map Parser Pipeline
- Layout blueprint upload (PDF/PNG/JPG).
- PyMuPDF + OpenCV + OCR extraction pipeline returning structured vector plot geometry JSON.
- Confidence score evaluation (< 90% triggers interactive human-in-the-loop Approve, Edit, Reject workflow).

---

## 🚀 Quick Setup & Local Run Guide

### Step 1: Clone & Prerequisites
Ensure you have Node.js (v18+) and MongoDB installed and running on `mongodb://localhost:27017/hippocrm`.

### Step 2: Backend Setup
```bash
cd backend
npm install
npm run seed     # Populate database with CEO, hierarchy, projects, plots & rules
npm run dev      # Start Express API server on http://localhost:5000
```

### Step 3: Frontend Setup
```bash
cd frontend
npm install
npm run dev      # Start React Vite frontend on http://localhost:3000
```

---

## 🔐 Default Demo Login Credentials

- **Email**: `ankit@hippo.com`
- **Password**: `Password123!`
- **Role**: CEO / Admin (`Director Sales`)

---

## 📁 Repository Folder Structure

```
untitled folder 3/
├── backend/
│   ├── src/
│   │   ├── config/ (db.js)
│   │   ├── models/ (16 Mongoose models)
│   │   ├── services/ (mlmEngine.js, commissionEngine.js, ocrPipeline.js)
│   │   ├── controllers/ (auth, employee, mlm, project, plot, ocr, commission, payout, dashboard)
│   │   ├── routes/ (apiRoutes.js)
│   │   ├── utils/ (seedData.js)
│   │   └── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/ (dashboard, mlm, plots, ocr, layout)
│   │   ├── pages/ (11 complete enterprise pages)
│   │   ├── context/ (AuthContext.tsx)
│   │   ├── services/ (api.ts)
│   │   ├── types/ (index.ts)
│   │   ├── App.tsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
└── README.md
```
