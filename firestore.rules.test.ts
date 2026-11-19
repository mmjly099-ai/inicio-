/**
 * Firestore Security Rules Test Suite for TOP STORE
 * Verifies the "Dirty Dozen" adversarial payloads return PERMISSION_DENIED.
 */

export interface DirtyDozenCase {
  id: number;
  name: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  path: string;
  auth: { uid?: string; email?: string; email_verified?: boolean } | null;
  payload?: Record<string, unknown>;
  expected: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_CASES: DirtyDozenCase[] = [
  {
    id: 1,
    name: 'Unauthenticated read',
    operation: 'get',
    path: '/workspaces/u1/campaigns/cmp-1',
    auth: null,
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Unverified email spoofing admin email',
    operation: 'list',
    path: '/workspaces/u1/leads',
    auth: { uid: 'attacker', email: 'malkamynaldyny@gmail.com', email_verified: false },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Cross-tenant PII leak on leads',
    operation: 'get',
    path: '/workspaces/u1/leads/lead-1',
    auth: { uid: 'u2', email: 'u2@example.com', email_verified: true },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Cross-tenant list scraping on customers',
    operation: 'list',
    path: '/workspaces/u1/customers',
    auth: { uid: 'u2', email: 'u2@example.com', email_verified: true },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Path variable ID poisoning',
    operation: 'create',
    path: '/workspaces/u1/campaigns/invalid$id!with*badchars',
    auth: { uid: 'u1', email: 'u1@example.com', email_verified: true },
    payload: { id: 'invalid$id!with*badchars', ownerUid: 'u1', workspaceId: 'u1' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Shadow ghost field injection',
    operation: 'create',
    path: '/workspaces/u1/campaigns/cmp-1',
    auth: { uid: 'u1', email: 'u1@example.com', email_verified: true },
    payload: {
      id: 'cmp-1',
      ownerUid: 'u1',
      workspaceId: 'u1',
      name: 'Test',
      platform: 'tiktok',
      objective: 'sales',
      budget: 1000,
      startDate: '2026-11-17',
      status: 'active',
      created_by: 'Owner',
      created_at: '2026-11-17T00:00:00Z',
      updated_at: '2026-11-17T00:00:00Z',
      ghostAdmin: true,
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Owner UID spoofing',
    operation: 'create',
    path: '/workspaces/u1/campaigns/cmp-2',
    auth: { uid: 'u1', email: 'u1@example.com', email_verified: true },
    payload: {
      id: 'cmp-2',
      ownerUid: 'u2',
      workspaceId: 'u1',
      name: 'Spoofed',
      platform: 'tiktok',
      objective: 'sales',
      budget: 1000,
      startDate: '2026-11-17',
      status: 'active',
      created_by: 'Owner',
      created_at: '2026-11-17T00:00:00Z',
      updated_at: '2026-11-17T00:00:00Z',
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Orphaned write without parent workspace',
    operation: 'create',
    path: '/workspaces/missingWs/campaigns/cmp-3',
    auth: { uid: 'u1', email: 'u1@example.com', email_verified: true },
    payload: { id: 'cmp-3', ownerUid: 'u1', workspaceId: 'missingWs' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Client timestamp forgery',
    operation: 'create',
    path: '/workspaces/u1/campaigns/cmp-4',
    auth: { uid: 'u1', email: 'u1@example.com', email_verified: true },
    payload: {
      id: 'cmp-4',
      ownerUid: 'u1',
      workspaceId: 'u1',
      name: 'Backdated',
      platform: 'instagram',
      objective: 'sales',
      budget: 500,
      startDate: '2026-11-17',
      status: 'active',
      created_by: 'Owner',
      created_at: '2020-01-01T00:00:00Z',
      updated_at: '2020-01-01T00:00:00Z',
      createdAt: '2020-01-01T00:00:00Z',
      updatedAt: '2020-01-01T00:00:00Z',
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Immutable field tampering on update',
    operation: 'update',
    path: '/workspaces/u1/campaigns/cmp-1',
    auth: { uid: 'u1', email: 'u1@example.com', email_verified: true },
    payload: { ownerUid: 'u2' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Value poisoning with invalid budget type and oversized name',
    operation: 'update',
    path: '/workspaces/u1/campaigns/cmp-1',
    auth: { uid: 'u1', email: 'u1@example.com', email_verified: true },
    payload: { budget: 'invalid_string', name: 'x'.repeat(500) },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Audit log tampering (delete/update)',
    operation: 'delete',
    path: '/workspaces/u1/auditLogs/aud-1',
    auth: { uid: 'u1', email: 'u1@example.com', email_verified: true },
    expected: 'PERMISSION_DENIED',
  },
];
