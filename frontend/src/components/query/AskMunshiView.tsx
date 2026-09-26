import React, { useState } from 'react';
import { queryService } from '../../services/queryService';
import { QueryResponse } from '../../types';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import { formatApiError } from '../../services/api';
import {
  MessageSquareCode,
  Send,
  Sparkles,
  User,
  RotateCcw,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'munshi';
  text: string;
  rawResponse?: QueryResponse;
  timestamp: Date;
}

export const AskMunshiView: React.FC = () => {
  const [queryInput, setQueryInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sampleQueries = [
    'Ramesh ka kitna baki hai?',
    'Total sales kitni hui?',
    'Recent transactions dikhao.',
    'Customer balance check karo',
  ];

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'munshi',
      text: 'Namaste! Main aapka MunshiAI assistant hoon. Kisi bhi grahak ka udhaar, total sales, ya recent transactions ke baare mein poohein.',
      timestamp: new Date(),
    },
  ]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || queryInput).trim();
    if (!query || loading) return;

    setError(null);
    setQueryInput('');

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res: QueryResponse = await queryService.askMunshi(query);

      const answerText =
        res.answer ||
        res.response ||
        res.message ||
        (typeof res.data === 'string' ? res.data : '') ||
        'Query processed successfully by MunshiAI backend.';

      const munshiMsg: ChatMessage = {
        id: `munshi-${Date.now()}`,
        sender: 'munshi',
        text: answerText,
        rawResponse: res,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, munshiMsg]);
    } catch (err) {
      const errStr = formatApiError(err);
      setError(errStr);
      setMessages((prev) => [
        ...prev,
        {
          id: `munshi-err-${Date.now()}`,
          sender: 'munshi',
          text: `Backend Error: ${errStr}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto space-y-8 text-[#2D2320]">
      {/* Header */}
      <div className="pb-4 border-b border-[#EDE4D8] flex items-baseline justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#9E6056] block mb-1">
            Natural Dialogue
          </span>
          <h2 className="font-serif-editorial text-3xl sm:text-4xl font-bold tracking-tight text-[#2D2320]">
            Ask MunshiAI
          </h2>
          <p className="text-xs text-[#7A6963] mt-1">
            Connected to FastAPI POST /query &bull; Ask natural Hindi / Hinglish questions about your bahi-khata.
          </p>
        </div>
        <button
          onClick={() =>
            setMessages([
              {
                id: 'welcome',
                sender: 'munshi',
                text: 'Namaste! Main aapka MunshiAI assistant hoon. Kisi bhi grahak ka udhaar, total sales, ya recent transactions ke baare mein poohein.',
                timestamp: new Date(),
              },
            ])
          }
          className="text-xs text-[#8C7A74] hover:text-[#2D2320] flex items-center gap-1.5"
          title="Clear Conversation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Clear
        </button>
      </div>

      {/* Suggestion Chips */}
      <div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A74] block mb-2.5">
          Suggested Inquiries:
        </span>
        <div className="flex flex-wrap gap-2">
          {sampleQueries.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(sample)}
              disabled={loading}
              className="inline-flex items-center text-xs bg-white hover:bg-[#FAF7F2] border border-[#EDE4D8] hover:border-[#D5C6B5] text-[#4A3834] px-4 py-2 rounded-full shadow-2xs transition disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#9E6056] mr-1.5" />
              <span className="font-serif-editorial text-sm">&ldquo;{sample}&rdquo;</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Conversation Card */}
      <div className="bg-white border border-[#EDE4D8] rounded-3xl p-6 sm:p-8 shadow-xs min-h-[440px] max-h-[620px] flex flex-col justify-between overflow-y-auto space-y-4">
        <div className="space-y-4 flex-1 overflow-y-auto pr-1">
          {messages.map((msg) => {
            const isMunshi = msg.sender === 'munshi';

            return (
              <div
                key={msg.id}
                className={`flex items-start space-x-3.5 ${
                  isMunshi ? 'justify-start' : 'justify-end'
                }`}
              >
                {isMunshi && (
                  <div className="w-9 h-9 rounded-full bg-[#9E6056] text-[#FAF7F2] flex items-center justify-center font-serif-editorial text-base font-bold flex-shrink-0 shadow-xs">
                    म
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-xl rounded-2xl p-4 text-xs leading-relaxed shadow-2xs ${
                    isMunshi
                      ? 'bg-[#FAF7F2] border border-[#EDE4D8] text-[#2D2320]'
                      : 'bg-[#9E6056] text-[#FAF7F2] font-medium'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Render structured responses */}
                  {msg.rawResponse && (
                    <div className="mt-3 pt-3 border-t border-[#E8DACB] space-y-2">
                      {msg.rawResponse.balance !== undefined && (
                        <div className="bg-white p-3 rounded-xl border border-[#EDE4D8] flex items-center justify-between text-xs">
                          <span className="text-[#7A6963] font-semibold">Customer Udhaar Balance:</span>
                          <span className="font-serif-editorial text-lg font-bold text-[#8A4F46]">
                            ₹{Number(msg.rawResponse.balance).toLocaleString('en-IN')}
                          </span>
                        </div>
                      )}

                      {msg.rawResponse.total_sales !== undefined && (
                        <div className="bg-white p-3 rounded-xl border border-[#EDE4D8] flex items-center justify-between text-xs">
                          <span className="text-[#7A6963] font-semibold">Total Sales Metric:</span>
                          <span className="font-serif-editorial text-lg font-bold text-[#4B6344]">
                            ₹{Number(msg.rawResponse.total_sales).toLocaleString('en-IN')}
                          </span>
                        </div>
                      )}

                      {Array.isArray(msg.rawResponse.transactions) &&
                        msg.rawResponse.transactions.length > 0 && (
                          <div className="bg-white p-3 rounded-xl border border-[#EDE4D8]">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-[#8C7A74] block mb-1.5">
                              Ledger Results:
                            </span>
                            <div className="divide-y divide-[#F2EAE0]">
                              {msg.rawResponse.transactions.slice(0, 5).map((t, idx) => (
                                <div
                                  key={idx}
                                  className="py-1.5 flex items-center justify-between text-xs"
                                >
                                  <span className="text-[#2D2320]">
                                    {typeof t.customer === 'string'
                                      ? t.customer
                                      : t.customer?.name || t.customer_name || 'Customer'}
                                  </span>
                                  <span className="font-serif-editorial font-bold text-sm text-[#2D2320]">
                                    ₹{Number(t.amount || 0).toLocaleString('en-IN')}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  )}

                  <span
                    className={`text-[10px] block mt-1.5 ${
                      isMunshi ? 'text-[#8C7A74]' : 'text-[#F3ECE6]'
                    }`}
                  >
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {!isMunshi && (
                  <div className="w-8 h-8 rounded-full bg-[#EAE0D4] text-[#4A3834] flex items-center justify-center flex-shrink-0 text-xs font-semibold">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center space-x-3.5">
              <div className="w-9 h-9 rounded-full bg-[#9E6056] text-[#FAF7F2] flex items-center justify-center font-serif-editorial text-base font-bold flex-shrink-0">
                म
              </div>
              <div className="bg-[#FAF7F2] border border-[#EDE4D8] rounded-2xl px-4 py-3 text-xs text-[#7A6963] flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-[#9E6056] animate-ping" />
                <span>MunshiAI is querying PostgreSQL ledger via FastAPI...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="pt-3 border-t border-[#EDE4D8] flex gap-2"
        >
          <input
            type="text"
            placeholder="Type in Hindi or English (e.g. Ramesh ka kitna baki hai?)"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-xs bg-[#FAF7F2] border border-[#DDD0C0] rounded-xl focus:ring-[#9E6056] focus:border-[#9E6056]"
          />
          <button
            type="submit"
            disabled={loading || !queryInput.trim()}
            className="px-5 py-2.5 bg-[#9E6056] hover:bg-[#864E46] text-[#FAF7F2] text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs transition disabled:opacity-50"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AskMunshiView;
