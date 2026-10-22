import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
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
} from '../types';
import {
  INITIAL_USERS,
  DEMO_CAMPAIGNS,
  DEMO_METRICS,
  DEMO_CONTENT,
  DEMO_LEADS,
  DEMO_CUSTOMERS,
  DEMO_ORDERS,
  DEMO_EXPENSES,
  DEMO_PLAN_ITEMS,
  DEMO_AUDIT_LOGS,
} from '../data/mockData';

interface AppContextType {
  // Current user & Auth
  currentUser: User;
  users: User[];
  switchUserRole: (role: UserRole) => void;
  canEdit: boolean;      // Admin or Marketer
  canDelete: boolean;    // Admin only
  isAdmin: boolean;

  // Demo mode
  isDemoMode: boolean;
  loadDemoData: () => void;
  clearToEmptyData: () => void;

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

  // Backup & Restore
  exportBackupJSON: () => void;
  importBackupJSON: (jsonString: string) => boolean;

  // Helper getters
  getCampaignMetrics: (campaignId: string) => DailyCampaignMetric[];
  getCampaignById: (id: string) => Campaign | undefined;
}

const STORAGE_KEY = 'top_store_marketing_v1';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]); // Default admin
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);

  // States with default demo data
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_campaigns`);
    return saved ? JSON.parse(saved) : DEMO_CAMPAIGNS;
  });

  const [metrics, setMetrics] = useState<DailyCampaignMetric[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_metrics`);
    return saved ? JSON.parse(saved) : DEMO_METRICS;
  });

  const [content, setContent] = useState<ContentItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_content`);
    return saved ? JSON.parse(saved) : DEMO_CONTENT;
  });

  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_leads`);
    return saved ? JSON.parse(saved) : DEMO_LEADS;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_customers`);
    return saved ? JSON.parse(saved) : DEMO_CUSTOMERS;
  });

  const [orders, setOrders] = useState<MarketingOrder[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_orders`);
    return saved ? JSON.parse(saved) : DEMO_ORDERS;
  });

  const [expenses, setExpenses] = useState<MarketingExpense[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_expenses`);
    return saved ? JSON.parse(saved) : DEMO_EXPENSES;
  });

  const [planItems, setPlanItems] = useState<MarketingPlanItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_planItems`);
    return saved ? JSON.parse(saved) : DEMO_PLAN_ITEMS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_auditLogs`);
    return saved ? JSON.parse(saved) : DEMO_AUDIT_LOGS;
  });

  // Persist to local storage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_campaigns`, JSON.stringify(campaigns));
    localStorage.setItem(`${STORAGE_KEY}_metrics`, JSON.stringify(metrics));
    localStorage.setItem(`${STORAGE_KEY}_content`, JSON.stringify(content));
    localStorage.setItem(`${STORAGE_KEY}_leads`, JSON.stringify(leads));
    localStorage.setItem(`${STORAGE_KEY}_customers`, JSON.stringify(customers));
    localStorage.setItem(`${STORAGE_KEY}_orders`, JSON.stringify(orders));
    localStorage.setItem(`${STORAGE_KEY}_expenses`, JSON.stringify(expenses));
    localStorage.setItem(`${STORAGE_KEY}_planItems`, JSON.stringify(planItems));
    localStorage.setItem(`${STORAGE_KEY}_auditLogs`, JSON.stringify(auditLogs));
  }, [campaigns, metrics, content, leads, customers, orders, expenses, planItems, auditLogs]);

  // Permissions
  const isAdmin = currentUser.role === 'admin';
  const canEdit = currentUser.role === 'admin' || currentUser.role === 'marketer';
  const canDelete = currentUser.role === 'admin';

  const switchUserRole = (role: UserRole) => {
    const found = users.find(u => u.role === role);
    if (found) {
      setCurrentUser(found);
      logAction('update', 'مستخدم', found.id, found.name, `تم تغيير المستخدم النشط إلى ${found.name} بصلاحية ${role === 'admin' ? 'مسؤول' : role === 'marketer' ? 'مسوق' : 'مشاهد'}`);
    }
  };

  const logAction = (
    action: AuditLog['action'],
    targetType: string,
    targetId: string,
    targetTitle: string,
    details: string
  ) => {
    const newLog: AuditLog = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      targetType,
      targetId,
      targetTitle,
      details,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Demo data loader / clearer
  const loadDemoData = () => {
    setCampaigns(DEMO_CAMPAIGNS);
    setMetrics(DEMO_METRICS);
    setContent(DEMO_CONTENT);
    setLeads(DEMO_LEADS);
    setCustomers(DEMO_CUSTOMERS);
    setOrders(DEMO_ORDERS);
    setExpenses(DEMO_EXPENSES);
    setPlanItems(DEMO_PLAN_ITEMS);
    setAuditLogs(DEMO_AUDIT_LOGS);
    setIsDemoMode(true);
    logAction('toggle_demo', 'النظام', 'sys-demo', 'الوضع التجريبي', 'تم تفعيل وتحميل البيانات التجريبية لمتجر توب ستور');
  };

  const clearToEmptyData = () => {
    setCampaigns([]);
    setMetrics([]);
    setContent([]);
    setLeads([]);
    setCustomers([]);
    setOrders([]);
    setExpenses([]);
    setPlanItems([]);
    setIsDemoMode(false);
    logAction('toggle_demo', 'النظام', 'sys-clean', 'تفريغ البيانات', 'تم تفريغ النظام لبدء الإدخال اليدوي الفعلي الجديد');
  };

  // 1. CAMPAIGNS CRUD (with Soft Delete)
  const addCampaign = (campaignData: Omit<Campaign, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'deleted_at'>) => {
    const newCampaign: Campaign = {
      ...campaignData,
      id: `cmp-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: currentUser.name,
      deleted_at: null,
    };
    setCampaigns(prev => [newCampaign, ...prev]);
    logAction('create', 'حملة إعلانية', newCampaign.id, newCampaign.name, `تمت إضافة حملة جديدة "${newCampaign.name}" بميزانية ${newCampaign.budget} ر.س`);
    return newCampaign;
  };

  const updateCampaign = (id: string, updates: Partial<Campaign>) => {
    setCampaigns(prev =>
      prev.map(c => {
        if (c.id === id) {
          const updated = { ...c, ...updates, updated_at: new Date().toISOString() };
          logAction('update', 'حملة إعلانية', c.id, c.name, `تم تعديل بيانات الحملة "${c.name}"`);
          return updated;
        }
        return c;
      })
    );
  };

  const softDeleteCampaign = (id: string) => {
    setCampaigns(prev =>
      prev.map(c => {
        if (c.id === id) {
          logAction('soft_delete', 'حملة إعلانية', c.id, c.name, `تم نقل الحملة "${c.name}" إلى سلة المحذوفات (حذف ناعم)`);
          return { ...c, deleted_at: new Date().toISOString() };
        }
        return c;
      })
    );
  };

  const restoreCampaign = (id: string) => {
    setCampaigns(prev =>
      prev.map(c => {
        if (c.id === id) {
          logAction('restore', 'حملة إعلانية', c.id, c.name, `تمت استعادة الحملة "${c.name}" من سلة المحذوفات`);
          return { ...c, deleted_at: null, updated_at: new Date().toISOString() };
        }
        return c;
      })
    );
  };

  // 2. DAILY METRICS CRUD
  const addDailyMetric = (metricData: Omit<DailyCampaignMetric, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'deleted_at'>) => {
    const newMetric: DailyCampaignMetric = {
      ...metricData,
      id: `met-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: currentUser.name,
      deleted_at: null,
    };
    setMetrics(prev => [newMetric, ...prev]);
    const campaign = campaigns.find(c => c.id === metricData.campaignId);
    logAction(
      'create',
      'مقياس يومي للحملة',
      newMetric.id,
      campaign?.name || 'حملة',
      `تم تسجيل أداء يومي بتاريخ ${newMetric.date}: صرف ${newMetric.spend} ر.س ومبيعات ${newMetric.revenue} ر.س`
    );
    return newMetric;
  };

  const updateDailyMetric = (id: string, updates: Partial<DailyCampaignMetric>) => {
    setMetrics(prev =>
      prev.map(m => {
        if (m.id === id) {
          const updated = { ...m, ...updates, updated_at: new Date().toISOString() };
          logAction('update', 'مقياس يومي للحملة', m.id, `تاريخ ${m.date}`, `تم تعديل بيانات الأداء اليومي ليوم ${m.date}`);
          return updated;
        }
        return m;
      })
    );
  };

  const softDeleteMetric = (id: string) => {
    setMetrics(prev =>
      prev.map(m => (m.id === id ? { ...m, deleted_at: new Date().toISOString() } : m))
    );
    logAction('soft_delete', 'مقياس يومي', id, 'سجل أداء', 'تم نقل المقياس اليومي لسلة المحذوفات');
  };

  const restoreMetric = (id: string) => {
    setMetrics(prev =>
      prev.map(m => (m.id === id ? { ...m, deleted_at: null, updated_at: new Date().toISOString() } : m))
    );
    logAction('restore', 'مقياس يومي', id, 'سجل أداء', 'تمت استعادة المقياس اليومي من سلة المحذوفات');
  };

  // 3. CONTENT CRUD
  const addContent = (itemData: Omit<ContentItem, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'deleted_at'>) => {
    const newItem: ContentItem = {
      ...itemData,
      id: `cnt-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: currentUser.name,
      deleted_at: null,
    };
    setContent(prev => [newItem, ...prev]);
    logAction('create', 'محتوى إعلاني', newItem.id, newItem.title, `تمت إضافة قطعة محتوى جديدة: "${newItem.title}"`);
    return newItem;
  };

  const updateContent = (id: string, updates: Partial<ContentItem>) => {
    setContent(prev =>
      prev.map(c => {
        if (c.id === id) {
          const updated = { ...c, ...updates, updated_at: new Date().toISOString() };
          logAction('update', 'محتوى إعلاني', c.id, c.title, `تم تعديل مقاييس أو تفاصيل المحتوى: "${c.title}"`);
          return updated;
        }
        return c;
      })
    );
  };

  const softDeleteContent = (id: string) => {
    setContent(prev =>
      prev.map(c => {
        if (c.id === id) {
          logAction('soft_delete', 'محتوى إعلاني', c.id, c.title, `تم نقل المحتوى "${c.title}" إلى سلة المحذوفات`);
          return { ...c, deleted_at: new Date().toISOString() };
        }
        return c;
      })
    );
  };

  const restoreContent = (id: string) => {
    setContent(prev =>
      prev.map(c => {
        if (c.id === id) {
          logAction('restore', 'محتوى إعلاني', c.id, c.title, `تمت استعادة المحتوى "${c.title}"`);
          return { ...c, deleted_at: null, updated_at: new Date().toISOString() };
        }
        return c;
      })
    );
  };

  // 4. LEADS CRUD & CONVERT
  const addLead = (leadData: Omit<Lead, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'deleted_at'>) => {
    const newLead: Lead = {
      ...leadData,
      id: `lead-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: currentUser.name,
      deleted_at: null,
    };
    setLeads(prev => [newLead, ...prev]);
    logAction('create', 'عميل محتمل', newLead.id, newLead.name, `تم تسجيل عميل محتمل جديد: ${newLead.name} (${newLead.phone})`);
    return newLead;
  };

  const updateLead = (id: string, updates: Partial<Lead>) => {
    setLeads(prev =>
      prev.map(l => {
        if (l.id === id) {
          const updated = { ...l, ...updates, updated_at: new Date().toISOString() };
          logAction('update', 'عميل محتمل', l.id, l.name, `تم تحديث حالة العميل المحتمل ${l.name}`);
          return updated;
        }
        return l;
      })
    );
  };

  const softDeleteLead = (id: string) => {
    setLeads(prev =>
      prev.map(l => (l.id === id ? { ...l, deleted_at: new Date().toISOString() } : l))
    );
    logAction('soft_delete', 'عميل محتمل', id, 'عميل', 'تم نقل العميل المحتمل إلى سلة المحذوفات');
  };

  const restoreLead = (id: string) => {
    setLeads(prev =>
      prev.map(l => (l.id === id ? { ...l, deleted_at: null, updated_at: new Date().toISOString() } : l))
    );
    logAction('restore', 'عميل محتمل', id, 'عميل', 'تمت استعادة العميل المحتمل من سلة المحذوفات');
  };

  const convertLeadToCustomer = (
    leadId: string,
    customerData: { city?: string; initialOrderAmount?: number; orderNotes?: string }
  ) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) throw new Error('العميل المحتمل غير موجود');

    // 1. Create or link customer
    const newCustId = `cust-${Date.now()}`;
    const initialAmount = customerData.initialOrderAmount || 0;
    const newCustomer: Customer = {
      id: newCustId,
      name: lead.name,
      phone: lead.phone,
      city: customerData.city || 'الرياض',
      firstOrderDate: new Date().toISOString().split('T')[0],
      sourceCampaignId: lead.campaignId,
      sourcePlatform: lead.platform,
      totalOrders: initialAmount > 0 ? 1 : 0,
      totalSpent: initialAmount,
      customerType: 'new',
      notes: lead.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: currentUser.name,
      deleted_at: null,
    };
    setCustomers(prev => [newCustomer, ...prev]);

    // 2. Mark lead as won
    setLeads(prev =>
      prev.map(l =>
        l.id === leadId
          ? {
              ...l,
              status: 'won',
              convertedCustomerId: newCustId,
              updated_at: new Date().toISOString(),
            }
          : l
      )
    );

    // 3. If initial order amount provided, create marketing order
    let newOrder: MarketingOrder | undefined;
    if (initialAmount > 0) {
      newOrder = {
        id: `ord-${Date.now()}`,
        orderNumber: `TOP-${Math.floor(10000 + Math.random() * 90000)}`,
        customerId: newCustId,
        customerName: lead.name,
        campaignId: lead.campaignId,
        platform: lead.platform,
        orderDate: new Date().toISOString().split('T')[0],
        amount: initialAmount,
        profit: Math.round(initialAmount * 0.4), // 40% estimated gross margin
        status: 'new',
        notes: customerData.orderNotes || 'طلب تم إنشاؤه عند تحويل العميل المحتمل',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: currentUser.name,
        deleted_at: null,
      };
      setOrders(prev => [newOrder!, ...prev]);
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
  const addCustomer = (custData: Omit<Customer, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'deleted_at'>) => {
    const newCust: Customer = {
      ...custData,
      id: `cust-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: currentUser.name,
      deleted_at: null,
    };
    setCustomers(prev => [newCust, ...prev]);
    logAction('create', 'عميل فعلي', newCust.id, newCust.name, `تمت إضافة عميل جديد: ${newCust.name}`);
    return newCust;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers(prev =>
      prev.map(c => (c.id === id ? { ...c, ...updates, updated_at: new Date().toISOString() } : c))
    );
  };

  const softDeleteCustomer = (id: string) => {
    setCustomers(prev =>
      prev.map(c => (c.id === id ? { ...c, deleted_at: new Date().toISOString() } : c))
    );
    logAction('soft_delete', 'عميل', id, 'عميل', 'تم نقل العميل إلى سلة المحذوفات');
  };

  const restoreCustomer = (id: string) => {
    setCustomers(prev =>
      prev.map(c => (c.id === id ? { ...c, deleted_at: null, updated_at: new Date().toISOString() } : c))
    );
    logAction('restore', 'عميل', id, 'عميل', 'تمت استعادة العميل من سلة المحذوفات');
  };

  // 6. ORDERS CRUD
  const addOrder = (orderData: Omit<MarketingOrder, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'deleted_at'>) => {
    const newOrder: MarketingOrder = {
      ...orderData,
      id: `ord-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: currentUser.name,
      deleted_at: null,
    };
    setOrders(prev => [newOrder, ...prev]);

    // Automatically update customer totals
    setCustomers(prev =>
      prev.map(c => {
        if (c.id === orderData.customerId) {
          return {
            ...c,
            totalOrders: (c.totalOrders || 0) + 1,
            totalSpent: (c.totalSpent || 0) + orderData.amount,
            customerType: 'returning',
            updated_at: new Date().toISOString(),
          };
        }
        return c;
      })
    );

    logAction('create', 'طلب تسويق', newOrder.id, newOrder.orderNumber, `تم تسجيل طلب شراء ${newOrder.orderNumber} للعميل ${newOrder.customerName} بقيمة ${newOrder.amount} ر.س`);
    return newOrder;
  };

  const updateOrder = (id: string, updates: Partial<MarketingOrder>) => {
    setOrders(prev =>
      prev.map(o => (o.id === id ? { ...o, ...updates, updated_at: new Date().toISOString() } : o))
    );
  };

  const softDeleteOrder = (id: string) => {
    setOrders(prev =>
      prev.map(o => (o.id === id ? { ...o, deleted_at: new Date().toISOString() } : o))
    );
    logAction('soft_delete', 'طلب تسويق', id, 'طلب', 'تم نقل الطلب إلى سلة المحذوفات');
  };

  const restoreOrder = (id: string) => {
    setOrders(prev =>
      prev.map(o => (o.id === id ? { ...o, deleted_at: null, updated_at: new Date().toISOString() } : o))
    );
    logAction('restore', 'طلب تسويق', id, 'طلب', 'تمت استعادة الطلب من سلة المحذوفات');
  };

  // 7. EXPENSES CRUD
  const addExpense = (expData: Omit<MarketingExpense, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'deleted_at'>) => {
    const newExp: MarketingExpense = {
      ...expData,
      id: `exp-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: currentUser.name,
      deleted_at: null,
    };
    setExpenses(prev => [newExp, ...prev]);
    logAction('create', 'مصروف تسويقي', newExp.id, newExp.title, `تم تسجيل مصروف جديد: ${newExp.title} بمبلغ ${newExp.amount} ر.س`);
    return newExp;
  };

  const updateExpense = (id: string, updates: Partial<MarketingExpense>) => {
    setExpenses(prev =>
      prev.map(e => (e.id === id ? { ...e, ...updates, updated_at: new Date().toISOString() } : e))
    );
  };

  const softDeleteExpense = (id: string) => {
    setExpenses(prev =>
      prev.map(e => (e.id === id ? { ...e, deleted_at: new Date().toISOString() } : e))
    );
    logAction('soft_delete', 'مصروف تسويقي', id, 'مصروف', 'تم نقل المصروف إلى سلة المحذوفات');
  };

  const restoreExpense = (id: string) => {
    setExpenses(prev =>
      prev.map(e => (e.id === id ? { ...e, deleted_at: null, updated_at: new Date().toISOString() } : e))
    );
    logAction('restore', 'مصروف تسويقي', id, 'مصروف', 'تمت استعادة المصروف من سلة المحذوفات');
  };

  // 8. MARKETING PLAN CRUD
  const addPlanItem = (itemData: Omit<MarketingPlanItem, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'deleted_at'>) => {
    const newItem: MarketingPlanItem = {
      ...itemData,
      id: `plan-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: currentUser.name,
      deleted_at: null,
    };
    setPlanItems(prev => [newItem, ...prev]);
    logAction('create', 'بند خطة تسويق', newItem.id, newItem.title, `تمت إضافة بند خطة تسويقية: "${newItem.title}" بتاريخ ${newItem.date}`);
    return newItem;
  };

  const updatePlanItem = (id: string, updates: Partial<MarketingPlanItem>) => {
    setPlanItems(prev =>
      prev.map(p => (p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p))
    );
  };

  const softDeletePlanItem = (id: string) => {
    setPlanItems(prev =>
      prev.map(p => (p.id === id ? { ...p, deleted_at: new Date().toISOString() } : p))
    );
    logAction('soft_delete', 'بند خطة تسويق', id, 'خطة', 'تم نقل بند الخطة إلى سلة المحذوفات');
  };

  const restorePlanItem = (id: string) => {
    setPlanItems(prev =>
      prev.map(p => (p.id === id ? { ...p, deleted_at: null, updated_at: new Date().toISOString() } : p))
    );
    logAction('restore', 'بند خطة تسويق', id, 'خطة', 'تمت استعادة بند الخطة من سلة المحذوفات');
  };

  // Helpers
  const getCampaignMetrics = (campaignId: string) => {
    return metrics.filter(m => m.campaignId === campaignId && !m.deleted_at);
  };

  const getCampaignById = (id: string) => {
    return campaigns.find(c => c.id === id);
  };

  // Export / Import
  const exportBackupJSON = () => {
    const fullBackup = {
      version: '1.0',
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

  const importBackupJSON = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.campaigns) setCampaigns(data.campaigns);
      if (data.metrics) setMetrics(data.metrics);
      if (data.content) setContent(data.content);
      if (data.leads) setLeads(data.leads);
      if (data.customers) setCustomers(data.customers);
      if (data.orders) setOrders(data.orders);
      if (data.expenses) setExpenses(data.expenses);
      if (data.planItems) setPlanItems(data.planItems);
      if (data.auditLogs) setAuditLogs(data.auditLogs);
      logAction('import_backup', 'نسخة احتياطية', 'sys-import', 'استيراد بيانات', 'تم استيراد نسخة احتياطية كاملة وتطبيقها بنجاح');
      return true;
    } catch (err) {
      console.error('Failed to import backup', err);
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        switchUserRole,
        canEdit,
        canDelete,
        isAdmin,

        isDemoMode,
        loadDemoData,
        clearToEmptyData,

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
