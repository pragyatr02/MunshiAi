import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BackendStatusBar } from './components/common/BackendStatusBar';
import { Navbar, PageId } from './components/layout/Navbar';
import { LandingPage } from './components/pages/LandingPage';
import { LoginPage } from './components/pages/LoginPage';
import { RegisterPage } from './components/pages/RegisterPage';
import { DashboardPage } from './components/pages/DashboardPage';
import { VoicePage } from './components/pages/VoicePage';
import { TransactionsPage } from './components/pages/TransactionsPage';
import { CustomersPage } from './components/pages/CustomersPage';
import { CustomerDetailPage } from './components/pages/CustomerDetailPage';
import { InventoryPage } from './components/pages/InventoryPage';
import { AskMunshiPage } from './components/pages/AskMunshiPage';
import { LoadingSpinner } from './components/common/LoadingSpinner';

const MainApp: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState<PageId>('landing');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | number | null>(null);
  const [preloadedVoiceCustomer, setPreloadedVoiceCustomer] = useState<string>('');

  const handleNavigate = (page: PageId) => {
    // If navigating to customer-detail without an id, default to customers
    if (page === 'customer-detail' && !selectedCustomerId) {
      setCurrentPage('customers');
      return;
    }

    // If page requires auth and not authenticated, route to login
    const protectedPages: PageId[] = ['dashboard', 'transactions', 'customers', 'customer-detail', 'inventory'];
    if (protectedPages.includes(page) && !isAuthenticated) {
      setCurrentPage('login');
      return;
    }

    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <LoadingSpinner message="Connecting to FastAPI backend..." size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col font-sans text-[#2D2320]">
      {/* FastAPI backend status bar */}
      <BackendStatusBar />

      {/* Unified Stitch Navbar across all 10 pages */}
      <Navbar currentPage={currentPage} onNavigate={handleNavigate} />

      {/* Main Page Canvas */}
      <main className="flex-1 pb-16">
        {/* Page 1: Landing / Philosophy */}
        {currentPage === 'landing' && <LandingPage onNavigate={handleNavigate} />}

        {/* Page 2: Login */}
        {currentPage === 'login' && <LoginPage onNavigate={handleNavigate} />}

        {/* Page 3: Register */}
        {currentPage === 'register' && <RegisterPage onNavigate={handleNavigate} />}

        {/* Page 4: Dashboard */}
        {currentPage === 'dashboard' && <DashboardPage onNavigate={handleNavigate} />}

        {/* Page 5: Voice Transaction */}
        {currentPage === 'voice' && (
          <VoicePage
            onNavigate={handleNavigate}
            preloadedCustomerName={preloadedVoiceCustomer}
          />
        )}

        {/* Page 6: Transactions */}
        {currentPage === 'transactions' && <TransactionsPage />}

        {/* Page 7: Customers */}
        {currentPage === 'customers' && (
          <CustomersPage
            onNavigate={handleNavigate}
            onSelectCustomer={(id) => {
              setSelectedCustomerId(id);
              setCurrentPage('customer-detail');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* Page 8: Customer Detail */}
        {currentPage === 'customer-detail' && (
          <CustomerDetailPage
            customerId={selectedCustomerId}
            onNavigate={handleNavigate}
            onPreloadVoiceForCustomer={(name) => {
              setPreloadedVoiceCustomer(name);
              setCurrentPage('voice');
            }}
          />
        )}

        {/* Page 9: Inventory */}
        {currentPage === 'inventory' && <InventoryPage />}

        {/* Page 10: Ask MunshiAI */}
        {currentPage === 'query' && <AskMunshiPage />}
      </main>

      {/* Warm, unobtrusive editorial footer */}
      <footer className="border-t border-[#EDE4D8] bg-[#F7F2EB] py-8 text-center text-xs text-[#8C7A74]">
        <div className="max-w-4xl mx-auto px-4 space-y-1.5">
          <p className="font-serif-editorial text-lg font-bold text-[#3B2B27]">
            MunshiAI &bull; Bahi Khata
          </p>
          <p className="text-[11px]">
            &ldquo;AI interprets. Business logic validates. Database stores the truth.&rdquo;
          </p>
          <p className="text-[10px] text-[#A69792] pt-1">
            FastAPI REST API &bull; PostgreSQL Database &bull; Axois Client Layer
          </p>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
