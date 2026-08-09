# InterviewHub API Contracts

Base URL: `http://localhost:8080/api/v1`

## Authentication

`POST /auth/student/register`
Creates a student profile. Body includes full name, email, phone, college, graduation year, password, and uploaded resume document id.

`POST /auth/interviewer/register`
Creates a pending interviewer application with company details, LinkedIn URL, expertise, availability, payout details, and verification documents.

`POST /auth/login`
Logs in Student, Interviewer, or Admin. Body: `{ "email": "...", "password": "...", "role": "STUDENT" }`.

## Marketplace

`GET /marketplace/technologies`
Returns active interview technologies.

`GET /marketplace/interviewers?technology=react`
Returns verified interviewer cards for discovery and booking.

`GET /marketplace/availability?interviewerId={uuid}&date=2026-07-20`
Returns available slots for one interviewer on one date.

## Bookings and payments

`POST /bookings`
Reserves a booking slot with status `PAYMENT_PENDING`.

`GET /bookings/student/{studentId}`
Returns upcoming and historical student bookings.

`POST /bookings/{bookingId}/payments`
Creates a payment order/intent with the configured payment provider.

## Interviewer portal

`GET /interviewer/{interviewerId}/bookings`
Lists interviewer sessions.

`PUT /interviewer/{interviewerId}/availability`
Updates accepting-bookings state and time slots.

`POST /interviewer/bookings/{bookingId}/feedback`
Publishes structured feedback to the student dashboard.

`POST /interviewer/{interviewerId}/withdrawals`
Queues a withdrawal request for admin review.

## Admin portal

`GET /admin/metrics`
Returns platform KPIs for the admin dashboard.

`GET /admin/interviewers/pending`
Lists interviewer applications awaiting verification.

`POST /admin/interviewers/{interviewerId}/approve`
Approves a verified interviewer.

`POST /admin/interviewers/{interviewerId}/reject`
Rejects an interviewer with admin note.

`GET /admin/withdrawals/pending`
Lists pending withdrawal requests.

`POST /admin/withdrawals/{withdrawalId}/mark-paid`
Marks withdrawal as paid after payout completion.