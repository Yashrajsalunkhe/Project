# Management Dashboard

A modern, professional full-stack management dashboard built with React, Express.js, and MongoDB featuring a beautiful UI with Indian names and culturally relevant content.

## Features

- **Complete User Management**: Create, read, update, and delete users with form validation
- **Advanced Post Management**: LinkedIn-style post creation with editing and deletion
- **Analytics Dashboard**: User statistics, visual charts, and real-time data
- **MongoDB Integration**: Database with Mongoose ODM and automatic seeding
- **Indian Content**: 15 diverse Indian names and 12 themed posts
- **Professional UI**: Modern dark theme with Lucide icons and smooth animations

## Tech Stack

**Frontend:**

- React 19 with TypeScript
- Vite for development and building
- React Router for navigation
- Axios for API calls
- Lucide React for icons
- Modern CSS with variables and gradients

**Backend:**

- Express.js with TypeScript
- MongoDB with Mongoose ODM
- Bun runtime for fast performance
- CORS enabled for cross-origin requests
- RESTful API architecture

## Getting Started

### Prerequisites

- Node.js (v18+) or Bun
- MongoDB (running locally or MongoDB Atlas)

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd project
   ```

2. Install all dependencies:

   ```bash
   npm run install:all
   ```

3. Start the development servers:

   ```bash
   # From root directory - starts both frontend and backend
   npm run dev
   
   # Or start individually:
   npm run dev:backend   # Backend only
   npm run dev:frontend  # Frontend only
   ```

### Application URLs

- Frontend: <http://localhost:5173>
- Backend: <http://localhost:3001>
- API Health Check: <http://localhost:3001/health>

## API Endpoints

**Users:**

- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

**Posts:**

- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create new post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post

**Analytics:**

- `GET /api/analytics` - Get analytics data

## Testing

1. **Check Connection Status**: Look for green dot in top-right corner
2. **Test User Management**: Create, edit, and delete users
3. **Test Post Management**: Create posts with different authors, edit existing posts
4. **Test Analytics**: View user statistics and post distribution charts

## Project Structure

```text
rutuja_project/
├── backend/                 # Express.js backend
│   ├── models/             # MongoDB models
│   ├── config/             # Database configuration
│   └── index.ts            # Main server file
├── forntend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── api.ts          # API client
│   │   └── App.tsx         # Main app component
│   └── public/
├── package.json            # Root package.json
└── README.md              # This file
```

## Available Scripts

```bash
npm run dev              # Start both frontend and backend
npm run dev:backend      # Start backend only
npm run dev:frontend     # Start frontend only
npm run build           # Build frontend for production
npm run build:backend   # Build backend for production
npm run install:all     # Install all dependencies
npm run clean           # Clean node_modules
npm run test:api        # Test API endpoints
```

## Features Showcase

- Beautiful Dashboard with modern glassmorphism design
- Professional Forms with LinkedIn-style post creation and editing
- Smart Validation with real-time form validation and character counters
- Interactive UI with hover effects, smooth animations, and loading states
- Cultural Content with authentic Indian names and relevant post topics
- Mobile Ready with fully responsive design for all devices
