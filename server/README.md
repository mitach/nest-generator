# NestJS Project Generator API

A RESTful API service that generates NestJS projects based on selected features.

## Features

- RESTful endpoints for project generation
- Feature selection via request body
- Project configuration via request body
- Asynchronous project generation
- Project download as zip
- Generation status tracking
- Support for multiple features:
  - Database integration (TypeORM)
  - Authentication (JWT)
  - User management
  - And more...

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/nestjs-generator-api.git

# Install dependencies
npm install

# Start the development server
npm run start:dev
```

## API Endpoints

### Generate Project

```http
POST /api/generate
```

Request body:
```json
{
  "projectName": "my-project",
  "features": ["database", "auth", "users"],
  "config": {
    "database": {
      "type": "postgres",
      "host": "localhost",
      "port": 5432,
      "database": "my_project",
      "username": "postgres",
      "password": "postgres"
    },
    "auth": {
      "jwtSecret": "your-secret-key",
      "jwtExpiration": "1h"
    }
  }
}
```

Response:
```json
{
  "generationId": "uuid",
  "status": "pending"
}
```

### Get Generation Status

```http
GET /api/generate/:id/status
```

Response:
```json
{
  "status": "completed",
  "downloadUrl": "/api/generate/:id/download"
}
```

### Download Generated Project

```http
GET /api/generate/:id/download
```

Response: Zip file of generated project

## Available Features

### Database

- TypeORM integration
- Database configuration
- Entity generation
- Repository pattern

### Authentication

- JWT authentication
- Passport integration
- Protected routes
- Token management

### Users

- User entity
- CRUD operations
- Password hashing
- User management

## Development

### Project Structure

```
generator-api/
├── src/
│   ├── generator/
│   │   ├── features/
│   │   │   ├── swagger.feature.ts
│   │   │   ├── auth.feature.ts
│   │   │   └── ...
│   │   ├── interfaces/
│   │   ├── utils/
│   │   └── generator.service.ts
│   ├── api/
│   │   ├── controllers/
│   │   │   └── generator.controller.ts
│   │   ├── dto/
│   │   │   ├── generate-project.dto.ts
│   │   │   └── ...
│   │   └── services/
│   │       └── generation.service.ts
│   └── main.ts
├── templates/
│   ├── features/
│   │   ├── users/
│   │   ├── auth/
│   │   └── ...
│   └── main.ts.template
└── package.json
```

### Adding New Features

1. Create a new feature template in `templates/features/`
2. Implement the feature's module, service, and controller
3. Add feature configuration to `GenerateProjectDto`
4. Update the generation service to handle the new feature

## Testing

```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Run test coverage
npm run test:cov
```

## License

MIT
