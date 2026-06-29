# Contributing to StockSim

Thank you for considering contributing to StockSim! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Adding Features](#adding-features)

## Code of Conduct

By participating in this project, you agree to maintain a welcoming, inclusive, and harassment-free environment for everyone.

## Getting Started

### 1. Fork & Clone

```bash
# Fork the repo on GitHub, then:
git clone https://github.com/YOUR_USERNAME/stock-trading-simulator.git
cd stock-trading-simulator
git remote add upstream https://github.com/ORIGINAL_OWNER/stock-trading-simulator.git
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env.local
# Edit .env files with your local MongoDB/Redis config
```

### 4. Start Development

```bash
# With Docker (easiest)
docker-compose up -d mongodb redis
npm run dev

# Or with local MongoDB/Redis
npm run dev
```

## Development Workflow

1. Create a branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following [Coding Standards](#coding-standards)

3. Test your changes:
   ```bash
   npm run lint
   npm run test
   ```

4. Commit with descriptive messages:
   ```bash
   git commit -m "feat: add Fibonacci retracement indicator"
   ```

5. Push and create a Pull Request

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation only
- `style:` — Code style (formatting, semicolons, etc.)
- `refactor:` — Code refactoring (no feature/bug change)
- `perf:` — Performance improvement
- `test:` — Adding or updating tests
- `chore:` — Build process, tooling, dependencies

## Pull Request Process

1. Update README.md if you've added features
2. Ensure no linting errors or test failures
3. Provide a clear description of changes
4. Reference any related issues
5. Request review from maintainers

## Coding Standards

### TypeScript

- Use strict TypeScript (no `any` unless absolutely necessary)
- Define interfaces for all data structures
- Use enums for fixed value sets
- Export types from `shared/types/`

### Backend

- Follow RESTful conventions
- Validate all inputs with express-validator
- Handle errors with the ApiError class
- Add proper logging for debugging
- Rate limit new endpoints appropriately

### Frontend

- Use the existing glassmorphism UI components
- Follow the component structure (ui/, layout/, feature/)
- Use Zustand for global state
- Use the API client from `lib/api.ts`
- Add proper loading and error states

### Security

- Never trust user input
- Always validate and sanitize
- Use parameterized queries (Mongoose handles this)
- Never expose internal errors in responses
- Add rate limiting to new endpoints

## Adding Features

### Adding a New Technical Indicator

1. Add calculation to `shared/utils/index.ts`
2. Add to prediction engine in `server/src/ai/predictionEngine.ts`
3. Update `ITechnicalIndicators` type in `shared/types/index.ts`
4. Display in frontend predictions page

### Adding a New Stock Data Source

1. Create a new service in `server/src/services/`
2. Add API key to environment config
3. Implement data fetching with error handling
4. Add caching layer for rate limit compliance
5. Update stock initialization logic

### Adding a Trading Algorithm

1. Create algorithm in `server/src/services/algorithms/`
2. Define configuration interface
3. Add backtesting support
4. Create frontend configuration UI
5. Document strategy logic in code comments

## Questions?

Open an issue with the `question` label, or start a discussion thread.

Thank you for contributing!
