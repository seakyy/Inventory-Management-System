## Inventory Management System for Construction Companies

A lightweight, locally hosted inventory system for managing tools, machines, and building materials — built for construction companies.

---

## Features

- Overview with status indicators (traffic light system)
- Add, mark as defective, and update articles
- Switch between **Card View** and **Table View**
- Sortable Table by any column
- CSV Export with one click
- Defect Logging with timestamps (logged to `log.txt`)
- Backend ready, database integration (SQLite) planned
- Minimal, intuitive UI

---

## Tech Stack

| Component  | Technology            |
|------------|------------------------|
| Frontend   | React + TypeScript     |
| Backend    | Express.js + TypeScript|
| Database   | SQLite (planned)       |
| Hosting    | Raspberry Pi 5         |
| Deployment | Nginx + PM2            |
| Styling    | Custom CSS             |

---

## Local Development

### Prerequisites

- Node.js v18+
- npm

### Project Structure
```
lagerverwaltung/
├── frontend/          → React App
│   ├── public/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── App.css
│   │   └── ...
│   └── package.json
└── backend/           → Express API
    ├── src/
    │   └── index.ts
    └── package.json
```

### Run Locally

```bash
# Start frontend
cd frontend
npm install
npm run dev

# Start backend
cd ../backend
npm install
npx ts-node src/index.ts
