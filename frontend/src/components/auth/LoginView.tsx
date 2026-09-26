import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, User as UserIcon, Store, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

interface LoginViewProps {
  onBackToStory?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onBackToStory }) => {
  const { login, register, authError, clearAuthError, backendUrl } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAuthError();
    setLoading(true);

    try {
      if (isRegister) {
        await register({
          email: email.trim(),
          password: password,
          name: name.trim(),
          full_name: name.trim(),
        });
      } else {
        await login({
          email: email.trim(),
          username: email.trim(),
          password: password,
        });
      }
    } catch {
      // Error handled in context state
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-[#2D2320]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto w-14 h-14 rounded-full bg-[#9E6056] text-[#FAF7F2] flex items-center justify-center font-serif-editorial text-3xl font-bold shadow-sm mb-4">
          म
        </div>
        <h2 className="font-serif-editorial text-3xl sm:text-4xl font-bold tracking-tight text-[#2D2320]">
          MunshiAI
        </h2>
        <p className="mt-1 text-xs text-[#7A6963]">
          Intelligent Voice Ledger &bull; Bahi Khata
        </p>

        {onBackToStory && (
          <button
            onClick={onBackToStory}
            className="mt-2 text-xs text-[#9E6056] hover:underline inline-flex items-center gap-1 font-medium"
          >
            &larr; View Product Philosophy &amp; Story
          </button>
        )}
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xs border border-[#EDE4D8] rounded-3xl sm:px-10">
          {/* Tabs */}
          <div className="flex border-b border-[#EDE4D8] mb-6">
            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                clearAuthError();
              }}
              className={`flex-1 pb-3 text-xs font-semibold text-center border-b-2 transition ${
                !isRegister
                  ? 'border-[#9E6056] text-[#864E46]'
                  : 'border-transparent text-[#96837D] hover:text-[#2D2320]'
              }`}
            >
              Sign In to Store
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegister(true);
                clearAuthError();
              }}
              className={`flex-1 pb-3 text-xs font-semibold text-center border-b-2 transition ${
                isRegister
                  ? 'border-[#9E6056] text-[#864E46]'
                  : 'border-transparent text-[#96837D] hover:text-[#2D2320]'
              }`}
            >
              Register New Store
            </button>
          </div>

          {authError && (
            <div className="mb-5 bg-[#FBF5F4] border border-[#ECD3CE] rounded-xl p-3.5 flex items-start text-[#7D3F37] text-xs">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5 text-[#9E6056]" />
              <div className="flex-1 break-words">{authError}</div>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-[#55433E] mb-1">
                  Owner / Vyapari Name
                </label>
                <div className="relative rounded-xl">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9E8B85]">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="block w-full pl-9 pr-3 py-2.5 text-xs bg-[#FAF7F2] border border-[#DDD0C0] rounded-xl focus:ring-[#9E6056] focus:border-[#9E6056] text-[#2D2320]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#55433E] mb-1">
                Email Address or Username
              </label>
              <div className="relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9E8B85]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ramesh@vyapar.com"
                  className="block w-full pl-9 pr-3 py-2.5 text-xs bg-[#FAF7F2] border border-[#DDD0C0] rounded-xl focus:ring-[#9E6056] focus:border-[#9E6056] text-[#2D2320]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#55433E] mb-1">
                Password
              </label>
              <div className="relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9E8B85]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-3 py-2.5 text-xs bg-[#FAF7F2] border border-[#DDD0C0] rounded-xl focus:ring-[#9E6056] focus:border-[#9E6056] text-[#2D2320]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 flex justify-center items-center py-3 px-4 rounded-xl shadow-xs text-xs font-semibold text-[#FAF7F2] bg-[#9E6056] hover:bg-[#864E46] focus:outline-none disabled:opacity-50 transition"
            >
              {loading ? (
                <span>Verifying with FastAPI...</span>
              ) : (
                <>
                  <span>{isRegister ? 'Register & Initialize Khata' : 'Sign In to Bahi Khata'}</span>
                  <ArrowRight className="ml-2 w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#F2EAE0] flex items-center justify-between text-[11px] text-[#8C7A74]">
            <span className="flex items-center">
              <ShieldCheck className="w-3.5 h-3.5 text-[#758670] mr-1" />
              FastAPI JWT
            </span>
            <span className="font-mono text-[10px]">
              API: {backendUrl}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
