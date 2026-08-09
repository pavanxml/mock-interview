# PostgreSQL Data Model

The canonical schema is `backend/src/main/resources/db/migration/V1__init.sql`.

Core tables:

- `users`: shared identity table for Student, Interviewer, and Admin roles.
- `student_profiles`: student academic info and resume/profile document references.
- `interviewer_profiles`: company verification, approval status, rating, and base pricing.
- `documents`: uploaded resumes, profile photos, company IDs, and experience proofs.
- `technologies`: interview categories shown in the booking flow.
- `interviewer_expertise`: many-to-many interviewer skills.
- `interviewer_availability`: weekly recurring availability windows.
- `bookings`: paid mock interview reservations and scheduling state.
- `payments`: payment provider order/payment IDs and refund state.
- `feedback_reports`: structured feedback scores, strengths, improvements, and hiring readiness.
- `withdrawal_requests`: interviewer payout workflow managed by admins.
- `notifications`: in-app alerts.
- `audit_logs`: admin moderation and sensitive workflow tracking.