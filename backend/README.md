# Event Management Platform - Backend

## Overview
This folder contains the **ASP.NET Core Web API** backend for the Event Management Platform.  
It provides REST endpoints consumed by the Angular frontend.

## Prerequisites
- .NET 8 SDK
- Visual Studio Code (or another IDE)
- Git

## Setup

1. Restore dependencies:
```bash
dotnet restore
Run the API:

bash
Copy code
dotnet run
API is available at:

bash
Copy code
http://localhost:5000/swagger
Project Structure
graphql
Copy code
backend/
├── MyApp.Api/             # Main Web API project
├── MyApp.Application/     # Application logic
├── MyApp.Domain/          # Domain models
├── MyApp.Infrastructure/  # Database & infrastructure
└── MyApp.sln              # Solution file
Database
Configure database connection in appsettings.json

Use Entity Framework Core CLI to apply migrations:

bash
Copy code
dotnet ef database update
Scripts
Command	Description
dotnet run	Run API locally
dotnet test	Run unit tests
dotnet build	Build project

Contributing
Follow Git workflow from root README

yaml
Copy code

---

✅ These READMEs give **clear separation** between frontend, backend, and overall project.  

---

If you want, I can **also generate a “template README.md” that auto-links frontend/backend README from root**, so anyone opening the repo can immediately navigate to both — **very professional for GitHub collaboration**.  

Do you want me to do that?