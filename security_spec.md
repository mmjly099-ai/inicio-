# TOP STORE Firestore Security Specification

## 1. Data Invariants
1. **Password-Keyed Workspace Isolation**: Every store record (`campaigns`, `metrics`, `content`, `leads`, `customers`, `orders`, `expenses`, `planItems`, `auditLogs`) belongs to the password-derived workspace `/workspaces/{workspaceId}` (`ws-af333569a87c9a30972c8da8e6ca4212`) and carries `ownerUid == workspaceId`.
2. **Non-Enumerable Workspace Root**: Listing `/workspaces` is strictly denied (`allow list: if false`) so only clients holding the passphrase-derived workspace ID can access or query store data.
3. **Strict Validation Blueprints**: Every create and update enforces `isValid[Entity]` schema validation (`keys().hasAll`, `keys().hasOnly`, field lengths, enums, non-negative numbers, regex IDs).
4. **Temporal & Identity Immutability**: `id`, `ownerUid`, `workspaceId`, and `createdAt` (`request.time`) are immutable after creation; every write enforces `updatedAt == request.time`.
5. **Action-Based Updates & Terminal State Locking**: Updates restrict mutable keys via `affectedKeys().hasOnly([...])`, and protect terminal order/lead/campaign states (`delivered`, `returned`, `won`, `completed`) allowing only soft-delete/restore updates.
6. **Audit Log Immutability**: Audit logs (`auditLogs`) are append-only (`create` allowed for the authorized workspace; `update` and `delete` strictly denied).

## 2. The "Dirty Dozen" Payloads (Adversarial Tests)
1. **Unknowingly Guessed Workspace Read**: Client tries to read `/workspaces/default/campaigns/cmp-1`. -> `PERMISSION_DENIED`.
2. **Workspace Enumeration Attack**: Client attempts to `list` `/workspaces`. -> `PERMISSION_DENIED`.
3. **Unauthorized Workspace PII Leak (`get`)**: Client tries to `get` `/workspaces/other-ws/leads/lead-1`. -> `PERMISSION_DENIED`.
4. **Unauthorized Scraping (`list`)**: Client tries to `list` `/workspaces/other-ws/customers` without authorized workspace ID & matching `ownerUid`. -> `PERMISSION_DENIED`.
5. **Path Variable ID Poisoning**: Client tries to `create` a campaign with ID `../evil_id$123` or >128 chars. -> `PERMISSION_DENIED`.
6. **Shadow / Ghost Field Injection**: Client tries to `create` a campaign with an extra undocumented field `ghostAdmin: true`. -> `PERMISSION_DENIED`.
7. **Owner UID Spoofing**: Client tries to `create` a campaign with mismatched `ownerUid: "attacker"`. -> `PERMISSION_DENIED`.
8. **Orphaned Subcollection Write**: Client tries to `create` `/workspaces/nonexistent/campaigns/c1` when parent workspace does not exist or mismatches authorized ID. -> `PERMISSION_DENIED`.
9. **Client Timestamp Forgery**: Client sends a custom backdated `createdAt` timestamp instead of `request.time`. -> `PERMISSION_DENIED`.
10. **Immutable Field Tampering**: Client attempts to mutate `createdAt` or `ownerUid` during an `update`. -> `PERMISSION_DENIED`.
11. **Value Poisoning**: Client updates `budget` with a string `"free"` or `name` with a 500-char string exceeding `maxLength: 200`. -> `PERMISSION_DENIED`.
12. **Audit Log Tampering**: Client attempts to `update` or `delete` an existing `auditLogs` document. -> `PERMISSION_DENIED`.
