
# Tasks — Modern Task Management App

A full-stack task management application built with **Next.js 16, TypeScript, Prisma, and Supabase**. Create and manage personal tasks, collaborate through task sharing, and control access with read and write permissions.

🌐 **Live Demo:** https://tasks-neon-nine.vercel.app

---

## Overview

Tasks is a modern task management application designed to help users organize their work and collaborate with others.

The application includes secure authentication, personal task management, and shared task access with permission-based controls.

## Features

- **User Authentication** — Account authentication with bcrypt password hashing and JWT sessions.
- **Task Management** — Create, view, update, and delete tasks.
- **Task Sharing** — Share tasks with other users.
- **Access Permissions** — Assign read or write permissions to shared tasks.
- **Private Tasks** — Tasks remain private to their owners by default.
- **REST API** — Backend endpoints for authentication and task operations.
- **Responsive Interface** — Modern application interface built with React and Tailwind CSS.

## Technology Stack

| Technology | Purpose |
|---|---|
| Next.js 16 | Full-stack framework and App Router |
| TypeScript | Type-safe development |
| React | User interface |
| Tailwind CSS v4 | Styling |
| Prisma | Database ORM |
| Supabase | PostgreSQL database |
| bcrypt | Password hashing |
| JWT | Authentication sessions |
| Vercel | Deployment |

## Getting Started

### Prerequisites

- Node.js
- npm
- A Supabase PostgreSQL database

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Giscard49/tasks.git
   ```

2. Navigate into the project:

   ```bash
   cd tasks
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Create your environment file:

   ```bash
   cp .env.example .env
   ```

5. Configure the environment variables in `.env`, including your Supabase PostgreSQL connection string:

   ```env
   DATABASE_URL="your_database_connection_string"
   ```

   Use the complete variable configuration documented in `.env.example`.

6. Start the development server:

   ```bash
   npm run dev
   ```

7. Open http://localhost:3000 in your browser.

## Project Structure

```text
src/
├── app/
│   ├── page.tsx
│   ├── layout.tsx
│   └── api/
│       ├── auth/
│       └── tasks/
├── components/
├── lib/
└── api.ts

prisma/
└── schema.prisma
```

- `src/app/` — Next.js App Router pages and API routes.
- `src/components/` — Reusable React components.
- `src/lib/` — Prisma client, authentication, and API helpers.
- `prisma/` — Database schema and models.

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Authenticate a user |
| POST | `/api/auth/logout` | End the current session |

Login sets an HTTP-only session cookie. A JWT token is also returned and accepted through a Bearer authorization header.

### Tasks

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/tasks` | Retrieve owned and shared tasks |
| POST | `/api/tasks` | Create a task |
| PATCH | `/api/tasks/:id` | Update a task |
| DELETE | `/api/tasks/:id` | Delete an owned task |
| POST | `/api/tasks/:id/share` | Share a task |
| DELETE | `/api/tasks/:id/share/:userId` | Revoke shared access |

Shared task permissions support `read` and `write` access.

## Database

The application uses **Prisma ORM** with a Supabase-hosted PostgreSQL database.

The Prisma schema includes:

- User
- Task
- TaskShare

## Deployment

The application is deployed on Vercel.

**Live Application:** https://tasks-neon-nine.vercel.app

## Contributing

Contributions and suggestions are welcome. Feel free to fork the repository and submit a pull request.

## Author

**Giscard Ngabonziza**

- GitHub: [@Giscard49](https://github.com/Giscard49)
- Portfolio: https://giscard.com
- LinkedIn: https://www.linkedin.com/in/giscard-ngabo-03534b232/

---


