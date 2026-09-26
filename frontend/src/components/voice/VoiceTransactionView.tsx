import React, { useState, useRef } from 'react';
import { voiceService } from '../../services/voiceService';
import { draftService } from '../../services/draftService';
import { DraftTransaction, Transaction } from '../../types';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import { formatApiError } from '../../services/api';
import {
  Mic,
  Square,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Check,
  X,
  HelpCircle,
  Send,
  BookOpen,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface VoiceTransactionViewProps {
  onTransactionConfirmed?: () => void;
  onNavigateToLedger?: () => void;
}

type Stage =
  | 'idle'
  | 'recording'
  | 'transcribing'
  | 'interpreting'
  | 'verifying'
  | 'clarifying'
  | 'confirmed';

export const VoiceTransactionView: React.FC<VoiceTransactionViewProps> = ({
  onTransactionConfirmed,
  onNavigateToLedger,
}) => {
  const [stage, setStage] = useState<Stage>('idle');
  const [voiceText, setVoiceText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Draft state from FastAPI
  const [draftId, setDraftId] = useState<string | number | null>(null);
  const [draft, setDraft] = useState<DraftTransaction | null>(null);

  // Extracted item info
  const [extractedItem, setExtractedItem] = useState('Rice');

  // Verification editable fields
  const [customerName, setCustomerName] = useState('');
  const [amount, setAmount] = useState('');
  const [direction, setDirection] = useState<'in' | 'out' | ''>('');
  const [txType, setTxType] = useState('sale');

  // Clarification state
  const [clarificationAnswer, setClarificationAnswer] = useState('');
  const [clarifyingLoading, setClarifyingLoading] = useState(false);

  // Final confirmed transaction
  const [confirmedTx, setConfirmedTx] = useState<Transaction | null>(null);
  const [confirmingLoading, setConfirmingLoading] = useState(false);

  // MediaRecorder refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<unknown>(null);

  const sampleVoicePrompts = [
    'Ramesh ne 500 ka rice liya udhaar mein.',
    'Suresh ne 1200 rupaye cash diye udhaar chukane ke liye.',
    'Deepak ko 2 packets mustard oil 350 rupaye mein becha.',
    'Anita ji ko 5kg atta 220 rupaye ka udhaar likho.',
  ];

  const startRecording = async () => {
    setError(null);
    audioChunksRef.current = [];

    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new (SpeechRecognition as new () => {
          continuous: boolean;
          interimResults: boolean;
          lang: string;
          onresult: (e: { results: Array<Array<{ transcript: string }>> }) => void;
          start: () => void;
          stop: () => void;
        })();
        recognition.lang = 'hi-IN,en-IN,en-US';
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.onresult = (e) => {
          const transcript = Array.from(e.results)
            .map((r) => r[0].transcript)
            .join(' ');
          setVoiceText(transcript);
        };
        recognition.start();
        recognitionRef.current = recognition;
      } catch {
        // Fallback
      }
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setStage('recording');
    } catch {
      setIsRecording(true);
      setStage('recording');
    }
  };

  const stopRecordingAndProcess = async () => {
    setIsRecording(false);
    setStage('transcribing');

    if (recognitionRef.current) {
      try {
        (recognitionRef.current as { stop: () => void }).stop();
      } catch {
        // Ignore stop error
      }
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }

    setTimeout(async () => {
      const audioBlob =
        audioChunksRef.current.length > 0
          ? new Blob(audioChunksRef.current, { type: 'audio/webm' })
          : null;

      await sendToBackendVoicePipeline(audioBlob, voiceText);
    }, 400);
  };

  const handleManualTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voiceText.trim()) return;
    await sendToBackendVoicePipeline(null, voiceText);
  };

  const sendToBackendVoicePipeline = async (audioBlob: Blob | null, text: string) => {
    setError(null);
    setStage('interpreting');

    try {
      let response;
      if (audioBlob && audioBlob.size > 0) {
        response = await voiceService.processVoiceInput(audioBlob);
      } else {
        response = await voiceService.processVoiceInput({ text });
      }

      const returnedDraft = response.draft || (response as unknown as DraftTransaction);
      const id = response.draft_id || response.id || returnedDraft?.id;

      if (id) {
        setDraftId(id);
      }

      const effectiveDraft = returnedDraft || {
        id: id || Date.now(),
        transcription: response.transcription || text,
      };

      setDraft(effectiveDraft);

      // Populate verification fields
      const cust = effectiveDraft.customer_name || '';
      const amt = effectiveDraft.amount ? String(effectiveDraft.amount) : '';
      const dir = (effectiveDraft.money_direction || '').toLowerCase();

let normalizedDirection: 'in' | 'out' | '' = '';

if (
  dir === 'in' ||
  dir === 'credit' ||
  dir === 'incoming'
) {
  normalizedDirection = 'in';
} else if (
  dir === 'out' ||
  dir === 'debit' ||
  dir === 'outgoing'
) {
  normalizedDirection = 'out';
}

setCustomerName(cust);
setAmount(amt);
setDirection(normalizedDirection);
setTxType(
  effectiveDraft.transaction_type
    ? String(effectiveDraft.transaction_type).toLowerCase()
    : ''
);
      if (effectiveDraft.items && effectiveDraft.items[0]?.product_name) {
        setExtractedItem(effectiveDraft.items[0].product_name);
      } else if (text.toLowerCase().includes('rice')) {
        setExtractedItem('Rice');
      } else if (text.toLowerCase().includes('atta') || text.toLowerCase().includes('flour')) {
        setExtractedItem('Atta');
      } else if (text.toLowerCase().includes('oil')) {
        setExtractedItem('Mustard Oil');
      } else {
        setExtractedItem('Groceries');
      }

      // Check for ambiguity/clarification
      const hasAmbiguity =
        effectiveDraft.status === 'clarification_needed' ||
        Boolean(effectiveDraft.ambiguity) ||
        (effectiveDraft.ambiguities && effectiveDraft.ambiguities.length > 0) ||
        Boolean(effectiveDraft.clarification_question);

      if (hasAmbiguity) {
        setStage('clarifying');
      } else {
        setStage('verifying');
      }
    } catch (err) {
      setError(formatApiError(err));
      setStage('idle');
    }
  };

  const handleClarifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftId || !clarificationAnswer.trim()) return;

    setClarifyingLoading(true);
    setError(null);

    try {
      const updatedDraft = await draftService.clarifyDraft(draftId, clarificationAnswer);
      setDraft(updatedDraft);

      if (updatedDraft.customer_name) setCustomerName(updatedDraft.customer_name);
      if (updatedDraft.amount) setAmount(String(updatedDraft.amount));
      if (updatedDraft.money_direction) {
        const dir = updatedDraft.money_direction.toLowerCase();
        setDirection(dir === 'in' || dir === 'credit' ? 'in' : 'out');
      }

      setStage('verifying');
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setClarifyingLoading(false);
    }
  };

  const handleConfirmDraft = async () => {
    if (!draftId) {
      setError('Draft ID is missing. Please re-record.');
      return;
    }

    setConfirmingLoading(true);
    setError(null);

    try {
      const confirmed = await draftService.confirmDraft(draftId, {
        customer_name: customerName,
        amount: Number(amount),
        money_direction: direction,
        transaction_type: txType,
      });

      // A transaction must not appear as permanently saved until the backend confirms it.
      setConfirmedTx(confirmed);
      setStage('confirmed');
      if (onTransactionConfirmed) {
        onTransactionConfirmed();
      }
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setConfirmingLoading(false);
    }
  };

  const handleRejectDraft = async () => {
    if (draftId) {
      try {
        await draftService.rejectDraft(draftId, 'Discarded by merchant');
      } catch {
        // Discard quietly
      }
    }
    resetFlow();
  };

  const resetFlow = () => {
    setStage('idle');
    setVoiceText('');
    setDraftId(null);
    setDraft(null);
    setConfirmedTx(null);
    setError(null);
    setClarificationAnswer('');
    setIsRecording(false);
  };

  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto space-y-8 text-[#2D2320]">
      {/* Header */}
      <div className="pb-4 border-b border-[#EDE4D8]">
        <span className="text-[11px] font-bold uppercase tracking-widest text-[#9E6056] block mb-1">
          Signature Experience
        </span>
        <h2 className="font-serif-editorial text-3xl sm:text-4xl font-bold tracking-tight text-[#2D2320]">
          Voice Transaction Engine
        </h2>
        <p className="text-xs text-[#7A6963] mt-1">
          Speak in natural everyday language. The AI parses entities; business logic checks validity before writing to PostgreSQL.
        </p>
      </div>

      {/* Visual Pipeline Flow Bar */}
      <div className="bg-[#FAF7F2] border border-[#EDE4D8] rounded-2xl p-4 shadow-2xs">
        <div className="flex items-center justify-between text-[11px] font-semibold text-[#8C7A74] overflow-x-auto gap-2">
          <span className={`flex items-center gap-1 ${stage === 'recording' || stage === 'idle' ? 'text-[#9E6056] font-bold' : ''}`}>
            VOICE
          </span>
          &rarr;
          <span className={`flex items-center gap-1 ${stage === 'transcribing' ? 'text-[#9E6056] font-bold' : ''}`}>
            TRANSCRIPTION
          </span>
          &rarr;
          <span className={`flex items-center gap-1 ${stage === 'interpreting' ? 'text-[#9E6056] font-bold' : ''}`}>
            UNDERSTANDING
          </span>
          &rarr;
          <span className={`flex items-center gap-1 ${stage === 'clarifying' ? 'text-[#8A4F46] font-bold' : ''}`}>
            AMBIGUITY CHECK
          </span>
          &rarr;
          <span className={`flex items-center gap-1 ${stage === 'verifying' ? 'text-[#9E6056] font-bold' : ''}`}>
            VERIFICATION
          </span>
          &rarr;
          <span className={`flex items-center gap-1 ${stage === 'confirmed' ? 'text-[#4B6344] font-bold' : ''}`}>
            VERIFIED KHATA
          </span>
        </div>
      </div>

      {error && (
        <ErrorMessage
          title="Voice Pipeline Notice"
          message={error}
          onRetry={stage === 'verifying' ? handleConfirmDraft : resetFlow}
        />
      )}

      {/* Stage: Idle & Recording */}
      {(stage === 'idle' || stage === 'recording') && (
        <div className="bg-white border border-[#EDE4D8] rounded-3xl p-8 sm:p-10 text-center space-y-8 shadow-xs">
          <div className="max-w-lg mx-auto">
            <h3 className="font-serif-editorial text-2xl sm:text-3xl font-bold text-[#2D2320] mb-2">
              Tap to Speak Bill Entry
            </h3>
            <p className="text-xs text-[#7A6963] leading-relaxed">
              Speak in Hindi, Hinglish, or English. Describe what customer bought, the amount, or payments received.
            </p>

            {/* Circular Record Button */}
            <div className="flex flex-col items-center justify-center my-8">
              {!isRecording ? (
                <button
                  type="button"
                  onClick={startRecording}
                  className="w-24 h-24 rounded-full bg-[#9E6056] hover:bg-[#864E46] text-[#FAF7F2] flex flex-col items-center justify-center shadow-md hover:shadow-lg transition transform active:scale-95 group"
                >
                  <Mic className="w-10 h-10 group-hover:scale-110 transition" />
                  <span className="text-[10px] uppercase font-bold tracking-wider mt-1">Speak</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopRecordingAndProcess}
                  className="w-24 h-24 rounded-full bg-[#8A4F46] hover:bg-[#723C34] text-[#FAF7F2] flex flex-col items-center justify-center shadow-md animate-pulse transition transform active:scale-95"
                >
                  <Square className="w-7 h-7" />
                  <span className="text-[10px] uppercase font-bold tracking-wider mt-1">Done</span>
                </button>
              )}

              {isRecording && (
                <p className="text-xs font-semibold text-[#8A4F46] mt-4 animate-pulse">
                  Listening to your store transaction... Tap Done when finished.
                </p>
              )}
            </div>

            {/* Prompt Suggestion Chips */}
            <div className="pt-6 border-t border-[#F2EAE0]">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#8C7A74] block mb-3">
                Try Speaking One Of These:
              </span>
              <div className="flex flex-col gap-2">
                {sampleVoicePrompts.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setVoiceText(sample);
                      sendToBackendVoicePipeline(null, sample);
                    }}
                    className="text-left text-xs bg-[#FAF7F2] hover:bg-[#F2EAE0] border border-[#EDE4D8] text-[#4A3834] px-4 py-2.5 rounded-xl transition"
                  >
                    <span className="italic font-serif-editorial text-sm">&ldquo;{sample}&rdquo;</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Manual text alternative */}
            <div className="pt-6 border-t border-[#F2EAE0] mt-6">
              <span className="text-xs text-[#8C7A74] block mb-2">Or type natural voice prompt:</span>
              <form onSubmit={handleManualTextSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Ramesh ne 500 ka rice liya udhaar mein."
                  value={voiceText}
                  onChange={(e) => setVoiceText(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#DDD0C0] rounded-xl focus:ring-[#9E6056] focus:border-[#9E6056]"
                />
                <button
                  type="submit"
                  disabled={!voiceText.trim()}
                  className="px-5 py-2.5 bg-[#9E6056] hover:bg-[#864E46] text-[#FAF7F2] text-xs font-semibold rounded-xl disabled:opacity-50 transition"
                >
                  Interpret AI
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Stage: Transcribing / Interpreting */}
      {(stage === 'transcribing' || stage === 'interpreting') && (
        <div className="bg-white border border-[#EDE4D8] rounded-3xl p-12 text-center shadow-xs">
          <LoadingSpinner
            message={
              stage === 'transcribing'
                ? 'Transcribing merchant audio through FastAPI /voice/process...'
                : 'Interpreting entities, products, amounts, and intent...'
            }
            size="lg"
          />
          {voiceText && (
            <p className="font-serif-editorial text-lg text-[#553C36] italic mt-4 max-w-md mx-auto">
              &ldquo;{voiceText}&rdquo;
            </p>
          )}
        </div>
      )}

      {/* Stage: Clarification Required */}
      {stage === 'clarifying' && (
        <div className="bg-[#FAF4EE] border border-[#E8D4C2] rounded-3xl p-6 sm:p-8 shadow-xs space-y-4 animate-fadeIn">
          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 bg-[#F2E2D3] text-[#864E46] rounded-xl">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#864E46]">
                Human in the loop
              </span>
              <h3 className="font-serif-editorial text-2xl font-bold text-[#2D2320]">
                Clarification Required by Assistant
              </h3>
              <p className="text-xs text-[#6D5C57] mt-1 leading-relaxed">
                {draft?.clarification_question ||
                  (Array.isArray(draft?.ambiguities) && draft?.ambiguities.join(', ')) ||
                  'The AI detected an ambiguity or missing detail before this bill can be saved.'}
              </p>
            </div>
          </div>

          <form onSubmit={handleClarifySubmit} className="space-y-3 pt-2">
            <label className="block text-xs font-semibold text-[#55433E]">
              Your clarification or detail:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Kumar, amount is 500, udhaar"
                value={clarificationAnswer}
                onChange={(e) => setClarificationAnswer(e.target.value)}
                className="flex-1 px-3.5 py-2.5 text-xs border border-[#DDD0C0] rounded-xl bg-white text-[#2D2320] focus:ring-[#9E6056] focus:border-[#9E6056]"
              />
              <button
                type="submit"
                disabled={clarifyingLoading || !clarificationAnswer.trim()}
                className="px-5 py-2.5 bg-[#9E6056] hover:bg-[#864E46] text-[#FAF7F2] text-xs font-semibold rounded-xl flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {clarifyingLoading ? 'Sending...' : 'Clarify'}
              </button>
            </div>
          </form>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setStage('verifying')}
              className="text-xs text-[#864E46] hover:underline"
            >
              Skip to manual verification &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Stage: Verification (Human in the loop) */}
      {stage === 'verifying' && (
        <div className="bg-white border border-[#EDE4D8] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-[#EDE4D8]">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#9E6056]">
                Step 3 &bull; Verify Before Commit
              </span>
              <h3 className="font-serif-editorial text-2xl font-bold text-[#2D2320]">
                Verify Extracted Bill Details
              </h3>
              <p className="text-xs text-[#7A6963]">
                Draft ID: <span className="font-mono">{draftId}</span> &bull; A transaction is not saved until you confirm.
              </p>
            </div>
            {draft?.confidence !== undefined && (
              <div className="inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full bg-[#EBF1E9] text-[#4B6344]">
                Confidence: {Math.round(draft.confidence * 100)}%
              </div>
            )}
          </div>

          {/* Elegant Extracted Summary Card matching Stitch reference */}
          <div className="bg-[#FAF7F2] border border-[#EDE4D8] rounded-2xl p-5">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#8C7A74] block mb-3">
              Extracted Information Card:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-3 rounded-xl bg-white border border-[#EDE4D8]">
                <span className="text-[10px] uppercase font-bold text-[#8C7A74] block">Customer</span>
                <span className="font-serif-editorial text-lg font-bold text-[#2D2320] block truncate">
                  {customerName || 'Customer'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-[#EDE4D8]">
                <span className="text-[10px] uppercase font-bold text-[#8C7A74] block">Amount</span>
                <span className="font-serif-editorial text-lg font-bold text-[#8A4F46] block">
                  ₹{amount || '0.00'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-[#EDE4D8]">
                <span className="text-[10px] uppercase font-bold text-[#8C7A74] block">Item</span>
                <span className="font-serif-editorial text-lg font-bold text-[#2D2320] block truncate">
                  {extractedItem}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-[#EDE4D8]">
                <span className="text-[10px] uppercase font-bold text-[#8C7A74] block">Transaction</span>
                <span className="text-xs font-semibold text-[#2D2320] mt-1 block uppercase">
                  {txType}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-[#EDE4D8] col-span-2 sm:col-span-1">
                <span className="text-[10px] uppercase font-bold text-[#8C7A74] block">Payment</span>
                <span className="text-xs font-semibold text-[#9E6056] mt-1 block uppercase">
                  {direction === 'in' ? 'Credit / Udhaar' : 'Debit'}
                </span>
              </div>
            </div>
          </div>

          {/* Editable verification fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#55433E] mb-1">
                Customer Name
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Ramesh"
                className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#DDD0C0] rounded-xl focus:ring-[#9E6056] focus:border-[#9E6056]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#55433E] mb-1">
                Amount (₹)
              </label>
              <input
                type="number"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="500.00"
                className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#DDD0C0] rounded-xl focus:ring-[#9E6056] focus:border-[#9E6056] font-bold text-sm"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#55433E] mb-1">
                Money Direction
              </label>
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value as 'in' | 'out')}
                className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#DDD0C0] rounded-xl focus:ring-[#9E6056] focus:border-[#9E6056]"
              >
                <option value="in">IN (Received / Credit)</option>
                <option value="out">OUT (Paid / Debit)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#55433E] mb-1">
                Transaction Type
              </label>
              <select
                value={txType}
                onChange={(e) => setTxType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#DDD0C0] rounded-xl focus:ring-[#9E6056] focus:border-[#9E6056] capitalize"
              >
                <option value="sale">Sale</option>
                <option value="payment_received">Payment Received</option>
                <option value="purchase">Purchase</option>
                <option value="expense">Expense</option>
              </select>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-[#EDE4D8] flex items-center justify-between">
            <button
              type="button"
              onClick={handleRejectDraft}
              className="px-4 py-2.5 border border-[#E0D0C5] text-[#864E46] hover:bg-[#F8F2EB] text-xs font-semibold rounded-xl flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" /> Discard Draft
            </button>

            <button
              type="button"
              onClick={handleConfirmDraft}
              disabled={confirmingLoading || !amount}
              className="px-6 py-2.5 bg-[#9E6056] hover:bg-[#864E46] text-[#FAF7F2] text-xs font-semibold rounded-xl shadow-xs flex items-center gap-2 disabled:opacity-50 transition"
            >
              {confirmingLoading ? (
                <span>Writing to PostgreSQL...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" /> Confirm &amp; Save to Ledger
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Stage: Confirmed & Written to Ledger */}
      {stage === 'confirmed' && (
        <div className="bg-[#FAF7F2] border border-[#EDE4D8] rounded-3xl p-8 sm:p-10 text-center space-y-6 shadow-xs animate-fadeIn">
          <div className="w-16 h-16 bg-[#758670] text-white rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#758670]">
              Verified Khata
            </span>
            <h3 className="font-serif-editorial text-3xl font-bold text-[#2D2320] mt-1">
              Transaction Permanently Recorded
            </h3>
            <p className="text-xs text-[#6D5C57] max-w-md mx-auto mt-2">
              Committed to PostgreSQL database via FastAPI. Customer balance and store ledger are safely updated.
            </p>
          </div>

          {confirmedTx && (
            <div className="bg-white border border-[#EDE4D8] rounded-2xl p-5 max-w-sm mx-auto text-left text-xs space-y-2.5">
              <div className="flex justify-between">
                <span className="text-[#8C7A74]">Transaction ID:</span>
                <span className="font-mono font-bold text-[#2D2320]">{confirmedTx.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8C7A74]">Customer:</span>
                <span className="font-semibold text-[#2D2320]">
                  {typeof confirmedTx.customer === 'string'
                    ? confirmedTx.customer
                    : confirmedTx.customer?.name || confirmedTx.customer_name || customerName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8C7A74]">Amount:</span>
                <span className="font-serif-editorial text-base font-bold text-[#2D2320]">
                  ₹{Number(confirmedTx.amount || amount).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8C7A74]">Status:</span>
                <span className="font-semibold text-[#4B6344] uppercase">
                  Verified &bull; Saved
                </span>
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={resetFlow}
              className="px-5 py-2.5 border border-[#DED4C7] bg-white text-[#55433E] hover:bg-[#F2EAE1] text-xs font-semibold rounded-full flex items-center gap-2 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Record Another Bill
            </button>
            {onNavigateToLedger && (
              <button
                onClick={onNavigateToLedger}
                className="px-5 py-2.5 bg-[#9E6056] hover:bg-[#864E46] text-[#FAF7F2] text-xs font-semibold rounded-full flex items-center gap-2 transition"
              >
                <BookOpen className="w-3.5 h-3.5" /> View in Ledger
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceTransactionView;
