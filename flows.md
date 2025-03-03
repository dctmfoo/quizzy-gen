# Quizzy-Gen Application Flows

This document visualizes the key flows of the Quizzy-Gen application using Mermaid diagrams.

## System Architecture

```mermaid
graph TB
    subgraph "Frontend (React)"
        UI[User Interface]
        RC[React Components]
        RS[React Services]
    end
    
    subgraph "Backend (Node.js/Express)"
        API[API Endpoints]
        CTR[Controllers]
        MDL[Models]
        MID[Middleware]
    end
    
    subgraph "Database (MongoDB)"
        DB[(MongoDB)]
    end
    
    UI --> RC
    RC --> RS
    RS --> API
    API --> CTR
    CTR --> MDL
    MDL --> DB
    MID --> API
```

## Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant ProtectedRoute
    participant Backend
    participant Database
    
    User->>Frontend: Navigate to protected page
    Frontend->>ProtectedRoute: Check authentication
    
    alt No Token Found
        ProtectedRoute->>Frontend: Redirect to login page
        Frontend->>User: Display login form
        User->>Frontend: Enter credentials
        Frontend->>Backend: POST /api/v1/admin/login
        Backend->>Database: Verify credentials
        Database-->>Backend: Admin data
        Backend->>Backend: Generate JWT token
        Backend-->>Frontend: Return token
        Frontend->>Frontend: Store token in localStorage
        Frontend->>ProtectedRoute: Retry protected route
    else Token Found
        ProtectedRoute->>Backend: GET /api/v1/admin/me
        Backend->>Backend: Verify JWT token
        alt Valid Token
            Backend->>Database: Find admin by ID
            Database-->>Backend: Admin data
            Backend-->>ProtectedRoute: Authentication successful
            ProtectedRoute->>Frontend: Render protected component
            Frontend-->>User: Display protected content
        else Invalid Token
            Backend-->>ProtectedRoute: Authentication failed
            ProtectedRoute->>Frontend: Redirect to login page
            Frontend-->>User: Display login form
        end
    end
```

## User Flow: Taking a Quiz

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Database
    
    User->>Frontend: Navigate to Quiz Page
    Frontend->>Backend: GET /api/v1/quizzes/:id (with auth token)
    Backend->>Backend: Verify authentication
    Backend->>Database: Find Quiz by ID
    Database-->>Backend: Return Quiz Data
    Backend-->>Frontend: Quiz Data
    Frontend-->>User: Display Quiz
    
    User->>Frontend: Answer Questions
    User->>Frontend: Submit Quiz
    Frontend->>Backend: POST /api/v1/quiz-attempts (with auth token)
    Backend->>Backend: Verify authentication
    Backend->>Database: Save Quiz Attempt
    Backend->>Backend: Calculate Score
    Database-->>Backend: Confirm Save
    Backend-->>Frontend: Quiz Results
    Frontend-->>User: Display Results Page
```

## User Flow: Creating a Quiz

```mermaid
sequenceDiagram
    participant Admin
    participant Frontend
    participant Backend
    participant Database
    
    Admin->>Frontend: Navigate to Create Quiz Page
    Frontend->>Backend: GET /api/v1/chapters (with auth token)
    Backend->>Backend: Verify authentication
    Backend->>Database: Fetch All Chapters
    Database-->>Backend: Chapters Data
    Backend-->>Frontend: Chapters List
    Frontend-->>Admin: Display Chapter Selection
    
    Admin->>Frontend: Select Chapters & Set Parameters
    Admin->>Frontend: Create Quiz
    Frontend->>Backend: POST /api/v1/quizzes (with auth token)
    Backend->>Backend: Verify authentication
    Backend->>Backend: Generate Random Questions
    Backend->>Database: Save New Quiz
    Database-->>Backend: Confirm Save
    Backend-->>Frontend: New Quiz Data
    Frontend-->>Admin: Display Quiz Success
```

## Protected Routes Flow

```mermaid
flowchart TD
    A[User Accesses Route] --> B{Is Homepage?}
    B -->|Yes| C[Render Homepage]
    B -->|No| D{Is Login Page?}
    D -->|Yes| E[Render Login Page]
    D -->|No| F{Has Valid Token?}
    F -->|Yes| G[Render Protected Content]
    F -->|No| H[Redirect to Login]
    H --> I[Login Form]
    I --> J{Login Successful?}
    J -->|Yes| K[Store Token]
    K --> L[Redirect to Original Page]
    J -->|No| M[Show Error]
    M --> I
```

## Data Model

```mermaid
erDiagram
    CHAPTER ||--o{ QUESTION : contains
    QUIZ ||--o{ QUESTION : includes
    QUIZ ||--o{ CHAPTER : references
    QUIZ_ATTEMPT ||--o{ QUIZ : attempts
    QUIZ_ATTEMPT ||--o{ ANSWER : contains
    QUESTION ||--o{ ANSWER : has
    ADMIN ||--o{ QUIZ : creates

    CHAPTER {
        string _id
        string title
        string description
        date createdAt
        date updatedAt
    }
    
    QUESTION {
        string _id
        string questionText
        string type
        array options
        string correctAnswer
        string explanation
        string reference
        string chapterId
        date createdAt
        date updatedAt
    }
    
    QUIZ {
        string _id
        string title
        string description
        int questionCount
        array questions
        array chapters
        string shareableLink
        date createdAt
        date expiresAt
        boolean isActive
    }
    
    QUIZ_ATTEMPT {
        string _id
        string quizId
        string userName
        string userEmail
        array answers
        int score
        int totalQuestions
        date completedAt
    }
    
    ANSWER {
        string questionId
        string selectedAnswer
        boolean isCorrect
    }
    
    ADMIN {
        string _id
        string name
        string email
        string password
        date createdAt
    }
```

## API Flow: Quiz Submission and Results

```mermaid
flowchart TD
    A[Client submits quiz] --> B{Validate Input}
    B -->|Valid| C[Process Answers]
    B -->|Invalid| D[Return Error]
    
    C --> E[Calculate Score]
    E --> F[Save Quiz Attempt]
    F --> G[Return Results]
    
    G --> H{Navigate to Results}
    H --> I[Fetch Quiz Attempt]
    I --> J[Display Results]
    
    style A fill:#d4f1f9,stroke:#333
    style B fill:#ffe6cc,stroke:#333
    style C fill:#ffe6cc,stroke:#333
    style D fill:#f8cecc,stroke:#333
    style E fill:#ffe6cc,stroke:#333
    style F fill:#e1d5e7,stroke:#333
    style G fill:#ffe6cc,stroke:#333
    style H fill:#d4f1f9,stroke:#333
    style I fill:#d4f1f9,stroke:#333
    style J fill:#d4f1f9,stroke:#333
```

## Component Hierarchy

```mermaid
graph TD
    App --> Router
    Router --> HomePage
    Router --> ChaptersPage
    Router --> CreateQuizPage
    Router --> QuizPage
    Router --> ResultsPage
    
    CreateQuizPage --> ChapterSelection
    QuizPage --> QuestionDisplay
    QuizPage --> AnswerOptions
    QuizPage --> NavigationControls
    ResultsPage --> ScoreDisplay
    ResultsPage --> QuestionReview
    
    style App fill:#d4f1f9,stroke:#333
    style Router fill:#d4f1f9,stroke:#333
    style HomePage fill:#d4f1f9,stroke:#333
    style ChaptersPage fill:#d4f1f9,stroke:#333
    style CreateQuizPage fill:#d4f1f9,stroke:#333
    style QuizPage fill:#d4f1f9,stroke:#333
    style ResultsPage fill:#d4f1f9,stroke:#333
```

## Data Flow: Quiz Creation to Results

```mermaid
flowchart LR
    A[Admin Creates Quiz] --> B[(Quiz Stored in DB)]
    B --> C[User Takes Quiz]
    C --> D[User Submits Answers]
    D --> E[(Quiz Attempt Stored in DB)]
    E --> F[Results Calculated]
    F --> G[Results Displayed to User]
    
    style A fill:#d4f1f9,stroke:#333
    style B fill:#e1d5e7,stroke:#333
    style C fill:#d4f1f9,stroke:#333
    style D fill:#d4f1f9,stroke:#333
    style E fill:#e1d5e7,stroke:#333
    style F fill:#ffe6cc,stroke:#333
    style G fill:#d4f1f9,stroke:#333
```

## Deployment Architecture

```mermaid
graph TB
    subgraph "Docker Environment"
        FE[Frontend Container]
        BE[Backend Container]
        DB[(MongoDB Container)]
    end
    
    subgraph "External"
        User[User Browser]
    end
    
    User <--> FE
    FE <--> BE
    BE <--> DB
    
    style Docker fill:#f5f5f5,stroke:#333,stroke-width:1px
    style FE fill:#d4f1f9,stroke:#333
    style BE fill:#ffe6cc,stroke:#333
    style DB fill:#e1d5e7,stroke:#333
    style User fill:#d5e8d4,stroke:#333
```

## Error Handling Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Database
    
    User->>Frontend: Perform Action
    Frontend->>Backend: API Request
    
    alt Successful Request
        Backend->>Database: Database Operation
        Database-->>Backend: Operation Result
        Backend-->>Frontend: Success Response
        Frontend-->>User: Success UI
    else Client Error (4xx)
        Backend-->>Frontend: Error Response
        Frontend-->>User: Error Message
    else Server Error (5xx)
        Backend->>Backend: Log Error
        Backend-->>Frontend: Error Response
        Frontend-->>User: Friendly Error UI
    end
``` 