/**
 * Firestore Security Rules Test Suite for TOP STORE
 * Verifies the "Dirty Dozen" adversarial payloads return PERMISSION_DENIED.
 */

export interface DirtyDozenCase {
  id: number;
  name: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  path: string;
  payload?: Record<string, unknown>;
  expected: 'PERMISSION_DENIED';
}

const VALID_WS = 'ws-af333569a87c9a30972c8da8e6ca4212';

export const DIRTY_DOZEN_CASES: DirtyDozenCase[] = [
  {
    id: 1,
    name: 'Guessed default workspace read',
    operation: 'get',
    path: '/workspaces/default/campaigns/cmp-1',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Workspace enumeration attack',
    operation: 'list',
    path: '/workspaces',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Unauthorized workspace PII leak on leads',
    operation: 'get',
    path: '/workspaces/other-ws/leads/lead-1',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Unauthorized list scraping on customers',
    operation: 'list',
    path: '/workspaces/other-ws/customers',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Path variable ID poisoning',
    operation: 'create',
    path: `/workspaces/${VALID_WS}/campaigns/invalid$id!with*badchars`,
    payload: { id: 'invalid$id!with*badchars', ownerUid: VALID_WS, workspaceId: VALID_WS },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Shadow ghost field injection',
    operation: 'create',
    path: `/workspaces/${VALID_WS}/campaigns/cmp-1`,
    payload: {
      id: 'cmp-1',
      ownerUid: VALID_WS,
      workspaceId: VALID_WS,
      name: 'Test',
      platform: 'tiktok',
      objective: 'sales',
      budget: 1000,
      startDate: '2026-11-19',
      status: 'active',
      created_by: 'Owner',
      created_at: '2026-11-19T00:00:00Z',
      updated_at: '2026-11-19T00:00:00Z',
      ghostAdmin: true,
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Owner UID spoofing',
    operation: 'create',
    path: `/workspaces/${VALID_WS}/campaigns/cmp-2`,
    payload: {
      id: 'cmp-2',
      ownerUid: 'attacker',
      workspaceId: VALID_WS,
      name: 'Spoofed',
      platform: 'tiktok',
      objective: 'sales',
      budget: 1000,
      startDate: '2026-11-19',
      status: 'active',
      created_by: 'Owner',
      created_at: '2026-11-19T00:00:00Z',
      updated_at: '2026-11-19T00:00:00Z',
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Orphaned write without authorized parent workspace',
    operation: 'create',
    path: '/workspaces/missingWs/campaigns/cmp-3',
    payload: { id: 'cmp-3', ownerUid: 'missingWs', workspaceId: 'missingWs' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Client timestamp forgery',
    operation: 'create',
    path: `/workspaces/${VALID_WS}/campaigns/cmp-4`,
    payload: {
      id: 'cmp-4',
      ownerUid: VALID_WS,
      workspaceId: VALID_WS,
      name: 'Backdated',
      platform: 'instagram',
      objective: 'sales',
      budget: 500,
      startDate: '2026-11-19',
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
    path: `/workspaces/${VALID_WS}/campaigns/cmp-1`,
    payload: { ownerUid: 'attacker' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Value poisoning with invalid budget type and oversized name',
    operation: 'update',
    path: `/workspaces/${VALID_WS}/campaigns/cmp-1`,
    payload: { budget: 'invalid_string', name: 'x'.repeat(500) },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Audit log tampering (delete/update)',
    operation: 'delete',
    path: `/workspaces/${VALID_WS}/auditLogs/aud-1`,
    expected: 'PERMISSION_DENIED',
  },
];
