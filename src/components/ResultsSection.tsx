import {
  ArrowRight,
  Check,
  CheckCircle2,
  GitMerge,
  MessageSquareText,
  Plus,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { AbilityIcon } from './AbilityIcon';
import { PersonalPlanSection } from './PersonalPlanSection';
import { EDU_PROGRAMS } from '../data/eduPrograms';
import type { AiAnalysisResult, GoalHorizon, PersonalGoal } from '../types/career';

interface ResultsSectionProps {
  result: AiAnalysisResult | null;
  isLoading: boolean;
  error: string | null;
  personalGoals: PersonalGoal[];
  compareIds: string[];
  onToggleCompare: (programCode: string) => { limitReached: boolean };
  onAddGoal: (params: {
    title: string;
    horizon: GoalHorizon;
    timeframe?: string;
  }) => string | null;
  onToggleGoal: (goalId: string) => void;
  onUpdateGoal: (goalId: string, nextTitle: string) => void;
  onDeleteGoal: (goalId: string) => void;
  onRetakeTest: () => void;
  onRetryAnalyze: () => void;
  onAskCounselor: () => void;
  onExploreCatalog: () => void;
}

export function ResultsSection({
  result,
  isLoading,
  error,
  personalGoals,
  compareIds,
  onToggleCompare,
  onAddGoal,
  onToggleGoal,
  onUpdateGoal,
  onDeleteGoal,
  onRetakeTest,
  onRetryAnalyze,
  onAskCounselor,
  onExploreCatalog,
}: ResultsSectionProps) {
  if (isLoading) {
    return (
      <section aria-busy="true" className="max-w-4xl mx-auto py-8 space-y-6">
        <div className="bg-white border border-[#DCE4EE] rounded-2xl p-8 text-center">
          <div className="w-10 h-10 border-3 border-[#4F8FEA] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h1 className="text-xl font-bold text-[#243B64]">
            12 қабілет бейінің мен жауаптарың AI арқылы талдануда
          </h1>
          <p className="text-sm text-[#546E7A] mt-2 max-w-md mx-auto">
            Күшті жақтарың, қабілеттер үйлесімі және әртүрлі салалардан 5–7 мамандық ұсынысы
            дайындалып жатыр.
          </p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="max-w-2xl mx-auto py-8">
        <div role="alert" className="bg-white border border-red-200 rounded-2xl p-6 sm:p-8 space-y-4">
          <h1 className="text-xl font-bold text-[#243B64]">Талдауды жүктеу мүмкін болмады</h1>
          <p className="text-sm text-red-800 leading-relaxed">{error}</p>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={onRetryAnalyze}
              className="px-5 py-2.5 min-h-[44px] rounded-xl bg-[#F4B942] text-[#243B64] text-sm font-bold hover:bg-[#E5A932] cursor-pointer"
            >
              Қайталап көру
            </button>
            <button
              type="button"
              onClick={onRetakeTest}
              className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl border border-[#DCE4EE] text-sm font-semibold text-[#243B64] hover:bg-[#F5F7FA] cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              <span>Қайта тапсыру</span>
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (!result) {
    return (
      <section className="max-w-2xl mx-auto py-10 text-center bg-white border border-[#DCE4EE] rounded-2xl p-8">
        <h1 className="text-xl font-bold text-[#243B64]">Әзірге тест нәтижесі жоқ</h1>
        <p className="text-sm text-[#546E7A] mt-2">
          12 қабілет бейініңді және өзіңе сәйкес болуы мүмкін мамандықтарды көру үшін алдымен
          сауалнаманы толтыр.
        </p>
        <button
          type="button"
          onClick={onRetakeTest}
          className="mt-6 px-6 py-3 min-h-[44px] rounded-xl bg-[#F4B942] text-[#243B64] text-sm font-bold hover:bg-[#E5A932] cursor-pointer"
        >
          Тестті бастау
        </button>
      </section>
    );
  }

  return (
    <section aria-labelledby="results-heading" className="space-y-8">
      {/* Жалпы қорытынды және ескерту */}
      <div className="bg-white border border-[#DCE4EE] rounded-2xl p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3 max-w-3xl">
            <p className="text-xs font-bold text-[#4F8FEA]">
              12 қабілет бейіні · Жеке талдау нәтижесі
            </p>
            <h1 id="results-heading" className="text-2xl sm:text-3xl font-extrabold text-[#243B64]">
              Сенің қабілеттер бейінің және мамандық бағдарың
            </h1>
            <p className="text-base text-[#263238] leading-relaxed">{result.summary}</p>
          </div>

          <button
            type="button"
            onClick={onRetakeTest}
            className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl border border-[#DCE4EE] bg-white text-sm font-semibold text-[#243B64] hover:bg-[#F5F7FA] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            <span>Қайта тапсыру</span>
          </button>
        </div>

        <div className="mt-6 p-4 rounded-xl bg-[#F5F7FA] border border-[#DCE4EE] flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-[#4F8FEA] shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm text-[#263238] leading-relaxed">{result.disclaimer}</p>
        </div>
      </div>

      {/* 1. «Сенің қабілеттерің» — 12 қабілеттің бағасы көрсетілген диаграмма */}
      <section
        aria-labelledby="section-abilities-chart"
        className="bg-white border border-[#DCE4EE] rounded-2xl p-6 sm:p-8 space-y-6"
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs font-bold text-[#4F8FEA]">01</p>
            <h2 id="section-abilities-chart" className="text-xl sm:text-2xl font-bold text-[#243B64] mt-0.5">
              Сенің қабілеттерің
            </h2>
            <p className="text-sm text-[#546E7A] mt-1">
              12 қабілеттің нәтижесі ең жоғары көрсеткіштен төмен қарай реттелген.
            </p>
          </div>
          <p className="text-xs text-[#546E7A]">Шкала: 20% – 100% (1–5 балдық жауап негізінде)</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
          {result.abilityProfile.map((ability, idx) => {
            const isTop = idx < 4;
            return (
              <div
                key={ability.abilityId}
                className="pb-4 border-b border-[#EDF2F7] last:border-b-0 space-y-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        isTop ? 'bg-[#EEF4FC] text-[#243B64]' : 'bg-[#F5F7FA] text-[#546E7A]'
                      }`}
                    >
                      <AbilityIcon name={ability.iconName} className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-[#546E7A] tabular-nums">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-[#243B64] truncate">
                          {ability.title}
                        </h3>
                      </div>
                      <p className="text-xs text-[#546E7A] mt-0.5 leading-relaxed">
                        {ability.shortDescription}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono text-sm font-bold text-[#243B64] tabular-nums">
                      {ability.percentage}%
                    </span>
                    <p className="font-mono text-[11px] text-[#546E7A] tabular-nums">
                      {ability.rawScore}/{ability.maxScore} · {ability.levelLabel}
                    </p>
                  </div>
                </div>

                <div
                  className="w-full h-2.5 bg-[#EDF2F7] rounded-full overflow-hidden"
                  role="img"
                  aria-label={`${ability.title}: ${ability.percentage}%`}
                >
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      idx === 0 ? 'bg-[#F4B942]' : isTop ? 'bg-[#4F8FEA]' : 'bg-[#90A4AE]'
                    }`}
                    style={{ width: `${ability.percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. «Күшті жақтарың» және 3. «Қабілеттеріңнің үйлесімі» */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section
          aria-labelledby="section-strengths"
          className="lg:col-span-6 bg-white border border-[#DCE4EE] rounded-2xl p-6 sm:p-7 space-y-5"
        >
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-[#F4B942] shrink-0" aria-hidden="true" />
            <div>
              <p className="font-mono text-xs font-bold text-[#4F8FEA]">02</p>
              <h2 id="section-strengths" className="text-xl font-bold text-[#243B64]">
                Күшті жақтарың
              </h2>
            </div>
          </div>

          <div className="space-y-4">
            {result.topStrengths.map((strength) => (
              <div
                key={strength.abilityTitle}
                className="pb-4 border-b border-[#EDF2F7] last:border-b-0 last:pb-0"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-bold text-[#243B64]">{strength.abilityTitle}</h3>
                  <span className="font-mono text-sm font-bold text-[#4F8FEA] tabular-nums">
                    {strength.percentage}%
                  </span>
                </div>
                <p className="text-sm text-[#263238] mt-1.5 leading-relaxed">
                  {strength.explanation}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="section-combinations"
          className="lg:col-span-6 bg-white border border-[#DCE4EE] rounded-2xl p-6 sm:p-7 space-y-5"
        >
          <div className="flex items-center gap-2.5">
            <GitMerge className="w-5 h-5 text-[#4F8FEA] shrink-0" aria-hidden="true" />
            <div>
              <p className="font-mono text-xs font-bold text-[#4F8FEA]">03</p>
              <h2 id="section-combinations" className="text-xl font-bold text-[#243B64]">
                Қабілеттеріңнің үйлесімі
              </h2>
            </div>
          </div>

          <div className="space-y-4">
            {result.abilityCombinations.map((combo) => (
              <div
                key={combo.pairTitle}
                className="p-4 rounded-xl bg-[#F5F7FA] border border-[#DCE4EE] space-y-1.5"
              >
                <h3 className="text-base font-bold text-[#243B64]">{combo.pairTitle}</h3>
                {combo.abilities.length > 0 && (
                  <p className="text-xs font-semibold text-[#4F8FEA]">
                    {combo.abilities.join(' + ')}
                  </p>
                )}
                <p className="text-sm text-[#263238] leading-relaxed">{combo.meaning}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 4. «Дамытуға болатын тұстарың» */}
      <section
        aria-labelledby="section-growth"
        className="bg-white border border-[#DCE4EE] rounded-2xl p-6 sm:p-8 space-y-5"
      >
        <div className="flex items-start gap-3">
          <TrendingUp className="w-5 h-5 text-[#4F8FEA] shrink-0 mt-1" aria-hidden="true" />
          <div>
            <p className="font-mono text-xs font-bold text-[#4F8FEA]">04</p>
            <h2 id="section-growth" className="text-xl sm:text-2xl font-bold text-[#243B64]">
              Дамытуға болатын тұстарың
            </h2>
            <p className="text-sm text-[#546E7A] mt-1">
              Төменірек көрсеткіш шектеу емес — тәжірибе арқылы оңай жетілдіруге болатын бағыттар.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {result.growthAreas.map((area) => (
            <div
              key={area.abilityTitle}
              className="p-5 rounded-xl bg-[#F5F7FA] border border-[#DCE4EE] flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-bold text-[#243B64]">{area.abilityTitle}</h3>
                  <span className="font-mono text-xs font-bold text-[#546E7A] tabular-nums">
                    {area.percentage}%
                  </span>
                </div>
                <p className="text-sm text-[#263238] mt-2 leading-relaxed">{area.advice}</p>
              </div>

              {area.exercises.length > 0 && (
                <div className="pt-3 border-t border-[#DCE4EE]">
                  <p className="text-xs font-semibold text-[#546E7A]">Жаттығулар мен әрекеттер</p>
                  <ul className="mt-2 space-y-1.5 text-xs sm:text-sm text-[#263238]">
                    {area.exercises.map((ex) => (
                      <li key={ex} className="flex items-start gap-2">
                        <span aria-hidden="true" className="text-[#4F8FEA] font-bold">
                          —
                        </span>
                        <span>{ex}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 5. «Саған сәйкес болуы мүмкін мамандықтар» (5–7 әртүрлі сала мамандығы) */}
      <section aria-labelledby="section-recommendations" className="space-y-5">
        <div>
          <p className="font-mono text-xs font-bold text-[#4F8FEA]">05</p>
          <h2
            id="section-recommendations"
            className="text-xl sm:text-2xl font-bold text-[#243B64] mt-0.5"
          >
            Саған сәйкес болуы мүмкін мамандықтар ({result.recommendations.length})
          </h2>
          <p className="text-sm text-[#546E7A] mt-1">
            Қабілеттер бейініңе сүйеніп жүктелген 134 ресми мамандық (ББТ) тізбесінен таңдалған
            нұсқалар — зерттеу үшін бағдар ретінде қарастыр.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {result.recommendations.map((rec, index) => {
            const matchedProg = rec.programCode
              ? EDU_PROGRAMS.find((p) => p.code.toLowerCase() === rec.programCode?.toLowerCase())
              : undefined;
            const isInCompare = matchedProg ? compareIds.includes(matchedProg.code) : false;

            return (
              <article
                key={`${rec.programCode ?? rec.title}-${index}`}
                className="bg-white border border-[#DCE4EE] rounded-2xl p-6 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-xs font-bold text-[#4F8FEA] tabular-nums">
                        {String(index + 1).padStart(2, '0')}
                        {rec.programCode ? ` · ${rec.programCode}` : ''} · {rec.relatedField}
                      </p>
                      <h3 className="text-xl font-bold text-[#243B64] mt-1">{rec.title}</h3>
                    </div>

                    {matchedProg && (
                      <button
                        type="button"
                        onClick={() => onToggleCompare(matchedProg.code)}
                        aria-pressed={isInCompare}
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 min-h-[34px] rounded-lg text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
                          isInCompare
                            ? 'bg-[#FFF8E6] text-[#243B64] border border-[#F4B942]'
                            : 'bg-[#F5F7FA] text-[#243B64] hover:bg-[#EEF4FC]'
                        }`}
                      >
                        {isInCompare ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#9A6B11]" aria-hidden="true" />
                            <span>Таңдалды</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Салыстыру</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-[#546E7A]">Не істейді</h4>
                    <p className="text-sm text-[#263238] leading-relaxed mt-1">{rec.whatTheyDo}</p>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-[#546E7A]">Сәйкес келетін қабілеттер</h4>
                    <p className="text-sm font-semibold text-[#243B64] mt-1">
                      {rec.matchingAbilities.join(' · ')}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-[#546E7A]">Неге ұсынылды</h4>
                    <p className="text-sm text-[#263238] leading-relaxed mt-1">{rec.matchReason}</p>
                  </div>

                  <div className="pt-3 border-t border-[#EDF2F7] grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs font-semibold text-[#546E7A]">
                        Бейіндік пәндер (ҰБТ)
                      </h4>
                      <p className="mt-1 text-sm font-semibold text-[#243B64]">
                        {rec.schoolSubjects.join(' · ')}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-[#546E7A]">Дамыту керек дағдылар</h4>
                      <p className="mt-1 text-sm text-[#263238]">
                        {rec.skillsToDevelop.join(' · ')}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* 6. «Келесі қадам» */}
      <section
        aria-labelledby="section-next-steps"
        className="bg-white border border-[#DCE4EE] rounded-2xl p-6 sm:p-8 space-y-5"
      >
        <div>
          <p className="font-mono text-xs font-bold text-[#4F8FEA]">06</p>
          <h2 id="section-next-steps" className="text-xl sm:text-2xl font-bold text-[#243B64] mt-0.5">
            Келесі қадам
          </h2>
          <p className="text-sm text-[#546E7A] mt-1">
            Осы аптада өзің байқап көруге болатын 3–5 нақты әрекет:
          </p>
        </div>

        <ol className="space-y-3">
          {result.nextSteps.map((step, idx) => {
            const alreadyInPlan = personalGoals.some(
              (g) => g.title.toLowerCase() === step.trim().toLowerCase()
            );
            return (
              <li
                key={step}
                className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 p-3.5 rounded-xl bg-[#F5F7FA] border border-[#DCE4EE]"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <CheckCircle2
                    className="w-5 h-5 text-[#4F8FEA] shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <div className="text-sm text-[#263238] leading-relaxed">
                    <span className="font-mono text-xs font-bold text-[#243B64] mr-2 tabular-nums">
                      {String(idx + 1).padStart(2, '0')}.
                    </span>
                    {step}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={alreadyInPlan}
                  onClick={() =>
                    onAddGoal({
                      title: step,
                      horizon: 'short',
                      timeframe: 'Осы аптада',
                    })
                  }
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                    alreadyInPlan
                      ? 'bg-[#EEF4FC] text-[#243B64] border border-[#4F8FEA]/50 cursor-default'
                      : 'bg-white border border-[#CBD5E1] text-[#243B64] hover:bg-[#EEF4FC] cursor-pointer'
                  }`}
                >
                  {alreadyInPlan ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#4F8FEA]" aria-hidden="true" />
                      <span>Жоспарда бар</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Жоспарға қосу</span>
                    </>
                  )}
                </button>
              </li>
            );
          })}
        </ol>
      </section>

      {/* 7. «Жеке жоспар» — қысқа және ұзақ мерзімді мақсаттар */}
      <PersonalPlanSection
        goals={personalGoals}
        onAddGoal={onAddGoal}
        onToggleGoal={onToggleGoal}
        onUpdateGoal={onUpdateGoal}
        onDeleteGoal={onDeleteGoal}
      />

      {/* 8. «Қайта тапсыру» және қосымша бағыттау */}
      <div className="bg-[#243B64] text-white rounded-2xl p-6 sm:p-8 flex flex-wrap items-center justify-between gap-5">
        <div className="max-w-xl">
          <p className="font-mono text-xs font-bold text-[#F4B942]">08</p>
          <h2 className="text-lg sm:text-xl font-bold mt-0.5">
            Зерттеуді жалғастыр немесе тестті қайта тапсыр
          </h2>
          <p className="text-sm text-slate-200 mt-1">
            AI кеңесшіден сұрақ қойып көр, жүктелген 134 мамандық (ББТ) каталогынан салыстыр немесе
            жауаптарыңды жаңартып тестті қайта өтіп көр.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onAskCounselor}
            className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl bg-[#F4B942] text-[#243B64] text-sm font-bold hover:bg-[#E5A932] cursor-pointer"
          >
            <MessageSquareText className="w-4 h-4" aria-hidden="true" />
            <span>AI кеңесшіден сұрау</span>
          </button>
          <button
            type="button"
            onClick={onExploreCatalog}
            className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl bg-[#1B2D4E] border border-[#355284] text-sm font-semibold text-white hover:border-[#4F8FEA] cursor-pointer"
          >
            <span>Каталогты көру</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onRetakeTest}
            className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl bg-white text-[#243B64] text-sm font-semibold hover:bg-[#F5F7FA] cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            <span>Қайта тапсыру</span>
          </button>
        </div>
      </div>
    </section>
  );
}
