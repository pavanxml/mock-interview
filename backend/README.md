# InterviewHub Spring Boot Backend

This backend scaffold is designed for the existing Next.js frontend in the repository. It exposes role-based API contracts for Student, Interviewer, and Admin workflows and ships with a PostgreSQL Flyway migration.

## Run locally

1. Create PostgreSQL database and user:

```sql
CREATE USER interviewhub WITH PASSWORD 'interviewhub';
CREATE DATABASE interviewhub OWNER interviewhub;
```

2. Start the API:

```bash
cd backend
mvn spring-boot:run
```

3. Open API docs:

```text
http://localhost:8080/swagger-ui/index.html
```

## Environment

```text
PORT=8080
DATABASE_URL=jdbc:postgresql://localhost:5432/interviewhub
DATABASE_USERNAME=interviewhub
DATABASE_PASSWORD=interviewhub
FRONTEND_ORIGIN=http://localhost:4028
PAYMENT_PROVIDER=razorpay
RESUME_BUCKET=interviewhub-resumes
```

## Implement next

The controllers currently define stable request/response contracts and demo responses. The next backend step is to add JPA entities/repositories against `V1__init.sql`, JWT auth, payment provider verification webhooks, and object storage for resume/profile document uploads.