import { FormEvent, useState } from 'react';
import {
  Check,
  Clock,
  Pencil,
  Plus,
  Target,
  Trash2,
  X,
} from 'lucide-react';
import {
  computeGoalProgress,
  filterPersonalGoals,
} from '../utils/careerLogic';
import type { GoalFilter, GoalHorizon, PersonalGoal } from '../types/career';

interface PersonalPlanSectionProps {
  goals: PersonalGoal[];
  onAddGoal: (params: {
    title: string;
    horizon: GoalHorizon;
    timeframe?: string;
  }) => string | null;
  onToggleGoal: (goalId: string) => void;
  onUpdateGoal: (goalId: string, nextTitle: string) => void;
  onDeleteGoal: (goalId: string) => void;
}

export function PersonalPlanSection({
  goals,
  onAddGoal,
  onToggleGoal,
  onUpdateGoal,
  onDeleteGoal,
}: PersonalPlanSectionProps) {
  const [title, setTitle] = useState('');
  const [horizon, setHorizon] = useState<GoalHorizon>('short');
  const [timeframe, setTimeframe] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<GoalFilter>('all');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  const progress = computeGoalProgress(goals);
  const shortGoals = filterPersonalGoals(goals, 'short', statusFilter);
  const longGoals = filterPersonalGoals(goals, 'long', statusFilter);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const err = onAddGoal({ title, horizon, timeframe });
    if (err) {
      setFormError(err);
      return;
    }
    setFormError(null);
    setTitle('');
    setTimeframe('');
  };

  const handleStartEdit = (goal: PersonalGoal) => {
    setEditingId(goal.id);
    setEditingText(goal.title);
  };

  const handleSaveEdit = (goalId: string) => {
    const trimmed = editingText.trim();
    if (trimmed) {
      onUpdateGoal(goalId, trimmed);
    }
    setEditingId(null);
    setEditingText('');
  };

  const renderGoalList = (
    list: PersonalGoal[],
    emptyTitle: string,
    emptyHint: string
  ) => {
    if (list.length === 0) {
      return (
        <div className="p-5 rounded-xl bg-[#F5F7FA] border border-dashed border-[#CBD5E1] text-center">
          <p className="text-sm font-semibold text-[#243B64]">{emptyTitle}</p>
          <p className="text-xs text-[#546E7A] mt-1">{emptyHint}</p>
        </div>
      );
    }

    return (
      <ul className="space-y-2.5">
        {list.map((goal) => {
          const isEditing = editingId === goal.id;
          return (
            <li
              key={goal.id}
              className={`p-3.5 rounded-xl border transition-colors ${
                goal.completed
                  ? 'bg-[#F5F7FA] border-[#DCE4EE]'
                  : 'bg-white border-[#DCE4EE] hover:border-[#4F8FEA]/60'
              }`}
            >
              {isEditing ? (
                <div className="flex flex-wrap items-center gap-2">
                  <label htmlFor={`edit-${goal.id}`} className="sr-only">
                    Мақсатты өңдеу
                  </label>
                  <input
                    id={`edit-${goal.id}`}
                    type="text"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSaveEdit(goal.id);
                      } else if (e.key === 'Escape') {
                        setEditingId(null);
                      }
                    }}
                    className="flex-1 min-w-[180px] px-3 py-2 min-h-[40px] bg-white border border-[#4F8FEA] rounded-lg text-sm text-[#263238] focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveEdit(goal.id)}
                    aria-label="Сақтау"
                    className="inline-flex items-center justify-center px-3 py-2 min-h-[40px] rounded-lg bg-[#243B64] text-white text-xs font-semibold hover:bg-[#1C2F51] cursor-pointer"
                  >
                    Сақтау
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    aria-label="Болдырмау"
                    className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-[#DCE4EE] text-[#546E7A] hover:bg-[#F5F7FA] cursor-pointer"
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={goal.completed}
                      aria-label={
                        goal.completed
                          ? `«${goal.title}» мақсатын орындалмады деп белгілеу`
                          : `«${goal.title}» мақсатын орындалды деп белгілеу`
                      }
                      onClick={() => onToggleGoal(goal.id)}
                      className={`mt-0.5 w-6 h-6 rounded-md border flex items-center justify-center shrink-0 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#4F8FEA] ${
                        goal.completed
                          ? 'bg-[#4F8FEA] border-[#4F8FEA] text-white'
                          : 'bg-white border-[#CBD5E1] hover:border-[#243B64]'
                      }`}
                    >
                      {goal.completed && <Check className="w-3.5 h-3.5" aria-hidden="true" />}
                    </button>

                    <div className="min-w-0">
                      <p
                        className={`text-sm leading-snug ${
                          goal.completed
                            ? 'line-through text-[#546E7A]'
                            : 'font-medium text-[#263238]'
                        }`}
                      >
                        {goal.title}
                      </p>
                      {goal.timeframe && (
                        <p className="font-mono text-xs text-[#546E7A] mt-1">
                          Мерзімі: {goal.timeframe}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(goal)}
                      aria-label={`«${goal.title}» мақсатын өңдеу`}
                      className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-[#546E7A] hover:text-[#243B64] hover:bg-[#EEF4FC] cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteGoal(goal.id)}
                      aria-label={`«${goal.title}» мақсатын өшіру`}
                      className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-[#546E7A] hover:text-red-700 hover:bg-red-50 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <section
      aria-labelledby="section-personal-plan"
      className="bg-white border border-[#DCE4EE] rounded-2xl p-6 sm:p-8 space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="min-w-0 flex-1 max-w-2xl">
          <p className="font-mono text-xs font-bold text-[#4F8FEA]">07</p>
          <h2 id="section-personal-plan" className="text-xl sm:text-2xl font-bold text-[#243B64] mt-0.5">
            Жеке жоспар
          </h2>
          <p className="text-sm text-[#546E7A] mt-1 leading-relaxed">
            Қысқа мерзімді (1–4 апта) және ұзақ мерзімді (6–12 ай) мақсаттарыңды жазып, орындалуын
            бақыла. Жоспар осы браузерде сақталады.
          </p>
        </div>

        <div className="sm:text-right shrink-0">
          <p className="font-mono text-sm font-bold text-[#243B64] tabular-nums">
            Орындалғаны: {progress.completed} / {progress.total} · {progress.percentage}%
          </p>
          {progress.total > 0 && (
            <div
              className="w-40 h-2 bg-[#EDF2F7] rounded-full overflow-hidden mt-1.5 sm:ml-auto"
              role="progressbar"
              aria-valuenow={progress.percentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Жеке жоспар орындалуы"
            >
              <div
                className="h-full bg-[#4F8FEA] rounded-full transition-all duration-200"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          )}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-4 sm:p-5 rounded-xl bg-[#F5F7FA] border border-[#DCE4EE] space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
          <span className="text-xs font-semibold text-[#243B64]">Мақсат түрі:</span>
          <div
            role="group"
            aria-label="Мақсат мерзімін таңдау"
            className="grid grid-cols-2 sm:inline-flex items-center gap-1 p-1 bg-white border border-[#DCE4EE] rounded-lg w-full sm:w-auto"
          >
            <button
              type="button"
              onClick={() => setHorizon('short')}
              aria-pressed={horizon === 'short'}
              className={`px-2.5 sm:px-3 py-2 min-h-[38px] rounded-md text-xs font-semibold text-center leading-tight transition-colors sm:whitespace-nowrap cursor-pointer ${
                horizon === 'short'
                  ? 'bg-[#4F8FEA] text-white'
                  : 'text-[#263238] hover:bg-[#F5F7FA]'
              }`}
            >
              Қысқа мерзімді (1–4 апта)
            </button>
            <button
              type="button"
              onClick={() => setHorizon('long')}
              aria-pressed={horizon === 'long'}
              className={`px-2.5 sm:px-3 py-2 min-h-[38px] rounded-md text-xs font-semibold text-center leading-tight transition-colors sm:whitespace-nowrap cursor-pointer ${
                horizon === 'long'
                  ? 'bg-[#243B64] text-white'
                  : 'text-[#263238] hover:bg-[#F5F7FA]'
              }`}
            >
              Ұзақ мерзімді (6–12 ай)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6">
            <label htmlFor="goal-title-input" className="block text-xs font-medium text-[#546E7A] mb-1">
              Жаңа мақсат
            </label>
            <input
              id="goal-title-input"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (formError) setFormError(null);
              }}
              placeholder={
                horizon === 'short'
                  ? 'Мысалы: Аптасына 3 рет информатикадан есеп шығару'
                  : 'Мысалы: 11-сыныпқа дейін B057 бағытына портфолио жинау'
              }
              className="w-full px-3.5 py-2.5 min-h-[44px] bg-white border border-[#CBD5E1] rounded-xl text-sm text-[#263238] placeholder:text-[#78909C] focus:outline-none focus:border-[#4F8FEA]"
            />
          </div>

          <div className="md:col-span-3">
            <label htmlFor="goal-timeframe-input" className="block text-xs font-medium text-[#546E7A] mb-1">
              Мерзімі (міндетті емес)
            </label>
            <input
              id="goal-timeframe-input"
              type="text"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              placeholder={horizon === 'short' ? 'Осы айда' : 'Оқу жылы соңы'}
              className="w-full px-3.5 py-2.5 min-h-[44px] bg-white border border-[#CBD5E1] rounded-xl text-sm text-[#263238] placeholder:text-[#78909C] focus:outline-none focus:border-[#4F8FEA]"
            />
          </div>

          <div className="md:col-span-3 flex items-end">
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl bg-[#F4B942] text-[#243B64] text-sm font-bold hover:bg-[#E5A932] whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Мақсат қосу</span>
            </button>
          </div>
        </div>

        {formError && (
          <p role="alert" className="text-xs font-medium text-red-700">
            {formError}
          </p>
        )}
      </form>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          role="group"
          aria-label="Мақсат күйі бойынша сүзгі"
          className="inline-flex items-center gap-1 p-1 bg-[#F5F7FA] border border-[#DCE4EE] rounded-lg"
        >
          {(
            [
              { id: 'all', label: 'Барлығы' },
              { id: 'active', label: 'Белсенді' },
              { id: 'completed', label: 'Орындалды' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              aria-pressed={statusFilter === tab.id}
              className={`px-3 py-1.5 min-h-[34px] rounded-md text-xs font-medium transition-colors cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-white text-[#243B64] shadow-sm font-bold'
                  : 'text-[#546E7A] hover:text-[#243B64]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#EDF2F7]">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#4F8FEA]" aria-hidden="true" />
              <h3 className="text-base font-bold text-[#243B64]">Қысқа мерзімді мақсаттар</h3>
            </div>
            <span className="font-mono text-xs text-[#546E7A] tabular-nums">
              {progress.shortCompleted}/{progress.shortTotal}
            </span>
          </div>

          {renderGoalList(
            shortGoals,
            'Қысқа мерзімді мақсаттар жоқ',
            'Жоғарыдағы өрістен қосыңыз немесе «Келесі қадам» әрекеттерін тікелей қосып көріңіз.'
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#EDF2F7]">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-[#F4B942]" aria-hidden="true" />
              <h3 className="text-base font-bold text-[#243B64]">Ұзақ мерзімді мақсаттар</h3>
            </div>
            <span className="font-mono text-xs text-[#546E7A] tabular-nums">
              {progress.longCompleted}/{progress.longTotal}
            </span>
          </div>

          {renderGoalList(
            longGoals,
            'Ұзақ мерзімді мақсаттар жоқ',
            'Мысалы: таңдаған бейіндік пәндерден олимпиадаға дайындалу немесе жоба қорғау.'
          )}
        </div>
      </div>
    </section>
  );
}
