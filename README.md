# Quizzy-Gen

Quizzy-Gen is a quiz generation system that allows users to create customized quizzes from a science curriculum database. The system provides an easy way to select chapters and the number of questions for quizzes, with immediate results displayed after completion.

## Features

- **Customizable Quizzes**: Select specific chapters and number of questions
- **Comprehensive Content**: Access questions from an extensive science curriculum
- **Instant Results**: Get immediate feedback and explanations
- **Shareable Quizzes**: Share custom quizzes via unique links
- **Admin Dashboard**: Manage content and view analytics

## Tech Stack

- **Frontend**: React.js
- **Backend**: Node.js with Express
- **Database**: MongoDB
- **Containerization**: Docker & Docker Compose

## Prerequisites

- Docker and Docker Compose
- Git

## Getting Started

### Clone the Repository

```bash
git clone https://github.com/yourusername/quizzy-gen.git
cd quizzy-gen
```

### Environment Setup

Create a `.env` file in the root directory with the following variables:

```
MONGO_USERNAME=quizzy_admin
MONGO_PASSWORD=quizzy_password
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
```

### Start the Application

```bash
docker-compose up -d
```

This will start the MongoDB database, backend server, and frontend client.

### Import Sample Data

The application comes with sample chapter data in the `data` directory. To import this data:

```bash
./scripts/import-all.sh
```

### Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Documentation: http://localhost:5000/api-docs

## Project Structure

```
quizzy-gen/
├── client/                 # React frontend
├── server/                 # Node.js backend
├── data/                   # Sample chapter data
├── scripts/                # Utility scripts
├── docker-compose.yml      # Docker Compose configuration
└── README.md               # This file
```

## API Endpoints

### Chapters

- `GET /api/v1/chapters` - Get all chapters
- `GET /api/v1/chapters/:id` - Get chapter by ID
- `GET /api/v1/chapters/:id/questions` - Get questions for a chapter

### Questions

- `GET /api/v1/questions` - Get questions with optional filtering
- `GET /api/v1/questions/:id` - Get question by ID

### Quizzes

- `POST /api/v1/quizzes` - Create a new quiz
- `GET /api/v1/quizzes` - Get all quizzes
- `GET /api/v1/quizzes/:id` - Get quiz by ID
- `GET /api/v1/quizzes/link/:shareableLink` - Get quiz by shareable link

### Quiz Attempts

- `POST /api/v1/quiz-attempts` - Submit a quiz attempt
- `GET /api/v1/quiz-attempts/:id` - Get quiz attempt by ID

### Admin

- `POST /api/v1/admin/register` - Register a new admin (super_admin only)
- `POST /api/v1/admin/login` - Login admin
- `GET /api/v1/admin/me` - Get current admin

## Development

### Running in Development Mode

```bash
# Start all services
docker-compose up

# Start only specific services
docker-compose up mongodb server
```

### Stopping the Application

```bash
docker-compose down
```

## License

This project is licensed under the MIT License - see the LICENSE file for details. 