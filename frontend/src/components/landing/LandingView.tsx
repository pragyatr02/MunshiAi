import React, { useState } from 'react';
import { Mic, ArrowRight, ShieldCheck, Sparkles, BookOpen, CheckCircle2, ChevronRight, Store } from 'lucide-react';

interface LandingViewProps {
  onEnterApp: () => void;
  onOpenVoice: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onEnterApp, onOpenVoice }) => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      num: '01',
      title: 'Speak Naturally',
      subtitle: 'VOICE INPUT',
      desc: 'Speak freely in Hinglish, Hindi, or local dialect. No tedious manual form entries behind the counter.',
      example: '"Ramesh ne 500 ka rice liya udhaar mein."',
    },
    {
      num: '02',
      title: 'Understand Intent',
      subtitle: 'TRANSCRIPTION & AI',
      desc: 'Smart entity extraction extracts the buyer, the item, the exact rupee value, and whether it was cash or credit.',
      example: 'Customer: Ramesh • Item: Rice • Amount: ₹500 • Payment: Udhaar',
    },
    {
      num: '03',
      title: 'Verify Details',
      subtitle: 'HUMAN-IN-THE-LOOP',
      desc: 'You remain the merchant in command. The assistant asks for clarification if anything is ambiguous.',
      example: 'Confidence: 96% • Ambiguity: None • Pending Confirmation',
    },
    {
      num: '04',
      title: 'Save to Ledger',
      subtitle: 'VERIFIED KHATA',
      desc: 'Once confirmed, the transaction is permanently written to your PostgreSQL bahi-khata and customer udhaar.',
      example: 'Ledger Entry #1042 Committed • Balance Updated',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2D2320]">
      {/* Top Banner Navigation */}
      <nav className="border-b border-[#EDE4D8] bg-[#FAF7F2]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-[#9E6056] text-[#FAF7F2] flex items-center justify-center font-serif-editorial text-2xl font-bold">
              म
            </div>
            <div>
              <span className="font-serif-editorial text-2xl font-bold tracking-tight text-[#2D2320]">
                MunshiAI
              </span>
              <span className="block text-[11px] uppercase tracking-widest text-[#9E6056] font-semibold">
                Voice Bahi Khata
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-xs font-medium">
            <button
              onClick={onOpenVoice}
              className="hidden sm:inline-flex items-center space-x-1.5 px-4 py-2 rounded-full border border-[#DBCFC0] text-[#6A3B34] hover:bg-[#F3EBE1] transition"
            >
              <Mic className="w-3.5 h-3.5 text-[#9E6056]" />
              <span>Try Voice Bill</span>
            </button>
            <button
              onClick={onEnterApp}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-[#9E6056] hover:bg-[#884F46] text-[#FAF7F2] shadow-xs transition"
            >
              <span>Open Merchant Ledger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="max-w-4xl mx-auto px-6 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F3ECE6] border border-[#E3D4C5] text-[12px] text-[#864E46] mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span className="font-medium tracking-wide">
            Designed for Bharat&rsquo;s Kiranas, Dukandaars &amp; Vyaparis
          </span>
        </div>

        <h1 className="font-serif-editorial text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#2D2320] leading-[1.08] mb-6">
          Voice-first bookkeeping <br />
          <span className="italic font-normal text-[#8A4F46]">rooted in merchant trust.</span>
        </h1>

        <p className="text-base sm:text-lg text-[#6D5C57] max-w-2xl mx-auto leading-relaxed mb-8">
          The natural language accounting assistant where business logic validates every claim and your PostgreSQL database stores the absolute truth.
        </p>

        {/* Central Philosophy Quote Banner */}
        <div className="my-8 py-5 px-6 rounded-2xl bg-[#F6F0E7] border border-[#E4D7C8] max-w-xl mx-auto">
          <p className="font-serif-editorial text-xl sm:text-2xl text-[#4A322C] italic">
            &ldquo;AI interprets. Business logic validates. Database stores the truth.&rdquo;
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
          <button
            onClick={onEnterApp}
            className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#9E6056] hover:bg-[#864E46] text-[#FAF7F2] font-semibold text-sm shadow-sm transition flex items-center justify-center space-x-2"
          >
            <Store className="w-4 h-4" />
            <span>Launch Store Bahi Khata</span>
          </button>
          <button
            onClick={onOpenVoice}
            className="w-full sm:w-auto px-6 py-3.5 rounded-full border border-[#D5C6B5] bg-white hover:bg-[#FAF7F2] text-[#55362E] font-medium text-sm transition flex items-center justify-center space-x-2"
          >
            <Mic className="w-4 h-4 text-[#9E6056]" />
            <span>Voice Transaction Pipeline</span>
          </button>
        </div>
      </header>

      {/* The Central Visual Story: SPEAK -> UNDERSTAND -> VERIFY -> SAVE */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#9E6056]">
            The MunshiAI Architecture
          </span>
          <h2 className="font-serif-editorial text-3xl sm:text-4xl font-bold text-[#2D2320] mt-1">
            Speak &rarr; Understand &rarr; Verify &rarr; Save
          </h2>
          <p className="text-xs sm:text-sm text-[#7D6B65] max-w-lg mx-auto mt-2">
            No hallucinated balances. No unconfirmed commits. A transparent 4-stage ledger pipeline built for commerce.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {steps.map((step, idx) => (
            <div
              key={idx}
              onClick={() => setActiveStep(idx)}
              className={`p-5 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                activeStep === idx
                  ? 'bg-white border-[#9E6056] shadow-sm ring-1 ring-[#9E6056]'
                  : 'bg-[#FDFBF7] border-[#EDE4D8] hover:border-[#D5C6B5]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-serif-editorial text-2xl font-bold text-[#9E6056]">
                    {step.num}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#F3ECE6] text-[#7A453D]">
                    {step.subtitle}
                  </span>
                </div>
                <h3 className="font-serif-editorial text-xl font-bold text-[#2D2320] mb-2">
                  {step.title}
                </h3>
                <p className="text-xs text-[#6D5C57] leading-relaxed mb-4">
                  {step.desc}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#EDE4D8] text-[11px] text-[#55362E] font-mono">
                {step.example}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Signature Interactive Example Box */}
      <section className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white border border-[#E4D7C8] rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-[#EFE7DC] mb-6">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-bold text-[#9E6056]">
                Signature Experience
              </span>
              <h3 className="font-serif-editorial text-2xl font-bold text-[#2D2320]">
                Live Extraction Demonstration
              </h3>
            </div>
            <div className="flex items-center text-xs text-[#7A6963] gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#758670]"></span>
              <span>FastAPI Connected</span>
            </div>
          </div>

          <div className="space-y-6">
            {/* Spoken sentence */}
            <div className="bg-[#FAF7F2] border border-[#EADFCF] rounded-2xl p-4 sm:p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#F3ECE6] text-[#9E6056] flex items-center justify-center flex-shrink-0 mt-0.5">
                <Mic className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="text-[11px] font-bold uppercase text-[#88544B] tracking-wider mb-1">
                  Merchant Spoken Voice:
                </div>
                <div className="font-serif-editorial text-xl sm:text-2xl text-[#2D2320] italic">
                  &ldquo;Ramesh ne 500 ka rice liya udhaar mein.&rdquo;
                </div>
              </div>
            </div>

            {/* Extracted Card matching prompt */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#EDE4D8]">
                <span className="text-[10px] uppercase font-bold text-[#8C766F] block">Customer</span>
                <span className="font-serif-editorial text-lg font-bold text-[#2D2320] mt-0.5 block">
                  Ramesh
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#EDE4D8]">
                <span className="text-[10px] uppercase font-bold text-[#8C766F] block">Amount</span>
                <span className="font-serif-editorial text-lg font-bold text-[#8A4F46] mt-0.5 block">
                  ₹500.00
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#EDE4D8]">
                <span className="text-[10px] uppercase font-bold text-[#8C766F] block">Item</span>
                <span className="font-serif-editorial text-lg font-bold text-[#2D2320] mt-0.5 block">
                  Rice
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#EDE4D8]">
                <span className="text-[10px] uppercase font-bold text-[#8C766F] block">Transaction</span>
                <span className="text-xs font-semibold text-[#2D2320] mt-1.5 block uppercase">
                  Sale
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#EDE4D8] col-span-2 sm:col-span-1">
                <span className="text-[10px] uppercase font-bold text-[#8C766F] block">Payment</span>
                <span className="text-xs font-semibold text-[#9E6056] mt-1.5 block uppercase">
                  Credit (Udhaar)
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-[#7A6963]">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#758670]" />
                <span>Verified by FastAPI business logic before PostgreSQL commit</span>
              </div>
              <button
                onClick={onOpenVoice}
                className="text-[#9E6056] font-bold hover:underline inline-flex items-center gap-1"
              >
                <span>Record a real transaction now</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#EDE4D8] bg-[#F7F2EB] py-10 mt-16 text-center text-xs text-[#8C7A74]">
        <div className="max-w-4xl mx-auto px-6 space-y-2">
          <p className="font-serif-editorial text-lg font-bold text-[#3B2B27]">
            MunshiAI &bull; Bahi Khata
          </p>
          <p>
            Connected to PostgreSQL &bull; FastAPI Backend &bull; Real REST Endpoints
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingView;
