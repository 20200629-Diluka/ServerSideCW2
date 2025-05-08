# Countries API Project

A full-stack application that provides authenticated access to country information through a managed API key system.

## Summary

This application allows users to:

1. Register and authenticate to manage their account
2. Create and manage API keys
3. Search for country information using their API keys
4. Track API key usage and manage access

The project consists of two main components:

- **API Server**: Node.js/Express backend with SQLite database
- **Web Client**: React-based frontend application

## Architecture

### System Architecture

```
┌─────────────┐     ┌──────────────┐     ┌──────────────────┐
│  React      │     │  Express     │     │  RestCountries   │
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
- **API Key Management**: Create, update, and revoke API keys
- **Country Data Access**: Proxy to RestCountries API
- **Usage Tracking**: Monitor API key usage
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
   PORT=5000
   JWT_SECRET=jwt_secret_key
   ```

4. Start the server:
   ```
   npm run dev
   ```
   The server will run on http://localhost:5000

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
   - Frontend: http://localhost:80
   - Backend API: http://localhost:5000

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
│   ├── utils/                # Utility functions
│   ├── index.js              # Server entry point
│   ├── Dockerfile            # Server Docker configuration
│   └── package.json          # Server dependencies
│
├── docker-compose.yml        # Docker Compose configuration
└── README.md                 # Project documentation
```

## Usage Guide

1. Register a new account
2. Log in with your credentials
3. Create an API key via the API Keys page
4. Test the country search functionality on the Dashboard page
5. View usage logs in the API Keys Logs page
