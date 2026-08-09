# InterviewHub Mock Interview Marketplace

InterviewHub is a role-based mock interview marketplace for Students, verified Interviewers, and Admins.

## What is included

- Next.js 15 + React 19 frontend with Student, Interviewer, and Admin flows.
- Student auth screens, resume upload UI, dashboard, booking wizard, payments, scheduling, feedback, and history screens.
- Interviewer application, availability, session, feedback, and withdrawal dashboard surfaces.
- Admin dashboard for metrics, interviewer approvals, revenue, booking analytics, activity, and withdrawals.
- Spring Boot backend scaffold in `backend/` with REST API contracts for all core workflows.
- PostgreSQL schema and Flyway migration in `backend/src/main/resources/db/migration/V1__init.sql`.
- API documentation in `docs/api-contracts.md` and database notes in `docs/postgres-schema.md`.

## Frontend setup

```bash
npm install
npm run dev
```

Open `http://localhost:4028`.

Useful checks:

```bash
npm run type-check
npm run build
```

## Backend setup

Create a local PostgreSQL database:

```sql
CREATE USER interviewhub WITH PASSWORD 'interviewhub';
CREATE DATABASE interviewhub OWNER interviewhub;
```

Run the Spring Boot API:

```bash
cd backend
mvn spring-boot:run
```

API docs will be available at `http://localhost:8080/swagger-ui/index.html`.

## Environment

Frontend:

```text
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
```

Backend:

```text
DATABASE_URL=jdbc:postgresql://localhost:5432/interviewhub
DATABASE_USERNAME=interviewhub
DATABASE_PASSWORD=interviewhub
FRONTEND_ORIGIN=http://localhost:4028
```

## Current backend status

The backend is a compile-ready Spring Boot scaffold with controller contracts and a real PostgreSQL schema. The next implementation step is replacing demo controller responses with JPA services, JWT authentication, payment webhook verification, and object storage for uploaded resumes/documents.
<!-- Deploy trigger: remove third-party rocket-web script -->
