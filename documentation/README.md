# Event Management Platform

A scalable web-based Event Management Platform built with Angular, Nx, and Clean Architecture.
The system supports event creation, user authentication, task coordination, and role-based access.

## Features

- User authentication and authorization
- Event creation and management
- Task assignment and tracking
- Role-based access control
- Scalable clean architecture design

## Tech Stack

- Frontend: Angular (Standalone APIs)
- Architecture: Clean Architecture
- Monorepo: Nx
- Styling: SCSS
- Backend: REST / Firebase (pluggable)
- Tooling: ESLint, Prettier, Docker
## Architecture Overview

This project follows Clean Architecture principles:

- Presentation Layer: UI, pages, components
- Application Layer: Use cases (business actions)
- Domain Layer: Core business rules and entities
- Infrastructure Layer: API, Firebase, external services

Dependency Rule:
Presentation → Application → Domain
Infrastructure depends on Domain interfaces


## Project Structure
src/
 ├── app/
 │   ├── core/
 │   │   ├── interceptors/
 │   │   ├── guards/
 │   │   └── config/
 │   │
 │   ├── domain/
 │   │   ├── entities/
 │   │   ├── value-objects/
 │   │   ├── repositories/
 │   │   └── errors/
 │   │
 │   ├── application/        ← (rename use-cases)
 │   │   ├── auth/
 │   │   ├── tasks/
 │   │   └── users/
 │   │
 │   ├── infrastructure/
 │   │   ├── api/
 │   │   ├── firebase/
 │   │   └── repositories/
 │   │
 │   ├── presentation/
 │   │   ├── pages/
 │   │   ├── components/
 │   │   ├── layouts/
 │   │   └── routes/
 │   │
 │   ├── shared/
 │   │   ├── ui/
 │   │   ├── pipes/
 │   │   └── utils/
 │   │
 │   └── app.routes.ts
 │
 ├── assets/
 ├── environments/
 └── main.ts


 ## Documentation

Detailed documentation is available in the `documentation/` folder:

- Architecture design
- API contracts
- Development guidelines
- Workflows and decisions

