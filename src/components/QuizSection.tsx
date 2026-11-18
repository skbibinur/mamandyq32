import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Lock } from 'lucide-react';
import { ABILITIES, LIKERT_SCALE } from '../data/abilities';
import { QUIZ_QUESTIONS } from '../data/quizQuestions';
import { validateQuizAnswers } from '../utils/careerLogic';
import { AbilityIcon } from './AbilityIcon';

interface QuizSectionProps {
  answers: Record<string, number>;
  onSelectAnswer: (questionId: string, rating: number) => void;
  onSubmitQuiz: () => void;
  isSubmitting: boolean;
  submitError: string | null;
}

export function QuizSection({
  answers,
  onSelectAnswer,
  onSubmitQuiz,
  isSubmitting,
  submitError,
}: QuizSectionProps) {
  const [abilityIndex, setAbilityIndex] = useState(0);
  const [validationNotice, setValidationNotice] = useState<string | null>(null);

  const totalAbilities = ABILITIES.length;
  const totalQuestions = QUIZ_QUESTIONS.length;
  const currentAbility = ABILITIES[abilityIndex];
  const currentQuestions = QUIZ_QUESTIONS.filter((q) => q.abilityId === currentAbility.id);

  const answeredCount = QUIZ_QUESTIONS.filter(
    (q) => typeof answers[q.id] === 'number' && answers[q.id] >= 1 && answers[q.id] <= 5
  ).length;
  const currentBlockComplete = currentQuestions.every(
    (q) => typeof answers[q.id] === 'number' && answers[q.id] >= 1 && answers[q.id] <= 5
  );
  const progressPercent = Math.round(((abilityIndex + 1) / totalAbilities) * 100);

  const handleRatingSelect = (questionId: string, value: number) => {
    onSelectAnswer(questionId, value);
    setValidationNotice(null);
  };

  const handleNext = () => {
    if (!currentBlockComplete) {
      setValidationNotice('Келесі қабілетке өту үшін осы бөлімдегі екі сұраққа да жауап бер.');
      return;
    }
    setValidationNotice(null);
    if (abilityIndex < totalAbilities - 1) {
      setAbilityIndex((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setValidationNotice(null);
    if (abilityIndex > 0) {
      setAbilityIndex((prev) => prev - 1);
    }
  };

  const handleFinish = () => {
    const check = validateQuizAnswers(answers, QUIZ_QUESTIONS);
    if (!check.isValid) {
      const firstMissingQ = QUIZ_QUESTIONS[check.missingQuestionIndexes[0]];
      const missingAbilityIdx = ABILITIES.findIndex((a) => a.id === firstMissingQ.abilityId);
      if (missingAbilityIdx >= 0) {
        setAbilityIndex(missingAbilityIdx);
      }
      setValidationNotice(
        `Барлық ${totalQuestions} сұраққа жауап берілуі керек. «${ABILITIES[missingAbilityIdx]?.title ?? ''}» бөліміндегі сұрақты толтыр.`
      );
      return;
    }
    setValidationNotice(null);
    onSubmitQuiz();
  };

  return (
    <section aria-labelledby="quiz-heading" className="max-w-3xl mx-auto">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-bold text-[#4F8FEA]">
            12 қабілет тесті · Жеке деректер сұралмайды
          </p>
          <h1 id="quiz-heading" className="text-2xl sm:text-3xl font-extrabold text-[#243B64] mt-1">
            Қабілеттер бейінін анықтау сауалнамасы
          </h1>
        </div>
        <div className="text-right shrink-0">
          <span className="font-mono text-sm font-bold text-[#243B64] tabular-nums whitespace-nowrap">
            {String(abilityIndex + 1).padStart(2, '0')} / {totalAbilities}
          </span>
        </div>
      </div>

      <div
        className="w-full h-2.5 bg-[#DCE4EE] rounded-full overflow-hidden mb-8"
        role="progressbar"
        aria-valuenow={progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Тест барысы"
      >
        <div
          className="h-full bg-[#4F8FEA] transition-transform duration-200 origin-left"
          style={{ transform: `scaleX(${(abilityIndex + 1) / totalAbilities})` }}
        />
      </div>

      <motion.div
        key={currentAbility.id}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
        className="bg-white border border-[#DCE4EE] rounded-2xl p-5 sm:p-8"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-[#EDF2F7]">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#EEF4FC] text-[#243B64] flex items-center justify-center shrink-0">
              <AbilityIcon name={currentAbility.iconName} className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#4F8FEA]">
                {String(currentAbility.order).padStart(2, '0')}-қабілет
              </p>
              <h2 className="text-xl sm:text-2xl font-bold text-[#243B64]">
                {currentAbility.title}
              </h2>
              <p className="text-sm text-[#546E7A] mt-1">{currentAbility.shortDescription}</p>
            </div>
          </div>

          <span className="font-mono text-xs font-medium text-[#546E7A] tabular-nums whitespace-nowrap">
            Жауап: {answeredCount}/{totalQuestions}
          </span>
        </div>

        <div className="mt-6 space-y-8">
          {currentQuestions.map((q, qIdx) => {
            const selectedValue = answers[q.id];
            return (
              <div key={q.id} className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-medium text-[#546E7A]">
                    {qIdx + 1}-сұрақ · {q.contextHint}
                  </p>
                  {selectedValue && (
                    <span className="font-mono text-xs font-bold text-[#243B64] tabular-nums">
                      Таңдалды: {selectedValue}/5
                    </span>
                  )}
                </div>

                <h3 className="text-base sm:text-lg font-semibold text-[#263238] leading-snug">
                  {q.question}
                </h3>

                <div
                  role="radiogroup"
                  aria-label={q.question}
                  className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-1"
                >
                  {LIKERT_SCALE.map((opt) => {
                    const isSelected = selectedValue === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => handleRatingSelect(q.id, opt.value)}
                        disabled={isSubmitting}
                        className={`p-3 min-h-[52px] rounded-xl border text-left sm:text-center transition-colors duration-150 flex sm:flex-col items-center sm:justify-center gap-2.5 sm:gap-1 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#4F8FEA] ${
                          isSelected
                            ? 'border-[#243B64] bg-[#EEF4FC] text-[#243B64] font-semibold'
                            : 'border-[#DCE4EE] bg-white text-[#263238] hover:border-[#4F8FEA]/60 hover:bg-[#F5F7FA]'
                        }`}
                      >
                        <span
                          className={`font-mono text-xs w-6 h-6 rounded-md flex items-center justify-center shrink-0 tabular-nums ${
                            isSelected
                              ? 'bg-[#243B64] text-[#F4B942] font-bold'
                              : 'bg-[#F5F7FA] text-[#546E7A]'
                          }`}
                        >
                          {opt.value}
                        </span>
                        <span className="text-xs leading-tight">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {validationNotice && (
          <div
            role="alert"
            className="mt-6 p-3.5 rounded-xl bg-[#FFF9EB] border border-[#F4B942] text-sm text-[#243B64]"
          >
            {validationNotice}
          </div>
        )}

        {submitError && (
          <div
            role="alert"
            className="mt-6 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-900"
          >
            {submitError}
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-[#EDF2F7] flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleBack}
            disabled={abilityIndex === 0 || isSubmitting}
            className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl border border-[#DCE4EE] text-sm font-semibold text-[#243B64] hover:bg-[#F5F7FA] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Артқа</span>
          </button>

          {abilityIndex < totalAbilities - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 min-h-[44px] rounded-xl bg-[#243B64] text-white text-sm font-semibold hover:bg-[#1C2F51] cursor-pointer"
            >
              <span>Келесі қабілет</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 min-h-[44px] rounded-xl bg-[#F4B942] text-[#243B64] text-sm font-bold hover:bg-[#E5A932] disabled:opacity-70 cursor-pointer"
            >
              <span>{isSubmitting ? 'AI талдау жасалуда...' : 'Нәтижені алу'}</span>
              {!isSubmitting && <ArrowRight className="w-4 h-4" aria-hidden="true" />}
            </button>
          )}
        </div>
      </motion.div>

      <div className="mt-5 flex items-center justify-between flex-wrap gap-3 text-xs text-[#546E7A]">
        <span className="inline-flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-[#4F8FEA]" aria-hidden="true" />
          Аты-жөні, телефон нөмірі немесе мекенжай сұралмайды.
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {ABILITIES.map((ability, idx) => {
            const qs = QUIZ_QUESTIONS.filter((q) => q.abilityId === ability.id);
            const done = qs.every((q) => typeof answers[q.id] === 'number');
            const isCurrent = idx === abilityIndex;
            return (
              <button
                key={ability.id}
                type="button"
                onClick={() => {
                  setValidationNotice(null);
                  setAbilityIndex(idx);
                }}
                aria-label={`${idx + 1}-қабілетке өту: ${ability.title}`}
                title={ability.title}
                className={`w-7 h-7 rounded-md font-mono text-xs tabular-nums transition-colors cursor-pointer ${
                  isCurrent
                    ? 'bg-[#243B64] text-[#F4B942] font-bold'
                    : done
                      ? 'bg-[#EEF4FC] text-[#243B64] border border-[#4F8FEA]/50'
                      : 'bg-white border border-[#DCE4EE] text-[#546E7A] hover:bg-[#F5F7FA]'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
