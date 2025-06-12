## Inventory Management System for Construction Companies

A lightweight, locally hosted inventory system for managing tools, machines, and building materials — built for construction companies.

There will be two versions released.
First option: WebApp with JSON file saving
Second option: WebApp with MongoDB

---

## Showcase
![grafik](https://github.com/user-attachments/assets/c4612593-742b-4b5d-802d-92f696ea9403)



Admin View:

![grafik](https://github.com/user-attachments/assets/0a21974a-2592-4238-996f-d900dd4c1e7e)



Maintainer View:

![grafik](https://github.com/user-attachments/assets/fd4daf76-c068-460d-988d-4e382072f18f)



Table View:

![grafik](https://github.com/user-attachments/assets/ce23e362-23f9-4257-838f-77fc1ffd268b)


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


