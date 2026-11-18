import { useEffect, useState } from 'react';
import { Check, LayoutGrid, PlayCircle, Plus, Scale, Search, Table2 } from 'lucide-react';
import {
  EDU_PROGRAMS,
  EDU_PROGRAM_CATEGORIES,
  EDU_SUBJECT_PAIRS,
} from '../data/eduPrograms';
import { filterEduPrograms } from '../utils/careerLogic';
import { ProfessionPresentationModal } from './ProfessionPresentationModal';
import type { EduProgramCategory, EducationProgramItem } from '../types/career';

interface CatalogSectionProps {
  compareIds: string[];
  onToggleCompare: (programCode: string) => { limitReached: boolean };
  onOpenCompare: () => void;
  onAskAboutProgram?: (program: EducationProgramItem) => void;
}

type ViewMode = 'cards' | 'table';

const PAGE_SIZE = 18;

export function CatalogSection({
  compareIds,
  onToggleCompare,
  onOpenCompare,
  onAskAboutProgram,
}: CatalogSectionProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<EduProgramCategory>('Барлығы');
  const [activeSubjectPair, setActiveSubjectPair] = useState<string>('Барлығы');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [limitAlert, setLimitAlert] = useState(false);
  const [activePresentationProgram, setActivePresentationProgram] =
    useState<EducationProgramItem | null>(null);

  const filteredPrograms = filterEduPrograms(
    EDU_PROGRAMS,
    searchQuery,
    activeSubjectPair,
    activeCategory
  );
  const visiblePrograms = filteredPrograms.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPrograms.length;

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchQuery, activeCategory, activeSubjectPair, viewMode]);

  const handleToggle = (code: string) => {
    const res = onToggleCompare(code);
    setLimitAlert(res.limitReached);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setActiveCategory('Барлығы');
    setActiveSubjectPair('Барлығы');
  };

  return (
    <section aria-labelledby="catalog-heading" className="space-y-8">
      <div className="bg-white border border-[#DCE4EE] rounded-2xl p-6 sm:p-8 flex flex-col gap-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#4F8FEA]">
              Ресми білім беру бағдарламалары және мамандықтар
            </p>
            <h1 id="catalog-heading" className="text-2xl sm:text-3xl font-extrabold text-[#243B64] mt-1">
              {EDU_PROGRAMS.length} мамандық пен ББТ тізбесі
            </h1>
            <p className="text-sm text-[#546E7A] mt-1.5 max-w-2xl">
              Платформаға жүктелген 134 білім беру бағдарламалары тобының ресми коды, 1-ші және 2-ші
              бейіндік пәндері, негізгі міндеттері мен дағдылары.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {compareIds.length > 0 && (
              <button
                type="button"
                onClick={onOpenCompare}
                className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl bg-[#F4B942] text-[#243B64] text-sm font-bold hover:bg-[#E5A932] whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Scale className="w-4 h-4" aria-hidden="true" />
                <span className="tabular-nums">Салыстыруға өту ({compareIds.length}/3)</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div
            role="group"
            aria-label="Көрсету түрі"
            className="inline-flex items-center gap-1.5 p-1 bg-[#F5F7FA] border border-[#DCE4EE] rounded-xl"
          >
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              aria-pressed={viewMode === 'cards'}
              className={`inline-flex items-center gap-2 px-3.5 py-2 min-h-[38px] rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white text-[#243B64] shadow-sm'
                  : 'text-[#546E7A] hover:text-[#243B64]'
              }`}
            >
              <LayoutGrid className="w-4 h-4" aria-hidden="true" />
              <span>Карточкалар</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('table')}
              aria-pressed={viewMode === 'table'}
              className={`inline-flex items-center gap-2 px-3.5 py-2 min-h-[38px] rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-[#243B64] shadow-sm'
                  : 'text-[#546E7A] hover:text-[#243B64]'
              }`}
            >
              <Table2 className="w-4 h-4" aria-hidden="true" />
              <span>Ресми кесте</span>
            </button>
          </div>

          <p className="font-mono text-xs text-[#546E7A] tabular-nums">
            Көрсетілгені: {visiblePrograms.length} / {filteredPrograms.length} (барлығы{' '}
            {EDU_PROGRAMS.length})
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="relative md:col-span-7">
            <label htmlFor="catalog-search" className="sr-only">
              Код, мамандық атауы немесе бейіндік пән бойынша іздеу
            </label>
            <Search
              className="w-4 h-4 text-[#546E7A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="catalog-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Код (мысалы, B057), бағдарлама атауы немесе пән бойынша іздеу..."
              className="w-full pl-10 pr-4 py-2.5 min-h-[44px] bg-white border border-[#CBD5E1] rounded-xl text-sm text-[#263238] placeholder:text-[#546E7A]/70 focus:outline-none focus:border-[#4F8FEA]"
            />
          </div>

          <div className="md:col-span-5">
            <label htmlFor="subject-pair-select" className="sr-only">
              Бейіндік пән жұбы бойынша сүзгі
            </label>
            <select
              id="subject-pair-select"
              value={activeSubjectPair}
              onChange={(e) => setActiveSubjectPair(e.target.value)}
              className="w-full px-3.5 py-2.5 min-h-[44px] bg-white border border-[#CBD5E1] rounded-xl text-sm text-[#263238] focus:outline-none focus:border-[#4F8FEA]"
            >
              {EDU_SUBJECT_PAIRS.map((pair) => (
                <option key={pair} value={pair}>
                  {pair === 'Барлығы' ? 'Бейіндік пән жұбы: Барлығы' : pair}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Салалар сүзгісі">
          {EDU_PROGRAM_CATEGORIES.map((category) => {
            const isSelected = activeCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                aria-pressed={isSelected}
                className={`px-3.5 py-2 min-h-[38px] rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-[#243B64] text-white'
                    : 'bg-white text-[#263238] border border-[#DCE4EE] hover:border-[#4F8FEA] hover:bg-[#F5F7FA]'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {limitAlert && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-[#FFF9EB] border border-[#F4B942]/60 text-sm text-[#263238] flex flex-wrap items-center justify-between gap-3"
        >
          <span>Бір уақытта ең көбі 3 мамандықты салыстыруға болады.</span>
          <button
            type="button"
            onClick={onOpenCompare}
            className="font-bold text-[#243B64] underline cursor-pointer"
          >
            Салыстыру кестесін ашу
          </button>
        </div>
      )}

      {filteredPrograms.length === 0 ? (
        <div className="bg-white border border-[#DCE4EE] rounded-2xl p-8 text-center">
          <p className="text-base font-semibold text-[#243B64]">
            Сұрау бойынша мамандық немесе ББТ табылмады
          </p>
          <p className="text-sm text-[#546E7A] mt-1">
            Іздеу сөзін өзгертіп немесе сүзгілерді тазалап көр.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-4 px-4 py-2 min-h-[40px] rounded-lg border border-[#CBD5E1] text-sm font-medium text-[#263238] hover:bg-[#F5F7FA] cursor-pointer"
          >
            Сүзгіні тазалау
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {visiblePrograms.map((item) => {
              const isInCompare = compareIds.includes(item.code);
              const subjectsDisplay =
                item.subject1 === item.subject2
                  ? item.subject1
                  : `${item.subject1} · ${item.subject2}`;
              return (
                <article
                  key={item.code}
                  className="bg-white border border-[#DCE4EE] hover:border-[#4F8FEA]/60 transition-colors rounded-2xl p-6 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-mono text-xs font-bold text-[#4F8FEA] tabular-nums">
                          {item.code} · {item.category}
                        </p>
                        <h2 className="text-xl font-bold text-[#243B64] mt-1">{item.title}</h2>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggle(item.code)}
                        aria-pressed={isInCompare}
                        aria-label={
                          isInCompare
                            ? `${item.title} салыстырудан алып тастау`
                            : `${item.title} салыстыруға қосу`
                        }
                        className={`inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          isInCompare
                            ? 'bg-[#FFF9EB] text-[#243B64] border border-[#F4B942]'
                            : 'bg-[#F5F7FA] text-[#263238] border border-[#DCE4EE] hover:bg-[#EEF4FC] hover:text-[#243B64]'
                        }`}
                      >
                        {isInCompare ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#243B64]" aria-hidden="true" />
                            <span>Таңдалды</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Салыстыру</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-sm text-[#546E7A] leading-relaxed">{item.shortSummary}</p>

                    <div className="pt-3 border-t border-[#EDF2F7] space-y-3 text-sm">
                      <div>
                        <h3 className="text-xs font-semibold text-[#546E7A]">Бейіндік пәндер (ҰБТ)</h3>
                        <p className="mt-1 font-semibold text-[#243B64]">{subjectsDisplay}</p>
                      </div>

                      <div>
                        <h3 className="text-xs font-semibold text-[#546E7A]">Негізгі міндеттері</h3>
                        <ul className="mt-1.5 space-y-1 text-[#263238]">
                          {item.duties.map((duty) => (
                            <li key={duty} className="flex items-start gap-2">
                              <span aria-hidden="true" className="text-[#4F8FEA]">
                                —
                              </span>
                              <span>{duty}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-xs font-semibold text-[#546E7A]">Қажетті дағдылар</h3>
                        <p className="mt-1 text-[#263238]">{item.skills.join(' · ')}</p>
                      </div>

                      <div>
                        <h3 className="text-xs font-semibold text-[#546E7A]">Жұмыс істейтін салалар</h3>
                        <p className="mt-1 text-[#546E7A]">{item.industries.join(' · ')}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-5 border-t border-[#EDF2F7] flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setActivePresentationProgram(item)}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl bg-[#EEF4FC] border border-[#4F8FEA]/35 text-[#243B64] text-xs sm:text-sm font-semibold hover:bg-[#4F8FEA] hover:text-white transition-colors cursor-pointer"
                    >
                      <PlayCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>AI презентация және аудио-сипаттама</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      ) : (
        <>
          <div className="hidden md:block bg-white border border-[#DCE4EE] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F5F7FA] border-b border-[#DCE4EE] text-xs font-semibold text-[#546E7A]">
                    <th className="py-3.5 px-5 w-24">Коды</th>
                    <th className="py-3.5 px-5">Білім беру бағдарламалары тобы</th>
                    <th className="py-3.5 px-5 w-48">1-бейіндік пән</th>
                    <th className="py-3.5 px-5 w-48">2-бейіндік пән</th>
                    <th className="py-3.5 px-5 w-56 text-right">Әрекеттер</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDF2F7] text-sm">
                  {visiblePrograms.map((prog) => {
                    const isInCompare = compareIds.includes(prog.code);
                    return (
                      <tr key={prog.code} className="hover:bg-[#F5F7FA]/80 transition-colors">
                        <td className="py-3.5 px-5 font-mono text-xs font-bold text-[#4F8FEA] tabular-nums">
                          {prog.code}
                        </td>
                        <td className="py-3.5 px-5">
                          <p className="font-semibold text-[#243B64]">{prog.title}</p>
                          <p className="text-xs text-[#546E7A] mt-0.5">{prog.category}</p>
                        </td>
                        <td className="py-3.5 px-5 text-[#263238]">{prog.subject1}</td>
                        <td className="py-3.5 px-5 text-[#243B64] font-semibold">{prog.subject2}</td>
                        <td className="py-3.5 px-5 text-right">
                          <div className="inline-flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setActivePresentationProgram(prog)}
                              aria-label={`${prog.title} AI презентациясы мен аудиосын ашу`}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 min-h-[34px] rounded-lg bg-[#EEF4FC] border border-[#4F8FEA]/35 text-[#243B64] text-xs font-semibold hover:bg-[#4F8FEA] hover:text-white transition-colors cursor-pointer"
                            >
                              <PlayCircle className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>AI аудио</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggle(prog.code)}
                              aria-pressed={isInCompare}
                              className={`inline-flex items-center gap-1 px-2.5 py-1.5 min-h-[34px] rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                                isInCompare
                                  ? 'bg-[#FFF9EB] text-[#243B64] border border-[#F4B942]'
                                  : 'bg-[#F5F7FA] text-[#263238] border border-[#DCE4EE] hover:bg-[#EEF4FC] hover:text-[#243B64]'
                              }`}
                            >
                              {isInCompare ? (
                                <>
                                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                                  <span>Таңдалды</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                                  <span>Қосу</span>
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="md:hidden space-y-3">
            {visiblePrograms.map((prog) => {
              const isInCompare = compareIds.includes(prog.code);
              return (
                <article
                  key={prog.code}
                  className="bg-white border border-[#DCE4EE] rounded-xl p-4 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-xs font-bold text-[#4F8FEA] tabular-nums">
                        {prog.code} · {prog.category}
                      </p>
                      <h2 className="text-base font-bold text-[#243B64] mt-0.5">{prog.title}</h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggle(prog.code)}
                      aria-pressed={isInCompare}
                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 min-h-[38px] rounded-lg text-xs font-semibold shrink-0 cursor-pointer ${
                        isInCompare
                          ? 'bg-[#FFF9EB] text-[#243B64] border border-[#F4B942]'
                          : 'bg-[#F5F7FA] text-[#263238] border border-[#DCE4EE] hover:bg-[#EEF4FC]'
                      }`}
                    >
                      {isInCompare ? 'Таңдалды' : '+ Салыстыру'}
                    </button>
                  </div>
                  <div className="pt-2 border-t border-[#EDF2F7] text-xs text-[#263238] space-y-1">
                    <p>
                      <span className="text-[#546E7A]">1-бейіндік пән:</span>{' '}
                      <span className="font-medium text-[#263238]">{prog.subject1}</span>
                    </p>
                    <p>
                      <span className="text-[#546E7A]">2-бейіндік пән:</span>{' '}
                      <span className="font-semibold text-[#243B64]">{prog.subject2}</span>
                    </p>
                  </div>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setActivePresentationProgram(prog)}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 min-h-[42px] rounded-lg bg-[#EEF4FC] border border-[#4F8FEA]/35 text-[#243B64] text-xs font-semibold hover:bg-[#4F8FEA] hover:text-white transition-colors cursor-pointer"
                    >
                      <PlayCircle className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>AI презентация & аудио</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}

      {hasMore && filteredPrograms.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
            className="px-6 py-3 min-h-[44px] rounded-xl bg-white border border-[#CBD5E1] text-sm font-semibold text-[#263238] hover:border-[#243B64] hover:bg-[#F5F7FA] cursor-pointer"
          >
            Тағы {Math.min(PAGE_SIZE, filteredPrograms.length - visibleCount)} бағыт көрсету
          </button>
          <button
            type="button"
            onClick={() => setVisibleCount(filteredPrograms.length)}
            className="px-5 py-3 min-h-[44px] rounded-xl text-sm font-semibold text-[#243B64] hover:bg-[#EEF4FC] cursor-pointer"
          >
            Барлығын көрсету ({filteredPrograms.length})
          </button>
        </div>
      )}

      <ProfessionPresentationModal
        program={activePresentationProgram}
        isInCompare={
          activePresentationProgram
            ? compareIds.includes(activePresentationProgram.code)
            : false
        }
        onToggleCompare={handleToggle}
        onAskCounselor={onAskAboutProgram}
        onClose={() => setActivePresentationProgram(null)}
      />
    </section>
  );
}
