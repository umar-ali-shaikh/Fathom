# Fathom — Instagram Clone (MERN Stack)

A full-stack social media application inspired by Instagram, built to demonstrate
production-style patterns in a MERN (MongoDB, Express, React, Node.js) codebase —
authentication, image uploads, feeds, stories, reels, notifications, and social
graph features (follow/unfollow, private accounts, follow requests).

## Overview

This project is a two-part application:

- **`backend/`** — a REST API built with Express and MongoDB (Mongoose) that
  handles authentication, posts, comments, likes, follows, stories, reels,
  and activity notifications.
- **`frontend/`** — the web client, built with React 19, TanStack
  Router/Start, and Tailwind CSS.

## Key Features

- **Authentication** — email/password signup & login (JWT in an httpOnly
  cookie) plus Google OAuth 2.0 sign-in.
- **Posts** — create, edit, and delete posts with image uploads (via
  ImageKit), like/unlike, and threaded comments.
- **Stories & Reels** — 24-hour auto-expiring stories and short-form video
  reels with likes.
- **Social graph** — follow/unfollow, private accounts with follow request
  approval, follower/following lists.
- **Activity feed** — real-time-style notifications for likes, comments,
  follows, and follow requests.
- **Search & discovery** — user search and an explore feed.
- **Account settings** — password change, privacy toggle, and profile
  editing.
- **Security** — rate limiting on auth routes, Helmet for HTTP headers, input
  validation on every route, and CORS locked to known origins.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TanStack Router / TanStack Start, Tailwind CSS, Radix UI, React Hook Form, Zod |
| Backend | Node.js, Express 5, Mongoose (MongoDB) |
| Auth | JWT (httpOnly cookies), Google OAuth 2.0 |
| Media storage | ImageKit |
| Tooling | Vite, ESLint, Prettier, Nodemon |

## Project Structure

```
Instagram MERN Stack Project/
├── backend/                 REST API (Express + MongoDB)
│   ├── src/
│   │   ├── controllers/     Route handlers (auth, post, comment, user, story, reel, activity, upload)
│   │   ├── model/           Mongoose schemas
│   │   ├── routes/          Express routers
│   │   ├── middleware/      Auth, error handling, rate limiting
│   │   ├── validators/      Request validation
│   │   └── services/        Business logic / integrations
│   └── server.js
└── frontend/                Web client (React + TanStack Start)
    └── src/
        ├── routes/          Pages (feed, explore, reels, profile, settings, auth)
        ├── features/        Feature modules (post, profile, reel, story)
        ├── lib/api/         API client, endpoints, and type contracts
        └── providers/       App-wide context (auth, etc.)
```

## Getting Started

### Prerequisites

- Node.js 18+
- A MongoDB instance (local or Atlas)
- An ImageKit account (for media uploads)
- A Google Cloud OAuth 2.0 client (for Google sign-in)

### Backend setup

```bash
cd backend
npm install
```

Create a `backend/.env` file with:

```
MONGO_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret
IMAGEKIT_PRIVATE_KEY=your-imagekit-private-key
GOOGLE_CLIENT_ID=your-google-oauth-client-id
CLIENT_URL=http://localhost:5173
PORT=3000
NODE_ENV=development
```

```bash
npm run dev
```

The API runs at `http://localhost:3000` by default, mounted under `/api`.

### Frontend setup

```bash
cd frontend
npm install
echo "VITE_API_BASE_URL=http://localhost:3000/api" > .env.local
npm run dev
```

The web client runs at `http://localhost:5173` (or the port Vite assigns) by default.

## Author

**Umar Ali Shaikh**
