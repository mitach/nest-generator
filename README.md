# 🚀 NestJS Project Builder

A powerful visual tool for generating production-ready NestJS applications with customizable architecture patterns and
integrated features.

## ✨ Features

### 🎨 Visual Project Builder

- **Drag & Drop Interface**: Intuitive feature selection
- **Architecture Choice**: Monolith or Microservice patterns
- **Real-time Preview**: See your configuration as you build
- **Feature Configuration**: Advanced settings for each component

### 🏗️ Architecture Support

- **Monolithic Applications**: All-in-one scalable applications
- **Microservice Architecture**: Distributed service patterns
- **API Gateway**: Centralized request routing and management
- **Service Communication**: Built-in inter-service communication

### 🔧 Built-in Features

- **Authentication**: JWT, OAuth2, Social login (Google, GitHub, etc.)
- **User Management**: Complete CRUD operations with role-based access
- **Database Integration**: MongoDB, PostgreSQL, MySQL support
- **Security**: Helmet, CORS, Rate limiting, Input validation
- **API Documentation**: Auto-generated Swagger/OpenAPI specs
- **File Storage**: S3, local storage with image processing

## 🚀 Quick Start

### Installation

```bash
# Clone the repository

cd nestjs-project-builder

# Run setup script (handles all dependencies and configuration)
./setup.sh

# Start development servers
npm run dev
```

The application will be available at:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

### Using the Generator

1. **Choose Architecture**: Select between monolith or microservice
2. **Select Features**: Drag and drop desired features from the sidebar
3. **Configure Services**: Set up database connections, authentication, etc.
4. **Review Configuration**: Check the generated configuration
5. **Generate & Download**: Get your complete NestJS project

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev              # Start both client and server
npm run dev:client       # Start only Next.js frontend
npm run dev:server       # Start only NestJS backend

# Code Quality
npm run lint             # Run ESLint checks
npm run lint:fix         # Auto-fix linting and formatting issues
npm run format           # Format code with Prettier
npm run type-check       # TypeScript type checking

# Testing
npm run test             # Run test suite
npm run test:quick       # Run quick tests (changed files only)
npm run test:watch       # Run tests in watch mode

# Build
npm run build            # Build for production
npm run build:client     # Build frontend only
npm run build:server     # Build backend only
```

### Project Structure

```
├── client/                 # Next.js frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   │   └── VisualProjectEditor/  # Main editor components
│   │   ├── app/           # Next.js app router pages
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities and types
│   │   └── services/      # API communication
│   └── package.json
├── server/                 # NestJS backend application
│   ├── src/               # Source code
│   │   ├── generator/     # Project generation logic
│   │   │   ├── services/  # Generation services
│   │   │   ├── strategies/ # Architecture strategies
│   │   │   └── types/     # TypeScript definitions
│   │   └── features/      # Feature management API
│   ├── templates/         # Project templates
│   │   ├── monolith/      # Monolithic architecture templates
│   │   ├── microservice/  # Microservice architecture templates
│   │   └── shared/        # Shared feature templates
│   └── package.json
├── .husky/                # Git hooks configuration
├── docs/                  # Documentation
└── package.json          # Root workspace configuration
```

## 🏗️ Architecture

### Frontend (Next.js)

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with custom animations
- **State Management**: Zustand for global state
- **UI Components**: Custom components with Lucide icons
- **TypeScript**: Full type safety throughout

### Backend (NestJS)

- **Framework**: NestJS with Express
- **Architecture**: Modular monolith with microservice generation
- **Template Engine**: Custom processor with configuration markers
- **File Generation**: Dynamic project scaffolding
- **Strategy Pattern**: Pluggable architecture generation

## 📡 API Reference

### Generate Project

```http
POST /api/generate
```

**Request Body:**

```json
{
  "projectName": "my-project",
  "architecture": "monolith",
  "features": ["database:mongodb", "auth:jwt", "users"],
  "config": {
    "database": {
      "type": "mongodb",
      "connectionString": "mongodb://localhost:27017/myapp"
    },
    "auth": {
      "jwtSecret": "your-secret-key",
      "jwtExpiration": "1h"
    }
  }
}
```

**Response:**

```json
{
  "generationId": "uuid",
  "status": "pending"
}
```

### Check Generation Status

```http
GET /api/generate/:id/status
```

**Response:**

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

**Response:** Zip file containing the generated NestJS project

## 🛠️ Customization

### Adding New Features

Create new feature templates in `server/templates/`:

```bash
server/templates/shared/your-feature/
├── feature.config.json    # Feature configuration
├── files/                # Template files to copy
├── partials/             # Code snippets for injection
└── processors/           # Custom configuration processors
```

**Example feature.config.json:**

```json
{
  "dependencies": {
    "your-package": "^1.0.0"
  },
  "requires": ["database"],
  "copyFiles": [
    {
      "source": "service.ts",
      "target": "src/your-feature/service.ts"
    }
  ],
  "partialFiles": {
    "app.module.ts": {
      "target": "src/app.module.ts",
      "source": "partials/app.module.partial",
      "placeholders": ["IMPORTS", "MODULES"]
    }
  }
}
```

## 📦 Dependency Management

Centralized dependency management ensures consistency across all generated projects. All package versions are managed in `server/templates/dependency-registry.json`.

### Configuration Options

#### Dependency Presets (Ready-to-use combinations)

```json
{
  "dependencyPresets": ["basic-auth", "mongodb-setup"]
}
```

**Available:** `basic-auth`, `google-auth`, `mongodb-setup`, `postgres-setup`, `validation-setup`, `docs-setup`, `security-setup`, `performance-setup`

#### Dependency Groups (Full categories)

```json
{
  "dependencyGroups": ["auth", "database"]
}
```

**Available:** `nestjs`, `auth`, `database`, `validation`, `docs`, `security`, `performance`

#### Custom Dependencies

```json
{
  "dependencyPresets": ["basic-auth"],
  "customDependencies": {
    "special-package": "^1.0.0"
  }
}
```

### Adding New Presets

1. **Add to registry** (`server/templates/dependency-registry.json`):

```json
{
  "presets": {
    "redis-cache": {
      "includes": ["database.redis", "performance.ioredis"]
    }
  }
}
```

2. **Update schema** (`server/templates/dependency-registry.schema.json`):

```json
{
  "dependencyPresets": {
    "enum": ["basic-auth", "redis-cache"]
  }
}
```

3. **Use in features**:

```json
{
  "dependencyPresets": ["redis-cache"]
}
```

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm run start
```

### Code Style

This project uses:

- **ESLint** for code linting
- **Prettier** for code formatting
- **Conventional Commits** for commit messages
- **Husky** for git hooks
- **lint-staged** for pre-commit checks

All checks run automatically on commit and push.

## 🐛 Troubleshooting

### Common Issues

**"Generation fails with TypeScript errors"**

```bash
npm run type-check
npm run lint:fix
```

**"Templates not found"**

```bash
npm run validate
```

**"Hooks not working"**

```bash
./setup.sh
```

**"ESLint configuration errors"**

```bash
# Remove old configs
rm client/eslint.config.mjs server/eslint.config.mjs
# Use the unified root config
npm run lint:fix
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
