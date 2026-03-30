# Elif

Elif is a modular pet-care platform built as a university team project. It combines a public and logged-in front office for end users with a modular back office for administration and feature operations.

## Overview

The project is organized around feature modules so multiple developers can work in parallel with minimal conflicts.

Current product areas:
- `community`
- `pets`
- `transit`
- `services`
- `adoption`
- `events`
- `marketplace`
- `users` as a shared cross-cutting module

The frontend now follows this pattern in both portals:
- front office: `front-office/<module-name>`
- back office: `back-office/<module-name>`

## Stack

- Frontend: Angular 18, TypeScript, Tailwind CSS
- Backend: Spring Boot 3, Java 17, Spring Data JPA
- Database: MySQL

## Current Architecture

### Front Office

User-facing routes are modular and support both visitor and signed-in flows.

Examples:
- `/app/services`
- `/app/adoption`
- `/app/events`
- `/app/marketplace`
- `/app/transit`
- `/app/pets`
- `/app/community`

Access pattern:
- visitors can browse discovery-oriented modules
- signed-in users can perform personal actions like managing pets, posting, messaging, or future booking flows

### Back Office

Administrative routes are also modular and mounted under the shared back-office shell.

Examples:
- `/admin/users`
- `/admin/community`
- `/admin/pets`
- `/admin/transit`
- `/admin/services`
- `/admin/adoption`
- `/admin/events`
- `/admin/marketplace`

This lets each teammate own one feature area without growing one large monolithic admin page.

## Repository Structure

```text
Elif/
├── backend/
│   ├── src/main/java/com/elif/
│   │   ├── controllers/
│   │   ├── dto/
│   │   ├── entities/
│   │   ├── repositories/
│   │   └── services/
│   ├── src/main/resources/
│   ├── pom.xml
│   └── community_demo_seed.sql
├── frontend/
│   ├── src/app/
│   │   ├── auth/
│   │   ├── back-office/
│   │   │   ├── community/
│   │   │   ├── users/
│   │   │   ├── pets/
│   │   │   ├── transit/
│   │   │   ├── service-management/
│   │   │   ├── adoption/
│   │   │   ├── events/
│   │   │   └── marketplace/
│   │   ├── front-office/
│   │   │   ├── community/
│   │   │   ├── dashboard/
│   │   │   ├── pet-profiles/
│   │   │   ├── pet-transit/
│   │   │   ├── services/
│   │   │   ├── adoption/
│   │   │   ├── events/
│   │   │   └── marketplace/
│   │   └── shared/
│   ├── package.json
│   └── README.md
└── README.md
```

## Getting Started

### Prerequisites

- Node.js
- npm
- Java 17
- Maven wrapper support
- MySQL

### Frontend

```bash
cd frontend
npm install
npm start
```

Frontend app:
- `http://localhost:4200`

### Backend

The backend uses the default local MySQL configuration in `backend/src/main/resources/application.properties`.

```bash
cd backend
sh mvnw spring-boot:run
```

Backend API base:
- `http://localhost:8087/elif`

## Demo Seed Data

A reusable SQL seed file is included for testing the community and shared user flows:

- [community_demo_seed.sql](/Users/malek/Documents/GitHub/Elif/backend/community_demo_seed.sql)

Import it with:

```bash
mysql -u root Elif < backend/community_demo_seed.sql
```

Demo accounts:
- `admin1@elif.com` / `password`
- `admin2@elif.com` / `password`
- `vet1@elif.com` / `password`
- `provider1@elif.com` / `password`
- `user1@elif.com` / `password`
- `user2@elif.com` / `password`
- `user3@elif.com` / `password`
- `user4@elif.com` / `password`
- `user5@elif.com` / `password`
- `user6@elif.com` / `password`

The seed includes:
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
- shared `users` support across all modules
- front-office and back-office work stay separated by feature folder
- shared UI lives under `shared`

This keeps the project modular and reduces merge conflicts.

## Notes

- The community module currently has the most complete end-to-end flow.
- The back office is intentionally scaffolded but still incomplete for several modules.
- The route structure is prepared so teammates can build independently without restructuring the app again.
