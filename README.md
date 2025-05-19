# TravelTales

A community-driven platform where travelers can share their adventures and connect with fellow explorers worldwide.

## Summary

This application allows users to:

1. Register and authenticate to manage their account
2. Create, read, update, and delete travel blog posts
3. Follow other users and interact with their content
4. Search and discover travel experiences by country or user

The project consists of two main components:

- **API Server**: Node.js/Express backend with SQLite database
- **Web Client**: React-based frontend application

## Architecture

### System Architecture

```
┌─────────────┐     ┌──────────────┐     ┌──────────────────┐
│  React      │     │  Express     │     │  Country Data    │
│  Frontend   │────>│  Backend     │────>│  External API    │
│  (Client)   │<────│  (Server)    │<────│                  │
└─────────────┘     └──────────────┘     └──────────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   SQLite     │
                    │   Database   │
                    └──────────────┘
```

### Technology Stack

- **Frontend**:

  - React
  - React Router
  - React Bootstrap
  - Axios
  - Context API

- **Backend**:
  - Node.js
  - Express
  - SQLite
  - JWT Authentication
  - bcrypt

### Key Features

- **User Authentication**: Secure login and registration system
- **Blog Management**: Create, read, update, and delete travel blog posts
- **Social Features**: Follow users, like and comment on posts
- **Country Integration**: Automatic country data enrichment
- **Search Functionality**: Find posts by country or user
- **Containerization**: Docker support for easy deployment

## Setup Guide

### Prerequisites

- Node.js (v14+ recommended)
- npm (v6+ recommended)
- Docker and Docker Compose (optional, for containerized setup)

### Manual Setup

#### Backend (Server)

1. Navigate to the server directory:

   ```
   cd server
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Set up environment variables by creating a `.env` file in the root directory:

   ```
   PORT=5001
   JWT_SECRET=jwt_secret_key
   ```

4. Start the server:
   ```
   npm run dev
   ```
   The server will run on http://localhost:5001

#### Frontend (Client)

1. Navigate to the client directory:

   ```
   cd client
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```
   The client will run on http://localhost:5173

### Docker Setup

The entire application can be run using Docker Compose:

1. From the project root directory, run:

   ```
   docker-compose up
   ```

2. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001

## Project Structure

```
├── client/                   # Frontend application
│   ├── public/               # Static assets
│   ├── src/                  # Source code
│   │   ├── assets/           # Images and resources
│   │   ├── components/       # Reusable components
│   │   ├── context/          # React context providers
│   │   ├── pages/            # Application pages
│   │   ├── services/         # API services
│   │   ├── App.jsx           # Main application component
│   │   └── main.jsx          # Application entry point
│   ├── Dockerfile            # Client Docker configuration
│   └── package.json          # Client dependencies
│
├── server/                   # Backend application
│   ├── db/                   # Database setup and files
│   ├── middleware/           # Express middleware
│   ├── routes/               # API routes
│   ├── index.js              # Server entry point
│   ├── Dockerfile            # Server Docker configuration
│   └── package.json          # Server dependencies
│
├── docker-compose.yml        # Docker Compose configuration
└── README.md                 # Project documentation
```

## Usage Guide

1. Register a new account
2. Browse home page content
3. Create your first travel blog post
4. Follow other users and interact with their content
5. Search for travel blog posts by country or user
