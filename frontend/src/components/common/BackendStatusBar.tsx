import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Server, CheckCircle2, AlertTriangle, RefreshCw, Settings, Check, X } from 'lucide-react';

export const BackendStatusBar: React.FC = () => {
  const { backendUrl, backendConnected, checkingBackend, checkBackendHealth, updateBackendUrl } = useAuth();
  const [showConfig, setShowConfig] = useState(false);
  const [urlInput, setUrlInput] = useState(backendUrl);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateBackendUrl(urlInput);
    setShowConfig(false);
  };

  const handleReset = () => {
    const defaultUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
    setUrlInput(defaultUrl);
    updateBackendUrl(defaultUrl);
    setShowConfig(false);
  };

  return (
    <div className="bg-[#F6F0E7] text-[#55433E] text-[11px] px-4 py-2 flex flex-wrap items-center justify-between gap-2 border-b border-[#E3D4C4]">
      <div className="flex items-center gap-2">
        <Server className="w-3.5 h-3.5 text-[#8C7A74]" />
        <span className="font-semibold text-[#2D2320]">FastAPI Backend:</span>
        <code className="bg-[#EFE7DC] text-[#3B2B27] px-1.5 py-0.5 rounded font-mono text-[10px]">
          {backendUrl}
        </code>

        {checkingBackend ? (
          <span className="inline-flex items-center text-[#865922] gap-1 ml-2 font-medium">
            <RefreshCw className="w-3 h-3 animate-spin" /> Checking...
          </span>
        ) : backendConnected === true ? (
          <span className="inline-flex items-center text-[#4B6344] gap-1 ml-2 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#758670]" /> Connected
          </span>
        ) : backendConnected === false ? (
          <span className="inline-flex items-center text-[#8A4F46] gap-1 ml-2 font-semibold" title="Backend not reachable">
            <AlertTriangle className="w-3.5 h-3.5 text-[#9E6056]" /> Offline / Unreachable
          </span>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => checkBackendHealth()}
          disabled={checkingBackend}
          className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#EDE4D8] hover:bg-[#E5D7C7] text-[#4A3834] rounded-full transition disabled:opacity-50 text-[10px] font-medium"
          title="Test FastAPI connection"
        >
          <RefreshCw className={`w-3 h-3 ${checkingBackend ? 'animate-spin' : ''}`} />
          Ping
        </button>
        <button
          onClick={() => {
            setUrlInput(backendUrl);
            setShowConfig(!showConfig);
          }}
          className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#EDE4D8] hover:bg-[#E5D7C7] text-[#4A3834] rounded-full transition text-[10px] font-medium"
          title="Configure API Base URL"
        >
          <Settings className="w-3 h-3" />
          Config
        </button>
      </div>

      {showConfig && (
        <div className="w-full pt-2 pb-1 border-t border-[#E3D4C4] flex flex-wrap items-center gap-2 animate-fadeIn">
          <span className="text-[#7A6963]">API Base URL:</span>
          <form onSubmit={handleSave} className="flex-1 flex items-center gap-2 max-w-md">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="http://127.0.0.1:8000"
              className="flex-1 px-2.5 py-1 bg-white border border-[#DDD0C0] rounded-lg text-[#2D2320] text-xs font-mono focus:outline-none focus:border-[#9E6056]"
            />
            <button
              type="submit"
              className="px-3 py-1 bg-[#9E6056] hover:bg-[#864E46] text-[#FAF7F2] rounded-lg font-medium flex items-center gap-1 text-[11px]"
            >
              <Check className="w-3 h-3" /> Save
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-2.5 py-1 bg-[#EDE4D8] hover:bg-[#E5D7C7] text-[#4A3834] rounded-lg text-[11px]"
              title="Reset to default"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => setShowConfig(false)}
              className="p-1 text-[#8C7A74] hover:text-[#2D2320]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </form>
          <span className="text-[10px] text-[#8C7A74] italic">
            Default: http://127.0.0.1:8000 from VITE_API_BASE_URL
          </span>
        </div>
      )}
    </div>
  );
};

export default BackendStatusBar;
