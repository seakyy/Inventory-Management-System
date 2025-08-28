## Inventory Management System for Construction Companies

A lightweight, locally hosted inventory system for managing tools, machines, and building materials — built for construction companies.

There will be two versions released.
First option: WebApp with JSON file saving
Second option: WebApp with MongoDB

---

## Showcase

<img width="1285" height="615" alt="grafik" src="https://github.com/user-attachments/assets/0db8d783-9707-44ac-ba4a-cfe34ee2171a" />



Admin View:

<img width="1024" height="1246" alt="grafik" src="https://github.com/user-attachments/assets/a26b1325-1351-43c5-9fe2-fc3472d352a6" />




Maintainer View:

<img width="1020" height="972" alt="grafik" src="https://github.com/user-attachments/assets/e60e0e6f-89ce-44f5-af36-a79a7d3fc639" />




Card View:

<img width="927" height="1187" alt="grafik" src="https://github.com/user-attachments/assets/f32b7511-02fb-4fd7-802b-cb41bb228f97" />



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
| Database   | MongoDB (planned), for now JSON      |
| Hosting    | Raspberry Pi 5         |
| Deployment | Caddy + PM2            |
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
```


