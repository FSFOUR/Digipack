# DIGI PACK ERP Security Specification

## 1. Data Invariants
- Admin user `shafi3396@gmail.com` is granted administrative access.
- Registered users can read and write to collections if authenticated with verified email or during active session.
- Strict validation rules ensure documents must meet structure limits.
- Sensitive role changes are restricted to administrators.

## 2. Dirty Dozen Payload Verifications
- Unauthorized role escalation attempts.
- Negative quantity injections in stock items.
- Duplicate ID collisions and unescaped path variables.
- Blank customer quotation submissions.

## 3. Fortress Rule Architecture
Rules will enforce authentication, data integrity, and role permissions.
