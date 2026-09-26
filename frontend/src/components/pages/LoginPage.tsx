import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PageId } from '../layout/Navbar';
import { Mail, Lock, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (page: PageId) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login, authError, clearAuthError, backendUrl } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAuthError();
    setLoading(true);

    try {
      await login({
        email: email.trim(),
        username: email.trim(),
        password: password,
      });
      onNavigate('dashboard');
    } catch {
      // Handled in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-md mx-auto text-[#2D2320]">
      <div className="text-center mb-8">
        <div className="mx-auto w-14 h-14 rounded-full bg-[#9E6056] text-[#FAF7F2] flex items-center justify-center font-serif-editorial text-3xl font-bold shadow-xs mb-3">
          म
        </div>
        <h2 className="font-serif-editorial text-3xl sm:text-4xl font-bold tracking-tight text-[#2D2320]">
          Sign In to Bahi Khata
        </h2>
        <p className="mt-1 text-xs text-[#7A6963]">
          Access your store ledger, customer udhaar records, and voice billing.
        </p>
      </div>

      <div className="bg-white py-8 px-6 sm:px-8 shadow-xs border border-[#EDE4D8] rounded-3xl">
        {authError && (
          <div className="mb-5 bg-[#FAF4F3] border border-[#ECD3CE] rounded-2xl p-3.5 flex items-start text-[#7D3F37] text-xs">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5 text-[#9E6056]" />
            <div className="flex-1 break-words">{authError}</div>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold text-[#55433E] mb-1">
              Email Address or Username
            </label>
            <div className="relative rounded-xl">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9E8B85]">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ramesh@vyapar.com"
                className="block w-full pl-10 pr-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#DDD0C0] rounded-xl focus:ring-[#9E6056] focus:border-[#9E6056] text-[#2D2320]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#55433E] mb-1">
              Password
            </label>
            <div className="relative rounded-xl">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9E8B85]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full pl-10 pr-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#DDD0C0] rounded-xl focus:ring-[#9E6056] focus:border-[#9E6056] text-[#2D2320]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex justify-center items-center py-3 px-4 rounded-full shadow-xs text-xs font-semibold text-[#FAF7F2] bg-[#9E6056] hover:bg-[#864E46] focus:outline-none disabled:opacity-50 transition"
          >
            {loading ? (
              <span>Authenticating with FastAPI...</span>
            ) : (
              <>
                <span>Sign In to Store</span>
                <ArrowRight className="ml-2 w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-[#F2EAE0] flex flex-col items-center gap-2 text-xs text-[#7A6963]">
          <div>
            <span>New merchant? </span>
            <button
              onClick={() => onNavigate('register')}
              className="text-[#9E6056] font-semibold hover:underline"
            >
              Register your store &rarr;
            </button>
          </div>
          <button
            onClick={() => onNavigate('landing')}
            className="text-[#8C7A74] hover:underline text-[11px]"
          >
            &larr; Back to MunshiAI Philosophy
          </button>
        </div>

        <div className="mt-4 pt-3 border-t border-[#F7F2EB] flex items-center justify-between text-[10px] text-[#9E8B85]">
          <span className="flex items-center">
            <ShieldCheck className="w-3.5 h-3.5 text-[#758670] mr-1" />
            FastAPI Auth
          </span>
          <span className="font-mono">{backendUrl}</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
