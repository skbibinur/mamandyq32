import { useState, useRef, useEffect, FormEvent } from 'react';
import { Send, Trash2 } from 'lucide-react';
import type { AiAnalysisResult, ChatMessage } from '../types/career';

interface AiCounselorSectionProps {
  messages: ChatMessage[];
  isSending: boolean;
  error: string | null;
  testContext: AiAnalysisResult | null;
  onSendMessage: (text: string) => void;
  onClearChat: () => void;
  onStartTest: () => void;
}

const STARTER_QUESTIONS = [
  'Информатика мен математиканы ұнатсам, қандай мамандықтарды қарауға болады?',
  'Биология мен химия бағытында дәрігерден басқа тағы қандай мамандықтар бар?',
  'Шығармашылық пен технологияны біріктіретін қандай мамандықтар бар?',
  'Болашақ мамандық таңдағанда мектепте қандай дағдыларды дамыту маңызды?',
];

export function AiCounselorSection({
  messages,
  isSending,
  error,
  testContext,
  onSendMessage,
  onClearChat,
  onStartTest,
}: AiCounselorSectionProps) {
  const [input, setInput] = useState('');
  const listEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages.length, isSending]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isSending) {
      return;
    }
    onSendMessage(trimmed);
    setInput('');
  };

  return (
    <section aria-labelledby="counselor-heading" className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#4F8FEA]">AI кеңесші</p>
          <h1 id="counselor-heading" className="text-2xl sm:text-3xl font-extrabold text-[#243B64] mt-1">
            Мамандықтар туралы сұрақ-жауап
          </h1>
          <p className="text-sm text-[#546E7A] mt-1.5 max-w-2xl">
            Өзіңді қызықтыратын мамандық, мектеп пәндері немесе дағдылар жайлы сұрақ қой. AI
            кеңесші қысқа әрі түсінікті жауап береді.
          </p>
        </div>

        {messages.length > 0 && (
          <button
            type="button"
            onClick={onClearChat}
            className="inline-flex items-center gap-2 px-3.5 py-2 min-h-[40px] rounded-xl border border-[#DCE4EE] bg-white text-xs font-semibold text-[#263238] hover:bg-[#F5F7FA] cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Әңгімені тазалау</span>
          </button>
        )}
      </div>

      {testContext ? (
        <div className="p-4 rounded-xl bg-[#EEF4FC] border border-[#4F8FEA]/35 text-sm text-[#243B64]">
          <span className="font-bold">Тест нәтижесі ескеріледі:</span>{' '}
          {testContext.recommendations.map((r) => r.title).join(' · ')}
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-white border border-[#DCE4EE] flex flex-wrap items-center justify-between gap-3 text-sm text-[#263238]">
          <span>
            Тест тапсырсаң, AI кеңесші сенің қызығушылықтарыңа сүйеніп нақтырақ жауап бере алады.
          </span>
          <button
            type="button"
            onClick={onStartTest}
            className="text-sm font-bold text-[#243B64] hover:text-[#4F8FEA] underline underline-offset-4 whitespace-nowrap cursor-pointer"
          >
            Тестке өту
          </button>
        </div>
      )}

      <div className="bg-white border border-[#DCE4EE] rounded-2xl overflow-hidden flex flex-col">
        <div
          className="p-5 sm:p-6 space-y-4 min-h-[340px] max-h-[520px] overflow-y-auto"
          aria-live="polite"
        >
          {messages.length === 0 ? (
            <div className="py-4 space-y-5">
              <div>
                <h2 className="text-base font-bold text-[#243B64]">
                  Сұрақ қоюды мына тақырыптардан бастауға болады:
                </h2>
                <p className="text-xs text-[#546E7A] mt-1">
                  Төмендегі сұрақтардың бірін таңда немесе өз сұрағыңды жаз.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {STARTER_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => onSendMessage(q)}
                    disabled={isSending}
                    className="text-left p-4 rounded-xl border border-[#DCE4EE] bg-[#F5F7FA] hover:bg-[#EEF4FC] hover:border-[#4F8FEA] transition-colors text-sm text-[#263238] leading-snug cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                      isUser
                        ? 'bg-[#243B64] text-white'
                        : 'bg-[#F5F7FA] text-[#263238] border border-[#DCE4EE]'
                    }`}
                  >
                    <p
                      className={`text-[11px] font-semibold mb-1 ${
                        isUser ? 'text-[#8EC0FF]' : 'text-[#546E7A]'
                      }`}
                    >
                      {isUser ? 'Сен' : 'AI кеңесші'} · {msg.timestamp}
                    </p>
                    <p>{msg.content}</p>
                  </div>
                </div>
              );
            })
          )}

          {isSending && (
            <div className="flex justify-start">
              <div className="rounded-2xl px-4 py-3 bg-[#F5F7FA] border border-[#DCE4EE] text-sm text-[#546E7A]">
                Жауап дайындалуда...
              </div>
            </div>
          )}

          <div ref={listEndRef} />
        </div>

        {error && (
          <div role="alert" className="mx-5 mb-3 p-3 rounded-xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-900">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="border-t border-[#DCE4EE] p-3 sm:p-4 bg-[#F5F7FA] flex items-center gap-3"
        >
          <label htmlFor="counselor-input" className="sr-only">
            AI кеңесшіге сұрақ жазу
          </label>
          <input
            id="counselor-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Мысалы: UI/UX дизайнер болу үшін не үйрену керек?"
            disabled={isSending}
            className="flex-1 min-w-0 px-4 py-3 min-h-[44px] bg-white border border-[#CBD5E1] rounded-xl text-sm text-[#263238] placeholder:text-[#546E7A]/70 focus:outline-none focus:border-[#4F8FEA]"
          />
          <button
            type="submit"
            disabled={isSending || !input.trim()}
            aria-label="Сұрақты жіберу"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[44px] rounded-xl bg-[#F4B942] text-[#243B64] text-sm font-bold hover:bg-[#E5A932] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span className="hidden sm:inline">Жіберу</span>
            <Send className="w-4 h-4" aria-hidden="true" />
          </button>
        </form>
      </div>
    </section>
  );
}
