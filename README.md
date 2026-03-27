# Elif

Elif is a modular pet-care platform built as a university team project.
It includes a front office for end users and a back office for administration and moderation workflows.


## Product Modules

Current feature areas:

- community
- pets
- transit
- services
- adoption
- events
- marketplace
- users as a shared cross-cutting module

Frontend module layout:

- front office modules under front-office
- back office modules under back-office

## Technology Stack

- Frontend: Angular 18, TypeScript, Tailwind CSS
- Backend: Spring Boot 3, Java 17, Spring Data JPA
- Database: MySQL

## Architecture Overview

### Front Office

User-facing routes are modular and support visitor plus authenticated flows.

Core examples:

- /app/community
- /app/pets
- /app/transit
- /app/services
- /app/adoption
- /app/events
- /app/marketplace

### Back Office

Administrative routes are modular and mounted under a shared back-office shell.

Core examples:

- /admin/community
- /admin/users
- /admin/pets
- /admin/transit
- /admin/services
- /admin/adoption
- /admin/events
- /admin/marketplace


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
				community/
				users/
				pets/
				transit/
				service-management/
				adoption/
				events/
				marketplace/
			front-office/
				community/
					components/
					models/
					services/
				dashboard/
				pet-profiles/
				pet-transit/
				services/
				adoption/
				events/
				marketplace/
			shared/
		package.json
		README.md
	README.md
```

## Getting Started

### Prerequisites

- Node.js and npm
- Java 17
- Maven wrapper support
- MySQL

### Frontend

From the frontend folder:

```bash
npm install
npm start
```

Default URL:

- http://localhost:4200

Optional validation:

```bash
npm run build
```

### Backend

The backend uses local DB settings in:

- backend/src/main/resources/application.properties

From the backend folder on Windows:

```bash
mvnw.cmd spring-boot:run
```

Default API base:

- http://localhost:8087/elif

Optional validation:

```bash
mvnw.cmd -DskipTests compile
mvnw.cmd test
```

## Demo Seed Data

Seed file:

- backend/community_demo_seed.sql

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
- users module shared across all modules
- front-office and back-office work separated by feature folder
- shared UI lives under shared

This keeps development parallel and reduces merge conflicts.

