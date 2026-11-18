import { X } from 'lucide-react';
import { EDU_PROGRAMS } from '../data/eduPrograms';
import type { EducationProgramItem } from '../types/career';

interface CompareSectionProps {
  compareIds: string[];
  onSetCompareIds: (ids: string[]) => void;
  onGoToCatalog: () => void;
}

export function CompareSection({
  compareIds,
  onSetCompareIds,
  onGoToCatalog,
}: CompareSectionProps) {
  const selectedPrograms: EducationProgramItem[] = compareIds
    .map((code) => EDU_PROGRAMS.find((p) => p.code === code))
    .filter((p): p is EducationProgramItem => Boolean(p));

  const availableToAdd = EDU_PROGRAMS.filter((p) => !compareIds.includes(p.code));

  const handleAddSelect = (code: string) => {
    if (!code || compareIds.includes(code) || compareIds.length >= 3) {
      return;
    }
    onSetCompareIds([...compareIds, code]);
  };

  const handleRemove = (code: string) => {
    onSetCompareIds(compareIds.filter((item) => item !== code));
  };

  const handleQuickPreset = (codes: string[]) => {
    onSetCompareIds(codes);
  };

  return (
    <section aria-labelledby="compare-heading" className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#4F8FEA]">Мамандықтарды салыстыру</p>
          <h1 id="compare-heading" className="text-2xl sm:text-3xl font-extrabold text-[#243B64] mt-1">
            Бағыттар мен бейіндік пәндерді қатар салыстыр
          </h1>
          <p className="text-sm text-[#546E7A] mt-1.5 max-w-2xl">
            Жүктелген {EDU_PROGRAMS.length} ББТ тізбесінен 2 немесе 3 бағытты таңдап, ҰБТ бейіндік
            пәндерін, міндеттері мен дағдыларын қатар сарала.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {compareIds.length < 3 && (
            <div className="flex items-center gap-2">
              <label htmlFor="add-compare-select" className="sr-only">
                Салыстыруға мамандық қосу
              </label>
              <select
                id="add-compare-select"
                value=""
                onChange={(e) => handleAddSelect(e.target.value)}
                className="px-3.5 py-2.5 min-h-[44px] bg-white border border-[#CBD5E1] rounded-xl text-sm text-[#263238] focus:outline-none focus:border-[#4F8FEA] max-w-[280px]"
              >
                <option value="" disabled>
                  + Бағыт қосу ({compareIds.length}/3)
                </option>
                {Array.from(new Set(availableToAdd.map((p) => p.category))).map((cat) => (
                  <optgroup key={cat} label={cat}>
                    {availableToAdd
                      .filter((p) => p.category === cat)
                      .map((prog) => (
                        <option key={prog.code} value={prog.code}>
                          {prog.code} · {prog.title}
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
            </div>
          )}

          {compareIds.length > 0 && (
            <button
              type="button"
              onClick={() => onSetCompareIds([])}
              className="px-3.5 py-2.5 min-h-[44px] rounded-xl border border-[#DCE4EE] bg-white text-sm font-medium text-[#263238] hover:bg-[#F5F7FA] cursor-pointer"
            >
              Тазалау
            </button>
          )}
        </div>
      </div>

      {selectedPrograms.length === 0 ? (
        <div className="bg-white border border-[#DCE4EE] rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="max-w-xl">
            <h2 className="text-lg font-bold text-[#243B64]">
              Салыстыру үшін кемінде 2 мамандық (ББТ) таңда
            </h2>
            <p className="text-sm text-[#546E7A] mt-1.5 leading-relaxed">
              Жоғарыдағы тізімнен қоса аласың, каталогтан таңдай аласың немесе дайын салыстыру
              жұптарының бірін бірден ашып көр.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => handleQuickPreset(['B057', 'B058'])}
              className="px-4 py-2.5 min-h-[44px] rounded-xl bg-[#F5F7FA] border border-[#DCE4EE] text-sm font-semibold text-[#263238] hover:border-[#4F8FEA] hover:bg-[#EEF4FC] transition-colors cursor-pointer"
            >
              B057 АТ vs B058 Ақпараттық қауіпсіздік
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset(['BM086', 'B085'])}
              className="px-4 py-2.5 min-h-[44px] rounded-xl bg-[#F5F7FA] border border-[#DCE4EE] text-sm font-semibold text-[#263238] hover:border-[#4F8FEA] hover:bg-[#EEF4FC] transition-colors cursor-pointer"
            >
              BM086 Медицина vs B085 Фармация
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset(['B073', 'B074'])}
              className="px-4 py-2.5 min-h-[44px] rounded-xl bg-[#F5F7FA] border border-[#DCE4EE] text-sm font-semibold text-[#263238] hover:border-[#4F8FEA] hover:bg-[#EEF4FC] transition-colors cursor-pointer"
            >
              B073 Сәулет vs B074 Құрылыс
            </button>
            <button
              type="button"
              onClick={onGoToCatalog}
              className="px-5 py-2.5 min-h-[44px] rounded-xl bg-[#F4B942] text-[#243B64] text-sm font-bold hover:bg-[#E5A932] transition-colors cursor-pointer"
            >
              Каталогтан таңдау
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {selectedPrograms.length === 1 && (
            <div className="p-4 rounded-xl bg-[#EEF4FC] border border-[#4F8FEA]/35 text-sm text-[#243B64]">
              Салыстыру үшін жоғарыдан тағы 1 немесе 2 мамандық қосыңыз.
            </div>
          )}

          <div className="bg-white border border-[#DCE4EE] rounded-2xl overflow-x-auto">
            <table className="w-full min-w-[640px] text-left border-collapse">
              <thead>
                <tr className="border-b border-[#DCE4EE] bg-[#F5F7FA]">
                  <th className="p-4 sm:p-5 text-xs font-semibold text-[#546E7A] w-44 align-top">
                    Критерий
                  </th>
                  {selectedPrograms.map((prog) => (
                    <th key={prog.code} className="p-4 sm:p-5 align-top min-w-[220px]">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-mono text-xs font-bold text-[#4F8FEA] tabular-nums">
                            {prog.code} · {prog.category}
                          </p>
                          <p className="text-base font-bold text-[#243B64] mt-0.5">{prog.title}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemove(prog.code)}
                          aria-label={`${prog.title} бағытын салыстырудан өшіру`}
                          className="p-1.5 rounded-lg text-[#546E7A] hover:text-[#243B64] hover:bg-[#DCE4EE]/50 cursor-pointer"
                        >
                          <X className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDF2F7] text-sm">
                <tr>
                  <th scope="row" className="p-4 sm:p-5 font-semibold text-[#243B64] align-top">
                    Бейіндік пәндер (ҰБТ)
                  </th>
                  {selectedPrograms.map((prog) => (
                    <td key={prog.code} className="p-4 sm:p-5 font-bold text-[#243B64] align-top">
                      {prog.subject1 === prog.subject2
                        ? prog.subject1
                        : `${prog.subject1} · ${prog.subject2}`}
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row" className="p-4 sm:p-5 font-semibold text-[#243B64] align-top">
                    Қысқаша сипаттама
                  </th>
                  {selectedPrograms.map((prog) => (
                    <td key={prog.code} className="p-4 sm:p-5 text-[#263238] align-top leading-relaxed">
                      {prog.shortSummary}
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row" className="p-4 sm:p-5 font-semibold text-[#243B64] align-top">
                    Негізгі міндеттері
                  </th>
                  {selectedPrograms.map((prog) => (
                    <td key={prog.code} className="p-4 sm:p-5 text-[#263238] align-top">
                      <ul className="space-y-1.5">
                        {prog.duties.map((d) => (
                          <li key={d} className="flex items-start gap-2">
                            <span aria-hidden="true" className="text-[#4F8FEA]">
                              —
                            </span>
                            <span>{d}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row" className="p-4 sm:p-5 font-semibold text-[#243B64] align-top">
                    Қажетті дағдылар
                  </th>
                  {selectedPrograms.map((prog) => (
                    <td key={prog.code} className="p-4 sm:p-5 text-[#263238] align-top">
                      {prog.skills.join(' · ')}
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row" className="p-4 sm:p-5 font-semibold text-[#243B64] align-top">
                    Жұмыс істейтін салалар
                  </th>
                  {selectedPrograms.map((prog) => (
                    <td key={prog.code} className="p-4 sm:p-5 text-[#546E7A] align-top">
                      {prog.industries.join(' · ')}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
