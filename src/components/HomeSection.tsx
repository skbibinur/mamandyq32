import { useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Compass,
  GraduationCap,
  Layers,
  MessageSquareText,
  Scale,
  ShieldCheck,
  Target,
} from 'lucide-react';
import { ABILITIES } from '../data/abilities';
import { AbilityIcon } from './AbilityIcon';
import type { AbilityId, AppSection } from '../types/career';

interface HomeSectionProps {
  onStartTest: () => void;
  onNavigate: (section: AppSection) => void;
  hasResults: boolean;
}

type PathwayStageId = 'ability' | 'subject' | 'profession' | 'goal';

interface PathwayStage {
  id: PathwayStageId;
  step: string;
  label: string;
  headline: string;
  keywords: string;
  detail: string;
  accentBg: string;
  accentBorder: string;
  accentText: string;
  iconBg: string;
  actionLabel: string;
  targetSection: AppSection | 'test';
}

const PATHWAY_STAGES: PathwayStage[] = [
  {
    id: 'ability',
    step: '01',
    label: 'Қабілет',
    headline: '12 қабілет бейіні',
    keywords: 'Логика · Кеңістік · Тіл · ЖИ',
    detail: '24 сұрақ арқылы қай іс өзіңе табиғи әрі жеңіл берілетінін пайыздық диаграммада көресің.',
    accentBg: 'bg-[#EEF4FC]',
    accentBorder: 'border-[#4F8FEA]/55',
    accentText: 'text-[#243B64]',
    iconBg: 'bg-[#243B64] text-white',
    actionLabel: 'Тестті бастау',
    targetSection: 'test',
  },
  {
    id: 'subject',
    step: '02',
    label: 'Бейіндік пән',
    headline: 'ҰБТ пәндер бағыты',
    keywords: 'Математика · Биология · Шығармашылық',
    detail: 'Қабілеттеріңе сәйкес мектеп пәндері мен ресми ҰБТ бейіндік пән жұптарын анықтайсың.',
    accentBg: 'bg-[#EFF7FF]',
    accentBorder: 'border-[#4F8FEA]/70',
    accentText: 'text-[#243B64]',
    iconBg: 'bg-[#4F8FEA] text-white',
    actionLabel: 'Пәндерді сүзу',
    targetSection: 'catalog',
  },
  {
    id: 'profession',
    step: '03',
    label: 'Мамандық',
    headline: '134 ББТ тізбесі',
    keywords: 'B057 IT · BM086 Медицина · B073 Сәулет',
    detail: 'AI талдау нәтижесі сенің бейініңе сай әртүрлі саладағы 5–7 ресми мамандықты ұсынады.',
    accentBg: 'bg-[#F5F7FA]',
    accentBorder: 'border-[#243B64]/45',
    accentText: 'text-[#243B64]',
    iconBg: 'bg-[#243B64] text-[#F4B942]',
    actionLabel: '134 мамандықты көру',
    targetSection: 'catalog',
  },
  {
    id: 'goal',
    step: '04',
    label: 'Мақсат',
    headline: 'Жеке даму жоспары',
    keywords: '1–4 апта · 6–12 ай · Прогресс',
    detail: 'Нәтиже бетінде қысқа және ұзақ мерзімді мақсаттарыңды жазып, орындалуын бақылайсың.',
    accentBg: 'bg-[#FFF9EB]',
    accentBorder: 'border-[#F4B942]',
    accentText: 'text-[#243B64]',
    iconBg: 'bg-[#F4B942] text-[#243B64]',
    actionLabel: 'Мақсат жоспарына тесттен өту',
    targetSection: 'test',
  },
];

function getAbilityColorTokens(id: AbilityId): {
  iconBox: string;
  indexText: string;
} {
  switch (id) {
    case 'physical':
    case 'spatial':
    case 'nature':
      return {
        iconBox: 'bg-[#EEF4FC] text-[#243B64]',
        indexText: 'text-[#4F8FEA]',
      };
    case 'aesthetic':
    case 'innovative':
      return {
        iconBox: 'bg-[#FFF8E6] text-[#9A6B11]',
        indexText: 'text-[#B57E14]',
      };
    case 'social':
    case 'linguistic':
    case 'meaning':
      return {
        iconBox: 'bg-[#EBF4FF] text-[#2B6CB0]',
        indexText: 'text-[#4F8FEA]',
      };
    case 'logical':
    case 'informational':
    case 'systemic':
    case 'ai_literacy':
    default:
      return {
        iconBox: 'bg-[#243B64]/10 text-[#243B64]',
        indexText: 'text-[#243B64]/75',
      };
  }
}

export function HomeSection({ onStartTest, onNavigate, hasResults }: HomeSectionProps) {
  const [selectedStageId, setSelectedStageId] = useState<PathwayStageId>('ability');
  const activeStage =
    PATHWAY_STAGES.find((stage) => stage.id === selectedStageId) ?? PATHWAY_STAGES[0];

  const handleStageAction = (stage: PathwayStage) => {
    if (stage.targetSection === 'test') {
      onStartTest();
      return;
    }
    onNavigate(stage.targetSection);
  };

  return (
    <div className="space-y-16 sm:space-y-20">
      <section className="relative rounded-3xl bg-white border border-[#DCE4EE] p-6 sm:p-10 lg:p-12 overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#4F8FEA]/15 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 left-1/3 w-80 h-80 rounded-full bg-[#F4B942]/12 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-35"
        />

        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
            <p className="text-sm font-bold text-[#4F8FEA] tracking-tight">
              Қабілет · Мамандық · Мақсат · Бағыттаушы платформа
            </p>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#243B64] leading-[1.12]">
              Қабілеттеріңді танып, мамандық пен мақсатыңды айқында
            </h1>

            <p className="text-base sm:text-lg text-[#263238] leading-relaxed max-w-xl">
              «Оңай көмек» — 12 қабілет бойынша 24 қысқа сұрақ арқылы күшті қырларыңды анықтап,
              жүктелген 134 ресми мамандық (ББТ) тізбесі мен жеке мақсат жоспары арқылы бағыт
              беретін жүйе.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1">
              <button
                type="button"
                onClick={onStartTest}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 min-h-[48px] text-base font-bold text-[#243B64] bg-[#F4B942] rounded-xl hover:bg-[#E5A932] active:bg-[#D89B25] transition-colors duration-150 whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#243B64]"
              >
                <span>Тестті бастау</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>

              {hasResults ? (
                <button
                  type="button"
                  onClick={() => onNavigate('results')}
                  className="inline-flex items-center justify-center px-5 py-3.5 min-h-[48px] text-sm font-semibold text-[#243B64] bg-white border border-[#CBD5E1] rounded-xl hover:bg-[#F5F7FA] transition-colors whitespace-nowrap cursor-pointer"
                >
                  Соңғы нәтижені көру
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onNavigate('catalog')}
                  className="inline-flex items-center justify-center px-5 py-3.5 min-h-[48px] text-sm font-semibold text-[#243B64] bg-white border border-[#CBD5E1] rounded-xl hover:bg-[#F5F7FA] transition-colors whitespace-nowrap cursor-pointer"
                >
                  Мамандықтар тізбесі (134 ББТ)
                </button>
              )}
            </div>

            <div className="p-4 rounded-xl bg-[#F5F7FA] border border-[#DCE4EE] flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#4F8FEA] shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-sm text-[#263238] leading-relaxed">
                <strong className="font-semibold text-[#243B64]">Маңызды ескерту:</strong> Бұл тест
                нақты үкім немесе кәсіби диагноз емес — тек өз қабілеттеріңді танып, мамандықтарды
                зерттеуге арналған бағдар. Аты-жөні, телефон нөмірі немесе мекенжай сұралмайды.
              </p>
            </div>
          </div>

          {/* Визуалды сызба: Қабілет → Бейіндік пән → Мамандық → Мақсат */}
          <div className="lg:col-span-6 flex flex-col justify-between rounded-2xl bg-[#F5F7FA] border border-[#DCE4EE] p-5 sm:p-7 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-mono text-xs font-bold text-[#4F8FEA]">
                  Бағдар сызбасы · 4 кезең
                </p>
                <h2 className="text-lg sm:text-xl font-bold text-[#243B64] mt-0.5">
                  Қабілеттен мақсатқа дейінгі бағыт картасы
                </h2>
              </div>
              <span className="font-mono text-xs font-semibold text-[#546E7A] tabular-nums">
                Кезең: {activeStage.step} / 04
              </span>
            </div>

            {/* SVG траектория және байланыс сызбасы */}
            <div className="relative rounded-xl bg-white border border-[#DCE4EE] p-4 sm:p-5 space-y-4">
              <svg
                viewBox="0 0 560 96"
                className="w-full h-20 sm:h-24"
                role="img"
                aria-label="Қабілет, бейіндік пән, мамандық және мақсат арасындағы байланыс сызбасы"
              >
                <defs>
                  <linearGradient id="pathwayFlow" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#243B64" />
                    <stop offset="35%" stopColor="#4F8FEA" />
                    <stop offset="70%" stopColor="#243B64" />
                    <stop offset="100%" stopColor="#F4B942" />
                  </linearGradient>
                </defs>

                {/* Бағыттаушы қисық сызықтар */}
                <path
                  d="M 55 48 C 105 16, 155 16, 200 48 C 245 80, 305 80, 355 48 C 405 16, 455 16, 505 48"
                  fill="none"
                  stroke="#DCE4EE"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <path
                  d="M 55 48 C 105 16, 155 16, 200 48 C 245 80, 305 80, 355 48 C 405 16, 455 16, 505 48"
                  fill="none"
                  stroke="url(#pathwayFlow)"
                  strokeWidth="2.5"
                  strokeDasharray="6 5"
                  strokeLinecap="round"
                />

                {/* 4 негізгі түйін */}
                {[
                  { id: 'ability', cx: 55, label: 'ҚАБІЛЕТ', fill: '#243B64', tint: '#E5ECF6' },
                  { id: 'subject', cx: 200, label: 'ПӘН', fill: '#4F8FEA', tint: '#E8F2FD' },
                  { id: 'profession', cx: 355, label: 'МАМАНДЫҚ', fill: '#243B64', tint: '#EEF4FC' },
                  { id: 'goal', cx: 505, label: 'МАҚСАТ', fill: '#D99B26', tint: '#FFF6DF' },
                ].map((node) => {
                  const isActive = selectedStageId === node.id;
                  return (
                    <g
                      key={node.id}
                      onClick={() => setSelectedStageId(node.id as PathwayStageId)}
                      className="cursor-pointer"
                    >
                      <circle
                        cx={node.cx}
                        cy={48}
                        r={isActive ? 22 : 17}
                        fill={node.tint}
                        stroke={node.fill}
                        strokeWidth={isActive ? 2.5 : 1.5}
                      />
                      <circle cx={node.cx} cy={48} r={6} fill={node.fill} />
                      <text
                        x={node.cx}
                        y={86}
                        textAnchor="middle"
                        className="font-mono text-[10px] font-bold"
                        fill={isActive ? '#243B64' : '#546E7A'}
                      >
                        {node.label}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Түсті түйін батырмалары */}
              <div className="grid grid-cols-2 gap-2.5">
                {PATHWAY_STAGES.map((stage) => {
                  const isActive = selectedStageId === stage.id;
                  return (
                    <button
                      key={stage.id}
                      type="button"
                      onClick={() => setSelectedStageId(stage.id)}
                      aria-pressed={isActive}
                      className={`text-left p-3 rounded-xl border transition-all duration-150 cursor-pointer ${
                        isActive
                          ? `${stage.accentBg} ${stage.accentBorder}`
                          : 'bg-[#F5F7FA] border-[#DCE4EE] hover:bg-white hover:border-[#4F8FEA]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-md font-mono text-[11px] font-bold ${
                            isActive ? stage.iconBg : 'bg-[#DCE4EE] text-[#243B64]'
                          }`}
                        >
                          {stage.step}
                        </span>
                        <span
                          className={`text-xs font-bold ${
                            isActive ? stage.accentText : 'text-[#546E7A]'
                          }`}
                        >
                          {stage.label}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-[#263238] mt-2 leading-tight">
                        {stage.headline}
                      </p>
                      <p className="text-[11px] text-[#546E7A] mt-1 truncate">{stage.keywords}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Белсенді кезең түсіндірмесі + өту батырмасы */}
            <div
              className={`p-4 rounded-xl border ${activeStage.accentBg} ${activeStage.accentBorder} flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  {activeStage.id === 'ability' && (
                    <Compass className={`w-4 h-4 shrink-0 ${activeStage.accentText}`} aria-hidden="true" />
                  )}
                  {activeStage.id === 'subject' && (
                    <GraduationCap
                      className={`w-4 h-4 shrink-0 ${activeStage.accentText}`}
                      aria-hidden="true"
                    />
                  )}
                  {activeStage.id === 'profession' && (
                    <Layers className={`w-4 h-4 shrink-0 ${activeStage.accentText}`} aria-hidden="true" />
                  )}
                  {activeStage.id === 'goal' && (
                    <Target className={`w-4 h-4 shrink-0 ${activeStage.accentText}`} aria-hidden="true" />
                  )}
                  <p className={`text-xs font-bold ${activeStage.accentText}`}>
                    {activeStage.step}. {activeStage.label} — {activeStage.headline}
                  </p>
                </div>
                <p className="text-xs sm:text-sm text-[#263238] leading-relaxed">
                  {activeStage.detail}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleStageAction(activeStage)}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 min-h-[38px] rounded-lg bg-[#243B64] text-xs font-semibold text-white hover:bg-[#1C2F51] whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>{activeStage.actionLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="abilities-overview-heading" className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-[#4F8FEA]">Тест бағыттары</p>
            <h2
              id="abilities-overview-heading"
              className="text-2xl sm:text-3xl font-bold tracking-tight text-[#243B64] mt-1"
            >
              Тест сенің 12 түрлі қабілетіңді зерттейді
            </h2>
          </div>
          <p className="text-sm text-[#546E7A] max-w-md">
            Әр қабілет «Маған мүлде тән емес» пен «Маған толық тән» шкаласымен бағаланып,
            жоғарыдан төмен қарай бейініңді құрайды.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ABILITIES.map((ability) => {
            const colors = getAbilityColorTokens(ability.id);
            return (
              <div
                key={ability.id}
                className="p-5 bg-white rounded-2xl border border-[#DCE4EE] flex items-start gap-4 transition-transform duration-150 hover:-translate-y-0.5 hover:border-[#4F8FEA]/60"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colors.iconBox}`}
                >
                  <AbilityIcon name={ability.iconName} className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className={`font-mono text-xs font-bold tabular-nums ${colors.indexText}`}>
                    {String(ability.order).padStart(2, '0')}
                  </p>
                  <h3 className="text-base font-bold text-[#243B64] mt-0.5">{ability.title}</h3>
                  <p className="text-xs sm:text-sm text-[#263238]/85 mt-1.5 leading-relaxed">
                    {ability.shortDescription}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section
        aria-labelledby="platform-tools-heading"
        className="rounded-3xl bg-[#243B64] text-white p-6 sm:p-10 lg:p-12"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-4">
            <p className="text-sm font-bold text-[#F4B942] tracking-wide">
              Мамандық пен мақсат құралдары
            </p>
            <h2
              id="platform-tools-heading"
              className="text-2xl sm:text-3xl font-bold tracking-tight text-white"
            >
              Нәтиже алғаннан кейін де зерттеуді жалғастыр
            </h2>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
              Тест тапсырып қана қоймай, жүктелген 134 мамандықты (ББТ) зертте, олардың бейіндік
              пәндерін қатар салыстыр, жеке мақсаттарыңды жаз және AI кеңесшіден сұра.
            </p>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => onNavigate('catalog')}
              className="text-left p-5 rounded-2xl bg-[#1B2D4E] border border-[#355284] hover:border-[#4F8FEA] transition-colors flex flex-col justify-between min-h-[170px] cursor-pointer"
            >
              <div>
                <BookOpen className="w-5 h-5 text-[#4F8FEA]" aria-hidden="true" />
                <h3 className="text-base font-bold text-white mt-3">Мамандықтар және ҰБТ пәндері</h3>
                <p className="text-xs text-slate-200 mt-1.5 leading-relaxed">
                  Жүктелген 134 ББТ тобының коды, бейіндік пәндері және бағыт сипаттамасы.
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#4F8FEA]">
                <span>Каталогты ашу</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('compare')}
              className="text-left p-5 rounded-2xl bg-[#1B2D4E] border border-[#355284] hover:border-[#4F8FEA] transition-colors flex flex-col justify-between min-h-[170px] cursor-pointer"
            >
              <div>
                <Scale className="w-5 h-5 text-[#F4B942]" aria-hidden="true" />
                <h3 className="text-base font-bold text-white mt-3">Қатар салыстыру</h3>
                <p className="text-xs text-slate-200 mt-1.5 leading-relaxed">
                  Бірден 2–3 мамандықтың пәндері мен міндеттерін салыстыр.
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#F4B942]">
                <span>Салыстыруға өту</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('counselor')}
              className="text-left p-5 rounded-2xl bg-[#1B2D4E] border border-[#355284] hover:border-[#4F8FEA] transition-colors flex flex-col justify-between min-h-[170px] cursor-pointer"
            >
              <div>
                <MessageSquareText className="w-5 h-5 text-[#4F8FEA]" aria-hidden="true" />
                <h3 className="text-base font-bold text-white mt-3">AI кеңесші</h3>
                <p className="text-xs text-slate-200 mt-1.5 leading-relaxed">
                  Мамандық, пән және болашақ мақсатың туралы сұрақтарыңа нақты жауап ал.
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#4F8FEA]">
                <span>Сұрақ қою</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
