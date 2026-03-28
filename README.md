# Elif

<p align="center">
  <img src="frontend/public/images/logo/logo-full-transparent.png" alt="Elif logo" width="260" />
</p>

<p align="center">
  Modular pet-care platform for community, care operations, and service workflows.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Angular-18.2-DD0031?style=for-the-badge&logo=angular&logoColor=white" alt="Angular" />
  <img src="https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Spring_Boot-3.5-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" alt="Spring Boot" />
  <img src="https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java" />
  <img src="https://img.shields.io/badge/MySQL-8-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" />
  <img src="https://img.shields.io/badge/Maven-Wrapper-C71A36?style=for-the-badge&logo=apachemaven&logoColor=white" alt="Maven Wrapper" />
</p>

## Overview

Elif is a full-stack, modular pet-care platform with dedicated Front Office and Back Office experiences.
It brings together community interaction and operational workflows in a single product:

- community discussions and messaging
- pet profiles and care context
- transit and logistics management
- services, adoption, events, and marketplace modules

## Product Modules

- community
- pets
- transit
- services
- adoption
- events
- marketplace
- users (shared cross-cutting module)

## Tech Stack and Versions

| Layer             | Technology                | Version                                 |
| ----------------- | ------------------------- | --------------------------------------- |
| Frontend          | Angular (`@angular/core`) | `^18.2.0`                               |
| Frontend Tooling  | Angular CLI               | `^18.2.21`                              |
| Frontend Language | TypeScript                | `~5.5.2`                                |
| Frontend Styling  | Tailwind CSS              | `^3.4.19`                               |
| Frontend Reactive | RxJS                      | `~7.8.0`                                |
| Backend           | Spring Boot               | `3.5.11`                                |
| Backend Language  | Java                      | `17`                                    |
| Backend Build     | Maven Wrapper             | Included (`mvnw`, `mvnw.cmd`)           |
| Database          | MySQL                     | Connector runtime (`mysql-connector-j`) |

Version sources:

- `frontend/package.json`
- `backend/pom.xml`

## Architecture at a Glance

### Front Office

User-facing modular routes for visitor and authenticated flows:

- `/app/community`
- `/app/pets`
- `/app/transit`
- `/app/services`
- `/app/adoption`
- `/app/events`
- `/app/marketplace`

### Back Office

Admin and moderation workspace under a shared shell:

- `/admin/community`
- `/admin/users`
- `/admin/pets`
- `/admin/transit`
- `/admin/services`
- `/admin/adoption`
- `/admin/events`
- `/admin/marketplace`

## Repository Structure

```text
Elif/
  backend/
    src/main/java/com/elif/
      controllers/
      dto/
      entities/
      repositories/
      services/
    src/main/resources/
    pom.xml
    community_demo_seed.sql
  frontend/
    src/app/
      auth/
      back-office/
      front-office/
      shared/
    package.json
  design-system/
  README.md
```

## Getting Started

### Prerequisites

- Node.js 20+ and npm
- Java 17
- Maven wrapper support
- MySQL

### Frontend

From the `frontend` folder:

```bash
npm install
npm start
```

Default URL:

- http://localhost:4200

Validation:

```bash
npm run build
```

### Backend

The backend uses local DB settings in `backend/src/main/resources/application.properties`.

From the `backend` folder on Windows:

```bash
mvnw.cmd spring-boot:run
```

Default API base:

- http://localhost:8087/elif

Validation:

```bash
mvnw.cmd -DskipTests compile
mvnw.cmd test
```

## Demo Seed Data

Seed file:

- `backend/community_demo_seed.sql`

Example import:

```bash
mysql -u root Elif < backend/community_demo_seed.sql
```

Demo accounts:

- admin1@elif.com / password
- admin2@elif.com / password
- vet1@elif.com / password
- provider1@elif.com / password
- user1@elif.com / password
- user2@elif.com / password
- user3@elif.com / password
- user4@elif.com / password
- user5@elif.com / password
- user6@elif.com / password

Seed includes:

- users
- communities
- community memberships
- flairs and rules
- posts
- comments and replies
- conversations and messages

## Team Workflow

Recommended ownership model:

- one developer per feature module
- users module shared across all modules
- front-office and back-office work separated by feature folder
- shared UI and utilities under `shared`

This keeps development parallel and reduces merge conflicts.
