import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Mic, User as UserIcon, LogOut, MessageSquareCode } from 'lucide-react';

export type PageId =
  | 'landing'
  | 'login'
  | 'register'
  | 'dashboard'
  | 'voice'
  | 'transactions'
  | 'customers'
  | 'customer-detail'
  | 'inventory'
  | 'query';

interface NavbarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const { user, logout, isAuthenticated } = useAuth();

  const navLinks: Array<{ id: PageId; label: string; authRequired?: boolean }> = [
    { id: 'landing', label: 'Philosophy' },
    { id: 'voice', label: 'Voice Khata' },
    { id: 'dashboard', label: 'Dashboard', authRequired: true },
    { id: 'transactions', label: 'Transactions', authRequired: true },
    { id: 'customers', label: 'Customers', authRequired: true },
    { id: 'inventory', label: 'Inventory', authRequired: true },
    { id: 'query', label: 'Ask Munshi' },
  ];

  return (
    <nav className="bg-[#FAF7F2] border-b border-[#EDE4D8] sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Emblem */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate('landing')}>
          <div className="w-10 h-10 rounded-full bg-[#9E6056] text-[#FAF7F2] flex items-center justify-center font-serif-editorial text-2xl font-bold shadow-xs">
            म
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-serif-editorial text-2xl font-bold tracking-tight text-[#2D2320]">
                MunshiAI
              </span>
              <span className="text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#F3ECE6] text-[#7E4840] font-semibold border border-[#E8DACB]">
                Bahi Khata
              </span>
            </div>
            <p className="text-[11px] text-[#7A6963] font-medium leading-tight">
              Intelligent Voice Ledger
            </p>
          </div>
        </div>

        {/* Center Editorial Navigation Links */}
        <div className="hidden lg:flex items-center space-x-1 text-xs font-medium">
          {navLinks.map((link) => {
            const isActive =
              currentPage === link.id ||
              (link.id === 'customers' && currentPage === 'customer-detail');

            return (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className={`px-3.5 py-2 rounded-full transition ${
                  isActive
                    ? 'bg-[#F2EAE0] text-[#2D2320] font-semibold shadow-2xs border border-[#E3D4C4]'
                    : 'text-[#6D5C57] hover:text-[#2D2320] hover:bg-[#F6EFE6]'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </div>

        {/* Right Action / Auth Controls */}
        <div className="flex items-center space-x-3 text-xs">
          {/* Quick Voice Entry CTA */}
          <button
            onClick={() => onNavigate('voice')}
            className={`inline-flex items-center space-x-1.5 px-4 py-2 rounded-full transition shadow-xs ${
              currentPage === 'voice'
                ? 'bg-[#864E46] text-[#FAF7F2]'
                : 'bg-[#9E6056] hover:bg-[#864E46] text-[#FAF7F2]'
            }`}
          >
            <Mic className="w-3.5 h-3.5 animate-pulse text-[#FAF7F2]" />
            <span className="font-semibold">Voice Entry</span>
          </button>

          {/* User state */}
          {isAuthenticated ? (
            <div className="flex items-center pl-3 border-l border-[#EDE4D8] space-x-2.5">
              <div className="flex items-center space-x-2 text-[#4F3E3A]">
                <div className="w-7 h-7 rounded-full bg-[#F4ECE6] border border-[#E5D7C9] flex items-center justify-center text-[#7E4840]">
                  <UserIcon className="w-3.5 h-3.5" />
                </div>
                <span className="hidden sm:inline font-semibold text-[#2D2320] max-w-[100px] truncate">
                  {user?.name || user?.email?.split('@')[0] || 'Merchant'}
                </span>
              </div>
              <button
                onClick={logout}
                className="text-[#96837D] hover:text-[#9E6056] p-1.5 rounded-full hover:bg-[#F3ECE6] transition"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center pl-2 space-x-1.5">
              <button
                onClick={() => onNavigate('login')}
                className={`px-3.5 py-1.5 rounded-full font-medium transition ${
                  currentPage === 'login'
                    ? 'bg-[#F2EAE0] text-[#2D2320]'
                    : 'text-[#6D5C57] hover:text-[#2D2320]'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => onNavigate('register')}
                className={`px-3.5 py-1.5 rounded-full border border-[#D5C6B5] transition ${
                  currentPage === 'register'
                    ? 'bg-[#F2EAE0] text-[#2D2320]'
                    : 'text-[#6D5C57] hover:bg-[#F6EFE6]'
                }`}
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation bar */}
      <div className="lg:hidden border-t border-[#EDE4D8] px-4 py-2 flex items-center justify-around overflow-x-auto text-[11px] font-medium text-[#6D5C57]">
        {navLinks.map((link) => (
          <button
            key={link.id}
            onClick={() => onNavigate(link.id)}
            className={`px-2.5 py-1 rounded-full whitespace-nowrap ${
              currentPage === link.id ? 'bg-[#F2EAE0] text-[#2D2320] font-semibold' : ''
            }`}
          >
            {link.label}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
