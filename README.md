# FreelanceFlow

A minimal project management web app built with the MERN stack. Each user can only view and manage their own projects, payments, and domain/hosting details.

## Tech Stack

- **Frontend:** React (Vite), Tailwind CSS, React Router
- **Backend:** Express.js, Mongoose, JWT
- **Database:** MongoDB

## Features

- User registration & login (JWT-based auth)
- Project CRUD with status tracking (active / completed / on-hold)
- Payment management per project
- Domain & hosting tracking with renewal date notifications
- Expiry alert banner (color-coded: red ≤7d, yellow ≤14d, blue ≤30d)
- Dark theme, responsive design

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB running locally (or a cloud URI)

### Installation

```bash
# Clone the repo
git clone <repo-url>
cd FreelanceFlow

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Configuration

Edit `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/freelanceflow
JWT_SECRET=your_secret_key_here
```

### Running

```bash
# Terminal 1 - Start the backend
cd server
npm run dev

# Terminal 2 - Start the frontend
cd client
npm run dev
```

The client runs on `http://localhost:3000` and proxies API calls to `http://localhost:5000`.

## Project Structure

```
FreelanceFlow/
├── server/
│   ├── config/db.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   ├── Payment.js
│   │   └── DomainHosting.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── projects.js
│   │   ├── payments.js
│   │   └── domains.js
│   ├── middleware/auth.js
│   └── server.js
├── client/
│   └── src/
│       ├── api/axios.js
│       ├── context/AuthContext.jsx
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── ProtectedRoute.jsx
│       │   └── RenewalAlert.jsx
│       └── pages/
│           ├── Login.jsx
│           ├── Register.jsx
│           ├── Dashboard.jsx
│           ├── ProjectDetail.jsx
│           ├── Payments.jsx
│           └── Domains.jsx
└── .gitignore
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/projects` | List user's projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id` | Get project |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |
| GET | `/api/payments` | List payments (optional `?projectId=`) |
| POST | `/api/payments` | Create payment |
| PUT | `/api/payments/:id` | Update payment |
| DELETE | `/api/payments/:id` | Delete payment |
| GET | `/api/domains` | List domain/hosting entries |
| GET | `/api/domains/expiring` | Entries expiring within 30 days |
| POST | `/api/domains` | Create domain/hosting entry |
| PUT | `/api/domains/:id` | Update entry |
| DELETE | `/api/domains/:id` | Delete entry |

## License

MIT
