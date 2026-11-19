# TOP STORE Firestore Security Specification

## 1. Data Invariants
1. **Workspace Ownership & Isolation**: Every store record (`campaigns`, `metrics`, `content`, `leads`, `customers`, `orders`, `expenses`, `planItems`, `auditLogs`) belongs to a parent `workspaces/{workspaceId}` document and carries `ownerUid == workspaceId == request.auth.uid`.
2. **Verified Identity Enforcement**: Only authenticated users with `request.auth.token.email_verified == true` may read or write store data.
3. **PII Isolation**: `leads` and `customers` contain phone numbers and customer names; `userProfiles` omits PII (`email`, `phone`). Only the workspace owner (or verified bootstrapped admin) may read or list them.
4. **Temporal & Identity Immutability**: `id`, `ownerUid`, `workspaceId`, and `createdAt` (`request.time`) are immutable after creation; every write enforces `updatedAt == request.time`.
5. **Action-Based Updates & Terminal State Locking**: Updates must begin with `isValid[Entity](incoming())`, restrict mutable keys via `affectedKeys().hasOnly([...])`, and protect terminal order/lead states (`delivered`, `returned`, `won`) unless overridden by the workspace owner/admin.
6. **Audit Log Immutability**: Audit logs (`auditLogs`) are append-only (`create` allowed for verified workspace owner; `update` and `delete` strictly denied).

## 2. The "Dirty Dozen" Payloads (Adversarial Tests)
1. **Unauthenticated Read/Write**: Unauthenticated client tries to read `/workspaces/u1/campaigns/c1`. -> `PERMISSION_DENIED`.
2. **Unverified Email Spoof**: Signed-in user with `email: "malkamynaldyny@gmail.com"` and `email_verified: false` attempts admin read/write. -> `PERMISSION_DENIED`.
3. **Cross-Tenant PII Leak (`get`)**: User `u2` tries to `get` `/workspaces/u1/leads/lead-1`. -> `PERMISSION_DENIED`.
4. **Cross-Tenant Scraping (`list`)**: User `u2` tries to `list` `/workspaces/u1/customers` without matching `ownerUid`. -> `PERMISSION_DENIED`.
5. **ID Poisoning**: User `u1` tries to `create` a campaign with ID `../evil_id$123` or >128 chars. -> `PERMISSION_DENIED`.
6. **Shadow / Ghost Field Injection**: User `u1` tries to `create` a campaign with an extra undocumented field `isAdmin: true`. -> `PERMISSION_DENIED`.
7. **Owner UID Spoofing**: User `u1` tries to `create` a campaign under `/workspaces/u1/campaigns/c1` with `ownerUid: "u2"`. -> `PERMISSION_DENIED`.
8. **Orphaned Subcollection Write**: User `u1` tries to `create` `/workspaces/nonexistent/campaigns/c1` when parent workspace does not exist. -> `PERMISSION_DENIED`.
9. **Client Timestamp Forgery**: User `u1` sends a custom backdated `createdAt` timestamp instead of `request.time`. -> `PERMISSION_DENIED`.
10. **Immutable Field Tampering**: User `u1` attempts to mutate `createdAt` or `ownerUid` during an `update`. -> `PERMISSION_DENIED`.
11. **Value Poisoning**: User `u1` updates `budget` with a string `"free"` or `name` with a 5KB string exceeding `maxLength: 200`. -> `PERMISSION_DENIED`.
12. **Audit Log Tampering**: User `u1` attempts to `update` or `delete` an existing `auditLogs` document. -> `PERMISSION_DENIED`.
