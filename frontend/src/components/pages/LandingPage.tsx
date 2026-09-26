import React, { useState } from 'react';
import { Mic, ArrowRight, ShieldCheck, Sparkles, CheckCircle2, ChevronRight, Store, BookOpen, Layers } from 'lucide-react';
import { PageId } from '../layout/Navbar';

interface LandingPageProps {
  onNavigate: (page: PageId) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [activeStoryStage, setActiveStoryStage] = useState<number>(0);

  const pipelineStages = [
    {
      step: '01',
      title: 'Shopkeeper Speaks Naturally',
      phase: 'SPEAK',
      badge: 'Natural Voice Input',
      description:
        'A busy shopkeeper behind the counter speaks in everyday Hindi, Hinglish, or regional dialect without tedious typing.',
      detail: '"Ramesh ne 500 ka rice liya udhaar mein."',
      accent: 'border-[#9E6056]',
    },
    {
      step: '02',
      title: 'MunshiAI Understands Intent',
      phase: 'UNDERSTAND',
      badge: 'Context & Entity Parsing',
      description:
        'Entity extraction parses customer identity, item, quantity, exact rupee amount, and payment terms (cash vs udhaar).',
      detail: 'Customer: Ramesh • Amount: ₹500 • Item: Rice • Payment: Udhaar (Credit)',
      accent: 'border-[#758670]',
    },
    {
      step: '03',
      title: 'Context & Confidence Check',
      phase: 'VERIFY',
      badge: 'Human-in-the-Loop',
      description:
        'The system checks confidence, clarifies ambiguities with the merchant, and waits for explicit merchant verification.',
      detail: 'Confidence: 96% • Ambiguity: None • Pending Confirmation',
      accent: 'border-[#8B7F98]',
    },
    {
      step: '04',
      title: 'Saves Verified Transaction',
      phase: 'SAVE',
      badge: 'PostgreSQL Khata',
      description:
        'Only after merchant approval is the record written to the immutable PostgreSQL ledger and customer balance updated.',
      detail: 'Permanent Ledger Record #1042 Committed • Udhaar Balance Updated',
      accent: 'border-[#9E6056]',
    },
  ];

  return (
    <div className="space-y-16 py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-[#2D2320]">
      {/* Hero Section with Generous Whitespace & Editorial Serifs */}
      <section className="text-center pt-8 pb-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F3ECE6] border border-[#E3D4C5] text-[11px] uppercase tracking-wider text-[#864E46] mb-8 font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>The Intelligent Voice Ledger for Indian Kiranas &amp; Merchants</span>
        </div>

        <h1 className="font-serif-editorial text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#2D2320] leading-[1.08] mb-6">
          Voice-first bookkeeping <br />
          <span className="italic font-normal text-[#8A4F46]">rooted in merchant trust.</span>
        </h1>

        <p className="text-base sm:text-lg text-[#6D5C57] max-w-2xl mx-auto leading-relaxed mb-10">
          A multilingual, voice-first accounting assistant where AI listens, business logic validates, and your PostgreSQL database stores the uncompromised truth.
        </p>

        {/* Central Philosophy Quote Banner */}
        <div className="py-6 px-8 rounded-3xl bg-[#F6F0E7] border border-[#E4D7C8] max-w-xl mx-auto shadow-2xs">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#9E6056] block mb-2">
            The MunshiAI Creed
          </span>
          <p className="font-serif-editorial text-2xl sm:text-3xl text-[#3B2B27] italic leading-snug">
            &ldquo;AI interprets. Business logic validates. Database stores the truth.&rdquo;
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          <button
            onClick={() => onNavigate('voice')}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#9E6056] hover:bg-[#864E46] text-[#FAF7F2] font-semibold text-xs shadow-xs transition flex items-center justify-center space-x-2"
          >
            <Mic className="w-4 h-4 text-[#FAF7F2] animate-pulse" />
            <span>Launch Voice Transaction Flow</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </button>
          <button
            onClick={() => onNavigate('dashboard')}
            className="w-full sm:w-auto px-7 py-4 rounded-full border border-[#D5C6B5] bg-white hover:bg-[#FAF7F2] text-[#4A322C] font-semibold text-xs transition flex items-center justify-center space-x-2"
          >
            <Store className="w-4 h-4 text-[#9E6056]" />
            <span>Open Merchant Bahi Khata</span>
          </button>
        </div>
      </section>

      {/* The Central Visual Story: SPEAK → UNDERSTAND → VERIFY → SAVE */}
      <section className="pt-8">
        <div className="text-center mb-12">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#9E6056] block mb-1">
            Visual Storytelling
          </span>
          <h2 className="font-serif-editorial text-3xl sm:text-4xl font-bold text-[#2D2320]">
            Speak &rarr; Understand &rarr; Verify &rarr; Save
          </h2>
          <p className="text-xs sm:text-sm text-[#7D6B65] max-w-lg mx-auto mt-2 leading-relaxed">
            How a natural spoken bill turns into an audit-proof ledger entry through transparent verification.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {pipelineStages.map((stage, idx) => (
            <div
              key={idx}
              onClick={() => setActiveStoryStage(idx)}
              className={`p-6 rounded-3xl border transition cursor-pointer flex flex-col justify-between ${
                activeStoryStage === idx
                  ? 'bg-white border-[#9E6056] shadow-xs ring-1 ring-[#9E6056]'
                  : 'bg-[#FDFBF7] border-[#EDE4D8] hover:border-[#D5C6B5]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-serif-editorial text-3xl font-bold text-[#9E6056]">
                    {stage.step}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#F3ECE6] text-[#7A453D]">
                    {stage.phase}
                  </span>
                </div>
                <h3 className="font-serif-editorial text-xl font-bold text-[#2D2320] mb-2 leading-snug">
                  {stage.title}
                </h3>
                <p className="text-xs text-[#6D5C57] leading-relaxed mb-4">
                  {stage.description}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#EDE4D8] text-[11px] text-[#4A322C] font-mono leading-tight">
                {stage.detail}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Signature Interactive Example Box */}
      <section className="bg-white border border-[#E4D7C8] rounded-3xl p-6 sm:p-10 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 pb-4 border-b border-[#EFE7DC] mb-6">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#9E6056] block mb-1">
              Live Showcase
            </span>
            <h3 className="font-serif-editorial text-2xl sm:text-3xl font-bold text-[#2D2320]">
              Signature Spoken Bill Extraction
            </h3>
          </div>
          <div className="flex items-center text-xs text-[#758670] font-semibold gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>FastAPI Verified Flow</span>
          </div>
        </div>

        <div className="space-y-6">
          {/* Spoken Voice Bar */}
          <div className="bg-[#FAF7F2] border border-[#EADFCF] rounded-2xl p-5 flex items-start gap-4">
            <div className="w-11 h-11 rounded-full bg-[#F3ECE6] text-[#9E6056] flex items-center justify-center flex-shrink-0 mt-0.5">
              <Mic className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="text-[10px] font-bold uppercase text-[#88544B] tracking-widest mb-1">
                Merchant Spoken Audio Input:
              </div>
              <div className="font-serif-editorial text-2xl sm:text-3xl text-[#2D2320] italic">
                &ldquo;Ramesh ne 500 ka rice liya udhaar mein.&rdquo;
              </div>
            </div>
          </div>

          {/* Extracted Information Card */}
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#8C766F] block mb-2.5">
              Extracted Information Card:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EDE4D8]">
                <span className="text-[10px] uppercase font-bold text-[#8C766F] block">Customer</span>
                <span className="font-serif-editorial text-xl font-bold text-[#2D2320] mt-1 block">
                  Ramesh
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EDE4D8]">
                <span className="text-[10px] uppercase font-bold text-[#8C766F] block">Amount</span>
                <span className="font-serif-editorial text-xl font-bold text-[#8A4F46] mt-1 block">
                  ₹500.00
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EDE4D8]">
                <span className="text-[10px] uppercase font-bold text-[#8C766F] block">Item</span>
                <span className="font-serif-editorial text-xl font-bold text-[#2D2320] mt-1 block">
                  Rice
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EDE4D8]">
                <span className="text-[10px] uppercase font-bold text-[#8C766F] block">Transaction</span>
                <span className="text-xs font-semibold text-[#2D2320] mt-2 block uppercase">
                  Sale
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EDE4D8] col-span-2 sm:col-span-1">
                <span className="text-[10px] uppercase font-bold text-[#8C766F] block">Payment</span>
                <span className="text-xs font-semibold text-[#9E6056] mt-2 block uppercase">
                  Credit (Udhaar)
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-[#7A6963]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#758670]" />
              <span>Validates business rules before writing to PostgreSQL ledger</span>
            </div>
            <button
              onClick={() => onNavigate('voice')}
              className="text-[#9E6056] font-bold hover:underline inline-flex items-center gap-1"
            >
              <span>Try with your own voice</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Philosophy Pillars Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="p-6 rounded-3xl bg-[#FBF8F4] border border-[#EDE4D8]">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#9E6056] block mb-1">
            Pillar 01
          </span>
          <h3 className="font-serif-editorial text-2xl font-bold text-[#2D2320] mb-2">
            No Hallucinated Ledger
          </h3>
          <p className="text-xs text-[#6D5C57] leading-relaxed">
            Transactions are NEVER committed silently or probabilistically. The assistant checks ambiguities and requires merchant verification.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-[#FBF8F4] border border-[#EDE4D8]">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#758670] block mb-1">
            Pillar 02
          </span>
          <h3 className="font-serif-editorial text-2xl font-bold text-[#2D2320] mb-2">
            Local Dialect &amp; Udhaar
          </h3>
          <p className="text-xs text-[#6D5C57] leading-relaxed">
            Understands Indian neighborhood shop dynamics: credit books, partial payments, items in Hindi/Hinglish, and regular customer tabs.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-[#FBF8F4] border border-[#EDE4D8]">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#8B7F98] block mb-1">
            Pillar 03
          </span>
          <h3 className="font-serif-editorial text-2xl font-bold text-[#2D2320] mb-2">
            Single Source of Truth
          </h3>
          <p className="text-xs text-[#6D5C57] leading-relaxed">
            The FastAPI backend and PostgreSQL database are the absolute authority. No client-side fake calculations or mock numbers.
          </p>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
