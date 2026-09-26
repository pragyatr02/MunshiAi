import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User as UserIcon, Mic, MessageSquare, BookOpen, Sparkles } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenVoiceModal?: () => void;
  onViewStory?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenVoiceModal,
  onViewStory,
}) => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="bg-[#FAF7F2] border-b border-[#EDE4D8] sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand Emblem */}
        <div className="flex items-center space-x-3.5">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center space-x-3 text-left group"
          >
            <div className="w-10 h-10 rounded-full bg-[#9E6056] text-[#FAF7F2] flex items-center justify-center font-serif-editorial text-2xl font-bold shadow-xs">
              म
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-serif-editorial text-2xl font-bold tracking-tight text-[#2D2320]">
                  MunshiAI
                </span>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#F3ECE6] text-[#7E4840] font-semibold border border-[#E8DACB]">
                  Khata
                </span>
              </div>
              <p className="text-[11px] text-[#7A6963] font-medium">Bahi Khata &bull; Voice Ledger</p>
            </div>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          {onViewStory && (
            <button
              onClick={onViewStory}
              className="hidden lg:inline-flex items-center space-x-1.5 text-xs text-[#7A6963] hover:text-[#2D2320] px-3 py-1.5 rounded-full border border-[#DED4C7] bg-[#FDFBF7] transition"
              title="View Product Story & Philosophy"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#9E6056]" />
              <span>Product Story</span>
            </button>
          )}

          {onOpenVoiceModal && (
            <button
              onClick={onOpenVoiceModal}
              className="inline-flex items-center space-x-2 bg-[#9E6056] hover:bg-[#864E46] text-[#FAF7F2] text-xs font-semibold px-4 py-2 rounded-full shadow-xs transition"
            >
              <Mic className="w-3.5 h-3.5 animate-pulse text-[#FAF7F2]" />
              <span>Record Voice Bill</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('query')}
            className={`inline-flex items-center space-x-1.5 text-xs font-medium px-3.5 py-2 rounded-full border transition ${
              activeTab === 'query'
                ? 'bg-[#F3ECE6] border-[#9E6056] text-[#7E4840]'
                : 'border-[#DED4C7] bg-white text-[#5E4C47] hover:bg-[#F8F3EC]'
            }`}
            title="Ask MunshiAI"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#9E6056]" />
            <span className="hidden sm:inline">Ask Munshi</span>
          </button>

          {isAuthenticated && (
            <div className="flex items-center pl-3 border-l border-[#EDE4D8] space-x-3">
              <div className="flex items-center space-x-2 text-xs text-[#4F3E3A]">
                <div className="w-8 h-8 rounded-full bg-[#F3ECE6] border border-[#E5D7C9] flex items-center justify-center text-[#7E4840]">
                  <UserIcon className="w-3.5 h-3.5" />
                </div>
                <div className="hidden md:block text-left">
                  <div className="font-semibold text-xs leading-none text-[#2D2320] truncate max-w-[120px]">
                    {user?.name || user?.full_name || user?.email?.split('@')[0] || 'Merchant'}
                  </div>
                  <div className="text-[10px] text-[#8C7A74] truncate max-w-[120px]">{user?.email}</div>
                </div>
              </div>

              <button
                onClick={logout}
                className="text-[#96837D] hover:text-[#9E6056] p-2 rounded-full hover:bg-[#F3ECE6] transition"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
