import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  FirebaseUser,
  OperationType,
  handleFirestoreError,
} from '../firebase';
import {
  User,
  Campaign,
  DailyCampaignMetric,
  ContentItem,
  Lead,
  Customer,
  MarketingOrder,
  MarketingExpense,
  MarketingPlanItem,
  AuditLog,
  Platform,
  CampaignObjective,
  CampaignStatus,
  ContentType,
  LeadStatus,
  OrderStatus,
  ExpenseCategory,
  PlanItemStatus,
  PlanItemPriority,
} from '../types';

export type SyncStatus = 'connecting' | 'synced' | 'syncing' | 'offline' | 'error';

interface AppContextType {
  // Firebase Auth & Sync State
  firebaseUser: FirebaseUser | null;
  authLoading: boolean;
  authError: string | null;
  signingIn: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithRedirectFallback: () => Promise<void>;
  logoutUser: () => Promise<void>;
  syncStatus: SyncStatus;
  workspaceId: string | null;

  // Current user & permissions
  currentUser: User;
  canEdit: boolean;
  canDelete: boolean;
  isAdmin: boolean;

  // Campaigns
  campaigns: Campaign[];
  addCampaign: (campaign: Omit<Campaign, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'deleted_at'>) => Campaign;
  updateCampaign: (id: string, updates: Partial<Campaign>) => void;
  softDeleteCampaign: (id: string) => void;
  restoreCampaign: (id: string) => void;

  // Daily Metrics
  metrics: DailyCampaignMetric[];
  addDailyMetric: (metric: Omit<DailyCampaignMetric, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'deleted_at'>) => DailyCampaignMetric;
  updateDailyMetric: (id: string, updates: Partial<DailyCampaignMetric>) => void;
  softDeleteMetric: (id: string) => void;
  restoreMetric: (id: string) => void;

  // Content
  content: ContentItem[];
  addContent: (item: Omit<ContentItem, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'deleted_at'>) => ContentItem;
  updateContent: (id: string, updates: Partial<ContentItem>) => void;
  softDeleteContent: (id: string) => void;
  restoreContent: (id: string) => void;

  // Leads
  leads: Lead[];
  addLead: (lead: Omit<Lead, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'deleted_at'>) => Lead;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  softDeleteLead: (id: string) => void;
  restoreLead: (id: string) => void;
  convertLeadToCustomer: (
    leadId: string,
    customerData: { city?: string; initialOrderAmount?: number; orderNotes?: string }
  ) => { customer: Customer; order?: MarketingOrder };

  // Customers
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'deleted_at'>) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  softDeleteCustomer: (id: string) => void;
  restoreCustomer: (id: string) => void;

  // Orders
  orders: MarketingOrder[];
  addOrder: (order: Omit<MarketingOrder, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'deleted_at'>) => MarketingOrder;
  updateOrder: (id: string, updates: Partial<MarketingOrder>) => void;
  softDeleteOrder: (id: string) => void;
  restoreOrder: (id: string) => void;

  // Expenses
  expenses: MarketingExpense[];
  addExpense: (expense: Omit<MarketingExpense, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'deleted_at'>) => MarketingExpense;
  updateExpense: (id: string, updates: Partial<MarketingExpense>) => void;
  softDeleteExpense: (id: string) => void;
  restoreExpense: (id: string) => void;

  // Marketing Plan
  planItems: MarketingPlanItem[];
  addPlanItem: (item: Omit<MarketingPlanItem, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'deleted_at'>) => MarketingPlanItem;
  updatePlanItem: (id: string, updates: Partial<MarketingPlanItem>) => void;
  softDeletePlanItem: (id: string) => void;
  restorePlanItem: (id: string) => void;

  // Audit Logs
  auditLogs: AuditLog[];
  logAction: (action: AuditLog['action'], targetType: string, targetId: string, targetTitle: string, details: string) => void;

  // Backup, Restore & Reset
  exportBackupJSON: () => void;
  importBackupJSON: (jsonString: string) => Promise<boolean>;
  clearAllWorkspaceData: () => Promise<void>;

  // Helper getters
  getCampaignMetrics: (campaignId: string) => DailyCampaignMetric[];
  getCampaignById: (id: string) => Campaign | undefined;
}

const LEGACY_STORAGE_KEYS = [
  'top_store_marketing_v1_campaigns',
  'top_store_marketing_v1_metrics',
  'top_store_marketing_v1_content',
  'top_store_marketing_v1_leads',
  'top_store_marketing_v1_customers',
  'top_store_marketing_v1_orders',
  'top_store_marketing_v1_expenses',
  'top_store_marketing_v1_planItems',
  'top_store_marketing_v1_auditLogs',
];

const PLATFORMS: Platform[] = ['instagram', 'facebook', 'tiktok', 'whatsapp', 'snapchat', 'twitter', 'google', 'other'];
const OBJECTIVES: CampaignObjective[] = ['awareness', 'messages', 'leads', 'sales', 'retargeting'];
const CAMPAIGN_STATUSES: CampaignStatus[] = ['active', 'paused', 'completed', 'draft'];
const CONTENT_TYPES: ContentType[] = ['reel', 'story', 'post', 'carousel', 'video', 'ad', 'other'];
const LEAD_STATUSES: LeadStatus[] = ['new', 'contacted', 'qualified', 'opportunity', 'won', 'lost'];
const ORDER_STATUSES: OrderStatus[] = ['new', 'processing', 'delivered', 'returned'];
const EXPENSE_CATEGORIES: ExpenseCategory[] = ['paid_ads', 'content_design', 'tools_software', 'influencers', 'other'];
const PLAN_STATUSES: PlanItemStatus[] = ['idea', 'in_progress', 'ready', 'published'];
const PLAN_PRIORITIES: PlanItemPriority[] = ['high', 'medium', 'low'];

const makeId = (prefix: string): string =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const sanitizeId = (val: unknown, fallbackPrefix: string): string => {
  const cleaned = typeof val === 'string' ? val.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128) : '';
  return cleaned.length >= 1 ? cleaned : makeId(fallbackPrefix);
};

const clampStr = (val: unknown, maxLen: number, fallback = ''): string => {
  const s = typeof val === 'string' ? val.slice(0, maxLen) : '';
  return s.length >= 1 ? s : fallback;
};

const optStr = (val: unknown, maxLen: number): string | undefined => {
  if (val === undefined || val === null) return undefined;
  const s = String(val).trim();
  if (!s) return undefined;
  return s.slice(0, maxLen);
};

const nonNegNum = (val: unknown, fallback = 0): number => {
  const n = Number(val);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
};

const safeNum = (val: unknown): number | undefined => {
  if (val === undefined || val === null || val === '') return undefined;
  const n = Number(val);
  return Number.isFinite(n) ? n : undefined;
};

const pickEnum = <T extends string>(val: unknown, allowed: readonly T[], fallback: T): T =>
  typeof val === 'string' && (allowed as readonly string[]).includes(val) ? (val as T) : fallback;

const stripUndefined = <T extends Record<string, unknown>>(obj: T): Record<string, unknown> => {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v;
  }
  return out;
};

const sortByDateDesc = <T extends { created_at?: string; timestamp?: string }>(items: T[]): T[] =>
  [...items].sort((a, b) => {
    const tA = new Date(a.created_at || a.timestamp || 0).getTime();
    const tB = new Date(b.created_at || b.timestamp || 0).getTime();
    return tB - tA;
  });

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState<boolean>(false);
  const [workspaceReady, setWorkspaceReady] = useState<boolean>(false);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('connecting');
  const [fatalError, setFatalError] = useState<Error | null>(null);

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [metrics, setMetrics] = useState<DailyCampaignMetric[]>([]);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<MarketingOrder[]>([]);
  const [expenses, setExpenses] = useState<MarketingExpense[]>([]);
  const [planItems, setPlanItems] = useState<MarketingPlanItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const campaignsRef = useRef<Campaign[]>([]);
  const leadsRef = useRef<Lead[]>([]);
  const customersRef = useRef<Customer[]>([]);
  campaignsRef.current = campaigns;
  leadsRef.current = leads;
  customersRef.current = customers;

  // Purge any legacy localStorage demo keys on mount
  useEffect(() => {
    try {
      LEGACY_STORAGE_KEYS.forEach(key => localStorage.removeItem(key));
    } catch {
      // Ignore storage access restrictions
    }
  }, []);

  // Track browser online/offline transitions
  useEffect(() => {
    const handleOffline = () => setSyncStatus('offline');
    const handleOnline = () => {
      if (workspaceReady) setSyncStatus('synced');
    };
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [workspaceReady]);

  const reportFirestoreError = useCallback(
    (error: unknown, operationType: OperationType, path: string | null) => {
      try {
        handleFirestoreError(error, operationType, path);
      } catch (wrapped) {
        setSyncStatus('error');
        setFatalError(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
      }
    },
    []
  );

  const formatAuthError = useCallback((err: unknown): string | null => {
    const authErr = err as { code?: string; message?: string };
    const code = authErr?.code || '';
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';

    if (code === 'auth/cancelled-popup-request') {
      return null;
    }
    if (code === 'auth/popup-closed-by-user') {
      return 'تم إغلاق نافذة تسجيل الدخول قبل الإتمام. يمكنك المحاولة مرة أخرى أو استخدام الدخول المباشر للجوال.';
    }
    if (code === 'auth/popup-blocked') {
      return 'المتصفح يحظر النوافذ المنبثقة على هذا الجهاز. استخدم زر "الدخول المباشر للجوال" بالأسفل أو افتح التطبيق في متصفح Chrome.';
    }
    if (code === 'auth/unauthorized-domain') {
      return `النطاق الحالي (${hostname}) غير مضاف ضمن النطاقات المصرح بها في إعدادات Firebase Auth (Authorized Domains).`;
    }
    if (code === 'auth/operation-not-supported-in-this-environment' || code === 'auth/web-storage-unsupported') {
      return 'المتصفح الحالي أو وضع التشغيل لا يدعم نوافذ تسجيل الدخول المنبثقة. افتح التطبيق مباشرة في متصفح Chrome أو استخدم الدخول المباشر.';
    }
    if (code === 'auth/network-request-failed') {
      return 'تعذر الاتصال بخوادم Google. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.';
    }
    if (code === 'auth/operation-not-allowed') {
      return 'تسجيل الدخول عبر Google غير مفعّل في مشروع Firebase الحالي.';
    }
    const detail = code || (authErr?.message ? authErr.message.slice(0, 80) : 'خطأ غير معروف');
    return `تعذر تسجيل الدخول عبر Google (${detail}). جرّب الدخول المباشر للجوال أو افتح التطبيق في متصفح Chrome.`;
  }, []);

  // Process any pending OAuth redirect result on startup
  useEffect(() => {
    let active = true;
    getRedirectResult(auth).catch(err => {
      if (!active) return;
      const formatted = formatAuthError(err);
      if (formatted) setAuthError(formatted);
    });
    return () => {
      active = false;
    };
  }, [formatAuthError]);

  // Listen to Firebase Auth state and bootstrap workspace/profile
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async user => {
      if (!user) {
        setFirebaseUser(null);
        setWorkspaceId(null);
        setWorkspaceReady(false);
        setCampaigns([]);
        setMetrics([]);
        setContent([]);
        setLeads([]);
        setCustomers([]);
        setOrders([]);
        setExpenses([]);
        setPlanItems([]);
        setAuditLogs([]);
        setAuthLoading(false);
        setSyncStatus('connecting');
        return;
      }

      if (!user.emailVerified) {
        setAuthError('يرجى استخدام حساب Google مفعّل البريد الإلكتروني للمتابعة.');
        setFirebaseUser(null);
        setAuthLoading(false);
        return;
      }

      setAuthError(null);
      setFirebaseUser(user);
      setSyncStatus(navigator.onLine ? 'connecting' : 'offline');

      const uid = user.uid;
      const displayName = clampStr(user.displayName || user.email || 'مدير المتجر', 120, 'مدير المتجر');
      const wsRef = doc(db, 'workspaces', uid);
      const profileRef = doc(db, 'userProfiles', uid);

      try {
        const wsSnap = await getDoc(wsRef);
        if (!wsSnap.exists()) {
          await setDoc(wsRef, {
            id: uid,
            ownerUid: uid,
            storeName: 'TOP STORE | توب ستور',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      } catch (err) {
        reportFirestoreError(err, OperationType.WRITE, `workspaces/${uid}`);
        setAuthLoading(false);
        return;
      }

      try {
        const profileSnap = await getDoc(profileRef);
        if (!profileSnap.exists()) {
          await setDoc(profileRef, {
            uid,
            displayName,
            activeWorkspaceId: uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      } catch (err) {
        reportFirestoreError(err, OperationType.WRITE, `userProfiles/${uid}`);
        setAuthLoading(false);
        return;
      }

      setWorkspaceId(uid);
      setWorkspaceReady(true);
      setAuthLoading(false);
    });

    return () => unsubscribeAuth();
  }, [reportFirestoreError]);

  // Subscribe to all 9 Firestore collections in real time
  useEffect(() => {
    if (!firebaseUser || !workspaceId || !workspaceReady) return;

    const uid = firebaseUser.uid;
    const unsubscribers: Array<() => void> = [];

    const subscribeCol = <T extends { created_at?: string; timestamp?: string }>(
      colName: string,
      setter: React.Dispatch<React.SetStateAction<T[]>>
    ) => {
      const path = `workspaces/${workspaceId}/${colName}`;
      const q = query(collection(db, 'workspaces', workspaceId, colName), where('ownerUid', '==', uid));
      const unsub = onSnapshot(
        q,
        { includeMetadataChanges: true },
        snapshot => {
          const docs = snapshot.docs.map(d => d.data() as T);
          setter(sortByDateDesc(docs));
          if (!navigator.onLine) {
            setSyncStatus('offline');
          } else if (snapshot.metadata.hasPendingWrites) {
            setSyncStatus('syncing');
          } else {
            setSyncStatus('synced');
          }
        },
        err => {
          reportFirestoreError(err, OperationType.LIST, path);
        }
      );
      unsubscribers.push(unsub);
    };

    subscribeCol<Campaign>('campaigns', setCampaigns);
    subscribeCol<DailyCampaignMetric>('metrics', setMetrics);
    subscribeCol<ContentItem>('content', setContent);
    subscribeCol<Lead>('leads', setLeads);
    subscribeCol<Customer>('customers', setCustomers);
    subscribeCol<MarketingOrder>('orders', setOrders);
    subscribeCol<MarketingExpense>('expenses', setExpenses);
    subscribeCol<MarketingPlanItem>('planItems', setPlanItems);
    subscribeCol<AuditLog>('auditLogs', setAuditLogs);

    return () => {
      unsubscribers.forEach(fn => fn());
    };
  }, [firebaseUser, workspaceId, workspaceReady, reportFirestoreError]);

  const signInWithRedirectFallback = async () => {
    const isInIframe = typeof window !== 'undefined' && window.self !== window.top;
    if (isInIframe) {
      setAuthError('الدخول المباشر غير متاح داخل نافذة المعاينة المدمجة. اضغط على "فتح في متصفح Chrome" بالأسفل لإتمام الدخول بسهولة.');
      return;
    }
    setSigningIn(true);
    setAuthError(null);
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (err: unknown) {
      const formatted = formatAuthError(err);
      if (formatted) setAuthError(formatted);
      setSigningIn(false);
    }
  };

  const signInWithGoogle = async () => {
    setSigningIn(true);
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code || '';
      const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

      // On mobile Chrome / standalone PWA, automatically fall back to redirect when popups are blocked
      if (
        !isInIframe &&
        (code === 'auth/popup-blocked' || code === 'auth/operation-not-supported-in-this-environment')
      ) {
        try {
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch (redirectErr: unknown) {
          const formattedRedirect = formatAuthError(redirectErr);
          if (formattedRedirect) setAuthError(formattedRedirect);
          return;
        }
      }

      const formatted = formatAuthError(err);
      if (formatted) setAuthError(formatted);
    } finally {
      setSigningIn(false);
    }
  };

  const logoutUser = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Sign out error', err);
    }
  };

  // Authenticated user info
  const currentUser: User = {
    id: firebaseUser?.uid || 'guest',
    name: clampStr(firebaseUser?.displayName || firebaseUser?.email || 'مدير المتجر', 120, 'مدير المتجر'),
    email: firebaseUser?.email || '',
    role: 'admin',
    avatar: firebaseUser?.photoURL || undefined,
  };

  const isAdmin = Boolean(firebaseUser);
  const canEdit = Boolean(firebaseUser && workspaceReady);
  const canDelete = Boolean(firebaseUser && workspaceReady);

  // Write helpers
  const persistCreate = useCallback(
    (colName: string, docId: string, payload: Record<string, unknown>) => {
      if (!workspaceId) return;
      const path = `workspaces/${workspaceId}/${colName}/${docId}`;
      setSyncStatus(navigator.onLine ? 'syncing' : 'offline');
      setDoc(doc(db, 'workspaces', workspaceId, colName, docId), payload).catch(err => {
        reportFirestoreError(err, OperationType.CREATE, path);
      });
    },
    [workspaceId, reportFirestoreError]
  );

  const persistUpdate = useCallback(
    (colName: string, docId: string, updates: Record<string, unknown>) => {
      if (!workspaceId) return;
      const path = `workspaces/${workspaceId}/${colName}/${docId}`;
      setSyncStatus(navigator.onLine ? 'syncing' : 'offline');
      updateDoc(doc(db, 'workspaces', workspaceId, colName, docId), updates).catch(err => {
        reportFirestoreError(err, OperationType.UPDATE, path);
      });
    },
    [workspaceId, reportFirestoreError]
  );

  const logAction = useCallback(
    (
      action: AuditLog['action'],
      targetType: string,
      targetId: string,
      targetTitle: string,
      details: string
    ) => {
      if (!firebaseUser || !workspaceId) return;
      const id = makeId('aud');
      const nowIso = new Date().toISOString();
      const newLog: AuditLog = {
        id,
        userName: currentUser.name,
        userRole: 'admin',
        action,
        targetType: clampStr(targetType, 80, 'عنصر'),
        targetId: sanitizeId(targetId, 'item'),
        targetTitle: clampStr(targetTitle, 250, 'عنصر'),
        details: clampStr(details, 1000, 'عملية نظام'),
        timestamp: nowIso,
      };
      persistCreate('auditLogs', id, {
        ...newLog,
        ownerUid: firebaseUser.uid,
        workspaceId,
        createdAt: serverTimestamp(),
      });
    },
    [firebaseUser, workspaceId, currentUser.name, persistCreate]
  );

  // 1. CAMPAIGNS CRUD
  const addCampaign = (
    campaignData: Omit<Campaign, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'deleted_at'>
  ) => {
    const id = makeId('cmp');
    const nowIso = new Date().toISOString();
    const newCampaign: Campaign = {
      id,
      name: clampStr(campaignData.name, 200, 'حملة تسويقية'),
      platform: pickEnum(campaignData.platform, PLATFORMS, 'other'),
      objective: pickEnum(campaignData.objective, OBJECTIVES, 'sales'),
      budget: nonNegNum(campaignData.budget, 0),
      startDate: clampStr(campaignData.startDate, 32, nowIso.split('T')[0]),
      endDate: optStr(campaignData.endDate, 32),
      status: pickEnum(campaignData.status, CAMPAIGN_STATUSES, 'active'),
      targetAudience: optStr(campaignData.targetAudience, 500),
      notes: optStr(campaignData.notes, 2000),
      created_at: nowIso,
      updated_at: nowIso,
      created_by: currentUser.name,
      deleted_at: null,
    };

    if (firebaseUser && workspaceId) {
      persistCreate(
        'campaigns',
        id,
        stripUndefined({
          ...newCampaign,
          ownerUid: firebaseUser.uid,
          workspaceId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      );
      logAction(
        'create',
        'حملة إعلانية',
        newCampaign.id,
        newCampaign.name,
        `تمت إضافة حملة جديدة "${newCampaign.name}" بميزانية ${newCampaign.budget} ر.س`
      );
    }
    return newCampaign;
  };

  const updateCampaign = (id: string, updates: Partial<Campaign>) => {
    const nowIso = new Date().toISOString();
    const cleanUpdates: Record<string, unknown> = {
      updated_at: nowIso,
      updatedAt: serverTimestamp(),
    };
    if (updates.name !== undefined) cleanUpdates.name = clampStr(updates.name, 200, 'حملة تسويقية');
    if (updates.platform !== undefined) cleanUpdates.platform = pickEnum(updates.platform, PLATFORMS, 'other');
    if (updates.objective !== undefined) cleanUpdates.objective = pickEnum(updates.objective, OBJECTIVES, 'sales');
    if (updates.budget !== undefined) cleanUpdates.budget = nonNegNum(updates.budget, 0);
    if (updates.startDate !== undefined) cleanUpdates.startDate = clampStr(updates.startDate, 32, nowIso.split('T')[0]);
    if (updates.endDate !== undefined) cleanUpdates.endDate = optStr(updates.endDate, 32) ?? null;
    if (updates.status !== undefined) cleanUpdates.status = pickEnum(updates.status, CAMPAIGN_STATUSES, 'active');
    if (updates.targetAudience !== undefined) cleanUpdates.targetAudience = optStr(updates.targetAudience, 500) ?? null;
    if (updates.notes !== undefined) cleanUpdates.notes = optStr(updates.notes, 2000) ?? null;
    if (updates.deleted_at !== undefined) cleanUpdates.deleted_at = updates.deleted_at;

    persistUpdate('campaigns', id, cleanUpdates);
    const existing = campaignsRef.current.find(c => c.id === id);
    if (existing) {
      logAction('update', 'حملة إعلانية', id, existing.name, `تم تعديل بيانات الحملة "${existing.name}"`);
    }
  };

  const softDeleteCampaign = (id: string) => {
    const nowIso = new Date().toISOString();
    persistUpdate('campaigns', id, {
      deleted_at: nowIso,
      updated_at: nowIso,
      updatedAt: serverTimestamp(),
    });
    const existing = campaignsRef.current.find(c => c.id === id);
    logAction(
      'soft_delete',
      'حملة إعلانية',
      id,
      existing?.name || 'حملة',
      `تم نقل الحملة "${existing?.name || id}" إلى سلة المحذوفات`
    );
  };

  const restoreCampaign = (id: string) => {
    const nowIso = new Date().toISOString();
    persistUpdate('campaigns', id, {
      deleted_at: null,
      updated_at: nowIso,
      updatedAt: serverTimestamp(),
    });
    const existing = campaignsRef.current.find(c => c.id === id);
    logAction(
      'restore',
      'حملة إعلانية',
      id,
      existing?.name || 'حملة',
      `تمت استعادة الحملة "${existing?.name || id}" من سلة المحذوفات`
    );
  };

  // 2. DAILY METRICS CRUD
  const addDailyMetric = (
    metricData: Omit<DailyCampaignMetric, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'deleted_at'>
  ) => {
    const id = makeId('met');
    const nowIso = new Date().toISOString();
    const newMetric: DailyCampaignMetric = {
      id,
      campaignId: sanitizeId(metricData.campaignId, 'cmp'),
      date: clampStr(metricData.date, 32, nowIso.split('T')[0]),
      spend: nonNegNum(metricData.spend, 0),
      reach: nonNegNum(metricData.reach, 0),
      impressions: nonNegNum(metricData.impressions, 0),
      clicks: nonNegNum(metricData.clicks, 0),
      messages: nonNegNum(metricData.messages, 0),
      leads: nonNegNum(metricData.leads, 0),
      newCustomers: nonNegNum(metricData.newCustomers, 0),
      orders: nonNegNum(metricData.orders, 0),
      revenue: nonNegNum(metricData.revenue, 0),
      notes: optStr(metricData.notes, 2000),
      created_at: nowIso,
      updated_at: nowIso,
      created_by: currentUser.name,
      deleted_at: null,
    };

    if (firebaseUser && workspaceId) {
      persistCreate(
        'metrics',
        id,
        stripUndefined({
          ...newMetric,
          ownerUid: firebaseUser.uid,
          workspaceId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      );
      const campaign = campaignsRef.current.find(c => c.id === newMetric.campaignId);
      logAction(
        'create',
        'مقياس يومي للحملة',
        newMetric.id,
        campaign?.name || 'حملة',
        `تم تسجيل أداء يومي بتاريخ ${newMetric.date}: صرف ${newMetric.spend} ر.س ومبيعات ${newMetric.revenue} ر.س`
      );
    }
    return newMetric;
  };

  const updateDailyMetric = (id: string, updates: Partial<DailyCampaignMetric>) => {
    const nowIso = new Date().toISOString();
    const cleanUpdates: Record<string, unknown> = {
      updated_at: nowIso,
      updatedAt: serverTimestamp(),
    };
    if (updates.campaignId !== undefined) cleanUpdates.campaignId = sanitizeId(updates.campaignId, 'cmp');
    if (updates.date !== undefined) cleanUpdates.date = clampStr(updates.date, 32, nowIso.split('T')[0]);
    if (updates.spend !== undefined) cleanUpdates.spend = nonNegNum(updates.spend, 0);
    if (updates.reach !== undefined) cleanUpdates.reach = nonNegNum(updates.reach, 0);
    if (updates.impressions !== undefined) cleanUpdates.impressions = nonNegNum(updates.impressions, 0);
    if (updates.clicks !== undefined) cleanUpdates.clicks = nonNegNum(updates.clicks, 0);
    if (updates.messages !== undefined) cleanUpdates.messages = nonNegNum(updates.messages, 0);
    if (updates.leads !== undefined) cleanUpdates.leads = nonNegNum(updates.leads, 0);
    if (updates.newCustomers !== undefined) cleanUpdates.newCustomers = nonNegNum(updates.newCustomers, 0);
    if (updates.orders !== undefined) cleanUpdates.orders = nonNegNum(updates.orders, 0);
    if (updates.revenue !== undefined) cleanUpdates.revenue = nonNegNum(updates.revenue, 0);
    if (updates.notes !== undefined) cleanUpdates.notes = optStr(updates.notes, 2000) ?? null;
    if (updates.deleted_at !== undefined) cleanUpdates.deleted_at = updates.deleted_at;

    persistUpdate('metrics', id, cleanUpdates);
    logAction('update', 'مقياس يومي للحملة', id, 'سجل أداء', 'تم تعديل بيانات الأداء اليومي');
  };

  const softDeleteMetric = (id: string) => {
    const nowIso = new Date().toISOString();
    persistUpdate('metrics', id, {
      deleted_at: nowIso,
      updated_at: nowIso,
      updatedAt: serverTimestamp(),
    });
    logAction('soft_delete', 'مقياس يومي', id, 'سجل أداء', 'تم نقل المقياس اليومي لسلة المحذوفات');
  };

  const restoreMetric = (id: string) => {
    const nowIso = new Date().toISOString();
    persistUpdate('metrics', id, {
      deleted_at: null,
      updated_at: nowIso,
      updatedAt: serverTimestamp(),
    });
    logAction('restore', 'مقياس يومي', id, 'سجل أداء', 'تمت استعادة المقياس اليومي من سلة المحذوفات');
  };

  // 3. CONTENT CRUD
  const addContent = (
    itemData: Omit<ContentItem, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'deleted_at'>
  ) => {
    const id = makeId('cnt');
    const nowIso = new Date().toISOString();
    const newItem: ContentItem = {
      id,
      title: clampStr(itemData.title, 250, 'محتوى تسويقي'),
      campaignId: optStr(itemData.campaignId, 128),
      platform: pickEnum(itemData.platform, PLATFORMS, 'other'),
      type: pickEnum(itemData.type, CONTENT_TYPES, 'other'),
      hook: typeof itemData.hook === 'string' ? itemData.hook.slice(0, 1000) : '',
      creator: optStr(itemData.creator, 120),
      publishDate: clampStr(itemData.publishDate, 32, nowIso.split('T')[0]),
      status: pickEnum(itemData.status, ['draft', 'scheduled', 'published'] as const, 'published'),
      views: nonNegNum(itemData.views, 0),
      reach: nonNegNum(itemData.reach, 0),
      likes: nonNegNum(itemData.likes, 0),
      comments: nonNegNum(itemData.comments, 0),
      shares: nonNegNum(itemData.shares, 0),
      saves: nonNegNum(itemData.saves, 0),
      messages: nonNegNum(itemData.messages, 0),
      leads: nonNegNum(itemData.leads, 0),
      orders: nonNegNum(itemData.orders, 0),
      revenue: nonNegNum(itemData.revenue, 0),
      url: optStr(itemData.url, 500),
      created_at: nowIso,
      updated_at: nowIso,
      created_by: currentUser.name,
      deleted_at: null,
    };

    if (firebaseUser && workspaceId) {
      persistCreate(
        'content',
        id,
        stripUndefined({
          ...newItem,
          ownerUid: firebaseUser.uid,
          workspaceId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      );
      logAction('create', 'محتوى إعلاني', newItem.id, newItem.title, `تمت إضافة قطعة محتوى جديدة: "${newItem.title}"`);
    }
    return newItem;
  };

  const updateContent = (id: string, updates: Partial<ContentItem>) => {
    const nowIso = new Date().toISOString();
    const cleanUpdates: Record<string, unknown> = {
      updated_at: nowIso,
      updatedAt: serverTimestamp(),
    };
    if (updates.title !== undefined) cleanUpdates.title = clampStr(updates.title, 250, 'محتوى تسويقي');
    if (updates.campaignId !== undefined) cleanUpdates.campaignId = optStr(updates.campaignId, 128) ?? null;
    if (updates.platform !== undefined) cleanUpdates.platform = pickEnum(updates.platform, PLATFORMS, 'other');
    if (updates.type !== undefined) cleanUpdates.type = pickEnum(updates.type, CONTENT_TYPES, 'other');
    if (updates.hook !== undefined) cleanUpdates.hook = String(updates.hook ?? '').slice(0, 1000);
    if (updates.creator !== undefined) cleanUpdates.creator = optStr(updates.creator, 120) ?? null;
    if (updates.publishDate !== undefined) cleanUpdates.publishDate = clampStr(updates.publishDate, 32, nowIso.split('T')[0]);
    if (updates.status !== undefined) cleanUpdates.status = pickEnum(updates.status, ['draft', 'scheduled', 'published'] as const, 'published');
    if (updates.views !== undefined) cleanUpdates.views = nonNegNum(updates.views, 0);
    if (updates.reach !== undefined) cleanUpdates.reach = nonNegNum(updates.reach, 0);
    if (updates.likes !== undefined) cleanUpdates.likes = nonNegNum(updates.likes, 0);
    if (updates.comments !== undefined) cleanUpdates.comments = nonNegNum(updates.comments, 0);
    if (updates.shares !== undefined) cleanUpdates.shares = nonNegNum(updates.shares, 0);
    if (updates.saves !== undefined) cleanUpdates.saves = nonNegNum(updates.saves, 0);
    if (updates.messages !== undefined) cleanUpdates.messages = nonNegNum(updates.messages, 0);
    if (updates.leads !== undefined) cleanUpdates.leads = nonNegNum(updates.leads, 0);
    if (updates.orders !== undefined) cleanUpdates.orders = nonNegNum(updates.orders, 0);
    if (updates.revenue !== undefined) cleanUpdates.revenue = nonNegNum(updates.revenue, 0);
    if (updates.url !== undefined) cleanUpdates.url = optStr(updates.url, 500) ?? null;
    if (updates.deleted_at !== undefined) cleanUpdates.deleted_at = updates.deleted_at;

    persistUpdate('content', id, cleanUpdates);
    logAction('update', 'محتوى إعلاني', id, String(updates.title || 'محتوى'), 'تم تعديل مقاييس أو تفاصيل المحتوى');
  };

  const softDeleteContent = (id: string) => {
    const nowIso = new Date().toISOString();
    persistUpdate('content', id, {
      deleted_at: nowIso,
      updated_at: nowIso,
      updatedAt: serverTimestamp(),
    });
    logAction('soft_delete', 'محتوى إعلاني', id, 'محتوى', 'تم نقل المحتوى إلى سلة المحذوفات');
  };

  const restoreContent = (id: string) => {
    const nowIso = new Date().toISOString();
    persistUpdate('content', id, {
      deleted_at: null,
      updated_at: nowIso,
      updatedAt: serverTimestamp(),
    });
    logAction('restore', 'محتوى إعلاني', id, 'محتوى', 'تمت استعادة المحتوى من سلة المحذوفات');
  };

  // 4. LEADS CRUD & CONVERT
  const addLead = (
    leadData: Omit<Lead, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'deleted_at'>
  ) => {
    const id = makeId('lead');
    const nowIso = new Date().toISOString();
    const newLead: Lead = {
      id,
      name: clampStr(leadData.name, 160, 'عميل محتمل'),
      phone: clampStr(leadData.phone, 40, '-'),
      platform: pickEnum(leadData.platform, PLATFORMS, 'other'),
      campaignId: optStr(leadData.campaignId, 128),
      status: pickEnum(leadData.status, LEAD_STATUSES, 'new'),
      notes: optStr(leadData.notes, 2000),
      convertedCustomerId: optStr(leadData.convertedCustomerId, 128),
      created_at: nowIso,
      updated_at: nowIso,
      created_by: currentUser.name,
      deleted_at: null,
    };

    if (firebaseUser && workspaceId) {
      persistCreate(
        'leads',
        id,
        stripUndefined({
          ...newLead,
          ownerUid: firebaseUser.uid,
          workspaceId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      );
      logAction('create', 'عميل محتمل', newLead.id, newLead.name, `تم تسجيل عميل محتمل جديد: ${newLead.name} (${newLead.phone})`);
    }
    return newLead;
  };

  const updateLead = (id: string, updates: Partial<Lead>) => {
    const nowIso = new Date().toISOString();
    const cleanUpdates: Record<string, unknown> = {
      updated_at: nowIso,
      updatedAt: serverTimestamp(),
    };
    if (updates.name !== undefined) cleanUpdates.name = clampStr(updates.name, 160, 'عميل محتمل');
    if (updates.phone !== undefined) cleanUpdates.phone = clampStr(updates.phone, 40, '-');
    if (updates.platform !== undefined) cleanUpdates.platform = pickEnum(updates.platform, PLATFORMS, 'other');
    if (updates.campaignId !== undefined) cleanUpdates.campaignId = optStr(updates.campaignId, 128) ?? null;
    if (updates.status !== undefined) cleanUpdates.status = pickEnum(updates.status, LEAD_STATUSES, 'new');
    if (updates.notes !== undefined) cleanUpdates.notes = optStr(updates.notes, 2000) ?? null;
    if (updates.convertedCustomerId !== undefined) cleanUpdates.convertedCustomerId = optStr(updates.convertedCustomerId, 128) ?? null;
    if (updates.deleted_at !== undefined) cleanUpdates.deleted_at = updates.deleted_at;

    persistUpdate('leads', id, cleanUpdates);
    const existing = leadsRef.current.find(l => l.id === id);
    if (existing) {
      logAction('update', 'عميل محتمل', id, existing.name, `تم تحديث حالة العميل المحتمل ${existing.name}`);
    }
  };

  const softDeleteLead = (id: string) => {
    const nowIso = new Date().toISOString();
    persistUpdate('leads', id, {
      deleted_at: nowIso,
      updated_at: nowIso,
      updatedAt: serverTimestamp(),
    });
    logAction('soft_delete', 'عميل محتمل', id, 'عميل', 'تم نقل العميل المحتمل إلى سلة المحذوفات');
  };

  const restoreLead = (id: string) => {
    const nowIso = new Date().toISOString();
    persistUpdate('leads', id, {
      deleted_at: null,
      updated_at: nowIso,
      updatedAt: serverTimestamp(),
    });
    logAction('restore', 'عميل محتمل', id, 'عميل', 'تمت استعادة العميل المحتمل من سلة المحذوفات');
  };

  const convertLeadToCustomer = (
    leadId: string,
    customerData: { city?: string; initialOrderAmount?: number; orderNotes?: string }
  ) => {
    const lead = leadsRef.current.find(l => l.id === leadId);
    if (!lead) throw new Error('العميل المحتمل غير موجود');

    const nowIso = new Date().toISOString();
    const todayStr = nowIso.split('T')[0];
    const newCustId = makeId('cust');
    const initialAmount = nonNegNum(customerData.initialOrderAmount, 0);

    const newCustomer: Customer = {
      id: newCustId,
      name: clampStr(lead.name, 160, 'عميل'),
      phone: clampStr(lead.phone, 40, '-'),
      city: optStr(customerData.city || 'الرياض', 100),
      firstOrderDate: todayStr,
      sourceCampaignId: optStr(lead.campaignId, 128),
      sourcePlatform: pickEnum(lead.platform, PLATFORMS, 'other'),
      totalOrders: initialAmount > 0 ? 1 : 0,
      totalSpent: initialAmount,
      customerType: 'new',
      notes: optStr(lead.notes, 2000),
      created_at: nowIso,
      updated_at: nowIso,
      created_by: currentUser.name,
      deleted_at: null,
    };

    if (firebaseUser && workspaceId) {
      persistCreate(
        'customers',
        newCustId,
        stripUndefined({
          ...newCustomer,
          ownerUid: firebaseUser.uid,
          workspaceId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      );
    }

    persistUpdate('leads', leadId, {
      status: 'won',
      convertedCustomerId: newCustId,
      updated_at: nowIso,
      updatedAt: serverTimestamp(),
    });

    let newOrder: MarketingOrder | undefined;
    if (initialAmount > 0 && firebaseUser && workspaceId) {
      const ordId = makeId('ord');
      newOrder = {
        id: ordId,
        orderNumber: `TOP-${Math.floor(10000 + Math.random() * 90000)}`,
        customerId: newCustId,
        customerName: newCustomer.name,
        campaignId: optStr(lead.campaignId, 128),
        platform: pickEnum(lead.platform, PLATFORMS, 'other'),
        orderDate: todayStr,
        amount: initialAmount,
        profit: Math.round(initialAmount * 0.4),
        status: 'new',
        notes: optStr(customerData.orderNotes || 'طلب تم إنشاؤه عند تحويل العميل المحتمل', 2000),
        created_at: nowIso,
        updated_at: nowIso,
        created_by: currentUser.name,
        deleted_at: null,
      };
      persistCreate(
        'orders',
        ordId,
        stripUndefined({
          ...newOrder,
          ownerUid: firebaseUser.uid,
          workspaceId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      );
    }

    logAction(
      'convert_lead',
      'عميل محتمل',
      lead.id,
      lead.name,
      `تم تحويل العميل المحتمل ${lead.name} إلى عميل فعلي بنجاح ${initialAmount > 0 ? `مع تسجيل طلب شراء بقيمة ${initialAmount} ر.س` : ''}`
    );

    return { customer: newCustomer, order: newOrder };
  };

  // 5. CUSTOMERS CRUD
  const addCustomer = (
    custData: Omit<Customer, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'deleted_at'>
  ) => {
    const id = makeId('cust');
    const nowIso = new Date().toISOString();
    const newCust: Customer = {
      id,
      name: clampStr(custData.name, 160, 'عميل'),
      phone: clampStr(custData.phone, 40, '-'),
      city: optStr(custData.city, 100),
      firstOrderDate: clampStr(custData.firstOrderDate, 32, nowIso.split('T')[0]),
      sourceCampaignId: optStr(custData.sourceCampaignId, 128),
      sourcePlatform: pickEnum(custData.sourcePlatform, PLATFORMS, 'other'),
      totalOrders: nonNegNum(custData.totalOrders, 0),
      totalSpent: nonNegNum(custData.totalSpent, 0),
      customerType: pickEnum(custData.customerType, ['new', 'returning'] as const, 'new'),
      notes: optStr(custData.notes, 2000),
      created_at: nowIso,
      updated_at: nowIso,
      created_by: currentUser.name,
      deleted_at: null,
    };

    if (firebaseUser && workspaceId) {
      persistCreate(
        'customers',
        id,
        stripUndefined({
          ...newCust,
          ownerUid: firebaseUser.uid,
          workspaceId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      );
      logAction('create', 'عميل فعلي', newCust.id, newCust.name, `تمت إضافة عميل جديد: ${newCust.name}`);
    }
    return newCust;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    const nowIso = new Date().toISOString();
    const cleanUpdates: Record<string, unknown> = {
      updated_at: nowIso,
      updatedAt: serverTimestamp(),
    };
    if (updates.name !== undefined) cleanUpdates.name = clampStr(updates.name, 160, 'عميل');
    if (updates.phone !== undefined) cleanUpdates.phone = clampStr(updates.phone, 40, '-');
    if (updates.city !== undefined) cleanUpdates.city = optStr(updates.city, 100) ?? null;
    if (updates.firstOrderDate !== undefined) cleanUpdates.firstOrderDate = clampStr(updates.firstOrderDate, 32, nowIso.split('T')[0]);
    if (updates.sourceCampaignId !== undefined) cleanUpdates.sourceCampaignId = optStr(updates.sourceCampaignId, 128) ?? null;
    if (updates.sourcePlatform !== undefined) cleanUpdates.sourcePlatform = pickEnum(updates.sourcePlatform, PLATFORMS, 'other');
    if (updates.totalOrders !== undefined) cleanUpdates.totalOrders = nonNegNum(updates.totalOrders, 0);
    if (updates.totalSpent !== undefined) cleanUpdates.totalSpent = nonNegNum(updates.totalSpent, 0);
    if (updates.customerType !== undefined) cleanUpdates.customerType = pickEnum(updates.customerType, ['new', 'returning'] as const, 'new');
    if (updates.notes !== undefined) cleanUpdates.notes = optStr(updates.notes, 2000) ?? null;
    if (updates.deleted_at !== undefined) cleanUpdates.deleted_at = updates.deleted_at;

    persistUpdate('customers', id, cleanUpdates);
  };

  const softDeleteCustomer = (id: string) => {
    const nowIso = new Date().toISOString();
    persistUpdate('customers', id, {
      deleted_at: nowIso,
      updated_at: nowIso,
      updatedAt: serverTimestamp(),
    });
    logAction('soft_delete', 'عميل', id, 'عميل', 'تم نقل العميل إلى سلة المحذوفات');
  };

  const restoreCustomer = (id: string) => {
    const nowIso = new Date().toISOString();
    persistUpdate('customers', id, {
      deleted_at: null,
      updated_at: nowIso,
      updatedAt: serverTimestamp(),
    });
    logAction('restore', 'عميل', id, 'عميل', 'تمت استعادة العميل من سلة المحذوفات');
  };

  // 6. ORDERS CRUD
  const addOrder = (
    orderData: Omit<MarketingOrder, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'deleted_at'>
  ) => {
    const id = makeId('ord');
    const nowIso = new Date().toISOString();
    const newOrder: MarketingOrder = {
      id,
      orderNumber: clampStr(orderData.orderNumber, 64, `TOP-${Math.floor(10000 + Math.random() * 90000)}`),
      customerId: sanitizeId(orderData.customerId, 'cust'),
      customerName: clampStr(orderData.customerName, 160, 'عميل'),
      campaignId: optStr(orderData.campaignId, 128),
      platform: pickEnum(orderData.platform, PLATFORMS, 'other'),
      orderDate: clampStr(orderData.orderDate, 32, nowIso.split('T')[0]),
      amount: nonNegNum(orderData.amount, 0),
      cost: safeNum(orderData.cost),
      profit: safeNum(orderData.profit),
      status: pickEnum(orderData.status, ORDER_STATUSES, 'new'),
      notes: optStr(orderData.notes, 2000),
      created_at: nowIso,
      updated_at: nowIso,
      created_by: currentUser.name,
      deleted_at: null,
    };

    if (firebaseUser && workspaceId) {
      persistCreate(
        'orders',
        id,
        stripUndefined({
          ...newOrder,
          ownerUid: firebaseUser.uid,
          workspaceId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      );

      // Update matching customer totals if customer exists
      const matchingCustomer = customersRef.current.find(c => c.id === newOrder.customerId);
      if (matchingCustomer) {
        persistUpdate('customers', matchingCustomer.id, {
          totalOrders: (matchingCustomer.totalOrders || 0) + 1,
          totalSpent: (matchingCustomer.totalSpent || 0) + newOrder.amount,
          customerType: 'returning',
          updated_at: nowIso,
          updatedAt: serverTimestamp(),
        });
      }

      logAction(
        'create',
        'طلب تسويق',
        newOrder.id,
        newOrder.orderNumber,
        `تم تسجيل طلب شراء ${newOrder.orderNumber} للعميل ${newOrder.customerName} بقيمة ${newOrder.amount} ر.س`
      );
    }
    return newOrder;
  };

  const updateOrder = (id: string, updates: Partial<MarketingOrder>) => {
    const nowIso = new Date().toISOString();
    const cleanUpdates: Record<string, unknown> = {
      updated_at: nowIso,
      updatedAt: serverTimestamp(),
    };
    if (updates.orderNumber !== undefined) cleanUpdates.orderNumber = clampStr(updates.orderNumber, 64, 'TOP-00000');
    if (updates.customerId !== undefined) cleanUpdates.customerId = sanitizeId(updates.customerId, 'cust');
    if (updates.customerName !== undefined) cleanUpdates.customerName = clampStr(updates.customerName, 160, 'عميل');
    if (updates.campaignId !== undefined) cleanUpdates.campaignId = optStr(updates.campaignId, 128) ?? null;
    if (updates.platform !== undefined) cleanUpdates.platform = pickEnum(updates.platform, PLATFORMS, 'other');
    if (updates.orderDate !== undefined) cleanUpdates.orderDate = clampStr(updates.orderDate, 32, nowIso.split('T')[0]);
    if (updates.amount !== undefined) cleanUpdates.amount = nonNegNum(updates.amount, 0);
    if (updates.cost !== undefined) cleanUpdates.cost = safeNum(updates.cost) ?? null;
    if (updates.profit !== undefined) cleanUpdates.profit = safeNum(updates.profit) ?? null;
    if (updates.status !== undefined) cleanUpdates.status = pickEnum(updates.status, ORDER_STATUSES, 'new');
    if (updates.notes !== undefined) cleanUpdates.notes = optStr(updates.notes, 2000) ?? null;
    if (updates.deleted_at !== undefined) cleanUpdates.deleted_at = updates.deleted_at;

    persistUpdate('orders', id, cleanUpdates);
  };

  const softDeleteOrder = (id: string) => {
    const nowIso = new Date().toISOString();
    persistUpdate('orders', id, {
      deleted_at: nowIso,
      updated_at: nowIso,
      updatedAt: serverTimestamp(),
    });
    logAction('soft_delete', 'طلب تسويق', id, 'طلب', 'تم نقل الطلب إلى سلة المحذوفات');
  };

  const restoreOrder = (id: string) => {
    const nowIso = new Date().toISOString();
    persistUpdate('orders', id, {
      deleted_at: null,
      updated_at: nowIso,
      updatedAt: serverTimestamp(),
    });
    logAction('restore', 'طلب تسويق', id, 'طلب', 'تمت استعادة الطلب من سلة المحذوفات');
  };

  // 7. EXPENSES CRUD
  const addExpense = (
    expData: Omit<MarketingExpense, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'deleted_at'>
  ) => {
    const id = makeId('exp');
    const nowIso = new Date().toISOString();
    const newExp: MarketingExpense = {
      id,
      title: clampStr(expData.title, 200, 'مصروف تسويقي'),
      category: pickEnum(expData.category, EXPENSE_CATEGORIES, 'other'),
      amount: nonNegNum(expData.amount, 0),
      expenseDate: clampStr(expData.expenseDate, 32, nowIso.split('T')[0]),
      campaignId: optStr(expData.campaignId, 128),
      paymentMethod: clampStr(expData.paymentMethod, 100, 'تحويل بنكي'),
      notes: optStr(expData.notes, 2000),
      created_at: nowIso,
      updated_at: nowIso,
      created_by: currentUser.name,
      deleted_at: null,
    };

    if (firebaseUser && workspaceId) {
      persistCreate(
        'expenses',
        id,
        stripUndefined({
          ...newExp,
          ownerUid: firebaseUser.uid,
          workspaceId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      );
      logAction('create', 'مصروف تسويقي', newExp.id, newExp.title, `تم تسجيل مصروف جديد: ${newExp.title} بمبلغ ${newExp.amount} ر.س`);
    }
    return newExp;
  };

  const updateExpense = (id: string, updates: Partial<MarketingExpense>) => {
    const nowIso = new Date().toISOString();
    const cleanUpdates: Record<string, unknown> = {
      updated_at: nowIso,
      updatedAt: serverTimestamp(),
    };
    if (updates.title !== undefined) cleanUpdates.title = clampStr(updates.title, 200, 'مصروف تسويقي');
    if (updates.category !== undefined) cleanUpdates.category = pickEnum(updates.category, EXPENSE_CATEGORIES, 'other');
    if (updates.amount !== undefined) cleanUpdates.amount = nonNegNum(updates.amount, 0);
    if (updates.expenseDate !== undefined) cleanUpdates.expenseDate = clampStr(updates.expenseDate, 32, nowIso.split('T')[0]);
    if (updates.campaignId !== undefined) cleanUpdates.campaignId = optStr(updates.campaignId, 128) ?? null;
    if (updates.paymentMethod !== undefined) cleanUpdates.paymentMethod = clampStr(updates.paymentMethod, 100, 'تحويل بنكي');
    if (updates.notes !== undefined) cleanUpdates.notes = optStr(updates.notes, 2000) ?? null;
    if (updates.deleted_at !== undefined) cleanUpdates.deleted_at = updates.deleted_at;

    persistUpdate('expenses', id, cleanUpdates);
  };

  const softDeleteExpense = (id: string) => {
    const nowIso = new Date().toISOString();
    persistUpdate('expenses', id, {
      deleted_at: nowIso,
      updated_at: nowIso,
      updatedAt: serverTimestamp(),
    });
    logAction('soft_delete', 'مصروف تسويقي', id, 'مصروف', 'تم نقل المصروف إلى سلة المحذوفات');
  };

  const restoreExpense = (id: string) => {
    const nowIso = new Date().toISOString();
    persistUpdate('expenses', id, {
      deleted_at: null,
      updated_at: nowIso,
      updatedAt: serverTimestamp(),
    });
    logAction('restore', 'مصروف تسويقي', id, 'مصروف', 'تمت استعادة المصروف من سلة المحذوفات');
  };

  // 8. MARKETING PLAN CRUD
  const addPlanItem = (
    itemData: Omit<MarketingPlanItem, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'deleted_at'>
  ) => {
    const id = makeId('plan');
    const nowIso = new Date().toISOString();
    const newItem: MarketingPlanItem = {
      id,
      date: clampStr(itemData.date, 32, nowIso.split('T')[0]),
      time: optStr(itemData.time, 16),
      title: clampStr(itemData.title, 250, 'مهمة تسويقية'),
      platform: pickEnum(itemData.platform, PLATFORMS, 'other'),
      campaignId: optStr(itemData.campaignId, 128),
      hook: typeof itemData.hook === 'string' ? itemData.hook.slice(0, 1000) : '',
      contentType: pickEnum(itemData.contentType, CONTENT_TYPES, 'other'),
      assignedTo: clampStr(itemData.assignedTo, 120, 'فريق التسويق'),
      status: pickEnum(itemData.status, PLAN_STATUSES, 'idea'),
      priority: itemData.priority ? pickEnum(itemData.priority, PLAN_PRIORITIES, 'medium') : undefined,
      targetGoal: optStr(itemData.targetGoal, 250),
      notes: optStr(itemData.notes, 2000),
      created_at: nowIso,
      updated_at: nowIso,
      created_by: currentUser.name,
      deleted_at: null,
    };

    if (firebaseUser && workspaceId) {
      persistCreate(
        'planItems',
        id,
        stripUndefined({
          ...newItem,
          ownerUid: firebaseUser.uid,
          workspaceId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      );
      logAction('create', 'بند خطة تسويق', newItem.id, newItem.title, `تمت إضافة بند خطة تسويقية: "${newItem.title}" بتاريخ ${newItem.date}`);
    }
    return newItem;
  };

  const updatePlanItem = (id: string, updates: Partial<MarketingPlanItem>) => {
    const nowIso = new Date().toISOString();
    const cleanUpdates: Record<string, unknown> = {
      updated_at: nowIso,
      updatedAt: serverTimestamp(),
    };
    if (updates.date !== undefined) cleanUpdates.date = clampStr(updates.date, 32, nowIso.split('T')[0]);
    if (updates.time !== undefined) cleanUpdates.time = optStr(updates.time, 16) ?? null;
    if (updates.title !== undefined) cleanUpdates.title = clampStr(updates.title, 250, 'مهمة تسويقية');
    if (updates.platform !== undefined) cleanUpdates.platform = pickEnum(updates.platform, PLATFORMS, 'other');
    if (updates.campaignId !== undefined) cleanUpdates.campaignId = optStr(updates.campaignId, 128) ?? null;
    if (updates.hook !== undefined) cleanUpdates.hook = String(updates.hook ?? '').slice(0, 1000);
    if (updates.contentType !== undefined) cleanUpdates.contentType = pickEnum(updates.contentType, CONTENT_TYPES, 'other');
    if (updates.assignedTo !== undefined) cleanUpdates.assignedTo = clampStr(updates.assignedTo, 120, 'فريق التسويق');
    if (updates.status !== undefined) cleanUpdates.status = pickEnum(updates.status, PLAN_STATUSES, 'idea');
    if (updates.priority !== undefined) cleanUpdates.priority = updates.priority ? pickEnum(updates.priority, PLAN_PRIORITIES, 'medium') : null;
    if (updates.targetGoal !== undefined) cleanUpdates.targetGoal = optStr(updates.targetGoal, 250) ?? null;
    if (updates.notes !== undefined) cleanUpdates.notes = optStr(updates.notes, 2000) ?? null;
    if (updates.deleted_at !== undefined) cleanUpdates.deleted_at = updates.deleted_at;

    persistUpdate('planItems', id, cleanUpdates);
  };

  const softDeletePlanItem = (id: string) => {
    const nowIso = new Date().toISOString();
    persistUpdate('planItems', id, {
      deleted_at: nowIso,
      updated_at: nowIso,
      updatedAt: serverTimestamp(),
    });
    logAction('soft_delete', 'بند خطة تسويق', id, 'خطة', 'تم نقل بند الخطة إلى سلة المحذوفات');
  };

  const restorePlanItem = (id: string) => {
    const nowIso = new Date().toISOString();
    persistUpdate('planItems', id, {
      deleted_at: null,
      updated_at: nowIso,
      updatedAt: serverTimestamp(),
    });
    logAction('restore', 'بند خطة تسويق', id, 'خطة', 'تمت استعادة بند الخطة من سلة المحذوفات');
  };

  // Helpers
  const getCampaignMetrics = (campaignId: string) => {
    return metrics.filter(m => m.campaignId === campaignId && !m.deleted_at);
  };

  const getCampaignById = (id: string) => {
    return campaigns.find(c => c.id === id);
  };

  // Export / Import / Clear
  const exportBackupJSON = () => {
    const fullBackup = {
      version: '2.0',
      store: 'TOP STORE | توب ستور',
      slogan: 'أسواق العالم بين يديك',
      exported_at: new Date().toISOString(),
      exported_by: currentUser.name,
      campaigns,
      metrics,
      content,
      leads,
      customers,
      orders,
      expenses,
      planItems,
      auditLogs,
    };
    const blob = new Blob([JSON.stringify(fullBackup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `top_store_marketing_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    logAction('import_backup', 'نسخة احتياطية', 'sys-export', 'تصدير بيانات', 'تم تصدير نسخة احتياطية كاملة بصيغة JSON');
  };

  const importBackupJSON = async (jsonString: string): Promise<boolean> => {
    if (!firebaseUser || !workspaceId) return false;
    try {
      const data = JSON.parse(jsonString);
      if (!data || typeof data !== 'object') return false;

      const uid = firebaseUser.uid;
      const nowIso = new Date().toISOString();
      const writes: Array<{ col: string; id: string; payload: Record<string, unknown> }> = [];

      if (Array.isArray(data.campaigns)) {
        data.campaigns.forEach((raw: Record<string, unknown>) => {
          const id = sanitizeId(raw.id, 'cmp');
          writes.push({
            col: 'campaigns',
            id,
            payload: stripUndefined({
              id,
              ownerUid: uid,
              workspaceId,
              name: clampStr(raw.name, 200, 'حملة'),
              platform: pickEnum(raw.platform, PLATFORMS, 'other'),
              objective: pickEnum(raw.objective, OBJECTIVES, 'sales'),
              budget: nonNegNum(raw.budget, 0),
              startDate: clampStr(raw.startDate, 32, nowIso.split('T')[0]),
              endDate: optStr(raw.endDate, 32),
              status: pickEnum(raw.status, CAMPAIGN_STATUSES, 'active'),
              targetAudience: optStr(raw.targetAudience, 500),
              notes: optStr(raw.notes, 2000),
              created_by: clampStr(raw.created_by, 120, currentUser.name),
              created_at: clampStr(raw.created_at, 64, nowIso),
              updated_at: nowIso,
              deleted_at: optStr(raw.deleted_at, 64) ?? null,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            }),
          });
        });
      }

      if (Array.isArray(data.metrics)) {
        data.metrics.forEach((raw: Record<string, unknown>) => {
          const id = sanitizeId(raw.id, 'met');
          writes.push({
            col: 'metrics',
            id,
            payload: stripUndefined({
              id,
              ownerUid: uid,
              workspaceId,
              campaignId: sanitizeId(raw.campaignId, 'cmp'),
              date: clampStr(raw.date, 32, nowIso.split('T')[0]),
              spend: nonNegNum(raw.spend, 0),
              reach: nonNegNum(raw.reach, 0),
              impressions: nonNegNum(raw.impressions, 0),
              clicks: nonNegNum(raw.clicks, 0),
              messages: nonNegNum(raw.messages, 0),
              leads: nonNegNum(raw.leads, 0),
              newCustomers: nonNegNum(raw.newCustomers, 0),
              orders: nonNegNum(raw.orders, 0),
              revenue: nonNegNum(raw.revenue, 0),
              notes: optStr(raw.notes, 2000),
              created_by: clampStr(raw.created_by, 120, currentUser.name),
              created_at: clampStr(raw.created_at, 64, nowIso),
              updated_at: nowIso,
              deleted_at: optStr(raw.deleted_at, 64) ?? null,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            }),
          });
        });
      }

      if (Array.isArray(data.content)) {
        data.content.forEach((raw: Record<string, unknown>) => {
          const id = sanitizeId(raw.id, 'cnt');
          writes.push({
            col: 'content',
            id,
            payload: stripUndefined({
              id,
              ownerUid: uid,
              workspaceId,
              title: clampStr(raw.title, 250, 'محتوى'),
              campaignId: optStr(raw.campaignId, 128),
              platform: pickEnum(raw.platform, PLATFORMS, 'other'),
              type: pickEnum(raw.type, CONTENT_TYPES, 'other'),
              hook: typeof raw.hook === 'string' ? raw.hook.slice(0, 1000) : '',
              creator: optStr(raw.creator, 120),
              publishDate: clampStr(raw.publishDate, 32, nowIso.split('T')[0]),
              status: pickEnum(raw.status, ['draft', 'scheduled', 'published'] as const, 'published'),
              views: nonNegNum(raw.views, 0),
              reach: nonNegNum(raw.reach, 0),
              likes: nonNegNum(raw.likes, 0),
              comments: nonNegNum(raw.comments, 0),
              shares: nonNegNum(raw.shares, 0),
              saves: nonNegNum(raw.saves, 0),
              messages: nonNegNum(raw.messages, 0),
              leads: nonNegNum(raw.leads, 0),
              orders: nonNegNum(raw.orders, 0),
              revenue: nonNegNum(raw.revenue, 0),
              url: optStr(raw.url, 500),
              created_by: clampStr(raw.created_by, 120, currentUser.name),
              created_at: clampStr(raw.created_at, 64, nowIso),
              updated_at: nowIso,
              deleted_at: optStr(raw.deleted_at, 64) ?? null,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            }),
          });
        });
      }

      if (Array.isArray(data.leads)) {
        data.leads.forEach((raw: Record<string, unknown>) => {
          const id = sanitizeId(raw.id, 'lead');
          writes.push({
            col: 'leads',
            id,
            payload: stripUndefined({
              id,
              ownerUid: uid,
              workspaceId,
              name: clampStr(raw.name, 160, 'عميل محتمل'),
              phone: clampStr(raw.phone, 40, '-'),
              platform: pickEnum(raw.platform, PLATFORMS, 'other'),
              campaignId: optStr(raw.campaignId, 128),
              status: pickEnum(raw.status, LEAD_STATUSES, 'new'),
              notes: optStr(raw.notes, 2000),
              convertedCustomerId: optStr(raw.convertedCustomerId, 128),
              created_by: clampStr(raw.created_by, 120, currentUser.name),
              created_at: clampStr(raw.created_at, 64, nowIso),
              updated_at: nowIso,
              deleted_at: optStr(raw.deleted_at, 64) ?? null,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            }),
          });
        });
      }

      if (Array.isArray(data.customers)) {
        data.customers.forEach((raw: Record<string, unknown>) => {
          const id = sanitizeId(raw.id, 'cust');
          writes.push({
            col: 'customers',
            id,
            payload: stripUndefined({
              id,
              ownerUid: uid,
              workspaceId,
              name: clampStr(raw.name, 160, 'عميل'),
              phone: clampStr(raw.phone, 40, '-'),
              city: optStr(raw.city, 100),
              firstOrderDate: clampStr(raw.firstOrderDate, 32, nowIso.split('T')[0]),
              sourceCampaignId: optStr(raw.sourceCampaignId, 128),
              sourcePlatform: pickEnum(raw.sourcePlatform, PLATFORMS, 'other'),
              totalOrders: nonNegNum(raw.totalOrders, 0),
              totalSpent: nonNegNum(raw.totalSpent, 0),
              customerType: pickEnum(raw.customerType, ['new', 'returning'] as const, 'new'),
              notes: optStr(raw.notes, 2000),
              created_by: clampStr(raw.created_by, 120, currentUser.name),
              created_at: clampStr(raw.created_at, 64, nowIso),
              updated_at: nowIso,
              deleted_at: optStr(raw.deleted_at, 64) ?? null,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            }),
          });
        });
      }

      if (Array.isArray(data.orders)) {
        data.orders.forEach((raw: Record<string, unknown>) => {
          const id = sanitizeId(raw.id, 'ord');
          writes.push({
            col: 'orders',
            id,
            payload: stripUndefined({
              id,
              ownerUid: uid,
              workspaceId,
              orderNumber: clampStr(raw.orderNumber, 64, 'TOP-00000'),
              customerId: sanitizeId(raw.customerId, 'cust'),
              customerName: clampStr(raw.customerName, 160, 'عميل'),
              campaignId: optStr(raw.campaignId, 128),
              platform: pickEnum(raw.platform, PLATFORMS, 'other'),
              orderDate: clampStr(raw.orderDate, 32, nowIso.split('T')[0]),
              amount: nonNegNum(raw.amount, 0),
              cost: safeNum(raw.cost),
              profit: safeNum(raw.profit),
              status: pickEnum(raw.status, ORDER_STATUSES, 'new'),
              notes: optStr(raw.notes, 2000),
              created_by: clampStr(raw.created_by, 120, currentUser.name),
              created_at: clampStr(raw.created_at, 64, nowIso),
              updated_at: nowIso,
              deleted_at: optStr(raw.deleted_at, 64) ?? null,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            }),
          });
        });
      }

      if (Array.isArray(data.expenses)) {
        data.expenses.forEach((raw: Record<string, unknown>) => {
          const id = sanitizeId(raw.id, 'exp');
          writes.push({
            col: 'expenses',
            id,
            payload: stripUndefined({
              id,
              ownerUid: uid,
              workspaceId,
              title: clampStr(raw.title, 200, 'مصروف'),
              category: pickEnum(raw.category, EXPENSE_CATEGORIES, 'other'),
              amount: nonNegNum(raw.amount, 0),
              expenseDate: clampStr(raw.expenseDate, 32, nowIso.split('T')[0]),
              campaignId: optStr(raw.campaignId, 128),
              paymentMethod: clampStr(raw.paymentMethod, 100, 'تحويل بنكي'),
              notes: optStr(raw.notes, 2000),
              created_by: clampStr(raw.created_by, 120, currentUser.name),
              created_at: clampStr(raw.created_at, 64, nowIso),
              updated_at: nowIso,
              deleted_at: optStr(raw.deleted_at, 64) ?? null,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            }),
          });
        });
      }

      if (Array.isArray(data.planItems)) {
        data.planItems.forEach((raw: Record<string, unknown>) => {
          const id = sanitizeId(raw.id, 'plan');
          writes.push({
            col: 'planItems',
            id,
            payload: stripUndefined({
              id,
              ownerUid: uid,
              workspaceId,
              date: clampStr(raw.date, 32, nowIso.split('T')[0]),
              time: optStr(raw.time, 16),
              title: clampStr(raw.title, 250, 'مهمة'),
              platform: pickEnum(raw.platform, PLATFORMS, 'other'),
              campaignId: optStr(raw.campaignId, 128),
              hook: typeof raw.hook === 'string' ? raw.hook.slice(0, 1000) : '',
              contentType: pickEnum(raw.contentType, CONTENT_TYPES, 'other'),
              assignedTo: clampStr(raw.assignedTo, 120, 'فريق التسويق'),
              status: pickEnum(raw.status, PLAN_STATUSES, 'idea'),
              priority: raw.priority ? pickEnum(raw.priority, PLAN_PRIORITIES, 'medium') : undefined,
              targetGoal: optStr(raw.targetGoal, 250),
              notes: optStr(raw.notes, 2000),
              created_by: clampStr(raw.created_by, 120, currentUser.name),
              created_at: clampStr(raw.created_at, 64, nowIso),
              updated_at: nowIso,
              deleted_at: optStr(raw.deleted_at, 64) ?? null,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            }),
          });
        });
      }

      // Commit in Firestore batches of 400
      for (let i = 0; i < writes.length; i += 400) {
        const batch = writeBatch(db);
        const chunk = writes.slice(i, i + 400);
        chunk.forEach(item => {
          batch.set(doc(db, 'workspaces', workspaceId, item.col, item.id), item.payload);
        });
        await batch.commit();
      }

      logAction(
        'import_backup',
        'نسخة احتياطية',
        'sys-import',
        'استيراد بيانات',
        `تم استيراد نسخة احتياطية (${writes.length} سجل) ومزامنتها سحابياً بنجاح`
      );
      return true;
    } catch (err) {
      reportFirestoreError(err, OperationType.WRITE, `workspaces/${workspaceId}`);
      return false;
    }
  };

  const clearAllWorkspaceData = async () => {
    if (!firebaseUser || !workspaceId) return;
    const uid = firebaseUser.uid;
    const collectionsToClear = [
      'campaigns',
      'metrics',
      'content',
      'leads',
      'customers',
      'orders',
      'expenses',
      'planItems',
    ];
    try {
      for (const colName of collectionsToClear) {
        const path = `workspaces/${workspaceId}/${colName}`;
        const q = query(collection(db, 'workspaces', workspaceId, colName), where('ownerUid', '==', uid));
        const snap = await getDocs(q);
        for (const docSnap of snap.docs) {
          try {
            await deleteDoc(docSnap.ref);
          } catch (err) {
            reportFirestoreError(err, OperationType.DELETE, `${path}/${docSnap.id}`);
            return;
          }
        }
      }
      logAction('soft_delete', 'النظام', 'sys-clear', 'تصفير السجلات', 'تم مسح جميع السجلات السحابية للبدء من جديد');
    } catch (err) {
      reportFirestoreError(err, OperationType.DELETE, `workspaces/${workspaceId}`);
    }
  };

  if (fatalError) {
    throw fatalError;
  }

  return (
    <AppContext.Provider
      value={{
        firebaseUser,
        authLoading,
        authError,
        signingIn,
        signInWithGoogle,
        signInWithRedirectFallback,
        logoutUser,
        syncStatus,
        workspaceId,

        currentUser,
        canEdit,
        canDelete,
        isAdmin,

        campaigns,
        addCampaign,
        updateCampaign,
        softDeleteCampaign,
        restoreCampaign,

        metrics,
        addDailyMetric,
        updateDailyMetric,
        softDeleteMetric,
        restoreMetric,

        content,
        addContent,
        updateContent,
        softDeleteContent,
        restoreContent,

        leads,
        addLead,
        updateLead,
        softDeleteLead,
        restoreLead,
        convertLeadToCustomer,

        customers,
        addCustomer,
        updateCustomer,
        softDeleteCustomer,
        restoreCustomer,

        orders,
        addOrder,
        updateOrder,
        softDeleteOrder,
        restoreOrder,

        expenses,
        addExpense,
        updateExpense,
        softDeleteExpense,
        restoreExpense,

        planItems,
        addPlanItem,
        updatePlanItem,
        softDeletePlanItem,
        restorePlanItem,

        auditLogs,
        logAction,

        exportBackupJSON,
        importBackupJSON,
        clearAllWorkspaceData,

        getCampaignMetrics,
        getCampaignById,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
