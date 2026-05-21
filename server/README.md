# Questify Backend API

Backend API for Questify - Interactive Educational Test Constructor Platform

Built with FastAPI, SQLAlchemy, and DDD Clean Architecture

## Architecture

### Domain Layer (`domain/`)
- **Entities**: Test, Question, Attempt, UserAnswer, AnswerOption
- **Value Objects**: TestId, QuestionId, UserId, AttemptId, Score, AnswerPayload
- **Enums**: TestStatus, QuestionType, AttemptStatus
- **Services**: TestPublishService, AnswerEvaluationService, ScoreCalculationService

### Application Layer (`app/`)
- **Use Cases**: CreateTest, PublishTest, AddQuestion, StartAttempt, SubmitAnswer, CompleteAttempt, etc.
- **Interfaces**: Repositories, Unit of Work, Auth Client

### Infrastructure Layer (`infra/`)
- **Persistence**: SQLAlchemy ORM models, Repositories, Mappers, Unit of Work
- **Web**: FastAPI routes, schemas, auth middleware
- **Auth Client**: External auth service integration

## Setup

### Prerequisites
- Python 3.12+
- PostgreSQL 15+ (for production) or SQLite (for development)
- Virtual environment

### Installation

1. **Create virtual environment** (if not already done):
```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

2. **Install dependencies**:
```bash
pip install -r requirements.txt
```

3. **Create `.env` file** in the server directory:
```env
DEBUG=true
AUTH_URL=http://localhost:3003/auth/
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_DB=questify
DATABASE_URL=sqlite:///./questify.db  # For development
```

For production PostgreSQL:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/questify
```

### Database Setup

#### Development (SQLite)
Database will be created automatically on first run.

#### Production (PostgreSQL)

1. **Run migrations**:
```bash
alembic upgrade head
```

2. **Create initial migration** (if needed):
```bash
alembic revision --autogenerate -m "Migration description"
```

### Running the Application

#### Development
```bash
python -m uvicorn --app-dir src main:app --reload --host 0.0.0.0 --port 3002
```

#### Production
```bash
uvicorn --app-dir src main:app --host 0.0.0.0 --port 3002 --workers 4
```

### Docker Deployment

1. **Build and run**:
```bash
docker-compose build
docker-compose up
```

Environment variables can be set in `.env` or passed to `docker-compose`:
```bash
DATABASE_USER=postgres DATABASE_PASSWORD=secure_password docker-compose up
```

## API Endpoints

### Tests
- `POST /tests/create` - Create a new test
- `POST /tests/{test_id}/publish` - Publish a test
- `DELETE /tests/{test_id}` - Delete a test
- `GET /tests/creator/my-tests` - Get creator's tests
- `GET /tests/published` - Get published tests
- `GET /tests/{test_id}` - Get test details

### Questions
- `POST /tests/{test_id}/questions` - Add question to test
- `PUT /tests/{test_id}/questions/{question_id}` - Update question
- `DELETE /tests/{test_id}/questions/{question_id}` - Delete question

### Attempts
- `POST /attempts/start/{test_id}` - Start test attempt
- `POST /attempts/{attempt_id}/questions/{question_id}/answer` - Submit answer
- `POST /attempts/{attempt_id}/complete` - Complete attempt
- `GET /attempts/history` - Get attempt history
- `GET /api/attempts/{attempt_id}` - Get attempt details

### Health
- `GET /health` - Health check

## Authentication

All endpoints except `/health` require Bearer token authentication. Token is verified with the external auth service specified by `AUTH_URL`.

Request header:
```
Authorization: Bearer <token>
```

## Database Schema

### Tables
- `tests` - Test records
- `questions` - Questions in tests
- `answer_options` - Answer options for questions
- `attempts` - User attempts on tests
- `user_answers` - Individual answers submitted by users

See `alembic/versions/001_initial.py` for the complete schema.

## Development

### Running Tests
```bash
pytest
```

### Code Format
```bash
black src/
```

### Linting
```bash
pylint src/
```

## Database Migration

### Creating Migrations
```bash
alembic revision --autogenerate -m "Description of changes"
```

### Applying Migrations
```bash
alembic upgrade head
```

### Downgrading
```bash
alembic downgrade -1
```

## Project Structure
```
server/
├── alembic/
│   ├── versions/
│   ├── env.py
│   └── alembic.ini
├── src/
│   ├── domain/
│   │   ├── entities/
│   │   ├── services.py
│   │   └── values.py
│   ├── app/
│   │   ├── interfaces/
│   │   └── use_cases/
│   ├── infra/
│   │   ├── persist/
│   │   └── web/
│   │       ├── api/
│   │       └── schemas/
│   ├── core/
│   │   └── config.py
│   └── main.py
├── requirements.txt
├── .env
├── Dockerfile
└── docker-compose.yml
```

## Deployment Checklist

- [ ] Install dependencies: `pip install -r requirements.txt`
- [ ] Create `.env` file with production database credentials
- [ ] Run database migrations: `alembic upgrade head`
- [ ] Test API locally: `python -m uvicorn --app-dir src main:app --reload`
- [ ] Build Docker image: `docker build -t questify-api .`
- [ ] Push to container registry
- [ ] Deploy with docker-compose or Kubernetes
- [ ] Verify all endpoints are working
- [ ] Set up monitoring and logging

## API Documentation

Once running, visit:
- Swagger UI: `http://localhost:3002/docs`
- ReDoc: `http://localhost:3002/redoc`

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| DEBUG | false | Enable debug mode |
| AUTH_URL | http://localhost:3003/auth/ | Auth service URL |
| DATABASE_USER | postgres | Database user |
| DATABASE_PASSWORD | postgres | Database password |
| DATABASE_DB | questify | Database name |
| DATABASE_URL | sqlite:///./questify.db | Full database URL (overrides individual vars) |
| DATABASE_POOL_SIZE | 5 | Connection pool size (PostgreSQL only) |
| DATABASE_POOL_TIMEOUT | 30 | Connection pool timeout (PostgreSQL only) |

## License

MIT
