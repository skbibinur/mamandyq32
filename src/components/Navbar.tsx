import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import type { AppSection } from '../types/career';

interface NavbarProps {
  activeSection: AppSection;
  onNavigate: (section: AppSection) => void;
  onStartTest: () => void;
  compareCount: number;
  hasResults: boolean;
}

export function Navbar({
  activeSection,
  onNavigate,
  onStartTest,
  compareCount,
  hasResults,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems: Array<{ id: AppSection; label: string }> = [
    { id: 'home', label: 'Басты бет' },
    { id: hasResults ? 'results' : 'quiz', label: hasResults ? 'Нәтиже' : 'Тест' },
    { id: 'catalog', label: 'Каталог' },
    {
      id: 'compare',
      label: compareCount > 0 ? `Салыстыру (${compareCount})` : 'Салыстыру',
    },
    { id: 'counselor', label: 'AI кеңесші' },
  ];

  const handleSelect = (section: AppSection) => {
    onNavigate(section);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-[#DCE4EE]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        <button
          type="button"
          onClick={() => handleSelect('home')}
          className="text-xl font-extrabold tracking-tight text-[#243B64] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#4F8FEA]"
        >
          Оңай көмек
        </button>

        <nav
          aria-label="Негізгі мәзір"
          className="hidden lg:flex items-center gap-7 text-sm font-medium"
        >
          {navItems.map((item) => {
            const isActive =
              activeSection === item.id ||
              (item.id === 'results' && activeSection === 'quiz');
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative py-2 whitespace-nowrap shrink-0 cursor-pointer transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#4F8FEA] ${
                  isActive
                    ? 'text-[#243B64] font-bold'
                    : 'text-[#546E7A] hover:text-[#243B64]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-[1px] h-[2.5px] bg-[#F4B942] rounded-full"
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              setMobileOpen(false);
              onStartTest();
            }}
            className="hidden sm:inline-flex items-center justify-center px-4 py-2.5 min-h-[40px] text-sm font-bold text-[#243B64] bg-[#F4B942] rounded-lg hover:bg-[#E5A932] active:bg-[#D89B25] transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#243B64]"
          >
            Тестті бастау
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Мәзірді жабу' : 'Мәзірді ашу'}
            className="lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg border border-[#DCE4EE] text-[#243B64] hover:bg-[#F5F7FA] cursor-pointer focus-visible:outline-2 focus-visible:outline-[#4F8FEA]"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          aria-label="Мобильді мәзір"
          className="lg:hidden border-t border-[#DCE4EE] bg-white px-4 py-3 space-y-1"
        >
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`w-full text-left px-3 py-3 min-h-[44px] rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#EEF4FC] text-[#243B64] font-bold'
                    : 'text-[#263238] hover:bg-[#F5F7FA]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
          <div className="pt-2 border-t border-[#EDF2F7]">
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                onStartTest();
              }}
              className="w-full py-3 px-4 min-h-[44px] text-sm font-bold text-[#243B64] bg-[#F4B942] rounded-lg hover:bg-[#E5A932] cursor-pointer"
            >
              Тестті бастау
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}
