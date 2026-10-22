// Types for TOP STORE Marketing Analytics System

export type UserRole = 'admin' | 'marketer' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export type Platform =
  | 'instagram'
  | 'facebook'
  | 'tiktok'
  | 'whatsapp'
  | 'snapchat'
  | 'google'
  | 'other';

export type CampaignObjective =
  | 'awareness'      // وعي
  | 'messages'       // رسائل
  | 'leads'          // عملاء محتملين
  | 'sales'          // مبيعات
  | 'retargeting';   // إعادة استهداف

export type CampaignStatus =
  | 'active'         // نشطة
  | 'paused'         // متوقفة
  | 'completed'      // مكتملة
  | 'draft';         // مسودة

export interface Campaign {
  id: string;
  name: string;
  platform: Platform;
  objective: CampaignObjective;
  budget: number;          // الميزانية المحددة
  startDate: string;       // YYYY-MM-DD
  endDate?: string;        // YYYY-MM-DD
  status: CampaignStatus;
  targetAudience?: string; // الجمهور المستهدف
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  deleted_at?: string | null;
}

export interface DailyCampaignMetric {
  id: string;
  campaignId: string;
  date: string;            // YYYY-MM-DD
  spend: number;           // الصرف اليومي
  reach: number;           // الوصول
  impressions: number;     // مرات الظهور
  clicks: number;          // النقرات
  messages: number;        // الرسائل المستلمة
  leads: number;           // العملاء المحتملون
  newCustomers: number;    // عملاء جدد
  orders: number;          // الطلبات
  revenue: number;         // قيمة المبيعات الناتجة
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  deleted_at?: string | null;
}

export type ContentType =
  | 'reel'
  | 'story'
  | 'post'
  | 'carousel'
  | 'video'
  | 'other';

export interface ContentItem {
  id: string;
  title: string;
  campaignId?: string;
  platform: Platform;
  type: ContentType;
  hook: string;            // زاوية الإعلان أو الخطاف
  creator?: string;        // صانع المحتوى / المصمم
  publishDate: string;     // YYYY-MM-DD
  status: 'draft' | 'scheduled' | 'published';
  // Metrics:
  views: number;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  messages: number;
  leads: number;
  orders: number;
  revenue: number;
  url?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  deleted_at?: string | null;
}

export type LeadStatus =
  | 'new'           // جديد
  | 'contacted'     // تم التواصل
  | 'qualified'     // مؤهل
  | 'opportunity'   // فرصة
  | 'won'           // مغلق ناجح
  | 'lost';         // خاسر

export interface Lead {
  id: string;
  name: string;
  phone: string;
  platform: Platform;
  campaignId?: string;
  status: LeadStatus;
  notes?: string;
  convertedCustomerId?: string; // إذا تم تحويله لعميل
  created_at: string;
  updated_at: string;
  created_by: string;
  deleted_at?: string | null;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  city?: string;
  firstOrderDate: string;
  sourceCampaignId?: string;
  sourcePlatform: Platform;
  totalOrders: number;
  totalSpent: number;
  customerType: 'new' | 'returning';
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  deleted_at?: string | null;
}

export type OrderStatus =
  | 'new'           // جديد
  | 'processing'    // قيد التنفيذ
  | 'delivered'     // تم التوصيل
  | 'returned';     // مرتجع

export interface MarketingOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  campaignId?: string;
  platform: Platform;
  orderDate: string;
  amount: number;          // قيمة الطلب
  cost?: number;            // تكلفة البضاعة أو الشحن
  profit?: number;          // الربح المحقق
  status: OrderStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  deleted_at?: string | null;
}

export type ExpenseCategory =
  | 'paid_ads'         // إعلانات ممولة
  | 'content_design'   // صناعة محتوى وتصميم
  | 'tools_software'   // أدوات واشتراكات
  | 'influencers'      // مؤثرين ورعايات
  | 'other';           // أخرى

export interface MarketingExpense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  expenseDate: string;
  campaignId?: string;
  paymentMethod: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  deleted_at?: string | null;
}

export type PlanItemStatus =
  | 'idea'          // فكرة
  | 'in_progress'   // قيد الإعداد
  | 'ready'         // جاهز للنشر
  | 'published';    // تم النشر

export interface MarketingPlanItem {
  id: string;
  date: string;            // YYYY-MM-DD
  title: string;
  platform: Platform;
  campaignId?: string;
  hook: string;            // الخطاف الإعلاني
  contentType: ContentType;
  assignedTo: string;      // المسؤول
  status: PlanItemStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  deleted_at?: string | null;
}

export type AuditAction =
  | 'create'
  | 'update'
  | 'soft_delete'
  | 'restore'
  | 'convert_lead'
  | 'toggle_demo'
  | 'import_backup';

export interface AuditLog {
  id: string;
  userName: string;
  userRole: UserRole;
  action: AuditAction;
  targetType: string;      // 'حملة', 'محتوى', 'عميل محتمل', 'مصروف', إلخ
  targetId: string;
  targetTitle: string;
  details: string;         // مثل: "تم تعديل مصروف الحملة من 3000 إلى 3500 ر.س"
  timestamp: string;
}

export type EvaluationScore = 'excellent' | 'needs_improvement' | 'critical_review';

export interface SmartEvaluation {
  score: EvaluationScore;
  label: string;
  color: string;
  reason: string;
  actionRecommendation: string;
}
