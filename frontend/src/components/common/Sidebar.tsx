import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  Users,
  Package,
  Mic,
  MessageSquareCode,
  BookMarked,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Bahi Khata Dashboard', icon: LayoutDashboard },
    { id: 'voice', label: 'Voice Transaction Engine', icon: Mic, badge: 'Core' },
    { id: 'transactions', label: 'Ledger Transactions', icon: Receipt },
    { id: 'customers', label: 'Customers & Udhaar', icon: Users },
    { id: 'inventory', label: 'Inventory & Stocks', icon: Package },
    { id: 'query', label: 'Ask MunshiAI', icon: MessageSquareCode, badge: 'Natural Q&A' },
  ];

  return (
    <aside className="w-full md:w-64 bg-[#FAF7F2] border-r border-[#EDE4D8] flex-shrink-0 md:min-h-[calc(100vh-4.5rem)]">
      <div className="p-4">
        <div className="px-3 pt-2 pb-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#9E6056] block">
            Navigation
          </span>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                  isActive
                    ? 'bg-[#F2EAE1] text-[#2D2320] font-semibold border border-[#E3D4C4]'
                    : 'text-[#6D5C57] hover:bg-[#F6EFE6] hover:text-[#2D2320]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-[#9E6056]' : 'text-[#8C7A74]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-[#E7D6C7] text-[#55342D]'
                        : 'bg-[#EDE4D8] text-[#7A6963]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Philosophy Card at bottom of sidebar */}
        <div className="mt-8 p-4 rounded-2xl bg-[#F4EDE3] border border-[#E5D7C7] text-left">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#9E6056] block mb-1">
            Core Law
          </span>
          <p className="font-serif-editorial text-sm italic text-[#3B2B27] leading-snug">
            &ldquo;AI interprets. Business logic validates. Database stores the truth.&rdquo;
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
