# Express Backend

A REST API backend built with Express.js and TypeScript, running on Bun.

## Features

- 🚀 Express.js with TypeScript
- 📊 RESTful API endpoints
- 🔄 CORS enabled for frontend integration
- 👥 User management (CRUD operations)
- 📝 Post management with user relationships
- 📈 Analytics endpoint
- 🔥 Hot reload in development

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Posts
- `GET /api/posts` - Get all posts with user info
- `GET /api/posts/:id` - Get post by ID
- `POST /api/posts` - Create new post

### Analytics
- `GET /api/analytics` - Get platform analytics

## Setup

To install dependencies:

```bash
bun install
```

To run in development mode (with hot reload):

```bash
bun run dev
```

To run in production mode:

```bash
bun run start
```

To build for production:

```bash
bun run build
```

## Environment Variables

Create a `.env` file in the root directory:

```
PORT=3001
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

The server will run on http://localhost:3001 by default.

This project was created using `bun init` and enhanced with Express.js.
