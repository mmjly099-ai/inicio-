import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar, PageId } from './components/Sidebar';
import { QuickDataEntryModal, QuickEntryTab } from './components/QuickDataEntryModal';
import { OfflineIndicator } from './components/OfflineIndicator';

// Views
import { DashboardView } from './views/DashboardView';
import { CampaignsView } from './views/CampaignsView';
import { ContentView } from './views/ContentView';
import { LeadsView } from './views/LeadsView';
import { CustomersView } from './views/CustomersView';
import { OrdersView } from './views/OrdersView';
import { ExpensesView } from './views/ExpensesView';
import { PlanView } from './views/PlanView';
import { AnalyticsView } from './views/AnalyticsView';
import { AuditView } from './views/AuditView';
import { SettingsView } from './views/SettingsView';

const MainLayout: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Quick Data Entry Modal state
  const [quickEntryOpen, setQuickEntryOpen] = useState(false);
  const [quickEntryTab, setQuickEntryTab] = useState<QuickEntryTab>('daily_metric');
  const [preselectedCampaignId, setPreselectedCampaignId] = useState<string | undefined>(undefined);

  const handleOpenQuickEntry = (tab: QuickEntryTab = 'daily_metric', campaignId?: string) => {
    setQuickEntryTab(tab);
    setPreselectedCampaignId(campaignId);
    setQuickEntryOpen(true);
  };

  const renderActiveView = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <DashboardView
            onNavigate={setCurrentPage}
            onOpenQuickEntry={handleOpenQuickEntry}
          />
        );
      case 'campaigns':
        return (
          <CampaignsView
            onOpenQuickEntry={handleOpenQuickEntry}
          />
        );
      case 'content':
        return (
          <ContentView
            onOpenQuickEntry={handleOpenQuickEntry}
          />
        );
      case 'leads':
        return (
          <LeadsView
            onOpenQuickEntry={handleOpenQuickEntry}
          />
        );
      case 'customers':
        return (
          <CustomersView
            onOpenQuickEntry={handleOpenQuickEntry}
          />
        );
      case 'orders':
        return (
          <OrdersView
            onOpenQuickEntry={handleOpenQuickEntry}
          />
        );
      case 'expenses':
        return (
          <ExpensesView
            onOpenQuickEntry={handleOpenQuickEntry}
          />
        );
      case 'plan':
        return (
          <PlanView
            onOpenQuickEntry={handleOpenQuickEntry}
          />
        );
      case 'analytics':
        return <AnalyticsView />;
      case 'audit':
        return <AuditView />;
      case 'settings':
        return <SettingsView />;
      default:
        return (
          <DashboardView
            onNavigate={setCurrentPage}
            onOpenQuickEntry={handleOpenQuickEntry}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-['Cairo',sans-serif] antialiased selection:bg-blue-600 selection:text-white flex flex-col">
      {/* Top Navbar */}
      <Navbar
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenQuickEntry={() => handleOpenQuickEntry('daily_metric')}
      />

      {/* App Body: Sidebar + Main Content */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Right Navigation Sidebar */}
        <Sidebar
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          isOpen={isSidebarOpen}
          onCloseMobile={() => setIsSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main
          id="main-content-view"
          className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 transition-all overflow-y-auto"
        >
          {renderActiveView()}
        </main>
      </div>

      {/* Global Quick Data Entry Modal */}
      <QuickDataEntryModal
        isOpen={quickEntryOpen}
        initialTab={quickEntryTab}
        preselectedCampaignId={preselectedCampaignId}
        onClose={() => setQuickEntryOpen(false)}
      />

      {/* Offline Status Indicator */}
      <OfflineIndicator />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
