# TaskFlow

Real-time collaborative project management platform with workspaces, boards, tasks, and AI-powered priority suggestions.

## Tech Stack

**Frontend:** Next.js, TypeScript, Tailwind CSS
**Backend:** Node.js, Express.js, PostgreSQL, Prisma ORM, Socket.io
**Auth:** JWT-based authentication with Role-Based Access Control (RBAC)
**AI:** Google Gemini API for Smart Priority Suggestions
**DevOps:** Docker, Docker Compose, GitHub Actions CI

## Features

- Real-time collaborative boards and task updates via Socket.io
- JWT authentication with role-based access control for workspaces and boards
- AI-powered Smart Priority Suggestion feature using Google Gemini API
- REST API with PostgreSQL and Prisma ORM
- Fully containerized with Docker and Docker Compose for local development

## Getting Started

### Prerequisites
- Node.js (v20+)
- Docker & Docker Compose
- PostgreSQL (or use the provided Docker setup)

### Setup

```bash
# Clone the repo
git clone https://github.com/pallavics26/tech-flow.git
cd tech-flow

# Backend setup
cd backend
npm install
npx prisma generate
npx prisma migrate dev

# Frontend setup
cd ../frontend
npm install
```

### Environment Variables

Create a `.env` file in both `backend/` and `frontend/` directories based on `.env.example` (if provided), including:

- `DATABASE_URL`
- `JWT_SECRET`
- `GEMINI_API_KEY`

### Running Locally

```bash
# Using Docker Compose (recommended)
docker-compose up

# Or run manually:
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

## CI/CD

This project uses GitHub Actions to automatically build and lint both the backend and frontend on every push and pull request to `main`. See `.github/workflows/ci.yml`.

## License

MIT